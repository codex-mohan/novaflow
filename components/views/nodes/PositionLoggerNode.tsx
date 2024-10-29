"use client";
import type { Node, NodeProps } from "@xyflow/react";
import { Handle, Position } from "@xyflow/react";
import { useState, useEffect, memo } from "react";

export type PositionLoggerNodeData = {
  label?: string;
};

export type PositionLoggerNode = Node<PositionLoggerNodeData>;

const PositionLoggerNode = ({
  positionAbsoluteX,
  positionAbsoluteY,
  data,
}: NodeProps<PositionLoggerNode>) => {
  const [x, setX] = useState("");
  const [y, setY] = useState("");

  useEffect(() => {
    setX(`${Math.round(positionAbsoluteX)}px`);
    setY(`${Math.round(positionAbsoluteY)}px`);
  });

  return (
    // We add this class to use the same styles as React Flow's default nodes.
    <div className="react-flow__node-default absolute">
      {data.label && <div>{data.label}</div>}

      <div>
        {x} {y}
      </div>

      <Handle type="source" position={Position.Bottom} />
    </div>
  );
};

export default PositionLoggerNode;
