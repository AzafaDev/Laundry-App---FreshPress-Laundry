"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import type { EmployeeRole } from "@/types/employee.types";

const WORKER_ROLES: EmployeeRole[] = [
  "washing_worker",
  "ironing_worker",
  "packing_worker",
];

export default function WorkerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, accessToken, _hasHydrated } = useEmployeeAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!accessToken || !user) {
      router.replace("/employee/login");
      return;
    }
    if (!WORKER_ROLES.includes(user.role)) {
      router.replace("/access-denied");
    }
  }, [user, accessToken, _hasHydrated, router]);

  if (!_hasHydrated || !user || !accessToken || !WORKER_ROLES.includes(user.role)) {
    return null;
  }

  return <>{children}</>;
}