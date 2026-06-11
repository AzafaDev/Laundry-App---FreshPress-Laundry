import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  employeeAuthService,
  type EmployeeLoginPayload,
} from "@/services/employeeAuth.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { getDashboardPath } from "@/utils/employeeRoutes";

const SAFE_LOGIN_ERRORS = new Set([
  "Email atau password salah.",
  "Akun Anda tidak aktif.",
  "Terlalu banyak percobaan login. Coba lagi nanti.",
]);

export function getSafeLoginError(err: unknown): string {
  const msg = (err as any)?.response?.data?.message;
  if (msg && SAFE_LOGIN_ERRORS.has(msg)) return msg;
  return "Login gagal. Periksa email dan password Anda.";
}

export const useEmployeeAuth = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { setAuth, clearAuth } = useEmployeeAuthStore();

  const loginMutation = useMutation({
    mutationFn: (payload: EmployeeLoginPayload) =>
      employeeAuthService.login(payload),
    onSuccess: (data) => {
      const { employee } = data;
      setAuth(employee);
      router.push(getDashboardPath(employee.role));
    },
    onError: (error: any) => {
      console.log(
        "Login employee gagal:",
        error?.response?.data?.message || error.message,
      );
    },
  });

  const logout = async () => {
    try {
      await employeeAuthService.logout();
    } catch (error) {
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
