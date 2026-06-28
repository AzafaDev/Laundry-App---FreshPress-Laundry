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

export const useForgotPassword = () => {
  return useMutation({
    mutationFn: (email: string) => employeeAuthService.forgotPassword(email),
  });
};

export const useResetPassword = () => {
  const router = useRouter();
  const { setAuth } = useEmployeeAuthStore();

  return useMutation({
    mutationFn: ({
      token,
      newPassword,
    }: {
      token: string;
      newPassword: string;
    }) => employeeAuthService.resetPassword(token, newPassword),
    onSuccess: (data) => {
      setAuth(data.employee);
      router.replace(getDashboardPath(data.employee.role));
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: ({
      oldPassword,
      newPassword,
    }: {
      oldPassword: string;
      newPassword: string;
    }) => employeeAuthService.changePassword(oldPassword, newPassword),
  });
};
