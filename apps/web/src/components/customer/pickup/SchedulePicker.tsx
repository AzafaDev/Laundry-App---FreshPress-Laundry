"use client";

import { CalendarClock } from "lucide-react";

const getTodayDateKey = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
};

export const PICKUP_DATES = Array.from({ length: 7 }, (_, offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const key = `${year}-${month}-${day}`;
  const label = offset === 0 ? "Hari ini" : date.toLocaleDateString("id-ID", { weekday: "short" });
  const dayNum = date.toLocaleDateString("id-ID", { day: "2-digit" });
  const monthStr = date.toLocaleDateString("id-ID", { month: "short" });
  return { key, label, day: dayNum, month: monthStr };
});

export { getTodayDateKey };

interface Props {
  selectedDate: string;
  onSelectDate: (key: string) => void;
}

export function SchedulePicker({ selectedDate, onSelectDate }: Props) {
  return (
    <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <CalendarClock className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-on-surface">Jadwal Pickup</h2>
          <p className="text-sm text-on-surface-variant">Pilih tanggal penjemputan.</p>
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-2">Tanggal</p>
        <div className="grid grid-cols-4 gap-2">
          {PICKUP_DATES.map((d) => (
            <button
              key={d.key}
              type="button"
              onClick={() => onSelectDate(d.key)}
              className={`py-3 px-2 rounded-2xl border-2 text-center transition-all ${selectedDate === d.key ? "border-primary bg-primary/5" : "border-outline-variant bg-surface hover:border-primary/40"}`}
            >
              <span className="block text-xs font-bold uppercase text-on-surface-variant">{d.label}</span>
              <span className="block text-xl font-bold text-on-surface">{d.day}</span>
              <span className="block text-xs text-on-surface-variant">{d.month}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
