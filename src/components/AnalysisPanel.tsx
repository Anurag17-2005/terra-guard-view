import { Loader2, Thermometer } from "lucide-react";
import {
  ANALYSIS_DESCRIPTION,
  ANALYSIS_LABEL,
  requiresThreshold,
  type AnalysisResult,
  type AnalysisSpec,
  type AnalysisType,
  type Direction,
  type Granularity,
  type TimeMode,
  type TimeRange,
} from "@/services/analysis";

export interface AnalysisSettings {
  timeRange: TimeRange;
  analysis: AnalysisSpec;
  granularity: Granularity;
}

const TYPES: AnalysisType[] = ["temperature", "peak_time", "exceedance", "persistence"];
const MODES: { value: TimeMode; label: string }[] = [
  { value: "single_hour", label: "Single hour" },
  { value: "time_range", label: "Time range (same day)" },
  { value: "full_day", label: "Full day" },
  { value: "multi_day", label: "Multiple days" },
];

const inputClass =
  "rounded-md border border-panel-border bg-white/5 px-2 py-1.5 text-xs outline-none";

export function AnalysisPanel({
  settings,
  onSettingsChange,
  busy,
  progress,
  result,
  hasShape,
  onRun,
}: {
  settings: AnalysisSettings;
  onSettingsChange: (value: AnalysisSettings) => void;
  busy: boolean;
  progress: string | null;
  result: AnalysisResult | null;
  hasShape: boolean;
  onRun: () => void;
}) {
  const { timeRange, analysis, granularity } = settings;
  const needsThreshold = requiresThreshold(analysis.type);

  const setTime = (patch: Partial<TimeRange>) =>
    onSettingsChange({ ...settings, timeRange: { ...timeRange, ...patch } });

  return (
    <div className="fg-panel max-h-[55vh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto p-4 text-sm">
      <div className="flex items-center gap-2">
        <Thermometer className="size-4 text-brand" />
        <h2 className="text-sm font-semibold">Analysis</h2>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-1.5">
        {TYPES.map((type) => (
          <button
            key={type}
            type="button"
            onClick={() =>
              onSettingsChange({
                ...settings,
                analysis: requiresThreshold(type)
                  ? { type, threshold: analysis.threshold ?? 35, direction: analysis.direction ?? "above" }
                  : { type },
              })
            }
            className={`rounded-md border px-2 py-1.5 text-[11px] ${
              analysis.type === type
                ? "border-brand bg-brand text-brand-foreground"
                : "border-panel-border bg-white/5"
            }`}
          >
            {ANALYSIS_LABEL[type]}
          </button>
        ))}
      </div>
      <p className="mt-1.5 text-[10px] text-panel-muted">{ANALYSIS_DESCRIPTION[analysis.type]}</p>

      {needsThreshold ? (
        <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
          <label className="flex flex-col gap-1">
            <span className="text-panel-muted">Threshold (°C)</span>
            <input
              type="number"
              value={analysis.threshold ?? ""}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  analysis: { ...analysis, threshold: Number(event.target.value) },
                })
              }
              className={inputClass}
            />
          </label>
          <label className="flex flex-col gap-1">
            <span className="text-panel-muted">Direction</span>
            <select
              value={analysis.direction ?? "above"}
              onChange={(event) =>
                onSettingsChange({
                  ...settings,
                  analysis: { ...analysis, direction: event.target.value as Direction },
                })
              }
              className={inputClass}
            >
              <option value="above">Above</option>
              <option value="below">Below</option>
            </select>
          </label>
        </div>
      ) : null}

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-panel-muted">Period</span>
          <select
            value={timeRange.mode}
            onChange={(event) => setTime({ mode: event.target.value as TimeMode })}
            className={inputClass}
          >
            {MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-panel-muted">
            {timeRange.mode === "multi_day" ? "Start date" : "Date"}
          </span>
          <input
            type="date"
            min="2019-01-01"
            value={timeRange.startDate}
            onChange={(event) => setTime({ startDate: event.target.value })}
            className={inputClass}
          />
        </label>

        {timeRange.mode === "multi_day" ? (
          <label className="flex flex-col gap-1">
            <span className="text-panel-muted">End date</span>
            <input
              type="date"
              min="2019-01-01"
              value={timeRange.endDate ?? ""}
              onChange={(event) => setTime({ endDate: event.target.value })}
              className={inputClass}
            />
          </label>
        ) : null}

        {timeRange.mode === "single_hour" || timeRange.mode === "time_range" ? (
          <label className="flex flex-col gap-1">
            <span className="text-panel-muted">Start time (UTC)</span>
            <input
              type="time"
              value={timeRange.startTime ?? ""}
              onChange={(event) => setTime({ startTime: event.target.value })}
              className={inputClass}
            />
          </label>
        ) : null}

        {timeRange.mode === "time_range" ? (
          <label className="flex flex-col gap-1">
            <span className="text-panel-muted">End time (UTC)</span>
            <input
              type="time"
              value={timeRange.endTime ?? ""}
              onChange={(event) => setTime({ endTime: event.target.value })}
              className={inputClass}
            />
          </label>
        ) : null}

        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-panel-muted">Granularity</span>
          <select
            value={granularity}
            onChange={(event) =>
              onSettingsChange({ ...settings, granularity: Number(event.target.value) as Granularity })
            }
            className={inputClass}
          >
            <option value={100}>100 m (default)</option>
            <option value={80}>80 m</option>
            <option value={60}>60 m</option>
          </select>
        </label>
      </div>

      <button
        type="button"
        onClick={onRun}
        disabled={busy || !hasShape}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-brand-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {busy ? progress ?? "Working…" : hasShape ? "Analyze" : "Draw an area first"}
      </button>

      {result?.status === "failed" ? (
        <p className="mt-2 text-xs text-destructive">{result.error.userMessage}</p>
      ) : null}

      {result?.status === "completed" ? <ResultSummary result={result} /> : null}
    </div>
  );
}

function ResultSummary({ result }: { result: Extract<AnalysisResult, { status: "completed" }> }) {
  const stats = result.statistics;
  const unit = stats?.unit ?? "";
  const fmt = (value: number | null | undefined) =>
    typeof value === "number" ? `${value.toFixed(1)} ${unit}`.trim() : "Unavailable";

  return (
    <div className="mt-3 border-t border-panel-border pt-2 text-xs">
      <p className="text-[10px] uppercase tracking-widest text-panel-muted">
        Results{result.metadata.cached ? " (cached)" : ""}
      </p>
      <dl className="mt-1 grid grid-cols-2 gap-y-1">
        <Row label="Tiles" value={String(result.metadata.tileCount)} />
        <Row label="Minimum" value={fmt(stats?.stats.minimum)} />
        <Row label="Maximum" value={fmt(stats?.stats.maximum)} />
        <Row label="Mean" value={fmt(stats?.stats.mean)} />
        <Row label="Std. dev." value={fmt(stats?.stats.standardDeviation)} />
        <Row label="Period" value={result.metadata.temporalContext} />
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-panel-muted">{label}</dt>
      <dd className="text-right">{value}</dd>
    </>
  );
}
