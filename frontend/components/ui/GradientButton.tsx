"use client";

import React from "react";
import { cn } from "@/lib/utils";

interface GradientButtonProps {
  children: React.ReactNode;
  className?: string;
  width?: number | "full"; // Accepts width as number or 'full' (full-width)
  height?: number | "full"; // Accepts height as number or 'full' (full-height)
  type?: "button" | "reset" | "submit"; // Button type prop
  color: string; // Text color (Tailwind color class like 'text-white')
  fromColor: string; // Full Tailwind class for 'from' (e.g., 'from-purple-600')
  viaColor?: string; // Optional Tailwind class for 'via' (e.g., 'via-pink-600')
  toColor: string; // Full Tailwind class for 'to' (e.g., 'to-pink-600')
}

const GradientButton: React.FC<GradientButtonProps> = ({
  children,
  className = "",
  height = "12", // Default height (can be overwritten by number or 'full')
  width = "48", // Default width (can be overwritten by number or 'full')
  color,
  type = "button",
  fromColor,
  viaColor,
  toColor,
}) => {
  const gradientClass = viaColor
    ? `bg-gradient-to-r ${fromColor} ${viaColor} ${toColor}`
    : `bg-gradient-to-r ${fromColor} ${toColor}`;

  return (
    <div className={cn("relative group", className)}>
      <div
        className={cn(
          "absolute -inset-2 rounded-lg opacity-0 transition-opacity duration-300 ease-in-out group-hover:opacity-75 blur-lg",
          gradientClass
        )}
      ></div>
      <button
        type={type}
        className={cn(
          "relative flex items-center justify-center rounded-lg transition-colors px-6 py-2 duration-300 ease-in-out group-hover:bg-slate-800",
          `h-${typeof height === "number" ? height : "full"}`,
          `w-${typeof width === "number" ? width : "full"}`,
          gradientClass,
          color // Pass in color directly (e.g., text-white)
        )}
      >
        {children}
      </button>
    </div>
  );
};

export default GradientButton;
