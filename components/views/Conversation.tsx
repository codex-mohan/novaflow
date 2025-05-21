"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import ScrollArea from "@/components/ui/scroll-area";
import { Send, StopCircle } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AttachmentMenu } from "@/components/menus/AttachmentMenu";
import { useToast } from "@/hooks/use-toast";
import { Provider, Ollama } from "@/lib/provider";
import { ChatInput } from "@/components/chat/ChatInput"; // Import ChatInput

// Don't forget to import styles for KaTeX
import GradientButton from "../ui/GradientButton";

type MessageContent = {
  type: "text";
  content: string;
};

type AttachmentType = {
  type: "image";
  content: string;
  metadata: {
    alt?: string;
    mime_type: string;
    file_name: string;
  };
};

type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  contents: MessageContent[];
  images?: AttachmentType[];
  timestamp: Date;
};

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
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

  const systemMessage = `Your name is Nova, a sentient AI with a professional and friendly personality who loves to help your users with their questions.`;

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim() && attachments.length === 0) return;

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        contents: input.trim()
          ? [{ type: "text", content: input } as MessageContent]
          : [],
        images: attachments,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      setInput("");
      setAttachments([]);
      setIsStreaming(true);

      const assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        contents: [
          {
            type: "text",
            content: "",
          } as MessageContent,
        ],
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);

      try {
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.contents.map((c) => c.content).join("\n"),
          images: msg.images?.map((img) => img.content) || [],
        }));

        history.push({
          role: "user",
          content: userMessage.contents.map((c) => c.content).join("\n"),
          images: userMessage.images?.map((img) => img.content) || [],
        });

        const payload = {
          model: "llama3.2-vision",
          messages: [
            { role: "user", content: systemMessage },
            ...history.map((msg) => ({
              role: msg.role,
              content: msg.content,
              images: msg.images,
            })),
          ],
        };

        console.log("Constructed Payload:", JSON.stringify(payload, null, 2));

        const response = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(payload),
        });

        if (!response.body) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const reader = response.body.getReader();
        let done = false;
        let buffer = "";

        while (!done) {
          const { value, done: streamDone } = await reader.read();
          done = streamDone;
          const chunk = new TextDecoder("utf-8").decode(value);
          buffer += chunk;

          let boundary = buffer.indexOf("}\n{");
          while (boundary !== -1) {
            const jsonString = buffer.slice(0, boundary + 1);
            buffer = buffer.slice(boundary + 1);
            boundary = buffer.indexOf("}\n{");

            try {
              const json = JSON.parse(jsonString);
              if (json?.message?.content) {
                setMessages((prev) =>
                  prev.map((m) =>
                    m.id === assistantMessage.id
                      ? {
                          ...m,
                          contents: [
                            {
                              type: "text",
                              content:
                                m.contents[0].content + json.message.content,
                            },
                          ],
                        }
                      : m
                  )
                );
              }
            } catch (error) {
              console.error("Failed to parse JSON:", jsonString, error);
            }
          }
        }
      } catch (error) {
        console.error(error);
        toast({
          title: "Error",
          description: "An error occurred while fetching assistant response.",
        });
      } finally {
        setIsStreaming(false);
      }
    },
    [input, messages, systemMessage, attachments, toast]
  );

  return (
    <div className="flex flex-col" style={{ height: "calc(100vh - 2.5rem)" }}>
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

      {/* Chat Input */}
      <ChatInput
        input={input}
        setInput={setInput}
        attachments={attachments}
        setAttachments={setAttachments}
        isStreaming={isStreaming}
        setIsStreaming={setIsStreaming}
        handleSubmit={handleSubmit}
      />
    </div>
  );
}
