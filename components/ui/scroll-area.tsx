import React, { useRef, useEffect } from "react";
import { cn } from "@/lib/utils"; // Adjust path to your cn utility if necessary

interface CustomScrollAreaProps {
  children: React.ReactNode;
  className?: string;
}

const CustomScrollArea = ({ children, className }: CustomScrollAreaProps) => {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const scrollArea = scrollAreaRef.current;
    if (scrollArea) {
      // Optional: Automatically scroll to the bottom when the content updates
      scrollArea.scrollTop = scrollArea.scrollHeight;
    }
  }, [children]);

  return (
    <div
      ref={scrollAreaRef}
      className={cn(
        "relative h-full max-h-screen overflow-y-auto scroll-smooth scrollbar-thin scrollbar-thumb-blue-600 scrollbar-track-gray-300 scrollbar-thumb-rounded-full scrollbar-track-rounded-full",
        className // Pass className to allow external customization
      )}
    >
      {children}
    </div>
  );
};

export default CustomScrollArea;
