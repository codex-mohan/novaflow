// Base abstract class for all providers
export abstract class Provider {
  abstract getCompletions(prompt: string): Promise<string>; // Define a method for getting completions
  abstract streamCompletions(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void>; // New method for streaming
}

// Ollama provider implementation
export class Ollama extends Provider {
  async getCompletions(prompt: string): Promise<string> {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "phi3",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    console.log(`Request sent:${response}`);

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    let result = "";
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      const chunk = new TextDecoder("utf-8").decode(value);
      const json = JSON.parse(chunk);

      result += json?.message?.content ?? ""; // Accumulate the content from the stream
    }

    return result; // Return the accumulated result
  }

  async streamCompletions(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {
    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "phi3",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    if (!response.body) {
      throw new Error("Response body is null");
    }

    const reader = response.body.getReader();
    let done = false;

    while (!done) {
      const { value, done: streamDone } = await reader.read();
      done = streamDone;
      const chunk = new TextDecoder("utf-8").decode(value);
      const json = JSON.parse(chunk);
      onToken(json.message.content); // Call the callback with the token
    }
  }
}

// Groq provider implementation
class Groq extends Provider {
  async getCompletions(prompt: string): Promise<string> {
    return "Groq completion"; // Placeholder return
  }
  async streamCompletions(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {}
}

// OpenAI provider implementation
class OpenAI extends Provider {
  async getCompletions(prompt: string): Promise<string> {
    return "OpenAI completion"; // Placeholder return
  }
  async streamCompletions(
    prompt: string,
    onToken: (token: string) => void
  ): Promise<void> {}
}
