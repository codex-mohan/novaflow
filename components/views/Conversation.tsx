"use client";

import { useState, useRef, useEffect } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollArea from "@/components/ui/scroll-area";
import { Send, StopCircle } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AttachmentMenu } from "@/components/chat/AttachmentMenu";
import { useToast } from "@/hooks/use-toast";
import { Provider, Ollama } from "@/lib/provider";

type MessageContent = {
  type: "text" | "image";
  content: string;
  metadata?: {
    language?: string;
    alt?: string;
    mime_type?: string;
    file_name?: string;
  };
};

type Message = {
  id: string;
  role: "user" | "assistant";
  contents: MessageContent[];
  timestamp: Date;
};

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  const provider = new Ollama();

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      contents: [{ type: "text", content: input }],
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    let assistantContent = "";

    const assistantMessage: Message = {
      id: nanoid(),
      role: "assistant",
      contents: [{ type: "text", content: assistantContent }],
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, assistantMessage]);

    try {
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
              content: input,
            },
          ],
        }),
      });

      if (!response.body) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body.getReader();
      let done = false;
      let buffer = ""; // Buffer to handle concatenated JSON

      while (!done) {
        const { value, done: streamDone } = await reader.read();
        done = streamDone;
        const chunk = new TextDecoder("utf-8").decode(value);
        buffer += chunk; // Append the chunk to the buffer

        // Process multiple JSON objects in the buffer
        let boundary = buffer.indexOf("}\n{"); // Find the boundary between JSON objects
        while (boundary !== -1) {
          const jsonString = buffer.slice(0, boundary + 1); // Extract one JSON object
          buffer = buffer.slice(boundary + 1); // Update the buffer with the remaining data
          boundary = buffer.indexOf("}\n{");

          try {
            const json = JSON.parse(jsonString);
            if (json && json.message && json.message.content) {
              assistantContent += json.message.content;
              assistantMessage.contents = [
                { type: "text", content: assistantContent },
              ];

              setMessages((prev) =>
                prev.map((m) =>
                  m.id === assistantMessage.id ? assistantMessage : m
                )
              );
            }
          } catch (error) {
            console.error("Failed to parse JSON:", jsonString, error);
          }
        }
      }

      // Process any remaining JSON in the buffer
      try {
        if (buffer.trim()) {
          const json = JSON.parse(buffer);
          if (json && json.message && json.message.content) {
            assistantContent += json.message.content;
            assistantMessage.contents = [
              { type: "text", content: assistantContent },
            ];

            setMessages((prev) =>
              prev.map((m) =>
                m.id === assistantMessage.id ? assistantMessage : m
              )
            );
          }
        }
      } catch (error) {
        console.error("Failed to parse final JSON:", buffer, error);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAttachment = async (type: string) => {
    switch (type) {
      case "image":
        const input = document.createElement("input");
        input.type = "file";
        input.accept = "image/*";
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
              const imageMessage: Message = {
                id: nanoid(),
                role: "user",
                contents: [
                  {
                    type: "image",
                    content: e.target?.result as string,
                    metadata: {
                      alt: file.name,
                      mime_type: file.type,
                    },
                  },
                ],
                timestamp: new Date(),
              };
              setMessages((prev) => [...prev, imageMessage]);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        break;
      // Add other attachment type handlers here
    }
  };

  const stopGeneration = () => {
    setIsStreaming(false);
    // Add actual abort controller logic here
  };

  return (
    <div className="flex flex-col h-full">
      {/* Scrollable chat area */}
      <ScrollArea className="flex-1 px-4 py-2 overflow-y-scroll">
        <div className="space-y-4 w-full mx-auto overflow-y-scroll">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              contents={message.contents}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </ScrollArea>

      {/* Fixed input box */}
      <div className="fixed bottom-0 left-[3.5em] w-full bg-[#232334] p-4 border-t border-[#313244]">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <AttachmentMenu onSelect={handleAttachment} />
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message here..."
              className="flex-1 h-10 bg-[#232334] border-[#414458] text-white placeholder-gray-400"
              disabled={isStreaming}
            />
            {isStreaming ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={stopGeneration}
                className="w-10 h-10"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="w-10 h-10 bg-[#313244] hover:bg-[#414458]"
                disabled={!input.trim()}
              >
                <Send className="h-5 w-5" />
              </Button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
