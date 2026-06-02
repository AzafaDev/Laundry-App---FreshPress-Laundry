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
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { addressService } from "@/services/address.service";
import type { CustomerAddress } from "@/services/address.service";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "next/navigation";

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
    } catch {
      setActionError("Gagal menghapus alamat.");
    } finally {
      setActionLoading(null);
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
