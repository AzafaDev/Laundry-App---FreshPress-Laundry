"use client";

import { motion } from "framer-motion";
import { MapPin, Loader2 } from "lucide-react";
import { TaskTypeIcon } from "./TaskTypeIcon";
import type { DriverTask } from "@/services/driverTask.service";

export function AvailableTaskCard({
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
