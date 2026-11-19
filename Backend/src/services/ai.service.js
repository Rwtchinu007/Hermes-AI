import dotenv from "dotenv";

dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";

import {
  HumanMessage,
  SystemMessage,
  AIMessage,
  tool,
  createAgent,
} from "langchain";

import { isAIMessageChunk } from "@langchain/core/messages";

import { ChatMistralAI } from "@langchain/mistralai";

import * as z from "zod";

import { searchInternet } from "./internet.service.js";

// ==================================================
// GEMINI MODELS (tried in order until one works)
// ==================================================

// Override with GEMINI_MODELS="model-a,model-b,model-c" in .env
const GEMINI_MODELS = (
  process.env.GEMINI_MODELS ||
  "gemini-3.5-flash-lite,gemini-3.1-flash-lite,gemini-3.5-flash,gemini-flash-lite-latest"
)
  .split(",")
  .map((name) => name.trim())
  .filter(Boolean);

// ==================================================
// MISTRAL MODEL (chat titles)
// ==================================================

const mistralModel = new ChatMistralAI({
  model: "mistral-tiny-latest",
  apiKey: process.env.MISTRAL_API_KEY,
});

// ==================================================
// INTERNET SEARCH TOOL
// ==================================================

const searchInternetTool = tool(searchInternet, {
  name: "searchInternet",

  description: "Use this tool to get the latest information from the internet.",

  schema: z.object({
    query: z.string().describe("The search query to look up on the internet."),
  }),
});

// ==================================================
// AGENTS (one per Gemini model, created on first use)
// ==================================================

const agents = new Map();

function getAgent(modelName) {
  if (!agents.has(modelName)) {
    const model = new ChatGoogleGenerativeAI({
      model: modelName,
      apiKey: process.env.GEMINI_API_KEY,
      // Fail over quickly instead of retrying the same overloaded model
      maxRetries: 1,
      // Tag this model so we can identify its response tokens while streaming
      tags: ["hermes-response"],
    });

    agents.set(
      modelName,
      createAgent({ model, tools: [searchInternetTool] }),
    );
  }

  return agents.get(modelName);
}

// ==================================================
// SYSTEM PROMPT
// ==================================================

const buildSystemPrompt = () => `
You are Hermes.ai, a helpful AI assistant.

Answer the user's question clearly, accurately, and naturally.

If you do not know the answer, say that you do not know.

If the question requires current, recent, or real-time
information, use the "searchInternet" tool.

IMPORTANT SEARCH RULES:

- Never show the raw output of the searchInternet tool to the user.
- Never show JSON returned by the tool.
- Never show internal tool metadata.
- Never show search-result objects directly.
- Never expose scores, request IDs, response times, or internal fields.
- Read and understand the search results before answering.
- Extract the relevant facts from the search results.
- Use those facts to write your own answer.
- Do not simply copy and paste search results.
- Do not mention the search tool unless the user asks how you work.

ANSWER STYLE:

- Be clear and concise.
- Answer the user's actual question first.
- Do not add unnecessary information.
- Keep paragraphs short.
- Use Markdown when it improves readability.
- Use headings for longer answers.
- Use bullet points for lists.
- Use numbered lists for steps.
- Use **bold** for important terms.
- Use \`inline code\` for technical terms and short code.
- Use fenced code blocks for programming code.
- Do not wrap the entire response in a code block.

For example:

## Main Topic

Brief explanation.

### Key Points

- Point one
- Point two
- Point three

For programming code:

\`\`\`javascript
const example = "Hello";
console.log(example);
\`\`\`

For web-search questions:

- Give the answer based on the retrieved information.
- Mention important dates when relevant.
- Include useful source links when appropriate.
- Clearly distinguish facts from uncertainty.
- Do not expose raw search results.

Keep every response clean, readable, and useful.

SEARCH RELIABILITY:

- Today is ${new Date().toDateString()}. Use this when searching for recent information.
- After using the search tool, ALWAYS finish with a complete written answer.
- If the search fails or returns nothing useful, say you could not reach live
  sources, then answer from your own knowledge and state that it may be out of date.
`;

// ==================================================
// HELPERS
// ==================================================

const CONTINUE_PROMPT =
  "Your previous reply was cut off. Continue from exactly where it stopped. " +
  "Do not repeat anything you already wrote and do not add an introduction.";

// Gemini can return content as a string or as an array of parts
function extractText(content) {
  if (typeof content === "string") return content;
  if (!Array.isArray(content)) return "";

  return content
    .map((part) => {
      if (typeof part === "string") return part;
      if (part?.type === "text" && typeof part.text === "string") return part.text;
      return "";
    })
    .join("");
}

// ==================================================
// STREAM ONE MODEL
// ==================================================

// A model that stops responding is abandoned so the next one can take over.
const IDLE_TIMEOUT_MS = 25000; // waiting for the first / next token
const SEARCH_IDLE_TIMEOUT_MS = 60000; // allows time for the web search itself

async function* streamWithModel(modelName, messages, { signal, onStatus }) {
  // Own controller so a stalled model can be cancelled without cancelling
  // the user's request (the user's stop button still aborts everything).
  const attempt = new AbortController();
  const forwardAbort = () => attempt.abort();
  signal?.addEventListener("abort", forwardAbort, { once: true });

  let timedOut = false;
  let timer;
  const arm = (ms) => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      timedOut = true;
      attempt.abort();
    }, ms);
  };

  try {
    arm(IDLE_TIMEOUT_MS);

    // "messages" streams the answer tokens; "updates" tells us when the
    // model decided to call the search tool (before the tool runs).
    const stream = await getAgent(modelName).stream(
      { messages },
      { streamMode: ["messages", "updates"], signal: attempt.signal },
    );

    let reportedSearch = false;

    for await (const [mode, data] of stream) {
      if (signal?.aborted) return;

      arm(reportedSearch ? SEARCH_IDLE_TIMEOUT_MS : IDLE_TIMEOUT_MS);

      if (mode === "updates") {
        const calledTool = Object.values(data ?? {}).some((update) =>
          update?.messages?.some?.((message) => message?.tool_calls?.length),
        );
        if (calledTool && !reportedSearch) {
          reportedSearch = true;
          arm(SEARCH_IDLE_TIMEOUT_MS);
          onStatus?.("searching");
        }
        continue;
      }

      const [token, metadata] = data;

      // Ignore anything that is not an AI message chunk
      if (!isAIMessageChunk(token)) continue;

      // Only accept tokens from our Gemini response model
      if (!metadata?.tags?.includes("hermes-response")) continue;

      const text = extractText(token.content);
      if (text) yield text;
    }
  } catch (error) {
    if (timedOut) {
      throw new Error(`${modelName} stopped responding (timed out)`);
    }
    throw error;
  } finally {
    clearTimeout(timer);
    signal?.removeEventListener("abort", forwardAbort);
  }
}

// ==================================================
// STREAMING AI RESPONSE (with model fallback)
// ==================================================

/**
 * @param {Array} messages conversation history (Message documents)
 * @param {Object} [options]
 * @param {AbortSignal} [options.signal] cancels generation when aborted
 * @param {(status: string) => void} [options.onStatus] called with
 *   "searching" when the model starts a web search tool call
 *
 * If a model fails (overloaded, rate limited, empty answer, cut off mid-way)
 * the next model in GEMINI_MODELS takes over. When some text was already
 * streamed, the next model is asked to continue from that point.
 */
export async function* generateResponse(messages, { signal, onStatus } = {}) {
  const history = messages
    .map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (msg.role === "ai") return new AIMessage(msg.content);
      return null;
    })
    .filter(Boolean);

  const system = new SystemMessage(buildSystemPrompt());

  let produced = "";
  let lastError = null;

  for (const modelName of GEMINI_MODELS) {
    if (signal?.aborted) return;

    const input = [
      system,
      ...history,
      ...(produced
        ? [new AIMessage(produced), new HumanMessage(CONTINUE_PROMPT)]
        : []),
    ];

    try {
      let producedByThisModel = false;

      for await (const text of streamWithModel(modelName, input, {
        signal,
        onStatus,
      })) {
        producedByThisModel = true;
        produced += text;
        yield text;
      }

      if (signal?.aborted) return;
      if (producedByThisModel || produced) return; // finished normally

      // Model finished without writing anything: try the next one
      lastError = new Error(`${modelName} returned an empty response`);
      console.warn(lastError.message);
    } catch (error) {
      if (signal?.aborted) return;

      lastError = error;
      console.warn(
        `Gemini model "${modelName}" failed, trying next model:`,
        error?.message || error,
      );
    }
  }

  throw lastError || new Error("No Gemini model is configured");
}


// ==================================================
// CHAT TITLE GENERATION
// ==================================================

export async function generateChatTitle(message) {
  const response = await mistralModel.invoke([
    new SystemMessage(`
You generate short, natural titles for AI conversations.

Create a clear title that summarizes the user's main topic or intent.

Rules:

- Return ONLY the title.
- No explanations or extra text.
- No Markdown.
- Never use **, *, _, #, emojis, or special formatting.
- Use normal title capitalization.
- Keep it between 2 and 6 words.
- Make it specific and natural.
- Focus on the main topic or intent.
- Do not copy the entire user's question.
- Do not start with "Question:", "Help:", "User asks:", or similar prefixes.
- Avoid generic words like "Discussion", "Conversation", or "Exploring".

Examples:

User: "how do I center a div using flexbox?"
Title: Center a Div with Flexbox

User: "explain useEffect in React"
Title: React useEffect Explained

User: "why am I getting a 503 error from Gemini?"
Title: Gemini 503 Error

User: "help me prepare for React interviews"
Title: React Interview Preparation

User: "what is the difference between TCP and UDP?"
Title: TCP vs UDP

User: "I want to build a RAG chatbot using Pinecone"
Title: RAG Chatbot with Pinecone

Output ONLY the title.
`),

    new HumanMessage(`Create a title for this user's message:\n"${message}"`),
  ]);

  return response.text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/^["']|["']$/g, "")
    .trim();
}
