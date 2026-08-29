import type { FeatureCollection } from "geojson";
import { fortyguardHeatmap } from "@/services/fortyguard/heatmap";
import { fortyguardStatus } from "@/services/fortyguard/status";
import { ANALYTIC_TYPE, requiresThreshold, valueUnit } from "./analytics";
import { getCachedAnalysis, requestSignature, saveAnalysisResult, analysisStore } from "./cache";
import { calculatePolygonArea, firstPolygon, toFeatureCollection } from "./geometry";
import { normalizeStats } from "./stats";
import { temporalContext, toFortyGuardDateTime } from "./temporal";
import { validateAnalysisRequest } from "./validation";
import type { AnalysisRequest, AnalysisResult, AnalysisSuccess } from "./types";

export * from "./types";
export * from "./analytics";
export * from "./geometry";
export * from "./temporal";
export * from "./validation";
export { requestSignature, getCachedAnalysis, saveAnalysisResult, analysisStore } from "./cache";
export { normalizeStats } from "./stats";

export interface AnalyzeOptions {
  onProgress?: (stage: "validating" | "submitting" | "processing" | "rendering", detail?: string) => void;
  /** Skip the session cache and force a new API call. */
  force?: boolean;
  signal?: AbortSignal;
}

/**
 * The single entry point for running a heatmap analysis. UI and any future
 * automated caller share this method: validate -> cache -> submit -> poll ->
 * structured result. No API call happens unless validation passes.
 */
export async function analyzeHeatmap(
  request: AnalysisRequest,
  options: AnalyzeOptions = {},
): Promise<AnalysisResult> {
  const { onProgress, force, signal } = options;
  onProgress?.("validating");

  const issues = validateAnalysisRequest(request);
  if (issues.length) {
    return {
      status: "failed",
      request,
      error: {
        code: "validation_error",
        message: issues.map((issue) => `${issue.field}: ${issue.message}`).join(" "),
        userMessage: issues.map((issue) => issue.message).join(" "),
      },
    };
  }

  const signature = requestSignature(request);
  if (!force) {
    const cached = getCachedAnalysis(request);
    if (cached) return { ...cached, metadata: { ...cached.metadata, cached: true } };
  }

  const polygon = firstPolygon(request.polygon)!;
  const analyticType = ANALYTIC_TYPE[request.analysis.type];
  const dateTime = toFortyGuardDateTime(request.timeRange);
  const requestedAt = new Date().toISOString();

  try {
    onProgress?.("submitting");
    const result = await fortyguardHeatmap.run(
      {
        polygonAoi: toFeatureCollection(polygon),
        dateTime,
        granularity: request.granularity,
        analyticType,
        ...(requiresThreshold(request.analysis.type)
          ? { threshold: request.analysis.threshold, direction: request.analysis.direction }
          : {}),
      },
      {
        signal,
        onTick: (status) => onProgress?.("processing", status),
      },
    );

    onProgress?.("rendering");
    const geojson: FeatureCollection | null = result.mapData;
    const success: AnalysisSuccess = {
      status: "completed",
      request,
      activityId: result.activityId,
      area: calculatePolygonArea(request.polygon),
      statistics: normalizeStats(result.statsData, valueUnit(request.analysis.type)),
      geojson,
      metadata: {
        analyticType,
        filterType: dateTime.filter_type,
        temporalContext: temporalContext(request.timeRange),
        granularity: request.granularity,
        tileCount: geojson?.features?.length ?? 0,
        requestedAt,
        completedAt: new Date().toISOString(),
        cached: false,
        signature,
      },
    };
    saveAnalysisResult(success);
    return success;
  } catch (error) {
    const message = (error as Error).message || "The analysis could not be completed.";
    return {
      status: "failed",
      request,
      error: { code: "api_error", message, userMessage: message },
    };
  }
}

/** Direct status lookup for an activity id (agent-ready). */
export function getAnalysisStatus(activityId: string) {
  return fortyguardStatus.get(activityId);
}
