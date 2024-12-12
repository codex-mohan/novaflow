"use client";

import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { NormalNode as NormalNodeType } from "@/types/nodes";

function NormalNode({ data }: NodeProps<NormalNodeType>) {
  return (
    <div className="shadow-md rounded-md bg-node border-1 border-node/80">
      <div className="rounded-t-md px-2 bg-gradient-to-r from-primary via-secondary to-tertiary text-sm">
        <span className="text-node-title">{data.title}</span>
      </div>
      <div className="flex justify-center flex-1 p-content text-node-content">
        Content
      </div>

      <Handle
        type="target"
        position={Position.Right}
        className="w-2 h-2 rounded-full !bg-gradient-to-r from-primary via-secondary to-tertiary"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-2 h-2 rounded-full !bg-gradient-to-r from-primary via-secondary to-tertiary"
      />
    </div>
  );
}

export default memo(NormalNode);
