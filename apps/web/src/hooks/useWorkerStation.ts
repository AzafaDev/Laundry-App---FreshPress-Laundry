import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workerStationService, type StationType, type StationOrder, type BypassDetail, type WorkerTaskHistoryResponse } from "@/services/workerStation.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

const ROLE_TO_STATION: Record<string, StationType> = {
  washing_worker: "washing",
  ironing_worker: "ironing",
  packing_worker: "packing",
};

function mapRoleToStation(role: string | undefined): StationType | null {
  return ROLE_TO_STATION[role ?? ""] ?? null;
}

export function useWorkerStation() {
  const { user } = useEmployeeAuthStore();
  const queryClient = useQueryClient();
  const isWorker = !!user && user.role?.endsWith("_worker") === true;
  const station = mapRoleToStation(user?.role);

  const stationOrdersQuery = useQuery<StationOrder[]>({
    queryKey: ["worker", "station", station],
    queryFn: () => workerStationService.getStationOrders(station!),
    enabled: isWorker && station !== null,
    staleTime: 10000,
    refetchOnWindowFocus: true,
  });

  const submitItemsMutation = useMutation({
    mutationFn: ({
      stationType,
      orderId,
      actual_items,
      actual_satuan_items,
    }: {
      stationType: StationType;
      orderId: string;
      actual_items: { clothing_type_id: string; actual_quantity: number }[];
      actual_satuan_items: { laundry_item_id: string; actual_quantity: number }[];
    }) => workerStationService.submitItems(stationType, orderId, actual_items, actual_satuan_items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
    },
  });

  const createBypassMutation = useMutation({
    mutationFn: (formData: FormData) => workerStationService.createBypassRequest(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
    },
  });

  const orders = stationOrdersQuery.data ?? [];

  return {
    stationOrders: orders,
    stationType: station,
    isLoading: stationOrdersQuery.isLoading,
    isError: stationOrdersQuery.isError,
    isCompleted: !!stationOrdersQuery.data,
    submitItems: submitItemsMutation.mutateAsync,
    isSubmittingItems: submitItemsMutation.isPending,
    createBypassRequest: createBypassMutation.mutateAsync,
    isCreatingBypass: createBypassMutation.isPending,
    refetch: stationOrdersQuery.refetch,
  };
}

export function useBypassDetail(orderId: string | null, enabled = true) {
  return useQuery<BypassDetail | null>({
    queryKey: ["worker", "bypass", orderId],
    queryFn: () => workerStationService.getBypassDetail(orderId!),
    enabled: !!orderId && enabled,
    refetchOnMount: "always",
  });
}

export function useTaskHistory(page: number, limit: number) {
  return useQuery<WorkerTaskHistoryResponse>({
    queryKey: ["worker", "task-history", page],
    queryFn: () => workerStationService.getTaskHistory(page, limit),
  });
}
