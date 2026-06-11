"use client";

import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { useDriverTasks } from "@/hooks/useDriverTasks";
import type { DriverTask } from "@/services/driverTask.service";

function TaskDetailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const taskId = searchParams.get("id");
  const { availablePickups, availableDeliveries, activeTask, isLoadingActive } = useDriverTasks({ checkedIn: true });

  const allTasks: DriverTask[] = [
    ...(availablePickups ?? []),
    ...(availableDeliveries ?? []),
    ...(activeTask ? [activeTask] : []),
  ];
  const isLoading = isLoadingActive;
  const task = allTasks.find((t) => t.id === taskId);

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="sticky top-0 z-10 bg-surface border-b border-outline-variant px-4 py-3 flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="p-2 rounded-full hover:bg-surface-container-high transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-base font-semibold">Detail Tugas</h1>
      </div>

      <div className="px-4 py-6">
        {isLoading && (
          <p className="text-sm text-on-surface-variant text-center mt-10">
            Memuat data...
          </p>
        )}

        {!isLoading && !task && (
          <p className="text-sm text-on-surface-variant text-center mt-10">
            Tugas tidak ditemukan.
          </p>
        )}

        {task && (
          <div className="space-y-4">
            <div className="bg-surface border border-outline-variant rounded-xl p-4 space-y-3">
              <div>
                <p className="text-xs text-on-surface-variant">Invoice</p>
                <p className="font-semibold text-on-surface">
                  {task.order?.invoice_number ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Jenis Tugas</p>
                <p className="font-semibold capitalize text-on-surface">
                  {task.task_type?.replace(/_/g, " ") ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Status</p>
                <span className="inline-block mt-1 px-2.5 py-0.5 text-xs rounded-full bg-primary/10 text-primary font-medium capitalize">
                  {task.status?.replace(/_/g, " ") ?? "-"}
                </span>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Pelanggan</p>
                <p className="text-sm text-on-surface">
                  {task.order?.customer?.full_name ?? "-"} &mdash; {task.order?.customer?.phone ?? "-"}
                </p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Alamat</p>
                <p className="text-sm text-on-surface">
                  {task.task_type === "delivery"
                    ? (task.order?.delivery_address?.address ?? task.order?.pickup_address?.address ?? "-")
                    : (task.order?.pickup_address?.address ?? "-")}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TaskDetailPage() {
  return (
    <Suspense fallback={<div className="p-4 text-sm text-on-surface-variant">Memuat...</div>}>
      <TaskDetailContent />
    </Suspense>
  );
}
