import { create } from "zustand";

interface LocationStore {
  latitude: number | null;
  longitude: number | null;
  permissionDenied: boolean;
  setLocation: (lat: number, lng: number) => void;
  setPermissionDenied: () => void;
  reset: () => void;
}

export const useLocationStore = create<LocationStore>((set) => ({
  latitude: null,
  longitude: null,
  permissionDenied: false,

  setLocation: (latitude, longitude) =>
    set({ latitude, longitude, permissionDenied: false }),

  setPermissionDenied: () => set({ permissionDenied: true }),

  reset: () =>
    set({ latitude: null, longitude: null, permissionDenied: false }),
}));
