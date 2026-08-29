import type { AreaInfo } from "@/services/analysis";
import type { DrawnShape } from "@/components/Map/DrawTools";

const KIND_LABEL: Record<DrawnShape["kind"], string> = {
  polygon: "Polygon",
  rectangle: "Rectangle",
  circle: "Circle",
  point: "Point",
};

/** Pure geometry — computed locally, no FortyGuard call involved. */
export function AreaSummary({ shape, area }: { shape: DrawnShape; area: AreaInfo | null }) {
  if (!area) return null;
  return (
    <div className="fg-panel w-[min(20rem,calc(100vw-2rem))] p-3 text-xs">
      <div className="flex items-center justify-between">
        <p className="text-[10px] uppercase tracking-widest text-panel-muted">Area details</p>
        <span className="rounded-full border border-panel-border px-2 py-0.5 text-[10px]">
          {KIND_LABEL[shape.kind]}
        </span>
      </div>
      <dl className="mt-2 grid grid-cols-2 gap-y-1">
        <Row label="Area" value={`${area.value.toFixed(2)} km² · ${area.squareMiles.toFixed(2)} mi²`} />
        <Row
          label="Dimensions"
          value={`${area.dimensions.widthKm.toFixed(2)} × ${area.dimensions.heightKm.toFixed(2)} km`}
        />
        <Row
          label="Center"
          value={`${area.center.latitude.toFixed(5)}, ${area.center.longitude.toFixed(5)}`}
        />
        <Row label="Vertices" value={String(area.vertices)} />
        {shape.radiusMetres ? (
          <Row label="Radius" value={`${(shape.radiusMetres / 1000).toFixed(2)} km`} />
        ) : null}
      </dl>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <>
      <dt className="text-panel-muted">{label}</dt>
      <dd className="text-right font-mono text-[11px]">{value}</dd>
    </>
  );
}
