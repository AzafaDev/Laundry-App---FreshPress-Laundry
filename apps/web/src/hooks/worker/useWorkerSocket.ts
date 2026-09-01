"use client";

import { useEffect } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { socketToast } from "@/lib/socketToast";

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

export function useWorkerSocket() {
  const { on } = useSocket();
  const user = useEmployeeAuthStore((s) => s.user);

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
}
