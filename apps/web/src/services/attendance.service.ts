import { axiosInstance } from "@/lib/axios";
import {
  Attendance,
  AttendanceLogsResponse,
  AttendanceReportParams,
} from "@/types/attendance.type";

export const attendanceService = {
  checkIn: async (): Promise<Attendance> => {
    const { data } = await axiosInstance.post<{
      success: true;
      data: Attendance;
    }>("/v1/attendance/check-in", {});
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
    const { data } = await axiosInstance.get<
      { success: true } & AttendanceLogsResponse
    >("/v1/attendance/my-logs", { params });
    return { data: data.data, pagination: data.pagination };
  },

  getReport: async (
    params: AttendanceReportParams,
  ): Promise<AttendanceLogsResponse> => {
    const { data } = await axiosInstance.get<
      { success: true } & AttendanceLogsResponse
    >("/v1/reports/attendance", { params });
    return { data: data.data, pagination: data.pagination };
  },
};
