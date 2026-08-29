import "leaflet/dist/leaflet.css";
import { MapContainer, ZoomControl } from "react-leaflet";
import type { FeatureCollection } from "geojson";
import { MAP_CONFIG, type BaseMapType } from "@/config/mapConfig";
import { MapPanes } from "./MapPanes";
import { BaseLayers } from "./BaseLayers";
import { CaliforniaMask } from "./CaliforniaMask";
import { CaliforniaBoundary } from "./CaliforniaBoundary";
import { TemperatureLayer } from "./TemperatureLayer";
import { SelectedMarker } from "./SelectedMarker";
import { DrawTools, type DrawMode, type DrawnShape } from "./DrawTools";
import {
  BoundsReporter,
  FitCalifornia,
  FlyTo,
  MapClickHandler,
  type FlyTarget,
} from "./MapInteractions";

export interface MapViewProps {
  baseMap: BaseMapType;
  layers: { mask: boolean; boundary: boolean; temperature: boolean };
  selected: { latitude: number; longitude: number; label?: string | undefined } | null;
  flyTarget: FlyTarget | null;
  heatmap: FeatureCollection | null;
  heatmapRange: { min: number; max: number } | null;
  drawMode: DrawMode;
  drawnShape: DrawnShape | null;
  onDrawComplete: (shape: DrawnShape) => void;
  onDraftVertices?: (count: number) => void;
  onMapClick: (latitude: number, longitude: number) => void;
  onBoundsChange: (bounds: { south: number; west: number; north: number; east: number }) => void;
  onTileSelect: (payload: {
    temperature: number | null;
    latitude: number;
    longitude: number;
  }) => void;
}

export function MapView(props: MapViewProps) {
  const { baseMap, layers, selected, flyTarget, heatmap, heatmapRange, drawMode, drawnShape } =
    props;

  return (
    <MapContainer
      center={MAP_CONFIG.defaultCenter}
      zoom={MAP_CONFIG.defaultZoom}
      minZoom={MAP_CONFIG.minZoom}
      maxZoom={MAP_CONFIG.maxZoom}
      zoomControl={false}
      scrollWheelZoom
      className="h-full w-full"
    >
      <MapPanes />
      <FitCalifornia />
      <ZoomControl position="bottomright" />

      <BaseLayers baseMap={baseMap} />
      {layers.mask ? <CaliforniaMask /> : null}
      {layers.temperature && heatmap && heatmapRange ? (
        <TemperatureLayer data={heatmap} range={heatmapRange} onSelectTile={props.onTileSelect} />
      ) : null}
      {layers.boundary ? <CaliforniaBoundary /> : null}

      <DrawTools
        mode={drawMode}
        shape={drawnShape}
        onComplete={props.onDrawComplete}
        {...(props.onDraftVertices ? { onVertexCountChange: props.onDraftVertices } : {})}
      />

      {selected ? (
        <SelectedMarker
          latitude={selected.latitude}
          longitude={selected.longitude}
          label={selected.label}
        />
      ) : null}

      {drawMode === "none" ? <MapClickHandler onClick={props.onMapClick} /> : null}
      <FlyTo target={flyTarget} />
      <BoundsReporter onChange={props.onBoundsChange} />
    </MapContainer>
  );
}
