import { useMap } from "react-leaflet";
import { useEffect } from "react";

/**
 * Explicit stacking order:
 * base tiles -> california mask -> FortyGuard data -> boundary -> roads/labels
 */
export const PANES = {
  mask: "fg-mask",
  data: "fg-data",
  boundary: "fg-boundary",
  labels: "fg-labels",
} as const;

const Z = {
  [PANES.mask]: 410,
  [PANES.data]: 420,
  [PANES.boundary]: 430,
  [PANES.labels]: 440,
};

export function MapPanes() {
  const map = useMap();
  useEffect(() => {
    for (const [name, zIndex] of Object.entries(Z)) {
      const pane = map.getPane(name) ?? map.createPane(name);
      pane.style.zIndex = String(zIndex);
      if (name === PANES.labels || name === PANES.mask || name === PANES.boundary) {
        pane.style.pointerEvents = "none";
      }
    }
  }, [map]);
  return null;
}
