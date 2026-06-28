"use client";

import dynamic from "next/dynamic";
import { AlertCircle, Loader2, MapPin, MapPinned } from "lucide-react";
import type { MapPickerProps } from "@/components/address/MapPicker";

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

interface Props {
  lat: number;
  lng: number;
  flyToTrigger: number;
  pinSet: boolean;
  geocoding: boolean;
  geocodeError: string | null;
  onPin: (lat: number, lng: number) => void;
}

export function MapPickerSection({ lat, lng, flyToTrigger, pinSet, geocoding, geocodeError, onPin }: Props) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center px-4 py-2.5 border-b border-gray-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <MapPin className="w-3.5 h-3.5 text-primary" />
          {pinSet ? (
            <span className="text-gray-700 font-medium tabular-nums">{lat.toFixed(5)}, {lng.toFixed(5)}</span>
          ) : (
            <span>Pilih dari hasil pencarian atau klik peta untuk menandai lokasi</span>
          )}
        </div>
      </div>

      {pinSet && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border-b border-amber-100">
          <MapPinned className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-semibold text-amber-600">Tetapkan pin yang tepat</p>
            <p className="text-xs text-amber-700 mt-0.5">Kami akan mengambil dan mengantarkan laundry ke lokasi peta. Mohon periksa apakah sudah benar, jika belum klik peta untuk menyesuaikan.</p>
          </div>
        </div>
      )}

      <div className="h-60 w-full">
        <MapPicker lat={lat} lng={lng} flyToTrigger={flyToTrigger} onPin={onPin} height="240px" />
      </div>

      {geocodeError && (
        <div className="px-4 py-2 flex items-center gap-1.5 text-xs text-red-600 bg-red-50 border-t border-red-100">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />{geocodeError}
        </div>
      )}
      {geocoding && (
        <div className="px-4 py-2 flex items-center gap-1.5 text-xs text-primary bg-blue-50 border-t border-blue-100">
          <Loader2 className="w-3.5 h-3.5 animate-spin" />Membaca informasi lokasi...
        </div>
      )}
    </div>
  );
}
