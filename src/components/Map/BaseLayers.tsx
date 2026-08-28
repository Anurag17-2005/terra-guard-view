import { TileLayer } from "react-leaflet";
import { MAP_CONFIG, type BaseMapType } from "@/config/mapConfig";
import { PANES } from "./MapPanes";

/**
 * Base imagery + the transparent reference overlay that keeps roads and place
 * labels readable in satellite mode (and above future data layers).
 */
export function BaseLayers({ baseMap }: { baseMap: BaseMapType }) {
  if (baseMap === "satellite") {
    return (
      <>
        <TileLayer
          key="satellite"
          url={MAP_CONFIG.satellite.url}
          attribution={MAP_CONFIG.satellite.attribution}
          maxZoom={MAP_CONFIG.satellite.maxZoom}
        />
        {/* Roads / highways, kept faint so imagery stays visible */}
        <TileLayer
          key="satellite-roads"
          pane={PANES.labels}
          url={MAP_CONFIG.transportOverlay.url}
          attribution={MAP_CONFIG.transportOverlay.attribution}
          maxZoom={MAP_CONFIG.transportOverlay.maxZoom}
          opacity={0.25}
        />
        {/* Place names / boundary labels */}
        <TileLayer
          key="satellite-labels"
          pane={PANES.labels}
          url={MAP_CONFIG.referenceOverlay.url}
          attribution={MAP_CONFIG.referenceOverlay.attribution}
          maxZoom={MAP_CONFIG.referenceOverlay.maxZoom}
          opacity={0.9}
        />
      </>
    );
  }

  return (
    <>
      <TileLayer
        key="street"
        url={MAP_CONFIG.street.url}
        attribution={MAP_CONFIG.street.attribution}
        maxZoom={MAP_CONFIG.street.maxZoom}
      />
      {/* Labels stay on top of any FortyGuard data layer */}
      <TileLayer
        key="street-labels"
        pane={PANES.labels}
        url={MAP_CONFIG.referenceOverlay.url}
        attribution={MAP_CONFIG.referenceOverlay.attribution}
        maxZoom={MAP_CONFIG.referenceOverlay.maxZoom}
        opacity={0.85}
      />
    </>
  );
}
