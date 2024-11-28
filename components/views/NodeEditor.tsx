"use client";

import { useState } from "react";
import { useNodeStore } from "@/store/node-store";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  ReactFlowProvider,
} from "@xyflow/react";
import { Button } from "../ui/button";

import { initialNodes } from "@/components/nodes";

import "@xyflow/react/dist/style.css";
import "@/app/globals.css";

export default function NodeLayout() {
  const [selectedNodeType, setSelectedNodeType] =
    useState<string>("llm-provider");
  const {
    nodes,
    edges,
    nodeTypes,
    onNodesChange,
    onEdgesChange,
    addNode,
    registerNodeType,
  } = useNodeStore();

  const proOptions = { hideAttribution: true };

  const handleLoadNode = async () => {
    const nodeData = getNodeData(selectedNodeType);

    if (nodeData) {
      registerNodeType(selectedNodeType, nodeData.data);
      addNode(nodeData);
    }
  };

  // Helper function to get the node data for the selected type
  const getNodeData = (nodeType: string) => {
    switch (nodeType) {
      case "llm-provider":
        return {
          id: "4",
          type: "llm-provider",
          position: { x: 300, y: 300 },
          data: {
            title: "LLM Provider",
            uiComponents: [
              {
                type: "dropdown",
                id: "modelProvider",
                label: "Model Provider",
                options: [
                  { label: "Local", value: "local" },
                  { label: "Ollama", value: "ollama" },
                  { label: "Groq", value: "groq" },
                  { label: "OpenAI", value: "openai" },
                ],
                defaultValue: "local",
              },
              {
                type: "text",
                id: "serverUrl",
                label: "Server URL",
                placeholder: "http://localhost:8000",
                visibleWhen: { modelProvider: ["local"] },
              },
              {
                type: "slider",
                id: "topK",
                label: "Top K",
                min: 1,
                max: 100,
                defaultValue: 10,
              },
              {
                type: "slider",
                id: "temperature",
                label: "Temperature",
                min: 0.0,
                max: 1.0,
                step: 0.01,
                value: 0,
                defaultValue: 0.7,
              },
              {
                type: "slider",
                id: "maxTokens",
                label: "Max Tokens",
                min: 1,
                max: 4096,
                value: 0,
                defaultValue: 2048,
              },
              {
                type: "textarea",
                id: "apiKey",
                label: "API Key",
                placeholder: "Enter API Key",
                visibleWhen: { modelProvider: ["ollama", "groq", "openai"] },
              },
            ],
          },
        };
      case "model-provider":
        return {
          id: "5",
          type: "model-provider",
          position: { x: 500, y: 400 },
          data: {
            title: "Model Provider",
            uiComponents: [
              {
                type: "dropdown",
                id: "modelType",
                label: "Select AI Model",
                options: [
                  { label: "GPT-3", value: "gpt-3" },
                  { label: "BERT", value: "bert" },
                  { label: "T5", value: "t5" },
                ],
                defaultValue: "gpt-3",
              },
              {
                type: "text",
                id: "modelDescription",
                label: "Model Description",
                placeholder: "Enter Model Description",
              },
            ],
          },
        };
      case "data-fetcher":
        return {
          id: "6",
          type: "data-fetcher",
          position: { x: 700, y: 500 },
          data: {
            title: "Data Fetcher",
            uiComponents: [
              {
                type: "dropdown",
                id: "fetchMethod",
                label: "Select Fetch Method",
                options: [
                  { label: "GET", value: "get" },
                  { label: "POST", value: "post" },
                ],
                defaultValue: "get",
              },
              {
                type: "text",
                id: "apiEndpoint",
                label: "API Endpoint",
                placeholder: "https://api.example.com/data",
              },
            ],
          },
        };
      case "response-processor":
        return {
          id: "7",
          type: "response-processor",
          position: { x: 900, y: 600 },
          data: {
            title: "Response Processor",
            uiComponents: [
              {
                type: "slider",
                id: "processingSpeed",
                label: "Processing Speed",
                min: 1,
                max: 100,
                defaultValue: 50,
              },
              {
                type: "textarea",
                id: "transformRules",
                label: "Transformation Rules",
                placeholder: "Define transformation rules here...",
              },
            ],
          },
        };
      default:
        return null;
    }
  };

  return (
    <div className="h-full w-full absolute flex flex-col justify-center align-middle">
      <div className="flex justify-between mb-3 mt-3 px-3">
        <select
          value={selectedNodeType}
          onChange={(e) => setSelectedNodeType(e.target.value)}
          className="p-2 border bg-base-secondary text-font border-font rounded"
        >
          <option value="llm-provider">LLM Provider</option>
          <option value="model-provider">Model Provider</option>
          <option value="data-fetcher">Data Fetcher</option>
          <option value="response-processor">Response Processor</option>
        </select>
        <Button onClick={handleLoadNode}>Add Node</Button>
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        proOptions={proOptions}
        colorMode="dark"
        fitView
        attributionPosition="bottom-left"
      >
        <Background />
        <Controls className="border border-purple-300" />
        <MiniMap className="bg-base" />
      </ReactFlow>
    </div>
  );
}
