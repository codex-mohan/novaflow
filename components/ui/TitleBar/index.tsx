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
import { listen } from "@tauri-apps/api/event";
import { SettingsDialog } from "../../dialogs/SettingsModal";
import Image from "next/image";

type statsPayload = {
  cpu: number;
  ram: number;
  vram: number;
};

const TitleBar: React.FC<{ title: string; icon: string }> = ({
  title,
  icon,
}) => {
  const appWindow = getCurrentWindow();
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Function to update stroke-dasharray dynamically
  const updateCircleStroke = (id: string, value: number) => {
    const circle = document.querySelector(`#${id}-circle`);
    if (circle) {
      // Calculate stroke-dasharray as a percentage of the circle's circumference
      const dashArray = (value / 100) * 81.68; // 81.68 is the circumference of the circle
      console.log(
        `Updating circle ${id} with value: ${value}, dashArray: ${dashArray}`
      );
      circle.setAttribute("stroke-dasharray", `${dashArray} 81.68`);
    } else {
      console.error(`Circle with id ${id} not found`);
    }
  };

  // Start listening for resource stats immediately
  useEffect(() => {
    const updateResourceStats = (payload: statsPayload) => {
      // Update text content
      document.getElementById(
        "cpu-usage"
      )!.textContent = `${payload.cpu.toFixed(1)}%`;
      document.getElementById(
        "ram-usage"
      )!.textContent = `${payload.ram.toFixed(1)}%`;
      document.getElementById(
        "vram-usage"
      )!.textContent = `${payload.vram.toFixed(1)}%`;

      // Update circles with new values
      updateCircleStroke("cpu-usage", payload.cpu);
      updateCircleStroke("ram-usage", payload.ram);
      updateCircleStroke("vram-usage", payload.vram);
    };

    const unsubscribe = listen<statsPayload>("resource-stats", (event) => {
      console.log("Resource stats received:", event.payload);
      updateResourceStats(event.payload);
    });

    return () => {
      unsubscribe.then((unsub) => unsub());
    };
  }, []);

  const handleMinimize = () => appWindow.minimize();
  const handleMaximize = () => appWindow.toggleMaximize();
  const handleClose = () => appWindow.close();

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
              id: "cpu-usage",
              icon: <Cpu className="w-3 h-3" />,
              tooltip: "CPU Usage",
            },
            {
              label: "RAM",
              id: "ram-usage",
              icon: <MemoryStick className="w-3 h-3" />,
              tooltip: "Memory Usage",
            },
            {
              label: "VRAM",
              id: "vram-usage",
              icon: <Microchip className="w-3 h-3" />,
              tooltip: "GPU Memory Usage",
            },
          ].map((resource) => (
            <div
              id={resource.id + "-div"}
              key={resource.label}
              className="relative w-8 h-8 group"
            >
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
                  id={resource.id + "-circle"}
                  className="transition-all duration-300"
                  stroke={`url(#${resource.label}Gradient)`}
                  strokeWidth="4"
                  fill="transparent"
                  r="13"
                  cx="16"
                  cy="16"
                  strokeLinecap="round"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-[8px] font-medium">{resource.icon}</div>
                <span id={resource.id} className="text-[8px] opacity-70"></span>
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
          onClick={() => setSettingsOpen(true)}
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
      <SettingsDialog
        open={settingsOpen}
        onOpenChange={(open) => setSettingsOpen(open)}
      />
    </section>
  );
};

export default TitleBar;
