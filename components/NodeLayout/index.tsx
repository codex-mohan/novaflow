"use client";

import { useCallback } from "react";
import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  addEdge,
  useNodesState,
  useEdgesState,
  type OnConnect,
} from "@xyflow/react";

import { initialNodes, nodeTypes } from "../nodes";
import { initialEdges, edgeTypes } from "../edges";

import "@xyflow/react/dist/style.css";

export default function NodeLayout() {
  const proOptions = { hideAttribution: true };

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  const onConnect = useCallback<OnConnect>(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        proOptions={proOptions}
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