/**
 * Central map configuration.
 * Swap tile providers here — no component hardcodes a tile URL.
 */
export const MAP_CONFIG = {
  defaultCenter: [36.7783, -119.4179] as [number, number],
  defaultZoom: 6,
  minZoom: 4,
  maxZoom: 18,

  street: {
    url: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19,
  },

  /**
   * Satellite imagery provider. Kept isolated so it can be replaced.
   * Esri World Imagery is publicly accessible; imagery capture dates vary by
   * region and are NOT real-time.
   */
  satellite: {
    url: "https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
    attribution:
      "Imagery &copy; Esri, Maxar, Earthstar Geographics and the GIS User Community (capture dates vary)",
    maxZoom: 19,
  },

  /** Transparent roads/labels overlay used on top of satellite imagery. */
  referenceOverlay: {
    url: "https://{s}.basemaps.cartocdn.com/rastertiles/voyager_only_labels/{z}/{x}/{y}{r}.png",
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
  },
  transportOverlay: {
    url: "https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png",
    attribution: "Roads &copy; OpenStreetMap contributors, Humanitarian OSM Team",
    maxZoom: 19,
  },
} as const;

export type BaseMapType = "map" | "satellite";
