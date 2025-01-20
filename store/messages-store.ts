import { create } from "zustand";
import { Message, FetchedMessage } from "@/types/message";
import { invoke } from "@tauri-apps/api/core";

type FetchedMessages = {
  messages: FetchedMessage[];
};

interface MessageState {
  messages: Message[];
  loading: boolean;
  setMessages: (messages: Message[]) => void;
  addMessage: (message: Message) => void;
  setMessage: (
    messageId: string,
    updateFn: (message: Message) => Message
  ) => void;
  clearMessages: () => void;
  getMessages: () => Message[];
  loadMessages: (
    conversationId: string,
    callback?: () => void
  ) => Promise<void>; // Add optional callback
}

export const useMessageStore = create<MessageState>((set, get) => ({
  messages: [],
  loading: false,
  setMessages: (messages) => {
    console.log("Setting messages:", messages);
    set({ messages });
  },
  addMessage: (message) => {
    console.log("Adding message:", message);
    set((state) => ({
      messages: [...state.messages, message],
    }));
  },
  setMessage: (messageId, updateFn) => {
    // console.log("Updating message:", messageId, updateFn),
    set((state) => ({
      messages: state.messages.map((m) =>
        m.message_id === messageId ? updateFn(m) : m
      ),
    }));
  },
  clearMessages: () => {
    console.log("Clearing messages");
    set({ messages: [] });
  },
  getMessages: () => get().messages,
  loadMessages: async (conversationId: string, callback?: () => void) => {
    set({ loading: true }); // Set loading to true when fetching starts

    try {
      const fetchedMessages = await invoke<FetchedMessages[]>(
        "get_messages_from_conversation",
        {
          conversation_id: conversationId,
        }
      );

      console.log("Fetched messages:", fetchedMessages);

      const processedMessages: Message[] = fetchedMessages[0].messages.map(
        (message) => {
          return {
            ...message,
            timestamp: new Date(message.timestamp),
            created_at: new Date(message.timestamp),
          };
        }
      );

      // Update the state synchronously
      set({ messages: processedMessages, loading: false });

      // Execute the callback if provided
      if (callback) {
        callback();
      }

      console.log("Updated messages:", get().messages);
    } catch (error) {
      console.error("Failed to load messages:", error);
      set({ messages: [], loading: false }); // Handle error and set loading to false
    }
  },
}));
