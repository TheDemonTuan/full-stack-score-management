import { create } from "zustand";

interface ModalState {
  modelKey: string;
  modalData: any;
  modalOpen: (key: string) => void;
  modalClose: () => void;
  setModalData: <T = any>(data: T) => void;
}

export const useModalStore = create<ModalState>()((set) => ({
  modelKey: "",
  modalData: {},
  modalOpen: (key) => set({ modelKey: key }),
  modalClose: () => set({ modelKey: "" }),
  setModalData: (data) => set({ modalData: data }),
}));
