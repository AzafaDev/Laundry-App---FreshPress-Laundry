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
  created_at: string;
}

export interface AuthState {
  user: User | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
