"use client";

import { useState, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  MessageSquare,
  Share2,
  Settings,
  HelpCircle,
  User2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import Conversation from "@/components/views/Conversation"; // Import the Conversation component
import NodeEditor from "@/components/views/NodeEditor"; // Import the NodeEditor component
import SettingsView from "@/components/views/Settings"; // Import the Settings component
import Help from "@/components/views/Help"; // Import the Help component
import { UserMenu } from "@/components/menus/UserMenu";
import { useAuthStore } from "@/store/auth-store";
import { useRouter } from "next/navigation";
import React from "react";
import { Position } from "@xyflow/react";

const Dashboard = () => {
  const [activeView, setActiveView] = useState("conversation");
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { toast } = useToast();

  const handleIconClick = useCallback((name: string) => {
    setActiveView(name);
  }, []);

  const handleUserMenu = (option: string) => {
    switch (option) {
      case "logout":
        useAuthStore.getState().logout();
        router.push("/auth/signin");
        toast({
          title: "Logged out",
          description: "You have been successfully logged out.",
        });
        break;
    }
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
      <div
        id="side-menu"
        className="w-14 h-full bg-[#181825] flex flex-col items-center py-2 space-y-4"
      >
        {[
          { name: "conversation", icon: MessageSquare, position: "top" },
          { name: "node-editor", icon: Share2, position: "top" },
          { name: "settings", icon: Settings, position: "top" },
          { name: "help", icon: HelpCircle, position: "top" },
          { name: "user", icon: User2, position: "bottom" },
        ].map(({ name, icon: Icon, position }) => (
          <div
            key={name}
            className={`flex justify-content-between ${
              position === "bottom" ? "items-end flex-grow" : ""
            }`}
          >
            {name !== "user" && (
              <Button
                key={name}
                variant={activeView === name ? "secondary" : "ghost"}
                size="icon"
                className={`w-10 h-10 rounded-lg ${
                  activeView === name ? "bg-[#313244]" : "hover:bg-[#313244]"
                } ${position === "top" ? "" : "self-end"}`}
                onClick={() => handleIconClick(name)}
              >
                <Icon className="h-5 w-5" />
                <span className="sr-only">{name}</span>
              </Button>
            )}
            {name === "user" && <UserMenu onSelect={handleUserMenu} />}
          </div>
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
};

export default React.memo(Dashboard);
