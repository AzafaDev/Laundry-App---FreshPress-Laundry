"use client";

import { motion } from "framer-motion";
import { MapPin, Clock, ArrowRight } from "lucide-react";
import { TaskTypeIcon } from "./TaskTypeIcon";
import type { DriverTask } from "@/services/driverTask.service";

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour} jam lalu`;
  return date.toLocaleString("id-ID", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

export function AvailableTaskCard({
  task,
  onSelect,
  disabled,
}: {
  task: DriverTask;
  onSelect: () => void;
  disabled?: boolean;
}) {
  const order = task.order;
  const address =
    task.task_type === "pickup"
      ? order?.pickup_address?.address
      : order?.delivery_address?.address || order?.pickup_address?.address;
  const customerName = order?.customer?.full_name ?? "Customer";
  const taskTypeLabel = task.task_type === "pickup" ? "Pickup" : "Delivery";
  const relativeTime = formatRelativeTime(task.created_at);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={disabled ? undefined : onSelect}
      title={disabled ? "Selesaikan task aktif dulu" : undefined}
      className={`group relative bg-surface border border-outline-variant rounded-2xl overflow-hidden shadow-sm transition-all duration-200 ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md hover:border-primary/40 cursor-pointer"
      }`}
    >
      {/* top accent bar */}
      <div className={`h-0.5 w-full ${task.task_type === "pickup" ? "bg-tertiary" : "bg-primary"}`} />

      <div className="p-4">
        {/* header row */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <TaskTypeIcon type={task.task_type} />
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
              {taskTypeLabel}
            </span>
          </div>
          <span className="text-xs text-outline font-mono bg-surface-container-low px-2 py-0.5 rounded-full">
            #{order?.invoice_number}
          </span>
        </div>

        {/* customer name */}
        <h3 className="text-base font-bold text-on-surface mb-2 leading-tight">{customerName}</h3>

        {/* address */}
        <div className="flex items-start gap-2 text-sm text-on-surface-variant mb-3">
          <MapPin className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-primary/60" />
          <span className="line-clamp-2 leading-snug">{address || "Alamat tidak tersedia"}</span>
        </div>

        {/* timestamp */}
        <div className="flex items-center gap-1.5 text-xs text-outline mb-4">
          <Clock className="w-3 h-3 flex-shrink-0" />
          <span>Request {relativeTime}</span>
        </div>

        {/* CTA */}
        <div className={`flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl font-semibold text-sm transition-all duration-150 ${
          disabled
            ? "bg-primary/10 text-primary"
            : "bg-primary/10 text-primary group-hover:bg-primary group-hover:text-on-primary"
        }`}>
          <span>Lihat Detail</span>
          <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-0.5" />
        </div>
      </div>
    </motion.div>
  );
}
