import type { AnalysisRequest, AnalysisSuccess } from "./types";
import { ANALYTIC_TYPE, requiresThreshold } from "./analytics";
import { firstPolygon } from "./geometry";

/** Stable, deterministic signature of everything that affects the API result. */
export function requestSignature(request: AnalysisRequest): string {
  const polygon = firstPolygon(request.polygon);
  const coords = (polygon?.geometry.coordinates ?? []).map((ring) =>
    ring.map(([lng, lat]) => `${Number(lng).toFixed(6)},${Number(lat).toFixed(6)}`).join(";"),
  );
  const needsThreshold = requiresThreshold(request.analysis.type);
  const parts = [
    coords.join("|"),
    request.timeRange.mode,
    request.timeRange.startDate,
    request.timeRange.endDate ?? "",
    request.timeRange.startTime ?? "",
    request.timeRange.endTime ?? "",
    ANALYTIC_TYPE[request.analysis.type],
    needsThreshold ? String(request.analysis.threshold ?? "") : "",
    needsThreshold ? request.analysis.direction ?? "" : "",
    String(request.granularity),
  ];
  return hash(parts.join("::"));
}

function hash(input: string): string {
  // FNV-1a — deterministic and dependency-free.
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i += 1) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193) >>> 0;
  }
  return `fg_${h.toString(16)}_${input.length.toString(16)}`;
}

/**
 * Session cache. The interface is deliberately storage-agnostic so a persistent
 * backend (database / localStorage) can be swapped in later.
 */
export interface AnalysisStore {
  get(signature: string): AnalysisSuccess | null;
  set(signature: string, result: AnalysisSuccess): void;
  keys(): string[];
  clear(): void;
}

function createMemoryStore(limit = 20): AnalysisStore {
  const map = new Map<string, AnalysisSuccess>();
  return {
    get: (signature) => map.get(signature) ?? null,
    set: (signature, result) => {
      map.set(signature, result);
      while (map.size > limit) {
        const oldest = map.keys().next().value;
        if (oldest === undefined) break;
        map.delete(oldest);
      }
    },
    keys: () => [...map.keys()],
    clear: () => map.clear(),
  };
}

export const analysisStore: AnalysisStore = createMemoryStore();

export function getCachedAnalysis(request: AnalysisRequest): AnalysisSuccess | null {
  return analysisStore.get(requestSignature(request));
}

export function saveAnalysisResult(result: AnalysisSuccess): void {
  analysisStore.set(result.metadata.signature, result);
}
