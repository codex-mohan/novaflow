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
import "katex/dist/katex.min.css";
import GradientButton from "../ui/GradientButton";
import {
  Select,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectContent,
} from "../ui/select";
import { AttachmentType } from "@/types/file";
import { useModelsStore } from "@/store/model-store";

type MessageContent = {
  type: "text";
  content: string;
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
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const inputRef = useRef("");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const { toast } = useToast();
  const { models, setModels } = useModelsStore();
  const provider = new Ollama();

  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      const maxHeight = window.innerHeight * 0.06; // Max height is 6% of the viewport height
      textareaRef.current.style.height = "auto";
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`;
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      inputRef.current = e.target.value;
      resizeTextarea();
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
      const input = inputRef.current.trim();
      textareaRef.current!.value = "";
      if (!input && attachments.length === 0) return;

      const userMessage: Message = {
        id: nanoid(),
        role: "user",
        contents: input
          ? [{ type: "text", content: input } as MessageContent]
          : [],
        images: attachments,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMessage]);
      inputRef.current = "";
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
            { role: "system", content: systemMessage },
            ...history.map((msg) => ({
              role: msg.role,
              content: msg.content,
              images: msg.images,
            })),
          ],
        };

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
        console.log("messages: ", messages);
      }
    },
    [messages, systemMessage, attachments, toast]
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

  useEffect(() => {
    // // Replace this with your API or file fetch logic
    // const fetchModels = async () => {
    //   try {
    //     const response = await fetch("/api/models"); // Replace with actual API endpoint
    //     const data = await response.json();
    //     setModels(data.models); // Assuming data.models contains an array of model names
    //   } catch (error) {
    //     console.error("Error fetching models:", error);
    //   }
    // };

    // fetchModels();

    // Predefined models
    const predefinedModels = [
      "llama3.2-vision",
      "qwen2.5-vl",
      "mistral0.3",
      "command-r",
      "hermes-3.5",
    ];

    // Set predefined models in the Zustand store
    setModels(predefinedModels);
  }, [setModels]);

  return (
    <div
      className="flex flex-col w-full mx-3 my-2 justify-center align-middle"
      style={{ height: "calc(100vh - 2.5rem)" }}
    >
      <div className="flex items-center justify-center h-10 text-font">
        <div className="flex flex-col justify-center self-center">
          <Select>
            <SelectTrigger className="w-[280px] border-transparent ring-transparent ring-offset-transparent">
              <SelectValue
                className="select-none border-transparent focus:border-transparent focus:ring-transparent"
                placeholder="Select Model..."
              />
            </SelectTrigger>
            <SelectContent className="">
              {models.length > 0 ? (
                models.map((model, index) => (
                  <SelectItem
                    key={index}
                    value={model}
                    className="hover:bg-base-hover"
                  >
                    {model}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="loading">Loading models...</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <ScrollArea className="flex flex-1 px-4 py-2 overflow-y-scroll">
        <div className="space-y-4 w-full mx-auto overflow-y-scroll md:max-w-5xl xl:max-w-6xl justify-center align-middle">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              role={message.role}
              contents={message.contents}
              images={message.images}
              timestamp={message.timestamp}
            />
          ))}
        </div>
      </ScrollArea>

      <div className="justify-center align-middle self-center bottom-0 mb-6 w-full bg-node p-4 rounded-[2rem] md:max-w-5xl xl:max-w-6xl ">
        <form onSubmit={handleSubmit} className="w-full mx-auto">
          <div className="flex items-center space-x-2">
            <textarea
              id="text-box"
              ref={textareaRef}
              onChange={handleInputChange}
              placeholder="Type your message here..."
              spellCheck="true"
              className="select-none block w-full resize-none bg-inherit text-font border border-transparent ring-0 focus:ring-0
      focus:outline-none transition-shadow duration-300 focus:border-transparent
      ease-in-out overflow-y-auto px-3 py-2 rounded-md 
      min-h-6"
            />
          </div>
          <div className="flex flex-1 items-center justify-between mt-2 px-3 py-2">
            <AttachmentMenu onSelect={handleAttachment} />
            {isStreaming ? (
              <Button
                onClick={() => setIsStreaming(false)}
                type="button"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white py-2 px-4 rounded"
              >
                <StopCircle className="mr-2" />
                Stop
              </Button>
            ) : (
              <GradientButton
                type="submit"
                className="w-10 h-10 rounded-full px-2 py-2"
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
