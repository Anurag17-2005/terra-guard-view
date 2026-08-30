# Fix polygon drawing and empty analysis results

## 1. Polygon drawing resets after the first click (confirmed bug)

Confirmed by reading the code: the drawing effect in `DrawTools` lists `onComplete` and `onVertexCountChange` in its dependency array, and `FortyGuardApp` passes a new inline `onDrawComplete` function on every render. Each polygon click calls `onVertexCountChange`, which updates state in the parent, re-renders, produces a new callback identity, and tears down the drawing effect — the cleanup clears the in-progress vertices. That is exactly the reported "second click wipes the polygon".

Fix:
- Keep the latest callbacks in refs inside `DrawTools` so the interaction effect depends only on `map` and `mode` and is never torn down mid-draw.
- Stabilise the handlers passed from `FortyGuardApp` with `useCallback` as a second layer of safety.
- Also keep the polygon draft drawn from a ref-backed layer so re-renders never clear the preview.

## 2. Empty results (tiles 0, everything unavailable)

Not yet confirmed — the pipeline code reads `map_data`/`stats_data` correctly, so the cause is either the polygon bug above producing a degenerate area, or the API genuinely returning an empty grid for that area/time. Steps, in order:

1. Run one live analysis against the real API with a known-good small area and log the raw `status` and `result` keys, so we see whether `map_data` comes back empty or under a different shape.
2. Based on that single observation:
   - If the response is empty for the requested area, show an explicit "No tiles returned for this area/time" message instead of silently rendering zeros, and surface the API's own message.
   - If the response shape differs from what the parser expects, correct the parsing in `src/services/analysis/index.ts` / `stats.ts`.
3. Show the failure reason in the analysis panel when a run fails, instead of leaving the result section reading "unavailable".

No redesign of the map, no new dependencies, and only one live API call for verification.

## Files touched

- `src/components/Map/DrawTools.tsx` — ref-stable handlers, draft preview survives re-renders.
- `src/components/FortyGuardApp.tsx` — memoised draw callbacks.
- `src/components/AnalysisPanel.tsx` — clear empty-result / error messaging.
- `src/services/analysis/index.ts` (only if the live check shows a parsing mismatch).
