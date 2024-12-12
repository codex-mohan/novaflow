import { NodeTypes } from "@xyflow/react";
import PositionLoggerNode from "./PositionLoggerNode";
import NormalNode from "./NormalNode";
import LMProviderNode from "./LMProviderNode"; // Import the LMProviderNode component

export const initialNodes = [
  {
    id: "1",
    type: "normal",
    position: { x: 0, y: 0 },
    data: { title: "Node 1" },
  },
  {
    id: "2",
    type: "position-logger",
    position: { x: 200, y: 100 },
    data: { label: "Position Logger" },
  },
  {
    id: "3",
    type: "lm-provider", // New node of type "lm-provider"
    position: { x: 400, y: 200 },
    data: { title: "LLM Provider" }, // The title of the LLM provider node
  },
];

export const nodeTypes: NodeTypes = {
  normal: NormalNode,
  "position-logger": PositionLoggerNode,
  "lm-provider": LMProviderNode, // Add LMProviderNode to the nodeTypes mapping
};
