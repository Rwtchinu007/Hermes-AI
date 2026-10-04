import { tavily as Tavily } from "@tavily/core";

const tavily = new Tavily({
  apiKey: process.env.TAVILY_API_KEY,
});

export const searchInternet = async ({ query }) => {
  try {
    const results = await tavily.search(query, {
      maxResults: 5,
      searchDepth: "advanced",
    });

    console.log("Tavily results:", results);

    const usefulResults = results.results.map((result) => ({
      title: result.title,
      url: result.url,
      content: result.content,
    }));

    return JSON.stringify(usefulResults);
  } catch (error) {
    console.error("Internet search error:", error);

    return JSON.stringify({
      error: "Unable to search the internet.",
    });
  }
};
