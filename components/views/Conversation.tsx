"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { nanoid } from "nanoid";
import { Button } from "@/components/ui/button";
import ScrollArea from "@/components/ui/scroll-area";
import { Send, Sidebar, StopCircle } from "lucide-react";
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AttachmentMenu } from "@/components/menus/AttachmentMenu";
import { useToast } from "@/hooks/use-toast";
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
import ConversationList from "@/components/views/ConversationList";
import { AttachmentType } from "@/types/file";
import { Message, MessageContent } from "@/types/message";
import { useAuthStore } from "@/store/auth-store";
import { useModelsStore } from "@/store/model-store";
import {
  useConversationStore,
  useConversationState,
} from "@/store/conversation-store";
import { useMessageStore } from "@/store/messages-store";
import { invoke } from "@tauri-apps/api/core";
import { Conversation as ConversationType } from "@/types/conversation";

import { Agent } from "@/lib/agent";

type HistoryType = {
  message_id: string;
  role: "user" | "assistant" | "system";
  contents: MessageContent[];
  timestamp: string;
};

export default function Conversation() {
  const [attachments, setAttachments] = useState<AttachmentType[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [loadedFromDb, setLoadedFromDb] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const [showConversationList, setShowConversationList] = useState(false);
  const { currentConversationId, setCurrentConversationId } =
    useConversationStore();
  const { conversations, setConversations } = useConversationState();
  const { messages, setMessage, setMessages, addMessage, loading } =
    useMessageStore();
  const { getUser } = useAuthStore();
  const { toast } = useToast();
  const { models, setModels } = useModelsStore();

  // console.log("AI is being created.");
  // const AI = new Agent({ model: "ollama", settings: { temperature: 0.8 } });
  // console.log("AI has been created.");

  // Ref to track the latest assistant message during streaming
  const assistantMessageRef = useRef<Message | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const [userInput, setUserInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && e.shiftKey === true) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  useEffect(() => {
    const scrollViewport = scrollAreaRef.current?.querySelector(
      "[data-radix-scroll-area-viewport]"
    );
    if (scrollViewport) {
      scrollViewport.scrollTop = scrollViewport.scrollHeight;
    }
  }, [messages]);

  // Load messages when the conversation changes
  useEffect(() => {
    if (currentConversationId!) {
      console.log("Loading conversation messages - ", currentConversationId);
      // loadMessages(currentConversationId, () => {
      //   console.log("Messages have been loaded!");
      // });
      setLoadedFromDb(true);
      setTimeout(() => {
        console.log("This runs after 2 seconds");
      }, 2000); // 2000 milliseconds = 2 seconds
      console.log("loaded messages: ", JSON.stringify(messages));
      setMessages(messages);
    } else {
      console.log("No messages to load");
      setMessages([]); // Clear messages if no conversation is selected
    }
  }, [currentConversationId]);

  // console.log("messages: ", JSON.stringify(messages));

  const systemMessage = `Your name is Nova, a sentient AI with a professional and friendly personality who loves to help your users with their questions.`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoadedFromDb(false);

    let history: HistoryType[];

    const handleCreateConversation = async () => {
      try {
        const username = getUser()?.username;

        const newConversation = await invoke<ConversationType>(
          "create_conversation",

          {
            username,
            conversation_title: `New Conversation`,
          }
        );

        setConversations([...conversations, newConversation]);

        setCurrentConversationId(newConversation.id.id.String);

        toast({
          title: "Conversation Created",

          description: "A new conversation has been created successfully!",
        });

        return newConversation.id.id.String; // Return the new conversation ID
      } catch (error) {
        console.error("Failed to create a new conversation:", error);

        toast({
          title: "Error",
          description: "Failed to create a new conversation.",
          variant: "destructive",
        });
        return null;
      }
    };

    const saveToDatabase = async (messages: HistoryType[]) => {
      try {
        // console.log(messages);
        await invoke("add_messages_to_conversation", {
          messages,
          conversation_id: currentConversationId,
        });
      } catch (error) {
        console.error("Error saving to database:", error);
      }
    };

    if (isStreaming) {
      toast({
        title: "Streaming in progress",
        description: "Please wait for the current response to complete.",
      });
      return;
    }

    const input = userInput.trim();
    if (!input && attachments.length === 0) return;

    // Abort any previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create a new AbortController for this request
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    let conversationId = currentConversationId;
    if (!conversationId) {
      conversationId = await handleCreateConversation();
      if (!conversationId) return; // Exit if conversation creation fails
    }

    if (messages.length === 0) {
      console.log("messages are 0.");
    }

    const userMessage: Message = {
      message_id: nanoid(),
      role: "user",
      contents: input
        ? [{ type: "text", content: input } as MessageContent]
        : [],
      images: attachments,
      timestamp: new Date(),
    };

    addMessage(userMessage); // Add the message to the store
    setUserInput(""); // Clear input after submission
    setAttachments([]);
    setIsStreaming(true); // Start streaming

    const assistantMessage: Message = {
      message_id: nanoid(),
      role: "assistant",
      contents: [{ type: "text", content: "" } as MessageContent],
      timestamp: new Date(),
    };

    addMessage(assistantMessage); // Add the assistant message to the store
    assistantMessageRef.current = assistantMessage; // Track the assistant message

    try {
      console.log("messages at submit: ", messages);

      const shortTermHistory = messages.map((msg) => ({
        role: msg.role,
        content: msg.contents.map((c) => c.content).join("\n"),
        images: msg.images?.map((img) => img.content) || [],
      }));

      const payload = {
        model: "deepseek-r1:7b",
        messages: [
          { role: "system", content: systemMessage },
          ...shortTermHistory,
          {
            role: "user",
            content: input,
            images: attachments.map((a) => a.content),
          },
        ],
        options: {
          top_k: 20,
          top_p: 0.9,
          min_p: 0.0,
          typical_p: 0.7,
          repeat_last_n: 33,
          temperature: 0.8,
          repeat_penalty: 1.2,
          presence_penalty: 1.5,
          frequency_penalty: 1.0,
          mirostat: 1,
          mirostat_tau: 0.8,
          mirostat_eta: 0.6,
          numa: false,
          num_ctx: 16000,
        },
      };

      console.log("Sending payload:", payload);

      const response = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal, // Pass the signal to the fetch request
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
        console.log("stream done: ", streamDone, "chunk: ", chunk);
        buffer += chunk;

        // Process the buffer for JSON objects
        while (true) {
          console.log("inner BUFFER loop");
          const boundary = buffer.indexOf("}\n{");
          if (boundary === -1) break;

          const jsonString = buffer.slice(0, boundary + 1);
          buffer = buffer.slice(boundary + 1);

          try {
            const json = JSON.parse(jsonString);
            // console.log("Parsed JSON:", json);
            if (json?.message?.content) {
              // Use setMessage to update the assistant's message
              setMessage(assistantMessageRef.current!.message_id, (m) => ({
                ...m,
                contents: [
                  {
                    type: "text",
                    content: m.contents[0].content + json.message.content,
                  },
                ],
              }));
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
      setIsStreaming(false); // Stop streaming
      history = messages.map((msg) => ({
        message_id: msg.message_id,
        role: msg.role,
        contents: msg.contents,
        timestamp: msg.timestamp.toISOString(),
      }));
      console.log(
        "saving message to database for conversation id: ",
        currentConversationId,
        history
      );
      await saveToDatabase(history); // Save the message to the database
      assistantMessageRef.current = null; // Reset the ref
      abortControllerRef.current = null; // Reset the AbortController
    }
  };

  const handleAttachment = async (type: string) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = type === "image" ? "image/*" : "";
    input.multiple = true;

    input.onchange = async (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (!files) return;

      const newAttachments: AttachmentType[] = [];

      const fileReadPromises = Array.from(files).map((file) => {
        return new Promise<void>((resolve, reject) => {
          const reader = new FileReader();

          reader.onload = (event) => {
            if (event.target?.result) {
              const base64Data = (event.target.result as string).replace(
                /^data:image\/\w+;base64,/,
                ""
              );
              const attachment: AttachmentType = {
                type: "image",
                content: base64Data,
                metadata: {
                  mime_type: file.type,
                  file_name: file.name,
                  alt: file.name,
                },
              };
              newAttachments.push(attachment);
              resolve();
            }
          };

          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      });

      try {
        await Promise.all(fileReadPromises);
        setAttachments((prev) => [...prev, ...newAttachments]);
      } catch (error) {
        console.error("Error reading files:", error);
      }
    };

    input.click();
  };

  useEffect(() => {
    const predefinedModels = [
      "llama3.2-vision",
      "qwen2-vl",
      "mistral",
      "deepseek-r1:7b",
      "deepseek-r1:14b",
    ];
    setModels(predefinedModels);
  }, [setModels]);

  return (
    <div
      className="flex flex-col w-full mx-3 my-2 justify-center align-middle"
      style={{ height: "calc(100vh - 2.5rem)" }}
    >
      {showConversationList && (
        <div className="absolute inset-0 bg-black bg-opacity-50 z-10">
          <ConversationList onClose={() => setShowConversationList(false)} />
        </div>
      )}
      <div className="flex items-center justify-between h-10 text-font">
        <div className="self-center flex justify-center items-center">
          <Button
            variant={"ghost"}
            size="icon"
            className={`w-10 h-10 rounded-lg "bg-[#313244]" : "hover:bg-[#313244]"`}
            onClick={() => setShowConversationList(true)}
          >
            <Sidebar />
          </Button>
        </div>
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
        <div className="w-6 h-6"></div>
      </div>
      <ScrollArea className="flex flex-1 px-4 py-2">
        <div className="space-y-4 w-full mx-auto md:max-w-5xl xl:max-w-6xl justify-center align-middle">
          {loading ? ( // Show loading indicator while messages are being fetched
            <div className="flex justify-center items-center h-full">
              <p>Loading messages...</p>
            </div>
          ) : messages.length === 0 ? ( // Handle empty state
            <div className="flex justify-center items-center h-full">
              <p>No messages found.</p>
            </div>
          ) : (
            // Render messages
            messages.map((message) => (
              <ChatMessage
                key={message.message_id}
                role={message.role}
                contents={message.contents}
                images={message.images}
                timestamp={message.timestamp.toISOString()}
              />
            ))
          )}
        </div>
      </ScrollArea>
      <div className="justify-center align-middle self-center bottom-0 mb-6 w-full bg-node p-4 rounded-[2rem] md:max-w-5xl xl:max-w-6xl ">
        <form onSubmit={handleSubmit} className="w-full mx-auto">
          <div className="flex items-center space-x-2">
            <textarea
              id="text-box"
              value={userInput}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder="Type your message here..."
              spellCheck="true"
              className="select-none block w-full resize-none bg-inherit text-font border border-transparent ring-0 focus:ring-0
      focus:outline-none transition-shadow duration-300 focus:border-transparent
      ease-in-out overflow-y-auto px-3 pt-2 rounded-md 
      min-h-6"
            />
          </div>
          <div className="flex flex-1 items-center justify-between px-3 py-2">
            <AttachmentMenu onSelect={handleAttachment} />
            {isStreaming ? (
              <Button
                onClick={() => {
                  if (abortControllerRef.current) {
                    abortControllerRef.current.abort();
                  }
                }}
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
