import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";

export function useWorkerSocket() {
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = on("station:order-updated", () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "station"] });
    });
    return () => unsub();
  }, [on, queryClient]);
}
