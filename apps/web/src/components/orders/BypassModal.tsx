"use client";

import { useEffect, useRef } from "react";
import { Flag, X, Info } from "lucide-react";

interface BypassModalProps {
  open: boolean;
  onClose: () => void;
}

export const BypassModal = ({ open, onClose }: BypassModalProps) => {
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (open) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-[10px]">
      <div
        ref={modalRef}
        className="bg-surface-container-lowest w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
      >
        <div className="p-6 border-b border-outline-variant flex justify-between items-center">
          <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
            <Flag className="w-5 h-5 text-error" />
            Request Bypass
          </h2>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high rounded-full p-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-on-surface-variant">
            You are reporting a quantity mismatch for{" "}
            <strong>Denim Trousers</strong>. Please provide a reason.
          </p>
          <div className="space-y-1">
            <label className="text-sm font-bold">Reason for Mismatch</label>
            <select className="w-full bg-white border border-outline-variant rounded-lg p-3 text-sm focus:border-primary">
              <option>Garment missing from bag</option>
              <option>Incorrectly listed by customer</option>
              <option>Item rejected due to damage</option>
              <option>Other (specify below)</option>
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-bold">Additional Notes</label>
            <textarea
              className="w-full bg-white border border-outline-variant rounded-lg p-3 text-sm h-24 focus:border-primary"
              placeholder="Enter details..."
            />
          </div>
          <div className="p-4 bg-surface-container rounded-lg border border-primary/20 flex gap-2">
            <Info className="w-5 h-5 text-primary" />
            <p className="text-xs text-on-surface-variant">
              Bypass requests are reviewed by the Quality Assurance lead within
              15 minutes.
            </p>
          </div>
        </div>

        <div className="p-6 bg-surface-container-low flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-2 text-sm font-bold text-on-surface-variant hover:bg-surface-container-high rounded-lg"
          >
            Cancel
          </button>
          <button className="flex-1 py-2 text-sm font-bold bg-primary text-on-primary rounded-lg shadow-sm hover:opacity-90 active:scale-95">
            Submit Request
          </button>
        </div>
      </div>
    </div>
  );
};
