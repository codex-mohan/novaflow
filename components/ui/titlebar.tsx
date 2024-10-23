"use client";

import React from "react";
import { Minus, X, Square } from "lucide-react"; // Import Lucide Icons
import { getCurrentWindow } from "@tauri-apps/api/window";
import { usePathname } from "next/navigation";

const TitleBar: React.FC<{ title: string }> = ({ title }) => {
  const appWindow = getCurrentWindow();

  const handleMinimize = () => {
    console.log("Minimize");
    appWindow.minimize();
  };
  const handleMaximize = () => {
    console.log("Maximize");
    appWindow.toggleMaximize();
  };
  const handleClose = () => {
    console.log("Close");
    appWindow.close();
  };

  const isSplashScreen = usePathname();

  if (isSplashScreen !== "/splashscreen") {
    return (
      <section
        className="flex items-center justify-between px-4 h-10 bg-primary text-white select-none"
        data-tauri-drag-region
      >
        {/* Empty div to balance the centered title */}
        <div className="w-32"></div>

        {/* Centered title */}
        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <span className="font-semibold">{title}</span>
        </div>

        {/* Window controls */}
        <div className="flex space-x-2">
          {/* Minimize button */}
          <button
            className="w-8 h-8 flex items-center justify-center group"
            onClick={handleMinimize}
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Maximize button */}
          <button
            className="w-8 h-8 flex items-center justify-center group"
            onClick={handleMaximize}
          >
            <Square className="w-4 h-4" />
          </button>

          {/* Close button */}
          <button
            className="w-8 h-8 flex items-center justify-center group"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </section>
    );
  } else {
    return <></>;
  }
};

export default TitleBar;
