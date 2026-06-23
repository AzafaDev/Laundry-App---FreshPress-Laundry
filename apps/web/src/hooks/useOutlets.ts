import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { outletService, type AssignedUser } from "@/services/outlet.service";
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
        province: payload.province,
        city: payload.city,
        district: payload.district,
        postal_code: payload.postal_code,
        phone: payload.phone,
        latitude: payload.latitude ?? null,
        longitude: payload.longitude ?? null,
        service_radius_km: payload.service_radius_km,
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

export const useSoftDeleteOutlet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outletService.softDelete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: OUTLETS_KEY }),
  });
};

export const useDeleteOutlet = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => outletService.delete(id),
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

export const useOutletAssignments = (outletId: string | null) =>
  useQuery<AssignedUser[]>({
    queryKey: ["admin", "outlets", "assignments", outletId],
    queryFn: () => outletService.listAssignments(outletId!),
    enabled: !!outletId,
  });

export const useUnassignUser = (outletId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (userId: string) =>
      outletService.unassignUser(outletId, userId),
    onSuccess: () =>
      qc.invalidateQueries({
        queryKey: ["admin", "outlets", "assignments", outletId],
      }),
  });
};
