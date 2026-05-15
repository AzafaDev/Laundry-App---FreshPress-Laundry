"use client";

// Interactive map for the outlet form — clicking anywhere drops a pin and
// reports the chosen (lat, lng) back to the parent. Uses react-leaflet on top
// of Leaflet's tile renderer with OpenStreetMap tiles.
import { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Circle,
  useMap,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Workaround for Leaflet's default marker icon URLs not resolving via bundlers.
const DEFAULT_ICON = L.icon({
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

interface OutletMapPickerProps {
  latitude: number | null;
  longitude: number | null;
  /** Service radius in km — rendered as a translucent circle around the pin. */
  radiusKm?: number | null;
  onChange: (lat: number, lng: number) => void;
  /** Where to center when no pin exists yet. Defaults to Jakarta. */
  fallbackCenter?: [number, number];
}

export function OutletMapPicker({
  latitude,
  longitude,
  radiusKm,
  onChange,
  fallbackCenter = [-6.2, 106.816666],
}: OutletMapPickerProps) {
  const hasPin = latitude != null && longitude != null;
  const center: [number, number] = hasPin
    ? [latitude!, longitude!]
    : fallbackCenter;

  return (
    <div className="h-[320px] w-full rounded-2xl overflow-hidden border-2 border-outline-variant">
      <MapContainer
        center={center}
        zoom={hasPin ? 14 : 11}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png"
        />
        <ClickCapture onPick={onChange} />
        <Recenter target={hasPin ? [latitude!, longitude!] : null} />
        {hasPin && (
          <>
            <Marker
              position={[latitude!, longitude!]}
              icon={DEFAULT_ICON}
              draggable
              eventHandlers={{
                dragend: (e) => {
                  const m = e.target as L.Marker;
                  const ll = m.getLatLng();
                  onChange(ll.lat, ll.lng);
                },
              }}
            />
            {radiusKm && radiusKm > 0 && (
              <Circle
                center={[latitude!, longitude!]}
                radius={radiusKm * 1000}
                pathOptions={{ color: "#00685f", fillOpacity: 0.1 }}
              />
            )}
          </>
        )}
      </MapContainer>
    </div>
  );
}

function ClickCapture({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ target }: { target: [number, number] | null }) {
  const map = useMap();
  const [last, setLast] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!target) return;
    if (last && last[0] === target[0] && last[1] === target[1]) return;
    map.setView(target, Math.max(map.getZoom(), 13));
    setLast(target);
  }, [target, map, last]);
  return null;
}
