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

// Don't forget to import styles for KaTeX
import "katex/dist/katex.min.css";
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
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();
  const provider = new Ollama();

  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      const maxHeight = window.innerHeight * 0.3; // Max height is 30% of the viewport height
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setInput(e.target.value);
      requestAnimationFrame(() => resizeTextarea());
    },
    [resizeTextarea]
  );

  useEffect(() => {
    resizeTextarea();
  }, [resizeTextarea]);

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

  const handleAttachment = async (type: string) => {
    console.log("handleAttachment called");

    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "";
    input.multiple = true;

    console.log("input:", input);

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const newAttachments: AttachmentType[] = [];

      // Track completion of file reading using Promise.all
      const fileReadPromises = Array.from(files).map((file) => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (event) => {
            if (event.target?.result) {
              // Remove the "data:image/png;base64," prefix
              const base64Data = (event.target.result as string).replace(
                /^data:image\/\w+;base64,/,
                ""
              );

              const attachment: AttachmentType = {
                type: "image",
                content: base64Data, // Now sending only the raw base64 string
                metadata: {
                  mime_type: file.type,
                  file_name: file.name,
                  alt: file.name,
                },
              };
              newAttachments.push(attachment);
              console.log("Encoded Attachment:", attachment.content);
              resolve(); // Resolve after successfully reading the file
            }
          };

          reader.onerror = reject; // Reject if error occurs during reading

          reader.readAsDataURL(file); // Start reading the file
        });
      });

      // Wait for all files to be processed before updating state
      try {
        await Promise.all(fileReadPromises);

        // After all files are processed, update the state
        setAttachments((prev) => [...prev, ...newAttachments]);
        console.log("New Attachments after set:", newAttachments);
      } catch (error) {
        console.error("Error reading files:", error);
      }
    };

    input.click();
  };

  // useEffect to log when attachments state changes
  useEffect(() => {
    console.log("Attachments updated:", attachments);
  }, [attachments]);

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

      <div className="self-end align-middle bottom-0 mb-4 left-[3.5em] w-full bg-[#232334] p-4 rounded-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <AttachmentMenu onSelect={handleAttachment} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              spellCheck="true"
              className="block w-full resize-none bg-inherit text-font border border-purple-300 border-opacity-30 outline-transparent
      focus:outline-none focus:ring-2 focus:ring-pink-300/50 placeholder-purple-200/60 transition-shadow duration-300 focus:border-transparent;
      ease-in-out hover:shadow-lg hover:shadow-secondary/40 overflow-y-auto p-3 rounded-md 
      min-h-[40px] sm:min-h-[60px] md:min-h-[80px] max-h-[30vh]"
              style={{ height: "auto" }}
            />
            {isStreaming ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => setIsStreaming(false)}
                className="w-10 h-10 bg-gradient-to-r from-primary to-secondary "
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <GradientButton
                type="submit"
                className="w-10 h-10"
                color={"text-font"}
                fromColor={"from-primary"}
                toColor={"to-secondary"}
                width={10}
                height={10}
              >
                <Send className="h-6 w-6" />
              </GradientButton>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
