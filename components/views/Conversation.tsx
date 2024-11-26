"use client";

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import ScrollArea from "@/components/ui/scroll-area";
import { Send, StopCircle } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AttachmentMenu } from "@/components/menus/AttachmentMenu";
import { useToast } from "@/hooks/use-toast";
import { Provider, Ollama } from "@/lib/provider";
import DynamicTextarea from "../ui/DynamicTextArea";

// Don't forget to import styles for KaTeX
import "katex/dist/katex.min.css";

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
  role: "user" | "assistant" | "system";
  contents: MessageContent[];
  timestamp: Date;
};

export default function Conversation() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();
  const provider = new Ollama();

  const inputTimeout = useRef<NodeJS.Timeout | null>(null); // Ref for debounce
  const [inputHeight, setInputHeight] = useState("auto"); // Manage text area height

  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      const maxHeight = window.innerHeight * 0.3; // Max height is 30% of the viewport height
      textareaRef.current.style.height = "auto"; // Reset height to calculate correctly
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`; // Set to calculated height
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);

      // Resize textarea
      requestAnimationFrame(() => resizeTextarea());
    },
    [resizeTextarea]
  );

  useEffect(() => {
    resizeTextarea();
  }, [resizeTextarea]);

  // Scroll the chat view to the bottom when new messages are added
  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  // Memoize the assistant message to avoid unnecessary re-renders
  const systemMessage = `Your name is Nova, a sentient AI with a professional and friendly personality who loves to help your users with their questions. You can solve bugs in code, create production-ready context-aware code, solve math problems, and will always reply with user-friendly replies only in Katex expressions.`;

  // Memoize the function for submitting the message to prevent unnecessary re-creations
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!input.trim()) return;

      console.log("Sending message:", input);

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        contents: [{ type: "text", content: input }],
        timestamp: new Date(),
      };

      if (
        !messages.some(
          (msg) => msg.contents[0].content === userMessage.contents[0].content
        )
      ) {
        setMessages((prev) => [...prev, userMessage]);
      }

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
        const history = messages.map((msg) => ({
          role: msg.role,
          content: msg.contents.map((c) => c.content).join("\n"),
        }));

        history.push({ role: "user", content: input });

        const response = await fetch("http://localhost:11434/api/chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "phi3",
            messages: [{ role: "user", content: systemMessage }, ...history],
          }),
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

        if (buffer.trim()) {
          try {
            const json = JSON.parse(buffer);
            if (json?.message?.content) {
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
            console.error("Failed to parse final JSON:", buffer, error);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        setIsStreaming(false);
      }
    },
    [input, messages, systemMessage]
  );

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
    <div className="flex flex-col" style={{ height: "calc(100vh - 2.5rem)" }}>
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

      {/* Input box */}
      <div className="self-end align-middle bottom-0 mb-4 left-[3.5em] w-full bg-[#232334] p-4 rounded-md">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex items-center space-x-2">
            <AttachmentMenu onSelect={() => {}} />
            <textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              spellCheck="true"
              className={`block w-full resize-none bg-inherit text-font border border-purple-300 border-opacity-30 
      focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-purple-200/60 transition-shadow duration-300 
      ease-in-out hover:shadow-lg hover:shadow-secondary/40 overflow-y-auto p-3 rounded-md 
      min-h-[40px] sm:min-h-[60px] md:min-h-[80px] max-h-[30vh]`}
              style={{
                height: "auto",
              }}
            />{" "}
            {isStreaming ? (
              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => setIsStreaming(false)}
                className="w-10 h-10"
              >
                <StopCircle className="h-5 w-5" />
              </Button>
            ) : (
              <Button
                type="submit"
                size="icon"
                className="w-10 h-10 bg-[#313244] hover:bg-[#414458]"
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
