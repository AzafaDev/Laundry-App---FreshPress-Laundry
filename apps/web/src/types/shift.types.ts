export interface WorkShift {
  id: string;
  name: string;
  start_time: string; // ISO datetime string, only time portion matters
  end_time: string;
  description: string | null;
  is_active: boolean;
  created_at: string;
}

export interface EmployeeShift {
  id: string;
  employee_id: string;
  shift_id: string;
  outlet_id: string;
  day_of_week: number; // 0=Sunday, 6=Saturday
  is_active: boolean;
  created_at: string;
  updated_at: string;
  shift: WorkShift;
  outlet: { id: string; name: string };
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
  day_of_week: number;
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
