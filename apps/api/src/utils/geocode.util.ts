// OpenCage geocode utilities — convert an address string to (lat, lng).
import OpenCage from "opencage-api-client";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/error.middleware.js";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted: string;
  confidence?: number;
}

/**
 * Forward-geocode an address using OpenCage.
 * Returns the highest-confidence match or throws AppError(422) if no match.
 */
export const geocodeAddress = async (address: string): Promise<GeocodeResult> => {
  if (!env.OPENCAGE_API_KEY) {
    throw new AppError("Geocoding belum dikonfigurasi (OPENCAGE_API_KEY).", 501);
  }

  try {
    const response = await OpenCage.geocode({
      key: env.OPENCAGE_API_KEY,
      q: address,
      limit: 1,
      no_annotations: 1,
    });

    const first = response.results?.[0];
    if (!first) {
      throw new AppError("Alamat tidak dapat ditemukan di peta.", 422);
    }

    return {
      latitude: first.geometry.lat,
      longitude: first.geometry.lng,
      formatted: first.formatted,
      confidence: first.confidence,
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Gagal melakukan geocoding alamat.", 502);
  }
};
