import React from "react";
import { Minus, Maximize2, X, Square } from "lucide-react"; // Import Lucide Icons

const TitleBar: React.FC<{ title: string }> = ({ title }) => {
  return (
    <div className="flex items-center justify-between px-4 h-10 bg-[#2D005E] text-white select-none">
      {/* Empty div to balance the centered title */}
      <div className="w-32"></div>

      {/* Centered title */}
      <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
        <span className="font-semibold">{title}</span>
      </div>

      {/* Window controls */}
      <div className="flex space-x-2">
        {/* Minimize button */}
        <div className="w-8 h-8 flex items-center justify-center">
          <Minus className="w-4 h-4" />
        </div>

        {/* Maximize button */}
        <div className="w-8 h-8 flex items-center justify-center">
          <Maximize2 className="w-4 h-4" />
        </div>

        {/* Custom button for split view */}
        <div className="w-8 h-8 flex items-center justify-center">
          <Square className="w-4 h-4" />
        </div>

        {/* Close button */}
        <div className="w-8 h-8 flex items-center justify-center">
          <X className="w-4 h-4" />
        </div>
      </div>
    </div>
  );
};

export default TitleBar;
