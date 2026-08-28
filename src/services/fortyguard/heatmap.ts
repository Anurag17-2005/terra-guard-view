import type { Feature, FeatureCollection } from "geojson";
import { submitHeatmapFn, type HeatmapSubmitInput } from "@/lib/fortyguard.functions";
import { pollActivity, type PollOptions } from "./status";
import type { HeatmapResult } from "./types";

export const fortyguardHeatmap = {
  async create(request: HeatmapSubmitInput): Promise<{ activityId: string }> {
    return submitHeatmapFn({ data: request });
  },

  async run(request: HeatmapSubmitInput, poll?: PollOptions): Promise<HeatmapResult> {
    const { activityId } = await fortyguardHeatmap.create(request);
    const activity = await pollActivity(activityId, poll);
    const result = (activity.result ?? {}) as {
      map_data?: FeatureCollection;
      stats_data?: Record<string, unknown>;
    };
    return {
      activityId,
      mapData: result.map_data ?? null,
      statsData: result.stats_data ?? null,
    };
  },
};

/**
 * The temperature property name can differ between analytic types, so we look
 * for the first numeric property that plausibly holds a temperature instead of
 * inventing one. Returns null when nothing matches.
 */
const TEMPERATURE_KEYS = [
  "temperature",
  "temp",
  "tcm",
  "value",
  "temperature_celsius",
  "temperature_c",
  "mean_temperature",
  "avg_temperature",
];

export function readTemperature(feature: Feature): number | null {
  const props = (feature.properties ?? {}) as Record<string, unknown>;
  for (const key of TEMPERATURE_KEYS) {
    const raw = props[key];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim() !== "" && Number.isFinite(Number(raw))) {
      return Number(raw);
    }
  }
  // Fall back to the first finite numeric property, if any.
  for (const raw of Object.values(props)) {
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
  }
  return null;
}

export function temperatureRange(collection: FeatureCollection): { min: number; max: number } | null {
  let min = Infinity;
  let max = -Infinity;
  for (const feature of collection.features ?? []) {
    const value = readTemperature(feature);
    if (value === null) continue;
    if (value < min) min = value;
    if (value > max) max = value;
  }
  return Number.isFinite(min) && Number.isFinite(max) ? { min, max } : null;
}
