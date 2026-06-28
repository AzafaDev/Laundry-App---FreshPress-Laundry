import { axiosInstance } from "@/lib/axios";
import {
  Attendance,
  AttendanceLogsResponse,
  AttendanceReportParams,
  AttendanceStatusFilter,
  Pagination,
} from "@/types/attendance.type";

export interface CurrentShift {
  shiftName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
  phase: "pre_shift" | "active" | "ended";
  progressPercent: number;
  remainingSeconds: number;
  outletName?: string;
  outletId?: string;
  canCheckIn: boolean;
  canCheckOut: boolean;
  serverNow?: string;
  startEpoch?: number;
  endEpoch?: number;
}

export const attendanceService = {
  checkIn: async (coordinates?: { lat: number; lng: number }): Promise<Attendance> => {
    const payload: Record<string, any> = {};
    if (coordinates) {
      payload.lat = coordinates.lat;
      payload.lng = coordinates.lng;
    }
    const { data } = await axiosInstance.post<{
      success: true;
      data: Attendance;
    }>("/v1/attendance/check-in", payload);
    return data.data;
  },

  checkOut: async (attendanceId: string): Promise<Attendance> => {
    const { data } = await axiosInstance.post<{
      success: true;
      data: Attendance;
    }>("/v1/attendance/check-out", { attendanceId });
    return data.data;
  },

  checkTodayAttendance: async (): Promise<Attendance | null> => {
    const { data } = await axiosInstance.get<{
      success: true;
      data: Attendance | null;
    }>("/v1/attendance/today");
    return data.data;
  },

  getMyLogs: async (params: {
    page?: number;
    limit?: number;
    startDate?: string;
    endDate?: string;
  }): Promise<AttendanceLogsResponse> => {
    const { data } = await axiosInstance.get<{
      success: true;
      data: Attendance[];
      pagination: Pagination;
      summary: { on_time: number; late: number; absent: number };
    }>("/v1/attendance/my-logs", { params });
    return { data: data.data, pagination: data.pagination, summary: data.summary };
  },

  getReport: async (params: AttendanceReportParams): Promise<AttendanceLogsResponse> => {
    const cleanParams = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== undefined && v !== "" && v !== null),
    );

    const { data } = await axiosInstance.get<{
      success: true;
      data: Attendance[];
      pagination: Pagination;
    }>("/v1/reports/attendance", { params: cleanParams });
    return { data: data.data, pagination: data.pagination };
  },

  getCurrentShift: async (): Promise<CurrentShift | null> => {
    const { data } = await axiosInstance.get<{
      success: true;
      data: CurrentShift | null;
    }>("/v1/attendance/current-shift");
    return data.data;
  },
};
