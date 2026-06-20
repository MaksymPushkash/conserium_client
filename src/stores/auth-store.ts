"use client";

import { create } from "zustand";

interface AuthState {
  accessToken: string | null;
  hydrated: boolean;
  setSession: (accessToken: string) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  accessToken: null,
  hydrated: false,
  setSession: (accessToken) => set({ accessToken }),
  clearSession: () => set({ accessToken: null }),
  setHydrated: (hydrated) => set({ hydrated }),
}));
