import React, { useState, useEffect } from "react";
import remarkRehype from "remark-rehype";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import remarkParse from "remark-parse";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import Image from "next/image";
import { Copy, Check, Download, RefreshCcw, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface MessageContent {
  type: "text" | "image";
  content: string;
  metadata?: {
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

const CodeBlock = ({
  content,
  language,
}: {
  content: string;
  language?: string;
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-2">
      <div>
        <span>
          <b>{language}</b>
        </span>
      </div>
      <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 bg-[#232334] hover:bg-[#313244]"
          onClick={handleCopy}
          title="Copy to Clipboard"
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
          borderRadius: "0.5rem",
          padding: "1rem",
          backgroundColor: "#1e1e2e",
        }}
        wrapLongLines
      >
        {content}
      </SyntaxHighlighter>
    </div>
  );
};

const ImageBlock = ({
  content,
  metadata,
}: {
  content: string;
  metadata?: MessageContent["metadata"];
}) => {
  const handleDownload = async () => {
    const response = await fetch(content);
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = metadata?.file_name || "image";
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
          title="Download Image"
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

const ContentRenderer = ({ content }: { content: string }) => (
  <ReactMarkdown
    children={content}
    rehypePlugins={[rehypeKatex]}
    remarkPlugins={[remarkMath, remarkRehype, remarkGfm, remarkParse]}
    components={{
      code({ children, className }) {
        const match = /language-(\w+)/.exec(className || "");
        return match ? (
          <CodeBlock
            content={String(children).replace(/\n$/, "")}
            language={match[1]}
          />
        ) : (
          <code className={className}>{children}</code>
        );
      },
    }}
  />
);

const ChatControls = ({
  role,
  timestamp,
}: {
  role: "user" | "assistant";
  timestamp: Date;
}) => {
  if (role === "assistant") {
    return (
      <div className="mt-2 flex space-x-2 justify-end align-baseline">
        <Button
          variant="ghost"
          size="icon"
          title="Copy Generation"
          className="h-4 w-4 bg-transparent hover:bg-[#313244] self-end"
        >
          <Copy className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Regenerate Response"
          className="h-4 w-4 bg-transparent hover:bg-[#313244] self-end"
        >
          <RefreshCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          title="Switch Model"
          className="h-4 w-4 bg-transparent hover:bg-[#313244] self-end"
        >
          <Settings className="h-4 w-4" />
        </Button>
        <div className="text-xs text-[#a1a1aa] mt-1 self-end">
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>
      </div>
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
            <ContentRenderer key={index} content={content.content} />
          ))}

          <ChatControls role={role} timestamp={timestamp} />
        </div>
      </div>
    </div>
  );
};
