"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Send, StopCircle } from "lucide-react";
import { AttachmentMenu } from "@/components/menus/AttachmentMenu";
import GradientButton from "../ui/GradientButton";

type AttachmentType = {
  type: "image";
  content: string;
  metadata: {
    alt?: string;
    mime_type: string;
    file_name: string;
  };
};

interface ChatInputProps {
  input: string;
  setInput: (input: string) => void;
  attachments: AttachmentType[];
  setAttachments: React.Dispatch<React.SetStateAction<AttachmentType[]>>;
  isStreaming: boolean;
  setIsStreaming: (isStreaming: boolean) => void;
  handleSubmit: (e: React.FormEvent) => Promise<void>;
}

export function ChatInput({
  input,
  setInput,
  attachments,
  setAttachments,
  isStreaming,
  setIsStreaming,
  handleSubmit,
}: ChatInputProps) {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

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
    [resizeTextarea, setInput]
  );

  useEffect(() => {
    resizeTextarea();
  }, [resizeTextarea]);

  const handleAttachment = async (type: string) => {
    console.log("handleAttachment called");

    const inputElement = document.createElement("input");
    inputElement.type = "file";
    inputElement.accept = type === "image" ? "image/*" : "";
    inputElement.multiple = true;

    console.log("input:", inputElement);

    inputElement.onchange = async (e) => {
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
              console.log("Encoded Attachment:", attachment.content);
              resolve();
            }
          };

          reader.onerror = reject;

          reader.readAsDataURL(file);
        });
      });

      try {
        await Promise.all(fileReadPromises);
        setAttachments((prev: AttachmentType[]) => [
          ...prev,
          ...newAttachments,
        ]);
        console.log("New Attachments after set:", newAttachments);
      } catch (error) {
        console.error("Error reading files:", error);
      }
    };

    inputElement.click();
  };

  useEffect(() => {
    console.log("Attachments updated:", attachments);
  }, [attachments]);

  return (
    <div className="self-end align-middle bottom-0 mb-4 left-[3.5em] w-full px-12 py-4">
      <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
        <div className="flex flex-col space-y-2">
          {/* Top row: Input area, DeepSearch, Think, Grok */}
          <div className="flex items-center space-x-2 bg-[#232334] p-4 rounded-2xl">
            <div className="flex-col flex-1 m-3">
              <textarea
                ref={textareaRef}
                value={input}
                onChange={handleInputChange}
                placeholder="What do you want to know?"
                spellCheck="true"
                className="block w-full flex-1 resize-none bg-inherit text-font outline-none border-none focus:outline-none focus:ring-0 placeholder-purple-200/60 overflow-y-auto
                min-h-[24px] max-h-[30vh] p-0 m-4"
                style={{ height: "auto" }}
              />
              <div className="flex justify-between">
                {/* Placeholder buttons - replace with actual components */}
                <div className="flex justify-center items-baseline">
                  <Button
                    variant="ghost"
                    className="rounded-full border-primary"
                  >
                    DeepSearch
                  </Button>
                  <Button
                    variant="ghost"
                    className="rounded-full border-primary"
                  >
                    Think
                  </Button>
                </div>
                <div className="flex justify-center items-center space-x-2 mr-5">
                  <Button
                    variant="ghost"
                    className="rounded-full border-primary"
                  >
                    Grok 3
                  </Button>

                  {isStreaming ? (
                    <Button
                      type="button"
                      variant="destructive"
                      size="icon"
                      onClick={() => setIsStreaming(false)}
                      className="w-10 h-10 bg-gradient-to-r from-primary to-secondary rounded-full"
                    >
                      <StopCircle className="h-5 w-5" />
                    </Button>
                  ) : (
                    <GradientButton
                      type="submit"
                      className="w-10 h-10 rounded-full"
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
              </div>
            </div>
          </div>

          {/* Bottom row: Create Images, Edit Image, etc. */}
          <div className="flex justify-center items-center space-x-2">
            {/* Placeholder buttons - replace with actual components */}
            <Button variant="outline" className="rounded-full">
              Create Images
            </Button>
            <Button variant="outline" className="rounded-full">
              Edit Image
            </Button>
            <Button variant="outline" className="rounded-full">
              Latest News
            </Button>
            <Button variant="outline" className="rounded-full">
              Personas
            </Button>
            <Button variant="outline" className="rounded-full">
              Workspaces <span className="ml-1 text-xs text-blue-400">New</span>
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
}
