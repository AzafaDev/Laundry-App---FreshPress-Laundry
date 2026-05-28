import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { workerStationService, type StationType, type StationOrder } from "@/services/workerStation.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import toast from "react-hot-toast";

type WorkerRole = "washing_worker" | "ironing_worker" | "packing_worker";

function mapRoleToStation(role: string | undefined): StationType | null {
  switch (role) {
    case "washing_worker":
      return "washing";
    case "ironing_worker":
      return "ironing";
    case "packing_worker":
      return "packing";
    default:
      return null;
  }
}

export function useWorkerStation() {
  const { user, accessToken } = useEmployeeAuthStore();
  const queryClient = useQueryClient();
  const isWorker = !!accessToken && user?.role?.endsWith("_worker") === true;
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
    onSuccess: (data, variables) => {
      toast.success(`Order ${variables.orderId} selesai di station ${variables.stationType}`);
      queryClient.invalidateQueries({ queryKey: ["worker", "station", station] });
    },
    onError: (error: any) => {
      const message = error?.response?.data?.message || "Gagal menyelesaikan station.";
      toast.error(message);
    },
  });

  const orders = stationOrdersQuery.data ?? [];

  return {
    stationOrders: orders,
    stationType: station,
    isLoading: stationOrdersQuery.isLoading,
    isError: stationOrdersQuery.isError,
    isCompleted: !!stationOrdersQuery.data,
    completeStation: completeStationMutation.mutate,
    isCompleting: completeStationMutation.isPending,
    refetch: () => stationOrdersQuery.refetch(),
  };
}