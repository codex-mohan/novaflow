import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ConversationStore {
  selectedConversationId: number | null;
  setSelectedConversationId: (id: number) => void;
}

const useConversationStore = create<ConversationStore>((set) => ({
  selectedConversationId: null,
  setSelectedConversationId: (id: number) =>
    set({ selectedConversationId: id }),
}));

interface Conversation {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

interface ConversationState {
  conversations: Conversation[]; // Array to hold conversations
  setConversations: (conversations: Conversation[]) => void; // Method to set conversations
  addConversation: (conversation: Conversation) => void; // Method to add a single conversation
  clearConversations: () => void; // Method to clear conversations
}

const useConversationState = create<ConversationState>((set) => ({
  conversations: [], // Initialize conversations state
  setConversations: (conversations) => set({ conversations }), // Set conversations
  addConversation: (conversation) =>
    set((state) => ({
      conversations: [...state.conversations, conversation],
    })), // Add a single conversation
  clearConversations: () => set({ conversations: [] }), // Clear conversations
}));

export default useConversationStore;
