import "dotenv/config";
import { tavily as Tavily } from "@tavily/core";

// Created on first use, so the API key is always read after .env is loaded.
// (Creating it at import time sent no key and hit Tavily's keyless daily limit.)
let tavily;
function getClient() {
  if (!process.env.TAVILY_API_KEY) {
    throw new Error("TAVILY_API_KEY is not set");
  }
  tavily ??= new Tavily({ apiKey: process.env.TAVILY_API_KEY });
  return tavily;
}

const SEARCH_TIMEOUT_MS = 20000;
const MAX_CONTENT_CHARS = 1200;

// Reject if a search takes too long so the AI never hangs waiting for it
const withTimeout = (promise, ms) =>
  Promise.race([
    promise,
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error(`Search timed out after ${ms}ms`)), ms),
    ),
  ]);

async function runSearch(query, searchDepth) {
  return withTimeout(
    getClient().search(query, { maxResults: 5, searchDepth }),
    SEARCH_TIMEOUT_MS,
  );
}

export const searchInternet = async ({ query }) => {
  let results;

  try {
    // Deeper search first; if it fails or times out, retry with a quick one
    try {
      results = await runSearch(query, "advanced");
    } catch (error) {
      console.warn("Advanced search failed, retrying basic:", error?.message);
      results = await runSearch(query, "basic");
    }

    const usefulResults = (results?.results ?? []).map((result) => ({
      title: result.title,
      url: result.url,
      content: (result.content ?? "").slice(0, MAX_CONTENT_CHARS),
    }));

    if (usefulResults.length === 0) {
      return JSON.stringify({ error: "No search results were found." });
    }

    return JSON.stringify(usefulResults);
  } catch (error) {
    console.error("Internet search error:", error?.message || error);

    return JSON.stringify({
      error: "Unable to search the internet.",
    });
  }
};
