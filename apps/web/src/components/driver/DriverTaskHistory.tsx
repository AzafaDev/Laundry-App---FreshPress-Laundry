"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, CheckCircle2, MapPin, Clock, PackageCheck } from "lucide-react";
import { driverTaskService } from "@/services/driverTask.service";
import { TaskTypeIcon } from "./TaskTypeIcon";

const LIMIT = 10;

function formatDateTime(dateStr: string | null) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleString("id-ID", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function formatDuration(takenAt: string | null, completedAt: string | null) {
  if (!takenAt || !completedAt) return null;
  const mins = Math.floor((new Date(completedAt).getTime() - new Date(takenAt).getTime()) / 60000);
  if (mins < 1) return "< 1 mnt";
  if (mins < 60) return `${mins} mnt`;
  return `${Math.floor(mins / 60)} jam ${mins % 60} mnt`;
}

function HistorySkeleton() {
  return (
    <div className="space-y-3 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
          <div className="h-0.5 w-full bg-outline-variant/40" />
          <div className="p-4">
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-full bg-outline-variant/40 shrink-0" />
              <div className="flex-1 space-y-2">
                <div className="flex justify-between">
                  <div className="h-3 w-16 bg-outline-variant/40 rounded" />
                  <div className="h-5 w-24 bg-outline-variant/40 rounded-full" />
                </div>
                <div className="h-4 w-36 bg-outline-variant/40 rounded" />
                <div className="h-3 w-full bg-outline-variant/40 rounded" />
              </div>
            </div>
            <div className="mt-3 pt-3 border-t border-outline-variant/40 flex justify-between">
              <div className="h-3 w-40 bg-outline-variant/40 rounded" />
              <div className="h-5 w-16 bg-outline-variant/40 rounded-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function DriverTaskHistory() {
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ["driver", "task-history", page],
    queryFn: () => driverTaskService.getTaskHistory(page, LIMIT),
  });

  if (isLoading) return <HistorySkeleton />;

  const tasks = data?.tasks ?? [];
  const pagination = data?.pagination;

  if (tasks.length === 0) {
    return (
      <div className="text-center py-16 bg-surface-container-low rounded-2xl border border-dashed border-outline-variant">
        <PackageCheck className="w-12 h-12 mx-auto text-outline mb-3" />
        <p className="text-on-surface-variant font-medium">Belum ada task yang selesai</p>
        <p className="text-sm text-outline mt-1">Task pickup dan delivery yang sudah kamu selesaikan akan muncul di sini</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <AnimatePresence mode="wait">
        <motion.div
          key={page}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.15 }}
          className="space-y-3"
        >
          {tasks.map((task) => {
            const isPickup = task.task_type === "pickup";
            const duration = formatDuration(task.taken_at, task.completed_at);

            return (
              <div key={task.id} className="bg-surface border border-outline-variant rounded-2xl overflow-hidden">
                <div className={`h-0.5 w-full ${isPickup ? "bg-tertiary" : "bg-primary"}`} />
                <div className="p-4">
                  <div className="flex items-start gap-3">
                    <TaskTypeIcon type={task.task_type} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                          {isPickup ? "Pickup" : "Delivery"}
                        </span>
                        <span className="text-xs font-mono text-outline bg-surface-container-low px-2 py-0.5 rounded-full shrink-0">
                          #{task.order.invoice_number}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-on-surface leading-tight truncate">
                        {task.order.customer_name ?? "—"}
                      </p>
                      {task.order.address && (
                        <div className="flex items-start gap-1.5 mt-1.5 text-xs text-on-surface-variant">
                          <MapPin className="w-3 h-3 mt-0.5 shrink-0 text-outline" />
                          <span className="line-clamp-1">{task.order.address}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-outline-variant/60">
                    <div className="flex items-center gap-1.5 text-xs text-outline">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{formatDateTime(task.completed_at)}</span>
                    </div>
                    {duration && (
                      <span className="text-xs font-medium bg-surface-container-low text-on-surface-variant px-2 py-0.5 rounded-full flex items-center gap-1 shrink-0">
                        <Clock className="w-3 h-3" />
                        {duration}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </motion.div>
      </AnimatePresence>

      {pagination && pagination.total_pages > 1 && (
        <div className="flex justify-center items-center gap-3 pt-2">
          <button
            onClick={() => setPage((p) => p - 1)}
            disabled={page <= 1}
            className="p-2 rounded-lg border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-all"
            aria-label="Halaman sebelumnya"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-on-surface-variant">{page} / {pagination.total_pages}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= pagination.total_pages}
            className="p-2 rounded-lg border border-outline-variant disabled:opacity-30 hover:bg-surface-container-low transition-all"
            aria-label="Halaman selanjutnya"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
