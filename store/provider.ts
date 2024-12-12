import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface ProviderState {
  provider: string;
  setProvider: (provider: string) => void;
}

export const useProviderStore = create<ProviderState>()(
  persist(
    (set) => ({
      provider: "ollama", // Default provider
      setProvider: (provider: string) => set({ provider }),
    }),
    {
      name: "provider-storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
