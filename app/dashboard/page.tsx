"use client";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { MessageSquare, Share2, Settings, HelpCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Conversation from "@/components/views/Conversation"; // Import the Conversation component
import NodeEditor from "@/components/views/NodeEditor"; // Import the NodeEditor component
import SettingsView from "@/components/views/Settings"; // Import the Settings component
import Help from "@/components/views/Help"; // Import the Help component

export default function Dashboard() {
  const [activeView, setActiveView] = useState("conversation");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const handleIconClick = (name: string) => {
    setActiveView(name);
  };

  return (
    <div
      className="flex overflow-hidden bg-base-secondary text-white"
      style={{
        height: "calc(100vh-2.5rem)",
        width: "calc(100vw)",
      }}
    >
      {/* Side Menu */}
      <div className="w-14 h-full bg-[#181825] flex flex-col items-center py-2 space-y-4">
        {[
          { name: "conversation", icon: MessageSquare },
          { name: "node-editor", icon: Share2 },
          { name: "settings", icon: Settings },
          { name: "help", icon: HelpCircle },
        ].map(({ name, icon: Icon }) => (
          <Button
            key={name}
            variant={activeView === name ? "secondary" : "ghost"}
            size="icon"
            className={`w-10 h-10 rounded-lg ${
              activeView === name ? "bg-[#313244]" : "hover:bg-[#313244]"
            }`}
            onClick={() => handleIconClick(name)}
          >
            <Icon className="h-5 w-5" />
            <span className="sr-only">{name}</span>
          </Button>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative flex-1 flex flex-col h-full">
        <div className="flex-1 overflow-hidden">
          <div className="space-y-4 p-2 mx-auto">
            {activeView === "conversation" && <Conversation />}
            {activeView === "node-editor" && <NodeEditor />}
            {activeView === "settings" && <SettingsView />}
            {activeView === "help" && <Help />}
          </div>
        </div>
      </div>
    </div>
  );
}
