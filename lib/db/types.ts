import { RecordId } from "surrealdb";

export interface Conversation {
  id: RecordId;
  user_id: RecordId;
  title: string;
  created_at: Date;
  updated_at: Date;
}

export interface Message {
  id: RecordId;
  conversation_id: RecordId;
  role: "user" | "assistant";
  content: MessageContent[];
  timestamp: Date;
}

export type MessageContent =
  | { type: "text"; text: string }
  | { type: "image"; base64_image: string; caption?: string }
  | { type: "multimodal"; text: string; images: Image[] };

export interface Image {
  base64_image: string;
  caption?: string;
}

export interface User {
  id: RecordId;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  created_at: Date;
  updated_at: Date;
}
