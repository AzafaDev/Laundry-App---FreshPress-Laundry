"use client";

import { useLocationStore } from "@/stores/locationStore";
import { useEffect } from "react";

export function useGeolocation() {
  const { latitude, longitude, permissionDenied, setLocation, setPermissionDenied } =
    useLocationStore();

  useEffect(() => {
    if (!navigator?.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => setLocation(pos.coords.latitude, pos.coords.longitude),
      () => setPermissionDenied(),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );

    let permissionStatus: PermissionStatus | null = null;

    const handleChange = () => {
      if (permissionStatus?.state === "granted") {
        navigator.geolocation.getCurrentPosition(
          (pos) => setLocation(pos.coords.latitude, pos.coords.longitude),
          () => setPermissionDenied(),
        );
      } else if (permissionStatus?.state === "denied") {
        setPermissionDenied();
      }
    };

    navigator.permissions?.query({ name: "geolocation" }).then((status) => {
      permissionStatus = status;
      status.addEventListener("change", handleChange);
    });

    return () => {
      permissionStatus?.removeEventListener("change", handleChange);
    };
  }, [setLocation, setPermissionDenied]);

  return { latitude, longitude, permissionDenied };
}
