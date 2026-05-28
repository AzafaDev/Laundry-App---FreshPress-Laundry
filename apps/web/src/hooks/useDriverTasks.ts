import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driverTaskService, type DriverTask, type ActiveTaskResponse } from "@/services/driverTask.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import toast from "react-hot-toast";

export function useDriverTasks() {
  const { user, accessToken } = useEmployeeAuthStore();
  const queryClient = useQueryClient();
  const isDriver = !!accessToken && user?.role === "driver";

  const activeTaskQuery = useQuery<ActiveTaskResponse>({
    queryKey: ["driver", "tasks", "active"],
    queryFn: driverTaskService.getActiveTask,
    enabled: isDriver,
    staleTime: 5000,
    refetchInterval: 5000,
    refetchOnWindowFocus: true,
  });

  const hasActiveTask = activeTaskQuery.data?.hasActiveTask ?? false;

  const availablePickupsQuery = useQuery<DriverTask[]>({
    queryKey: ["driver", "tasks", "available-pickups"],
    queryFn: driverTaskService.getAvailablePickups,
    enabled: isDriver && !hasActiveTask,
    staleTime: 10000,
  });

  const availableDeliveriesQuery = useQuery<DriverTask[]>({
    queryKey: ["driver", "tasks", "available-deliveries"],
    queryFn: driverTaskService.getAvailableDeliveries,
    enabled: isDriver && !hasActiveTask,
    staleTime: 10000,
  });

  const claimTaskMutation = useMutation({
    mutationFn: (taskId: string) => driverTaskService.claimTask(taskId),
    onSuccess: (claimedTask) => {
      toast.success("Task berhasil diambil!");
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "active"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
      queryClient.setQueryData(["driver", "tasks", "active"], {
        hasActiveTask: true,
        task: claimedTask,
      });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Gagal mengambil task. Coba lagi.";
      toast.error(message);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => driverTaskService.completeTask(taskId),
    onSuccess: () => {
      toast.success("Task selesai! Terima kasih.");
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "active"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Gagal menyelesaikan task.";
      toast.error(message);
    },
  });

  const pickups = availablePickupsQuery.data ?? [];
  const deliveries = availableDeliveriesQuery.data ?? [];

  return {
    activeTask: activeTaskQuery.data?.task ?? null,
    hasActiveTask,
    availablePickups: pickups,
    availableDeliveries: deliveries,
    isLoadingActive: activeTaskQuery.isLoading,
    isLoadingPickups: availablePickupsQuery.isLoading,
    isLoadingDeliveries: availableDeliveriesQuery.isLoading,
    isError: activeTaskQuery.isError || availablePickupsQuery.isError || availableDeliveriesQuery.isError,
    claimTask: claimTaskMutation.mutate,
    isClaiming: claimTaskMutation.isPending,
    completeTask: completeTaskMutation.mutate,
    isCompleting: completeTaskMutation.isPending,
    refetch: () => {
      activeTaskQuery.refetch();
      availablePickupsQuery.refetch();
      availableDeliveriesQuery.refetch();
    },
  };
}