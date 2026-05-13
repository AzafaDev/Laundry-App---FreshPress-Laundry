"use client";

import { useState } from "react";
import { Bell } from "lucide-react";

interface Notification {
  id: number;
  title: string;
  message: string;
  time: string;
  read: boolean;
}

const dummyNotifications: Notification[] = [
  {
    id: 1,
    title: "Order Selesai",
    message: "Order #ORD-29402 telah selesai diproses.",
    time: "5 menit lalu",
    read: false,
  },
  {
    id: 2,
    title: "Pickup Baru",
    message: "Permintaan pickup baru dari Budi Santoso.",
    time: "30 menit lalu",
    read: false,
  },
  {
    id: 3,
    title: "Bypass Request",
    message: "Worker John Marcus mengajukan bypass untuk #ORD-5521.",
    time: "1 jam lalu",
    read: true,
  },
];

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifications] = useState<Notification[]>(dummyNotifications);

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors"
        aria-label={`${unreadCount} notifikasi belum dibaca`}
      >
        <Bell className="text-on-surface-variant w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 w-5 h-5 bg-error text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-surface">
            {unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 top-12 z-50 w-80 bg-surface-container-lowest border border-outline-variant rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-outline-variant bg-surface-container-low">
              <h3 className="text-sm font-bold text-on-surface">Notifikasi</h3>
            </div>
            <div className="divide-y divide-outline-variant max-h-80 overflow-y-auto">
              {notifications.map((n) => (
                <div
                  key={n.id}
                  className={`p-4 hover:bg-surface-container-low transition-colors cursor-pointer ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-sm font-bold text-on-surface">
                      {n.title}
                    </p>
                    {!n.read && (
                      <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                    )}
                  </div>
                  <p className="text-xs text-on-surface-variant line-clamp-2">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-outline mt-1">{n.time}</p>
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
