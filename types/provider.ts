type ProviderName = "ollama" | "local" | "openai" | "groq" | "googleai";

type provider = {
  name: ProviderName;
  model: string;
  endpoint: string;
  settings: llmSettings;
};

type llmSettings = {
  topK: number;
  temperature: number;
  maxTokens: number;
};
