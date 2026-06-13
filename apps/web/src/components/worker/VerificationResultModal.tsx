"use client";

import { CheckCircle2, AlertTriangle, Flag } from "lucide-react";

interface VerificationResultModalProps {
  result: "success" | "mismatch";
  invoiceNumber: string;
  onClose: () => void;
  onBypass: () => void;
}

export function VerificationResultModal({
  result,
  invoiceNumber,
  onClose,
  onBypass,
}: VerificationResultModalProps) {
  const isSuccess = result === "success";

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[120] flex items-end sm:items-center justify-center p-0 sm:p-4">
      <div className="bg-surface-container-lowest w-full sm:max-w-[26rem] rounded-t-2xl sm:rounded-2xl shadow-2xl border border-outline-variant flex flex-col">
        <div className="px-6 py-8 flex flex-col items-center text-center gap-4">
          <div
            className={`p-4 rounded-full ${
              isSuccess ? "bg-emerald-100" : "bg-error/10"
            }`}
          >
            {isSuccess ? (
              <CheckCircle2 className="w-10 h-10 text-emerald-600" />
            ) : (
              <AlertTriangle className="w-10 h-10 text-error" />
            )}
          </div>

          <div className="space-y-1.5">
            <h3 className="text-xl font-bold text-on-surface">
              {isSuccess ? "Item Sesuai" : "Item Tidak Sesuai"}
            </h3>
            <p className="text-sm text-on-surface-variant">
              {isSuccess
                ? `Verifikasi order #${invoiceNumber} berhasil.`
                : "Jumlah item yang diterima tidak sesuai dengan pesanan."}
            </p>
          </div>

          {!isSuccess && (
            <div className="w-full p-3 rounded-xl bg-error/5 border border-error/20 text-sm text-error text-left">
              Lanjutkan dengan mengajukan Bypass Request untuk mendapatkan persetujuan admin.
            </div>
          )}
        </div>

        <div className="px-6 pb-6 flex gap-3">
          {isSuccess ? (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-primary text-on-primary hover:opacity-90 transition-all"
            >
              Selesai
            </button>
          ) : (
            <>
              <button
                onClick={onClose}
                className="flex-1 py-2.5 border border-outline-variant rounded-xl text-sm font-medium text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Batal
              </button>
              <button
                onClick={onBypass}
                className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-error text-white hover:opacity-90 transition-all flex items-center justify-center gap-2"
              >
                <Flag className="w-4 h-4" />
                Ajukan Bypass
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
