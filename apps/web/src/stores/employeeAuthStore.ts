import { Employee } from "@/types/employee.types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface EmployeeAuthStore {
  user: Employee | null;
  accessToken: string | null;
  setAuth: (user: Employee, accessToken: string) => void;
  clearAuth: () => void;
  updateUser: (partial: Partial<Employee>) => void;
}

export const useEmployeeAuthStore = create<EmployeeAuthStore>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      clearAuth: () => set({ user: null, accessToken: null }),
      updateUser: (partial) =>
        set((state) => ({
          user: state.user ? { ...state.user, ...partial } : null,
        })),
    }),
    {
      name: "freshpress-employee-auth",
      partialize: (state) => ({
        user: state.user,
        accessToken: state.accessToken,
      }),
    },
  ),
);
