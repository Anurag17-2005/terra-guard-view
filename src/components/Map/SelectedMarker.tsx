import { Marker, Popup } from "react-leaflet";
import L from "leaflet";
import { formatCoord } from "@/lib/geo";

const pinIcon = L.divIcon({
  className: "",
  html: `<div style="width:16px;height:16px;border-radius:9999px;background:#f2c14e;border:2px solid #1a2230;box-shadow:0 0 0 4px rgba(242,193,78,0.28)"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

export function SelectedMarker({
  latitude,
  longitude,
  label,
}: {
  latitude: number;
  longitude: number;
  label?: string | undefined;
}) {
  return (
    <Marker position={[latitude, longitude]} icon={pinIcon}>
      <Popup>
        <div className="min-w-44 text-xs">
          <p className="text-[11px] uppercase tracking-widest text-panel-muted">
            Selected location
          </p>
          {label ? <p className="mt-1 font-medium">{label}</p> : null}
          <p className="mt-2 font-mono">Latitude: {formatCoord(latitude)}</p>
          <p className="font-mono">Longitude: {formatCoord(longitude)}</p>
        </div>
      </Popup>
    </Marker>
  );
}
