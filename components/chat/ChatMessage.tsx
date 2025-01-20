import React, { useState, useMemo, memo, useCallback } from "react";
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
import {
  Copy,
  Check,
  Download,
  RefreshCcw,
  Settings,
  Edit,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AttachmentType } from "@/types/file";

// // Import only necessary languages for syntax highlighting
// import jsx from "react-syntax-highlighter/dist/esm/languages/prism/jsx";
// import javascript from "react-syntax-highlighter/dist/esm/languages/prism/javascript";
// import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
// import css from "react-syntax-highlighter/dist/esm/languages/prism/css";

// // Register languages
// SyntaxHighlighter.registerLanguage("jsx", jsx);
// SyntaxHighlighter.registerLanguage("javascript", javascript);
// SyntaxHighlighter.registerLanguage("python", python);
// SyntaxHighlighter.registerLanguage("css", css);

// KaTeX styles
import "katex/dist/katex.min.css";

interface MessageContent {
  type: "text" | "image" | "file";
  content: string;
  metadata?: {
    alt?: string;
    mime_type?: string;
    file_name?: string;
  };
  images?: AttachmentType[];
}

interface ChatMessageProps {
  role: "user" | "assistant" | "system";
  contents: MessageContent[];
  timestamp: string;
  images?: AttachmentType[];
}

// Memoized Code Block
const CodeBlock = memo(
  ({ content, language }: { content: string; language?: string }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(async () => {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }, [content]);

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
  }
);

// Memoized Image Block
const ImageBlock = memo(
  ({
    content,
    metadata,
  }: {
    content: string;
    metadata?: MessageContent["metadata"];
  }) => {
    const handleDownload = useCallback(async () => {
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
    }, [content, metadata]);

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
  }
);

// Memoized Content Renderer
const ContentRenderer = memo(
  ({
    content,
    role,
    images,
  }: {
    content: string;
    role: "user" | "assistant" | "system";
    images?: AttachmentType[];
  }) => {
    const remarkPlugins = useMemo(
      () => [remarkMath, remarkGfm, remarkParse, remarkRehype],
      []
    );
    const rehypePlugins = useMemo(() => [rehypeKatex], []);

    if (role === "user") {
      return (
        <div className="text-wrap break-words">
          {content}
          {images && images.length > 0 && (
            <div className="flex flex-wrap">
              {images.map((image, index) => (
                <ImageBlock
                  key={index}
                  content={`data:image/${image.type};base64,${image.content}`}
                  metadata={image.metadata}
                />
              ))}
            </div>
          )}
        </div>
      );
    }

    if (role === "assistant") {
      return (
        <ReactMarkdown
          className={""}
          children={content}
          rehypePlugins={rehypePlugins}
          remarkPlugins={remarkPlugins}
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
            img({ alt, src }) {
              return (
                <ImageBlock
                  content={`data:image/png;base64,${src}`}
                  metadata={{ alt }}
                />
              );
            },
          }}
        />
      );
    }

    return null;
  }
);

// Memoized Chat Controls
const ChatControls = memo(
  ({
    role,
    timestamp,
  }: {
    role: "user" | "assistant" | "system";
    timestamp: string;
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
    } else {
      return (
        <div className="mt-2 flex space-x-2 justify-start align-baseline">
          <Button
            variant="ghost"
            size="icon"
            title="Edit Message"
            className="h-4 w-4 bg-transparent hover:bg-[#313244] self-end"
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            title="Regenerate Request"
            className="h-4 w-4 bg-transparent hover:bg-[#313244] self-end"
          >
            <RefreshCcw className="h-4 w-4" />
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
  }
);

// Optimized Chat Message Component
export const ChatMessage = memo(
  ({ role, contents, timestamp, images }: ChatMessageProps) => {
    const memoizedContents = useMemo(
      () =>
        contents.map((content, index) => (
          <ContentRenderer
            key={index}
            content={content.content}
            role={role}
            images={images}
          />
        )),
      [contents, role, images]
    );

    return (
      <div
        className={cn(
          "select-none flex w-full",
          role === "user" ? "justify-end" : "justify-start"
        )}
      >
        <div
          className={cn(
            "flex items-start space-x-2 max-w-3xl w-fit",
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
              "flex flex-col space-y-2 rounded-lg p-4 flex-nowrap w-fit text-justify",
              role === "user"
                ? "bg-[#313244] text-[#e4e4e7] w-full"
                : "bg-[#232334] text-[#e4e4e7] flex-nowrap justify-center"
            )}
          >
            {memoizedContents}
            <ChatControls role={role} timestamp={timestamp} />
          </div>
        </div>
      </div>
    );
  },
  (prevProps, nextProps) => {
    // Custom comparison function for props
    return (
      prevProps.role === nextProps.role &&
      prevProps.timestamp === nextProps.timestamp &&
      JSON.stringify(prevProps.contents) ===
        JSON.stringify(nextProps.contents) &&
      JSON.stringify(prevProps.images) === JSON.stringify(nextProps.images)
    );
  }
);
