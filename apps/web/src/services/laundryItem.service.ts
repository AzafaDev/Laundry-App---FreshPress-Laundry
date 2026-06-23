import { axiosInstance } from "@/lib/axios";
import type {
  LaundryItem,
  LaundryItemListQuery,
  LaundryItemListResponse,
  CreateLaundryItemPayload,
  UpdateLaundryItemPayload,
} from "@/types/laundryItem.types";

export type { LaundryItem };

export const laundryItemService = {
  list: async (query: LaundryItemListQuery = {}): Promise<LaundryItemListResponse> => {
    const params = new URLSearchParams();
    if (query.page) params.set("page", String(query.page));
    if (query.limit) params.set("limit", String(query.limit));
    if (query.search) params.set("search", query.search);
    if (query.is_active !== undefined) params.set("is_active", String(query.is_active));
    if (query.include_deleted) params.set("include_deleted", "true");
    if (query.sort_by) params.set("sort_by", query.sort_by);
    if (query.sort_dir) params.set("sort_dir", query.sort_dir);
    const { data } = await axiosInstance.get(
      `/v1/admin/laundry-items?${params.toString()}`,
    );
    return data;
  },

  /** Customer-facing: flat list from public endpoint, no auth required */
  listForCustomer: async (): Promise<LaundryItem[]> => {
    const { data } = await axiosInstance.get("/v1/customer/laundry-items");
    return data.data;
  },

  create: async (payload: CreateLaundryItemPayload): Promise<LaundryItem> => {
    const { data } = await axiosInstance.post("/v1/admin/laundry-items", payload);
    return data.data;
  },

  update: async (id: string, payload: UpdateLaundryItemPayload): Promise<LaundryItem> => {
    const { data } = await axiosInstance.patch(`/v1/admin/laundry-items/${id}`, payload);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/v1/admin/laundry-items/${id}`);
  },

  hardRemove: async (id: string): Promise<void> => {
    await axiosInstance.delete(`/v1/admin/laundry-items/${id}/permanent`);
  },
};
