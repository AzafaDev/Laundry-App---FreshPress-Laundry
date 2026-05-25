// Date formatting utility

import { Attendance } from "@/types/attendance.type";

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "on-time" | "late" | "absent";
}

export const formatTime = (isoString: string | null): string => {
  if (!isoString) return "-";
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return "Invalid Date";
  return date.toLocaleTimeString("id-ID", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export function toLogRecord(a: Attendance): AttendanceRecord {
  const date = new Date(a.date);
  const validDate = !isNaN(date.getTime()) ? date : new Date();

  return {
    date: validDate.toLocaleDateString("id-ID", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    }),
    checkIn: formatTime(a.check_in_time),
    checkOut: formatTime(a.check_out_time),
    duration:
      a.total_hours != null
        ? `${Math.floor(a.total_hours)}h ${Math.round((a.total_hours % 1) * 60)}m`
        : "-",
    status: a.status === "on_time" ? "on-time" : a.status,
  };
}
