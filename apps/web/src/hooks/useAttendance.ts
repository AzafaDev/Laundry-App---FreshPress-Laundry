import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";

export function useAttendance() {
  const queryClient = useQueryClient();

  const todayQuery = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: attendanceService.checkTodayAttendance,
    staleTime: 1000 * 60 * 5,
  });

  const logsQuery = useQuery({
    queryKey: ["attendance", "logs"],
    queryFn: () => attendanceService.getMyLogs({}),
    staleTime: 1000 * 60 * 5,
  });

  const shiftQuery = useQuery({
    queryKey: ["attendance", "currentShift"],
    queryFn: attendanceService.getCurrentShift,
    staleTime: 1000 * 60 * 15,
  });

  const checkInMutation = useMutation({
    mutationFn: attendanceService.checkIn,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  });

  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      attendanceService.checkOut(attendanceId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
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
    checkIn: checkInMutation.mutate, // untuk callback biasa
    checkInAsync: checkInMutation.mutateAsync, // untuk async/await
    checkOut: checkOutMutation.mutate,
    checkOutAsync: checkOutMutation.mutateAsync,
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    fetchNextLogs: (page: number) => {
      return attendanceService.getMyLogs({ page, limit: 20 });
    },
  };
}
