// src/hooks/useEmployeeAuth.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  employeeAuthService,
  type EmployeeLoginPayload,
} from "@/services/employeeAuth.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import type { EmployeeRole } from "@/types/employee.types";

const getDashboardPath = (role: EmployeeRole): string => {
  switch (role) {
    case "super_admin":
      return "/dashboard/admin";
    case "outlet_admin":
      return "/dashboard/outlet-admin";
    case "driver":
      return "/dashboard/driver";
    case "washing_worker":
    case "ironing_worker":
    case "packing_worker":
      return "/dashboard/worker";
    default:
      return "/";
  }
};

export const useEmployeeAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useEmployeeAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: EmployeeLoginPayload) =>
      employeeAuthService.login(payload),
    onSuccess: (data) => {
      const { accessToken, employee } = data;
      setAuth(employee, accessToken);
      const dashboardPath = getDashboardPath(employee.role);
      router.push(dashboardPath);
    },
    onError: (error: any) => {
      // Error akan ditangani di komponen
      console.error(
        "Login employee gagal:",
        error?.response?.data?.message || error.message,
      );
    },
  });

  const logout = async () => {
    try {
      await employeeAuthService.logout();
    } catch (error) {
      // tetap lanjut clear auth meskipun API gagal
    } finally {
      clearAuth();
      queryClient.clear(); // reset semua query cache
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
