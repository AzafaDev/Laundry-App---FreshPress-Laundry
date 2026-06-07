import { axiosInstance } from "@/lib/axios";

export interface LaundryItem {
  id: string;
  name: string;
  description: string | null;
  unit: string;
  base_price: string | number;
}

type Envelope<T> = { success: true; message: string; data: T };

export const laundryItemService = {
  list: async (): Promise<LaundryItem[]> => {
    const { data } = await axiosInstance.get<Envelope<LaundryItem[]>>(
      "/v1/customer/laundry-items",
    );
    return data.data;
  },
};
