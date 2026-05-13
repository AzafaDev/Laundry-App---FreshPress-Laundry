"use client";

import { useEffect } from "react";
import { useLocationStore } from "@/features/location/locationStore";

export function useGeolocation() {
  const { latitude, longitude, permissionDenied, setLocation, setPermissionDenied } =
    useLocationStore();

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
