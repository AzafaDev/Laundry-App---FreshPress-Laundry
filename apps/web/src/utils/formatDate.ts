import { Attendance } from "@/types/attendance.type";

export interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "on_time" | "late" | "absent";
}

export const formatTime = (timeStr: string | null | Date): string => {
  if (!timeStr) return "-";
  if (timeStr instanceof Date || (typeof timeStr === "string" && timeStr.includes("T"))) {
    const d = new Date(timeStr);
    const hours = String((d.getUTCHours() + 7) % 24).padStart(2, "0");
    const minutes = String(d.getUTCMinutes()).padStart(2, "0");
    return `${hours}:${minutes}`;
  }
  const parts = (timeStr as string).split(":");
  if (parts.length >= 2) {
    return `${parts[0]}:${parts[1]}`;
  }
  return timeStr as string;
};

export function toLogRecord(a: Attendance): AttendanceRecord {
  return {
    date: a.date,
    checkIn: formatTime(a.check_in_time),
    checkOut: formatTime(a.check_out_time),
    duration:
      a.total_hours != null
        ? `${Math.floor(a.total_hours)}h ${Math.round((a.total_hours % 1) * 60)}m`
        : "-",
    status: a.status === "on_time" ? "on_time" : a.status,
  };
}