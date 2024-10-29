"use client";

import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";

export type NormalNodeData = {
  title: string;
};

export type NormalNode = Node<NormalNodeData>;

export default function NormalNode({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
}: NodeProps<NormalNode>) {
  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="absolute rounded-lg bg-base">
      <div className="bg-gradient-to-r from-primary via-secondary to-tertiary text-sm">
        {data.title}
      </div>
      <div className="flex justify-center flex-1 p-3">Content</div>
      <Handle type="source" position={Position.Left} />
      <Handle type="target" position={Position.Right} />
    </div>
  );
}
