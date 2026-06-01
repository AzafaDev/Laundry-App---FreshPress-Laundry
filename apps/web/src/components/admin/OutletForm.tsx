"use client";

import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { X, Store, MapPin, Search, Loader2 } from "lucide-react";
import { useCreateOutlet, useUpdateOutlet } from "@/hooks/useOutlets";
import { outletService, type GeocodeMatch } from "@/services/outlet.service";
import type {
  CreateOutletPayload,
  Outlet,
  UpdateOutletPayload,
} from "@/types/outlet.types";

const OutletMapPicker = dynamic(
  () => import("./OutletMapPicker").then((m) => m.OutletMapPicker),
  { ssr: false, loading: () => <MapSkeleton /> },
);

interface Props {
  outlet?: Outlet | null;
  onClose: () => void;
}

export function OutletForm({ outlet, onClose }: Props) {
  const isEdit = !!outlet;
  const create = useCreateOutlet();
  const update = useUpdateOutlet();

  const [form, setForm] = useState({
    name: outlet?.name ?? "",
    address: outlet?.address ?? "",
    province: outlet?.province ?? "",
    city: outlet?.city ?? "",
    district: outlet?.district ?? "",
    postal_code: outlet?.postal_code ?? "",
    phone: outlet?.phone ?? "",
    latitude: outlet?.latitude != null ? Number(outlet.latitude) : null,
    longitude: outlet?.longitude != null ? Number(outlet.longitude) : null,
    service_radius_km: outlet?.service_radius_km != null ? Number(outlet.service_radius_km) : 5,
    is_active: outlet?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);

  const [matches, setMatches] = useState<GeocodeMatch[]>([]);
  const [searching, setSearching] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const skipNextSearchRef = useRef(false);

  useEffect(() => {
    if (outlet) {
      setForm({
        name: outlet.name,
        address: outlet.address,
        province: outlet.province,
        city: outlet.city,
        district: outlet.district,
        postal_code: outlet.postal_code ?? "",
        phone: outlet.phone ?? "",
        latitude: outlet.latitude != null ? Number(outlet.latitude) : null,
        longitude: outlet.longitude != null ? Number(outlet.longitude) : null,
        service_radius_km: outlet.service_radius_km != null ? Number(outlet.service_radius_km) : 5,
        is_active: outlet.is_active,
      });
    }
  }, [outlet]);

  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    const q = form.address.trim();
    if (q.length < 3) {
      setMatches([]);
      setSearching(false);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const items = await outletService.geocodeSearch(q, 5);
        setMatches(items);
        setShowMatches(true);
      } catch {
        setMatches([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [form.address]);

  const pickMatch = (m: GeocodeMatch) => {
    skipNextSearchRef.current = true;
    // Try to extract city/province from formatted address
    const parts = m.formatted.split(",").map((s) => s.trim());
    setForm((prev) => ({
      ...prev,
      address: m.formatted,
      latitude: m.latitude,
      longitude: m.longitude,
      // Auto-fill city & province from last parts of formatted address if empty
      city: prev.city || (parts[parts.length - 2] ?? ""),
      province: prev.province || (parts[parts.length - 1] ?? ""),
    }));
    setShowMatches(false);
    setMatches([]);
  };

  const pending = create.isPending || update.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && outlet) {
        const payload: UpdateOutletPayload = {
          name: form.name,
          address: form.address,
          province: form.province,
          city: form.city,
          district: form.district,
          postal_code: form.postal_code || undefined,
          phone: form.phone || undefined,
          latitude: form.latitude ?? undefined,
          longitude: form.longitude ?? undefined,
          service_radius_km: form.service_radius_km,
          is_active: form.is_active,
          re_geocode: form.latitude == null || form.longitude == null,
        };
        await update.mutateAsync({ id: outlet.id, payload });
      } else {
        const payload: CreateOutletPayload = {
          name: form.name,
          address: form.address,
          province: form.province,
          city: form.city,
          district: form.district,
          postal_code: form.postal_code || undefined,
          phone: form.phone || undefined,
          latitude: form.latitude ?? undefined,
          longitude: form.longitude ?? undefined,
          service_radius_km: form.service_radius_km,
          is_active: form.is_active,
        };
        await create.mutateAsync(payload);
      }
      onClose();
    } catch (err) {
      const msg =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message ?? "Gagal menyimpan outlet.";
      setError(msg);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-outline-variant max-h-[92vh] flex flex-col">
        <div className="p-6 bg-surface-container-low border-b border-outline-variant flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Store className="w-5 h-5 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-on-surface">
              {isEdit ? "Edit Outlet" : "Tambah Outlet"}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-on-surface-variant hover:bg-surface-container-high p-2 rounded-full transition-all"
            aria-label="Tutup"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <Field label="Nama Outlet">
            <input
              type="text"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="FreshPress Sudirman"
              className={inputClass}
            />
          </Field>

          <Field label="Alamat Lengkap">
            <div className="relative">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-outline pointer-events-none" />
              <input
                type="text"
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                onFocus={() => setShowMatches(matches.length > 0)}
                onBlur={() => setTimeout(() => setShowMatches(false), 150)}
                placeholder="Mulai ketik alamat..."
                className={`${inputClass} pl-12 pr-10`}
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                {searching ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-outline" />
                )}
              </div>

              {showMatches && matches.length > 0 && (
                <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-outline-variant rounded-xl shadow-lg overflow-hidden max-h-72 overflow-y-auto">
                  {matches.map((m, i) => (
                    <li key={`${m.latitude},${m.longitude},${i}`}>
                      <button
                        type="button"
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => pickMatch(m)}
                        className="w-full text-left px-4 py-2.5 hover:bg-surface-container-low border-b border-outline-variant last:border-b-0 transition-colors"
                      >
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                          <div className="min-w-0">
                            <p className="text-sm text-on-surface truncate">
                              {m.formatted}
                            </p>
                            <p className="text-xs text-on-surface-variant">
                              {m.latitude.toFixed(5)}, {m.longitude.toFixed(5)}
                              {m.confidence ? ` · score ${m.confidence}` : ""}
                            </p>
                          </div>
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="text-xs text-on-surface-variant mt-1 ml-1">
              Pilih hasil pencarian untuk pindahkan pin di peta, atau klik manual di peta.
            </p>
          </Field>

          {/* Province / City / District */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Field label="Provinsi">
              <input
                type="text"
                required
                value={form.province}
                onChange={(e) => setForm({ ...form, province: e.target.value })}
                placeholder="Jawa Barat"
                className={inputClass}
              />
            </Field>
            <Field label="Kota / Kabupaten">
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Bandung"
                className={inputClass}
              />
            </Field>
            <Field label="Kecamatan">
              <input
                type="text"
                required
                value={form.district}
                onChange={(e) =>
                  setForm({ ...form, district: e.target.value })
                }
                placeholder="Coblong"
                className={inputClass}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Kode Pos (opsional)">
              <input
                type="text"
                value={form.postal_code}
                onChange={(e) =>
                  setForm({ ...form, postal_code: e.target.value })
                }
                placeholder="40134"
                className={inputClass}
              />
            </Field>
            <Field label="No. Telepon Outlet (opsional)">
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="022xxxxxxx"
                className={inputClass}
              />
            </Field>
          </div>

          <Field label="Lokasi di Peta">
            <OutletMapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              radiusKm={form.service_radius_km}
              onChange={(lat, lng) =>
                setForm({ ...form, latitude: lat, longitude: lng })
              }
            />
            <p className="text-xs text-on-surface-variant mt-1 ml-1">
              {form.latitude != null && form.longitude != null
                ? `Pin: ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
                : "Belum ada pin — pilih dari hasil pencarian atau klik di peta."}
            </p>
          </Field>

          <Field label="Radius Layanan (km)">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              required
              value={form.service_radius_km}
              onChange={(e) =>
                setForm({
                  ...form,
                  service_radius_km: parseFloat(e.target.value),
                })
              }
              className={inputClass}
            />
          </Field>

          <label className="flex items-center gap-2 text-sm text-on-surface-variant">
            <input
              type="checkbox"
              checked={form.is_active}
              onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            />
            Outlet aktif
          </label>

          {error && (
            <p className="text-sm text-error bg-error-container/30 px-3 py-2 rounded-md">
              {error}
            </p>
          )}

          <div className="grid grid-cols-2 gap-3 pt-2 sticky bottom-0 bg-surface-container-lowest pb-1">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-xl border-2 border-outline-variant text-on-surface-variant font-bold hover:bg-surface-container-low transition-all"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={pending}
              className="py-3 px-6 rounded-xl bg-primary text-on-primary font-bold hover:opacity-90 disabled:opacity-60 transition-all shadow-lg shadow-primary/20"
            >
              {pending ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-3 rounded-2xl border-2 border-outline-variant bg-white focus:outline-none focus:border-primary transition-all text-base";

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1">
      <label className="text-sm font-bold text-on-surface/80 block ml-1 mb-1.5">
        {label}
      </label>
      {children}
    </div>
  );
}

function MapSkeleton() {
  return (
    <div className="h-[320px] w-full rounded-2xl bg-surface-container-low border-2 border-outline-variant animate-pulse flex items-center justify-center text-on-surface-variant text-sm">
      Memuat peta…
    </div>
  );
}
