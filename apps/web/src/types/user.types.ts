// Matches EmployeeRole enum in schema.prisma
export type UserRole =
  | "super_admin"
  | "outlet_admin"
  | "washing_worker"
  | "ironing_worker"
  | "packing_worker"
  | "driver";

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  avatar_url: string | null;
  role: UserRole;
  outlet_id?: string | null;
  is_active?: boolean;
  is_occupied?: boolean;
  /** Present on Customer accounts (not Employee). Optional here for cross-use. */
  is_verified?: boolean;
  deleted_at?: string | null;
  created_at: string;
  updated_at?: string;
}

/** Alias kept for backward compatibility with user.service.ts */
export type CreatedUser = User;

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
  phone?: string;
  role: UserRole;
  password: string;
  outlet_id?: string;
  is_active?: boolean;
}

export type UpdateUserPayload = Partial<
  Omit<CreateUserPayload, "password"> & { password?: string }
>;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
