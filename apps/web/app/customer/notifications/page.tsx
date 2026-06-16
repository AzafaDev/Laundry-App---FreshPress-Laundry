"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Bell,
  CheckCheck,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Loader2,
  PackageCheck,
  ClipboardList,
  Truck,
} from "lucide-react";
import { Navbar } from "@/components/layout/Navbar";
import {
  notificationService,
  type CustomerNotification,
  type NotificationType,
} from "@/services/notification.service";
import { useAuthStore } from "@/stores/authStore";

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  driver_pickup_started: Truck,
  driver_arrived_outlet: Truck,
  order_details: ClipboardList,
  payment: CreditCard,
  driver_delivery_started: Truck,
  driver_arrived_customer: Truck,
  order_completed: PackageCheck,
};

const formatDateTime = (value: string) =>
  new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));

const LIMIT = 10;

export default function CustomerNotificationsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, _hasHydrated } = useAuthStore();
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) router.replace("/customer/login");
  }, [_hasHydrated, user, router]);

  const {
    data,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ["customer", "notifications", page],
    queryFn: () => notificationService.list(page, LIMIT),
    enabled: _hasHydrated && !!user,
    refetchInterval: page === 1 ? 20_000 : false,
  });

  // Separate query so the header unread count stays accurate across pages
  const { data: unreadCount = 0 } = useQuery({
    queryKey: ["customer", "notifications", "unread-count"],
    queryFn: notificationService.getUnreadCount,
    enabled: _hasHydrated && !!user,
    refetchInterval: 20_000,
  });

  const notifications: CustomerNotification[] = data?.notifications ?? [];
  const totalPages = data?.totalPages ?? 1;
  const total = data?.total ?? 0;

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["customer", "notifications"] });
    },
  });

  if (!_hasHydrated || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex items-center gap-3 text-on-surface-variant">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
          <span className="text-sm font-medium">Menyiapkan halaman...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-on-surface">
      <Navbar />

      <main className="max-w-3xl mx-auto px-4 md:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary mb-2">
              Notifikasi
            </span>
            <h1 className="text-3xl font-bold text-on-surface">Update pesanan kamu.</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-on-surface-variant mt-1">
                {unreadCount} notifikasi belum dibaca
              </p>
            )}
          </div>

          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsReadMutation.mutate()}
              disabled={markAllAsReadMutation.isPending}
              className="self-start sm:self-auto inline-flex items-center gap-2 rounded-xl border border-outline-variant px-4 py-2.5 text-sm font-medium text-on-surface hover:border-primary hover:text-primary transition-colors disabled:opacity-50"
            >
              <CheckCheck className="w-4 h-4" />
              Tandai semua dibaca
            </button>
          )}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="rounded-2xl border border-outline-variant bg-surface px-4 py-8 flex items-center justify-center gap-3 text-sm text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            Memuat notifikasi...
          </div>
        )}

        {/* Error */}
        {!isLoading && isError && (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-5 text-sm text-red-700">
            <p className="font-semibold mb-2">Gagal memuat notifikasi.</p>
            <button
              onClick={() => void refetch()}
              className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
            >
              Coba lagi
            </button>
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && notifications.length === 0 && (
          <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-6 py-12 text-center">
            <div className="w-14 h-14 rounded-full bg-surface-container mx-auto flex items-center justify-center mb-4">
              <Bell className="w-6 h-6 text-outline" />
            </div>
            <p className="font-semibold text-on-surface mb-1">Belum ada notifikasi</p>
            <p className="text-sm text-on-surface-variant">
              Update pesanan kamu akan muncul di sini.
            </p>
          </div>
        )}

        {/* Result count */}
        {!isLoading && !isError && total > 0 && (
          <p className="text-xs text-on-surface-variant">
            Menampilkan {notifications.length} dari {total} notifikasi
          </p>
        )}

        {/* Notification list */}
        {!isLoading && !isError && notifications.length > 0 && (
          <div className="space-y-3">
            {notifications.map((notification) => {
              const Icon = notification.type
                ? (NOTIFICATION_ICONS[notification.type] ?? Bell)
                : Bell;
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => {
                    if (!notification.is_read) {
                      markAsReadMutation.mutate(notification.id);
                    }
                  }}
                  className={`w-full text-left rounded-2xl border p-4 flex gap-3 items-start transition-colors ${
                    notification.is_read
                      ? "border-outline-variant bg-surface"
                      : "border-primary/30 bg-primary/5"
                  }`}
                >
                  <div
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      notification.is_read
                        ? "bg-surface-container text-on-surface-variant"
                        : "bg-primary/15 text-primary"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold text-on-surface text-sm">
                        {notification.title}
                      </p>
                      {!notification.is_read && (
                        <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      {notification.body}
                    </p>
                    <p className="text-xs text-on-surface-variant/70 mt-1.5">
                      {formatDateTime(notification.created_at)}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && !isError && totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Sebelumnya
            </button>

            <span className="text-sm text-on-surface-variant px-2">
              {page} / {totalPages}
            </span>

            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="inline-flex items-center gap-1 rounded-xl border border-outline-variant px-3 py-2 text-sm font-medium text-on-surface disabled:opacity-40 hover:border-primary hover:text-primary transition-colors"
            >
              Berikutnya
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
