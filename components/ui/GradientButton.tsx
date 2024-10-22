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
  onClick?: () => void;
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
  onClick,
}) => {
  const gradientClass = viaColor
    ? `bg-gradient-to-r ${fromColor} ${viaColor} ${toColor}`
    : `bg-gradient-to-r ${fromColor} ${toColor}`;

  const hoverGradientClass = viaColor
    ? `group-hover:bg-gradient-to-r group-hover:${fromColor}/80 group-hover:${viaColor}/80 group-hover:${toColor}/80`
    : `group-hover:bg-gradient-to-r group-hover:${fromColor}/80 group-hover:${toColor}/80`;

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
          "relative flex items-center justify-center rounded-lg transition-colors px-6 py-2 duration-300 ease-in-out",
          hoverGradientClass,
          `h-${typeof height === "number" ? height : "full"}`,
          `w-${typeof width === "number" ? width : "full"}`,
          "active:scale-95 active:shadow-inner active:opacity-90 active:brightness-90 transition-transform duration-300 ease-in-out",
          gradientClass,
          color // Pass in color directly (e.g., text-white)
        )}
        onClick={onClick}
      >
        {children}
      </button>
    </div>
  );
};

export default GradientButton;
