import { useEffect } from "react";
import { useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import { californiaGeometry } from "@/data/california";
import { outerRingsToLatLng } from "@/lib/geo";

/** Fits the map to the real California bounds on first load. */
export function FitCalifornia() {
  const map = useMap();
  useEffect(() => {
    const rings = outerRingsToLatLng(californiaGeometry).flat();
    if (!rings.length) return;
    map.fitBounds(L.latLngBounds(rings.map(([lat, lng]) => L.latLng(lat, lng))), {
      padding: [24, 24],
    });
  }, [map]);
  return null;
}

export function MapClickHandler({
  onClick,
}: {
  onClick: (latitude: number, longitude: number) => void;
}) {
  useMapEvents({
    click(event) {
      onClick(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export interface FlyTarget {
  latitude: number;
  longitude: number;
  zoom?: number;
  key: number;
}

export function FlyTo({ target }: { target: FlyTarget | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.latitude, target.longitude], target.zoom ?? 13, { duration: 1.1 });
  }, [map, target]);
  return null;
}

/** Reports the visible bounds so analyses can use the current viewport AOI. */
export function BoundsReporter({
  onChange,
}: {
  onChange: (bounds: { south: number; west: number; north: number; east: number }) => void;
}) {
  const map = useMap();
  useEffect(() => {
    const report = () => {
      const b = map.getBounds();
      onChange({
        south: b.getSouth(),
        west: b.getWest(),
        north: b.getNorth(),
        east: b.getEast(),
      });
    };
    report();
    map.on("moveend", report);
    return () => {
      map.off("moveend", report);
    };
  }, [map, onChange]);
  return null;
}
