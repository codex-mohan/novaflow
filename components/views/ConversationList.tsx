import { X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";
import useConversationStore from "@/store/conversation-store"; // Import the Zustand store

interface ConversationListProps {
  onClose: () => void; // Function to close the conversation list
}

const ConversationList: React.FC<ConversationListProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const listRef = useRef<HTMLDivElement>(null); // Ref for the conversation list
  const { selectedConversationId, setSelectedConversationId } =
    useConversationStore(); // Use Zustand store

  // Sample data for conversations (you can replace this with actual data)
  const conversations = [
    { id: 1, title: "Conversation 1" },
    { id: 2, title: "Conversation 2" },
    { id: 3, title: "Conversation 3" },
  ];

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Delay closing the component to allow animation to finish
  };

  useEffect(() => {
    setIsVisible(true); // Show the list when the component mounts

    const handleClickOutside = (event: MouseEvent) => {
      if (listRef.current && !listRef.current.contains(event.target as Node)) {
        handleClose(); // Close if clicked outside
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div
      ref={listRef}
      className={`flex flex-col bg-base-secondary text-font w-80 h-full p-4 transition-transform duration-300 ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <button
        onClick={handleClose}
        className="mb-2 justify-items-center align-middle"
      >
        <X className="w-full" />
      </button>
      <h2 className="text-lg font-bold mb-2">Conversations</h2>
      <ul className="space-y-2">
        {conversations.map((conversation) => (
          <li
            key={conversation.id}
            className={`p-2 rounded-sm border-font ${
              selectedConversationId === conversation.id ? "bg-base-hover" : "" // Highlight selected
            } hover:bg-base-hover`} // Add hover effect
            onClick={() => {
              setSelectedConversationId(conversation.id);
              handleClose();
            }} // Set selected conversation
          >
            {conversation.title}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
