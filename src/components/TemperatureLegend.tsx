import { TEMPERATURE_RAMP } from "@/lib/temperatureColor";

/** Legend built from the range of the data actually rendered. */
export function TemperatureLegend({
  min,
  max,
  unit = "°C",
  title = "Temperature (observed range)",
}: {
  min: number;
  max: number;
  unit?: string;
  title?: string;
}) {
  const steps = 5;
  const ticks = Array.from({ length: steps }, (_, i) => min + ((max - min) * i) / (steps - 1));

  return (
    <div className="fg-panel w-64 p-3">
      <p className="text-[10px] uppercase tracking-widest text-panel-muted">{title}</p>
      <div className="mt-2 flex h-2 overflow-hidden rounded-full">
        {TEMPERATURE_RAMP.map((color) => (
          <span key={color} className="flex-1" style={{ backgroundColor: color }} />
        ))}
      </div>
      <div className="mt-1.5 flex justify-between font-mono text-[10px] text-panel-muted">
        {ticks.map((tick, i) => (
          <span key={i}>
            {tick.toFixed(1)}
            {unit === "°C" ? "°" : ""}
          </span>
        ))}
      </div>
      <p className="mt-2 text-[10px] text-panel-muted">
        Range reflects the tiles currently displayed{unit === "°C" ? "" : ` (${unit})`}, not
        California-wide extremes.
      </p>
    </div>
  );
}
