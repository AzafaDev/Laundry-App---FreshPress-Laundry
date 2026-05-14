import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";

export function useAttendance() {
  const queryClient = useQueryClient();

  const todayQuery = useQuery({
    queryKey: ["attendance", "today"],
    queryFn: attendanceService.checkTodayAttendance,
  });

  const logsQuery = useQuery({
    queryKey: ["attendance", "logs"],
    queryFn: () => attendanceService.getMyLogs({}),
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

  return {
    checkedIn: today?.check_in_time != null && today.check_out_time == null,
    checkInTime: today?.check_in_time ?? undefined,
    checkOutTime: today?.check_out_time ?? undefined,
    attendanceId: today?.id ?? null,
    records: logsQuery.data?.data ?? [],
    isLoading: todayQuery.isLoading || logsQuery.isLoading,
    isError: todayQuery.isError || logsQuery.isError,
    error: todayQuery.error ?? logsQuery.error,
    checkIn: checkInMutation.mutate,
    checkOut: (id: string) => checkOutMutation.mutate(id),
    isCheckingIn: checkInMutation.isPending,
    isCheckingOut: checkOutMutation.isPending,
    refetch: () => {
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
  };
}
