import { Loader2, Thermometer } from "lucide-react";
import type { AnalysisPhase } from "@/services/fortyguard/types";

export interface AnalysisSettings {
  date: string;
  time: string;
  granularity: number;
}

export function AnalysisPanel({
  settings,
  onSettingsChange,
  phase,
  statusText,
  error,
  tileCount,
  onRun,
}: {
  settings: AnalysisSettings;
  onSettingsChange: (value: AnalysisSettings) => void;
  phase: AnalysisPhase;
  statusText: string | null;
  error: string | null;
  tileCount: number | null;
  onRun: () => void;
}) {
  const busy = phase === "submitting" || phase === "processing";

  return (
    <div className="fg-panel w-[min(20rem,calc(100vw-2rem))] p-4 text-sm">
      <div className="flex items-center gap-2">
        <Thermometer className="size-4 text-brand" />
        <h2 className="text-sm font-semibold">Temperature analysis</h2>
      </div>
      <p className="mt-1 text-xs text-panel-muted">
        Requests a FortyGuard thermal map (analytic <span className="font-mono">tcm</span>) for the
        area currently in view.
      </p>

      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
        <label className="flex flex-col gap-1">
          <span className="text-panel-muted">Date</span>
          <input
            type="date"
            value={settings.date}
            min="2019-01-01"
            onChange={(event) => onSettingsChange({ ...settings, date: event.target.value })}
            className="rounded-md border border-panel-border bg-white/5 px-2 py-1.5 outline-none"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-panel-muted">Time (UTC)</span>
          <input
            type="time"
            value={settings.time}
            onChange={(event) => onSettingsChange({ ...settings, time: event.target.value })}
            className="rounded-md border border-panel-border bg-white/5 px-2 py-1.5 outline-none"
          />
        </label>
        <label className="col-span-2 flex flex-col gap-1">
          <span className="text-panel-muted">Granularity</span>
          <select
            value={settings.granularity}
            onChange={(event) =>
              onSettingsChange({ ...settings, granularity: Number(event.target.value) })
            }
            className="rounded-md border border-panel-border bg-white/5 px-2 py-1.5 outline-none"
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
        disabled={busy}
        className="mt-3 flex w-full items-center justify-center gap-2 rounded-md bg-brand px-3 py-2 text-xs font-medium text-brand-foreground disabled:opacity-60"
      >
        {busy ? <Loader2 className="size-3.5 animate-spin" /> : null}
        {busy ? "Working…" : "Run analysis for current view"}
      </button>

      {phase !== "idle" ? (
        <ul className="mt-3 space-y-1 text-xs">
          <Step done={phase !== "submitting"} active={phase === "submitting"} label="Request submitted" />
          <Step
            done={phase === "completed"}
            active={phase === "processing"}
            label={statusText ?? "Processing FortyGuard data"}
          />
          <Step
            done={phase === "completed"}
            active={false}
            label={
              phase === "completed" && tileCount !== null
                ? `Temperature layer ready (${tileCount} tiles)`
                : "Preparing map layer"
            }
          />
        </ul>
      ) : null}

      {error ? <p className="mt-2 text-xs text-destructive">{error}</p> : null}
      <p className="mt-3 text-[10px] text-panel-muted">
        The map stays fully interactive while an analysis runs.
      </p>
    </div>
  );
}

function Step({ done, active, label }: { done: boolean; active: boolean; label: string }) {
  return (
    <li className="flex items-center gap-2">
      <span className={done ? "text-brand" : active ? "text-panel-foreground" : "text-panel-muted"}>
        {done ? "✓" : active ? "◉" : "○"}
      </span>
      <span className={done || active ? "" : "text-panel-muted"}>{label}</span>
    </li>
  );
}
