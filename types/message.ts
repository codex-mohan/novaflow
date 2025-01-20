import { AttachmentType } from "./file";

export type Message = {
  message_id: string;
  role: "user" | "assistant" | "system";
  contents: MessageContent[];
  images?: AttachmentType[] | [];
  timestamp: Date;
};

export type FetchedMessage = {
  message_id: string;
  role: "user" | "assistant" | "system";
  contents: MessageContent[];
  images?: AttachmentType[] | [];
  timestamp: string;
};

export type MessageContent = {
  type: "text";
  content: string;
};
