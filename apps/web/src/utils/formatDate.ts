// Date formatting utility

import { Attendance } from "@/types/attendance.type";

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "on-time" | "late" | "absent";
}

export const STATUS_STYLES: Record<string, string> = {
  "on-time": "bg-primary/10 text-primary",
  late: "bg-amber-100 text-amber-700",
  absent: "bg-error/10 text-error",
};

export const STATUS_LABELS: Record<string, string> = {
  "on-time": "Tepat Waktu",
  late: "Terlambat",
  absent: "Absen",
};

export function toLogRecord(a: Attendance): AttendanceRecord {
  const date = new Date(a.attendance_date);
  return {
    date: date.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    checkIn: a.check_in_time ?? "-",
    checkOut: a.check_out_time ?? "-",
    duration:
      a.total_hours != null
        ? `${Math.floor(a.total_hours)}h ${Math.round((a.total_hours % 1) * 60)}m`
        : "-",
    status: a.status === "on_time" ? "on-time" : a.status,
  };
}
