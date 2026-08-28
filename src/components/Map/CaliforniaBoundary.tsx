import { GeoJSON } from "react-leaflet";
import { californiaFeature } from "@/data/california";

/** Real California boundary from the public state GeoJSON dataset. */
export function CaliforniaBoundary() {
  return (
    <GeoJSON
      data={californiaFeature}
      interactive={false}
      style={{
        color: "#f2c14e",
        weight: 1.6,
        opacity: 0.9,
        fill: false,
      }}
    />
  );
}
