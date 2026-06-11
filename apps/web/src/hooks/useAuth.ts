import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "../stores/authStore";
import { axiosInstance } from "../lib/axios";
import type { User } from "../types/user.types";

export const useAuth = () => {
  const { user, setAuth, clearAuth, updateUser } = useAuthStore();
  const router = useRouter();

  const isAuthenticated = !!user;
  const isVerified = user?.is_verified ?? false;

  const login = useCallback(
    async (email: string, password: string, redirectTo = "/dashboard") => {
      const { data } = await axiosInstance.post<{ user: User }>(
        "/v1/customer/auth/login",
        { email, password },
      );
      setAuth(data.user);
      router.push(redirectTo);
    },
    [setAuth, router],
  );

  const logout = useCallback(async () => {
    try {
      await axiosInstance.post("/v1/customer/auth/logout");
    } catch {
      // ignore — clear local state regardless
    }
    clearAuth();
    router.push("/login");
  }, [clearAuth, router]);

  const fetchProfile = useCallback(async () => {
    if (!user) return;
    try {
      const { data } = await axiosInstance.get<User>("/v1/customer/profile");
      updateUser(data);
    } catch {
      clearAuth();
    }
  }, [user, updateUser, clearAuth]);

  return {
    user,
    isAuthenticated,
    isVerified,
    login,
    logout,
    fetchProfile,
    updateUser,
  };
};
