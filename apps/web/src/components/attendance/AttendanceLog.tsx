interface AttendanceRecord {
  date: string;
  checkIn: string;
  checkOut: string;
  duration: string;
  status: "on-time" | "late" | "absent";
}

const statusStyles: Record<AttendanceRecord["status"], string> = {
  "on-time": "bg-primary/10 text-primary",
  late: "bg-amber-100 text-amber-700",
  absent: "bg-error/10 text-error",
};

const statusLabels: Record<AttendanceRecord["status"], string> = {
  "on-time": "Tepat Waktu",
  late: "Terlambat",
  absent: "Absen",
};

interface AttendanceLogProps {
  records: AttendanceRecord[];
}

export function AttendanceLog({ records }: AttendanceLogProps) {
  if (records.length === 0) {
    return (
      <div className="text-center py-8 text-on-surface-variant text-sm">
        Belum ada riwayat absensi.
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((record, i) => (
        <div
          key={i}
          className="flex items-center justify-between p-4 bg-surface-container-lowest border border-outline-variant rounded-xl"
        >
          <div>
            <p className="text-sm font-bold text-on-surface">{record.date}</p>
            <p className="text-xs text-on-surface-variant">
              {record.checkIn} — {record.checkOut}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-on-surface-variant">{record.duration}</p>
            <span
              className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${statusStyles[record.status]}`}
            >
              {statusLabels[record.status]}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}
