import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workerStationService, type StationType, type StationOrder } from "@/services/workerStation.service";
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

  const completeStationMutation = useMutation({
    mutationFn: ({ orderId, stationType }: { orderId: string; stationType: StationType }) =>
      workerStationService.completeStation(stationType, orderId),
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
    completeStation: completeStationMutation.mutateAsync,
    isCompleting: completeStationMutation.isPending,
    refetch: stationOrdersQuery.refetch,
  };
}