import type { BaseMapType } from "@/config/mapConfig";
import { cn } from "@/lib/utils";

export interface LayerState {
  mask: boolean;
  boundary: boolean;
  temperature: boolean;
}

export function MapControls({
  baseMap,
  onBaseMapChange,
  layers,
  onLayersChange,
  temperatureAvailable,
}: {
  baseMap: BaseMapType;
  onBaseMapChange: (value: BaseMapType) => void;
  layers: LayerState;
  onLayersChange: (value: LayerState) => void;
  temperatureAvailable: boolean;
}) {
  const toggle = (key: keyof LayerState) =>
    onLayersChange({ ...layers, [key]: !layers[key] });

  return (
    <div className="flex flex-col items-end gap-2">
      <div className="fg-panel flex overflow-hidden p-1 text-xs font-medium">
        {(["map", "satellite"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => onBaseMapChange(value)}
            className={cn(
              "rounded-md px-3 py-1.5 capitalize transition-colors",
              baseMap === value
                ? "bg-brand text-brand-foreground"
                : "text-panel-muted hover:text-panel-foreground",
            )}
          >
            {value}
          </button>
        ))}
      </div>

      <div className="fg-panel w-44 p-3 text-xs">
        <p className="mb-2 text-[10px] uppercase tracking-widest text-panel-muted">Layers</p>
        <LayerToggle label="California mask" checked={layers.mask} onChange={() => toggle("mask")} />
        <LayerToggle
          label="State boundary"
          checked={layers.boundary}
          onChange={() => toggle("boundary")}
        />
        <LayerToggle
          label="Temperature"
          checked={layers.temperature}
          onChange={() => toggle("temperature")}
          disabled={!temperatureAvailable}
          hint={temperatureAvailable ? undefined : "Run an analysis"}
        />
      </div>
    </div>
  );
}

function LayerToggle({
  label,
  checked,
  onChange,
  disabled,
  hint,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  hint?: string | undefined;
}) {
  return (
    <label
      className={cn(
        "flex items-center justify-between gap-2 py-1.5",
        disabled ? "opacity-45" : "cursor-pointer",
      )}
    >
      <span className="flex flex-col">
        {label}
        {hint ? <span className="text-[10px] text-panel-muted">{hint}</span> : null}
      </span>
      <input
        type="checkbox"
        className="accent-brand"
        checked={checked && !disabled}
        disabled={disabled}
        onChange={onChange}
      />
    </label>
  );
}
