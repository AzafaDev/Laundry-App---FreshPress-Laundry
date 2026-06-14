import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";

export function useCustomerNotificationSocket(onNew?: (data: { title: string; body: string }) => void) {
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsub = on("notification:new", (data: { title: string; body: string }) => {
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
      onNew?.(data);
    });

    const unsubOrderStatus = on("order:status-updated", (data?: { orderId?: string }) => {
      queryClient.invalidateQueries({ queryKey: ["customer", "orders"] });
      if (data?.orderId) {
        queryClient.invalidateQueries({ queryKey: ["customer", "orders", data.orderId] });
      }
    });

    return () => {
      unsub();
      unsubOrderStatus();
    };
  }, [on, queryClient, onNew]);
}
