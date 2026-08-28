import { TileLayer } from "react-leaflet";
import { MAP_CONFIG, type BaseMapType } from "@/config/mapConfig";

/**
 * Base imagery + the transparent reference overlay that keeps roads and place
 * labels readable in satellite mode.
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
          url={MAP_CONFIG.transportOverlay.url}
          attribution={MAP_CONFIG.transportOverlay.attribution}
          maxZoom={MAP_CONFIG.transportOverlay.maxZoom}
          opacity={0.28}
          className="mix-blend-multiply"
        />
        {/* Place names / boundaries labels */}
        <TileLayer
          key="satellite-labels"
          url={MAP_CONFIG.referenceOverlay.url}
          attribution={MAP_CONFIG.referenceOverlay.attribution}
          maxZoom={MAP_CONFIG.referenceOverlay.maxZoom}
          opacity={0.9}
        />
      </>
    );
  }

  return (
    <TileLayer
      key="street"
      url={MAP_CONFIG.street.url}
      attribution={MAP_CONFIG.street.attribution}
      maxZoom={MAP_CONFIG.street.maxZoom}
    />
  );
}
