import { create } from 'zustand';

interface UserState {
  isLogged: boolean;
  activeAnalysis: string | null;
  setAnalysis: (id: string | null) => void;
}

export const useStore = create<UserState>((set) => ({
  isLogged: false,
  activeAnalysis: null,
  setAnalysis: (id) => set({ activeAnalysis: id }),
}));