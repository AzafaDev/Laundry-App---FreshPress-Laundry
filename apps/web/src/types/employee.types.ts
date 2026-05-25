export type EmployeeRole =
  | "super_admin"
  | "outlet_admin"
  | "washing_worker"
  | "ironing_worker"
  | "packing_worker"
  | "driver";

export interface Employee {
  id: string;
  email: string;
  full_name: string;
  phone: string;
  avatar_url: string | null;
  role: EmployeeRole;
  outlet_id: string | null;
  is_active: boolean;
  is_occupied: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
}
