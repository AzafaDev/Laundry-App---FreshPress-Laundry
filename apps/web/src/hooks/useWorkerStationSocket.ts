import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import type { BypassState } from "@/components/worker/stationConfig";

interface UseWorkerStationSocketParams {
  station: "washing" | "ironing" | "packing" | null;
  setIsConnected: (v: boolean) => void;
  setBypassState: React.Dispatch<React.SetStateAction<Record<string, BypassState>>>;
}

export function useWorkerStationSocket({
  station,
  setIsConnected,
  setBypassState,
}: UseWorkerStationSocketParams) {
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!station) return;

    const unsubNewOrder = on("station:new-order", (data: { station: string }) => {
      if (data.station === station) {
        queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
      }
    });

    const unsubBypassCreated = on("bypass:created", () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
    });

    const unsubApproved = on("bypass:approved", (data: { orderId: string }) => {
      setBypassState((prev) => {
        const next = { ...prev };
        delete next[data.orderId];
        return next;
      });
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
    });

    const unsubRejected = on("bypass:rejected", (data: { orderId: string; admin_notes?: string }) => {
      setBypassState((prev) => {
        if (!prev[data.orderId]) return prev;
        return {
          ...prev,
          [data.orderId]: { ...prev[data.orderId], submitted: false },
        };
      });
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
    });

    const unsubConnect = on("connect", () => setIsConnected(true));
    const unsubDisconnect = on("disconnect", () => setIsConnected(false));

    return () => {
      unsubNewOrder();
      unsubBypassCreated();
      unsubApproved();
      unsubRejected();
      unsubConnect();
      unsubDisconnect();
    };
  }, [on, queryClient, station, setIsConnected, setBypassState]);
}
