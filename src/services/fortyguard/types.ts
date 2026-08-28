import type { FeatureCollection } from "geojson";

export type ActivityStatus = "Processing" | "Completed" | "Failed" | string;

export interface ActivityResponse {
  activityId: string;
  status: ActivityStatus;
  result: unknown;
}

export interface HeatmapResult {
  activityId: string;
  mapData: FeatureCollection | null;
  statsData: Record<string, unknown> | null;
}

/** null means "unavailable" — never coerce to 0. */
export interface EnvironmentalData {
  temperature: number | null;
  heatIndex: number | null;
  apparentTemperature: number | null;
  wetBulbTemperature: number | null;
  humidity: number | null;
  precipitation: number | null;
  cloudCover: number | null;
  elevation: number | null;
  aqi: number | null;
  pm25: number | null;
  pm10: number | null;
  no2: number | null;
  ozone: number | null;
  co: number | null;
  so2: number | null;
  methane: number | null;
  co2: number | null;
  solar: number | null;
}

export type AnalysisPhase = "idle" | "submitting" | "processing" | "completed" | "failed";
