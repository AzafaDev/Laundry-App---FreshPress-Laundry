"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  User,
  Clock,
  CalendarDays,
  Truck,
  ShoppingBag,
  Loader2,
  Phone,
  AlertTriangle,
  X,
} from "lucide-react";
import { CheckInPrompt } from "@/components/dashboard/CheckInPrompt";
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

type TaskTab = "pickup" | "delivery";

function ConfirmCompleteDialog({
  onConfirm,
  onCancel,
  isLoading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  isLoading: boolean;
}) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm p-4"
        onClick={onCancel}
      >
        <motion.div
          initial={{ opacity: 0, y: 40, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.97 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="w-full max-w-sm bg-surface rounded-2xl p-6 shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-start gap-4 mb-5">
            <div className="w-10 h-10 rounded-xl bg-warning/15 flex items-center justify-center flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-warning" />
            </div>
            <div>
              <h3 className="text-base font-bold text-on-surface">Konfirmasi Selesai</h3>
              <p className="text-sm text-on-surface-variant mt-1">
                Pastikan task sudah benar-benar selesai. Aksi ini tidak bisa dibatalkan.
              </p>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 border border-outline-variant text-on-surface-variant rounded-xl font-semibold text-sm hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 py-2.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Ya, Selesai"}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

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
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-surface border border-outline-variant rounded-xl p-4 shadow-sm hover:shadow-md hover:border-primary/30 transition-all"
    >
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <TaskTypeIcon type={task.task_type} />
          <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
            {taskTypeLabel}
          </span>
        </div>
        <span className="text-xs text-outline font-mono">#{order?.invoice_number}</span>
      </div>
      <h3 className="text-base font-bold text-on-surface mb-1">{customerName}</h3>
      <div className="flex items-start gap-2 text-sm text-on-surface-variant mb-4">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0 text-primary/60" />
        <span className="line-clamp-2">{address || "Alamat tidak tersedia"}</span>
      </div>
      <button
        onClick={() => onClaim(task.id)}
        disabled={isClaiming}
        className="w-full py-2.5 bg-primary text-on-primary rounded-lg font-semibold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {isClaiming ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Ambil Task"}
      </button>
    </motion.div>
  );
}

function ActiveTaskCard({
  task,
  onComplete,
  isCompleting,
  onRequestComplete,
}: {
  task: DriverTask;
  onComplete: () => void;
  isCompleting: boolean;
  onRequestComplete: () => void;
}) {
  const order = task.order;
  const address =
    task.task_type === "pickup"
      ? order?.pickup_address?.address
      : order?.delivery_address?.address || order?.pickup_address?.address;
  const customerName = order?.customer?.full_name ?? "Customer";
  const customerPhone = order?.customer?.phone;
  const taskTypeLabel = task.task_type === "pickup" ? "Pickup" : "Delivery";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative overflow-hidden bg-primary rounded-2xl p-5 shadow-lg shadow-primary/20"
    >
      {/* Decorative ring */}
      <div className="absolute -top-8 -right-8 w-32 h-32 rounded-full border-[12px] border-on-primary/10 pointer-events-none" />

      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-on-primary/15 p-1.5 rounded-full">
            <TaskTypeIcon type={task.task_type} />
          </div>
          <div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-primary/70 block">
              Active Task
            </span>
            <span className="text-xs font-semibold text-on-primary/90">{taskTypeLabel}</span>
          </div>
        </div>
        <span className="text-xs text-on-primary/60 font-mono bg-on-primary/10 px-2 py-1 rounded-full">
          #{order?.invoice_number}
        </span>
      </div>

      <h3 className="text-xl font-bold text-on-primary mb-2">{customerName}</h3>

      <div className="flex items-start gap-2 text-sm text-on-primary/80 mb-2">
        <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
        <span>{address || "Alamat tidak tersedia"}</span>
      </div>

      {customerPhone && (
        <a
          href={`tel:${customerPhone}`}
          className="flex items-center gap-2 text-sm text-on-primary/80 mb-4 hover:text-on-primary transition-colors w-fit"
        >
          <Phone className="w-4 h-4 flex-shrink-0" />
          <span>{customerPhone}</span>
        </a>
      )}

      <div className="flex gap-3 mt-4">
        <Link
          href={`/dashboard/driver/task-detail?taskId=${task.id}`}
          className="flex-1 py-2.5 bg-on-primary text-primary rounded-xl font-bold text-sm text-center hover:opacity-90 active:scale-[0.98] transition-all"
        >
          Detail Task
        </Link>
        <button
          onClick={onRequestComplete}
          disabled={isCompleting}
          className="flex-1 py-2.5 border-2 border-on-primary/40 text-on-primary rounded-xl font-bold text-sm hover:bg-on-primary/10 active:scale-[0.98] transition-all disabled:opacity-60"
        >
          {isCompleting ? <Loader2 className="w-4 h-4 animate-spin mx-auto" /> : "Selesai"}
        </button>
      </div>
    </motion.div>
  );
}

function TaskSkeleton() {
  return (
    <div className="bg-surface border border-outline-variant rounded-xl p-4 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="w-20 h-6 bg-outline-variant/50 rounded-full" />
        <div className="w-16 h-4 bg-outline-variant/50 rounded" />
      </div>
      <div className="h-5 bg-outline-variant/50 rounded w-3/4 mb-2" />
      <div className="h-4 bg-outline-variant/50 rounded w-full mb-4" />
      <div className="h-10 bg-outline-variant/50 rounded-lg w-full" />
    </div>
  );
}

function EmptyState({ type }: { type: "pickup" | "delivery" }) {
  const Icon = type === "pickup" ? ShoppingBag : Truck;
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-outline-variant/20 flex items-center justify-center mb-3">
        <Icon className="w-8 h-8 text-outline" />
      </div>
      <p className="text-sm font-medium text-on-surface-variant">
        Tidak ada {type === "pickup" ? "pickup" : "delivery"} tersedia
      </p>
      <p className="text-xs text-outline mt-1">Cek kembali nanti</p>
    </div>
  );
}

export default function DriverDashboardPage() {
  const router = useRouter();
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const [claimingTaskId, setClaimingTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<TaskTab>("pickup");
  const [showCompleteDialog, setShowCompleteDialog] = useState(false);
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

    const unsubOrderUpdate = on("order:status-updated", (data: { orderId: string; invoiceNumber?: string; status: string }) => {
      const label = data.invoiceNumber ? `#${data.invoiceNumber}` : "Order";
      toast.success(`${label} status diperbarui: ${data.status}`);
    });

    return () => {
      unsubClaimed();
      unsubCompleted();
      unsubOrderUpdate();
    };
  }, [on, queryClient]);

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface-variant text-sm">Memuat...</div>;
  }

  const handleClaim = (taskId: string) => {
    setClaimingTaskId(taskId);
    claimTask(taskId, {
      onSuccess: () => {
        router.push(`/dashboard/driver/task-detail?taskId=${taskId}`);
      },
      onError: () => {
        setClaimingTaskId(null);
      },
    });
  };

  const handleComplete = () => {
    if (activeTask) {
      completeTask(activeTask.id, {
        onSuccess: () => {
          setShowCompleteDialog(false);
          router.push("/dashboard/driver");
        },
        onError: () => {
          setShowCompleteDialog(false);
        },
      });
    }
  };

  const isLoadingTasks = activeTab === "pickup" ? isLoadingPickups : isLoadingDeliveries;
  const currentTasks = activeTab === "pickup" ? availablePickups : availableDeliveries;
  const pickupCount = availablePickups.length;
  const deliveryCount = availableDeliveries.length;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      {showCompleteDialog && (
        <ConfirmCompleteDialog
          onConfirm={handleComplete}
          onCancel={() => setShowCompleteDialog(false)}
          isLoading={isCompleting}
        />
      )}
      <DriverSidebar />
      <DriverTopBar />
      <main className="lg:pl-80 p-4 md:p-8 space-y-5">

        {/* Welcome Banner */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-primary to-primary-container rounded-2xl p-5 shadow-md shadow-primary/15"
        >
          <div className="absolute top-0 right-0 w-40 h-40 rounded-full bg-on-primary/5 -translate-y-1/2 translate-x-1/4 pointer-events-none" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 relative">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-on-primary/20 flex items-center justify-center">
                <User className="w-5 h-5 text-on-primary" />
              </div>
              <div>
                <p className="text-xs text-on-primary/70">Selamat datang,</p>
                <h2 className="text-lg font-bold text-on-primary leading-tight">
                  {user?.full_name ?? "Driver"}
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentShift && (
                <div className="flex items-center gap-1.5 text-xs bg-on-primary/15 text-on-primary px-3 py-1.5 rounded-full">
                  <Clock className="w-3.5 h-3.5" />
                  <span>{currentShift.shiftName}</span>
                  <span className="font-semibold">{currentShift.startTime}–{currentShift.endTime}</span>
                </div>
              )}
              <Link
                href="/dashboard/driver/attendance"
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all ${
                  checkedIn
                    ? "bg-on-primary text-primary"
                    : "bg-on-primary/20 text-on-primary hover:bg-on-primary/30"
                }`}
              >
                {checkedIn ? `✓ ${checkInTime}` : "Belum Check In"}
              </Link>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-on-primary/60 relative">
            <CalendarDays className="w-3.5 h-3.5" />
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

        {/* Check-in prompt */}
        {!checkedIn && (
          <CheckInPrompt href="/dashboard/driver/attendance" />
        )}

        {/* Active Task */}
        {!isLoadingActive && hasActiveTask && activeTask && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Task Aktif
            </h2>
            <ActiveTaskCard
            task={activeTask}
            onComplete={handleComplete}
            isCompleting={isCompleting}
            onRequestComplete={() => setShowCompleteDialog(true)}
          />
          </div>
        )}

        {/* Queue summary — shown when driver has active task */}
        {hasActiveTask && (pickupCount > 0 || deliveryCount > 0) && (
          <div className="flex items-center gap-2 px-4 py-2.5 bg-surface-container-low border border-outline-variant rounded-xl text-xs text-on-surface-variant">
            <span className="font-medium">Antrian berikutnya:</span>
            {pickupCount > 0 && (
              <span className="flex items-center gap-1 bg-tertiary/10 text-tertiary font-bold px-2 py-0.5 rounded-full">
                <ShoppingBag className="w-3 h-3" />
                {pickupCount} pickup
              </span>
            )}
            {deliveryCount > 0 && (
              <span className="flex items-center gap-1 bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                <Truck className="w-3 h-3" />
                {deliveryCount} delivery
              </span>
            )}
          </div>
        )}

        {/* Task Tabs — only show when no active task */}
        {!hasActiveTask && (
          <div>
            {/* Tab Header */}
            <div className="flex items-center gap-1 bg-surface-container-low rounded-xl p-1 mb-4">
              {(["pickup", "delivery"] as TaskTab[]).map((tab) => {
                const count = tab === "pickup" ? pickupCount : deliveryCount;
                const isActive = activeTab === tab;
                return (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`relative flex-1 flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-primary text-on-primary shadow-sm"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {tab === "pickup" ? (
                      <ShoppingBag className="w-4 h-4" />
                    ) : (
                      <Truck className="w-4 h-4" />
                    )}
                    <span className="capitalize">{tab === "pickup" ? "Pickup" : "Delivery"}</span>
                    {count > 0 && (
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                          isActive
                            ? "bg-on-primary/20 text-on-primary"
                            : "bg-primary/15 text-primary"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Content */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: activeTab === "pickup" ? -10 : 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: activeTab === "pickup" ? 10 : -10 }}
                transition={{ duration: 0.15 }}
              >
                {isLoadingTasks ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <TaskSkeleton />
                    <TaskSkeleton />
                    <TaskSkeleton />
                  </div>
                ) : currentTasks.length === 0 ? (
                  <EmptyState type={activeTab} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {currentTasks.map((task) => (
                      <AvailableTaskCard
                        key={task.id}
                        task={task}
                        onClaim={handleClaim}
                        isClaiming={claimingTaskId === task.id}
                      />
                    ))}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
