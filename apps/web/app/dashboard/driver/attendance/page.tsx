import { AttendancePageShell } from "@/components/attendance/AttendancePageShell";

export default function DriverAttendancePage() {
  return (
    <AttendancePageShell
      role="driver"
      backHref="/dashboard/driver"
      title="Absensi Driver"
    />
  );
}
