export type AttendanceStatus = 'on_time' | 'late' | 'absent';

export interface Attendance {
  id: string;
  user_id: string;
  attendance_date: string;
  check_in_time: string | null;
  check_out_time: string | null;
  status: AttendanceStatus;
  total_hours: number | null;
  user?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    user_shifts?: Array<{
      shift: {
        name: string;
        outlet: { name: string };
      };
    }>;
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
}

export interface AttendanceReportParams {
  outletId?: string;
  userId?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}