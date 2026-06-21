"use client";

import { Phone } from "lucide-react";
import { COMPLAINT_STATUS_COLOR, COMPLAINT_STATUS_LABEL, formatWhatsApp } from "./orderConstants";

interface Props {
  complaint: { status: string; resolution_notes: string | null };
  outletPhone?: string | null;
}

export function ComplaintReplySection({ complaint, outletPhone }: Props) {
  if (complaint.status === "open") return null;
  const waNumber = outletPhone ? formatWhatsApp(outletPhone) : null;

  return (
    <div className="rounded-xl border border-outline-variant bg-surface-container-low p-4 space-y-3">
      <p className="text-xs font-medium text-on-surface-variant uppercase tracking-wide">
        Balasan Komplain
      </p>
      <span
        className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${COMPLAINT_STATUS_COLOR[complaint.status] ?? "bg-surface-container text-on-surface-variant"}`}
      >
        {COMPLAINT_STATUS_LABEL[complaint.status] ?? complaint.status}
      </span>
      {complaint.resolution_notes && (
        <p className="text-sm text-on-surface leading-relaxed">{complaint.resolution_notes}</p>
      )}
      {waNumber && (
        <a
          href={`https://wa.me/${waNumber}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-green-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-green-600 transition-colors"
        >
          <Phone className="w-4 h-4" />
          Hubungi Admin via WhatsApp
        </a>
      )}
    </div>
  );
}
