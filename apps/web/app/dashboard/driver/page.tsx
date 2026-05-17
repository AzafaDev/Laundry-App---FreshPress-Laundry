"use client";

import {
  Bell,
  ClipboardList,
  ListFilter,
  Map,
  MapPin,
  Navigation,
  Phone,
  MoreVertical,
  ShoppingBag,
  Star,
  QrCode,
  Truck,
  Shirt,
} from "lucide-react";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { BottomNav } from "@/components/layout/BottomNav";
import { ShiftBadge } from "@/components/ui/ShiftBadge";
import { useAuthStore } from "@/stores/authStore";
import toast from "react-hot-toast";

export default function DriverDashboardPage() {
  const { user } = useAuthStore();
  const initials =
    user?.full_name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase() ?? "D";

  return (
    <div className="min-h-screen bg-background text-on-background pb-24 lg:pb-0">
      {/* Top App Bar */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-4 md:px-8 h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <Shirt className="text-primary w-6 h-6" />
          <h1 className="text-xl font-bold text-primary">FreshPress Laundry</h1>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="relative p-2 rounded-full hover:bg-surface-container-low transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="text-on-surface-variant w-6 h-6" />
            <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-error rounded-full border-2 border-surface" />
          </button>
          <div className="w-10 h-10 rounded-full bg-secondary-container flex items-center justify-center text-on-secondary-container font-bold text-sm">
            {initials}
          </div>
        </div>
      </header>

      {/* Desktop Sidebar */}
      <DriverSidebar activePath="/dashboard/driver" />

      {/* Main Content */}
      <main className="lg:pl-80 p-4 md:p-8 space-y-8">
        {/* Section 1: Active Tasks (priority on mobile) */}
        <section className="space-y-4">
          {/* Notification Banner */}
          <div className="bg-primary-container text-on-primary-container p-4 rounded-xl shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="bg-primary-fixed text-on-primary-fixed p-2 rounded-lg">
                <ClipboardList className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm font-bold">New Requests</p>
                <p className="text-base opacity-90">
                  3 new pickup requests available in your area.
                </p>
              </div>
            </div>
            <button className="bg-on-primary-container text-primary-container px-4 py-2 rounded-lg text-sm font-bold hover:bg-white transition-colors">
              View All
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm text-on-surface-variant">Shift:</span>
            <ShiftBadge shift="Morning" />
          </div>

          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-on-surface">Active Tasks</h2>
            <div className="flex gap-2">
              <button
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
                aria-label="Filter"
              >
                <ListFilter className="w-5 h-5 text-on-surface-variant" />
              </button>
              <button
                className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors"
                aria-label="Map view"
              >
                <Map className="w-5 h-5 text-on-surface-variant" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
            <DriverTaskCard
              orderId="#FP-8291"
              status="On the Way"
              statusColor="bg-secondary-container text-on-secondary-container"
              type="Delivery"
              typeIcon={Truck}
              typeColor="bg-primary/10 text-primary"
              time="15:00 - 17:00 Today"
              address="428 Corporate Plaza, Suite 102, Tech District"
              primaryAction="Complete Task"
              primaryActionClass="bg-primary text-on-primary hover:opacity-90"
              secondaryIcon={Navigation}
            />
            <DriverTaskCard
              orderId="#FP-8304"
              status="Assigned"
              statusColor="bg-surface-container-highest text-on-surface-variant"
              type="Pickup"
              typeIcon={ShoppingBag}
              typeColor="bg-tertiary/10 text-tertiary"
              time="17:30 - 18:30 Today"
              address="89 Riverside Drive, Apt 4B, East Side"
              primaryAction="Start Pickup"
              primaryActionClass="border border-primary text-primary hover:bg-primary/5"
              secondaryIcon={Phone}
            />
            <DriverTaskCard
              orderId="#FP-8311"
              status="Assigned"
              statusColor="bg-surface-container-highest text-on-surface-variant"
              type="Delivery"
              typeIcon={Truck}
              typeColor="bg-primary/10 text-primary"
              time="09:00 - 11:00 Tomorrow"
              address="12 Oakwood Terrace, North Hills"
              primaryAction="Scheduled"
              primaryActionClass="border border-outline text-outline cursor-not-allowed opacity-60"
              secondaryIcon={MoreVertical}
              disableActions
            />
          </div>
        </section>

        {/* Section 2: Performance Summary */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-on-surface">
            Performance Summary
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
              <div>
                <h3 className="text-lg font-bold text-on-surface mb-2">
                  Earnings Overview
                </h3>
                <p className="text-base text-on-surface-variant">
                  Great job today! You've completed 85% of your daily goal.
                </p>
              </div>
              <div className="flex items-end justify-between">
                <div className="space-y-1">
                  <p className="text-xs text-outline uppercase font-bold">
                    Today's Total
                  </p>
                  <p className="text-3xl font-bold text-primary">$184.50</p>
                </div>
                <div className="flex gap-1 items-end h-16">
                  {[40, 70, 55, 90, 65, 85].map((h, i) => (
                    <div
                      key={i}
                      className={`w-8 rounded-t-sm transition-all ${i === 5 ? "bg-primary" : "bg-primary-container"}`}
                      style={{ height: `${h}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="md:col-span-4 bg-secondary text-on-secondary rounded-2xl p-6 space-y-4 flex flex-col justify-center">
              <Star className="w-10 h-10 fill-current" />
              <div className="space-y-1">
                <p className="text-5xl font-bold leading-none">4.9</p>
                <p className="text-lg font-bold opacity-90">Driver Rating</p>
              </div>
              <p className="text-sm opacity-80">Based on last 50 deliveries</p>
            </div>
          </div>
        </section>
      </main>

      {/* Floating Action Button */}
      <button
        onClick={() => toast("QR Scanner coming soon", { icon: "📱" })}
        className="fixed bottom-24 right-4 lg:bottom-12 lg:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
        aria-label="Scan QR Code"
      >
        <QrCode className="w-8 h-8" />
      </button>

      {/* Mobile Bottom Navigation */}
      <BottomNav />
    </div>
  );
}

// ---------- Task Card (kept inline but renamed) ----------
function DriverTaskCard({
  orderId,
  status,
  statusColor,
  type,
  typeIcon: TypeIcon,
  typeColor,
  time,
  address,
  primaryAction,
  primaryActionClass,
  secondaryIcon: SecondaryIcon,
  disableActions = false,
}: {
  orderId: string;
  status: string;
  statusColor: string;
  type: string;
  typeIcon: React.ElementType;
  typeColor: string;
  time: string;
  address: string;
  primaryAction: string;
  primaryActionClass: string;
  secondaryIcon: React.ElementType;
  disableActions?: boolean;
}) {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow group">
      <div className="p-4 space-y-4">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-xs text-outline uppercase tracking-wider">
              Order ID
            </span>
            <p className="text-base font-bold">{orderId}</p>
          </div>
          <div
            className={`px-2 py-1 rounded-lg text-xs font-bold ${statusColor}`}
          >
            {status}
          </div>
        </div>
        <div className="flex items-center gap-4 p-2 bg-surface-container-low rounded-lg">
          <div className={`${typeColor} p-2 rounded-full`}>
            <TypeIcon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">{type}</p>
            <p className="text-base text-on-surface-variant">{time}</p>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <MapPin className="w-5 h-5 text-outline mt-0.5" />
          <p className="text-base text-on-surface">{address}</p>
        </div>
      </div>
      <div className="px-4 py-3 bg-surface-container-lowest border-t border-outline-variant flex gap-3">
        <button
          className={`flex-1 py-3 md:py-2 rounded-xl md:rounded-lg text-sm font-bold transition-colors ${primaryActionClass}`}
          disabled={disableActions}
        >
          {primaryAction}
        </button>
        {SecondaryIcon && (
          <button
            className="p-3 md:p-2 border border-outline-variant rounded-xl md:rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors"
            aria-label="Secondary action"
          >
            <SecondaryIcon className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}
