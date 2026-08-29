import { Circle, Hexagon, MapPin, Square, Trash2 } from "lucide-react";
import type { DrawMode } from "@/components/Map/DrawTools";

const TOOLS: { mode: Exclude<DrawMode, "none">; label: string; icon: typeof Square }[] = [
  { mode: "polygon", label: "Polygon", icon: Hexagon },
  { mode: "rectangle", label: "Rectangle", icon: Square },
  { mode: "circle", label: "Circle", icon: Circle },
  { mode: "point", label: "Point", icon: MapPin },
];

export function DrawToolbar({
  mode,
  onModeChange,
  hasShape,
  onClear,
  draftVertices,
}: {
  mode: DrawMode;
  onModeChange: (mode: DrawMode) => void;
  hasShape: boolean;
  onClear: () => void;
  draftVertices: number;
}) {
  return (
    <div className="fg-panel w-[min(20rem,calc(100vw-2rem))] p-3 text-sm">
      <p className="text-[10px] uppercase tracking-widest text-panel-muted">Analysis area</p>
      <div className="mt-2 grid grid-cols-4 gap-1.5">
        {TOOLS.map((tool) => {
          const active = mode === tool.mode;
          const Icon = tool.icon;
          return (
            <button
              key={tool.mode}
              type="button"
              onClick={() => onModeChange(active ? "none" : tool.mode)}
              className={`flex flex-col items-center gap-1 rounded-md border px-2 py-2 text-[10px] ${
                active
                  ? "border-brand bg-brand text-brand-foreground"
                  : "border-panel-border bg-white/5 text-panel-foreground"
              }`}
            >
              <Icon className="size-4" />
              {tool.label}
            </button>
          );
        })}
      </div>

      <div className="mt-2 flex items-center justify-between gap-2 text-[10px] text-panel-muted">
        <span>
          {mode === "polygon"
            ? `Click to add points${draftVertices ? ` (${draftVertices})` : ""} · double-click or Enter to finish`
            : mode === "rectangle" || mode === "circle"
              ? "Drag on the map to draw"
              : mode === "point"
                ? "Click a location on the map"
                : hasShape
                  ? "Area ready — configure the analysis below"
                  : "Pick a tool to define the area"}
        </span>
        {hasShape ? (
          <button
            type="button"
            onClick={onClear}
            className="flex items-center gap-1 rounded-md border border-panel-border px-2 py-1"
          >
            <Trash2 className="size-3" /> Clear
          </button>
        ) : null}
      </div>
    </div>
  );
}
