import { create } from "zustand";

interface PathNameState {
  title: string;
  current: string;
  split: string[];
  changeCurrent: (by: string) => void;
  changeTitle: (by: string) => void;
}

export const usePathNameStore = create<PathNameState>()((set) => ({
  title: "",
  current: "/",
  split: [],
  changeCurrent: (by) => set((state) => ({ current: by, split: by.split("/").filter((item) => item !== "")})),
  changeTitle: (by) => set((state) => ({ title: by })),
}));
