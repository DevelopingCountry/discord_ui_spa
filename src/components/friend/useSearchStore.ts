import { create } from "zustand";

type SearchState = {
  searchText: string;
  setSearchText: (text: string) => void;
};
type ActiveState = {
  isActive: string;
  setIsActive: (isActive: string) => void;
};
export const useSearchStore = create<SearchState>((set) => ({
  searchText: "",
  setSearchText: (text) => set({ searchText: text }),
}));

export const useActiveStore = create<ActiveState>((set) => ({
  isActive: "모두",
  setIsActive: (active) => set({ isActive: active }),
}));
