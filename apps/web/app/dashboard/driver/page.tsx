"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Truck } from "lucide-react";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CheckInPrompt } from "@/components/dashboard/CheckInPrompt";
import { EmployeeWelcomeBanner } from "@/components/dashboard/EmployeeWelcomeBanner";
import { ConfirmCompleteDialog } from "@/components/driver/ConfirmCompleteDialog";
import { AvailableTaskCard } from "@/components/driver/AvailableTaskCard";
import { ActiveTaskCard } from "@/components/driver/ActiveTaskCard";
import { LockedTaskPreview } from "@/components/driver/LockedTaskPreview";
import { EmptyState } from "@/components/driver/EmptyState";
import { TaskSkeleton } from "@/components/driver/TaskSkeleton";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useDriverTasks } from "@/hooks/useDriverTasks";
import { useDriverTaskSocket } from "@/hooks/useDriverTaskSocket";

type TaskTab = "pickup" | "delivery";

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

  useDriverTaskSocket();

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface-variant text-sm">Memuat...</div>;
  }

  const handleClaim = (taskId: string) => {
    setClaimingTaskId(taskId);
    claimTask(taskId, {
      onSuccess: () => router.push(`/dashboard/driver/task-detail?taskId=${taskId}`),
      onError: () => setClaimingTaskId(null),
    });
  };

  const handleComplete = () => {
    if (!activeTask) return;
    completeTask(activeTask.id, {
      onSuccess: () => {
        setShowCompleteDialog(false);
        router.push("/dashboard/driver");
      },
      onError: () => setShowCompleteDialog(false),
    });
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

        <EmployeeWelcomeBanner
          fullName={user?.full_name ?? "Driver"}
          attendanceHref="/dashboard/driver/attendance"
          checkedIn={checkedIn}
          checkInTime={checkInTime}
          currentShift={currentShift}
        />

        {!checkedIn && currentShift?.phase !== "ended" && (
          <CheckInPrompt href="/dashboard/driver/attendance" />
        )}

        {!isLoadingActive && hasActiveTask && activeTask && (
          <div>
            <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
              Task Aktif
            </h2>
            <ActiveTaskCard
              task={activeTask}
              isCompleting={isCompleting}
              onRequestComplete={() => setShowCompleteDialog(true)}
            />
          </div>
        )}

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

        {!checkedIn && !hasActiveTask && <LockedTaskPreview />}

        {checkedIn && !hasActiveTask && (
          <div>
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
                    {tab === "pickup" ? <ShoppingBag className="w-4 h-4" /> : <Truck className="w-4 h-4" />}
                    <span className="capitalize">{tab === "pickup" ? "Pickup" : "Delivery"}</span>
                    {count > 0 && (
                      <span
                        className={`text-xs font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center ${
                          isActive ? "bg-on-primary/20 text-on-primary" : "bg-primary/15 text-primary"
                        }`}
                      >
                        {count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

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
