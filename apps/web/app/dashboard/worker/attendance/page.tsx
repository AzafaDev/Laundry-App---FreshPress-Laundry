import { AttendancePageShell } from "@/components/attendance/AttendancePageShell";

export default function WorkerAttendancePage() {
  return (
    <AttendancePageShell
      role="worker"
      backHref="/dashboard/worker"
      title="Absensi Worker"
    />
  );
}
