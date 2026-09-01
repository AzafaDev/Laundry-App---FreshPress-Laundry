"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { socketToast } from "@/lib/socketToast";

export function useDriverSocket() {
  const { on } = useSocket();
  const queryClient = useQueryClient();
  const user = useEmployeeAuthStore((s) => s.user);

  useEffect(() => {
    if (!user) return;
    const unsubNewPickup = on("order:new-pickup-request", (data: { customerName?: string; invoiceNumber?: string }) => {
      socketToast(
        "Permintaan pickup baru",
        `${data.customerName ?? "Customer"} memesan pickup (${data.invoiceNumber ?? ""})`,
      );
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
    });
    const unsubPaymentCompleted = on("order:payment-completed", (data: { invoiceNumber?: string }) => {
      socketToast(
        "Pembayaran berhasil",
        `Pesanan ${data.invoiceNumber ?? ""} siap untuk diantar.`,
      );
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    const unsubNotification = on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "notifications"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "notifications", "unread"] });
    });

    const unsubTaskClaimed = on("driver:task-claimed", (data: { driverId: string }) => {
      if (data.driverId !== user.id) {
        socketToast("Task baru saja diambil driver lain");
      }
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    const unsubTaskCompleted = on("driver:task-completed", () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "active"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    return () => {
      unsubNewPickup();
      unsubPaymentCompleted();
      unsubNotification();
      unsubTaskClaimed();
      unsubTaskCompleted();
    };
  }, [user, on, queryClient]);
}
