"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ClipboardList,
  MapPin,
  Navigation,
  User,
  Clock,
  CalendarDays,
  Truck,
  ShoppingBag,
  Loader2,
} from "lucide-react";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useDriverTasks } from "@/hooks/useDriverTasks";
import { useSocket } from "@/hooks/useSocket";
import { useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import type { DriverTask } from "@/services/driverTask.service";

function TaskTypeIcon({ type }: { type: "pickup" | "delivery" }) {
  const Icon = type === "pickup" ? ShoppingBag : Truck;
  const bgColor = type === "pickup" ? "bg-tertiary/10" : "bg-primary/10";
  const textColor = type === "pickup" ? "text-tertiary" : "text-primary";
  return (
    <div className={`p-2 rounded-full ${bgColor} ${textColor}`}>
      <Icon className="w-5 h-5" />
    </div>
  );
}

function AvailableTaskCard({
  task,
  onClaim,
  isClaiming,
}: {
  task: DriverTask;
  onClaim: (id: string) => void;
  isClaiming: boolean;
}) {
  const order = task.order;
  const address =
    task.task_type === "pickup"
      ? order?.pickup_address?.address
      : order?.delivery_address?.address || order?.pickup_address?.address;
  const customerName = order?.customer?.full_name ?? "Customer";
  const taskTypeLabel = task.task_type === "pickup" ? "Pickup" : "Delivery";

  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <TaskTypeIcon type={task.task_type} />
          <span className="text-xs font-bold uppercase text-on-surface-variant">
            {taskTypeLabel}
          </span>
        </div>
        <span className="text-xs text-outline">#{order?.invoice_number?.slice(0, 8)}</span>
      </div>
      <h3 className="text-lg font-bold text-on-surface mb-1">{customerName}</h3>
      <div className="flex items-start gap-2 text-sm text-on-surface-variant mb-4">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{address || "Alamat tidak tersedia"}</span>
      </div>
      <button
        onClick={() => onClaim(task.id)}
        disabled={isClaiming}
        className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isClaiming ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Claim Task"}
      </button>
    </div>
  );
}

function ActiveTaskCard({ task, onComplete, isCompleting }: { task: DriverTask; onComplete: () => void; isCompleting: boolean }) {
  const order = task.order;
  const address =
    task.task_type === "pickup"
      ? order?.pickup_address?.address
      : order?.delivery_address?.address || order?.pickup_address?.address;
  const customerName = order?.customer?.full_name ?? "Customer";
  const taskTypeLabel = task.task_type === "pickup" ? "Pickup" : "Delivery";

  return (
    <div className="bg-primary-container/10 border-2 border-primary/30 rounded-xl p-5 shadow-md">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <TaskTypeIcon type={task.task_type} />
          <span className="text-xs font-bold uppercase text-primary">Active Task</span>
        </div>
        <span className="text-xs text-outline">#{order?.invoice_number?.slice(0, 8)}</span>
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-1">{customerName}</h3>
      <div className="flex items-start gap-2 text-sm text-on-surface-variant mb-4">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{address || "Alamat tidak tersedia"}</span>
      </div>
      <div className="flex gap-3">
        <Link
          href={`/dashboard/driver/task-detail?taskId=${task.id}`}
          className="flex-1 py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm text-center hover:opacity-90 transition-all"
        >
          Go to Task Detail
        </Link>
        <button
          onClick={onComplete}
          disabled={isCompleting}
          className="flex-1 py-2.5 border-2 border-primary text-primary rounded-lg font-semibold text-sm hover:bg-primary/10 transition-all disabled:opacity-60"
        >
          {isCompleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Complete"}
        </button>
      </div>
    </div>
  );
}

function TaskSkeleton() {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="w-20 h-6 bg-outline-variant rounded-full" />
        <div className="w-16 h-4 bg-outline-variant rounded" />
      </div>
      <div className="h-6 bg-outline-variant rounded w-3/4 mb-2" />
      <div className="h-4 bg-outline-variant rounded w-full mb-4" />
      <div className="h-10 bg-outline-variant rounded-lg w-full" />
    </div>
  );
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const { currentShift, checkedIn, checkInTime } = useAttendance();
  const {
    activeTask,
    hasActiveTask,
    availablePickups,
    availableDeliveries,
    isLoadingActive,
    isLoadingPickups,
    isLoadingDeliveries,
    claimTask,
    isClaiming,
    completeTask,
    isCompleting,
  } = useDriverTasks();

  const { on } = useSocket();
  const queryClient = useQueryClient();

  useEffect(() => {
    const unsubClaimed = on("driver:task-claimed", () => {
      toast("Ada task baru yang tersedia", { icon: "🔄" });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    const unsubCompleted = on("driver:task-completed", () => {
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "active"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-pickups"] });
      queryClient.invalidateQueries({ queryKey: ["driver", "tasks", "available-deliveries"] });
    });

    const unsubOrderUpdate = on("order:status-updated", (data: { orderId: string; status: string }) => {
      toast.success(`Order ${data.orderId} status: ${data.status}`);
    });

    return () => {
      unsubClaimed();
      unsubCompleted();
      unsubOrderUpdate();
    };
  }, [on, queryClient]);

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;
  }

  const handleClaim = (taskId: string) => {
    claimTask(taskId, {
      onSuccess: () => {
        router.push(`/dashboard/driver/task-detail?taskId=${taskId}`);
      },
    });
  };

  const handleComplete = () => {
    if (activeTask) {
      completeTask(activeTask.id, {
        onSuccess: () => {
          router.push("/dashboard/driver");
        },
      });
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <DriverSidebar />
      <DriverTopBar />
      <main className="lg:pl-80 p-4 md:p-8 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-r from-primary/10 to-primary-container/20 p-5 rounded-2xl border border-primary/20"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center text-on-primary">
                <User className="w-6 h-6" />
              </div>
              <div>
                <p className="text-sm text-on-surface-variant">Selamat datang,</p>
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

        {hasActiveTask && activeTask && (
          <div>
            <h2 className="text-lg font-bold text-on-surface mb-3">Aktif Task</h2>
            <ActiveTaskCard task={activeTask} onComplete={handleComplete} isCompleting={isCompleting} />
          </div>
        )}

        {!hasActiveTask && (
          <>
            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-on-surface">Pickup Tersedia</h2>
                {availablePickups.length > 3 && (
                  <Link href="/dashboard/driver/pickups" className="text-sm text-primary font-medium">
                    Lihat semua
                  </Link>
                )}
              </div>
              {isLoadingPickups ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                </div>
              ) : availablePickups.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-6 text-center text-on-surface-variant">
                  Tidak ada pickup tersedia saat ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availablePickups.slice(0, 3).map((task) => (
                    <AvailableTaskCard
                      key={task.id}
                      task={task}
                      onClaim={handleClaim}
                      isClaiming={isClaiming}
                    />
                  ))}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-lg font-bold text-on-surface">Delivery Tersedia</h2>
                {availableDeliveries.length > 3 && (
                  <Link href="/dashboard/driver/deliveries" className="text-sm text-primary font-medium">
                    Lihat semua
                  </Link>
                )}
              </div>
              {isLoadingDeliveries ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <TaskSkeleton />
                  <TaskSkeleton />
                  <TaskSkeleton />
                </div>
              ) : availableDeliveries.length === 0 ? (
                <div className="bg-surface-container-low rounded-xl p-6 text-center text-on-surface-variant">
                  Tidak ada delivery tersedia saat ini.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {availableDeliveries.slice(0, 3).map((task) => (
                    <AvailableTaskCard
                      key={task.id}
                      task={task}
                      onClaim={handleClaim}
                      isClaiming={isClaiming}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
      <BottomNav />
    </div>
  );
}