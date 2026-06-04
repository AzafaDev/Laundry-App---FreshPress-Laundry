// OpenCage geocode utilities — convert an address string to (lat, lng).
import OpenCage from "opencage-api-client";
import { env } from "../config/env.js";
import { AppError } from "../middlewares/error.middleware.js";

export interface GeocodeResult {
  latitude: number;
  longitude: number;
  formatted: string;
  confidence?: number;
  street?: string;
  district?: string;
  city?: string;
  province?: string;
  postal_code?: string;
}

type GeocodeComponents = Record<string, string | undefined>;

const pickFirst = (
  components: GeocodeComponents,
  keys: string[],
): string | undefined => {
  for (const key of keys) {
    const value = components[key];
    if (value && value.trim()) return value.trim();
  }
  return undefined;
};

const mapComponents = (components?: GeocodeComponents) => {
  if (!components) return {};

  return {
    street: pickFirst(components, [
      "road",
      "pedestrian",
      "residential",
      "footway",
      "path",
      "neighbourhood",
    ]),
    district: pickFirst(components, [
      "suburb",
      "city_district",
      "state_district",
      "district",
      "village",
      "hamlet",
    ]),
    city: pickFirst(components, [
      "city",
      "county",
      "regency",
      "municipality",
      "town",
    ]),
    province: pickFirst(components, ["state", "province", "region"]),
    postal_code: pickFirst(components, ["postcode"]),
  };
};

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
      ...mapComponents(first.components as GeocodeComponents | undefined),
    };
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Gagal melakukan geocoding alamat.", 502);
  }
};

/**
 * Search variant — returns up to `limit` candidate matches sorted by
 * confidence. Used by the admin outlet form's autocomplete dropdown.
 * Returns an empty array (not 422) when nothing matches, so the UI can
 * just hide the dropdown.
 */
export const searchAddress = async (
  query: string,
  limit = 5,
  countrycode = "id", // bias results to Indonesia by default
): Promise<GeocodeResult[]> => {
  if (!env.OPENCAGE_API_KEY) {
    throw new AppError("Geocoding belum dikonfigurasi (OPENCAGE_API_KEY).", 501);
  }
  const q = query.trim();
  if (q.length < 3) return [];

  try {
    const response = await OpenCage.geocode({
      key: env.OPENCAGE_API_KEY,
      q,
      limit: Math.min(Math.max(limit, 1), 10),
      no_annotations: 1,
      countrycode,
    });

    const results = response.results ?? [];
    return results.map((r: { geometry: { lat: number; lng: number }; formatted: string; confidence?: number }) => ({
      latitude: r.geometry.lat,
      longitude: r.geometry.lng,
      formatted: r.formatted,
      confidence: r.confidence,
      ...mapComponents((r as { components?: GeocodeComponents }).components),
    }));
  } catch (err) {
    if (err instanceof AppError) throw err;
    throw new AppError("Gagal mencari alamat di peta.", 502);
  }
};
