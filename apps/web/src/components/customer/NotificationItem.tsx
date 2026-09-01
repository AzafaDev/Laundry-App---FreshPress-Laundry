"use client";

import { Bell, CreditCard, ClipboardList, PackageCheck, Truck } from "lucide-react";
import type { CustomerNotification, NotificationType } from "@/services/notification.service";
import { useTranslation } from "@/i18n/useTranslation";

const NOTIFICATION_ICONS: Record<NotificationType, typeof Bell> = {
  driver_pickup_started: Truck,
  driver_arrived_outlet: Truck,
  order_details: ClipboardList,
  payment: CreditCard,
  driver_delivery_started: Truck,
  driver_arrived_customer: Truck,
  order_completed: PackageCheck,
};

const formatDateTime = (value: string, locale: "id" | "en") =>
  new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }).format(new Date(value));

interface Props {
  notification: CustomerNotification;
  onMarkRead: (id: string) => void;
}

export function NotificationItem({ notification, onMarkRead }: Props) {
  const { locale } = useTranslation();
  const Icon = notification.type ? (NOTIFICATION_ICONS[notification.type] ?? Bell) : Bell;

  return (
    <button
      type="button"
      onClick={() => { if (!notification.is_read) onMarkRead(notification.id); }}
      className={`w-full text-left rounded-2xl border p-4 flex gap-3 items-start transition-colors ${
        notification.is_read ? "border-outline-variant bg-surface" : "border-primary/30 bg-primary/5"
      }`}
    >
      <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${notification.is_read ? "bg-surface-container text-on-surface-variant" : "bg-primary/15 text-primary"}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <p className="font-semibold text-on-surface text-sm">{notification.title}</p>
          {!notification.is_read && <span className="shrink-0 w-2 h-2 rounded-full bg-primary" />}
        </div>
        <p className="text-sm text-on-surface-variant mt-0.5">{notification.body}</p>
        <p className="text-xs text-on-surface-variant/70 mt-1.5">{formatDateTime(notification.created_at, locale)}</p>
      </div>
    </button>
  );
}
