"use client";

import { useState, useCallback, useEffect, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Loader2, AlertCircle, MapPin, Search, Eraser } from "lucide-react";
import { z } from "zod";
import { addressService, type GeocodeResult } from "@/services/address.service";
import { useAuthStore } from "@/stores/authStore";
import { RegionSelector } from "@/components/address/RegionSelector";
import { MapPickerSection } from "@/components/address/MapPickerSection";
import { AddressLabelSelector } from "@/components/address/AddressLabelSelector";
import { useTranslation } from "@/i18n/useTranslation";

const buildAddressSchema = (t: (key: string) => string) =>
  z.object({
    label: z.string().min(1, t("locations.form.labelRequired")),
    address: z.string().min(5, t("locations.form.streetMin")),
    province: z.string().min(2, t("locations.form.provinceRequired")),
    city: z.string().min(2, t("locations.form.cityRequired")),
    district: z.string().min(2, t("locations.form.districtRequired")),
    postal_code: z.string().regex(/^\d{5}$/, t("locations.form.postalCodeFormat")).optional().or(z.literal("")),
  });

const DEFAULT_LAT = -7.250445;
const DEFAULT_LNG = 112.768845;

function AddAddressPageInner() {
  const { t } = useTranslation();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const isEditMode = Boolean(editId);
  const { user, _hasHydrated } = useAuthStore();

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) router.replace("/login");
  }, [_hasHydrated, user, router]);

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
  const [loadingEdit, setLoadingEdit] = useState(isEditMode);
  const [geocoding, setGeocoding] = useState(false);
  const [geocodeError, setGeocodeError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [matches, setMatches] = useState<GeocodeResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [showMatches, setShowMatches] = useState(false);
  const [regionSearching, setRegionSearching] = useState(false);
  const skipNextSearchRef = useRef(false);
  const reverseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!editId || !user) return;
    (async () => {
      try {
        const addresses = await addressService.list();
        const addr = addresses.find((a) => a.id === editId);
        if (!addr) return;
        setStreet(addr.address); setProvince(addr.province); setCity(addr.city);
        setDistrict(addr.district); setPostalCode(addr.postal_code ?? ""); setIsPrimary(addr.is_primary);
        const knownLabels = ["Rumah", "Kantor", "Apartemen"];
        if (knownLabels.includes(addr.label)) { setLabel(addr.label); }
        else { setLabel("custom"); setCustomLabel(addr.label); setShowCustomInput(true); }
        setLat(Number(addr.latitude)); setLng(Number(addr.longitude));
        setPinSet(true); setFlyToTrigger(1); setRegionOpen(true);
      } finally { setLoadingEdit(false); }
    })();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editId, user]);

  // Live search as user types street field
  useEffect(() => {
    if (skipNextSearchRef.current) {
      skipNextSearchRef.current = false;
      return;
    }
    const q = street.trim();
    if (q.length < 3) {
      setMatches([]);
      setSearching(false);
      return;
    }
    const handle = setTimeout(async () => {
      setSearching(true);
      try {
        const items = await addressService.geocodeSearch(q, 5);
        setMatches(items);
        setShowMatches(true);
      } catch {
        setMatches([]);
      } finally {
        setSearching(false);
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [street]);

  const reverseGeocode = useCallback(async (newLat: number, newLng: number) => {
    setGeocoding(true); setGeocodeError(null);
    try {
      const result = await addressService.geocode(`${newLat},${newLng}`);
      if (result) {
        skipNextSearchRef.current = true;
        setStreet(result.street?.trim() || result.formatted);
        if (result.province?.trim()) setProvince(result.province.trim());
        if (result.city?.trim()) setCity(result.city.trim());
        if (result.district?.trim()) setDistrict(result.district.trim());
        if (result.postal_code?.trim()) setPostalCode(result.postal_code.trim());
      }
    } catch { setGeocodeError(t("locations.form.reverseGeocodeError")); }
    finally { setGeocoding(false); }
  }, [t]);

  const handleSearchByRegion = useCallback(async () => {
    const query = [street, district, city, province].filter(Boolean).join(", ");
    if (!query.trim()) { setGeocodeError(t("locations.form.regionSearchEmpty")); return; }
    setRegionSearching(true); setGeocodeError(null);
    try {
      const result = await addressService.geocode(query);
      if (!result) { setGeocodeError(t("locations.form.geocodeNotFound")); return; }
      skipNextSearchRef.current = true;
      setLat(result.latitude); setLng(result.longitude); setPinSet(true); setFlyToTrigger((n) => n + 1);
    } catch { setGeocodeError(t("locations.form.geocodeSearchError")); }
    finally { setRegionSearching(false); }
  }, [street, district, city, province, t]);

  const handlePin = useCallback((newLat: number, newLng: number) => {
    setLat(newLat); setLng(newLng); setPinSet(true);
    if (reverseTimer.current) clearTimeout(reverseTimer.current);
    reverseTimer.current = setTimeout(() => reverseGeocode(newLat, newLng), 600);
  }, [reverseGeocode]);

  const pickMatch = (m: GeocodeResult) => {
    skipNextSearchRef.current = true;
    setStreet(m.street || m.formatted);
    setLat(m.latitude); setLng(m.longitude); setPinSet(true); setFlyToTrigger((n) => n + 1);
    if (m.province) setProvince(m.province);
    if (m.city) setCity(m.city);
    if (m.district) setDistrict(m.district);
    if (m.postal_code) setPostalCode(m.postal_code);
    setShowMatches(false);
    setMatches([]);
  };

  const handleClear = () => {
    setStreet(""); setDetail(""); setProvince(""); setCity(""); setDistrict(""); setPostalCode("");
    setLabel("Rumah"); setCustomLabel(""); setShowCustomInput(false); setIsPrimary(false);
    setLat(DEFAULT_LAT); setLng(DEFAULT_LNG); setPinSet(false); setFlyToTrigger((n) => n + 1);
    setMatches([]); setShowMatches(false); setGeocodeError(null); setSaveError(null);
    setRegionOpen(false);
  };

  const handleSave = async () => {
    setSaveError(null);
    const finalLabel = label === "custom" ? customLabel.trim() : label;
    const validationResult = buildAddressSchema(t).safeParse({ label: finalLabel, address: street.trim(), province: province.trim(), city: city.trim(), district: district.trim(), postal_code: postalCode.trim() || undefined });
    if (!validationResult.success) { setSaveError(validationResult.error.issues[0].message); return; }
    if (!pinSet) { setSaveError(t("locations.form.pinRequired")); return; }
    setSaving(true);
    const payload = { label: finalLabel, address: street.trim(), province: province.trim(), city: city.trim(), district: district.trim(), postal_code: postalCode.trim() || undefined, latitude: lat, longitude: lng, is_primary: isPrimary };
    try {
      if (isEditMode && editId) { await addressService.update(editId, payload); }
      else { await addressService.create(payload); }
      router.push("/customer/locations");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? t("locations.form.saveError");
      setSaveError(msg);
    } finally { setSaving(false); }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-on-surface">
      <header className="sticky top-0 z-50 flex items-center gap-3 w-full px-4 h-14 bg-white border-b border-gray-200">
        <Link href="/customer/locations" className="p-1.5 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft className="w-5 h-5 text-gray-600" />
        </Link>
        <h1 className="text-base font-bold text-gray-800">{isEditMode ? t("locations.form.editTitle") : t("locations.form.addTitle")}</h1>
      </header>

      {loadingEdit ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm text-gray-500">{t("locations.form.loadingEdit")}</p>
        </div>
      ) : (
        <main className="max-w-lg mx-auto px-4 pt-5 pb-32 flex flex-col gap-3">
          <div className="bg-white rounded-xl border border-gray-200 px-4 pt-3 pb-3 relative">
            <span className="block text-xs text-gray-400 mb-2">{t("locations.form.streetLabel")}</span>
            <div className="relative flex items-center gap-2">
              <MapPin className="w-4 h-4 text-primary flex-shrink-0" />
              <input
                type="text"
                value={street}
                onChange={(e) => setStreet(e.target.value)}
                onFocus={() => setShowMatches(matches.length > 0)}
                onBlur={() => setTimeout(() => setShowMatches(false), 150)}
                placeholder={t("locations.form.streetPlaceholder")}
                className="flex-1 text-sm text-gray-800 placeholder:text-gray-300 bg-transparent focus:outline-none"
              />
              <div className="flex-shrink-0">
                {searching ? (
                  <Loader2 className="w-4 h-4 text-primary animate-spin" />
                ) : (
                  <Search className="w-4 h-4 text-gray-400" />
                )}
              </div>
            </div>
            {showMatches && matches.length > 0 && (
              <ul className="absolute z-10 left-0 right-0 mt-2 bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden max-h-64 overflow-y-auto">
                {matches.map((m, i) => (
                  <li key={`${m.latitude},${m.longitude},${i}`}>
                    <button
                      type="button"
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => pickMatch(m)}
                      className="w-full text-left px-4 py-2.5 hover:bg-gray-50 border-b border-gray-100 last:border-b-0 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                        <div className="min-w-0">
                          <p className="text-sm text-gray-800 truncate">{m.formatted}</p>
                          <p className="text-xs text-gray-400">
                            {m.latitude.toFixed(5)}, {m.longitude.toFixed(5)}
                          </p>
                        </div>
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <RegionSelector province={province} city={city} district={district} postalCode={postalCode} isOpen={regionOpen} onToggle={() => setRegionOpen((o) => !o)} onProvinceChange={setProvince} onCityChange={setCity} onDistrictChange={setDistrict} onPostalCodeChange={setPostalCode} onSearch={handleSearchByRegion} searching={regionSearching} />

          <div className="bg-white rounded-xl border border-gray-200">
            <input type="text" value={detail} onChange={(e) => setDetail(e.target.value)} placeholder={t("locations.form.detailPlaceholder")} className="w-full px-4 py-4 text-sm text-gray-800 placeholder:text-gray-400 bg-transparent focus:outline-none" />
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              onClick={handleClear}
              className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-red-500 transition-colors"
            >
              <Eraser className="w-3 h-3" />
              Kosongkan pencarian
            </button>
          </div>

          <MapPickerSection lat={lat} lng={lng} flyToTrigger={flyToTrigger} pinSet={pinSet} geocoding={geocoding} geocodeError={geocodeError} onPin={handlePin} />

          <AddressLabelSelector label={label} customLabel={customLabel} showCustomInput={showCustomInput} onSelectLabel={(l) => { setLabel(l); setShowCustomInput(false); }} onCustomLabelChange={setCustomLabel} onSelectCustom={() => { setLabel("custom"); setShowCustomInput(true); }} />

          <div className="bg-white rounded-xl border border-gray-200 px-4 py-4 flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-800">{t("locations.form.setPrimaryTitle")}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t("locations.form.setPrimaryDesc")}</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input type="checkbox" checked={isPrimary} onChange={() => setIsPrimary((v) => !v)} className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-primary after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
            </label>
          </div>

          {saveError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 px-4 py-3 rounded-xl border border-red-200">
              <AlertCircle className="w-4 h-4 shrink-0" />{saveError}
            </div>
          )}
        </main>
      )}

      <div className="fixed bottom-16 lg:bottom-0 left-0 w-full bg-white border-t border-gray-200 px-4 py-3 z-50">
        <button type="button" onClick={handleSave} disabled={saving} className="w-full h-12 bg-primary text-on-primary rounded-xl text-sm font-bold shadow flex items-center justify-center gap-2 disabled:opacity-60 hover:bg-primary/90 transition-all active:scale-[0.98]">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? t("locations.form.saving") : isEditMode ? t("locations.form.saveChanges") : t("locations.form.saveAddress")}
        </button>
      </div>
    </div>
  );
}

export default function AddAddressPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>}>
      <AddAddressPageInner />
    </Suspense>
  );
}
