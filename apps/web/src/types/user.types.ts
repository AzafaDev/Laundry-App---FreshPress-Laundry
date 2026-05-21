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

/**
 * Returned by `POST /v1/admin/users`. Same fields as `User` plus an `invited`
 * flag set to true when the server kicked off the email-invite flow (admin
 * left password blank).
 */
export interface CreatedUser extends User {
  invited: boolean;
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
  /**
   * Optional — when omitted (or empty), the server provisions a placeholder
   * password hash, marks the user unverified, and sends an invite email
   * with a verification link.
   */
  password?: string;
  is_verified?: boolean;
}

export type UpdateUserPayload = Partial<CreateUserPayload>;

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
