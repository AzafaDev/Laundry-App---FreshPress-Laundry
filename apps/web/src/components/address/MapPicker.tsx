"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = L.icon({
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

export interface MapPickerProps {
  lat: number;
  lng: number;
  /** Increment this number to programmatically fly the map to lat/lng */
  flyToTrigger?: number;
  onPin: (lat: number, lng: number) => void;
  height?: string;
}

export default function MapPicker({
  lat,
  lng,
  flyToTrigger = 0,
  onPin,
  height = "240px",
}: MapPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<ReturnType<typeof L.map> | null>(null);
  const markerRef = useRef<ReturnType<typeof L.marker> | null>(null);
  // Keep callback ref up-to-date without restarting the map
  const onPinRef = useRef(onPin);
  useEffect(() => { onPinRef.current = onPin; });

  // ── Initialize map once on mount ──────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current) return;

    // Guard against StrictMode double-invoke: destroy leftover instance
    if ((containerRef.current as HTMLElement & { _leaflet_id?: number })._leaflet_id) {
      mapRef.current?.remove();
      mapRef.current = null;
      markerRef.current = null;
    }

    const map = L.map(containerRef.current, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    const marker = L.marker([lat, lng], {
      icon: markerIcon,
      draggable: true,
    }).addTo(map);

    marker.on("dragend", () => {
      const ll = marker.getLatLng();
      onPinRef.current(ll.lat, ll.lng);
    });

    map.on("click", (e: { latlng: { lat: number; lng: number } }) => {
      onPinRef.current(e.latlng.lat, e.latlng.lng);
    });

    mapRef.current = map;
    markerRef.current = marker;

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // intentionally empty — runs once

  // ── Sync marker position when lat/lng props change ────────────────────────
  useEffect(() => {
    markerRef.current?.setLatLng([lat, lng]);
  }, [lat, lng]);

  // ── Fly to location when flyToTrigger increments ──────────────────────────
  useEffect(() => {
    if (!mapRef.current || flyToTrigger === 0) return;
    mapRef.current.flyTo([lat, lng], 16, { animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flyToTrigger]);

  return (
    <div
      ref={containerRef}
      style={{ height, width: "100%", cursor: "crosshair", isolation: "isolate" }}
    />
  );
}
