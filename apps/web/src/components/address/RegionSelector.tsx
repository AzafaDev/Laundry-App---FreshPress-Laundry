"use client";

import { ChevronDown, ChevronUp, Loader2, Search } from "lucide-react";
import { useTranslation } from "@/i18n/useTranslation";

interface Props {
  province: string;
  city: string;
  district: string;
  postalCode: string;
  isOpen: boolean;
  onToggle: () => void;
  onProvinceChange: (v: string) => void;
  onCityChange: (v: string) => void;
  onDistrictChange: (v: string) => void;
  onPostalCodeChange: (v: string) => void;
  onSearch?: () => void;
  searching?: boolean;
}

export function RegionSelector({ province, city, district, postalCode, isOpen, onToggle, onProvinceChange, onCityChange, onDistrictChange, onPostalCodeChange, onSearch, searching }: Props) {
  const { t } = useTranslation();
  const regionDisplay = [province, city, district, postalCode].filter(Boolean).join(", ").toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 pt-5 pb-3 text-left"
      >
        <span className="absolute mt-[-24px] text-[11px] text-gray-400">
          {t("locations.regionSelector.hint")}
        </span>
        <span className={`text-sm font-medium ${regionDisplay ? "text-gray-800" : "text-gray-400"}`}>
          {regionDisplay || t("locations.regionSelector.placeholder")}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {isOpen && (
        <div className="px-4 pb-4 flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">{t("locations.regionSelector.province")}</label>
              <input type="text" value={province} onChange={(e) => onProvinceChange(e.target.value)} placeholder={t("locations.regionSelector.provincePlaceholder")} className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">{t("locations.regionSelector.city")}</label>
              <input type="text" value={city} onChange={(e) => onCityChange(e.target.value)} placeholder={t("locations.regionSelector.cityPlaceholder")} className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">{t("locations.regionSelector.district")}</label>
              <input type="text" value={district} onChange={(e) => onDistrictChange(e.target.value)} placeholder={t("locations.regionSelector.districtPlaceholder")} className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[11px] text-gray-400">{t("locations.regionSelector.postalCode")}</label>
              <input type="text" inputMode="numeric" maxLength={5} value={postalCode} onChange={(e) => onPostalCodeChange(e.target.value)} placeholder={t("locations.regionSelector.postalCodePlaceholder")} className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
            </div>
          </div>
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              disabled={searching}
              className="w-full h-10 flex items-center justify-center gap-2 rounded-lg bg-primary text-on-primary text-sm font-semibold disabled:opacity-60 hover:bg-primary/90 transition-colors"
            >
              {searching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              {searching ? t("locations.regionSelector.searching") : t("locations.regionSelector.searchOnMap")}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
