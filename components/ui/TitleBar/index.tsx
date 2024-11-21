"use client";

import React, { useState, useEffect } from "react";
import {
  Minus,
  X,
  Square,
  Settings2,
  Cpu,
  MemoryStick,
  Microchip,
} from "lucide-react"; // Import Lucide Icons
import { getCurrentWindow } from "@tauri-apps/api/window";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { SettingsDialog } from "../../dialogs/SettingsModal";
import { invoke } from "@tauri-apps/api/core";

interface SystemInfo {
  cpu: number;
  ram: number;
  gpu: number;
  vram: number;
}

const TitleBar: React.FC<{ title: string; icon: string }> = ({
  title,
  icon,
}) => {
  const appWindow = getCurrentWindow();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo>({
    cpu: 0,
    ram: 0,
    gpu: 0,
    vram: 0,
  });

  useEffect(() => {
    const updateSystemInfo = async () => {
      try {
        const [cpu, ram, gpu, vram] = await invoke<number[]>(
          "get_system_stats"
        );
        setSystemInfo({ cpu, ram, gpu, vram });
      } catch (error) {
        console.error("Failed to get system info:", error);
      }
    };

    const interval = setInterval(updateSystemInfo, 1000);
    return () => clearInterval(interval);
  }, []);

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

  const getProgressColor = (usage: number) => {
    if (usage < 60) return "stroke-[url(#greenGradient)]";
    if (usage < 80) return "stroke-[url(#yellowGradient)]";
    return "stroke-[url(#redGradient)]";
  };

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

        <div className="flex items-center">
          <div className="flex items-center space-x-3 mr-2">
            {[
              {
                label: "CPU",
                value: systemInfo.cpu,
                icon: <Cpu className="w-3 h-3" />,
                tooltip: "CPU Usage",
              },
              {
                label: "RAM",
                value: systemInfo.ram,
                icon: <MemoryStick className="w-3 h-3" />,
                tooltip: "Memory Usage",
              },
              {
                label: "VRAM",
                value: systemInfo.vram,
                icon: <Microchip className="w-3 h-3" />,
                tooltip: "GPU Memory Usage",
              },
            ].map((resource) => (
              <div key={resource.label} className="relative w-8 h-8 group">
                <svg className="w-8 h-8 -rotate-90">
                  <defs>
                    <linearGradient
                      id={`${resource.label}Gradient`}
                      gradientUnits="userSpaceOnUse"
                      x1="16"
                      y1="32"
                      x2="16"
                      y2="0"
                    >
                      <stop offset="15%" stopColor="#21c5b7" />
                      <stop offset="40%" stopColor="#22c55e" />
                      <stop offset="70%" stopColor="#eab308" />
                      <stop offset="100%" stopColor="#ef4444" />
                    </linearGradient>
                  </defs>
                  <circle
                    className="stroke-base-hover opacity-20"
                    strokeWidth="4"
                    fill="transparent"
                    r="13"
                    cx="16"
                    cy="16"
                  />
                  <circle
                    className="transition-all duration-300"
                    stroke={`url(#${resource.label}Gradient)`}
                    strokeWidth="4"
                    fill="transparent"
                    r="13"
                    cx="16"
                    cy="16"
                    strokeLinecap="round"
                    strokeDasharray={`${(resource.value / 100) * 81.68} 81.68`}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-[8px] font-medium">{resource.icon}</div>
                  <span className="text-[8px] opacity-70">
                    {resource.value.toFixed(1)}%
                  </span>
                </div>
                <div
                  className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 
                  opacity-0 group-hover:opacity-100 transition-opacity duration-200 
                  whitespace-nowrap text-xs bg-base-hover px-2 py-1 rounded"
                >
                  {resource.tooltip}
                </div>
              </div>
            ))}
          </div>

          <button
            className="w-8 h-8 flex items-center justify-center hover:bg-base-hover transition-all duration-300 ease-in-out"
            onClick={openSettings}
          >
            <Settings2 className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center hover:bg-base-hover transition-all duration-300 ease-in-out"
            onClick={handleMinimize}
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center hover:bg-base-hover transition-all duration-300 ease-in-out"
            onClick={handleMaximize}
          >
            <Square className="w-4 h-4" />
          </button>
          <button
            className="w-8 h-8 flex items-center justify-center hover:bg-red-600 transition-all duration-300 ease-in-out"
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
