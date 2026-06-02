import { axiosInstance } from "@/lib/axios";
import type {
  LaundryItem,
  LaundryItemListQuery,
  LaundryItemListResponse,
  CreateLaundryItemPayload,
  UpdateLaundryItemPayload,
} from "@/types/laundryItem.types";

type Envelope<T> = { success: true; data: T };

export const laundryItemService = {
  list: async (params: LaundryItemListQuery = {}): Promise<LaundryItemListResponse> => {
    const { data } = await axiosInstance.get<LaundryItemListResponse>(
      "/v1/admin/laundry-items",
      { params },
    );
    return data;
  },

  getById: async (id: string): Promise<LaundryItem> => {
    const { data } = await axiosInstance.get<Envelope<LaundryItem>>(
      `/v1/admin/laundry-items/${id}`,
    );
    return data.data;
  },

  create: async (payload: CreateLaundryItemPayload): Promise<LaundryItem> => {
    const { data } = await axiosInstance.post<Envelope<LaundryItem>>(
      "/v1/admin/laundry-items",
      payload,
    );
    return data.data;
  },

  update: async (id: string, payload: UpdateLaundryItemPayload): Promise<LaundryItem> => {
    const { data } = await axiosInstance.patch<Envelope<LaundryItem>>(
      `/v1/admin/laundry-items/${id}`,
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<LaundryItem> => {
    const { data } = await axiosInstance.delete<Envelope<LaundryItem>>(
      `/v1/admin/laundry-items/${id}`,
    );
    return data.data;
  },
};
