import { useEffect, useRef, useState } from "react";
import { useMap } from "react-leaflet";
import L from "leaflet";
import type { Feature, Polygon } from "geojson";
import { PANES } from "./MapPanes";
import { circleToPolygon, pointToPolygon, rectangleToPolygon } from "@/services/analysis/geometry";

export type DrawMode = "none" | "polygon" | "rectangle" | "circle" | "point";

export interface DrawnShape {
  kind: Exclude<DrawMode, "none">;
  polygon: Feature<Polygon>;
  /** Circle only. */
  radiusMetres?: number;
}

/**
 * Lightweight drawing layer built on plain Leaflet handlers — no extra
 * dependency, and the existing map assembly is untouched.
 */
export function DrawTools({
  mode,
  shape,
  onComplete,
  onVertexCountChange,
}: {
  mode: DrawMode;
  shape: DrawnShape | null;
  onComplete: (shape: DrawnShape) => void;
  onVertexCountChange?: (count: number) => void;
}) {
  const map = useMap();
  const layerRef = useRef<L.LayerGroup | null>(null);
  const draftRef = useRef<L.LatLng[]>([]);
  const [, force] = useState(0);

  // Persistent group for the committed shape + in-progress drawing.
  useEffect(() => {
    const group = L.layerGroup([], { pane: PANES.boundary }).addTo(map);
    layerRef.current = group;
    return () => {
      group.remove();
      layerRef.current = null;
    };
  }, [map]);

  // Render the committed shape.
  useEffect(() => {
    const group = layerRef.current;
    if (!group) return;
    group.clearLayers();
    if (!shape) return;
    L.geoJSON(shape.polygon, {
      pane: PANES.boundary,
      style: {
        color: "#38bdf8",
        weight: 2,
        fillColor: "#38bdf8",
        fillOpacity: 0.08,
        dashArray: "4 4",
      },
    }).addTo(group);
  }, [shape]);

  // Drawing interactions.
  useEffect(() => {
    if (mode === "none") return;

    const container = map.getContainer();
    container.style.cursor = "crosshair";
    map.doubleClickZoom.disable();

    const preview = L.layerGroup([], { pane: PANES.boundary }).addTo(map);
    let dragStart: L.LatLng | null = null;

    const clearPreview = () => preview.clearLayers();

    const drawDraft = () => {
      clearPreview();
      const points = draftRef.current;
      if (!points.length) return;
      L.polyline([...points], { color: "#38bdf8", weight: 2, dashArray: "4 4" }).addTo(preview);
      points.forEach((point) =>
        L.circleMarker(point, { radius: 4, color: "#38bdf8", fillOpacity: 1 }).addTo(preview),
      );
    };

    const finishPolygon = () => {
      const points = draftRef.current;
      if (points.length < 3) return;
      const ring = points.map((p) => [p.lng, p.lat] as [number, number]);
      ring.push(ring[0]!);
      draftRef.current = [];
      onVertexCountChange?.(0);
      clearPreview();
      onComplete({
        kind: "polygon",
        polygon: {
          type: "Feature",
          properties: {},
          geometry: { type: "Polygon", coordinates: [ring] },
        },
      });
    };

    const onClick = (event: L.LeafletMouseEvent) => {
      if (mode === "point") {
        onComplete({
          kind: "point",
          polygon: pointToPolygon(event.latlng.lat, event.latlng.lng),
        });
        return;
      }
      if (mode !== "polygon") return;
      draftRef.current = [...draftRef.current, event.latlng];
      onVertexCountChange?.(draftRef.current.length);
      drawDraft();
      force((n) => n + 1);
    };

    const onDblClick = () => {
      if (mode === "polygon") finishPolygon();
    };

    const onMouseDown = (event: L.LeafletMouseEvent) => {
      if (mode !== "rectangle" && mode !== "circle") return;
      dragStart = event.latlng;
      map.dragging.disable();
    };

    const onMouseMove = (event: L.LeafletMouseEvent) => {
      if (!dragStart) {
        if (mode === "polygon" && draftRef.current.length) {
          drawDraft();
          L.polyline([draftRef.current[draftRef.current.length - 1]!, event.latlng], {
            color: "#38bdf8",
            weight: 1,
            dashArray: "2 4",
          }).addTo(preview);
        }
        return;
      }
      clearPreview();
      if (mode === "rectangle") {
        L.rectangle(L.latLngBounds(dragStart, event.latlng), {
          color: "#38bdf8",
          weight: 2,
          fillOpacity: 0.08,
        }).addTo(preview);
      } else {
        L.circle(dragStart, {
          radius: dragStart.distanceTo(event.latlng),
          color: "#38bdf8",
          weight: 2,
          fillOpacity: 0.08,
        }).addTo(preview);
      }
    };

    const onMouseUp = (event: L.LeafletMouseEvent) => {
      if (!dragStart) return;
      const start = dragStart;
      dragStart = null;
      map.dragging.enable();
      clearPreview();

      if (mode === "rectangle") {
        const bounds = L.latLngBounds(start, event.latlng);
        if (bounds.getNorth() === bounds.getSouth() || bounds.getEast() === bounds.getWest()) return;
        onComplete({
          kind: "rectangle",
          polygon: rectangleToPolygon(
            bounds.getSouth(),
            bounds.getWest(),
            bounds.getNorth(),
            bounds.getEast(),
          ),
        });
      } else if (mode === "circle") {
        const radius = start.distanceTo(event.latlng);
        if (radius < 10) return;
        onComplete({
          kind: "circle",
          radiusMetres: radius,
          polygon: circleToPolygon(start.lat, start.lng, radius),
        });
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Enter") finishPolygon();
      if (event.key === "Escape") {
        draftRef.current = [];
        onVertexCountChange?.(0);
        clearPreview();
      }
    };

    map.on("click", onClick);
    map.on("dblclick", onDblClick);
    map.on("mousedown", onMouseDown);
    map.on("mousemove", onMouseMove);
    map.on("mouseup", onMouseUp);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      map.off("click", onClick);
      map.off("dblclick", onDblClick);
      map.off("mousedown", onMouseDown);
      map.off("mousemove", onMouseMove);
      map.off("mouseup", onMouseUp);
      window.removeEventListener("keydown", onKeyDown);
      preview.remove();
      draftRef.current = [];
      map.dragging.enable();
      map.doubleClickZoom.enable();
      container.style.cursor = "";
    };
  }, [map, mode, onComplete, onVertexCountChange]);

  return null;
}
