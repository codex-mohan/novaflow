import type { Node, Position } from "@xyflow/react";

export type NormalNodeData = {
  title: string;
  label: string;
};

export type PositionLoggerData = {
  label: string;
};

export type LMProviderData = {
  id: string;

  title: string;
  modelProvider: "local" | "ollama" | "groq" | "openai"; // LLM provider options
  topK: number; // Top K value
  // Add other relevant LLM settings here
  sourcePosition?: Position;
  targetPosition?: Position;
  width?: number;
  height?: number;
  selected?: boolean;
  dragHandle?: boolean;
  selectable?: boolean;
  deletable?: boolean;
  draggable?: boolean;
  parentId?: string;
};

export type NormalNode = Node<NormalNodeData>;
export type PositionLoggerNode = Node<PositionLoggerData>;
export type LMProviderNode = Node<LMProviderData>;
