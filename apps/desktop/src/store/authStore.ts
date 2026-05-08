import { create } from 'zustand';

export interface AuthUser {
  id: string;
  email: string;
  displayName?: string;
  timezone: string;
  pictureUrl?: string;
  joinedAt?: string;
}

interface AuthState {
  /** Access token lives in memory ONLY — never persisted to disk */
  accessToken: string | null;
  user: AuthUser | null;
  setSession: (user: AuthUser, accessToken: string) => void;
  setAccessToken: (token: string) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  user: null,
  setSession: (user, accessToken) => set({ user, accessToken }),
  setAccessToken: (token) => set({ accessToken: token }),
  logout: () => set({ accessToken: null, user: null }),
}));
