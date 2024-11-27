"use client";

import { memo, useState } from "react";
import { Handle, Position, NodeProps } from "@xyflow/react";
import { LMProviderNode as LMProviderNodeType } from "@/types/nodes";

// Define the position, width, and height for NodeProps
interface LMProviderNodeProps extends NodeProps<LMProviderNodeType> {
  position: { x: number; y: number }; // Required position property
  width: number; // Specify width as required
  height: number; // Specify height as required
}

function LMProviderNode({
  data,
  position,
  width,
  height,
}: LMProviderNodeProps) {
  const [selectedProvider, setSelectedProvider] = useState<string>("local");
  const [topK, setTopK] = useState<number>(10);
  const [temperature, setTemperature] = useState<number>(0.7);
  const [maxTokens, setMaxTokens] = useState<number>(200);

  const handleProviderChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedProvider(e.target.value);
  };

  return (
    <div
      className="shadow-md rounded-md bg-node border-1 border-node/80"
      style={{ position: "absolute", left: position.x, top: position.y }}
    >
      <div className="rounded-t-md px-2 bg-gradient-to-r from-primary via-secondary to-tertiary text-sm">
        <span className="text-node-title">{data.title}</span>
      </div>
      <div className="p-4">
        <div className="mb-3">
          <label
            htmlFor="provider"
            className="text-sm font-medium text-gray-700"
          >
            LLM Provider
          </label>
          <select
            id="provider"
            value={selectedProvider}
            onChange={handleProviderChange}
            className="w-full px-2 py-1 mt-1 rounded-md border border-gray-300"
          >
            <option value="local">Local</option>
            <option value="ollama">Ollama</option>
            <option value="groq">Groq</option>
            <option value="openai">OpenAI</option>
          </select>
        </div>

        <div className="mb-3">
          <label htmlFor="top_k" className="text-sm font-medium text-gray-700">
            Top K
          </label>
          <input
            id="top_k"
            type="number"
            value={topK}
            onChange={(e) => setTopK(parseInt(e.target.value))}
            className="w-full px-2 py-1 mt-1 rounded-md border border-gray-300"
            min="1"
            max="100"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="temperature"
            className="text-sm font-medium text-gray-700"
          >
            Temperature
          </label>
          <input
            id="temperature"
            type="number"
            value={temperature}
            onChange={(e) => setTemperature(parseFloat(e.target.value))}
            step="0.1"
            className="w-full px-2 py-1 mt-1 rounded-md border border-gray-300"
            min="0.0"
            max="2.0"
          />
        </div>

        <div className="mb-3">
          <label
            htmlFor="max_tokens"
            className="text-sm font-medium text-gray-700"
          >
            Max Tokens
          </label>
          <input
            id="max_tokens"
            type="number"
            value={maxTokens}
            onChange={(e) => setMaxTokens(parseInt(e.target.value))}
            className="w-full px-2 py-1 mt-1 rounded-md border border-gray-300"
            min="1"
            max="5000"
          />
        </div>
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

export default memo(LMProviderNode);
