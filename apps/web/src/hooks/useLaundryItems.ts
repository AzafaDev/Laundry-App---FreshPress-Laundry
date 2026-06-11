import {
  useMutation,
  useQuery,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { laundryItemService } from "@/services/laundryItem.service";
import type {
  LaundryItemListQuery,
  CreateLaundryItemPayload,
  UpdateLaundryItemPayload,
} from "@/types/laundryItem.types";

const KEY = ["admin", "laundry-items"] as const;

export const useLaundryItems = (query: LaundryItemListQuery = {}) =>
  useQuery({
    queryKey: [...KEY, query],
    queryFn: () => laundryItemService.list(query),
    placeholderData: keepPreviousData,
  });

export const useCreateLaundryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateLaundryItemPayload) =>
      laundryItemService.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useUpdateLaundryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: UpdateLaundryItemPayload }) =>
      laundryItemService.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};

export const useDeleteLaundryItem = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => laundryItemService.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
};
