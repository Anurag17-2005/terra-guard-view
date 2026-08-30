import { useCallback, useMemo, useState } from "react";
import type { BaseMapType } from "@/config/mapConfig";
import { MapView } from "@/components/Map/MapView";
import type { FlyTarget } from "@/components/Map/MapInteractions";
import type { DrawMode, DrawnShape } from "@/components/Map/DrawTools";
import { MapControls, type LayerState } from "@/components/MapControls";
import { SearchPanel } from "@/components/SearchPanel";
import { DrawToolbar } from "@/components/DrawToolbar";
import { AreaSummary } from "@/components/AreaSummary";
import { TemperatureLegend } from "@/components/TemperatureLegend";
import { AnalysisPanel, type AnalysisSettings } from "@/components/AnalysisPanel";
import { LocationDetails, type EnvState, type SelectionState } from "@/components/LocationDetails";
import { geocodingService, type Place } from "@/services/geocoding";
import { temperatureRange } from "@/services/fortyguard/heatmap";
import { fortyguardEnvironmental } from "@/services/fortyguard/environmental";
import { analyzeHeatmap, calculatePolygonArea, type AnalysisResult } from "@/services/analysis";

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export default function FortyGuardApp() {
  const [baseMap, setBaseMap] = useState<BaseMapType>("map");
  const [layers, setLayers] = useState<LayerState>({
    mask: true,
    boundary: true,
    temperature: true,
  });

  const [selection, setSelection] = useState<SelectionState | null>(null);
  const [flyTarget, setFlyTarget] = useState<FlyTarget | null>(null);

  const [drawMode, setDrawMode] = useState<DrawMode>("none");
  const [shape, setShape] = useState<DrawnShape | null>(null);
  const [draftVertices, setDraftVertices] = useState(0);

  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState<string | null>(null);

  const [settings, setSettings] = useState<AnalysisSettings>({
    timeRange: { mode: "single_hour", startDate: todayUtc(), startTime: "14:00" },
    analysis: { type: "temperature" },
    granularity: 100,
  });

  const [env, setEnv] = useState<EnvState>({ status: "idle", data: null, error: null });

  const heatmap = result?.status === "completed" ? result.geojson : null;
  const activityId = result?.status === "completed" ? result.activityId : null;
  const range = useMemo(() => (heatmap ? temperatureRange(heatmap) : null), [heatmap]);
  const area = useMemo(() => (shape ? calculatePolygonArea(shape.polygon) : null), [shape]);

  const resolvePlace = useCallback(async (latitude: number, longitude: number) => {
    try {
      const place = await geocodingService.reverse(latitude, longitude);
      setSelection((current) =>
        current && current.latitude === latitude && current.longitude === longitude
          ? { ...current, place, placeLoading: false }
          : current,
      );
    } catch {
      setSelection((current) => (current ? { ...current, placeLoading: false } : current));
    }
  }, []);

  const selectPoint = useCallback(
    (latitude: number, longitude: number, extras?: Partial<SelectionState>) => {
      setEnv({ status: "idle", data: null, error: null });
      setSelection({
        latitude,
        longitude,
        place: null,
        placeLoading: true,
        temperature: null,
        activityId: null,
        ...extras,
      });
      void resolvePlace(latitude, longitude);
    },
    [resolvePlace],
  );

  const handleSelectPlace = (place: Place) => {
    setEnv({ status: "idle", data: null, error: null });
    setSelection({
      latitude: place.latitude,
      longitude: place.longitude,
      place,
      placeLoading: false,
      temperature: null,
      activityId: null,
    });
    setFlyTarget({ latitude: place.latitude, longitude: place.longitude, zoom: 13, key: Date.now() });
  };

  const handleCoordinates = (latitude: number, longitude: number) => {
    selectPoint(latitude, longitude);
    setFlyTarget({ latitude, longitude, zoom: 13, key: Date.now() });
  };

  /** API calls happen only here — an explicit user action on a drawn area. */
  const runAnalysis = async () => {
    if (!shape) return;
    setBusy(true);
    setProgress("Validating");
    const outcome = await analyzeHeatmap(
      {
        polygon: shape.polygon,
        timeRange: settings.timeRange,
        analysis: settings.analysis,
        granularity: settings.granularity,
      },
      {
        onProgress: (stage, detail) =>
          setProgress(detail ?? stage.charAt(0).toUpperCase() + stage.slice(1)),
      },
    );
    setResult(outcome);
    setBusy(false);
    setProgress(null);
    if (outcome.status === "completed") {
      setLayers((current) => ({ ...current, temperature: true }));
    }
  };

  const loadEnvironmental = async () => {
    if (!selection || selection.temperature === null) return;
    const { timeRange } = settings;
    setEnv({ status: "loading", data: null, error: null });
    try {
      const data = await fortyguardEnvironmental.run({
        latitude: selection.latitude,
        longitude: selection.longitude,
        temperature: selection.temperature,
        startDate: timeRange.startDate,
        startTime: timeRange.startTime ?? "12:00",
      });
      setEnv({ status: "ready", data, error: null });
    } catch (error) {
      setEnv({ status: "error", data: null, error: (error as Error).message });
    }
  };

  return (
    <main className="relative h-dvh w-full overflow-hidden">
      <h1 className="sr-only">FortyGuard City Intelligence — California map</h1>

      <MapView
        baseMap={baseMap}
        layers={layers}
        selected={
          selection
            ? {
                latitude: selection.latitude,
                longitude: selection.longitude,
                label: selection.place?.name,
              }
            : null
        }
        flyTarget={flyTarget}
        heatmap={heatmap}
        heatmapRange={range}
        drawMode={drawMode}
        drawnShape={shape}
        onDrawComplete={(next) => {
          setShape(next);
          setDrawMode("none");
          setDraftVertices(0);
        }}
        onDraftVertices={setDraftVertices}
        onMapClick={(latitude, longitude) => selectPoint(latitude, longitude)}
        onBoundsChange={() => {}}
        onTileSelect={({ temperature, latitude, longitude }) =>
          selectPoint(latitude, longitude, { temperature, activityId })
        }
      />

      {/* Top-left: brand, search, drawing, analysis */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex max-h-[calc(100dvh-2rem)] flex-col gap-2 overflow-y-auto">
        <div className="fg-panel pointer-events-auto flex items-center gap-2 px-3 py-2">
          <span className="size-2.5 rounded-full bg-brand" />
          <span className="text-sm font-semibold tracking-tight">FortyGuard</span>
          <span className="text-[10px] uppercase tracking-widest text-panel-muted">
            City Intelligence
          </span>
        </div>
        <div className="pointer-events-auto">
          <SearchPanel onSelectPlace={handleSelectPlace} onSelectCoordinates={handleCoordinates} />
        </div>
        <div className="pointer-events-auto">
          <DrawToolbar
            mode={drawMode}
            onModeChange={setDrawMode}
            hasShape={Boolean(shape)}
            onClear={() => {
              setShape(null);
              setResult(null);
              setDraftVertices(0);
            }}
            draftVertices={draftVertices}
          />
        </div>
        {shape ? (
          <div className="pointer-events-auto">
            <AreaSummary shape={shape} area={area} />
          </div>
        ) : null}
        <div className="pointer-events-auto">
          <AnalysisPanel
            settings={settings}
            onSettingsChange={setSettings}
            busy={busy}
            progress={progress}
            result={result}
            hasShape={Boolean(shape)}
            onRun={() => void runAnalysis()}
          />
        </div>
      </div>

      {/* Top-right: base map + layers */}
      <div className="absolute right-4 top-4 z-[1000]">
        <MapControls
          baseMap={baseMap}
          onBaseMapChange={setBaseMap}
          layers={layers}
          onLayersChange={setLayers}
          temperatureAvailable={Boolean(heatmap)}
        />
      </div>

      {/* Right: location details */}
      {selection ? (
        <div className="absolute bottom-4 right-4 z-[1000] md:bottom-auto md:top-56">
          <LocationDetails
            selection={selection}
            env={env}
            onRequestEnv={() => void loadEnvironmental()}
            onClose={() => setSelection(null)}
          />
        </div>
      ) : null}

      {/* Bottom-left: legend */}
      {layers.temperature && range ? (
        <div className="absolute bottom-6 left-4 z-[1000]">
          <TemperatureLegend min={range.min} max={range.max} />
        </div>
      ) : null}
    </main>
  );
}
