import { Employee } from "@/types/employee.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmployeeAuthStore {
  user: Employee | null;
  _hasHydrated: boolean;
  setAuth: (user: Employee) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<Employee>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useEmployeeAuthStore = create<EmployeeAuthStore>()(
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
      name: "freshpress-employee-auth",
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  ),
);