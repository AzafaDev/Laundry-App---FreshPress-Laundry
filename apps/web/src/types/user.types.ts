export type UserRole =
  | "customer"
  | "super_admin"
  | "outlet_admin"
  | "worker"
  | "driver";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  role: UserRole;
  is_verified: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface UserListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface UserListResponse {
  items: User[];
  pagination: UserListPagination;
}

export interface UserListQuery {
  page?: number;
  limit?: number;
  role?: UserRole;
  search?: string;
  include_deleted?: boolean;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  phone: string;
  role: UserRole;
  password: string;
  is_verified?: boolean;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
