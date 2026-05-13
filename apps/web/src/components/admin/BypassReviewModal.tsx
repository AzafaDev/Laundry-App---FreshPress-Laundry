"use client";

import { useState, useRef, type ClipboardEvent } from "react";
import { X, ShieldAlert, AlertTriangle } from "lucide-react";

interface BypassRequest {
  id: string;
  orderId: string;
  worker: string;
  station: string;
  expected: number;
  actual: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
}

interface BypassReviewModalProps {
  request: BypassRequest;
  onClose: () => void;
  onApprove: (pin: string, adminNote: string) => void;
  onReject: (pin: string, adminNote: string) => void;
}

export function BypassReviewModal({
  request,
  onClose,
  onApprove,
  onReject,
}: BypassReviewModalProps) {
  const [pin, setPin] = useState(["", "", "", "", "", ""]);
  const [adminNote, setAdminNote] = useState("");
  const pinRefs = useRef<(HTMLInputElement | null)[]>([]);

  const handlePinChange = (index: number, value: string) => {
    if (!/^\d?$/.test(value)) return;
    const newPin = [...pin];
    newPin[index] = value;
    setPin(newPin);
    if (value !== "" && index < 5) {
      pinRefs.current[index + 1]?.focus();
    }
  };

  const handlePinKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (e.key === "Backspace" && pin[index] === "" && index > 0) {
      pinRefs.current[index - 1]?.focus();
    }
  };

  const handlePinPaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").trim();
    if (/^\d{6}$/.test(pasted)) {
      const digits = pasted.split("");
      setPin(digits);
      digits.forEach((digit, i) => {
        if (pinRefs.current[i]) pinRefs.current[i]!.value = digit;
      });
      pinRefs.current[5]?.focus();
    }
  };

  const pinCode = pin.join("");
  const isPinComplete = pinCode.length === 6;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-outline-variant">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
          <div className="flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-tertiary" />
            <h3 className="text-xl font-bold text-on-surface">
              Bypass Approval
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            aria-label="Tutup modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="bg-surface-container-low rounded-xl p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <span className="text-on-surface-variant">Order ID</span>
                <p className="font-bold text-on-surface">{request.orderId}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Worker</span>
                <p className="font-bold text-on-surface">{request.worker}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Station</span>
                <p className="font-bold text-on-surface">{request.station}</p>
              </div>
              <div>
                <span className="text-on-surface-variant">Status</span>
                <span className="inline-block px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
                  Pending
                </span>
              </div>
            </div>

            <div className="flex items-center gap-4 p-3 bg-error/5 rounded-lg border border-error/20">
              <AlertTriangle className="w-5 h-5 text-error flex-shrink-0" />
              <div className="text-sm">
                <p className="font-bold text-on-surface">Quantity Mismatch</p>
                <p className="text-on-surface-variant">
                  Expected: <strong>{request.expected}</strong> → Received:{" "}
                  <strong>{request.actual}</strong> (diff:{" "}
                  {request.expected - request.actual})
                </p>
              </div>
            </div>

            <div>
              <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider">
                Worker Reason
              </span>
              <p className="text-sm text-on-surface mt-1 bg-white p-3 rounded-lg border border-outline-variant">
                {request.reason}
              </p>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold text-on-surface-variant block">
              Admin Note
            </label>
            <textarea
              rows={3}
              placeholder="Tambahkan catatan (opsional)"
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-sm resize-none"
            />
          </div>

          <div className="space-y-3">
            <label className="text-sm font-bold text-on-surface-variant block">
              PIN Authentication
            </label>
            <div className="grid grid-cols-6 gap-2">
              {pin.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => {
                    pinRefs.current[index] = el;
                  }}
                  type="password"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handlePinChange(index, e.target.value)}
                  onKeyDown={(e) => handlePinKeyDown(index, e)}
                  onPaste={index === 0 ? handlePinPaste : undefined}
                  aria-label={`PIN digit ${index + 1}`}
                  className="w-full aspect-square text-center text-xl font-bold border-2 rounded-xl bg-surface transition-all outline-none border-outline-variant focus:border-primary focus:ring-4 focus:ring-primary/10"
                />
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onReject(pinCode, adminNote)}
              disabled={!isPinComplete}
              className="py-3 px-6 rounded-xl border-2 border-error text-error font-bold hover:bg-error/5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Reject
            </button>
            <button
              onClick={() => onApprove(pinCode, adminNote)}
              disabled={!isPinComplete}
              className="py-3 px-6 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-primary/20"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
