"use client";

import Link from "next/link";
import { AlertCircle, CheckCircle2, Loader2, MapPin } from "lucide-react";
import type { CustomerAddress } from "@/services/address.service";

interface Props {
  addresses: CustomerAddress[];
  selectedAddressId: string | null;
  loadingAddresses: boolean;
  hasAddressError: boolean;
  onSelect: (id: string) => void;
  onRetry: () => void;
}

export function AddressPicker({ addresses, selectedAddressId, loadingAddresses, hasAddressError, onSelect, onRetry }: Props) {
  return (
    <section className="rounded-3xl border border-outline-variant bg-surface-container-lowest p-5 shadow-sm space-y-4">
      <div className="flex items-center gap-3">
        <div className="rounded-2xl bg-primary/10 p-3 text-primary">
          <MapPin className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-base font-bold text-on-surface">Pilih Alamat Pickup</h2>
          <p className="text-sm text-on-surface-variant">Kurir akan menjemput dari alamat ini.</p>
        </div>
      </div>

      {loadingAddresses && (
        <div className="flex items-center gap-3 rounded-2xl border border-outline-variant bg-surface px-4 py-5 text-sm text-on-surface-variant">
          <Loader2 className="w-4 h-4 animate-spin text-primary" />Memuat alamat...
        </div>
      )}

      {!loadingAddresses && hasAddressError && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 w-4 h-4 shrink-0" />
            <div className="space-y-3">
              <p>Gagal memuat alamat pickup.</p>
              <button onClick={onRetry} className="inline-flex items-center rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors">
                Coba lagi
              </button>
            </div>
          </div>
        </div>
      )}

      {!loadingAddresses && !hasAddressError && addresses.length === 0 && (
        <div className="rounded-2xl border border-dashed border-outline-variant bg-surface px-4 py-5 text-sm text-on-surface-variant">
          <p>Anda belum punya alamat pickup. Tambahkan alamat dulu agar order bisa diproses.</p>
          <Link href="/customer/locations/add-address" className="mt-4 inline-flex items-center rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-on-primary hover:bg-primary/90 transition-colors">
            Tambah alamat pickup
          </Link>
        </div>
      )}

      {!loadingAddresses && !hasAddressError && addresses.length > 0 && (
        <div className="space-y-3">
          {addresses.map((address) => {
            const isSelected = address.id === selectedAddressId;
            return (
              <button
                key={address.id}
                type="button"
                onClick={() => onSelect(address.id)}
                className={`w-full text-left rounded-2xl border px-4 py-4 transition-all ${isSelected ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-outline-variant bg-surface hover:border-primary/40"}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-on-surface">{address.label}</span>
                      {address.is_primary && (
                        <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-semibold text-primary">Utama</span>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-on-surface-variant truncate">{address.address}</p>
                    <p className="text-xs text-on-surface-variant">{address.district}, {address.city}, {address.province}</p>
                  </div>
                  {isSelected && <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />}
                </div>
              </button>
            );
          })}
          <Link href="/customer/locations" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
            <MapPin className="w-4 h-4" />Kelola alamat
          </Link>
        </div>
      )}
    </section>
  );
}
