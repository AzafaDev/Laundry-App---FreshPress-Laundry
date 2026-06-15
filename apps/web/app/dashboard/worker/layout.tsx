"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useSocket } from "@/hooks/useSocket";
import { socketToast } from "@/lib/socketToast";
import type { EmployeeRole } from "@/types/employee.types";

const WORKER_ROLES: EmployeeRole[] = [
  "washing_worker",
  "ironing_worker",
  "packing_worker",
];

const STATION_BY_ROLE: Record<string, string> = {
  washing_worker: "washing",
  ironing_worker: "ironing",
  packing_worker: "packing",
};

const STATION_TITLES: Record<string, string> = {
  washing: "Pencucian",
  ironing: "Penyetrikaan",
  packing: "Pengemasan",
};

export default function WorkerLayout({ children }: { children: ReactNode }) {
  const router = useRouter();
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const { on } = useSocket();

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

    const workerStation = STATION_BY_ROLE[user.role];

    const unsubNewOrder = on("station:new-order", (data: { station: string }) => {
      if (data.station !== workerStation) return;
      socketToast(`Order baru masuk ke ${STATION_TITLES[data.station] ?? data.station}`);
    });

    const unsubApproved = on("bypass:approved", () => {
      socketToast("Bypass disetujui! Order akan dilanjutkan.");
    });

    const unsubRejected = on("bypass:rejected", (data: { admin_notes?: string }) => {
      socketToast(`Bypass ditolak${data.admin_notes ? `: ${data.admin_notes}` : ""}`, undefined, "error");
    });

    return () => {
      unsubNewOrder();
      unsubApproved();
      unsubRejected();
    };
  }, [user, on]);

  return <>{children}</>;
}
