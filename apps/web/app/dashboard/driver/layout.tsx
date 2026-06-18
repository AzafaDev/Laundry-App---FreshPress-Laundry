"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useDriverSocket } from "@/hooks/useDriverSocket";

export default function DriverLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated } = useEmployeeAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user) {
      router.replace("/employee/login");
      return;
    }
    if (user.role !== "driver") {
      router.replace("/access-denied");
    }
  }, [user, _hasHydrated, router]);

  useDriverSocket();

  return <>{children}</>;
}