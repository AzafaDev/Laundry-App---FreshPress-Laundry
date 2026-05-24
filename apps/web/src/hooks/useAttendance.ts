// apps/web/src/hooks/useAttendance.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  attendanceService,
  type CurrentShift,
} from "@/services/attendance.service";
import { useSocket } from "./useSocket";
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import type {
  AttendanceReportParams,
  AttendanceStatusFilter,
} from "@/types/attendance.type";

// --- Hook untuk employee (check-in/out, my logs, current shift) ---
export function useAttendance() {
  const queryClient = useQueryClient();
  const { on, emit } = useSocket();

  // Pastikan employee sudah login (opsional, untuk validasi)
  const { accessToken, user } = useEmployeeAuthStore();
  const isEmployee = !!accessToken && !!user;

  // Real-time subscription
  useEffect(() => {
    if (!isEmployee) return;
    const unsubscribe = on("attendance:updated", () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      toast.success("Status absensi diperbarui", {
        icon: "🔄",
        duration: 2000,
      });
    });
    return unsubscribe;
  }, [on, queryClient, isEmployee]);

  const todayQuery = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: attendanceService.checkTodayAttendance,
    staleTime: 1000 * 60 * 2,
    refetchOnWindowFocus: true,
    enabled: isEmployee,
  });

  const logsQuery = useQuery({
    queryKey: ["attendance", "logs"],
    queryFn: () => attendanceService.getMyLogs({}),
    staleTime: 1000 * 60 * 5,
    enabled: isEmployee,
  });

  const shiftQuery = useQuery({
    queryKey: ["attendance", "currentShift"],
    queryFn: attendanceService.getCurrentShift,
    staleTime: 1000 * 60 * 15,
    enabled: isEmployee,
  });

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onMutate: () => toast.loading("Merekam check-in...", { id: "attendance" }),
    onSuccess: (data) => {
      toast.success(`Check-in berhasil pukul ${data.check_in_time}`, {
        id: "attendance",
      });
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      emit("attendance:checked-in", { userId: data.user_id });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal check-in", {
        id: "attendance",
      });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      attendanceService.checkOut(attendanceId),
    onMutate: () => toast.loading("Merekam check-out...", { id: "attendance" }),
    onSuccess: (data) => {
      toast.success(
        `Check-out berhasil. Total jam: ${data.total_hours || "-"} jam`,
        { id: "attendance" },
      );
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
      emit("attendance:checked-out", { attendanceId: data.id });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal check-out", {
        id: "attendance",
      });
    },
  });

  const today = todayQuery.data;
  const checkedIn =
    today?.check_in_time != null && today.check_out_time == null;

  return {
    checkedIn,
    checkInTime: today?.check_in_time ?? undefined,
    checkOutTime: today?.check_out_time ?? undefined,
    attendanceId: today?.id ?? null,
    records: logsQuery.data?.data ?? [],
    pagination: logsQuery.data?.pagination,
    currentShift: shiftQuery.data,
    isLoading:
      todayQuery.isLoading || logsQuery.isLoading || shiftQuery.isLoading,
    isError: todayQuery.isError || logsQuery.isError || shiftQuery.isError,
    error: todayQuery.error ?? logsQuery.error ?? shiftQuery.error,
    checkIn: () => checkInMutation.mutate(),
    checkInAsync: checkInMutation.mutateAsync,
    checkOut: () => today?.id && checkOutMutation.mutate(today.id),
    checkOutAsync: (id?: string) =>
      checkOutMutation.mutateAsync(id ?? today!.id),
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    fetchNextLogs: (page: number) =>
      attendanceService.getMyLogs({ page, limit: 20 }),
    fetchLogs: async (params: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
    }) => {
      return attendanceService.getMyLogs(params);
    },
  };
}

// --- Hook untuk admin report (status filter, employeeId, outletId) ---
export function useAttendanceReport(params: AttendanceReportParams) {
  const { accessToken } = useEmployeeAuthStore();
  const isAdmin = !!accessToken; // super_admin atau outlet_admin

  return useQuery({
    queryKey: ["attendance", "report", params],
    queryFn: () => attendanceService.getReport(params),
    enabled: isAdmin && !!params.outletId, // minimal outletId atau employeeId? sesuaikan kebutuhan
    staleTime: 1000 * 60 * 5, // 5 menit
  });
}
