// node-store.ts
import { createWithEqualityFn } from "zustand/traditional";
import { nanoid } from "nanoid";
import { shallow } from "zustand/shallow";
import { createNodeComponent } from "@/utils/createNodeComponent";
import {
  type NodeChange,
  type EdgeChange,
  type Node,
  type Edge,
  applyNodeChanges,
  applyEdgeChanges,
} from "@xyflow/react";

import { nodeTypes as DefaultNodeTypes } from "@/components/nodes";

interface DynamicNodeType {
  id: string;
  type: string;
  data: any; // Adjust the type of `data` based on your application
  position: { x: number; y: number };
}

// Define types for nodes and edges
export type NodeType = Node<any>; // Generic node with dynamic data
export type EdgeType = Edge<any>; // Generic edge with dynamic data

interface NodeStoreState {
  updateSliderValue: any;
  updateTextValue: any; // Added for text fields
  updateTextareaValue: any; // Added for textarea fields
  nodes: DynamicNodeType[];
  edges: EdgeType[];
  nodeTypes: Record<string, React.ComponentType<any>>;
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  addNode: (node: DynamicNodeType) => void;
  addEdge: (edge: EdgeType) => void;
  deleteNode: (id: string) => void;
  registerNodeType: (nodeType: string, nodeData: any) => void;
}

export const useNodeStore = createWithEqualityFn<NodeStoreState>(
  (set, get) => ({
    nodes: [
      {
        id: "1",
        type: "normal",
        position: { x: 0, y: 0 },
        data: { title: "Node 1", text: "", textarea: "" }, // Default text and textarea values
      },
      {
        id: "2",
        type: "position-logger",
        position: { x: 200, y: 100 },
        data: { label: "Position Logger", text: "", textarea: "" },
      },
      {
        id: "3",
        type: "lm-provider",
        position: { x: 400, y: 200 },
        data: { title: "LLM Provider", text: "", textarea: "" }, // Default text and textarea values
      },
    ],
    edges: [],
    nodeTypes: { ...DefaultNodeTypes },

    // Update method for sliders
    updateSliderValue: (nodeId: string, sliderKey: string, value: number) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  sliders: {
                    ...node.data.sliders,
                    [sliderKey]: value, // Update the slider value
                  },
                },
              }
            : node
        ),
      }));
    },

    // Update method for text fields
    updateTextValue: (nodeId: string, textKey: string, value: string) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  [textKey]: value, // Update the text value
                },
              }
            : node
        ),
      }));
    },

    // Update method for textarea fields
    updateTextareaValue: (
      nodeId: string,
      textareaKey: string,
      value: string
    ) => {
      set((state) => ({
        nodes: state.nodes.map((node) =>
          node.id === nodeId
            ? {
                ...node,
                data: {
                  ...node.data,
                  [textareaKey]: value, // Update the textarea value
                },
              }
            : node
        ),
      }));
    },

    onNodesChange: (changes) => {
      set((state) => ({
        nodes: applyNodeChanges(changes, state.nodes) as DynamicNodeType[],
      }));
    },
    onEdgesChange: (changes) => {
      set((state) => ({
        edges: applyEdgeChanges(changes, state.edges),
      }));
    },
    addNode: (node) => {
      set((state) => ({
        nodes: [...state.nodes, { ...node, id: nanoid() }],
      }));
    },
    addEdge: (edge) => {
      set((state) => ({
        edges: [...state.edges, { ...edge, id: nanoid() }],
      }));
    },
    deleteNode: (id) => {
      set((state) => ({
        nodes: state.nodes.filter((node) => node.id !== id),
        edges: state.edges.filter(
          (edge) => edge.source !== id && edge.target !== id
        ),
      }));
    },
    registerNodeType: (nodeType, nodeData) => {
      const newNodeComponent = createNodeComponent(nodeData);
      set((state) => ({
        nodeTypes: { ...state.nodeTypes, [nodeType]: newNodeComponent },
      }));
    },
  }),

  shallow
);
