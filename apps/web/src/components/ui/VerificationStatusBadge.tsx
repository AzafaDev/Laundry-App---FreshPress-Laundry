import { BadgeCheck, AlertTriangle, RefreshCw } from "lucide-react";

interface VerificationStatusBadgeProps {
  verified: boolean;
  onResend?: () => void;
  loading?: boolean;
}

export function VerificationStatusBadge({
  verified,
  onResend,
  loading = false,
}: VerificationStatusBadgeProps) {
  if (verified) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-primary/10 text-primary text-xs rounded-full font-medium">
        <BadgeCheck className="w-3.5 h-3.5" />
        Terverifikasi
      </span>
    );
  }

  return (
    <div className="inline-flex items-center gap-2">
      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-100 text-amber-700 text-xs rounded-full font-medium">
        <AlertTriangle className="w-3.5 h-3.5" />
        Belum Terverifikasi
      </span>
      {onResend && (
        <button
          type="button"
          onClick={onResend}
          disabled={loading}
          className="inline-flex items-center gap-1 text-xs text-primary font-bold hover:underline disabled:opacity-50"
        >
          <RefreshCw
            className={`w-3 h-3 ${loading ? "animate-spin" : ""}`}
          />
          Kirim Ulang Verifikasi
        </button>
      )}
    </div>
  );
}
