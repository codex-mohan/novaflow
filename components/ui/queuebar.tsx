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
      <div className="fixed top-4 left-4 bg-primary text-white rounded-lg shadow-lg flex items-center space-x-2 p-1">
        <div className="drag-handle flex flex-col items-center justify-center px-1 cursor-move">
          <div className="w-1 h-1 bg-gray-500 rounded-full mb-1"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full mb-1"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
        <button className="bg-blue-500 text-white px-3 py-1 rounded-md flex items-center space-x-1">
          <Play size={16} />
          <span>Queue</span>
          <ChevronDown size={16} />
        </button>
        <div className="flex items-center space-x-1">
          <span className="text-lg font-semibold">{count}</span>
          <div className="flex flex-col">
            <button
              onClick={() => setCount(count + 1)}
              className="text-gray-400 hover:text-white"
            >
              <ChevronUp size={16} />
            </button>
            <button
              onClick={() => setCount(Math.max(0, count - 1))}
              className="text-gray-400 hover:text-white"
            >
              <ChevronDown size={16} />
            </button>
          </div>
        </div>
        <div className="flex items-center space-x-2 text-gray-400">
          <button className="hover:text-white">
            <X size={16} />
          </button>
          <button className="hover:text-white">
            <Square size={16} />
          </button>
          <button className="hover:text-white">
            <RotateCcw size={16} />
          </button>
        </div>
      </div>
    </Draggable>
  );
}
