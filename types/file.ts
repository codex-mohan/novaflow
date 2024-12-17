export type AttachmentType = {
  type: "image" | "text" | "file";
  content: string;
  metadata: {
    alt?: string;
    mime_type: string;
    file_name: string;
  };
};

export type Message = {
  id: string;
  role: "user" | "assistant" | "system";
  contents: MessageContent[];
  images?: AttachmentType[];
  timestamp: Date;
};
export type MessageContent = {
  type: "text";
  content: string;
};
