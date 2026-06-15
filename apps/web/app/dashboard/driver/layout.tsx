"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useSocket } from "@/hooks/useSocket";
import { socketToast } from "@/lib/socketToast";

export default function DriverLayout({ children }: { children: ReactNode }) {
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
    if (user.role !== "driver") {
      router.replace("/access-denied");
    }
  }, [user, _hasHydrated, router]);

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

    return () => {
      unsubNewPickup();
      unsubPaymentCompleted();
      unsubNotification();
    };
  }, [user, on, queryClient]);

  return <>{children}</>;
}