"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  setSession: (accessToken: string) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      setSession: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: null }),
    }),
    {
      name: "cortex-session",
      partialize: (state) => ({ accessToken: state.accessToken }),
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState> | undefined;
        return { ...currentState, accessToken: persisted?.accessToken ?? null };
      },
    },
  ),
);
