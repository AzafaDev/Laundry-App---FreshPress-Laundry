import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { axiosInstance } from "../lib/axios";
import type { User } from "../types/user.types";

export const useAuth = () => {
  const { user, accessToken, setAuth, clearAuth, updateUser } = useAuthStore();
  const router = useRouter();

  const isAuthenticated = !!accessToken && !!user;
  const isVerified = user?.is_verified ?? false;

  const login = useCallback(
    async (email: string, password: string, redirectTo = "/dashboard") => {
      const { data } = await axiosInstance.post<{
        accessToken: string;
        user: User;
      }>("/v1/customer/auth/login", { email, password });
      setAuth(data.user, data.accessToken);
      router.push(redirectTo);
    },
    [setAuth, router],
  );

  const logout = useCallback(() => {
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  const fetchProfile = useCallback(async () => {
    if (!accessToken) return;
    try {
      const { data } = await axiosInstance.get<User>("/v1/customer/profile", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });
      updateUser(data);
    } catch {
      // token likely expired
      clearAuth();
    }
  }, [accessToken, updateUser, clearAuth]);

  return {
    user,
    accessToken,
    isAuthenticated,
    isVerified,
    login,
    logout,
    fetchProfile,
    updateUser,
  };
};
