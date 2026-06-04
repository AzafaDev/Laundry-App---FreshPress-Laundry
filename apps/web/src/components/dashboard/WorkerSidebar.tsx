"use client";

import { LayoutDashboard, ClipboardList, Clock, BarChart3 } from "lucide-react";
import { EmployeeSidebar } from "./EmployeeSidebar";

const NAV_ITEMS = [
  { href: "/dashboard/worker", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/worker/station", label: "Station", icon: ClipboardList },
  { href: "/dashboard/worker/attendance", label: "Attendance", icon: Clock },
  { href: "/dashboard/worker/history", label: "Riwayat", icon: BarChart3 },
];

export function WorkerSidebar({ onClose }: { onClose?: () => void }) {
  return <EmployeeSidebar navItems={NAV_ITEMS} rootHref="/dashboard/worker" onClose={onClose} />;
}
