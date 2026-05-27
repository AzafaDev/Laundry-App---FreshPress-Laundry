"use client";

import { Bell, Menu } from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";

export function AdminTopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const user = useEmployeeAuthStore((s) => s.user);

  return (
    <header className="sticky top-0 z-30 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant lg:pl-[304px]">
      <div className="flex items-center gap-2">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-1 text-primary"
          aria-label="Toggle sidebar"
        >
          <Menu className="w-6 h-6" />
        </button>
        <h1 className="text-xl font-bold text-primary">FreshPress Admin</h1>
      </div>
      <div className="flex items-center gap-4">
        <button
          className="p-2 hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant"
          aria-label="Notifications"
        >
          <Bell className="w-6 h-6" />
        </button>
        <div className="hidden md:flex flex-col items-end leading-tight">
          <span className="text-sm font-semibold text-on-surface truncate max-w-[160px]">
            {user?.full_name ?? "Admin"}
          </span>
          <span className="text-xs text-on-surface-variant truncate max-w-[160px]">
            {user?.email ?? ""}
          </span>
        </div>
        <div className="w-9 h-9 rounded-full bg-primary text-on-primary flex items-center justify-center font-semibold">
          {user?.full_name?.slice(0, 1).toUpperCase() ?? "A"}
        </div>
      </div>
    </header>
  );
}
