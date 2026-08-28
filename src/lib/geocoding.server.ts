/** Server-only geocoding helpers (OpenStreetMap Nominatim). */

const NOMINATIM = "https://nominatim.openstreetmap.org";
const UA = "FortyGuard-City-Intelligence/1.0 (learning project)";

export interface NormalizedPlace {
  id: string;
  name: string;
  displayName: string;
  latitude: number;
  longitude: number;
  type?: string | undefined;
  category?: string | undefined;
}

interface NominatimItem {
  place_id: number;
  name?: string;
  display_name: string;
  lat: string;
  lon: string;
  type?: string;
  class?: string;
  address?: Record<string, string>;
}

function normalize(item: NominatimItem): NormalizedPlace {
  return {
    id: String(item.place_id),
    name: item.name || item.display_name.split(",")[0]!.trim(),
    displayName: item.display_name,
    latitude: Number(item.lat),
    longitude: Number(item.lon),
    type: item.type,
    category: item.class,
  };
}

export async function searchPlaces(query: string, limit = 8): Promise<NormalizedPlace[]> {
  const url = new URL(`${NOMINATIM}/search`);
  url.searchParams.set("q", query);
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("countrycodes", "us");
  // Bias results toward California without hard-excluding others.
  url.searchParams.set("viewbox", "-124.5,42.1,-114.1,32.5");

  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) throw new Error(`Place search failed (${res.status})`);
  const data = (await res.json()) as NominatimItem[];
  return data.map(normalize);
}

export async function reverseGeocode(
  latitude: number,
  longitude: number,
): Promise<NormalizedPlace | null> {
  const url = new URL(`${NOMINATIM}/reverse`);
  url.searchParams.set("lat", String(latitude));
  url.searchParams.set("lon", String(longitude));
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("addressdetails", "1");

  const res = await fetch(url, { headers: { "User-Agent": UA, Accept: "application/json" } });
  if (!res.ok) return null;
  const data = (await res.json()) as NominatimItem & { error?: string };
  if (!data || data.error || !data.display_name) return null;
  return normalize(data);
}
