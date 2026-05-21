"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuthStore } from "@/stores/authStore";
import type { User } from "@/types/user.types";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setAuth } = useAuthStore();

  useEffect(() => {
    const token = searchParams.get("token");
    const userEncoded = searchParams.get("user");

    if (!token || !userEncoded) {
      router.replace("/login?error=Login+Google+gagal.");
      return;
    }

    try {
      const user = JSON.parse(
        Buffer.from(userEncoded, "base64").toString("utf-8"),
      ) as User;

      setAuth(user, token);

      const path = getDashboardPath(user.role);
      router.replace(path);
    } catch {
      router.replace("/login?error=Login+Google+gagal.");
    }
  }, [searchParams, router, setAuth]);

  const getDashboardPath = (role: string): string => {
    if (role === "super_admin" || role === "outlet_admin") return "/dashboard/admin";
    if (role === "driver") return "/dashboard/driver";
    if (role === "worker") return "/dashboard/worker";
    return "/";
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <span className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary" />
        </div>
      }
    >
      <AuthCallbackContent />
    </Suspense>
  );
}
