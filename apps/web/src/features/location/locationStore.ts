import { create } from "zustand";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  permissionDenied: boolean;
  setLocation: (lat: number, lng: number) => void;
  setPermissionDenied: () => void;
}

export const useLocationStore = create<LocationState>((set) => ({
  latitude: null,
  longitude: null,
  permissionDenied: false,
  setLocation: (latitude, longitude) => set({ latitude, longitude, permissionDenied: false }),
  setPermissionDenied: () => set({ permissionDenied: true }),
}));
