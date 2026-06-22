import { useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  employeeNotificationService,
  type EmployeeNotification,
} from "@/services/employeeNotification.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useSocket } from "./useSocket";

export function useEmployeeNotifications() {
  const { user } = useEmployeeAuthStore();
  const { on } = useSocket();
  const queryClient = useQueryClient();

  const notificationsQuery = useQuery<EmployeeNotification[]>({
    queryKey: ["employee", "notifications"],
    queryFn: employeeNotificationService.list,
    enabled: !!user,
    refetchInterval: 20_000,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => employeeNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => employeeNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "notifications"] });
    },
  });

  useEffect(() => {
    if (!user) return;
    const unsub = on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "notifications"] });
    });
    return () => unsub();
  }, [user, on, queryClient]);

  return {
    notifications: notificationsQuery.data ?? [],
    isLoading: notificationsQuery.isLoading,
    isError: notificationsQuery.isError,
    refetch: notificationsQuery.refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
  };
}
