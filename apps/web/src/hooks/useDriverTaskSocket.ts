"use client";

import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { socketToast } from "@/lib/socketToast";

export function useDriverTaskSocket(onTaskCompleted?: () => void) {
  const { on } = useSocket();
  const queryClient = useQueryClient();
  const user = useEmployeeAuthStore((s) => s.user);

  const onTaskCompletedRef = useRef(onTaskCompleted);
  useEffect(() => { onTaskCompletedRef.current = onTaskCompleted; });

  useEffect(() => {
    const unsubClaimed = on("driver:task-claimed", (data: { driverId: string }) => {
      if (data.driverId !== user?.id) {
        socketToast("Task baru saja diambil driver lain");
      }
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    const unsubCompleted = on("driver:task-completed", () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "active"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
      onTaskCompletedRef.current?.();
    });

    return () => {
      unsubClaimed();
      unsubCompleted();
    };
  }, [on, queryClient, user?.id]);
}
