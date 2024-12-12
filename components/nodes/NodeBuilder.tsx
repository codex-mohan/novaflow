import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";

interface NodeInput {
  type: "label" | "text" | "textarea" | "slider" | "dropdown" | "custom";
  label?: string;
  id?: string;
  placeholder?: string;
  options?: string[];
  min?: number;
  max?: number;
  step?: number;
  defaultValue?: number | string;
  html?: string; // For custom HTML elements
}

interface NodeConfig {
  title: string;
  inputs: NodeInput[];
}

interface NodeBuilderProps {
  config: NodeConfig;
}

const NodeBuilder: React.FC<NodeBuilderProps> = ({ config }) => {
  return (
    <div className="shadow-md rounded-md bg-node border border-node/80 text-xs w-[180px]">
      {/* Header */}
      <div className="rounded-t-md px-2 py-1 bg-gradient-to-r from-primary via-secondary to-tertiary text-node-title font-medium">
        {config.title || "Custom Node"}
      </div>

      {/* Content */}
      <div className="flex flex-col p-2 gap-3 text-node-content">
        {config.inputs.map((input, index) => {
          switch (input.type) {
            case "label":
              return (
                <div key={index} className="text-[10px] font-medium">
                  {input.label}
                </div>
              );
            case "text":
              return (
                <div key={index} className="flex flex-col">
                  <label htmlFor={input.id} className="text-[10px] font-medium">
                    {input.label}
                  </label>
                  <input
                    type="text"
                    id={input.id}
                    placeholder={input.placeholder}
                    className="nodrag mt-1 h-6 bg-node border border-node/60 text-node-content text-[10px] rounded-md px-1"
                  />
                </div>
              );
            case "textarea":
              return (
                <div key={index} className="flex flex-col">
                  <label htmlFor={input.id} className="text-[10px] font-medium">
                    {input.label}
                  </label>
                  <textarea
                    id={input.id}
                    placeholder={input.placeholder}
                    className="nodrag mt-1 bg-node border border-node/60 text-node-content text-[10px] rounded-md px-1"
                  />
                </div>
              );
            case "slider":
              return (
                <div key={index} className="flex flex-col">
                  <label htmlFor={input.id} className="text-[10px] font-medium">
                    {input.label}
                  </label>
                  <input
                    type="range"
                    id={input.id}
                    min={input.min}
                    max={input.max}
                    step={input.step}
                    defaultValue={input.defaultValue}
                    className="nodrag w-full h-2 rounded-full appearance-none bg-gradient-to-r from-primary via-secondary to-tertiary"
                  />
                </div>
              );
            case "dropdown":
              return (
                <div key={index} className="flex flex-col">
                  <label htmlFor={input.id} className="text-[10px] font-medium">
                    {input.label}
                  </label>
                  <select
                    id={input.id}
                    className="nodrag mt-1 h-8 bg-node border border-node/60 text-font text-node-content rounded-md px-1"
                  >
                    {input.options?.map((option, i) => (
                      <option key={i} value={option.toLowerCase()}>
                        {option}
                      </option>
                    ))}
                  </select>
                </div>
              );
            case "custom":
              return (
                <div
                  key={index}
                  dangerouslySetInnerHTML={{ __html: input.html || "" }}
                  className="text-node-content"
                />
              );
            default:
              return null;
          }
        })}
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
};

export default memo(NodeBuilder);
