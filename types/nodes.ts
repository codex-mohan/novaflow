import type { Node } from "@xyflow/react";

export type NormalNodeData = {
  title: string;
  label: string;
};

export type PositionLoggerData = {
  label: string;
};

export type NormalNode = Node<NormalNodeData>;
export type PositionLoggerNode = Node<PositionLoggerData>;
