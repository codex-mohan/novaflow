import { memo } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { LMProviderNode as LMProviderNodeType } from "@/types/nodes"; // Assume you've defined the appropriate types

function LMProviderNode({
  data,
  width,
  height,
  sourcePosition,
  targetPosition,
  selected,
  dragHandle,
  selectable,
  deletable,
  draggable,
  parentId,
}: NodeProps<LMProviderNodeType>) {
  return (
    <div className="shadow-md rounded-md bg-node border border-node/80 text-xs w-[180px]">
      {/* Header */}
      <div className="rounded-t-md px-2 py-1 bg-gradient-to-r from-primary via-secondary to-tertiary text-node-title font-medium">
        {data.title || "LLM Provider"}
      </div>

      {/* Content */}
      <div className="flex flex-col p-2 gap-3 text-node-content">
        {/* Model Provider */}
        <div className="flex flex-col">
          <label htmlFor="modelProvider" className="text-[10px] font-medium">
            Model Provider
          </label>
          <select
            id="modelProvider"
            className="nodrag mt-1 h-8 bg-node border border-node/60 text-font text-node-content rounded-md px-1"
          >
            <option value="local">Local</option>
            <option value="ollama">Ollama</option>
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>

        {/* Server URL */}
        <div className="flex flex-col">
          <label htmlFor="serverUrl" className="text-[10px] font-medium">
            Server URL
          </label>
          <input
            type="url"
            id="serverUrl"
            className="nodrag mt-1 h-6 bg-node border border-node/60 text-node-content text-[10px] rounded-md px-1"
            placeholder="http://localhost:8000"
          />
        </div>

        {/* Top K Slider */}
        <div className="flex flex-col">
          <label htmlFor="topK" className="text-[10px] font-medium">
            Top K
          </label>
          <input
            type="range"
            id="topK"
            min="1"
            max="100"
            defaultValue="10"
            className="nodrag w-full h-2 rounded-full appearance-none bg-gradient-to-r from-primary via-secondary to-tertiary"
          />
        </div>

        {/* Temperature Slider */}
        <div className="flex flex-col">
          <label htmlFor="temperature" className="text-[10px] font-medium">
            Temperature
          </label>
          <input
            type="range"
            id="temperature"
            min="0"
            max="1"
            step="0.01"
            defaultValue="0.7"
            className="nodrag w-full h-2 rounded-full appearance-none bg-gradient-to-r from-primary via-secondary to-tertiary"
          />
        </div>

        {/* Max Tokens Slider */}
        <div className="flex flex-col">
          <label htmlFor="maxTokens" className="text-[10px] font-medium">
            Max Tokens
          </label>
          <input
            type="range"
            id="maxTokens"
            min="1"
            max="4096"
            defaultValue="2048"
            className="w-full h-2 rounded-full appearance-none bg-gradient-to-r from-primary via-secondary to-tertiary"
          />
        </div>
      </div>

      {/* Handles */}
      <Handle
        type="target"
        position={Position.Right}
        className="w-2 h-2 rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary"
      />
      <Handle
        type="source"
        position={Position.Left}
        className="w-2 h-2 rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary"
      />
    </div>
  );
}

export default memo(LMProviderNode);
