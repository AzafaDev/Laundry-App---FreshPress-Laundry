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

export interface GeocodeMatch {
  latitude: number;
  longitude: number;
  formatted: string;
  confidence?: number;
}

export interface AssignedUser {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: "super_admin" | "outlet_admin" | "washing_worker" | "ironing_worker" | "packing_worker" | "driver";
  avatar_url: string | null;
  assigned_at: string;
}

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

  /**
   * Free-text address search → up to `limit` candidate matches. Powers the
   * autocomplete dropdown in the outlet form.
   */
  geocodeSearch: async (q: string, limit = 5): Promise<GeocodeMatch[]> => {
    const { data } = await axiosInstance.get<{
      success: true;
      items: GeocodeMatch[];
    }>("/v1/admin/outlets/geocode", { params: { q, limit } });
    return data.items;
  },

  /** List users currently assigned to an outlet (active UserShift rows). */
  listAssignments: async (outletId: string): Promise<AssignedUser[]> => {
    const { data } = await axiosInstance.get<{
      success: true;
      items: AssignedUser[];
    }>(`/v1/admin/outlets/${outletId}/assignments`);
    return data.items;
  },

  /** Unassign — server marks the matching UserShift rows is_active=false. */
  unassignUser: async (
    outletId: string,
    userId: string,
  ): Promise<{ outlet_id: string; user_id: string }> => {
    const { data } = await axiosInstance.delete<{
      success: true;
      data: { outlet_id: string; user_id: string };
    }>(`/v1/admin/outlets/${outletId}/assignments/${userId}`);
    return data.data;
  },
};
