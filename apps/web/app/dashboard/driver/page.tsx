"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, Truck } from "lucide-react";
import { DriverSidebar } from "@/components/dashboard/DriverSidebar";
import { DriverTopBar } from "@/components/dashboard/DriverTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CheckInPrompt } from "@/components/dashboard/CheckInPrompt";
import { EmployeeWelcomeBanner } from "@/components/dashboard/EmployeeWelcomeBanner";
import { AvailableTaskCard } from "@/components/driver/AvailableTaskCard";
import { ActiveTaskCard } from "@/components/driver/ActiveTaskCard";
import { LockedTaskPreview } from "@/components/driver/LockedTaskPreview";
import { EmptyState } from "@/components/driver/EmptyState";
import { TaskSkeleton } from "@/components/driver/TaskSkeleton";
import { TaskDetailModal } from "@/components/driver/TaskDetailModal";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useDriverTasks } from "@/hooks/useDriverTasks";
import { useDriverTaskSocket } from "@/hooks/useDriverTaskSocket";
import type { DriverTask } from "@/services/driverTask.service";

type TaskTab = "pickup" | "delivery";

export default function DriverDashboardPage() {
  const { user, _hasHydrated } = useEmployeeAuthStore();
  const [activeTab, setActiveTab] = useState<TaskTab>("pickup");
  const [selectedTask, setSelectedTask] = useState<DriverTask | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    isClaiming,
    isCompleting,
  } = useDriverTasks({ checkedIn });

  useDriverTaskSocket(() => {
    if (isModalOpen && !selectedTask) {
      setIsModalOpen(false);
    }
  });

  const scrollRef = useRef<HTMLDivElement>(null);
  const [thumbTop, setThumbTop] = useState(0);
  const [thumbHeight, setThumbHeight] = useState(0);
  const [isScrollable, setIsScrollable] = useState(false);

  const updateThumb = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollable = el.scrollHeight > el.clientHeight;
    setIsScrollable(scrollable);
    if (scrollable) {
      const ratio = el.clientHeight / el.scrollHeight;
      setThumbHeight(ratio * el.clientHeight);
      setThumbTop((el.scrollTop / el.scrollHeight) * el.clientHeight);
    }
  }, []);

  useEffect(() => {
    setIsScrollable(false);
    const id = requestAnimationFrame(updateThumb);
    return () => cancelAnimationFrame(id);
  }, [activeTab, availablePickups, availableDeliveries, updateThumb]);

  if (!_hasHydrated) {
    return <div className="min-h-screen flex items-center justify-center text-on-surface-variant text-sm">Memuat...</div>;
  }

  const handleOpenModal = (task?: DriverTask) => {
    setSelectedTask(task ?? null);
    setIsModalOpen(true);
  };

  const handleClaim = (taskId: string) => {
    claimTask(taskId, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const handleComplete = () => {
    if (!activeTask) return;
    completeTask(activeTask.id, {
      onSuccess: () => setIsModalOpen(false),
    });
  };

  const isLoadingTasks = activeTab === "pickup" ? isLoadingPickups : isLoadingDeliveries;
  const currentTasks = activeTab === "pickup" ? availablePickups : availableDeliveries;
  const pickupCount = availablePickups.length;
  const deliveryCount = availableDeliveries.length;

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <TaskDetailModal
        task={selectedTask}
        activeTask={isModalOpen && !selectedTask ? activeTask : null}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onClaim={handleClaim}
        onComplete={handleComplete}
        isClaiming={isClaiming}
        isCompleting={isCompleting}
      />
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
              onClick={() => handleOpenModal()}
            />
          </div>
        )}

        {!checkedIn && !hasActiveTask && <LockedTaskPreview />}

        {checkedIn && (
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
                  <div className="relative flex gap-2">
                    <div
                      ref={scrollRef}
                      className="flex-1 max-h-[60vh] overflow-y-auto custom-scrollbar"
                      onScroll={updateThumb}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {currentTasks.map((task) => (
                          <AvailableTaskCard
                            key={task.id}
                            task={task}
                            onSelect={() => handleOpenModal(task)}
                            disabled={hasActiveTask}
                          />
                        ))}
                      </div>
                    </div>
                    {isScrollable && (
                      <div className="w-1 relative shrink-0 rounded-full bg-surface-container">
                        <div
                          className="absolute w-full rounded-full bg-outline-variant transition-all duration-75"
                          style={{ top: thumbTop, height: thumbHeight }}
                        />
                      </div>
                    )}
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
