"use client";

import { useState } from "react";
import {
  ArrowRight,
  Calendar,
  CalendarDays,
  CheckCircle,
  Clock,
  Lock,
  MapPin,
  Search,
  ShieldCheck,
  Store,
  Sun,
  Sunrise,
  Sunset,
  Truck,
  AlertTriangle,
} from "lucide-react";
import { TopBar } from "@/components/dashboard/TopBar";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { BottomNav } from "@/components/layout/BottomNav";

// -- Dummy Data ---------------------------------------------------------------------------
const dates = [
  { label: "MON", day: "24", available: true },
  { label: "TUE", day: "25", available: true },
  { label: "WED", day: "26", available: true },
  { label: "THU", day: "27", available: true },
  { label: "FRI", day: "28", available: false },
];

const timeSlots = [
  { icon: Sun, label: "09:00 - 11:00", active: false, value: "09:00" },
  { icon: Sunrise, label: "11:00 - 13:00", active: true, value: "11:00" },
  { icon: Sunset, label: "15:00 - 17:00", active: false, value: "15:00" },
];

const outlets = [
  {
    id: 1,
    name: "Main City Express",
    distance: "0.8 miles",
    hours: "Open until 10 PM",
    icon: Store,
  },
  {
    id: 2,
    name: "Downtown FreshPress",
    distance: "2.4 miles",
    hours: "Open until 8 PM",
    icon: Store,
  },
];

// -- Component ----------------------------------------------------------------------------
export default function RequestPickupPage() {
  const [selectedDate, setSelectedDate] = useState("MON");
  const [selectedTime, setSelectedTime] = useState("11:00");
  const [selectedOutlet, setSelectedOutlet] = useState(1);
  const [verified] = useState(false); // disabled trigger

  const handleRequestPickup = () => {
    console.log("Request pickup", {
      selectedDate,
      selectedTime,
      selectedOutlet,
    });
    alert("Request submitted (demo).");
  };

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      <TopBar />
      <Sidebar />

      <main className="lg:pl-72">
        <div className="max-w-container-max mx-auto px-4 md:px-8 py-6">
          {/* ---------- Verification AlertTriangle Banner ---------- */}
          <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-xl border border-error/20 flex items-start gap-4">
            <AlertTriangle className="w-6 h-6 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-base">Account Not Verified</h3>
              <p className="text-sm opacity-90">
                Please verify your mobile number in Profile settings before
                scheduling your first pickup.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* ---------- LEFT COLUMN ---------- */}
            <div className="lg:col-span-8 flex flex-col gap-6">
              {/* Pickup Address */}
              <section className="bg-surface-container-lowest border border-outline-variant p-4 md:p-6 rounded-xl shadow-sm">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin className="text-primary w-6 h-6" />
                    <h2 className="text-xl font-bold">Pickup Address</h2>
                  </div>
                  <button className="text-primary font-bold text-sm hover:bg-surface-container-low px-4 py-2 rounded-lg transition-colors">
                    Change
                  </button>
                </div>
                <div className="p-4 bg-surface-container-low rounded-lg border border-outline-variant/50">
                  <p className="font-bold text-base">Home Address</p>
                  <p className="text-on-surface-variant text-base">
                    123 Fresh Lane, Apt 4B, Clean District, Metropolis 54001
                  </p>
                  <p className="text-xs text-outline mt-2">
                    +1 (555) 0123-4567
                  </p>
                </div>
              </section>

              {/* Schedule Picker */}
              <section className="bg-surface-container-lowest border border-outline-variant p-4 md:p-6 rounded-xl shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <Calendar className="text-primary w-6 h-6" />
                  <h2 className="text-xl font-bold">Select Schedule</h2>
                </div>

                {/* Dates */}
                <div className="mb-6">
                  <label className="block text-sm font-bold mb-2">
                    Available Dates
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
                    {dates.map((d) => (
                      <button
                        key={d.label}
                        disabled={!d.available}
                        onClick={() => setSelectedDate(d.label)}
                        className={`flex-shrink-0 flex flex-col items-center justify-center w-16 h-20 rounded-xl border-2 transition-all ${
                          selectedDate === d.label
                            ? "border-primary bg-primary-container text-on-primary-container"
                            : "border-outline-variant bg-surface hover:border-primary"
                        } ${!d.available ? "opacity-50 cursor-not-allowed" : ""}`}
                      >
                        <span className="text-xs">{d.label}</span>
                        <span className="text-xl font-bold">{d.day}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Time Slots */}
                <div>
                  <label className="block text-sm font-bold mb-2">
                    Time Slots
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {timeSlots.map((slot) => (
                      <button
                        key={slot.value}
                        onClick={() => setSelectedTime(slot.value)}
                        className={`p-4 text-sm font-bold border rounded-lg transition-all flex items-center gap-2 ${
                          selectedTime === slot.value
                            ? "border-2 border-primary bg-primary-container text-on-primary-container"
                            : "border-outline-variant hover:border-primary"
                        }`}
                      >
                        <slot.icon className="w-5 h-5" />
                        {slot.label}
                      </button>
                    ))}
                  </div>
                </div>
              </section>

              {/* Outlet Selection */}
              <section className="bg-surface-container-lowest border border-outline-variant p-4 md:p-6 rounded-xl shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Store className="text-primary w-6 h-6" />
                    <h2 className="text-xl font-bold">Nearest Branch</h2>
                  </div>
                  <div className="relative flex-1 max-w-[320px]">
                    <input
                      className="w-full pl-10 pr-4 py-2 bg-surface rounded-lg border border-outline-variant focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                      placeholder="Search branch..."
                      type="text"
                    />
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-outline" />
                  </div>
                </div>

                <div className="space-y-2">
                  {outlets.map((outlet) => (
                    <div
                      key={outlet.id}
                      onClick={() => setSelectedOutlet(outlet.id)}
                      className={`flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                        selectedOutlet === outlet.id
                          ? "border-2 border-primary bg-primary-container/10"
                          : "border border-outline-variant hover:border-primary bg-surface"
                      }`}
                    >
                      <div className="w-12 h-12 rounded-lg bg-surface flex items-center justify-center">
                        <outlet.icon
                          className={
                            selectedOutlet === outlet.id
                              ? "text-primary w-6 h-6"
                              : "text-outline w-6 h-6"
                          }
                        />
                      </div>
                      <div className="flex-1">
                        <p className="font-bold text-base">{outlet.name}</p>
                        <p className="text-xs text-on-surface-variant">
                          {outlet.distance} away • {outlet.hours}
                        </p>
                      </div>
                      {selectedOutlet === outlet.id && (
                        <CheckCircle className="text-primary w-6 h-6" />
                      )}
                    </div>
                  ))}
                </div>
              </section>
            </div>

            {/* ---------- RIGHT COLUMN ---------- */}
            <aside className="lg:col-span-4 sticky top-24">
              <div className="bg-surface-container-highest border border-outline-variant p-4 md:p-6 rounded-xl shadow-lg">
                <h2 className="text-xl font-bold mb-6">Pickup Summary</h2>

                <div className="space-y-4 mb-8">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="w-5 h-5 text-on-surface-variant" />
                      <span className="text-sm text-on-surface-variant">
                        Date
                      </span>
                    </div>
                    <p className="font-bold text-sm">{selectedDate}, 24 Oct</p>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-on-surface-variant" />
                      <span className="text-sm text-on-surface-variant">
                        Time
                      </span>
                    </div>
                    <p className="font-bold text-sm">
                      {timeSlots.find((t) => t.value === selectedTime)?.label}
                    </p>
                  </div>

                  <div className="flex justify-between items-start gap-4">
                    <div className="flex items-center gap-2">
                      <Truck className="w-5 h-5 text-on-surface-variant" />
                      <span className="text-sm text-on-surface-variant">
                        Service
                      </span>
                    </div>
                    <p className="font-bold text-sm">Standard Pickup</p>
                  </div>

                  <div className="pt-4 border-t border-outline-variant">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold">
                        Estimated Cost
                      </span>
                      <span className="text-xl font-bold text-primary">
                        $0.00
                      </span>
                    </div>
                    <p className="text-xs text-outline mt-1 text-right">
                      Billed after cleaning
                    </p>
                  </div>
                </div>

                {/* CTA - Disabled if not verified */}
                <button
                  disabled={!verified}
                  onClick={handleRequestPickup}
                  className={`w-full py-4 rounded-lg font-bold flex items-center justify-center gap-2 ${
                    verified
                      ? "bg-primary text-on-primary hover:opacity-90 active:scale-[0.98] transition-all"
                      : "bg-outline text-on-primary opacity-60 cursor-not-allowed"
                  }`}
                >
                  <Lock className="w-5 h-5" />
                  Request Pickup
                </button>
                {!verified && (
                  <p className="text-center text-sm text-error mt-4 font-medium">
                    Verification required to proceed
                  </p>
                )}
              </div>

              {/* Quality Assurance Card */}
              <div className="mt-6 p-4 bg-primary-container/10 border border-primary/20 rounded-xl flex items-center gap-4">
                <div className="bg-primary text-on-primary w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold">Hygiene Guaranteed</p>
                  <p className="text-xs opacity-80">
                    Our cleaning experts follow strict sanitization protocols
                    for every load.
                  </p>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
