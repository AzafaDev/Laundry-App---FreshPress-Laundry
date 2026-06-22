"use client";

import { Bell, CheckCheck, Loader2, RefreshCw } from "lucide-react";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEmployeeNotifications } from "@/hooks/useEmployeeNotifications";

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

export default function DriverNotificationsPage() {
  const {
    notifications,
    isLoading,
    isError,
    refetch,
    markAsRead,
    markAllAsRead,
    isMarkingAllAsRead,
  } = useEmployeeNotifications();

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <DriverSidebar />
      <DriverTopBar />

      <main className="lg:pl-72 pb-24 lg:pb-8">
        <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-4">

          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-on-surface">Notifikasi</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-on-surface-variant mt-0.5">
                  {unreadCount} belum dibaca
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                disabled={isMarkingAllAsRead}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-outline-variant text-sm font-medium text-on-surface-variant hover:bg-surface-container transition-colors disabled:opacity-50"
              >
                {isMarkingAllAsRead
                  ? <Loader2 className="w-4 h-4 animate-spin" />
                  : <CheckCheck className="w-4 h-4" />
                }
                Tandai semua dibaca
              </button>
            )}
          </div>

          {/* Loading */}
          {isLoading && (
            <div className="flex items-center justify-center py-16 gap-3 text-on-surface-variant">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
              <span className="text-sm">Memuat notifikasi...</span>
            </div>
          )}

          {/* Error */}
          {!isLoading && isError && (
            <div className="rounded-2xl border border-outline-variant bg-surface p-6 text-center space-y-3">
              <p className="text-sm text-error font-medium">Gagal memuat notifikasi</p>
              <button
                onClick={() => void refetch()}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container text-sm font-medium text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Coba lagi
              </button>
            </div>
          )}

          {/* Empty */}
          {!isLoading && !isError && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 rounded-2xl border border-dashed border-outline-variant bg-surface text-center gap-3">
              <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center">
                <Bell className="w-5 h-5 text-on-surface-variant" />
              </div>
              <div>
                <p className="font-semibold text-on-surface text-sm">Belum ada notifikasi</p>
                <p className="text-xs text-on-surface-variant mt-0.5">Notifikasi akan muncul di sini</p>
              </div>
            </div>
          )}

          {/* List */}
          {!isLoading && !isError && notifications.length > 0 && (
            <div className="space-y-2">
              {notifications.map((notif) => (
                <button
                  key={notif.id}
                  type="button"
                  onClick={() => {
                    if (!notif.is_read) markAsRead(notif.id);
                  }}
                  className={`w-full text-left rounded-xl border p-4 flex gap-3 items-start transition-colors ${
                    notif.is_read
                      ? "border-outline-variant bg-surface hover:bg-surface-container-low"
                      : "border-primary/20 bg-primary/5 hover:bg-primary/10"
                  }`}
                >
                  <div className={`shrink-0 w-9 h-9 rounded-full flex items-center justify-center mt-0.5 ${
                    notif.is_read
                      ? "bg-surface-container text-on-surface-variant"
                      : "bg-primary/15 text-primary"
                  }`}>
                    <Bell className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm font-semibold leading-snug ${notif.is_read ? "text-on-surface" : "text-on-surface"}`}>
                        {notif.title}
                      </p>
                      {!notif.is_read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-primary mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5 leading-snug">{notif.body}</p>
                    <p className="text-xs text-on-surface-variant/60 mt-1.5">{formatDateTime(notif.created_at)}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </main>

      <BottomNav />
    </div>
  );
}
