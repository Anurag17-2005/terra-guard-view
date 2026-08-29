import type { AnalysisRequest, ValidationIssue } from "./types";
import { calculatePolygonArea, isValidPolygon } from "./geometry";
import { validateTimeRange } from "./temporal";
import { requiresThreshold } from "./analytics";

/** Documented plan limit for the Premium heatmap tier. */
export const MAX_AREA_SQ_MILES = 50;
export const GRANULARITIES = [60, 80, 100] as const;

/** California-ish envelope; the product is scoped to California. */
const BOUNDS = { south: 32.0, north: 42.3, west: -125.0, east: -113.8 };

export function validateAnalysisRequest(request: AnalysisRequest): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  if (!request.polygon || !isValidPolygon(request.polygon)) {
    issues.push({ field: "polygon", message: "Draw a valid analysis area on the map first." });
  } else {
    const area = calculatePolygonArea(request.polygon);
    if (!area || area.value <= 0) {
      issues.push({ field: "polygon", message: "The drawn area is too small to analyze." });
    } else if (area.squareMiles > MAX_AREA_SQ_MILES) {
      issues.push({
        field: "polygon",
        message: `Area is ${area.squareMiles.toFixed(1)} mi² — the heatmap plan limit is ${MAX_AREA_SQ_MILES} mi². Draw a smaller area.`,
      });
    }
    const center = area?.center;
    if (
      center &&
      (center.latitude < BOUNDS.south ||
        center.latitude > BOUNDS.north ||
        center.longitude < BOUNDS.west ||
        center.longitude > BOUNDS.east)
    ) {
      issues.push({ field: "polygon", message: "The area must be within California." });
    }
  }

  issues.push(...validateTimeRange(request.timeRange));

  if (!GRANULARITIES.includes(request.granularity)) {
    issues.push({ field: "granularity", message: "Granularity must be 60 m, 80 m or 100 m." });
  }

  if (requiresThreshold(request.analysis.type)) {
    const threshold = request.analysis.threshold;
    if (typeof threshold !== "number" || !Number.isFinite(threshold)) {
      issues.push({ field: "threshold", message: "Enter a numeric temperature threshold in °C." });
    } else if (threshold < -60 || threshold > 70) {
      issues.push({ field: "threshold", message: "Threshold must be between -60 °C and 70 °C." });
    }
    if (request.analysis.direction !== "above" && request.analysis.direction !== "below") {
      issues.push({ field: "direction", message: "Choose a direction (above or below)." });
    }
  }

  return issues;
}
