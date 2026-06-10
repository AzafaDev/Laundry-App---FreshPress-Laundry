import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { driverTaskService, type DriverTask, type ActiveTaskResponse, type AvailableTasksResponse } from "@/services/driverTask.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import toast from "react-hot-toast";

export function useDriverTasks() {
  const { user } = useEmployeeAuthStore();
  const queryClient = useQueryClient();
  const isDriver = !!user && user.role === "driver";

  const activeTaskQuery = useQuery<ActiveTaskResponse>({
    queryKey: ["driver", "tasks", "active"],
    queryFn: driverTaskService.getActiveTask,
    enabled: isDriver,
    staleTime: 30000,
  });

  const hasActiveTask = activeTaskQuery.data?.hasActiveTask ?? false;

  const availablePickupsQuery = useQuery<AvailableTasksResponse>({
    queryKey: ["driver", "tasks", "available-pickups"],
    queryFn: driverTaskService.getAvailablePickups,
    enabled: isDriver && !hasActiveTask,
    staleTime: 10000,
  });

  const availableDeliveriesQuery = useQuery<AvailableTasksResponse>({
    queryKey: ["driver", "tasks", "available-deliveries"],
    queryFn: driverTaskService.getAvailableDeliveries,
    enabled: isDriver && !hasActiveTask,
    staleTime: 10000,
  });

  const claimTaskMutation = useMutation({
    mutationFn: (taskId: string) => driverTaskService.claimTask(taskId),
    onSuccess: (data) => {
      queryClient.setQueryData(["driver", "tasks", "active"], data);
      const label = data.task?.task_type === "delivery" ? "delivery" : "pickup";
      toast.success(`Task ${label} berhasil diambil!`);
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Gagal mengambil task. Coba lagi.";
      toast.error(message);
    },
  });

  const completeTaskMutation = useMutation({
    mutationFn: (taskId: string) => driverTaskService.completeTask(taskId),
    onSuccess: () => {
      toast.success("Task berhasil diselesaikan!");
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "active"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Gagal menyelesaikan task.";
      toast.error(message);
    },
  });

  const pickups = availablePickupsQuery.data?.tasks ?? [];
  const deliveries = availableDeliveriesQuery.data?.tasks ?? [];
  const nextPickupReleaseAt = availablePickupsQuery.data?.next_release_at ?? null;

  return {
    activeTask: activeTaskQuery.data?.task ?? null,
    hasActiveTask,
    availablePickups: pickups,
    availableDeliveries: deliveries,
    nextPickupReleaseAt,
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