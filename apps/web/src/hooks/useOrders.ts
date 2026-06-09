import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { orderService } from "@/services/order.service";
import type { OrderListQuery } from "@/types/order.types";

const KEY = ["admin", "orders"] as const;

export const useOrders = (query: OrderListQuery = {}) =>
  useQuery({
    queryKey: [...KEY, query],
    queryFn: () => orderService.list(query),
    placeholderData: keepPreviousData,
  });

export const useOrder = (id: string | undefined) =>
  useQuery({
    queryKey: [...KEY, "detail", id],
    queryFn: () => orderService.getById(id!),
    enabled: !!id,
  });

export const useProcessOrder = (orderId: string) => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: {
      total_weight_kg: number;
      items: { laundry_item_id: string; quantity: number }[];
      breakdown?: { clothing_type_id: string; quantity: number }[];
      notes?: string;
    }) => orderService.processOrder(orderId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "orders"] });
    },
  });
};
