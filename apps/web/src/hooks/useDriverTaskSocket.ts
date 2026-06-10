import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSocket } from "@/hooks/useSocket";
import { socketToast } from "@/lib/socketToast";

export function useDriverTaskSocket() {
  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubClaimed = on("driver:task-claimed", () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    const unsubCompleted = on("driver:task-completed", () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "active"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    const unsubTasksReleased = on("driver:tasks-released", (data: { count: number }) => {
      socketToast(`${data.count} task pickup baru tersedia`);
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
    });

    return () => {
      unsubClaimed();
      unsubCompleted();
      unsubTasksReleased();
    };
  }, [on, queryClient]);
}
