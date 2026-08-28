import { useEffect, useRef, useState } from "react";
import { Loader2, MapPin, Search } from "lucide-react";
import { geocodingService, parseCoordinates, type Place } from "@/services/geocoding";

export function SearchPanel({
  onSelectPlace,
  onSelectCoordinates,
}: {
  onSelectPlace: (place: Place) => void;
  onSelectCoordinates: (latitude: number, longitude: number) => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const coords = parseCoordinates(query);

  useEffect(() => {
    if (coords || query.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const found = await geocodingService.search(query.trim());
        if (!cancelled) {
          setResults(found);
          setError(null);
          setOpen(true);
        }
      } catch {
        if (!cancelled) setError("Place search is temporarily unavailable.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }, 350);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query, coords]);

  useEffect(() => {
    const onDocClick = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  const submitCoordinates = () => {
    if (!coords) return;
    onSelectCoordinates(coords.latitude, coords.longitude);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="w-[min(22rem,calc(100vw-2rem))]">
      <div className="fg-panel flex items-center gap-2 px-3 py-2">
        <Search className="size-4 shrink-0 text-panel-muted" />
        <input
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              if (coords) submitCoordinates();
              else if (results[0]) onSelectPlace(results[0]);
            }
          }}
          placeholder="Search a place or 37.7749, -122.4194"
          className="w-full bg-transparent text-sm outline-none placeholder:text-panel-muted"
          aria-label="Search places or coordinates"
        />
        {loading ? <Loader2 className="size-4 animate-spin text-panel-muted" /> : null}
      </div>

      {open && (coords || results.length > 0 || error) ? (
        <div className="fg-panel mt-2 max-h-80 overflow-y-auto p-1 text-sm">
          {coords ? (
            <button
              type="button"
              onClick={submitCoordinates}
              className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-white/10"
            >
              <MapPin className="mt-0.5 size-4 text-brand" />
              <span>
                <span className="block font-medium">Go to coordinates</span>
                <span className="block font-mono text-xs text-panel-muted">
                  {coords.latitude.toFixed(5)}, {coords.longitude.toFixed(5)}
                </span>
              </span>
            </button>
          ) : null}

          {error ? <p className="px-3 py-2 text-xs text-panel-muted">{error}</p> : null}

          {results.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => {
                onSelectPlace(place);
                setOpen(false);
              }}
              className="flex w-full items-start gap-2 rounded-md px-2 py-2 text-left hover:bg-white/10"
            >
              <MapPin className="mt-0.5 size-4 shrink-0 text-panel-muted" />
              <span className="min-w-0">
                <span className="block truncate font-medium">{place.name}</span>
                <span className="block truncate text-xs text-panel-muted">{place.displayName}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
