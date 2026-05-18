import { axiosInstance } from "@/lib/axios";
import { useLocationStore } from "@/stores/locationStore";
import {
  Attendance,
  AttendanceLogsResponse,
  AttendanceReportParams,
} from "@/types/attendance.type";

export interface CurrentShift {
  shiftName: string;
  startTime: string;
  endTime: string;
  isActive: boolean;
}

export const attendanceService = {
  checkIn: async (): Promise<Attendance> => {
    // Ambil lokasi terkini dari store
    const { latitude, longitude } = useLocationStore.getState();

    const payload: Record<string, any> = {};
    if (latitude != null) payload.lat = latitude;
    if (longitude != null) payload.lng = longitude;

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
    const { data } = await axiosInstance.get<
      { success: true } & AttendanceLogsResponse
    >("/v1/attendance/my-logs", { params });
    return { data: data.data, pagination: data.pagination };
  },

  getReport: async (
    params: AttendanceReportParams,
  ): Promise<AttendanceLogsResponse> => {
    // Filter out undefined values
    const cleanParams: Record<string, any> = {};
    if (params.outletId) cleanParams.outletId = params.outletId;
    if (params.userId) cleanParams.userId = params.userId;
    if (params.startDate) cleanParams.startDate = params.startDate;
    if (params.endDate) cleanParams.endDate = params.endDate;
    if (params.page) cleanParams.page = params.page;
    if (params.limit) cleanParams.limit = params.limit;

    const { data } = await axiosInstance.get<
      { success: true } & AttendanceLogsResponse
    >("/v1/reports/attendance", { params: cleanParams });
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
