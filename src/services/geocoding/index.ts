import { searchPlacesFn, reverseGeocodeFn } from "@/lib/geocoding.functions";

export interface Place {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type?: string;
  category?: string;
}

/**
 * Provider-agnostic geocoding abstraction. The UI only ever depends on
 * `Place`; swapping providers means changing the server implementation.
 */
export const geocodingService = {
  async search(query: string, limit = 8): Promise<Place[]> {
    return (await searchPlacesFn({ data: { query, limit } })) as Place[];
  },
  async reverse(latitude: number, longitude: number): Promise<Place | null> {
    return (await reverseGeocodeFn({ data: { latitude, longitude } })) as Place | null;
  },
};

export function parseCoordinates(input: string): { latitude: number; longitude: number } | null {
  const match = input.trim().match(/^(-?\d+(?:\.\d+)?)\s*[, ]\s*(-?\d+(?:\.\d+)?)$/);
  if (!match) return null;
  const latitude = Number(match[1]);
  const longitude = Number(match[2]);
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) return null;
  if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) return null;
  return { latitude, longitude };
}
