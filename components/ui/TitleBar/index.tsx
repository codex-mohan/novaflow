"use client";

import React, { useState } from "react";
import { Minus, X, Square, Settings2 } from "lucide-react"; // Import Lucide Icons
import { getCurrentWindow } from "@tauri-apps/api/window";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SettingsDialog } from "../../dialogs/SettingsModal";

const TitleBar: React.FC<{ title: string; icon: string }> = ({
  title,
  icon,
}) => {
  const appWindow = getCurrentWindow();
  const [settingsOpen, setSettingsOpen] = useState(false);

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

  const openSettings = () => {
    console.log("opening settings...");
    setSettingsOpen(true);
  };

  const isSplashScreen = usePathname();

  if (isSplashScreen !== "/splashscreen") {
    return (
      <section
        className="flex items-center justify-between h-10 bg-base text-font select-none z-50"
        data-tauri-drag-region
      >
        <Image src={icon} alt={title} width={64} height={64} />
        <div className="w-32"></div>

        <div className="absolute left-1/2 transform -translate-x-1/2 pointer-events-none">
          <span className="font-semibold">{title}</span>
        </div>

        <div className="flex space-x-2">
          <button
            className="w-8 h-8 flex items-center justify-center group hover:bg-base-hover transition-all duration-300 ease-in-out"
            onClick={openSettings}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center group hover:bg-base-hover transition-all duration-300 ease-in-out"
            onClick={handleMinimize}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center group hover:bg-base-hover transition-all duration-300 ease-in-out"
            onClick={handleMaximize}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center group hover:bg-red-600 transition-all duration-300 ease-in-out"
            onClick={handleClose}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <SettingsDialog open={settingsOpen} onOpenChange={setSettingsOpen} />
      </section>
    );
  } else {
    return <></>;
  }
};

export default TitleBar;