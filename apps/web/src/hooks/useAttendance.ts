import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { formatTime } from "@/utils/formatDate";
import { useGeolocation } from "./useGeolocation";
import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import type { AttendanceReportParams } from "@/types/attendance.type";

export function useAttendance() {
  const [optimisticCheckedIn, setOptimisticCheckedIn] = useState(false);
  const queryClient = useQueryClient();
  const { latitude, longitude, permissionDenied } = useGeolocation();

  const { user } = useEmployeeAuthStore();
  const isEmployee = !!user;
  const employeeId = user?.id;

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

  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const refetchedOnExpireRef = useRef(false);

  useEffect(() => {
    if (shiftQuery.data != null) {
      setRemainingSeconds(Math.round(shiftQuery.data.remainingSeconds));
      refetchedOnExpireRef.current = false;
    }
  }, [shiftQuery.data]);

  useEffect(() => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (!isEmployee) return;

    intervalRef.current = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1 && !refetchedOnExpireRef.current) {
          refetchedOnExpireRef.current = true;
          queryClient.invalidateQueries({
            queryKey: ["attendance", "currentShift", employeeId],
          });
          return 0;
        }
        return prev <= 0 ? 0 : prev - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isEmployee, employeeId, queryClient]);

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
      let durationStr = "-";
      if (data.check_in_time && data.check_out_time) {
        const diffMs = new Date(data.check_out_time).getTime() - new Date(data.check_in_time).getTime();
        const totalMins = Math.round(diffMs / 60000);
        const h = Math.floor(totalMins / 60);
        const m = totalMins % 60;
        durationStr = h > 0 ? `${h} jam ${m} menit` : `${m} menit`;
      }
      toast.success(
        `Check-out berhasil. Total: ${durationStr}`,
        { id: "attendance" },
      );
      queryClient.invalidateQueries({ queryKey: ["attendance", "today", employeeId] });
      queryClient.invalidateQueries({ queryKey: ["attendance", "logs", employeeId] });
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Gagal check-out", {
        id: "attendance",
      });
    },
  });

  const today = todayQuery.data;

  useEffect(() => {
    if (today?.check_out_time != null) setOptimisticCheckedIn(false);
  }, [today?.check_out_time]);

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
    remainingSeconds,
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
    fetchLogs: attendanceService.getMyLogs,
  };
}

export function useAttendanceReport(params: AttendanceReportParams) {
  const { user: adminUser } = useEmployeeAuthStore();
  const isAdmin = !!adminUser;

  return useQuery({
    queryKey: ["attendance", "report", params],
    queryFn: () => attendanceService.getReport(params),
    enabled: isAdmin,
    staleTime: 1000 * 60 * 5, 
  });
}