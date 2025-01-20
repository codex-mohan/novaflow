import { Plus, X, MoreVertical, Edit, Trash, Download } from "lucide-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "@/hooks/use-toast";
import { nanoid } from "nanoid";

import {
  useConversationState,
  useConversationStore,
} from "@/store/conversation-store";

import { useAuthStore } from "@/store/auth-store";

import { Conversation } from "@/types/conversation";
import GradientButton from "../ui/GradientButton";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMessageStore } from "@/store/messages-store";

interface ConversationListProps {
  onClose: () => void;
}

const ConversationList: React.FC<ConversationListProps> = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [menuVisibleId, setMenuVisibleId] = useState<string | null>(null);

  const { currentConversationId, setCurrentConversationId } =
    useConversationStore();
  const { conversations, getConversationById, setConversations } =
    useConversationState();
  const { getMessages, loadMessages } = useMessageStore();
  const { user } = useAuthStore();

  // Trigger the opening animation after the component mounts
  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 10); // Add a slight delay
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchAndLoadConversations = async () => {
      if (!user?.username) {
        console.warn("User is not authenticated or username is missing.");
        return;
      }

      try {
        const fetchedConversations = await invoke<Conversation[]>(
          "load_conversations",
          { username: user.username }
        );
        setConversations(fetchedConversations);
      } catch (error) {
        console.error("Error fetching conversations:", error);
        setConversations([]);
      }
    };

    fetchAndLoadConversations();
  }, [user?.username, setConversations, setCurrentConversationId]);

  const closeDrawer = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Call the parent-provided onClose with 300ms delay
  };

  const handleCreateConversation = async () => {
    try {
      const username = user?.username;
      const newConversation = await invoke<Conversation>(
        "create_conversation",
        { username, conversation_title: `New Conversation` }
      );
      setConversations([...conversations, newConversation]);
      setCurrentConversationId(newConversation.id.id.String);
      toast({
        title: "Conversation Created",
        description: "A new conversation has been created successfully!",
      });
    } catch (error) {
      console.error("Failed to create a new conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create a new conversation.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteConversation = useCallback(
    async (conversation_id: string) => {
      try {
        await invoke("delete_conversation", { conversation_id });
        toast({
          title: "Conversation Deleted Successfully",
          description:
            "The Selected conversation and its messages are deleted.",
          variant: "success",
        });
        // Remove the conversation from the state
        setConversations(
          conversations.filter((conv) => conv.id.id.String !== conversation_id)
        );
        // Optionally refetch conversations for data consistency
        // fetchAndLoadConversations();
      } catch (error) {
        console.error("Failed to delete conversation:", error);
        toast({
          title: "Error",
          description: "Failed to delete Conversation.",
          variant: "destructive",
        });
      }
    },
    [setConversations, conversations]
  );

  const toggleMenuVisibility = (conversationId: string) => {
    setMenuVisibleId((prev) =>
      prev === conversationId ? null : conversationId
    );
  };

  return (
    <div
      className={`fixed flex flex-col bg-base-secondary text-font w-[30rem] h-full p-4 transition-transform duration-300 ${
        isVisible ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="flex justify-between items-center mb-2">
        <button onClick={closeDrawer}>
          <X />
        </button>
        <GradientButton
          color="text-font"
          fromColor="from-primary"
          viaColor="via-secondary"
          toColor="to-tertiary"
          onClick={handleCreateConversation}
          className="text-lg font-bold rounded-full p-1 hover:bg-primary-dark"
        >
          <Plus />
        </GradientButton>
      </div>
      <h2 className="text-lg font-bold mb-2">Conversations</h2>
      <ul className="h-full mt-2 mb-5 overflow-y-auto">
        {conversations.map((conversation) => (
          <li
            key={conversation.id.id.String}
            className={`group relative p-2 rounded-sm border-font ${
              currentConversationId === conversation.id.id.String
                ? "bg-base-hover"
                : ""
            } hover:bg-base-hover`}
          >
            <div
              className="flex justify-between items-center cursor-pointer"
              onClick={() => {
                loadMessages(conversation.id.id.String);
                console.log(
                  "loading messages: ",
                  JSON.stringify(getMessages())
                );
                setCurrentConversationId(conversation.id.id.String);
                console.log("current conversation id: ", currentConversationId);
              }}
            >
              <div className="flex flex-col">
                <span>{conversation.title}</span>
                <span className="text-sm text-font/40">
                  {conversation.id.id.String}
                </span>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="text-gray-500 hover:text-gray-700"
                    aria-label="Options"
                    onClick={(e) =>
                      toggleMenuVisibility(conversation.id.id.String)
                    }
                  >
                    <MoreVertical />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  onClick={(e) => e.stopPropagation()}
                >
                  <DropdownMenuItem
                    onClick={() =>
                      toast({ title: "Rename", variant: "success" })
                    }
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      toast({ title: "Dump", variant: "destructive" })
                    }
                  >
                    <Download className="mr-2 h-4 w-4 text-green-500" />
                    Dump
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() =>
                      handleDeleteConversation(conversation.id.id.String)
                    }
                  >
                    <Trash className="mr-2 h-4 w-4 text-red-500" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ConversationList;
