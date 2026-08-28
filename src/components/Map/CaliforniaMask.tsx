import { useMemo } from "react";
import { Polygon } from "react-leaflet";
import { californiaGeometry } from "@/data/california";
import { outerRingsToLatLng, type LatLng } from "@/lib/geo";
import { PANES } from "./MapPanes";

/** World rectangle used as the mask's outer ring. */
const WORLD: LatLng[] = [
  [-89.9, -179.9],
  [-89.9, 179.9],
  [89.9, 179.9],
  [89.9, -179.9],
];

/**
 * Dark overlay across the whole world with California punched out as holes,
 * so California itself is never covered. Works over any base layer.
 */
export function CaliforniaMask() {
  const rings = useMemo(() => {
    const holes = outerRingsToLatLng(californiaGeometry);
    return [WORLD, ...holes];
  }, []);

  return (
    <Polygon
      pane={PANES.mask}
      positions={rings}
      interactive={false}
      pathOptions={{
        color: "transparent",
        weight: 0,
        fillColor: "#0b1220",
        fillOpacity: 0.72,
        fillRule: "evenodd",
      }}
    />
  );
}
