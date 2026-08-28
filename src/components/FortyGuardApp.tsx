import { useCallback, useMemo, useRef, useState } from "react";
import type { FeatureCollection } from "geojson";
import type { BaseMapType } from "@/config/mapConfig";
import { MapView } from "@/components/Map/MapView";
import type { FlyTarget } from "@/components/Map/MapInteractions";
import { MapControls, type LayerState } from "@/components/MapControls";
import { SearchPanel } from "@/components/SearchPanel";
import { TemperatureLegend } from "@/components/TemperatureLegend";
import { AnalysisPanel, type AnalysisSettings } from "@/components/AnalysisPanel";
import { LocationDetails, type EnvState, type SelectionState } from "@/components/LocationDetails";
import { geocodingService, type Place } from "@/services/geocoding";
import { fortyguardHeatmap, temperatureRange } from "@/services/fortyguard/heatmap";
import { fortyguardEnvironmental } from "@/services/fortyguard/environmental";
import type { AnalysisPhase } from "@/services/fortyguard/types";
import { boundsToAoi } from "@/lib/geo";

interface Bounds {
  south: number;
  west: number;
  north: number;
  east: number;
}

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
  const boundsRef = useRef<Bounds | null>(null);

  const [heatmap, setHeatmap] = useState<FeatureCollection | null>(null);
  const [phase, setPhase] = useState<AnalysisPhase>("idle");
  const [statusText, setStatusText] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  const [activityId, setActivityId] = useState<string | null>(null);
  const [settings, setSettings] = useState<AnalysisSettings>({
    date: todayUtc(),
    time: "14:00",
    granularity: 100,
  });

  const [env, setEnv] = useState<EnvState>({ status: "idle", data: null, error: null });

  const range = useMemo(() => (heatmap ? temperatureRange(heatmap) : null), [heatmap]);

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

  const runAnalysis = async () => {
    const bounds = boundsRef.current;
    if (!bounds) return;
    setPhase("submitting");
    setAnalysisError(null);
    setStatusText(null);

    try {
      const result = await fortyguardHeatmap.run(
        {
          polygonAoi: boundsToAoi(bounds.south, bounds.west, bounds.north, bounds.east),
          startDate: settings.date,
          startTime: settings.time,
          granularity: settings.granularity,
          analyticType: "tcm",
        },
        {
          onTick: (status) => {
            setPhase("processing");
            setStatusText(`FortyGuard status: ${status}`);
          },
        },
      );
      setActivityId(result.activityId);
      setHeatmap(result.mapData);
      setLayers((current) => ({ ...current, temperature: true }));
      setPhase(result.mapData ? "completed" : "failed");
      if (!result.mapData) setAnalysisError("FortyGuard returned no map data for this request.");
    } catch (error) {
      setPhase("failed");
      setAnalysisError((error as Error).message);
    }
  };

  const loadEnvironmental = async () => {
    if (!selection || selection.temperature === null) return;
    setEnv({ status: "loading", data: null, error: null });
    try {
      const data = await fortyguardEnvironmental.run({
        latitude: selection.latitude,
        longitude: selection.longitude,
        temperature: selection.temperature,
        startDate: settings.date,
        startTime: settings.time,
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
        onMapClick={(latitude, longitude) => selectPoint(latitude, longitude)}
        onBoundsChange={(bounds) => {
          boundsRef.current = bounds;
        }}
        onTileSelect={({ temperature, latitude, longitude }) =>
          selectPoint(latitude, longitude, { temperature, activityId })
        }
      />

      {/* Top-left: brand + search */}
      <div className="pointer-events-none absolute left-4 top-4 z-[1000] flex flex-col gap-2">
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
          <AnalysisPanel
            settings={settings}
            onSettingsChange={setSettings}
            phase={phase}
            statusText={statusText}
            error={analysisError}
            tileCount={heatmap?.features?.length ?? null}
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
