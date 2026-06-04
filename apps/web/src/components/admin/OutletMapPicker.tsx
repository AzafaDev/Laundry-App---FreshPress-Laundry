"use client";

// Interactive map for the outlet form — clicking anywhere drops a pin and
// reports the chosen (lat, lng) back to the parent. Uses react-leaflet on top
// of Leaflet's tile renderer with CARTO Voyager tiles (better labels than the
// minimalist OSM default).
//
// Note: this file intentionally uses `any` for Leaflet handles because
// @types/leaflet isn't installed. Run `npm i -D @types/leaflet` to get full
// type support.
/* eslint-disable @typescript-eslint/no-explicit-any */
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
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
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
  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  const hasPin = latitude != null && longitude != null;

  if (!mounted) {
    return (
      <div className="h-[320px] w-full rounded-2xl bg-surface-variant animate-pulse" />
    );
  }
  const center: [number, number] = hasPin
    ? [latitude!, longitude!]
    : fallbackCenter;

  // react-leaflet's props are strongly typed against leaflet's own types; we
  // cast through `any` to keep this self-contained until @types/leaflet is
  // installed.
  const MapAny = MapContainer as any;
  const TileLayerAny = TileLayer as any;
  const MarkerAny = Marker as any;
  const CircleAny = Circle as any;

  return (
    <div className="h-[320px] w-full rounded-2xl overflow-hidden border-2 border-outline-variant">
      <MapAny
        center={center}
        // Use a higher default zoom so street-level labels are visible. At
        // zoom 11 you only see region names; from ~14 you start seeing
        // street names which is what admins usually want.
        zoom={hasPin ? 16 : 13}
        minZoom={3}
        maxZoom={19}
        scrollWheelZoom
        style={{ height: "100%", width: "100%" }}
      >
        {/*
          CARTO Voyager: free, no API key needed, much richer labels than the
          plain OSM tiles (street names + POI names are clearly visible from
          mid-zoom). Falls back to "Light All" attribution requirement.
          Swap `url` for the plain OSM URL below if you prefer:
            https://{s}.tile.openstreetmap.org/{z}/{y}/{x}.png
        */}
        <TileLayerAny
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager_labels_under/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maxZoom={20}
        />
        <ClickCapture onPick={onChange} />
        <Recenter target={hasPin ? [latitude!, longitude!] : null} />
        <InvalidateOnMount />
        {hasPin && (
          <>
            <MarkerAny
              position={[latitude!, longitude!]}
              icon={DEFAULT_ICON}
              draggable
              eventHandlers={{
                dragend: (e: any) => {
                  const m = e.target;
                  const ll = m.getLatLng();
                  onChange(ll.lat, ll.lng);
                },
              }}
            />
            {radiusKm && radiusKm > 0 && (
              <CircleAny
                center={[latitude!, longitude!]}
                radius={radiusKm * 1000}
                pathOptions={{ color: "#00685f", fillOpacity: 0.1 }}
              />
            )}
          </>
        )}
      </MapAny>
    </div>
  );
}

function ClickCapture({
  onPick,
}: {
  onPick: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e: any) {
      onPick(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function Recenter({ target }: { target: [number, number] | null }) {
  const map = useMap() as any;
  const [last, setLast] = useState<[number, number] | null>(null);
  useEffect(() => {
    if (!target) return;
    if (last && last[0] === target[0] && last[1] === target[1]) return;
    map.setView(target, Math.max(map.getZoom(), 16));
    setLast(target);
  }, [target, map, last]);
  return null;
}

/**
 * Leaflet measures the container at mount-time. When the map is rendered
 * inside a freshly-opened modal (or any container whose dimensions settle
 * after mount), it ends up painting only the top-left tile and the rest of
 * the viewport stays empty — that's why labels appear missing. Calling
 * `invalidateSize()` after the modal has finished its layout pass forces
 * Leaflet to re-measure and load the surrounding tiles.
 */
function InvalidateOnMount() {
  const map = useMap() as any;
  useEffect(() => {
    // Two ticks: one for the modal's CSS transitions, one safety net.
    const t1 = setTimeout(() => map.invalidateSize(), 0);
    const t2 = setTimeout(() => map.invalidateSize(), 250);
    // Also re-invalidate on window resize for good measure.
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}
