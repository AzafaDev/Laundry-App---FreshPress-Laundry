"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export default function DriverLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, accessToken } = useEmployeeAuthStore();

  useEffect(() => {
    if (!accessToken || !user) {
      router.replace("/employee/login");
      return;
    }
    if (user.role !== "driver") {
      router.replace("/access-denied");
    }
  }, [user, accessToken, router]);

  if (!user || !accessToken || user.role !== "driver") {
    return null;
  }

  return <>{children}</>;
}