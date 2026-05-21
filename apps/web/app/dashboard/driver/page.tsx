"use client";

import Link from "next/link";
import {
  ClipboardList,
  ListFilter,
  Map,
  MapPin,
  Navigation,
  Star,
  QrCode,
  User,
  Clock,
  CalendarDays,
} from "lucide-react";
import { BottomNav } from "@/components/layout/BottomNav";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { useAuthStore } from "@/stores/authStore";
import { useAttendance } from "@/hooks/useAttendance";
import { motion } from "framer-motion";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";

interface TaskCardProps {
  orderId: string;
  customer: string;
  address: string;
  type: "pickup" | "delivery";
  time: string;
  status: "assigned" | "on_way" | "completed";
  statusColor: string;
}

function TaskCard({
  orderId,
  customer,
  address,
  type,
  time,
  status,
  statusColor,
}: TaskCardProps) {
  const TypeIcon = type === "delivery" ? "Truck" : "ShoppingBag";
  // Note: karena kita pakai lucide-react, import dinamis tidak perlu, tapi kita gunakan komponen langsung
  // Saya akan import di atas, untuk efisiensi kita asumsikan sudah import Truck dan ShoppingBag
  // Tapi di sini kita tetap gunakan string, nanti sesuaikan

  // Lebih baik kita buat mapping
  const IconComponent =
    type === "delivery"
      ? require("lucide-react").Truck
      : require("lucide-react").ShoppingBag;
  const typeColor =
    type === "delivery"
      ? "bg-primary/10 text-primary"
      : "bg-tertiary/10 text-tertiary";

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
            {status === "on_way"
              ? "On The Way"
              : status === "assigned"
                ? "Assigned"
                : "Completed"}
          </div>
        </div>

        <div className="flex items-center gap-4 p-2 bg-surface-container-low rounded-lg">
          <div className={`${typeColor} p-2 rounded-full`}>
            <IconComponent className="w-5 h-5" />
          </div>
          <div>
            <p className="text-sm font-bold">
              {type === "delivery" ? "Delivery" : "Pickup"}
            </p>
            <p className="text-base text-on-surface-variant">{time}</p>
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-start gap-2">
            <MapPin className="w-5 h-5 text-outline mt-0.5" />
            <p className="text-base text-on-surface">{address}</p>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 bg-surface-container-lowest border-t border-outline-variant flex gap-2">
        <button className="flex-1 py-2 rounded-lg text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-all">
          {status === "on_way" ? "Complete Task" : "Start Pickup"}
        </button>
        <button className="px-2 py-2 border border-outline-variant rounded-lg text-on-surface-variant hover:bg-surface-container transition-colors">
          <Navigation className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}

export default function DriverDashboardPage() {
  const { user } = useAuthStore();
  const { currentShift, checkedIn, checkInTime } = useAttendance();

  const tasks: TaskCardProps[] = [
    {
      orderId: "#FP-8291",
      customer: "Eleanor Thompson",
      address: "428 Corporate Plaza, Suite 102, Tech District",
      type: "delivery",
      time: "15:00 - 17:00 Today",
      status: "on_way",
      statusColor: "bg-secondary-container text-on-secondary-container",
    },
    {
      orderId: "#FP-8304",
      customer: "James Wilson",
      address: "89 Riverside Drive, Apt 4B, East Side",
      type: "pickup",
      time: "17:30 - 18:30 Today",
      status: "assigned",
      statusColor: "bg-surface-container-highest text-on-surface-variant",
    },
    {
      orderId: "#FP-8311",
      customer: "Sarah Mitchell",
      address: "12 Oakwood Terrace, North Hills",
      type: "delivery",
      time: "09:00 - 11:00 Tomorrow",
      status: "assigned",
      statusColor: "bg-surface-container-highest text-on-surface-variant",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <DriverSidebar />
      <DriverTopBar />

      <main className="lg:pl-80 p-4 md:p-8 space-y-6">
        {/* Welcome Banner with Shift Info */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary-container/20 p-5 rounded-2xl border border-primary/20"
        >
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-on-surface-variant">
                  Selamat datang,
                </p>
                <h2 className="text-xl font-bold text-on-surface">
                  {user?.full_name ?? "Driver"}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {currentShift && (
                <div className="flex items-center gap-2 text-sm bg-surface/80 px-3 py-1.5 rounded-full">
                  <Clock className="w-4 h-4 text-primary" />
                  <span className="text-on-surface-variant">
                    Shift: {currentShift.shiftName}
                  </span>
                  <span className="text-primary font-medium">
                    {currentShift.startTime} - {currentShift.endTime}
                  </span>
                </div>
              )}
              <Link
                href="/dashboard/driver/attendance"
                className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                  checkedIn
                    ? "bg-primary text-on-primary"
                    : "bg-surface-container-high text-on-surface-variant hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {checkedIn ? `Check In: ${checkInTime}` : "Belum Check In"}
              </Link>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-on-surface-variant">
            <CalendarDays className="w-4 h-4" />
            <span>
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </motion.div>

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

        {/* Section Title */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-on-surface">Active Tasks</h2>
          <div className="flex gap-2">
            <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">
              <ListFilter className="w-5 h-5 text-on-surface-variant" />
            </button>
            <button className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container transition-colors">
              <Map className="w-5 h-5 text-on-surface-variant" />
            </button>
          </div>
        </div>

        {/* Task Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tasks.map((task) => (
            <TaskCard key={task.orderId} {...task} />
          ))}
        </div>

        {/* Mini Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 pt-6">
          <div className="md:col-span-8 bg-white border border-outline-variant rounded-2xl p-6 flex flex-col justify-between min-h-[200px]">
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
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "40%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "70%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "55%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "90%" }}
                />
                <div
                  className="w-8 bg-primary-container rounded-t-sm"
                  style={{ height: "65%" }}
                />
                <div
                  className="w-8 bg-primary rounded-t-sm"
                  style={{ height: "85%" }}
                />
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
      </main>

      {/* Floating Action Button */}
      <button className="fixed bottom-24 right-4 lg:bottom-12 lg:right-12 w-14 h-14 bg-primary text-on-primary rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40">
        <QrCode className="w-8 h-8" />
      </button>

      <BottomNav />
    </div>
  );
}
