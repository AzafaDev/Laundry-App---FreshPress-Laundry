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
  Download,
  TrendingUp,
  Truck,
  Wrench,
  Search,
  ListFilter,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  // Added icon for Worker
  Home,
  User,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";

const staffRows = [
  {
    name: "Marcus Chen",
    id: "FP-8821",
    role: "Driver",
    roleIcon: Truck,
    roleColor: "bg-secondary-container/20 text-secondary",
    outlet: "Downtown Hub",
    clockIn: "08:00 AM",
    punctuality: "On Time",
    punctualityColor: "text-primary",
    status: "On Shift",
    statusColor: "bg-primary/10 text-primary border border-primary/20",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDLShmpy--uAGG3m_iQuqkOsuO8OIPxH-7mSQS05lQiA1QcqDHH_8xEof867Yux54BHHB8ax9fAfH2WV7WjELfghJ4okQyfTimvjZitnIWu7F8s0aPY0l3WDVOspXsGkYHFPLTO78cIH8Nbdpj9o_I_Win-DCFokn-sk9vW0Jyn0MIReA5gJsN5yDURaWJozi4thhVOQRSKTNbsx6dlv08NuoqFEBc3w6XaThzRN9W2dQNgCCewkvX_1EkXTlWw7IkPzKg5bAh2oQA",
  },
  {
    name: "Sarah Jenkins",
    id: "FP-3392",
    role: "Worker",
    roleIcon: Wrench,
    roleColor: "bg-primary-container/20 text-primary",
    outlet: "Westside Branch",
    clockIn: "08:15 AM",
    punctuality: "Late (15m)",
    punctualityColor: "text-tertiary",
    status: "On Shift",
    statusColor: "bg-primary/10 text-primary border border-primary/20",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuANKRQVajaCqMlW0J-ldyrE8N9HPSifteTGc5XphgFW79tQ-DjI3KZNTxwU5x7ADtjcDgaD4y4UATHLWt6hU_-aS7qix1tKE34li4H7lVsQVGEDfkof5MItyXF6dtSiLB7NxaCb4HSxXXTCy0IongP9HfiD1sq8NvTsXZ6THPpqO1shCnIEFerosaqc66U4pZWvts7VmA6b_4LDQJz8adkfsaWuddvgW-M_gX47ybXg-0PRclkcSquQjtvWeyTNqFxpzoD8TmcAfoc",
  },
  {
    name: "Elena Rodriguez",
    id: "FP-9910",
    role: "Driver",
    roleIcon: Truck,
    roleColor: "bg-secondary-container/20 text-secondary",
    outlet: "East Logistics",
    clockIn: "-",
    punctuality: "Absent",
    punctualityColor: "text-error",
    status: "Missing",
    statusColor:
      "bg-error-container text-on-error-container border border-error/20",
    avatar:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAvxU2ZVMGS_ymuvWMwA6E2eFEuN6IHbjb2rZo8eyx-8Yjoe13wlceNyql-JpbWNK_WEfad0L-dJQBKwp3F1A0Q8Rv_kbjFJ4e-Mm2gaNwywUjTJ1GPTXb6gLQBNykzrgiKe29TihXtLn2YHsFIYODZblgU0mteSB2fVZYCZhaNv2rBs7K5yfn4kPcvOIYtARuX9XTIuUFnxqR0Lsm9hAZdUNoAX8Wh42anYk4wwQS6KPV8kIlEdwXjtZ339CRT2zVsrKvGHB6Edoc",
  },
];

export default function AttendanceReportPage() {
  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Top Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <span className="hidden md:block text-sm text-on-surface-variant">
          Admin Dashboard
        </span>
        <div className="w-8 h-8 rounded-full bg-secondary-container overflow-hidden">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuDlPL8FqQN-c6xUomt2-AeP1qy7ZJpOHHFeXQkHo4acA4r9C564pTlnaaCfHhy5nhMwymCdptR744qA1RqL9zqEZx8xGP7VvpzKEfRlkxLcVjBS73V4aW3XFzeCo0BBPF_oPAf94yshbKaYVRBVPCDfmBoJ1dHB_KE5572JvUPpeLdlhZodiovvEPzVrDJd3isiMu2kTZaYb3WY2z3QsQJfHn_SyOc7f2z4t1X-4AMeqB2LsU5SQeZ4N4T2vXhYAh-cae6rGVA7cb0"
            alt="Admin avatar"
            width={32}
            height={32}
            className="object-cover"
          />
        </div>
      </header>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col h-screen fixed left-0 top-16 w-72 bg-surface-container-low border-r border-outline-variant shadow-sm z-40">
        <div className="flex items-center gap-4 p-4 mb-4">
          <Image
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_WRgoG7VzCehpGedQfdgFpZZr-5-haGYrF14GjXaYrApiQg_vwUySpUq3zhaiqWXFJFWDnhaYmDrDYYA1bXLV9x67Pn99XjXwEb1HjOx1secXTYCJGarmI7yck-8N4UXNhryCZ4Pa5CHqIDKDpOVUzx6tuOo_XDrdWX-atR3oGjd7lX42h73kNI7ttFkZgtvNqd73zELz-RC0yWqmdyeuhFy1iMemngBMRJIWmBdt29ZzwbFelbcqKILdy1QPYWKjHj76gHbGGXQ"
            alt="Admin"
            width={48}
            height={48}
            className="rounded-lg"
          />
          <div>
            <p className="text-sm font-bold text-primary">Super Admin</p>
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
          <SidebarLink icon={BadgeCheck} label="Staff" />
          <SidebarLink icon={BarChart3} label="Reports" active />
        </nav>
      </aside>

      <main className="lg:pl-72 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="text-3xl font-bold text-on-surface">
              Attendance Report
            </h2>
            <p className="text-base text-on-surface-variant">
              Real-time shift coverage and staff records management.
            </p>
          </div>
          <button className="flex items-center justify-center gap-2 px-6 py-2 bg-primary text-on-primary rounded-lg text-sm hover:opacity-90 active:scale-[0.98] transition-all">
            <Download className="w-5 h-5" />
            Export Report
          </button>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          {/* Coverage Gauge */}
          <div className="md:col-span-2 bg-surface border border-outline-variant rounded-xl p-6 flex items-center gap-8 shadow-sm hover:shadow-md transition-all">
            <div className="relative w-32 h-32 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  className="text-surface-container-high"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                />
                <circle
                  className="text-primary"
                  cx="64"
                  cy="64"
                  fill="transparent"
                  r="56"
                  stroke="currentColor"
                  strokeDasharray="351.8"
                  strokeDashoffset="35.2"
                  strokeWidth="8"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-bold text-on-surface">92%</span>
                <span className="text-xs text-on-surface-variant">
                  Total Coverage
                </span>
              </div>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-base text-on-surface-variant">
                Current Shift Summary
              </p>
              <h4 className="text-xl font-bold text-on-surface">
                46 / 50 Staff
              </h4>
              <div className="flex items-center gap-2 text-primary">
                <TrendingUp className="w-4 h-4" />
                <span className="text-xs font-bold">+4% from last week</span>
              </div>
            </div>
          </div>

          {/* Driver Count */}
          <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-1 bg-secondary-container/20 text-secondary rounded">
                <Truck className="w-5 h-5" />
              </div>
              <span className="text-xs text-on-surface-variant">Drivers</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">18 / 20</p>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2">
                <div
                  className="bg-secondary h-full rounded-full"
                  style={{ width: "90%" }}
                />
              </div>
            </div>
          </div>

          {/* Worker Count */}
          <div className="bg-surface border border-outline-variant rounded-xl p-4 flex flex-col justify-between shadow-sm">
            <div className="flex justify-between items-start">
              <div className="p-1 bg-primary-container/20 text-primary rounded">
                <Wrench className="w-5 h-5" />
              </div>
              <span className="text-xs text-on-surface-variant">Workers</span>
            </div>
            <div>
              <p className="text-xl font-bold text-on-surface">28 / 30</p>
              <div className="w-full bg-surface-container-high h-1.5 rounded-full mt-2">
                <div
                  className="bg-primary h-full rounded-full"
                  style={{ width: "93%" }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-xl p-4 mb-6 shadow-sm flex flex-wrap items-center gap-4">
          <div className="flex-1 min-w-[200px] relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-on-surface-variant" />
            <input
              className="w-full pl-10 pr-4 py-2 bg-surface border border-outline-variant rounded-lg text-base focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
              placeholder="Search staff name or ID..."
              type="text"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Outlet:</span>
            <select className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-base outline-none focus:border-primary">
              <option>All Outlets</option>
              <option>Downtown Hub</option>
              <option>Westside Branch</option>
              <option>East Logistics</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Role:</span>
            <select className="px-4 py-2 bg-surface border border-outline-variant rounded-lg text-base outline-none focus:border-primary">
              <option>All Roles</option>
              <option>Driver</option>
              <option>Worker</option>
              <option>Supervisor</option>
            </select>
          </div>
          <button className="p-2 text-on-surface-variant hover:bg-surface-container-high rounded-lg transition-colors">
            <ListFilter className="w-5 h-5" />
          </button>
        </div>

        {/* Attendance Table */}
        <div className="bg-surface border border-outline-variant rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant">
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Staff Member
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Role
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Outlet
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Clock In
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Status
                  </th>
                  <th className="px-6 py-4 text-sm font-medium text-on-surface-variant">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant">
                {staffRows.map((staff, i) => (
                  <tr
                    key={i}
                    className="hover:bg-surface-container-low transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-surface-container-high overflow-hidden border border-outline-variant">
                          <Image
                            src={staff.avatar}
                            alt={`Staff ${staff.name}`}
                            width={40}
                            height={40}
                            className="object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-on-surface">
                            {staff.name}
                          </p>
                          <p className="text-xs text-on-surface-variant">
                            ID: {staff.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${staff.roleColor}`}
                      >
                        <staff.roleIcon className="w-3.5 h-3.5" />
                        {staff.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-base">{staff.outlet}</td>
                    <td className="px-6 py-4">
                      <p className="text-sm">{staff.clockIn}</p>
                      <p
                        className={`text-xs font-bold ${staff.punctualityColor}`}
                      >
                        {staff.punctuality}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-bold ${staff.statusColor}`}
                      >
                        {staff.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-on-surface-variant hover:text-primary transition-colors">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Pagination */}
          <div className="px-6 py-4 bg-surface border-t border-outline-variant flex items-center justify-between">
            <span className="text-xs text-on-surface-variant">
              Showing 1-10 of 50 staff members
            </span>
            <div className="flex items-center gap-1">
              <button
                disabled
                className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded disabled:opacity-30"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-primary text-on-primary rounded text-sm">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded text-sm">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center hover:bg-surface-container-high rounded text-sm">
                3
              </button>
              <button className="p-1 text-on-surface-variant hover:bg-surface-container-high rounded">
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
}

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
