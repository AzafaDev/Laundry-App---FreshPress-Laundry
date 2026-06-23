"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MapPin, Phone, MessageCircle, CheckCircle, Loader2, X, Clock } from "lucide-react";
import type { DriverTask } from "@/services/driverTask.service";
import { formatWhatsApp } from "@/utils/phone";
import { ConfirmCompleteDialog } from "./ConfirmCompleteDialog";

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.554 4.116 1.526 5.845L.057 23.428a.75.75 0 0 0 .915.915l5.617-1.466A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.686-.504-5.223-1.385l-.374-.215-3.876 1.011 1.015-3.848-.228-.383A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  );
}

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
  const notes = order?.notes;
  const requestTime = new Date(displayTask.created_at).toLocaleString("id-ID", {
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

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

              {displayTask.distance_km != null && (
                <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-on-surface">Jarak dari Outlet</p>
                    <p className="text-sm text-on-surface-variant">{displayTask.distance_km} km</p>
                  </div>
                </div>
              )}

              {order?.customer?.phone && (
                <div className="flex items-center gap-3 p-4 bg-surface-container-low rounded-xl">
                  <Phone className="w-5 h-5 text-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-on-surface">Nomor Telepon</p>
                    <p className="text-sm text-on-surface-variant truncate">{order.customer.phone}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <a
                      href={`tel:${order.customer.phone}`}
                      aria-label="Telepon customer"
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                    <a
                      href={`https://wa.me/${formatWhatsApp(order.customer.phone)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Chat WhatsApp customer"
                      className="flex items-center justify-center w-9 h-9 rounded-full bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 transition-colors"
                    >
                      <WhatsAppIcon className="w-4 h-4" />
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-3 p-4 bg-surface-container-low rounded-xl">
                <Clock className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-on-surface">Waktu Request</p>
                  <p className="text-sm text-on-surface-variant">{requestTime}</p>
                </div>
              </div>

              {notes && (
                <div className="relative overflow-hidden rounded-xl border-l-[3px] border-tertiary bg-tertiary/5 px-4 py-3.5">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageCircle className="w-3.5 h-3.5 text-tertiary flex-shrink-0" />
                    <p className="text-xs font-bold uppercase tracking-widest text-tertiary">Catatan Customer</p>
                  </div>
                  <p className="text-sm text-on-surface leading-relaxed italic">{notes}</p>
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
