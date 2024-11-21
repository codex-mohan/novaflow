"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Paperclip, Mic, FileText, 
  ImageIcon, Folder, MessageSquare, 
  Share2, Settings, HelpCircle, StopCircle
} from "lucide-react";
import { nanoid } from 'nanoid';
import { ChatMessage } from "@/components/chat/ChatMessage";
import { AttachmentMenu } from "@/components/chat/AttachmentMenu";
import { useToast } from "@/hooks/use-toast";

type MessageContent = {
  type: "text" | "code" | "image" | "latex";
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

export default function Dashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeIcon, setActiveIcon] = useState("conversation");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTo({
        top: scrollAreaRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: nanoid(),
      role: "user",
      contents: [{ type: "text", content: input }],
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsStreaming(true);

    try {
      // Start streaming response
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) throw new Error('Failed to get response');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      let assistantMessage: Message = {
        id: nanoid(),
        role: "assistant",
        contents: [{ type: "text", content: "" }],
        timestamp: new Date(),
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        // Decode and append the chunk
        const chunk = new TextDecoder().decode(value);
        assistantMessage.contents[0].content += chunk;
        
        // Update the message in state
        setMessages(prev => {
          const newMessages = [...prev];
          const index = newMessages.findIndex(m => m.id === assistantMessage.id);
          if (index === -1) {
            newMessages.push(assistantMessage);
          } else {
            newMessages[index] = assistantMessage;
          }
          return newMessages;
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to get response from assistant",
        variant: "destructive",
      });
    } finally {
      setIsStreaming(false);
    }
  };

  const handleAttachment = async (type: string) => {
    // Implementation for handling different attachment types
    switch (type) {
      case "image":
        // Open file picker for images
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async (e) => {
          const file = (e.target as HTMLInputElement).files?.[0];
          if (file) {
            // Handle image upload
            const reader = new FileReader();
            reader.onload = async (e) => {
              const imageMessage: Message = {
                id: nanoid(),
                role: "user",
                contents: [{
                  type: "image",
                  content: e.target?.result as string,
                  metadata: {
                    alt: file.name,
                    mime_type: file.type
                  }
                }],
                timestamp: new Date()
              };
              setMessages(prev => [...prev, imageMessage]);
            };
            reader.readAsDataURL(file);
          }
        };
        input.click();
        break;
      // Add other attachment type handlers
    }
  };

  const stopGeneration = () => {
    // Implementation to stop the streaming response
    setIsStreaming(false);
    // Add actual abort controller logic here
  };

  const handleIconClick = (name: string) => {
    setActiveIcon(name);
  };

  return (
    <div className="flex h-full w-full overflow-hidden bg-base-secondary text-white">
      {/* Side Menu */}
      <div className="w-14 bg-[#181825] flex flex-col items-center py-2 space-y-4 border-r border-[#313244]">
        {[
          { name: "conversation", icon: MessageSquare },
          { name: "node-editor", icon: Share2 },
          { name: "settings", icon: Settings },
          { name: "help", icon: HelpCircle },
        ].map(({ name, icon: Icon }) => (
          <Button
            key={name}
            variant={activeIcon === name ? "secondary" : "ghost"}
            size="icon"
            className={`w-10 h-10 rounded-lg ${
              activeIcon === name ? "bg-[#313244]" : "hover:bg-[#313244]"
            }`}
            onClick={() => handleIconClick(name)}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{name}</span>
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full px-4 py-2">
            <div className="space-y-4 max-w-4xl mx-auto">
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
        </div>

        <div className="p-4 border-t border-[#313244]">
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
    </div>
  );
}
