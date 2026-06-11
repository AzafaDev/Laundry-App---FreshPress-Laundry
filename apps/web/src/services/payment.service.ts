import { axiosInstance } from "@/lib/axios";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded" | "expired";

export interface PaymentInfo {
  id: string;
  order_id: string;
  amount: string | number;
  payment_method: string;
  gateway_name: string | null;
  gateway_transaction_id: string | null;
  payment_link: string | null;
  status: PaymentStatus;
  expired_at: string | null;
  paid_at: string | null;
  created_at: string;
}

export interface CreateTransactionResponse {
  token: string;
  redirect_url: string;
  payment: PaymentInfo;
}

type Envelope<T> = { success: true; message: string; data: T };

export const paymentService = {
  createTransaction: async (orderId: string): Promise<CreateTransactionResponse> => {
    const { data } = await axiosInstance.post<Envelope<CreateTransactionResponse>>(
      `/v1/customer/payment/${orderId}/create-transaction`,
    );
    return data.data;
  },

  getStatus: async (orderId: string): Promise<PaymentInfo | null> => {
    const { data } = await axiosInstance.get<Envelope<PaymentInfo | null>>(
      `/v1/customer/payment/${orderId}/status`,
    );
    return data.data;
  },

  syncStatus: async (orderId: string): Promise<PaymentInfo> => {
    const { data } = await axiosInstance.post<Envelope<PaymentInfo>>(
      `/v1/customer/payment/${orderId}/sync`,
    );
    return data.data;
  },
};
