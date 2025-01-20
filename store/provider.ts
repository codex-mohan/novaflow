import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type ProviderType = {
  provider: "ollama" | "openai" | "groq";
};

interface ProviderState {
  provider: ProviderType;
  setProvider: (provider: ProviderType) => void;
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      provider: { provider: "ollama" }, // Default provider
      setProvider: (provider) => set({ provider: provider }),
    }),
    {
      name: "provider-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
