"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function DriverLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, accessToken, _hasHydrated } = useEmployeeAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken || !user) {
      router.replace("/employee/login");
      return;
    }
    if (user.role !== "driver") {
      router.replace("/access-denied");
    }
  }, [user, accessToken, _hasHydrated, router]);

  return <>{children}</>;
}