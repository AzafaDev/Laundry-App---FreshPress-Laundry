"use client";

import { Calendar } from "lucide-react";

const dateFormatter = new Intl.DateTimeFormat("id-ID", {
  day: "2-digit",
  month: "short",
});

const weekdayFormatter = new Intl.DateTimeFormat("id-ID", {
  weekday: "short",
});

const toDateKey = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const dates = Array.from({ length: 4 }, (_, offset) => {
  const date = new Date();
  date.setDate(date.getDate() + offset);

  const parts = dateFormatter.formatToParts(date);
  const day = parts.find((part) => part.type === "day")?.value ?? "";
  const month = parts.find((part) => part.type === "month")?.value ?? "";

  return {
    label: offset === 0 ? "Hari ini" : weekdayFormatter.format(date),
    day,
    month,
    value: toDateKey(date),
  };
});

const timeSlots = [
  "08:00 AM - 10:00 AM",
  "10:00 AM - 12:00 PM",
  "01:00 PM - 03:00 PM",
  "05:00 PM - 07:00 PM",
];

interface Props {
  selectedDate: string;
  selectedTime: string;
  onDateChange: (value: string) => void;
  onTimeChange: (value: string) => void;
  onBack: () => void;
}

export const SchedulePicker = ({
  selectedDate,
  selectedTime,
  onDateChange,
  onTimeChange,
  onBack,
}: Props) => (
  <div className="bg-surface rounded-xl border border-outline-variant p-4 md:p-6 shadow-sm space-y-4">
    <h2 className="text-lg font-bold flex items-center gap-2">
      <Calendar className="text-secondary w-5 h-5" />
      Schedule Pickup
    </h2>
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {dates.map((d) => (
        <button
          key={d.value}
          onClick={() => onDateChange(d.value)}
          className={`p-3 text-center rounded-xl border-2 transition-colors ${
            selectedDate === d.value
              ? "border-primary bg-surface-container-low"
              : "border-outline-variant bg-surface hover:bg-surface-container-low"
          }`}
        >
          <span className="block text-xs font-bold uppercase text-on-surface-variant">
            {d.label}
          </span>
          <span className="block text-xl font-bold">{d.day}</span>
          <span className="block text-xs text-on-surface-variant">
            {d.month}
          </span>
        </button>
      ))}
    </div>
    <div>
      <label className="block text-sm font-bold text-on-surface-variant mb-2">
        Preferred Time Window
      </label>
      <div className="flex flex-wrap gap-2">
        {timeSlots.map((slot) => (
          <button
            key={slot}
            onClick={() => onTimeChange(slot)}
            className={`px-4 py-2 rounded-full border text-sm font-bold transition-all ${
              selectedTime === slot
                ? "bg-primary border-primary text-on-primary shadow-sm"
                : "bg-surface-container-high border-outline-variant text-on-surface hover:bg-primary hover:text-on-primary"
            }`}
          >
            {slot}
          </button>
        ))}
      </div>
    </div>
    <button
      onClick={onBack}
      className="w-full py-2.5 border border-outline-variant text-on-surface-variant rounded-lg font-bold hover:bg-surface-container-low"
    >
      Back
    </button>
  </div>
);
