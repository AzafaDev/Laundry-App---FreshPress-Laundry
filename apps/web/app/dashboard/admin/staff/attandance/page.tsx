"use client";

import Image from "next/image";
import {
  LayoutDashboard,
  ReceiptText,
  Package,
  Store,
  BadgeCheck,
  BarChart3,
  Shirt,
  CalendarDays,
  Download,
  Briefcase,
  Clock,
  Timer,
  CalendarX,
  TrendingUp,
  HelpCircle,
  ShieldCheck,
  Home,
  User,
  Truck,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const calendarDays = [
  { day: 25, status: "other-month" },
  { day: 26, status: "other-month" },
  { day: 27, status: "other-month" },
  { day: 28, status: "other-month" },
  { day: 29, status: "other-month" },
  { day: 30, status: "other-month" },
  { day: 1, status: "present" },
  { day: 2, status: "present" },
  { day: 3, status: "present" },
  { day: 4, status: "late" },
  { day: 5, status: "present" },
  { day: 6, status: "present" },
  { day: 7, status: "absent" },
  { day: 8, status: "absent" },
  { day: 9, status: "present" },
  { day: 10, status: "absent" },
  { day: 11, status: "present" },
  { day: 12, status: "half-day" },
  { day: 13, status: "present" },
  { day: 14, status: "absent" },
  { day: 15, status: "absent" },
];

const recentLogs = [
  {
    date: "Oct 13, 2023",
    shift: "Friday Shift",
    status: "Present",
    statusColor: "bg-primary-container text-on-primary-container",
    clockIn: "08:55 AM",
    clockOut: "06:12 PM",
    total: "8h 17m",
    totalColor: "text-primary",
    note: '"Extra volume processed"',
  },
  {
    date: "Oct 12, 2023",
    shift: "Thursday Shift",
    status: "Present",
    statusColor: "bg-primary-container text-on-primary-container",
    clockIn: "09:02 AM",
    clockOut: "01:30 PM",
    total: "4h 28m",
    totalColor: "text-secondary",
    note: '"Doctor appointment"',
  },
  {
    date: "Oct 10, 2023",
    shift: "Tuesday Shift",
    status: "Absent",
    statusColor: "bg-error-container text-on-error-container",
    clockIn: null,
    clockOut: null,
    total: "0h 0m",
    totalColor: "text-error",
    note: '"Family emergency"',
  },
];

export default function StaffAttendanceLogPage() {
  return (
    <div className="min-h-screen bg-background text-on-surface pb-24 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <nav className="hidden md:flex items-center gap-6">
          <a
            href="#"
            className="text-on-surface-variant hover:bg-surface-container-low px-2 py-1 rounded-lg text-sm"
          >
            Dashboard
          </a>
          <a
            href="#"
            className="text-primary font-semibold border-b-2 border-primary text-sm px-2 py-1"
          >
            Staff
          </a>
        </nav>
        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBguzzoNeDon4JxXNUBM5-c1XH8Y2L5oA7QFi2xKFFxF9f4LnDsk4kDH19AJZ6B7n-qYjge6pTqZdv4dv0HmTAO0KSuEPoCWkz3Q01k-AnE2Jg5IDjfMGcwPCYCmC9cSWUfMMUetjd1Xmbi9hxvhWnbb5BW29ECcfxdb5dE1W3uRG-58Fuxf6TNR3dV90j7fCx-GXkaP0xwI-4Pfmpd18Dnsfz-JO0s6ra8kw_jPjWxwudj1r4hCmUjIrkPtnoYeMLj6RpjZtWEe3U"
            alt="Admin avatar"
            width={40}
            height={40}
            className="object-cover"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <div className="w-12 h-12 rounded-xl bg-primary text-on-primary flex items-center justify-center">
            <BadgeCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-sm font-bold text-on-surface">Super Admin</p>
            <p className="text-xs text-on-surface-variant">
              admin@freshpress.com
            </p>
          </div>
        </div>
        <nav className="space-y-1 px-2">
          <SidebarLink icon={LayoutDashboard} label="Dashboard" />
          <SidebarLink icon={ReceiptText} label="Orders" />
          <SidebarLink icon={Package} label="Inventory" />
          <SidebarLink icon={Store} label="Outlets" />
          <SidebarLink icon={BadgeCheck} label="Staff" active />
          <SidebarLink icon={BarChart3} label="Reports" />
        </nav>
      </aside>

      {/* Main Content */}
      <main className="lg:pl-72 p-4 md:p-8">
        <div className="max-w-[1280px] mx-auto">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
            <div>
              <h2 className="text-3xl font-bold text-on-surface">
                Attendance Log
              </h2>
              <p className="text-base text-on-surface-variant">
                Review your work hours and punctuality for October 2023
              </p>
            </div>
            <div className="flex gap-2">
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors text-sm">
                <CalendarDays className="w-5 h-5" /> October 2023
              </button>
              <button className="flex items-center gap-1 px-4 py-2 rounded-lg bg-primary text-on-primary hover:opacity-90 transition-all text-sm">
                <Download className="w-5 h-5" /> Export
              </button>
            </div>
          </div>

          {/* Stats Grid */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <StatCard
              icon={Briefcase}
              iconBg="bg-primary-fixed"
              iconColor="text-primary"
              trend="+2 days"
              trendColor="text-primary"
              label="Total Days Worked"
              value="22 / 26"
            />
            <StatCard
              icon={Clock}
              iconBg="bg-secondary-fixed"
              iconColor="text-secondary"
              trend="98% Target"
              trendColor="text-secondary"
              label="Avg. Punctuality"
              value="94.2%"
            />
            <StatCard
              icon={Timer}
              iconBg="bg-tertiary-fixed"
              iconColor="text-tertiary"
              trend="Overtime: 4h"
              trendColor="text-tertiary"
              label="Total Hours"
              value="176.5 h"
            />
            <StatCard
              icon={CalendarX}
              iconBg="bg-error-container"
              iconColor="text-error"
              trend="1 Unexcused"
              trendColor="text-error"
              label="Total Absences"
              value="2 Days"
            />
          </section>

          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 items-start">
            {/* Calendar */}
            <section className="xl:col-span-2 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm overflow-hidden">
              <div className="p-6 border-b border-outline-variant flex items-center justify-between">
                <h3 className="text-xl font-bold text-on-surface">
                  Attendance Calendar
                </h3>
                <div className="flex items-center gap-4">
                  <Legend color="bg-primary-container" label="Present" />
                  <Legend color="bg-secondary-container" label="Late" />
                  <Legend color="bg-error-container" label="Absent" />
                </div>
              </div>
              <div className="p-4">
                <div className="grid grid-cols-7 text-center pb-2 mb-2 text-sm font-bold text-on-surface-variant border-b border-outline-variant">
                  <div>Mon</div>
                  <div>Tue</div>
                  <div>Wed</div>
                  <div>Thu</div>
                  <div>Fri</div>
                  <div>Sat</div>
                  <div>Sun</div>
                </div>
                <div className="grid grid-cols-7 gap-2">
                  {calendarDays.map((d, i) => (
                    <CalendarDay key={i} day={d.day} status={d.status} />
                  ))}
                </div>
              </div>
            </section>

            {/* Recent Logs */}
            <section className="flex flex-col gap-4">
              <div className="bg-surface-container-lowest border border-outline-variant rounded-xl shadow-sm h-full">
                <div className="p-6 border-b border-outline-variant">
                  <h3 className="text-xl font-bold text-on-surface">
                    Recent Logs
                  </h3>
                </div>
                <div className="p-4 flex flex-col gap-2 overflow-y-auto max-h-[600px] hide-scrollbar">
                  {recentLogs.map((log, i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-outline-variant bg-surface hover:bg-surface-container-low transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {log.date}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            {log.shift}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-bold ${log.statusColor}`}
                        >
                          {log.status}
                        </span>
                      </div>
                      {log.clockIn ? (
                        <div className="flex items-center justify-between py-2 border-y border-outline-variant/30 mb-2">
                          <div className="flex flex-col">
                            <span className="text-xs text-outline">
                              Clock In
                            </span>
                            <span className="text-sm font-bold">
                              {log.clockIn}
                            </span>
                          </div>
                          <TrendingUp className="w-4 h-4 text-outline" />
                          <div className="flex flex-col text-right">
                            <span className="text-xs text-outline">
                              Clock Out
                            </span>
                            <span className="text-sm font-bold">
                              {log.clockOut}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <div className="py-2 border-y border-outline-variant/30 mb-2 text-center">
                          <p className="text-xs text-error font-medium">
                            No clock-in data recorded
                          </p>
                        </div>
                      )}
                      <div className="flex justify-between items-center">
                        <p className={`text-xs font-bold ${log.totalColor}`}>
                          {log.total} Total
                        </p>
                        <p className="text-xs italic text-on-surface-variant">
                          {log.note}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4">
                  <button className="w-full py-2 rounded-lg border-2 border-dashed border-outline-variant text-on-surface-variant text-sm hover:bg-surface-container-low transition-all">
                    View Older Records
                  </button>
                </div>
              </div>
            </section>
          </div>

          {/* Policy Section */}
          <section className="bg-surface-container-high/30 border border-outline-variant rounded-xl p-6 flex flex-col md:flex-row items-center gap-6 mt-6">
            <div className="relative w-full md:w-1/3 aspect-video rounded-lg overflow-hidden border border-outline-variant">
              <Image
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuD8Prve1RT5C2tqjI7Xp62uAUO6-v3dLgHXmNtj_5qoY4d-kX9EOdaJ6dmC0DcL0OIOzoeuDnIV2ivSBlp1xdcIq-lfiyxqN-D_i70E_vZR-CQ1OtmyDNeo6W3t88n0jQSJS-3ffi5axaitGzSHqoL-tU_lNf-1RsdO3iMlFNtuE9cs-ULRt0cijRS1BpSY29l7ep4cSxlSSvCUBTlRBYWNMRwCC2-6U84VtzqLBASY5NTKIe1ms81TJGLiABSHu8sppz8MjawVFyw"
                alt="Facility"
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                <p className="text-white text-xs font-bold">
                  Corporate Policy Update 2023
                </p>
              </div>
            </div>
            <div className="flex-1">
              <h4 className="text-xl font-bold text-on-surface mb-2">
                Staff Attendance Policy
              </h4>
              <p className="text-base text-on-surface-variant mb-4">
                Remember to clock in at least 5 minutes before your shift starts
                to ensure a smooth transition. Late clock-ins exceeding 15
                minutes without prior notice may impact your monthly punctuality
                bonus.
              </p>
              <div className="flex gap-4">
                <div className="flex items-center gap-1 text-primary">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-xs font-bold">
                    Punctuality Bonus Active
                  </span>
                </div>
                <div className="flex items-center gap-1 text-on-surface-variant">
                  <HelpCircle className="w-4 h-4" />
                  <span className="text-xs font-bold">View Guidelines</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

// ---------- Helpers ----------
const SidebarLink = ({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ElementType;
  label: string;
  active?: boolean;
}) => (
  <a
    href="#"
    className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
      active
        ? "bg-secondary-container text-on-secondary-container font-bold translate-x-1"
        : "text-on-surface-variant hover:bg-surface-container-high"
    }`}
  >
    <Icon className="w-5 h-5" />
    {label}
  </a>
);

const StatCard = ({
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  trendColor,
  label,
  value,
}: {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend: string;
  trendColor: string;
  label: string;
  value: string;
}) => (
  <div className="bg-surface-container-lowest border border-outline-variant p-6 rounded-xl shadow-sm">
    <div className="flex justify-between items-start mb-2">
      <span className={`${iconBg} ${iconColor} p-2 rounded-lg`}>
        <Icon className="w-5 h-5" />
      </span>
      <span className={`text-xs font-medium ${trendColor}`}>{trend}</span>
    </div>
    <p className="text-sm text-on-surface-variant">{label}</p>
    <p className="text-xl font-bold text-on-surface">{value}</p>
  </div>
);

const Legend = ({ color, label }: { color: string; label: string }) => (
  <div className="flex items-center gap-1">
    <span className={`w-3 h-3 rounded-full ${color}`} />
    <span className="text-xs">{label}</span>
  </div>
);

const CalendarDay = ({ day, status }: { day: number; status: string }) => {
  const isOtherMonth = status === "other-month";
  const isAbsent = status === "absent";
  const isLate = status === "late";
  const isPresent = status === "present" || status === "half-day";

  let bg = "bg-surface p-2 rounded-lg border border-transparent opacity-40";
  if (isPresent)
    bg =
      "bg-primary-container/10 border-2 border-primary-container p-2 rounded-lg relative";
  if (isLate)
    bg =
      "bg-secondary-container/20 border-2 border-secondary-container p-2 rounded-lg relative";
  if (isAbsent)
    bg = "bg-error-container/20 border-2 border-error p-2 rounded-lg relative";
  if (!isAbsent && !isLate && !isPresent)
    bg = "bg-surface p-2 rounded-lg border border-outline-variant";

  return (
    <div className={`h-24 md:h-32 ${bg} text-sm`}>
      <span>{day}</span>
      {status === "present" && (
        <span className="absolute bottom-2 right-2 text-primary font-bold text-xs">
          Present
        </span>
      )}
      {status === "late" && (
        <span className="absolute bottom-2 right-2 text-secondary font-bold text-[10px] md:text-xs">
          Late (15m)
        </span>
      )}
      {status === "half-day" && (
        <span className="absolute bottom-2 right-2 text-primary font-bold text-[10px] md:text-xs">
          Half-Day
        </span>
      )}
      {status === "absent" && (
        <span className="absolute bottom-2 right-2 text-error font-bold text-xs">
          Absent
        </span>
      )}
    </div>
  );
};
