import type { AnalysisType } from "./types";

/** Mapping between the product vocabulary and FortyGuard analytic types. */
export const ANALYTIC_TYPE: Record<AnalysisType, string> = {
  temperature: "tcm",
  peak_time: "time_of_measure",
  exceedance: "exceedance",
  persistence: "persistence",
};

export const REQUIRES_THRESHOLD: AnalysisType[] = ["exceedance", "persistence"];

export function requiresThreshold(type: AnalysisType): boolean {
  return REQUIRES_THRESHOLD.includes(type);
}

/** Unit of the values returned per tile. tcm is °C; the others are hours. */
export function valueUnit(type: AnalysisType): "°C" | "hour" {
  return type === "temperature" ? "°C" : "hour";
}

export const ANALYSIS_LABEL: Record<AnalysisType, string> = {
  temperature: "Temperature",
  peak_time: "Peak Time",
  exceedance: "Heat Exceedance",
  persistence: "Heat Persistence",
};

export const ANALYSIS_DESCRIPTION: Record<AnalysisType, string> = {
  temperature: "Temperature per tile (°C) for the selected period.",
  peak_time: "Hour of day (UTC) at which temperature peaks — not the peak value.",
  exceedance: "Number of hours the temperature passes the threshold.",
  persistence: "Longest continuous run of hours past the threshold.",
};
