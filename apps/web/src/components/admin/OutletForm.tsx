"use client";

// Outlet create/edit form. Address is the source of truth — when the admin
// finishes typing, we offer to geocode it (server-side via OpenCage) and drop
// a pin. The admin can also click the map directly to override coordinates.
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { X, Store, MapPin } from "lucide-react";
import { useCreateOutlet, useUpdateOutlet } from "@/hooks/useOutlets";
import type {
  CreateOutletPayload,
  Outlet,
  UpdateOutletPayload,
} from "@/types/outlet.types";

// react-leaflet touches `window` on import — load it client-only.
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
    latitude: outlet?.latitude ?? null,
    longitude: outlet?.longitude ?? null,
    max_service_km: outlet?.max_service_km ?? 5,
    is_active: outlet?.is_active ?? true,
  });
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (outlet) {
      setForm({
        name: outlet.name,
        address: outlet.address,
        latitude: outlet.latitude,
        longitude: outlet.longitude,
        max_service_km: outlet.max_service_km ?? 5,
        is_active: outlet.is_active,
      });
    }
  }, [outlet]);

  const pending = create.isPending || update.isPending;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      if (isEdit && outlet) {
        const payload: UpdateOutletPayload = {
          name: form.name,
          address: form.address,
          latitude: form.latitude ?? undefined,
          longitude: form.longitude ?? undefined,
          max_service_km: form.max_service_km,
          is_active: form.is_active,
          re_geocode: form.latitude == null || form.longitude == null,
        };
        await update.mutateAsync({ id: outlet.id, payload });
      } else {
        const payload: CreateOutletPayload = {
          name: form.name,
          address: form.address,
          latitude: form.latitude ?? undefined,
          longitude: form.longitude ?? undefined,
          max_service_km: form.max_service_km,
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

        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto"
        >
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

          <Field label="Alamat">
            <div className="relative">
              <MapPin className="absolute left-4 top-3 w-5 h-5 text-outline" />
              <textarea
                rows={2}
                required
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Jl. Bersih No. 124, Metro City"
                className={`${inputClass} pl-12 resize-none`}
              />
            </div>
            <p className="text-xs text-on-surface-variant mt-1 ml-1">
              Server akan mengubah alamat ini menjadi koordinat saat disimpan,
              atau Anda dapat memilih titik di peta di bawah.
            </p>
          </Field>

          <Field label="Lokasi di Peta">
            <OutletMapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              radiusKm={form.max_service_km}
              onChange={(lat, lng) =>
                setForm({ ...form, latitude: lat, longitude: lng })
              }
            />
            <p className="text-xs text-on-surface-variant mt-1 ml-1">
              {form.latitude != null && form.longitude != null
                ? `Pin: ${form.latitude.toFixed(5)}, ${form.longitude.toFixed(5)}`
                : "Klik peta untuk menentukan titik outlet."}
            </p>
          </Field>

          <Field label="Radius Layanan (km)">
            <input
              type="number"
              step="0.1"
              min="0.1"
              max="100"
              required
              value={form.max_service_km}
              onChange={(e) =>
                setForm({
                  ...form,
                  max_service_km: parseFloat(e.target.value),
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
