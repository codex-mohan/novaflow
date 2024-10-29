import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { PositionLoggerNode as PositionLoggerType } from "@/types/nodes";

function PositionLoggerNode({
  data,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps<PositionLoggerType>) {
  return (
    <div className="shadow-md rounded-md bg-node-bg border-1 border-gray-700">
      <div className="flex flex-col">
        <div className="rounded-t-md px-2 bg-gradient-to-r from-primary via-secondary to-tertiary text-node-title">
          {data.label}
        </div>
        <div className="text-node-content text-font p-content">
          x: {Math.round(positionAbsoluteX)} y: {Math.round(positionAbsoluteY)}
        </div>
      </div>

      <Handle
        type="target"
        position={Position.Right}
        className="w-16 !bg-red-500"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-16 !bg-teal-500"
      />
    </div>
  );
}

export default memo(PositionLoggerNode);
