"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";

interface AuthState {
  accessToken: string | null;
  hydrated: boolean;
  setSession: (accessToken: string) => void;
  clearSession: () => void;
  setHydrated: (hydrated: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      hydrated: false,
      setSession: (accessToken) => set({ accessToken }),
      clearSession: () => set({ accessToken: null }),
      setHydrated: (hydrated) => set({ hydrated }),
    }),
    {
      name: "cortex-session",
      partialize: (state) => ({ accessToken: state.accessToken }),
      onRehydrateStorage: () => (state) => {
        state?.setHydrated(true);
      },
      merge: (persistedState, currentState) => {
        const persisted = persistedState as Partial<AuthState> | undefined;
        return { ...currentState, accessToken: persisted?.accessToken ?? null };
      },
    },
  ),
);
