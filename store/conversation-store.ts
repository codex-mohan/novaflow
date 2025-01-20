import { create } from "zustand";
import { Conversation } from "@/types/conversation";

import { Message, MessageContent } from "@/types/message";

interface ConversationStore {
  currentConversationId: string | null;
  setCurrentConversationId: (id: string) => void;
  getCurrentConversationId: () => string | null; // Getter for currentConversationId
  addMessage: (message: Message) => void; // Placeholder method to add messages
}

export const useConversationStore = create<ConversationStore>((set, get) => ({
  currentConversationId: null,
  setCurrentConversationId: (id: string) => set({ currentConversationId: id }),
  getCurrentConversationId: () => get().currentConversationId, // Getter implementation
  addMessage: (message: Message) =>
    console.log("add message needs to be implemented. Got ", message),
}));

// Define Zustand store for conversations
interface ConversationState {
  conversations: Conversation[]; // Array to hold conversations
  setConversations: (conversations: Conversation[]) => void; // Method to set conversations
  addConversation: (conversation: Conversation) => void; // Method to add a single conversation
  clearConversations: () => void; // Method to clear conversations
  getConversations: () => Conversation[]; // Getter for conversations
  getConversationById: (id: string) => Conversation | undefined; // Method to get a conversation by ID
}

export const useConversationState = create<ConversationState>((set, get) => ({
  conversations: [], // Initially empty array
  setConversations: (conversations) => set({ conversations }),
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, conversation],
    })),
  clearConversations: () => set({ conversations: [] }),
  getConversations: () => get().conversations,
  getConversationById: (id: string) =>
    get().conversations.find((conversation) => conversation.id.id.String === id),
}));
