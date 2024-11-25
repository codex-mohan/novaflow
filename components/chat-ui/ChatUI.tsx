import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ScrollArea from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Send, Paperclip, Mic, FileText, Image, Folder } from "lucide-react";

type Message = {
  role: "user" | "assistant";
  content: string;
};

export default function Component() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isAttachmentMenuOpen, setIsAttachmentMenuOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      setMessages([...messages, { role: "user", content: input }]);
      // Here you would typically send the message to your AI backend
      // and then add the response to the messages
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "This is a mock response." },
      ]);
      setInput("");
    }
  };

  const handleAttachment = (type: string) => {
    console.log(`Attaching ${type}`);
    // Implement attachment logic here
    setIsAttachmentMenuOpen(false);
  };

  const handleAudioInput = () => {
    console.log("Audio input activated");
    // Implement audio input logic here
  };

  return (
    <div className="flex flex-col h-screen max-w-3xl mx-auto">
      <ScrollArea className="flex-grow p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`flex items-start space-x-2 ${
                message.role === "user"
                  ? "flex-row-reverse space-x-reverse"
                  : ""
              }`}
            >
              <Avatar>
                <AvatarFallback>
                  {message.role === "user" ? "U" : "AI"}
                </AvatarFallback>
                <AvatarImage
                  src={
                    message.role === "user"
                      ? "/user-avatar.png"
                      : "/ai-avatar.png"
                  }
                />
              </Avatar>
              <div
                className={`rounded-lg p-3 max-w-xs ${
                  message.role === "user"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {message.content}
              </div>
            </div>
          </div>
        ))}
      </ScrollArea>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex items-center space-x-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <DropdownMenu
                  open={isAttachmentMenuOpen}
                  onOpenChange={setIsAttachmentMenuOpen}
                >
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Paperclip className="h-4 w-4" />
                      <span className="sr-only">Attach file</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem
                      onClick={() => handleAttachment("document")}
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span>Document</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAttachment("image")}>
                      <Image className="mr-2 h-4 w-4" />
                      <span>Image</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleAttachment("other")}>
                      <Folder className="mr-2 h-4 w-4" />
                      <span>Other</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TooltipTrigger>
              <TooltipContent>Attach file</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message here..."
            className="flex-grow"
          />
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={handleAudioInput}>
                  <Mic className="h-4 w-4" />
                  <span className="sr-only">Voice input</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Voice input</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                  <span className="sr-only">Send</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>Send message</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </form>
    </div>
  );
}
