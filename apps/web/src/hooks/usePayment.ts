import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { paymentService } from "@/services/payment.service";

export const usePaymentStatus = (orderId: string | undefined, enabled = true) =>
  useQuery({
    queryKey: ["customer", "payment", "status", orderId],
    queryFn: () => paymentService.getStatus(orderId!),
    enabled: !!orderId && enabled,
    refetchInterval: (query) => (query.state.data?.status === "paid" ? false : 5_000),
  });

export const useCreatePaymentTransaction = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => paymentService.createTransaction(orderId),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: ["customer", "payment", "status", orderId] });
    },
  });
};

export const useSyncPaymentStatus = () => {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (orderId: string) => paymentService.syncStatus(orderId),
    onSuccess: (_data, orderId) => {
      qc.invalidateQueries({ queryKey: ["customer", "payment", "status", orderId] });
      qc.invalidateQueries({ queryKey: ["customer", "orders"] });
    },
  });
};
