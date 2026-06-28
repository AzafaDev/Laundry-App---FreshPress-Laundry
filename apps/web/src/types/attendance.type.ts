
export type AttendanceStatus = "on_time" | "late" | "absent";
export type AttendanceStatusFilter = "on_time" | "late" | "absent";

export interface Attendance {
  id: string;
  employee_id: string;
  date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus;
  notes?: string | null;
  total_hours: number | null;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    outlet_id?: string;
  };
  outlet?: {
    id: string;
    name: string;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  total_pages: number;
}

export interface AttendanceLogsResponse {
  data: Attendance[];
  pagination: Pagination;
  summary?: {
    on_time: number;
    late: number;
    absent: number;
  };
}

export interface AttendanceReportParams {
  outletId?: string;
  employeeId?: string; 
  role?: "washing_worker" | "ironing_worker" | "packing_worker" | "driver";
  status?: AttendanceStatusFilter;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}
