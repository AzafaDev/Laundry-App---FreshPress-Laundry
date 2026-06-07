"use client";

import { WorkerSidebar } from "@/components/dashboard/WorkerSidebar";
import { WorkerTopBar } from "@/components/dashboard/WorkerTopBar";
import { BottomNav } from "@/components/layout/BottomNav";
import { CheckInPrompt } from "@/components/dashboard/CheckInPrompt";
import { EmployeeWelcomeBanner } from "@/components/dashboard/EmployeeWelcomeBanner";
import { StationStatusCard, LockedStationPreview } from "@/components/worker/StationStatusCard";
import { useEmployeeAuthStore } from "@/stores/employeeAuthStore";
import { useAttendance } from "@/hooks/useAttendance";
import { useWorkerStation } from "@/hooks/useWorkerStation";
import { useWorkerSocket } from "@/hooks/useWorkerSocket";

export default function WorkerDashboardPage() {
  const { _hasHydrated, user } = useEmployeeAuthStore();
  const { currentShift, checkedIn, checkInTime } = useAttendance();
  const { stationOrders, stationType, isLoading: isLoadingStation } = useWorkerStation();

  useWorkerSocket();

  if (!_hasHydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center text-on-surface-variant text-sm">
        Memuat...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24 lg:pb-0">
      <WorkerSidebar />
      <WorkerTopBar />
      <main className="lg:pl-80 p-4 md:p-8 space-y-5">

        <EmployeeWelcomeBanner
          fullName={user?.full_name ?? "Worker"}
          attendanceHref="/dashboard/worker/attendance"
          checkedIn={checkedIn}
          checkInTime={checkInTime}
          currentShift={currentShift}
        />

        {!checkedIn && currentShift?.phase !== "ended" && (
          <CheckInPrompt href="/dashboard/worker/attendance" />
        )}

        <div>
          <h2 className="text-sm font-bold uppercase tracking-wider text-on-surface-variant mb-3">
            Station Kamu
          </h2>
          {!checkedIn ? (
            <LockedStationPreview />
          ) : (
            <StationStatusCard
              count={stationOrders.length}
              stationType={stationType}
              isLoading={isLoadingStation}
            />
          )}
        </div>

      </main>
      <BottomNav />
    </div>
  );
}
