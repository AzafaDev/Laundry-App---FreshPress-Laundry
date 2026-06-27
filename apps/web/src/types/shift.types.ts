export interface WorkShift {
  id: string;
  name: string;
  start_time: string; // ISO datetime string, only time portion matters
  end_time: string;
  description: string | null;
  is_active: boolean;
  deleted_at: string | null;
  created_at: string;
}

export interface EmployeeShift {
  id: string;
  employee_id: string;
  shift_id: string;
  outlet_id: string;
  /** Recurring weekly schedule (0=Sun…6=Sat). Null when date is set. */
  day_of_week: number | null;
  /** One-time specific date (YYYY-MM-DD). Null for recurring schedules. */
  date: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shift: WorkShift;
  outlet: { id: string; name: string };
}

export interface EmployeeShiftListResponse {
  recurring: EmployeeShift[];
  date_specific: EmployeeShift[];
}

export interface WorkShiftListPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface WorkShiftListResponse {
  items: WorkShift[];
  pagination: WorkShiftListPagination;
}

export interface WorkShiftListQuery {
  page?: number;
  limit?: number;
  is_active?: boolean;
  include_deleted?: boolean;
}

export interface CreateWorkShiftPayload {
  name: string;
  start_time: string; // HH:MM
  end_time: string; // HH:MM
  description?: string;
  is_active?: boolean;
}

export type UpdateWorkShiftPayload = Partial<CreateWorkShiftPayload>;

export interface AssignEmployeeShiftPayload {
  shift_id: string;
  outlet_id: string;
  /** Required for recurring assignments. Mutually exclusive with date. */
  day_of_week?: number;
  /** Required for date-specific assignments (YYYY-MM-DD). Mutually exclusive with day_of_week. */
  date?: string;
  is_active?: boolean;
}

export const DAY_NAMES = [
  "Minggu",
  "Senin",
  "Selasa",
  "Rabu",
  "Kamis",
  "Jumat",
  "Sabtu",
] as const;
