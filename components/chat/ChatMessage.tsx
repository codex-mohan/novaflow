import React from 'react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { InlineMath, BlockMath } from "react-katex";
import Image from 'next/image';
import { Copy, Check, Download } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useState } from 'react';

interface MessageContent {
  type: "text" | "code" | "image" | "latex";
  content: string;
  metadata?: {
    language?: string;
    alt?: string;
    mime_type?: string;
    file_name?: string;
  };
}

interface ChatMessageProps {
  role: "user" | "assistant";
  contents: MessageContent[];
  timestamp: Date;
}

const CodeBlock = ({ content, language }: { content: string; language?: string }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-2">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-[#232334] hover:bg-[#313244]"
          onClick={handleCopy}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </Button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem',
          backgroundColor: '#1e1e2e',
        }}
        wrapLongLines={true}
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
};

const ImageBlock = ({ content, metadata }: { content: string; metadata?: MessageContent['metadata'] }) => {
  const handleDownload = async () => {
    const response = await fetch(content);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = metadata?.file_name || 'image';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="relative group my-2">
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-[#232334] hover:bg-[#313244]"
          onClick={handleDownload}
        >
          <Download className="h-4 w-4" />
        </Button>
      </div>
      <Image
        src={content}
        alt={metadata?.alt || "Message image"}
        width={400}
        height={300}
        className="rounded-lg max-w-full h-auto"
      />
    </div>
  );
};

const ContentRenderer = ({ content }: { content: MessageContent }) => {
  switch (content.type) {
    case "code":
      return (
        <CodeBlock 
          content={content.content} 
          language={content.metadata?.language} 
        />
      );
    
    case "image":
      return (
        <ImageBlock 
          content={content.content} 
          metadata={content.metadata} 
        />
      );
    
    case "latex":
      return (
        <div className="my-2">
          {content.content.includes("\n") ? (
            <BlockMath>{content.content}</BlockMath>
          ) : (
            <InlineMath>{content.content}</InlineMath>
          )}
        </div>
      );
    
    default:
      return (
        <p className="whitespace-pre-wrap text-[#e4e4e7] leading-relaxed">
          {content.content}
        </p>
      );
  }
};

export const ChatMessage: React.FC<ChatMessageProps> = ({
  role,
  contents,
  timestamp,
}) => {
  return (
    <div
      className={cn(
        "flex w-full",
        role === "user" ? "justify-end" : "justify-start"
      )}
    >
      <div
        className={cn(
          "flex items-start space-x-2 max-w-3xl",
          role === "user" ? "flex-row-reverse space-x-reverse" : ""
        )}
      >
        <Avatar className="w-8 h-8 border border-[#313244]">
          {role === "assistant" ? (
            <AvatarImage src="/ai-avatar.png" className="p-1" />
          ) : (
            <AvatarImage src="/user-avatar.png" />
          )}
          <AvatarFallback className="bg-[#232334] text-[#e4e4e7]">
            {role === "user" ? "U" : "AI"}
          </AvatarFallback>
        </Avatar>

        <div
          className={cn(
            "flex flex-col space-y-2 rounded-lg p-4",
            role === "user" 
              ? "bg-[#313244] text-[#e4e4e7]" 
              : "bg-[#232334] text-[#e4e4e7]"
          )}
        >
          {contents.map((content, index) => (
            <ContentRenderer key={index} content={content} />
          ))}
          
          <div className="text-xs text-[#a1a1aa] mt-1 self-end">
            {new Date(timestamp).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit'
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
