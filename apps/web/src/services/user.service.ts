import { axiosInstance } from "@/lib/axios";
import type {
  User,
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

  create: async (payload: CreateUserPayload): Promise<User> => {
    const { data } = await axiosInstance.post<Envelope<User>>(
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
};
