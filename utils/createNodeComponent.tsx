import React from "react";
import { Handle, Position } from "@xyflow/react";
import { useNodeStore } from "@/store/node-store";

// Utility function to evaluate visibility conditions
function evaluateVisibility(visibleWhen: any, data: any): boolean {
  if (!visibleWhen) return true; // If no conditions, render by default

  // Check all conditions in `visibleWhen`
  for (const [key, value] of Object.entries(visibleWhen)) {
    if (Array.isArray(value)) {
      if (!value.includes(data[key])) {
        return false; // Condition not met
      }
    } else if (data[key] !== value) {
      return false; // Condition not met
    }
  }

  return true; // All conditions met
}

// Dynamic node creation function
export function createNodeComponent(nodeData: any) {
  return function DynamicNode({ id, data }: { id: string; data: any }) {
    const updateTextValue = useNodeStore((state) => state.updateTextValue);
    const updateSliderValue = useNodeStore((state) => state.updateSliderValue);

    // Function to handle slider change
    const handleSliderChange = (sliderKey: string, value: number) => {
      updateSliderValue(id, sliderKey, value); // Update the Zustand store
    };

    // Function to handle text input change
    const handleTextChange = (textKey: string, value: string) => {
      updateTextValue(id, textKey, value); // Update the Zustand store
    };

    return (
      <div
        className="shadow-md rounded-md bg-node border border-node/80 text-xs w-[200px]"
        style={{
          maxWidth: "250px",
          width: "max-content",
        }}
      >
        {/* Header */}
        <div className="rounded-t-md px-2 py-1 bg-gradient-to-r from-primary via-secondary to-tertiary text-node-title font-medium">
          {nodeData.title || "Dynamic Node"}
        </div>

        {/* Render UI elements */}
        <div className="flex flex-col p-2 gap-3 text-node-content">
          {nodeData.uiComponents.map((component: any, idx: number) => {
            if (!evaluateVisibility(component.visibleWhen, data)) {
              return null; // Skip if visibility condition is not met
            }

            return (
              <div key={idx} className="flex flex-col gap-1">
                {component.label && (
                  <label
                    htmlFor={component.id}
                    className="nodrag text-[10px] font-medium"
                  >
                    {component.label}
                  </label>
                )}
                {(() => {
                  switch (component.type) {
                    case "text":
                      return (
                        <div key={idx} className="flex flex-col">
                          <input
                            type="text"
                            id={component.id}
                            placeholder={component.placeholder}
                            value={data[component.id] || ""}
                            onChange={(e) =>
                              handleTextChange(component.id, e.target.value)
                            }
                            className="nodrag mt-1 h-6 bg-node border border-node/60 text-node-content text-[10px] rounded-md px-1"
                          />
                        </div>
                      );
                    case "textarea":
                      return (
                        <div key={idx} className="flex flex-col">
                          <label
                            htmlFor={component.id}
                            className="text-[10px] font-medium"
                          >
                            {component.label}
                          </label>
                          <textarea
                            id={component.id}
                            placeholder={component.placeholder}
                            value={
                              data.texts?.[component.id] ||
                              component.defaultValue
                            }
                            onChange={(e) =>
                              handleTextChange(component.id, e.target.value)
                            }
                            className="nodrag mt-1 bg-node border border-node/60 text-node-content text-[10px] rounded-md px-1"
                          />
                        </div>
                      );
                    case "slider":
                      return (
                        <label>
                          <input
                            type="range"
                            id={component.id}
                            min={component.min}
                            max={component.max}
                            step={component.step}
                            value={
                              data.sliders?.[component.id] ||
                              component.defaultValue
                            } // Set value from store or default
                            onChange={(e) => {
                              const value = parseFloat(e.target.value);
                              handleSliderChange(component.id, value); // Update slider value
                            }}
                            className="nodrag w-full h-2 rounded-full appearance-none bg-gradient-to-r from-primary via-secondary to-tertiary"
                          />
                          <span>
                            {data.sliders?.[component.id] ||
                              component.defaultValue}
                          </span>
                        </label>
                      );
                    case "dropdown":
                      return (
                        <select
                          id={component.id}
                          className="nodrag mt-1 h-8 bg-node border border-node/60 text-node-content rounded-md px-1"
                        >
                          {component.options.map(
                            (
                              option: { label: string; value: string },
                              index: number
                            ) => (
                              <option key={index} value={option.value}>
                                {option.label}
                              </option>
                            )
                          )}
                        </select>
                      );
                    case "custom":
                      return (
                        <div
                          dangerouslySetInnerHTML={{ __html: component.html }}
                        />
                      );
                    default:
                      return null;
                  }
                })()}
              </div>
            );
          })}
        </div>

        {/* Handles */}
        <Handle
          type="target"
          position={Position.Left}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary"
        />
        <Handle
          type="source"
          position={Position.Right}
          className="w-2 h-2 rounded-full bg-gradient-to-r from-primary via-secondary to-tertiary"
        />
      </div>
    );
  };
}
