import { axiosInstance } from "@/lib/axios";
import type {
  User,
  CreatedUser,
  UserListQuery,
  UserListResponse,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types/user.types";

type Envelope<T> = { success: true; data: T };
type PaginatedEnvelope<T> = {
  success: true;
  items: T[];
  pagination: UserListResponse["pagination"];
};

export const userService = {
  list: async (params: UserListQuery = {}): Promise<UserListResponse> => {
    const { data } = await axiosInstance.get<PaginatedEnvelope<User>>(
      "/v1/admin/users",
      { params },
    );
    return { items: data.items, pagination: data.pagination };
  },

  getById: async (id: string): Promise<User> => {
    const { data } = await axiosInstance.get<Envelope<User>>(
      `/v1/admin/users/${id}`,
    );
    return data.data;
  },

  // Returns CreatedUser so callers can read the `invited` flag the server
  // tacks on when no password was supplied.
  create: async (payload: CreateUserPayload): Promise<CreatedUser> => {
    const { data } = await axiosInstance.post<Envelope<CreatedUser>>(
      "/v1/admin/users",
      payload,
    );
    return data.data;
  },

  update: async (id: string, payload: UpdateUserPayload): Promise<User> => {
    const { data } = await axiosInstance.patch<Envelope<User>>(
      `/v1/admin/users/${id}`,
      payload,
    );
    return data.data;
  },

  remove: async (id: string): Promise<User> => {
    const { data } = await axiosInstance.delete<Envelope<User>>(
      `/v1/admin/users/${id}`,
    );
    return data.data;
  },

  resendInvite: async (id: string): Promise<{ id: string; email: string }> => {
    const { data } = await axiosInstance.post<Envelope<{ id: string; email: string }>>(
      `/v1/admin/users/${id}/resend-invite`,
    );
    return data.data;
  },

  hardRemove: async (id: string): Promise<{ id: string }> => {
    const { data } = await axiosInstance.delete<Envelope<{ id: string }>>(
      `/v1/admin/users/${id}/permanent`,
    );
    return data.data;
  },
};
