/** Thermal color ramp shared by the temperature layer and the legend. */
export const TEMPERATURE_STOPS = [
  "var(--temp-1)",
  "var(--temp-2)",
  "var(--temp-3)",
  "var(--temp-4)",
  "var(--temp-5)",
  "var(--temp-6)",
];

/** Leaflet paths need concrete colors, not CSS variables. */
const RAMP = [
  "#5b8dd9",
  "#4fb3bf",
  "#b8d24a",
  "#e8b23c",
  "#e07a35",
  "#c8402f",
];

/**
 * Maps an actual value to a color, normalized against the range of the data
 * currently displayed. No temperature values are invented here.
 */
export function getTemperatureColor(value: number, min: number, max: number): string {
  if (!Number.isFinite(value)) return RAMP[0]!;
  const span = max - min;
  const t = span <= 0 ? 0.5 : (value - min) / span;
  const index = Math.min(RAMP.length - 1, Math.max(0, Math.round(t * (RAMP.length - 1))));
  return RAMP[index]!;
}

export const TEMPERATURE_RAMP = RAMP;
