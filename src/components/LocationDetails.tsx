import { Loader2, X } from "lucide-react";
import type { Place } from "@/services/geocoding";
import type { EnvironmentalData } from "@/services/fortyguard/types";
import { formatCoord } from "@/lib/geo";

export interface SelectionState {
  latitude: number;
  longitude: number;
  place: Place | null;
  placeLoading: boolean;
  /** Temperature comes from a clicked FortyGuard heatmap tile, never invented. */
  temperature: number | null;
  activityId: string | null;
}

export interface EnvState {
  status: "idle" | "loading" | "ready" | "error";
  data: EnvironmentalData | null;
  error: string | null;
}

const FIELDS: Array<{ key: keyof EnvironmentalData; label: string; unit: string }> = [
  { key: "temperature", label: "Temperature", unit: "°C" },
  { key: "heatIndex", label: "Heat index", unit: "°C" },
  { key: "apparentTemperature", label: "Apparent temp.", unit: "°C" },
  { key: "wetBulbTemperature", label: "Wet bulb", unit: "°C" },
  { key: "humidity", label: "Humidity", unit: "%" },
  { key: "precipitation", label: "Precipitation", unit: "mm" },
  { key: "cloudCover", label: "Cloud cover", unit: "octas" },
  { key: "elevation", label: "Elevation", unit: "m" },
  { key: "aqi", label: "AQI", unit: "" },
  { key: "pm25", label: "PM2.5", unit: "" },
  { key: "pm10", label: "PM10", unit: "" },
  { key: "no2", label: "NO₂", unit: "" },
  { key: "ozone", label: "Ozone", unit: "" },
  { key: "co", label: "CO", unit: "" },
  { key: "so2", label: "SO₂", unit: "" },
  { key: "methane", label: "Methane", unit: "ppb" },
  { key: "co2", label: "CO₂", unit: "ppm" },
  { key: "solar", label: "Solar irradiance", unit: "" },
];

export function LocationDetails({
  selection,
  env,
  onRequestEnv,
  onClose,
}: {
  selection: SelectionState;
  env: EnvState;
  onRequestEnv: () => void;
  onClose: () => void;
}) {
  return (
    <div className="fg-panel flex max-h-[calc(100vh-8rem)] w-[min(20rem,calc(100vw-2rem))] flex-col overflow-y-auto p-4 text-sm">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-[10px] uppercase tracking-widest text-panel-muted">
            Selected location
          </p>
          <h2 className="mt-1 truncate text-base font-semibold">
            {selection.placeLoading
              ? "Resolving place…"
              : (selection.place?.name ?? "Unnamed location")}
          </h2>
          {selection.place ? (
            <p className="mt-0.5 text-xs text-panel-muted">{selection.place.displayName}</p>
          ) : null}
        </div>
        <button type="button" onClick={onClose} aria-label="Close details">
          <X className="size-4 text-panel-muted hover:text-panel-foreground" />
        </button>
      </div>

      <dl className="mt-4 space-y-1.5 text-xs">
        <Row label="Latitude" value={formatCoord(selection.latitude)} mono />
        <Row label="Longitude" value={formatCoord(selection.longitude)} mono />
        {selection.place?.type ? <Row label="Type" value={selection.place.type} /> : null}
        {selection.place?.category ? (
          <Row label="Category" value={selection.place.category} />
        ) : null}
      </dl>

      <div className="mt-4 border-t border-panel-border pt-3">
        <p className="text-[10px] uppercase tracking-widest text-panel-muted">
          FortyGuard environment
        </p>

        {selection.temperature !== null ? (
          <dl className="mt-2 space-y-1.5 text-xs">
            <Row label="Temperature" value={`${selection.temperature.toFixed(1)} °C`} />
            {selection.activityId ? (
              <Row label="Activity" value={selection.activityId} mono />
            ) : null}
          </dl>
        ) : (
          <p className="mt-2 text-xs text-panel-muted">
            Run a temperature analysis and click a heatmap tile to read a measured value here.
          </p>
        )}

        {selection.temperature !== null ? (
          <button
            type="button"
            onClick={onRequestEnv}
            disabled={env.status === "loading"}
            className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-brand-foreground disabled:opacity-60"
          >
            {env.status === "loading" ? <Loader2 className="size-3.5 animate-spin" /> : null}
            {env.status === "loading" ? "Processing…" : "Load environmental parameters"}
          </button>
        ) : null}

        {env.error ? <p className="mt-2 text-xs text-destructive">{env.error}</p> : null}

        {env.data ? (
          <dl className="mt-3 space-y-1.5 text-xs">
            {FIELDS.map(({ key, label, unit }) => {
              const value = env.data![key];
              return (
                <Row
                  key={key}
                  label={label}
                  value={value === null ? "Unavailable" : `${value}${unit ? ` ${unit}` : ""}`}
                  muted={value === null}
                />
              );
            })}
          </dl>
        ) : null}
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  mono,
  muted,
}: {
  label: string;
  value: string;
  mono?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <dt className="text-panel-muted">{label}</dt>
      <dd
        className={`truncate text-right ${mono ? "font-mono" : ""} ${
          muted ? "text-panel-muted" : ""
        }`}
      >
        {value}
      </dd>
    </div>
  );
}
