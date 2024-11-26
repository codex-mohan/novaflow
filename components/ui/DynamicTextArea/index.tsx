// components/DynamicTextarea.tsx
import React, { useState, useRef, useEffect, useCallback } from "react";

export default function DynamicTextarea() {
  const [input, setInput] = useState(""); // Manage the textarea value
  const textareaRef = useRef<HTMLTextAreaElement | null>(null); // Ref for direct DOM manipulation

  const resizeTextarea = useCallback(() => {
    if (textareaRef.current) {
      const maxHeight = window.innerHeight * 0.3; // Max height is 30% of the viewport height
      textareaRef.current.style.height = "auto"; // Reset height to calculate correctly
      const newHeight = Math.min(textareaRef.current.scrollHeight, maxHeight);
      textareaRef.current.style.height = `${newHeight}px`; // Set to calculated height
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const value = e.target.value;
      setInput(value);

      // Resize textarea
      requestAnimationFrame(() => resizeTextarea());
    },
    [resizeTextarea]
  );

  useEffect(() => {
    resizeTextarea();
  }, [resizeTextarea]);

  return (
    <textarea
      ref={textareaRef}
      value={input}
      onChange={handleInputChange}
      placeholder="Type your message here..."
      spellCheck="true"
      className={`block w-full resize-none bg-inherit text-font border border-purple-300 border-opacity-30 
      focus:outline-none focus:ring-2 focus:ring-secondary/50 placeholder-purple-200/60 transition-shadow duration-300 
      ease-in-out hover:shadow-lg hover:shadow-secondary/40 overflow-y-auto p-3 rounded-md 
      min-h-[40px] sm:min-h-[60px] md:min-h-[80px] max-h-[30vh]`}
      style={{
        height: "auto",
      }}
    />
  );
}
