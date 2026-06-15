"use client";

import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  ClipboardList,
  CreditCard,
  AlertTriangle,
  PackageCheck,
  Truck,
} from "lucide-react";
import {
  employeeNotificationService,
  type EmployeeNotification,
  type EmployeeNotificationType,
} from "@/services/employeeNotification.service";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useSocket } from "@/hooks/useSocket";

const NOTIFICATION_ICONS: Record<EmployeeNotificationType, typeof Bell> = {
  driver_pickup_started: Truck,
  driver_arrived_outlet: Truck,
  order_details: ClipboardList,
  payment: CreditCard,
  driver_delivery_started: Truck,
  driver_arrived_customer: Truck,
  order_completed: PackageCheck,
  new_pickup_request: ClipboardList,
  payment_completed: CreditCard,
  complaint_submitted: AlertTriangle,
};

const formatRelativeTime = (value: string) => {
  const diffMs = Date.now() - new Date(value).getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  const diffDay = Math.floor(diffHour / 24);
  return `${diffDay} hari lalu`;
};

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user } = useEmployeeAuthStore();
  const { on } = useSocket();
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery<EmployeeNotification[]>({
    queryKey: ["employee", "notifications"],
    queryFn: employeeNotificationService.list,
    enabled: !!user,
    refetchInterval: 20_000,
  });

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => employeeNotificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => employeeNotificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "notifications"] });
    },
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClickOutside);
    else document.removeEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  useEffect(() => {
    if (!user) return;
    const unsub = on("notification:new", () => {
      queryClient.invalidateQueries({ queryKey: ["employee", "notifications"] });
    });
    return () => unsub();
  }, [user, on, queryClient]);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative p-2 hover:bg-surface-container-low transition-colors rounded-full text-on-surface-variant"
        aria-label="Notifications"
      >
        <Bell className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[16px] h-4 rounded-full bg-error text-white text-[10px] font-bold flex items-center justify-center px-1">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-surface border border-outline-variant rounded-xl shadow-lg z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b border-outline-variant">
            <span className="text-sm font-semibold text-on-surface">Notifikasi</span>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
                className="flex items-center gap-1 text-xs font-medium text-primary hover:underline disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                Tandai semua dibaca
              </button>
            )}
          </div>

          {notifications.length === 0 ? (
            <p className="px-4 py-6 text-center text-sm text-on-surface-variant">
              Belum ada notifikasi.
            </p>
          ) : (
            notifications.map((notification) => {
              const Icon = (notification.type && NOTIFICATION_ICONS[notification.type]) || Bell;
              return (
                <button
                  key={notification.id}
                  onClick={() => {
                    if (!notification.is_read) markAsReadMutation.mutate(notification.id);
                  }}
                  className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-outline-variant last:border-b-0 hover:bg-surface-container-low transition-colors ${
                    !notification.is_read ? "bg-primary/5" : ""
                  }`}
                >
                  <Icon className="w-4 h-4 mt-0.5 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-on-surface truncate">
                      {notification.title}
                    </p>
                    <p className="text-xs text-on-surface-variant line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="text-[11px] text-on-surface-variant mt-1">
                      {formatRelativeTime(notification.created_at)}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <span className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0" />
                  )}
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
