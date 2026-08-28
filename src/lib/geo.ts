import type { Feature, MultiPolygon, Polygon } from "geojson";

/** GeoJSON is [lng, lat]; Leaflet is [lat, lng]. Always convert explicitly. */
export type LngLat = [number, number];
export type LatLng = [number, number];

export const lngLatToLatLng = ([lng, lat]: LngLat): LatLng => [lat, lng];
export const latLngToLngLat = ([lat, lng]: LatLng): LngLat => [lng, lat];

/** All outer rings of a (Multi)Polygon, converted to Leaflet lat/lng rings. */
export function outerRingsToLatLng(
  geometry: Polygon | MultiPolygon,
): LatLng[][] {
  const polygons =
    geometry.type === "Polygon" ? [geometry.coordinates] : geometry.coordinates;
  return polygons.map((poly) => (poly[0] ?? []).map((c) => lngLatToLatLng(c as LngLat)));
}

export function formatCoord(value: number, digits = 5): string {
  return value.toFixed(digits);
}

/** Rectangular AOI polygon (GeoJSON FeatureCollection) from map bounds. */
export function boundsToAoi(
  south: number,
  west: number,
  north: number,
  east: number,
): { type: "FeatureCollection"; features: Feature<Polygon>[] } {
  return {
    type: "FeatureCollection",
    features: [
      {
        type: "Feature",
        properties: {},
        geometry: {
          type: "Polygon",
          coordinates: [
            [
              [west, south],
              [east, south],
              [east, north],
              [west, north],
              [west, south],
            ],
          ],
        },
      },
    ],
  };
}
