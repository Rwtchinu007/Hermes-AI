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
// GEMINI MODEL
// ==================================================

const geminiModel = new ChatGoogleGenerativeAI({
  model: "gemini-3.5-flash-lite",
  apiKey: process.env.GEMINI_API_KEY,

  // Tag this model so we can identify
  // its response tokens during streaming
  tags: ["hermes-response"],
});

// ==================================================
// MISTRAL MODEL
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
// GEMINI AGENT
// ==================================================

const agent = createAgent({
  model: geminiModel,
  tools: [searchInternetTool],
});

// ==================================================
// STREAMING AI RESPONSE
// ==================================================

export async function* generateResponse(messages) {
  // console.log(messages);

  const stream = await agent.stream(
    {
      messages: [
        // ==========================================
        // SYSTEM PROMPT
        // ==========================================

        new SystemMessage(`
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
`),

        // ==========================================
        // CONVERSATION HISTORY
        // ==========================================

        ...messages
          .map((msg) => {
            if (msg.role === "user") {
              return new HumanMessage(msg.content);
            }

            if (msg.role === "ai") {
              return new AIMessage(msg.content);
            }

            return null;
          })
          .filter(Boolean),
      ],
    },
    {
      streamMode: "messages",
    },
  );

  // ==================================================
  // STREAM ONLY THE ACTUAL AI RESPONSE
  // ==================================================

  for await (const [token, metadata] of stream) {
    // Ignore anything that isn't an AI message chunk
    if (!isAIMessageChunk(token)) {
      continue;
    }

    // Only accept tokens from our Gemini response model
    if (!metadata?.tags?.includes("hermes-response")) {
      continue;
    }

    // Gemini normally returns text content as a string
    if (typeof token.content === "string") {
      yield token.content;
    }
  }
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
