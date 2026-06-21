"use client";

import { ChevronDown, ChevronUp } from "lucide-react";

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
}

export function RegionSelector({ province, city, district, postalCode, isOpen, onToggle, onProvinceChange, onCityChange, onDistrictChange, onPostalCodeChange }: Props) {
  const regionDisplay = [province, city, district, postalCode].filter(Boolean).join(", ").toUpperCase();

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 pt-5 pb-3 text-left"
      >
        <span className="absolute mt-[-24px] text-[11px] text-gray-400">
          Provinsi, Kota, Kecamatan, Kode Pos
        </span>
        <span className={`text-sm font-medium ${regionDisplay ? "text-gray-800" : "text-gray-400"}`}>
          {regionDisplay || "Pilih wilayah..."}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-gray-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />}
      </button>

      {isOpen && (
        <div className="grid grid-cols-2 gap-2 px-4 pb-4">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Provinsi *</label>
            <input type="text" value={province} onChange={(e) => onProvinceChange(e.target.value)} placeholder="cth. Jawa Timur" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Kota / Kabupaten *</label>
            <input type="text" value={city} onChange={(e) => onCityChange(e.target.value)} placeholder="cth. Kab. Jombang" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Kecamatan *</label>
            <input type="text" value={district} onChange={(e) => onDistrictChange(e.target.value)} placeholder="cth. Diwek" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] text-gray-400">Kode Pos</label>
            <input type="text" inputMode="numeric" maxLength={5} value={postalCode} onChange={(e) => onPostalCodeChange(e.target.value)} placeholder="cth. 61471" className="h-10 px-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary placeholder:text-gray-300" />
          </div>
        </div>
      )}
    </div>
  );
}
