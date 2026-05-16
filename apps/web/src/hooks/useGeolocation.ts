"use client";

import { useLocationStore } from "@/stores/locationStore";
import { useEffect } from "react";

export function useGeolocation() {
  const {
    latitude,
    longitude,
    permissionDenied,
    setLocation,
    setPermissionDenied,
  } = useLocationStore();

  useEffect(() => {
    if (!navigator?.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation(position.coords.latitude, position.coords.longitude);
      },
      () => {
        setPermissionDenied();
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  }, [setLocation, setPermissionDenied]);

  return { latitude, longitude, permissionDenied };
}
