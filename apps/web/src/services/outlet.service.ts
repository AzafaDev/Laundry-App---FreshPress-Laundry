import { axiosInstance } from "@/lib/axios";
import type {
  Outlet,
  OutletListQuery,
  OutletListResponse,
  CreateOutletPayload,
  UpdateOutletPayload,
} from "@/types/outlet.types";

type Envelope<T> = { success: true; data: T };
type PaginatedEnvelope<T> = {
  success: true;
  items: T[];
  pagination: OutletListResponse["pagination"];
};

export const outletService = {
  list: async (params: OutletListQuery = {}): Promise<OutletListResponse> => {
    const { data } = await axiosInstance.get<PaginatedEnvelope<Outlet>>(
      "/v1/admin/outlets",
      { params },
    );
    return { items: data.items, pagination: data.pagination };
  },

  getById: async (id: string): Promise<Outlet> => {
    const { data } = await axiosInstance.get<Envelope<Outlet>>(
      `/v1/admin/outlets/${id}`,
    );
    return data.data;
  },

  create: async (payload: CreateOutletPayload): Promise<Outlet> => {
    const { data } = await axiosInstance.post<Envelope<Outlet>>(
      "/v1/admin/outlets",
      payload,
    );
    return data.data;
  },

  update: async (id: string, payload: UpdateOutletPayload): Promise<Outlet> => {
    const { data } = await axiosInstance.patch<Envelope<Outlet>>(
      `/v1/admin/outlets/${id}`,
      payload,
    );
    return data.data;
  },

  deactivate: async (id: string): Promise<Outlet> => {
    const { data } = await axiosInstance.delete<Envelope<Outlet>>(
      `/v1/admin/outlets/${id}`,
    );
    return data.data;
  },

  assignUser: async (
    outletId: string,
    userId: string,
  ): Promise<{ outlet_id: string; user_id: string; shift_id: string }> => {
    const { data } = await axiosInstance.post<
      Envelope<{ outlet_id: string; user_id: string; shift_id: string }>
    >(`/v1/admin/outlets/${outletId}/assignments`, { user_id: userId });
    return data.data;
  },
};
