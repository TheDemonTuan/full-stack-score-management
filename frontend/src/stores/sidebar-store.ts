import { create } from "zustand";

interface SideBarState {
  isOpen: boolean;
  setIsOpen: (by: boolean) => void;
}

export const useSideBarStore = create<SideBarState>()((set) => ({
  isOpen: false,
  setIsOpen: (by) => set({ isOpen: by}),
}));
