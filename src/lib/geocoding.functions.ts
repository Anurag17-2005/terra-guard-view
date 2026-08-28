import { createServerFn } from "@tanstack/react-start";
import { searchPlaces, reverseGeocode } from "./geocoding.server";

export const searchPlacesFn = createServerFn({ method: "GET" })
  .inputValidator((data: { query: string; limit?: number }) => {
    const query = String(data?.query ?? "").trim();
    if (query.length < 2) throw new Error("Query too short");
    return { query, limit: Math.min(Math.max(data?.limit ?? 8, 1), 20) };
  })
  .handler(async ({ data }) => searchPlaces(data.query, data.limit));

export const reverseGeocodeFn = createServerFn({ method: "GET" })
  .inputValidator((data: { latitude: number; longitude: number }) => {
    const latitude = Number(data?.latitude);
    const longitude = Number(data?.longitude);
    if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
      throw new Error("Latitude must be between -90 and 90");
    }
    if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
      throw new Error("Longitude must be between -180 and 180");
    }
    return { latitude, longitude };
  })
  .handler(async ({ data }) => reverseGeocode(data.latitude, data.longitude));
