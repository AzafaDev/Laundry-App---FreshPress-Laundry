"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  MapPin,
  Plus,
  Trash2,
  Star,
  StarOff,
  Pencil,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Loader2,
  Store,
  Navigation,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { addressService } from "@/services/address.service";
import type { CustomerAddress, DeliveryEstimate } from "@/services/address.service";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

function formatRupiah(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);
}

export default function LocationsPage() {
  const router = useRouter();
  const { user, accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) router.replace("/login");
  }, [_hasHydrated, accessToken, router]);

  const [addresses, setAddresses] = useState<CustomerAddress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Per-address delivery estimate state
  const [estimates, setEstimates] = useState<Record<string, DeliveryEstimate | null>>({});
  const [estimateLoading, setEstimateLoading] = useState<Record<string, boolean>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Action feedback
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await addressService.list();
      setAddresses(data);
    } catch {
      setError("Gagal memuat daftar alamat.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) load();
  }, [user, load]);

  const handleSetPrimary = async (id: string) => {
    setActionLoading(id);
    setActionError(null);
    try {
      await addressService.setPrimary(id);
      await load();
    } catch {
      setActionError("Gagal mengatur alamat utama.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Hapus alamat ini?")) return;
    setActionLoading(id);
    setActionError(null);
    try {
      await addressService.remove(id);
      setAddresses((prev) => prev.filter((a) => a.id !== id));
      if (expandedId === id) setExpandedId(null);
    } catch {
      setActionError("Gagal menghapus alamat.");
    } finally {
      setActionLoading(null);
    }
  };

  const handleToggleEstimate = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(id);
    if (estimates[id] !== undefined) return; // already loaded

    setEstimateLoading((prev) => ({ ...prev, [id]: true }));
    try {
      const estimate = await addressService.estimateDeliveryFee(id);
      setEstimates((prev) => ({ ...prev, [id]: estimate }));
    } catch {
      setEstimates((prev) => ({ ...prev, [id]: null }));
    } finally {
      setEstimateLoading((prev) => ({ ...prev, [id]: false }));
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface">
      {/* Header */}
      <header className="sticky top-0 z-50 flex justify-between items-center w-full px-md md:px-xl h-16 bg-surface border-b border-outline-variant">
        <div className="flex items-center gap-md">
          <Link
            href="/"
            className="p-base hover:bg-surface-container-high rounded-full transition-colors"
          >
            <ArrowLeft className="text-primary w-6 h-6" />
          </Link>
          <h1 className="text-headline-md font-headline-md font-bold text-primary">
            Alamat Saya
          </h1>
        </div>
        <Link
          href="/customer/locations/add-address"
          className="flex items-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg text-label-md hover:bg-primary/90 transition-all"
        >
          <Plus className="w-4 h-4" />
          <span className="hidden sm:inline">Tambah Alamat</span>
        </Link>
      </header>

      <main className="max-w-2xl mx-auto px-md py-lg">

        {/* Error banner */}
        {actionError && (
          <div className="mb-md flex items-center gap-sm bg-red-50 text-red-700 text-sm px-md py-sm rounded-lg border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {actionError}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div className="flex flex-col items-center py-2xl gap-md text-on-surface-variant">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-body-md">Memuat alamat...</p>
          </div>
        )}

        {/* Fetch error */}
        {!loading && error && (
          <div className="flex flex-col items-center py-2xl gap-md text-on-surface-variant">
            <AlertCircle className="w-10 h-10 text-error" />
            <p className="text-body-md">{error}</p>
            <button onClick={load} className="px-md py-sm bg-primary text-on-primary rounded-lg text-label-md">
              Coba Lagi
            </button>
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && addresses.length === 0 && (
          <div className="flex flex-col items-center py-2xl gap-md text-on-surface-variant">
            <MapPin className="w-14 h-14 text-outline" />
            <p className="text-body-lg font-medium">Belum ada alamat tersimpan</p>
            <p className="text-body-sm text-center">Tambahkan alamat pickup agar kami bisa menjemput laundry Anda.</p>
            <Link
              href="/customer/locations/add-address"
              className="flex items-center gap-xs px-lg py-sm bg-primary text-on-primary rounded-xl text-label-md font-bold hover:bg-primary/90 transition-all"
            >
              <Plus className="w-5 h-5" />
              Tambah Alamat Pertama
            </Link>
          </div>
        )}

        {/* Address list */}
        {!loading && !error && addresses.length > 0 && (
          <div className="flex flex-col gap-md">
            {addresses.map((addr) => {
              const isExpanded = expandedId === addr.id;
              const estimate = estimates[addr.id];
              const loadingEstimate = estimateLoading[addr.id];
              const actioning = actionLoading === addr.id;

              return (
                <div
                  key={addr.id}
                  className={`rounded-2xl border bg-surface-container-lowest shadow-sm overflow-hidden transition-all ${
                    addr.is_primary ? "border-primary/40 ring-1 ring-primary/20" : "border-outline-variant"
                  }`}
                >
                  {/* Card header */}
                  <div className="p-md flex items-start justify-between gap-md">
                    <div className="flex items-start gap-sm flex-1 min-w-0">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${addr.is_primary ? "bg-primary/10" : "bg-surface-container-high"}`}>
                        <MapPin className={`w-5 h-5 ${addr.is_primary ? "text-primary" : "text-on-surface-variant"}`} />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-xs flex-wrap">
                          <span className="text-label-md font-bold text-on-surface">{addr.label}</span>
                          {addr.is_primary && (
                            <span className="text-label-sm bg-primary/10 text-primary px-xs py-0.5 rounded-full font-medium">Utama</span>
                          )}
                        </div>
                        <p className="text-body-sm text-on-surface-variant mt-xs truncate">{addr.address}</p>
                        <p className="text-label-sm text-outline">{addr.district}, {addr.city}, {addr.province}{addr.postal_code ? ` ${addr.postal_code}` : ""}</p>
                        <p className="text-label-xs text-outline font-mono mt-xs">
                          {Number(addr.latitude).toFixed(5)}, {Number(addr.longitude).toFixed(5)}
                        </p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-xs shrink-0">
                      {!addr.is_primary && (
                        <button
                          onClick={() => handleSetPrimary(addr.id)}
                          disabled={actioning}
                          title="Jadikan Utama"
                          className="p-xs rounded-lg text-on-surface-variant hover:bg-primary/10 hover:text-primary transition-colors disabled:opacity-50"
                        >
                          {actioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <StarOff className="w-4 h-4" />}
                        </button>
                      )}
                      {addr.is_primary && (
                        <Star className="w-4 h-4 text-primary fill-primary" />
                      )}
                      <Link
                        href={`/customer/locations/add-address?edit=${addr.id}`}
                        title="Edit Alamat"
                        className="p-xs rounded-lg text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                      >
                        <Pencil className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(addr.id)}
                        disabled={actioning}
                        title="Hapus Alamat"
                        className="p-xs rounded-lg text-on-surface-variant hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"
                      >
                        {actioning ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {/* Delivery Estimate Toggle */}
                  <button
                    onClick={() => handleToggleEstimate(addr.id)}
                    className="w-full flex items-center justify-between px-md py-sm bg-surface-container-low border-t border-outline-variant hover:bg-surface-container-high transition-colors text-left"
                  >
                    <span className="text-label-sm font-medium text-primary flex items-center gap-xs">
                      <Navigation className="w-4 h-4" />
                      Estimasi Ongkos Kirim
                    </span>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-on-surface-variant" /> : <ChevronDown className="w-4 h-4 text-on-surface-variant" />}
                  </button>

                  {/* Delivery Estimate Panel */}
                  {isExpanded && (
                    <div className="px-md pb-md pt-sm border-t border-outline-variant bg-surface-container-low">
                      {loadingEstimate && (
                        <div className="flex items-center gap-sm py-sm text-on-surface-variant text-body-sm">
                          <Loader2 className="w-4 h-4 animate-spin text-primary" />
                          Menghitung estimasi...
                        </div>
                      )}

                      {!loadingEstimate && estimate === null && (
                        <div className="flex items-center gap-sm py-sm text-red-600 text-body-sm">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          Gagal memuat estimasi. Pastikan ada outlet aktif.
                        </div>
                      )}

                      {!loadingEstimate && estimate && (
                        <div className="flex flex-col gap-sm">
                          {/* Nearest outlet highlight */}
                          <div className={`rounded-xl p-sm flex items-start gap-sm border ${estimate.nearest_outlet.within_service_area ? "bg-green-50 border-green-200" : "bg-amber-50 border-amber-200"}`}>
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${estimate.nearest_outlet.within_service_area ? "bg-green-100" : "bg-amber-100"}`}>
                              <Store className={`w-4 h-4 ${estimate.nearest_outlet.within_service_area ? "text-green-700" : "text-amber-700"}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between gap-sm">
                                <p className="text-label-md font-bold text-on-surface truncate">{estimate.nearest_outlet.outlet_name}</p>
                                {estimate.nearest_outlet.within_service_area
                                  ? <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                                  : <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                                }
                              </div>
                              <p className="text-label-sm text-on-surface-variant truncate">{estimate.nearest_outlet.outlet_city}</p>
                              <div className="flex items-center justify-between mt-xs">
                                <span className="text-label-sm text-outline">{estimate.nearest_outlet.distance_km} km</span>
                                <span className="text-label-md font-bold text-primary">{formatRupiah(estimate.nearest_outlet.delivery_fee)}</span>
                              </div>
                              {!estimate.nearest_outlet.within_service_area && (
                                <p className="text-label-xs text-amber-700 mt-xs">Di luar area layanan outlet ini.</p>
                              )}
                            </div>
                          </div>

                          {/* Pricing note */}
                          <p className="text-label-xs text-outline">
                            Biaya dasar {formatRupiah(estimate.base_fee)} + {formatRupiah(estimate.rate_per_km)}/km. Harga final dapat berbeda.
                          </p>

                          {/* Other outlets */}
                          {estimate.all_outlets.length > 1 && (
                            <details className="group">
                              <summary className="text-label-sm text-primary cursor-pointer list-none flex items-center gap-xs hover:underline">
                                <ChevronDown className="w-3 h-3 group-open:rotate-180 transition-transform" />
                                Lihat semua outlet ({estimate.all_outlets.length})
                              </summary>
                              <div className="mt-sm flex flex-col gap-xs">
                                {estimate.all_outlets.slice(1).map((o) => (
                                  <div key={o.outlet_id} className="flex items-center justify-between py-xs px-sm bg-surface-container-lowest rounded-lg border border-outline-variant">
                                    <div>
                                      <p className="text-label-sm font-medium text-on-surface">{o.outlet_name}</p>
                                      <p className="text-label-xs text-outline">{o.outlet_city} · {o.distance_km} km</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-label-sm font-bold text-on-surface">{formatRupiah(o.delivery_fee)}</p>
                                      {!o.within_service_area && (
                                        <p className="text-label-xs text-amber-600">Di luar area</p>
                                      )}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </details>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Bottom Add Button */}
            <Link
              href="/customer/locations/add-address"
              className="flex items-center justify-center gap-sm h-14 border-2 border-dashed border-outline-variant rounded-2xl text-on-surface-variant hover:border-primary hover:text-primary transition-colors"
            >
              <Plus className="w-5 h-5" />
              <span className="text-label-md font-medium">Tambah Alamat Baru</span>
            </Link>
          </div>
        )}
      </main>
    </div>
  );
}
