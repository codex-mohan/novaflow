import { create } from "zustand";

type ModelsStore = {
  models: string[];
  setModels: (models: string[]) => void;
};

export const useModelsStore = create<ModelsStore>((set) => ({
  models: [],
  setModels: (models) => set({ models }),
}));
