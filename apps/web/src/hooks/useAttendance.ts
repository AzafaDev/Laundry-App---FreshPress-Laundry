// apps/web/src/hooks/useAttendance.ts

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { useSocket } from "./useSocket";
import { formatTime } from "@/utils/formatDate";
import { useGeolocation } from "./useGeolocation";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import type { AttendanceReportParams } from "@/types/attendance.type";

// --- Hook untuk employee (check-in/out, my logs, current shift) ---
export function useAttendance() {
  const [optimisticCheckedIn, setOptimisticCheckedIn] = useState(false);
  const queryClient = useQueryClient();
  const { on, emit } = useSocket();
  const { latitude, longitude, permissionDenied } = useGeolocation();

  const { accessToken, user } = useEmployeeAuthStore();
  const isEmployee = !!accessToken && !!user;
  const employeeId = user?.id;

  useEffect(() => {
    if (!isEmployee) return;
    const unsubscribe = on("attendance:updated", () => {
      queryClient.invalidateQueries({ queryKey: ["attendance", "today", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "logs", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "currentShift", employeeId] });
      toast.success("Status absensi diperbarui", {
        icon: "🔄",
        duration: 2000,
      });
    });
    return unsubscribe;
  }, [on, queryClient, isEmployee, employeeId]);

  const todayQuery = useQuery({
    queryKey: ["attendance", "today", employeeId],
    queryFn: attendanceService.checkTodayAttendance,
    staleTime: 0,
    refetchOnWindowFocus: true,
    enabled: isEmployee && !!employeeId,
  });

  const logsQuery = useQuery({
    queryKey: ["attendance", "logs", employeeId],
    queryFn: () => attendanceService.getMyLogs({}),
    staleTime: 0,
    enabled: isEmployee && !!employeeId,
  });

  const shiftQuery = useQuery({
    queryKey: ["attendance", "currentShift", employeeId],
    queryFn: attendanceService.getCurrentShift,
    staleTime: 0,
    enabled: isEmployee && !!employeeId,
  });

  const checkInMutation = useMutation({
    mutationFn: async () => {
      if (!latitude || !longitude) {
        throw new Error("Lokasi tidak tersedia. Aktifkan GPS untuk check-in.");
      }
      return attendanceService.checkIn({ lat: latitude, lng: longitude });
    },
    onMutate: () => {
      setOptimisticCheckedIn(true);
      toast.loading("Merekam check-in...", { id: "attendance" });
    },
    onSuccess: (data) => {
      toast.success(`Check-in berhasil pukul ${formatTime(data.check_in_time)}`, {
        id: "attendance",
      });
      queryClient.invalidateQueries({ queryKey: ["attendance", "today", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "logs", employeeId] });
      emit("attendance:checked-in", { userId: data.user_id });
    },
    onError: (error: any) => {
      setOptimisticCheckedIn(false);
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
      queryClient.invalidateQueries({ queryKey: ["attendance", "today", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "logs", employeeId] });
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
    optimisticCheckedIn || (today?.check_in_time != null && today.check_out_time == null);

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
      queryClient.invalidateQueries({ queryKey: ["attendance", "today", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "logs", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "currentShift", employeeId] });
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
    getRecentLogs: async (limit = 5) => {
      return attendanceService.getMyLogs({ page: 1, limit });
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