"use client";

import { motion } from "framer-motion";
import { MapPin } from "lucide-react";
import { TaskTypeIcon } from "./TaskTypeIcon";
import type { DriverTask } from "@/services/driverTask.service";

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={disabled ? undefined : onSelect}
      title={disabled ? "Selesaikan task aktif dulu" : undefined}
      className={`bg-surface border border-outline-variant rounded-xl p-4 shadow-sm transition-all ${
        disabled
          ? "opacity-50 cursor-not-allowed"
          : "hover:shadow-md hover:border-primary/30 cursor-pointer active:scale-[0.99]"
      }`}
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
      <div className="w-full py-2.5 bg-primary/10 text-primary rounded-lg font-semibold text-sm text-center">
        Lihat Detail
      </div>
    </motion.div>
  );
}
