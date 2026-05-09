import { create } from 'zustand';

interface NavState {
  path: string;
  navigate: (to: string) => void;
}

export const useNavStore = create<NavState>((set) => ({
  path: '/',
  navigate: (to) => set({ path: to }),
}));
