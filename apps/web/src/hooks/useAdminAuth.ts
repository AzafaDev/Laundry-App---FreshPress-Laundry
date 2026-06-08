// src/hooks/useAdminAuth.ts
// Login hook scoped to admin roles only (super_admin, outlet_admin).
// Rejects workers/drivers with a friendly error instead of redirecting them.

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  employeeAuthService,
  type EmployeeLoginPayload,
} from "@/services/employeeAuth.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import type { EmployeeRole } from "@/types/employee.types";

const ADMIN_ROLES: EmployeeRole[] = ["super_admin", "outlet_admin"];

const getDashboardPath = (role: EmployeeRole): string => {
  switch (role) {
    case "super_admin":
      return "/dashboard/admin";
    case "outlet_admin":
      return "/dashboard/outlet-admin";
    default:
      return "/employee/login";
  }
};

export const useAdminAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useEmployeeAuthStore();

  const loginMutation = useMutation({
    mutationFn: async (payload: EmployeeLoginPayload) => {
      const data = await employeeAuthService.login(payload);

      // Role check — reject non-admin accounts immediately.
      if (!ADMIN_ROLES.includes(data.employee.role as EmployeeRole)) {
        // Logout on backend to revoke the refresh token cookie we just set.
        try {
          await employeeAuthService.logout();
        } catch {
          // ignore — we'll still throw the error below
        }
        throw new Error(
          "Akun ini tidak memiliki akses admin. Gunakan portal karyawan yang sesuai.",
        );
      }

      return data;
    },
    onSuccess: (data) => {
      const { employee } = data;
      setAuth(employee);
      router.push(getDashboardPath(employee.role as EmployeeRole));
    },
    onError: (error: any) => {
      // Clear any partial auth state.
      clearAuth();
      console.error(
        "Admin login gagal:",
        error?.response?.data?.message || error.message,
      );
    },
  });

  const logout = async () => {
    try {
      await employeeAuthService.logout();
    } catch {
      // proceed regardless
    } finally {
      clearAuth();
      queryClient.clear();
      queryClient.resetQueries();
      router.push("/employee/login");
    }
  };

  return {
    login: loginMutation.mutate,
    isLoggingIn: loginMutation.isPending,
    loginError: loginMutation.error,
    logout,
  };
};
