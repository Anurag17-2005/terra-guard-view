import type { Feature, FeatureCollection, Polygon, Position } from "geojson";
import type { AreaInfo } from "./types";

const EARTH_RADIUS_M = 6378137;

/** Accepts a Polygon Feature or a FeatureCollection and returns the first polygon. */
export function firstPolygon(
  input: Feature<Polygon> | FeatureCollection | null | undefined,
): Feature<Polygon> | null {
  if (!input) return null;
  if (input.type === "Feature" && input.geometry?.type === "Polygon") {
    return input as Feature<Polygon>;
  }
  if (input.type === "FeatureCollection") {
    const found = (input.features ?? []).find((f) => f.geometry?.type === "Polygon");
    return (found as Feature<Polygon>) ?? null;
  }
  return null;
}

export function toFeatureCollection(polygon: Feature<Polygon>): FeatureCollection {
  return { type: "FeatureCollection", features: [polygon] };
}

/** Spherical excess area of a ring, in square metres. */
function ringArea(ring: Position[]): number {
  if (ring.length < 3) return 0;
  let total = 0;
  for (let i = 0; i < ring.length; i += 1) {
    const [lng1, lat1] = ring[i] as [number, number];
    const [lng2, lat2] = ring[(i + 1) % ring.length] as [number, number];
    total +=
      ((lng2 - lng1) * Math.PI) / 180 *
      (2 + Math.sin((lat1 * Math.PI) / 180) + Math.sin((lat2 * Math.PI) / 180));
  }
  return Math.abs((total * EARTH_RADIUS_M * EARTH_RADIUS_M) / 2);
}

export function polygonAreaKm2(polygon: Feature<Polygon>): number {
  const [outer, ...holes] = polygon.geometry.coordinates;
  if (!outer) return 0;
  const area = ringArea(outer) - holes.reduce((sum, hole) => sum + ringArea(hole), 0);
  return area / 1_000_000;
}

function haversineKm(a: [number, number], b: [number, number]): number {
  const toRad = (v: number) => (v * Math.PI) / 180;
  const dLat = toRad(b[1] - a[1]);
  const dLng = toRad(b[0] - a[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a[1])) * Math.cos(toRad(b[1])) * Math.sin(dLng / 2) ** 2;
  return 2 * (EARTH_RADIUS_M / 1000) * Math.asin(Math.sqrt(h));
}

/** Area, centre, vertex count and approximate bbox dimensions. */
export function calculatePolygonArea(
  input: Feature<Polygon> | FeatureCollection | null,
): AreaInfo | null {
  const polygon = firstPolygon(input);
  const ring = polygon?.geometry.coordinates[0];
  if (!polygon || !ring || ring.length < 4) return null;

  const closed =
    ring[0]?.[0] === ring[ring.length - 1]?.[0] && ring[0]?.[1] === ring[ring.length - 1]?.[1];
  const vertices = closed ? ring.length - 1 : ring.length;

  let west = Infinity;
  let east = -Infinity;
  let south = Infinity;
  let north = -Infinity;
  let sumLat = 0;
  let sumLng = 0;
  for (let i = 0; i < vertices; i += 1) {
    const [lng, lat] = ring[i] as [number, number];
    west = Math.min(west, lng);
    east = Math.max(east, lng);
    south = Math.min(south, lat);
    north = Math.max(north, lat);
    sumLat += lat;
    sumLng += lng;
  }

  const km2 = polygonAreaKm2(polygon);
  return {
    value: km2,
    unit: "km2",
    squareMiles: km2 / 2.589988,
    center: { latitude: sumLat / vertices, longitude: sumLng / vertices },
    vertices,
    dimensions: {
      widthKm: haversineKm([west, (south + north) / 2], [east, (south + north) / 2]),
      heightKm: haversineKm([(west + east) / 2, south], [(west + east) / 2, north]),
    },
  };
}

/** Circle -> polygon approximation so every shape becomes a valid polygon AOI. */
export function circleToPolygon(
  latitude: number,
  longitude: number,
  radiusMetres: number,
  steps = 48,
): Feature<Polygon> {
  const coords: Position[] = [];
  const latRad = (latitude * Math.PI) / 180;
  for (let i = 0; i <= steps; i += 1) {
    const angle = (i / steps) * 2 * Math.PI;
    const dLat = (radiusMetres * Math.cos(angle)) / 111_320;
    const dLng = (radiusMetres * Math.sin(angle)) / (111_320 * Math.cos(latRad) || 1);
    coords.push([longitude + dLng, latitude + dLat]);
  }
  return { type: "Feature", properties: {}, geometry: { type: "Polygon", coordinates: [coords] } };
}

/** Point -> small square AOI (the API always needs a polygon). */
export function pointToPolygon(latitude: number, longitude: number, metres = 250): Feature<Polygon> {
  return circleToPolygon(latitude, longitude, metres, 8);
}

export function rectangleToPolygon(
  south: number,
  west: number,
  north: number,
  east: number,
): Feature<Polygon> {
  return {
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
  };
}

export function isValidPolygon(input: Feature<Polygon> | FeatureCollection | null): boolean {
  const polygon = firstPolygon(input);
  const ring = polygon?.geometry.coordinates[0];
  if (!ring || ring.length < 4) return false;
  return ring.every(
    (position) =>
      Array.isArray(position) &&
      Number.isFinite(position[0]) &&
      Number.isFinite(position[1]) &&
      Math.abs(position[0] as number) <= 180 &&
      Math.abs(position[1] as number) <= 90,
  );
}
