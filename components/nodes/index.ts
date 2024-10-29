import { NodeTypes } from "@xyflow/react";
import PositionLoggerNode from "./PositionLoggerNode";
import NormalNode from "./NormalNode";

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
];

export const nodeTypes: NodeTypes = {
  normal: NormalNode,
  "position-logger": PositionLoggerNode,
};
