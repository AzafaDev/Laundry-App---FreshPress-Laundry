"use client";

import Link from "next/link";
import { Loader2, MapPin, Pencil, Star, StarOff, Trash2 } from "lucide-react";
import type { CustomerAddress } from "@/services/address.service";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  addr: CustomerAddress;
  isActioning: boolean;
  onSetPrimary: (id: string) => void;
  onDelete: (id: string) => void;
}

export function AddressCard({ addr, isActioning, onSetPrimary, onDelete }: Props) {
  const { t } = useTranslation();
  return (
    <div className={`rounded-2xl border bg-surface-container-lowest shadow-sm overflow-hidden transition-all ${addr.is_primary ? "border-primary/40 ring-1 ring-primary/20" : "border-outline-variant"}`}>
      <div className="p-md flex items-start justify-between gap-md">
        <div className="flex items-start gap-sm flex-1 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${addr.is_primary ? "bg-primary/10" : "bg-surface-container-high"}`}>
            <MapPin className={`w-5 h-5 ${addr.is_primary ? "text-primary" : "text-on-surface-variant"}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-xs flex-wrap">
              <span className="text-label-md font-bold text-on-surface">{addr.label}</span>
              {addr.is_primary && (
                <span className="text-label-sm bg-primary/10 text-primary px-xs py-0.5 rounded-full font-medium">{t("locations.primary")}</span>
              )}
            </div>
            <p className="text-body-sm text-on-surface-variant mt-xs truncate">{addr.address}</p>
            <p className="text-label-sm text-outline">{addr.district}, {addr.city}, {addr.province}{addr.postal_code ? ` ${addr.postal_code}` : ""}</p>
            <p className="text-label-xs text-outline font-mono mt-xs">
              {Number(addr.latitude).toFixed(5)}, {Number(addr.longitude).toFixed(5)}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-xs shrink-0">
          {!addr.is_primary && (
            <button onClick={() => onSetPrimary(addr.id)} disabled={isActioning} title={t("locations.setPrimary")} className="p-xs rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50">
              {isActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <StarOff className="w-4 h-4" />}
            </button>
          )}
          {addr.is_primary && <Star className="w-4 h-4 text-primary fill-primary" />}
          <Link href={`/customer/locations/add-address?edit=${addr.id}`} title={t("locations.editAddress")} className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors">
            <Pencil className="w-4 h-4" />
          </Link>
          <button onClick={() => onDelete(addr.id)} disabled={isActioning} title={t("locations.deleteAddress")} className="p-xs rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50">
            {isActioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
          </button>
        </div>
      </div>
    </div>
  );
}
