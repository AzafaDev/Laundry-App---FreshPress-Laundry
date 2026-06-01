"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Plus,
  MapPin,
  ChevronDown,
  ChevronUp,
  Save,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { addressService } from "@/services/address.service";
import { useAuthStore } from "@/stores/authStore";
import type { MapPickerProps } from "@/components/address/MapPicker";

// Lazy-load Leaflet map (no SSR)
const MapPicker = dynamic<MapPickerProps>(
  () => import("@/components/address/MapPicker"),
  {
    ssr: false,
    loading: () => (
      <div className="h-60 w-full flex items-center justify-center bg-gray-100 rounded-xl">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    ),
  }
);

const DEFAULT_LAT = -7.250445;
const DEFAULT_LNG = 112.768845;
const ADDRESS_LABELS = ["Rumah", "Kantor", "Apartemen"] as const;

export default function AddAddressPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);

  const { accessToken, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!accessToken) router.replace("/login");
  }, [_hasHydrated, accessToken, router]);

  const [province, setProvince] = useState("");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [postalCode, setPostalCode] = useState("");
  const [street, setStreet] = useState("");
  const [detail, setDetail] = useState("");
  const [regionOpen, setRegionOpen] = useState(false);

  const [label, setLabel] = useState<string>("Rumah");
  const [customLabel, setCustomLabel] = useState("");
  const [showCustomInput, setShowCustomInput] = useState(false);
  const [isPrimary, setIsPrimary] = useState(false);

  const [lat, setLat] = useState(DEFAULT_LAT);
  const [lng, setLng] = useState(DEFAULT_LNG);
  const [flyToTrigger, setFlyToTrigger] = useState(0);
  const [pinSet, setPinSet] = useState(false);

  // ── Load existing address when editing ──────────────────────────────────
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);

  useEffect(() => {
    if (!editId || !accessToken) return;
    (async () => {
      try {
        const addresses = await addressService.list();
        const addr = addresses.find((a) => a.id === editId);
        if (!addr) return;
        setStreet(addr.address);
        setProvince(addr.province);
        setCity(addr.city);
        setDistrict(addr.district);
        setPostalCode(addr.postal_code ?? "");
        setIsPrimary(addr.is_primary);
        const knownLabels: string[] = ["Rumah", "Kantor", "Apartemen"];
        if (knownLabels.includes(addr.label)) {
          setLabel(addr.label);
        } else {
          setLabel("custom");
          setCustomLabel(addr.label);
          setShowCustomInput(true);
        }
        const newLat = Number(addr.latitude);
        const newLng = Number(addr.longitude);
        setLat(newLat);
        setLng(newLng);
        setPinSet(true);
        setFlyToTrigger(1);
        setRegionOpen(true);
      } finally {
        setLoadingEdit(false);
      }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, accessToken]);

  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const regionDisplay = [province, city, district, postalCode]
    .filter(Boolean)
    .join(", ")
    .toUpperCase();

  const reverseGeocode = useCallback(async (newLat: number, newLng: number) => {
    setGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await addressService.geocode(`${newLat},${newLng}`);
      if (result) {
        setStreet(result.formatted);
        const parts = result.formatted.split(",").map((s: string) => s.trim()).filter(Boolean);
        const len = parts.length;
        if (len >= 2) setProvince(parts[len - 2] ?? "");
        if (len >= 3) setCity(parts[len - 3] ?? "");
        if (len >= 4) setDistrict(parts[len - 4] ?? "");
      }
    } catch {
      setGeocodeError("Tidak dapat membaca lokasi ini. Isi alamat secara manual.");
    } finally {
      setGeocoding(false);
    }
  }, []);

  const handlePin = useCallback((newLat: number, newLng: number) => {
    setLat(newLat);
    setLng(newLng);
    setPinSet(true);
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(() => reverseGeocode(newLat, newLng), 600);
  }, [reverseGeocode]);

  const handleSearchAddress = useCallback(async () => {
    const query = [street, district, city, province].filter(Boolean).join(", ");
    if (!query.trim()) {
      setGeocodeError("Isi minimal nama jalan atau kota untuk mencari koordinat.");
      return;
    }
    setGeocoding(true);
    setGeocodeError(null);
    try {
      const result = await addressService.geocode(query);
      if (!result) { setGeocodeError("Alamat tidak ditemukan."); return; }
      setLat(result.latitude);
      setLng(result.longitude);
      setPinSet(true);
      setFlyToTrigger((n) => n + 1);
    } catch {
      setGeocodeError("Gagal mencari koordinat. Coba lagi.");
    } finally {
      setGeocoding(false);
    }
  }, [street, district, city, province]);

  const handleSave = async () => {
    setSaveError(null);
    const finalLabel = label === "custom" ? customLabel.trim() : label;
    if (!finalLabel) { setSaveError("Label alamat wajib diisi."); return; }
    if (!street.trim()) { setSaveError("Nama jalan wajib diisi."); return; }
    if (!province.trim() || !city.trim() || !district.trim()) {
      setSaveError("Provinsi, kota, dan kecamatan wajib diisi."); return;
    }
    if (!pinSet) { setSaveError("Tandai lokasi di peta atau klik 'Cari di Peta' terlebih dahulu."); return; }
    setSaving(true);
    const payload = {
      label: finalLabel,
      address: street.trim(),
      province: province.trim(),
      city: city.trim(),
      district: district.trim(),
      postal_code: postalCode.trim() || undefined,
      latitude: lat,
      longitude: lng,
      is_primary: isPrimary,
    };
    try {
      if (isEditMode && editId) {
        await addressService.update(editId, payload);
      } else {
        await addressService.create(payload);
      }
      router.push("/customer/locations");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        "Gagal menyimpan alamat. Coba lagi.";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-on-surface">
      <header className="sticky top-0 z-50 flex items-center gap-3 w-full px-4 h-14 bg-white border-b border-gray-200">
        <Link href="/customer/locations" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-base font-bold text-gray-800">
          {isEditMode ? "Edit Alamat" : "Tambah Alamat"}
        </h1>
      </header>

      {loadingEdit ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">Memuat data alamat...</p>
        </div>
      ) : (
      <main className="max-w-lg mx-auto px-4 pt-5 pb-32 flex flex-col gap-3">

        {/* Region selector */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <button
            type="button"
            onClick={() => setRegionOpen((o) => !o)}
            className="w-full flex items-center justify-between px-4 pt-5 pb-3 text-left"
          >
            <span className="absolute mt-[-24px] text-[11px] text-gray-400">
              Provinsi, Kota, Kecamatan, Kode Pos
            </span>
            <span className={`text-sm font-medium ${regionDisplay ? "text-gray-800" : "text-gray-400"}`}>
              {regionDisplay || "Pilih wilayah..."}
            </span>
            {regionOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
          </button>
          {regionOpen && (
            <div className="grid grid-cols-2 gap-2 px-4 pb-4">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Provinsi *</label>
                <input type="text" value={province} onChange={(e) => setProvince(e.target.value)} placeholder="cth. Jawa Timur" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Kota / Kabupaten *</label>
                <input type="text" value={city} onChange={(e) => setCity(e.target.value)} placeholder="cth. Kab. Jombang" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Kecamatan *</label>
                <input type="text" value={district} onChange={(e) => setDistrict(e.target.value)} placeholder="cth. Diwek" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[11px] text-gray-400">Kode Pos</label>
                <input type="text" inputMode="numeric" maxLength={5} value={postalCode} onChange={(e) => setPostalCode(e.target.value)} placeholder="cth. 61471" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
              </div>
            </div>
          )}
        </div>

        {/* Street address */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 pt-5 pb-3 relative">
          <span className="absolute top-2 left-4 text-[11px] text-gray-400 leading-none pointer-events-none">
            Nama Jalan, Gedung, No. Rumah *
          </span>
          <textarea
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            placeholder="cth. Dsn. Gedangan Rt.01 Rw.07 Ds. Ngudirejo"
            rows={2}
            className="w-full text-sm text-gray-800 placeholder:text-gray-300 bg-transparent resize-none focus:outline-none"
          />
        </div>

        {/* Detail */}
        <div className="bg-white rounded-xl border border-gray-200">
          <input
            type="text"
            value={detail}
            onChange={(e) => setDetail(e.target.value)}
            placeholder="Detail Lainnya (Cth: Blok / Unit No., Patokan)"
            className="w-full px-4 py-4 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none"
          />
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-100">
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <MapPin className="w-3.5 h-3.5 text-primary" />
              {pinSet ? (
                <span className="text-gray-700 font-medium tabular-nums">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
              ) : (
                <span>Klik peta atau seret pin untuk menandai lokasi</span>
              )}
            </div>
            <button
              type="button"
              onClick={handleSearchAddress}
              disabled={geocoding}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 disabled:opacity-50 transition-colors"
            >
              {geocoding ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <MapPin className="w-3.5 h-3.5" />}
              Cari di Peta
            </button>
          </div>

          <div className="h-60 w-full">
            <MapPicker lat={lat} lng={lng} flyToTrigger={flyToTrigger} onPin={handlePin} height="240px" />
          </div>

          {geocodeError && (
            <div className="px-4 py-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border-t border-red-100">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              {geocodeError}
            </div>
          )}
          {geocoding && (
            <div className="px-4 py-2 flex items-center gap-1.5 text-xs text-primary bg-blue-50 border-t border-blue-100">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              Membaca informasi lokasi...
            </div>
          )}
        </div>

        {/* Tandai Sebagai */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-4">
          <p className="text-sm font-semibold text-gray-700 mb-3">Tandai Sebagai:</p>
          <div className="flex flex-wrap gap-2">
            {ADDRESS_LABELS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => { setLabel(l); setShowCustomInput(false); }}
                className={`px-4 py-1.5 rounded-lg border text-sm font-medium transition-all ${
                  label === l ? "border-primary text-primary bg-primary/5" : "border-gray-300 text-gray-600 hover:border-gray-400"
                }`}
              >
                {l}
              </button>
            ))}
            <button
              type="button"
              onClick={() => { setLabel("custom"); setShowCustomInput(true); }}
              className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-all flex items-center gap-1 ${
                label === "custom" ? "border-primary text-primary bg-primary/5" : "border-gray-300 text-gray-600 hover:border-gray-400"
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Lainnya
            </button>
          </div>
          {showCustomInput && (
            <input
              type="text"
              value={customLabel}
              onChange={(e) => setCustomLabel(e.target.value)}
              placeholder="Nama label kustom..."
              className="mt-3 w-full h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300"
            />
          )}
        </div>

        {/* Primary toggle */}
        <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-gray-800">Jadikan Alamat Utama</p>
            <p className="text-xs text-gray-500 mt-0.5">Digunakan sebagai lokasi pickup default.</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer shrink-0">
            <input type="checkbox" checked={isPrimary} onChange={() => setIsPrimary((v) => !v)} className="sr-only peer" />
            <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
          </label>
        </div>

        {saveError && (
          <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
            <AlertCircle className="w-4 h-4 shrink-0" />
            {saveError}
          </div>
        )}
      </main>
      )}

      {/* Sticky Save */}
      <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 z-50">
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="w-full h-12 bg-primary text-on-primary rounded-xl text-sm font-bold shadow flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-primary/90 transition-all active:scale-[0.98]"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Menyimpan..." : isEditMode ? "Simpan Perubahan" : "Simpan Alamat"}
        </button>
      </div>
    </div>
  );
}
