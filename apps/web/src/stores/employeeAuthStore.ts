import { Employee } from "@/types/employee.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmployeeAuthStore {
  user: Employee | null;
  accessToken: string | null;
  _hasHydrated: boolean;
  setAuth: (user: Employee, accessToken: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<Employee>) => void;
  setHasHydrated: (state: boolean) => void;
}

export const useEmployeeAuthStore = create<EmployeeAuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      _hasHydrated: false,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
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
