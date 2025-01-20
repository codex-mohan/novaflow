import { z } from "zod";
import { tool } from "@langchain/core/tools";
import { QdrantVectorStore } from "@langchain/qdrant";
import { OllamaEmbeddings } from "@langchain/ollama";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";

const retrieveSchema = z.object({
  query: z.string(),
});

const storeSchema = z.object({
  content: z.string(),
});

const embedder = new OllamaEmbeddings({
  model: "mxbai-embed-large", // Default value
  baseUrl: "http://localhost:11434", // Default value
});

const vectorStore = await QdrantVectorStore.fromExistingCollection(embedder, {
  url: "http://localhost:6333",
  collectionName: "main",
});

export const retreive = tool(
  async ({ query }) => {
    const retrievedDocs = await vectorStore.similaritySearch(query, 2);
    const serialized = retrievedDocs
      .map(
        (doc) => `Source: ${doc.metadata.source}\nContent: ${doc.pageContent}`
      )
      .join("\n");
    return [serialized, retrievedDocs];
  },
  {
    name: "retrieve",
    description: "Retrieve information related to a query.",
    schema: retrieveSchema,
    responseFormat: "content_and_artifact",
  }
);

const store = tool(
  async ({ content }) => {
    const splitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 0,
    });
    const docs = await splitter.createDocuments([content]);
    await vectorStore.addDocuments(docs);
  },
  {
    name: "store",
    description: "Store information.",
    schema: storeSchema,
  }
);