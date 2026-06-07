"use client";

import { LayoutDashboard, Clock, ScrollText } from "lucide-react";
import { EmployeeSidebar } from "./EmployeeSidebar";

const NAV_ITEMS = [
  { href: "/dashboard/driver", label: "Dashboard", icon: LayoutDashboard },
  { href: "/dashboard/driver/attendance", label: "Attendance", icon: Clock },
  { href: "/dashboard/driver/history", label: "Riwayat", icon: ScrollText },
];

export function DriverSidebar() {
  return <EmployeeSidebar navItems={NAV_ITEMS} rootHref="/dashboard/driver" />;
}
