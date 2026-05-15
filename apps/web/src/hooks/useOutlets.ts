import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { outletService } from "@/services/outlet.service";
import type {
  CreateOutletPayload,
  Outlet,
  OutletListQuery,
  OutletListResponse,
  UpdateOutletPayload,
} from "@/types/outlet.types";

const OUTLETS_KEY = ["admin", "outlets"] as const;

export const useOutlets = (query: OutletListQuery = {}) =>
  useQuery({
    queryKey: [...OUTLETS_KEY, query],
    queryFn: () => outletService.list(query),
    placeholderData: keepPreviousData,
  });

export const useOutlet = (id: string | undefined) =>
  useQuery({
    queryKey: [...OUTLETS_KEY, "detail", id],
    queryFn: () => outletService.getById(id!),
    enabled: !!id,
  });

/**
 * Create outlet with optimistic UI — the new outlet is appended to every cached
 * list page until the server response confirms (or rolls back) the change.
 */
export const useCreateOutlet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateOutletPayload) => outletService.create(payload),
    onMutate: async (payload) => {
      await qc.cancelQueries({ queryKey: OUTLETS_KEY });
      const snapshots = qc.getQueriesData<OutletListResponse>({
        queryKey: OUTLETS_KEY,
      });
      const tempId = `temp-${Date.now()}`;
      const ghost: Outlet = {
        id: tempId,
        name: payload.name,
        address: payload.address,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        max_service_km: payload.max_service_km,
        is_active: payload.is_active ?? true,
        created_at: new Date().toISOString(),
      };
      snapshots.forEach(([key, value]) => {
        if (!value) return;
        qc.setQueryData<OutletListResponse>(key, {
          ...value,
          items: [ghost, ...value.items],
          pagination: { ...value.pagination, total: value.pagination.total + 1 },
        });
      });
      return { snapshots };
    },
    onError: (_err, _payload, ctx) => {
      ctx?.snapshots.forEach(([key, value]) => qc.setQueryData(key, value));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: OUTLETS_KEY }),
  });
};

export const useUpdateOutlet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateOutletPayload;
    }) => outletService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: OUTLETS_KEY }),
  });
};

export const useDeactivateOutlet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outletService.deactivate(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: OUTLETS_KEY }),
  });
};

export const useAssignUserToOutlet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ outletId, userId }: { outletId: string; userId: string }) =>
      outletService.assignUser(outletId, userId),
    onSuccess: () => qc.invalidateQueries({ queryKey: OUTLETS_KEY }),
  });
};
