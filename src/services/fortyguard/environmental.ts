import { submitEnvParamsFn } from "@/lib/fortyguard.functions";
import { pollActivity, type PollOptions } from "./status";
import type { EnvironmentalData } from "./types";

export interface EnvRequest {
  latitude: number;
  longitude: number;
  temperature: number;
  startDate: string;
  startTime: string;
}

function num(source: Record<string, unknown>, ...keys: string[]): number | null {
  for (const key of keys) {
    let raw = source[key];
    // The API returns each parameter as a time series array; we request one hour.
    if (Array.isArray(raw)) raw = raw[0];
    if (typeof raw === "number" && Number.isFinite(raw)) return raw;
    if (typeof raw === "string" && raw.trim() !== "" && Number.isFinite(Number(raw))) {
      return Number(raw);
    }
  }
  return null; // null = unavailable, never 0
}

/**
 * Verified shape of /v1/env_params results:
 * { locations: [{ lat, lon, elevation, temperature, parameters: {...: [v]}, solar_irradiance }] }
 */
export function normalizeEnvironmental(result: unknown): EnvironmentalData {
  const root = (result ?? {}) as Record<string, unknown>;
  const locations = root["locations"];
  const location = (Array.isArray(locations) ? locations[0] : root) as Record<string, unknown>;
  const params = (location["parameters"] ?? {}) as Record<string, unknown>;
  const s = { ...params, ...location } as Record<string, unknown>;
  const solar = (location["solar_irradiance"] ?? {}) as Record<string, unknown>;
  const clearSky = (solar["clear_sky"] ?? {}) as Record<string, unknown>;

  return {
    temperature: num(s, "temperature", "temperature_celsius", "t_2m:C"),
    heatIndex: num(s, "heat_index_celsius", "heat_index"),
    apparentTemperature: num(s, "apparent_temperature_celsius", "apparent_temperature"),
    wetBulbTemperature: num(s, "wet_bulb_temperature_celsius", "wet_bulb_temperature"),
    humidity: num(s, "relative_humidity_percent", "relative_humidity", "humidity"),
    precipitation: num(s, "precipitation_mm", "precipitation"),
    cloudCover: num(s, "cloud_cover_octas", "cloud_cover"),
    elevation: num(s, "elevation"),
    aqi: num(s, "air_quality:idx", "air_quality"),
    pm25: num(s, "air_quality_pm2p5:idx", "pm2p5"),
    pm10: num(s, "air_quality_pm10:idx", "pm10"),
    no2: num(s, "air_quality_no2:idx", "no2"),
    ozone: num(s, "air_quality_o3:idx", "o3"),
    co: num(s, "aqi_us_co", "co"),
    so2: num(s, "air_quality_so2:idx", "so2"),
    methane: num(s, "methane_ppb", "methane"),
    co2: num(s, "co2_ppm", "co2"),
    solar: num(clearSky, "ghi"),
  };
}


export const fortyguardEnvironmental = {
  async create(request: EnvRequest) {
    return submitEnvParamsFn({ data: request });
  },
  async run(request: EnvRequest, poll?: PollOptions): Promise<EnvironmentalData> {
    const { activityId } = await fortyguardEnvironmental.create(request);
    const activity = await pollActivity(activityId, poll);
    return normalizeEnvironmental(activity.result);
  },
};
