"use client";

import { Menu } from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { NotificationBell } from "@/components/dashboard/NotificationBell";
import { useEffect, useRef, useState } from "react";
import { Bell, Menu, Check, CheckCheck } from "lucide-react";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/lib/axios";
import { useSocket } from "@/hooks/useSocket";

// ── Types ─────────────────────────────────────────────────────────────────────
interface AdminNotification {
  id: string;
  title: string;
  body: string;
  type: string | null;
  is_read: boolean;
  created_at: string;
  related_entity_id: string | null;
}

// ── API helpers ───────────────────────────────────────────────────────────────
const fetchNotifications = async (): Promise<AdminNotification[]> => {
  const { data } = await axiosInstance.get("/v1/admin/notifications");
  return data.data ?? [];
};

const fetchUnreadCount = async (): Promise<number> => {
  const { data } = await axiosInstance.get("/v1/admin/notifications/unread-count");
  return data.data?.count ?? 0;
};

const markOneRead = async (id: string) => {
  await axiosInstance.patch(`/v1/admin/notifications/${id}/read`);
};

const markAllRead = async () => {
  await axiosInstance.patch("/v1/admin/notifications/read-all");
};

// ── Relative time ─────────────────────────────────────────────────────────────
function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "Baru saja";
  if (m < 60) return `${m} menit lalu`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h} jam lalu`;
  return `${Math.floor(h / 24)} hari lalu`;
}

// ── Component ─────────────────────────────────────────────────────────────────
export function AdminTopBar({ onToggleSidebar }: { onToggleSidebar?: () => void }) {
  const user = useEmployeeAuthStore((s) => s.user);
  const { on } = useSocket();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Real-time: invalidate unread count + list when new notification arrives
  useEffect(() => {
    const unsub = on("notification:new", () => {
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "notifications", "unread"] });
    });
    return unsub;
  }, [on, qc]);

  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["admin", "notifications", "unread"],
    queryFn: fetchUnreadCount,
    refetchInterval: 60_000, // poll every 60s as fallback
  });

  const { data: notifications = [] } = useQuery({
    queryKey: ["admin", "notifications"],
    queryFn: fetchNotifications,
    enabled: open, // only fetch full list when panel is open
  });

  const markOneMutation = useMutation({
    mutationFn: markOneRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "notifications", "unread"] });
    },
  });

  const markAllMutation = useMutation({
    mutationFn: markAllRead,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["admin", "notifications"] });
      qc.invalidateQueries({ queryKey: ["admin", "notifications", "unread"] });
    },
  });

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
        <NotificationBell />
        {/* Bell with badge + dropdown */}
        <div className="relative" ref={panelRef}>
          <button
            onClick={() => setOpen((v) => !v)}
            className="relative p-2 hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant"
            aria-label="Notifications"
          >
            <Bell className="w-6 h-6" />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-error text-on-error text-[9px] font-bold leading-none">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {open && (
            <div className="absolute right-0 mt-1 w-80 bg-surface border border-outline-variant rounded-2xl shadow-lg overflow-hidden z-50">
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
                <p className="text-sm font-semibold text-on-surface">Notifikasi</p>
                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending}
                    className="flex items-center gap-1 text-xs text-primary hover:underline disabled:opacity-60"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    Tandai semua dibaca
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-outline-variant">
                {notifications.length === 0 ? (
                  <div className="px-4 py-8 text-center">
                    <Bell className="w-8 h-8 text-on-surface-variant mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-on-surface-variant">Belum ada notifikasi</p>
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      className={`flex items-start gap-3 px-4 py-3 transition-colors ${
                        n.is_read
                          ? "bg-surface"
                          : "bg-primary/5 hover:bg-primary/10"
                      }`}
                    >
                      {/* Unread dot */}
                      <div className="mt-1.5 shrink-0">
                        {!n.is_read ? (
                          <span className="block w-2 h-2 rounded-full bg-primary" />
                        ) : (
                          <span className="block w-2 h-2 rounded-full bg-transparent" />
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className={`text-xs font-semibold text-on-surface ${!n.is_read ? "" : "opacity-70"}`}>
                          {n.title}
                        </p>
                        <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-on-surface-variant mt-1 opacity-60">
                          {relativeTime(n.created_at)}
                        </p>
                      </div>

                      {!n.is_read && (
                        <button
                          onClick={() => markOneMutation.mutate(n.id)}
                          disabled={markOneMutation.isPending}
                          className="shrink-0 p-1 rounded-full text-on-surface-variant hover:text-primary hover:bg-surface-container-low disabled:opacity-60"
                          title="Tandai dibaca"
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User info */}
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
