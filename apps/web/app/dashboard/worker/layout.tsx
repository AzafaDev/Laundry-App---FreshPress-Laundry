"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import { socketToast } from "@/lib/socketToast";
import type { EmployeeRole } from "@/types/employee.types";

const WORKER_ROLES: EmployeeRole[] = [
  "washing_worker",
  "ironing_worker",
  "packing_worker",
];

export default function WorkerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!_hasHydrated) return;

    if (!user) {
      router.replace("/employee/login");
      return;
    }
    if (!WORKER_ROLES.includes(user.role)) {
      router.replace("/access-denied");
    }
  }, [user, _hasHydrated, router]);

  useEffect(() => {
    if (!user) return;

    const unsubTaskCompleted = on("driver:task-completed", (data: any) => {
      socketToast(`Task ${data.taskType} selesai`);
      queryClient.invalidateQueries({ queryKey: ["station-orders"] });
    });

    const unsubStationCompleted = on("station:order-completed", (data: any) => {
      if (data.outletId !== user.outlet_id) return;
      socketToast(`Station ${data.station} selesai`);
      queryClient.invalidateQueries({ queryKey: ["station-orders"] });
    });

    return () => {
      unsubTaskCompleted();
      unsubStationCompleted();
    };
  }, [user, on, queryClient]);

  return <>{children}</>;
}