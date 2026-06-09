"use client";

import { motion } from "framer-motion";
import { MapPin, Phone } from "lucide-react";
import { TaskTypeIcon } from "./TaskTypeIcon";
import type { DriverTask } from "@/services/driverTask.service";

export function ActiveTaskCard({
  task,
  onClick,
}: {
  task: DriverTask;
  onClick: () => void;
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
      onClick={onClick}
      className="relative overflow-hidden bg-primary rounded-2xl p-5 shadow-lg shadow-primary/20 cursor-pointer active:scale-[0.99] transition-transform"
    >
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

      <div className="mt-4">
        <span className="block w-full py-2.5 bg-on-primary text-primary rounded-xl font-bold text-sm text-center">
          Lihat Detail & Selesaikan
        </span>
      </div>
    </motion.div>
  );
}
