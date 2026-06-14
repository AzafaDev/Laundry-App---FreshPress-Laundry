"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, MessageCircle, CheckCircle, Loader2, X } from "lucide-react";
import type { DriverTask } from "@/services/driverTask.service";
import { ConfirmCompleteDialog } from "./ConfirmCompleteDialog";

export function TaskDetailModal({
  task,
  activeTask,
  isOpen,
  onClose,
  onClaim,
  onComplete,
  isClaiming,
  isCompleting,
}: {
  task: DriverTask | null;
  activeTask: DriverTask | null;
  isOpen: boolean;
  onClose: () => void;
  onClaim: (taskId: string) => void;
  onComplete: () => void;
  isClaiming: boolean;
  isCompleting: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (!isOpen) setShowConfirm(false);
  }, [isOpen]);

  const displayTask = task ?? activeTask;
  const isActiveMode = !task && !!activeTask;

  if (!displayTask) return null;

  const order = displayTask.order;
  const isPickup = displayTask.task_type === "pickup";
  const address = isPickup
    ? order?.pickup_address?.address
    : order?.delivery_address?.address || order?.pickup_address?.address;
  const customerName = order?.customer?.full_name ?? "Customer";
  const invoiceNumber = order?.invoice_number ?? "#Unknown";
  const hasNotes = order && "notes" in order && (order as any).notes;

  const handleClose = () => {
    if (showConfirm) {
      setShowConfirm(false);
    } else {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="w-full max-w-md bg-surface rounded-2xl shadow-2xl overflow-hidden relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start p-5 pb-3">
              <div>
                <span className="text-xs font-bold uppercase text-primary bg-primary/10 px-2 py-1 rounded-full">
                  {isPickup ? "PICKUP" : "DELIVERY"}
                </span>
                <h2 className="text-xl font-bold mt-2 text-on-surface">{customerName}</h2>
                <p className="text-sm text-on-surface-variant">Invoice: {invoiceNumber}</p>
              </div>
              {isActiveMode && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary text-xs rounded-full font-semibold">
                  <CheckCircle className="w-3 h-3" /> Active Task
                </span>
              )}
              <button
                onClick={handleClose}
                className="ml-2 p-1.5 rounded-full hover:bg-surface-container-low transition-colors text-on-surface-variant"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="px-5 pb-5 space-y-3">
              <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-on-surface">Alamat</p>
                  <p className="text-sm text-on-surface-variant">{address || "Alamat tidak tersedia"}</p>
                </div>
              </div>

              {order?.customer?.phone && (
                <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                  <Phone className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Nomor Telepon</p>
                    <a
                      href={`tel:${order.customer.phone}`}
                      className="text-sm text-primary hover:underline"
                    >
                      {order.customer.phone}
                    </a>
                  </div>
                </div>
              )}

              {hasNotes && (
                <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                  <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Catatan Khusus</p>
                    <p className="text-sm text-on-surface-variant italic">&ldquo;{(order as any).notes}&rdquo;</p>
                  </div>
                </div>
              )}

              {isActiveMode ? (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={isCompleting}
                  className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isCompleting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <CheckCircle className="w-4 h-4" />
                  )}
                  {isCompleting ? "Memproses..." : "Complete Task"}
                </button>
              ) : (
                <button
                  onClick={() => onClaim(displayTask.id)}
                  disabled={isClaiming}
                  className="w-full py-3.5 bg-primary text-on-primary rounded-xl font-bold text-sm hover:opacity-90 active:scale-[0.98] transition-all disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {isClaiming ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : null}
                  {isClaiming ? "Mengambil..." : "Ambil Task"}
                </button>
              )}
            </div>

            <AnimatePresence>
              {showConfirm && (
                <ConfirmCompleteDialog
                  onConfirm={() => {
                    onComplete();
                    setShowConfirm(false);
                  }}
                  onCancel={() => setShowConfirm(false)}
                  isLoading={isCompleting}
                />
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
