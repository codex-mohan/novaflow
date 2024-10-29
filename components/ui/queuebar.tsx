"use client";

import React, { useState } from "react";
import Draggable from "react-draggable";
import {
  Play,
  ChevronDown,
  ChevronUp,
  X,
  Square,
  RotateCcw,
} from "lucide-react";

export default function QueueBar() {
  const [count, setCount] = useState(1);

  return (
    <Draggable handle=".drag-handle">
      <div className="fixed top-4 left-4 bg-node-bg text-font rounded-lg shadow-lg flex items-center space-x-2 p-1">
        <div className="drag-handle flex flex-col items-center justify-center px-1 cursor-move">
          <div className="w-2 h-2 bg-font rounded-full mb-1"></div>
          <div className="w-2 h-2 bg-font rounded-full mb-1"></div>
          <div className="w-2 h-2 bg-font rounded-full"></div>
        </div>
        <button className="bg-secondary text-font px-3 py-2 rounded-md flex items-center space-x-2">
          <Play size={23} />
          <span>Queue</span>
          <ChevronDown size={23} />
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-lg font-semibold">{count}</span>
          <div className="flex flex-col">
            <button
              onClick={() => setCount(count + 1)}
              className="text-font/70 hover:text-font"
            >
              <ChevronUp size={23} />
            </button>
            <button
              onClick={() => setCount(Math.max(0, count - 1))}
              className="text-font/70 hover:text-font"
            >
              <ChevronDown size={23} />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-font/70">
          <button className="hover:text-font">
            <X size={23} />
          </button>
          <button className="hover:text-font">
            <Square size={23} />
          </button>
          <button className="hover:text-font">
            <RotateCcw size={23} />
          </button>
        </div>
      </div>
    </Draggable>
  );
}
