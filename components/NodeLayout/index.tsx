"use client";

import { useState, useCallback } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
  type ColorMode,
} from "@xyflow/react";

import { initialNodes, nodeTypes } from "../nodes";
import { initialEdges, edgeTypes } from "../edges";
import { useTheme } from "next-themes";

import "@xyflow/react/dist/style.css";
import "@/app/globals.css";

export default function NodeLayout() {
  const proOptions = { hideAttribution: true };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const setColorMode = useTheme();

  const onConnect = useCallback<OnConnect>(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div className="w-full h-full">
      <ReactFlow
        className="w-full h-full absolute"
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={proOptions}
        colorMode="dark"
        fitView
        attributionPosition="bottom-right"
      >
        <Background className="bg-base" />
        <Controls className="border border-pruple-300" />
        <MiniMap className="bg-base" />
      </ReactFlow>
    </div>
  );
}
