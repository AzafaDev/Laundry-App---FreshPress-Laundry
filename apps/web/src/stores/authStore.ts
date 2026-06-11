import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "../types/user.types";

interface AuthStore {
  user: User | null;
  _hasHydrated: boolean;
  setAuth: (user: User) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<User>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      _hasHydrated: false,
      setAuth: (user) => set({ user }),
      clearAuth: () => set({ user: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
      setHasHydrated: (state) => set({ _hasHydrated: state }),
    }),
    {
      name: "freshpress-auth",
      partialize: (state) => ({ user: state.user }),
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    },
  ),
);
