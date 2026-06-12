"use client";

import toast from "react-hot-toast";
import { CheckCircle2, AlertTriangle, X } from "lucide-react";

const SOCKET_TOAST_ID = "socket-toast";

function ToastContent({ message, body, type, id }: { message: string; body?: string; type: "success" | "error"; id: string }) {
  const isSuccess = type === "success";
  return (
    <div className={`flex items-start gap-3 px-4 py-3 rounded-2xl shadow-lg border w-full sm:max-w-xs backdrop-blur-sm ${
      isSuccess
        ? "bg-surface border-outline-variant text-on-surface"
        : "bg-surface border-error/20 text-on-surface"
    }`}>
      <div className={`mt-0.5 shrink-0 p-1 rounded-full ${isSuccess ? "bg-emerald-100" : "bg-error/10"}`}>
        {isSuccess
          ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
          : <AlertTriangle className="w-3.5 h-3.5 text-error" />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{message}</p>
        {body && <p className="text-xs text-on-surface-variant mt-0.5 leading-snug">{body}</p>}
      </div>
      <button
        onClick={() => toast.dismiss(id)}
        className="shrink-0 mt-0.5 p-1 rounded-full text-on-surface-variant hover:bg-surface-container transition-colors"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

export function socketToast(message: string, body?: string, type: "success" | "error" = "success") {
  toast.dismiss(SOCKET_TOAST_ID);
  toast.custom(
    (t) => <ToastContent message={message} body={body} type={type} id={t.id} />,
    { id: SOCKET_TOAST_ID, duration: 5000 }
  );
}
