import { Clock, AlertCircle } from "lucide-react";

type Shift = "Morning" | "Afternoon" | "Night";

const shiftColors: Record<Shift, string> = {
  Morning: "bg-sky-100 text-sky-700 border-sky-200",
  Afternoon: "bg-amber-100 text-amber-700 border-amber-200",
  Night: "bg-indigo-100 text-indigo-700 border-indigo-200",
};

const shiftLabels: Record<Shift, string> = {
  Morning: "Pagi (06:00-14:00)",
  Afternoon: "Siang (14:00-22:00)",
  Night: "Malam (22:00-06:00)",
};

interface ShiftBadgeProps {
  shift: Shift | null;
}

export function ShiftBadge({ shift }: ShiftBadgeProps) {
  if (!shift) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-1 bg-surface-container-high text-on-surface-variant text-xs rounded-full border border-outline-variant">
        <AlertCircle className="w-3.5 h-3.5" />
        Tidak ada shift aktif
      </span>
    );
  }

  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-1 text-xs rounded-full border font-medium ${shiftColors[shift]}`}
    >
      <Clock className="w-3.5 h-3.5" />
      {shiftLabels[shift]}
    </span>
  );
}
