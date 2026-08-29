import type { NormalizedStats, TemperatureStats } from "./types";

function num(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "" && Number.isFinite(Number(value))) {
    return Number(value);
  }
  return null;
}

function pick(source: Record<string, unknown>, ...keys: string[]): unknown {
  const lower = new Map(Object.keys(source).map((key) => [key.toLowerCase(), key]));
  for (const key of keys) {
    const actual = lower.get(key.toLowerCase());
    if (actual !== undefined) return source[actual];
  }
  return undefined;
}

function numberArray(value: unknown): number[] | null {
  if (!Array.isArray(value)) return null;
  const list = value.map(num).filter((v): v is number => v !== null);
  return list.length ? list : null;
}

/**
 * Normalizes FortyGuard's stats_data. These statistics describe the tiles in the
 * requested area for the requested period — nothing more is inferred here.
 */
export function normalizeStats(
  statsData: Record<string, unknown> | null | undefined,
  unit: string,
): NormalizedStats | null {
  if (!statsData || typeof statsData !== "object") return null;

  const root = statsData as Record<string, unknown>;
  const temperatureStats = (pick(root, "temperature_stats", "stats") ?? {}) as Record<
    string,
    unknown
  >;

  const stats: TemperatureStats = {
    minimum: num(pick(temperatureStats, "minimum", "min")),
    maximum: num(pick(temperatureStats, "maximum", "max")),
    mean: num(pick(temperatureStats, "mean", "average")),
    standardDeviation: num(pick(temperatureStats, "standard_deviation", "std", "stdev")),
  };

  const normal = (pick(root, "normal_temperature_distribution") ?? null) as Record<
    string,
    unknown
  > | null;
  const normalX = normal ? numberArray(pick(normal, "x_axis", "x")) : null;
  const normalY = normal ? numberArray(pick(normal, "y_axis", "y")) : null;

  const frequencyRaw = pick(root, "temperature_frequency");
  let frequency: { bin: string; count: number }[] | null = null;
  if (frequencyRaw && typeof frequencyRaw === "object" && !Array.isArray(frequencyRaw)) {
    frequency = Object.entries(frequencyRaw as Record<string, unknown>)
      .map(([bin, count]) => ({ bin, count: num(count) ?? 0 }))
      .filter((entry) => entry.count > 0);
    if (!frequency.length) frequency = null;
  }

  return {
    unit: String(pick(root, "units", "unit") ?? unit),
    stats,
    overallDistribution: numberArray(pick(root, "overall_temperature_distribution")),
    normalDistribution: normalX && normalY ? { x: normalX, y: normalY } : null,
    frequency,
    raw: root,
  };
}
