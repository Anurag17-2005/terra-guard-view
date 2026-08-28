import { useMemo } from "react";
import { GeoJSON } from "react-leaflet";
import type { Feature, FeatureCollection } from "geojson";
import type { Layer, PathOptions } from "leaflet";
import { readTemperature } from "@/services/fortyguard/heatmap";
import { getTemperatureColor } from "@/lib/temperatureColor";

/**
 * Renders the FortyGuard heatmap GeoJSON polygon tiles directly — no
 * conversion to synthetic points, no invented values.
 */
export function TemperatureLayer({
  data,
  range,
  onSelectTile,
}: {
  data: FeatureCollection;
  range: { min: number; max: number };
  onSelectTile: (payload: { temperature: number | null; latitude: number; longitude: number }) => void;
}) {
  const styleFn = useMemo(
    () =>
      (feature?: Feature): PathOptions => {
        const value = feature ? readTemperature(feature) : null;
        if (value === null) {
          return { fillOpacity: 0, weight: 0, color: "transparent" };
        }
        return {
          fillColor: getTemperatureColor(value, range.min, range.max),
          fillOpacity: 0.35,
          weight: 0,
          color: "transparent",
        };
      },
    [range.min, range.max],
  );

  const onEachFeature = useMemo(
    () => (feature: Feature, layer: Layer) => {
      const value = readTemperature(feature);
      layer.bindTooltip(
        `<div style="font-size:11px"><div style="opacity:.7;text-transform:uppercase;letter-spacing:.08em">Temperature</div><div style="font-size:14px;font-weight:600">${
          value === null ? "Unavailable" : `${value.toFixed(1)} °C`
        }</div></div>`,
        { sticky: true, className: "fg-tooltip", opacity: 1 },
      );

      layer.on({
        mouseover: (event) => {
          const target = event.target as Layer & { setStyle?: (o: PathOptions) => void };
          target.setStyle?.({ weight: 1.5, color: "#ffffff", fillOpacity: 0.55 });
        },
        mouseout: (event) => {
          const target = event.target as Layer & { setStyle?: (o: PathOptions) => void };
          target.setStyle?.(styleFn(feature));
        },
        click: (event) => {
          const { lat, lng } = (event as unknown as { latlng: { lat: number; lng: number } }).latlng;
          onSelectTile({ temperature: value, latitude: lat, longitude: lng });
        },
      });
    },
    [styleFn, onSelectTile],
  );

  return (
    <GeoJSON
      key={`heatmap-${data.features?.length ?? 0}-${range.min}-${range.max}`}
      data={data}
      style={styleFn}
      onEachFeature={onEachFeature}
    />
  );
}
