import type { Feature, FeatureCollection, Polygon } from "geojson";

/** ---------- Normalized request model (UI + future agent both use this) ---------- */

export type AnalysisType = "temperature" | "peak_time" | "exceedance" | "persistence";
export type Direction = "above" | "below";

/**
 * A single normalized temporal model. The service layer — never the UI —
 * translates this into FortyGuard's filter_type / start_* / end_* fields.
 */
export type TimeMode = "single_hour" | "time_range" | "full_day" | "multi_day";

export interface TimeRange {
  mode: TimeMode;
  /** YYYY-MM-DD */
  startDate: string;
  /** YYYY-MM-DD — multi_day only */
  endDate?: string;
  /** HH:MM — single_hour, time_range */
  startTime?: string;
  /** HH:MM — time_range only */
  endTime?: string;
}

export type Granularity = 60 | 80 | 100;

/** How the user framed the request. Purely descriptive metadata. */
export type TemporalContext = "historical" | "recent" | "forecast";

export interface AnalysisSpec {
  type: AnalysisType;
  /** °C — required for exceedance / persistence only. */
  threshold?: number;
  /** required for exceedance / persistence only. */
  direction?: Direction;
}

export interface AnalysisRequest {
  polygon: Feature<Polygon> | FeatureCollection;
  timeRange: TimeRange;
  analysis: AnalysisSpec;
  granularity: Granularity;
  /** Optional label so future comparison features can name periods (A vs B). */
  label?: string;
}

/** ---------- Structured result ---------- */

export interface AreaInfo {
  value: number;
  unit: "km2";
  squareMiles: number;
  center: { latitude: number; longitude: number };
  vertices: number;
  /** Approximate bounding-box dimensions in km. */
  dimensions: { widthKm: number; heightKm: number };
}

export interface TemperatureStats {
  minimum: number | null;
  maximum: number | null;
  mean: number | null;
  standardDeviation: number | null;
}

export interface NormalizedStats {
  /** "°C" for tcm, "hour" for the hour-based analytics. */
  unit: string;
  stats: TemperatureStats;
  overallDistribution: number[] | null;
  normalDistribution: { x: number[]; y: number[] } | null;
  frequency: { bin: string; count: number }[] | null;
  raw: Record<string, unknown> | null;
}

export interface AnalysisMetadata {
  analyticType: string;
  filterType: number;
  temporalContext: TemporalContext;
  granularity: Granularity;
  tileCount: number;
  requestedAt: string;
  completedAt: string;
  cached: boolean;
  signature: string;
}

export interface AnalysisSuccess {
  status: "completed";
  request: AnalysisRequest;
  activityId: string;
  area: AreaInfo | null;
  statistics: NormalizedStats | null;
  geojson: FeatureCollection | null;
  metadata: AnalysisMetadata;
}

export interface AnalysisFailure {
  status: "failed";
  request: AnalysisRequest;
  error: { code: string; message: string; userMessage: string };
}

export type AnalysisResult = AnalysisSuccess | AnalysisFailure;

export interface ValidationIssue {
  field: string;
  message: string;
}
