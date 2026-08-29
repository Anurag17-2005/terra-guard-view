import { createServerFn } from "@tanstack/react-start";
import {
  FortyGuardError,
  getActivityStatus,
  submitEnvParams,
  submitHeatmap,
  validateHeatmapDateTime,
  type HeatmapDateTime,
  type HeatmapRequestBody,
} from "./fortyguard.server";

export interface HeatmapSubmitInput {
  polygonAoi: unknown;
  dateTime: HeatmapDateTime;
  granularity: number;
  analyticType?: string;
  threshold?: number | undefined;
  direction?: string | undefined;
}

export const submitHeatmapFn = createServerFn({ method: "POST" })
  .inputValidator((data: HeatmapSubmitInput) => {
    if (!data?.polygonAoi) throw new Error("An area of interest is required");
    const dateTime = validateHeatmapDateTime(data.dateTime);
    const granularity = Number(data.granularity);
    if (![60, 80, 100].includes(granularity)) throw new Error("Granularity must be 60, 80 or 100");
    const analyticType = data.analyticType ?? "tcm";
    const needsThreshold = analyticType === "exceedance" || analyticType === "persistence";
    if (needsThreshold && !Number.isFinite(Number(data.threshold))) {
      throw new Error("A numeric threshold is required for this analysis");
    }
    if (needsThreshold && !["above", "below"].includes(String(data.direction))) {
      throw new Error("Direction must be 'above' or 'below'");
    }
    return {
      polygonAoi: data.polygonAoi,
      dateTime,
      granularity,
      analyticType,
      threshold: needsThreshold ? Number(data.threshold) : undefined,
      direction: needsThreshold ? String(data.direction) : undefined,
    };
  })
  .handler(async ({ data }) => {
    const body: HeatmapRequestBody = {
      polygon_aoi: data.polygonAoi,
      date_time: data.dateTime,
      granularity: data.granularity,
      analytic_type: data.analyticType,
      ...(data.threshold !== undefined ? { threshold: data.threshold } : {}),
      ...(data.direction !== undefined ? { direction: data.direction } : {}),
    };
    try {
      const res = await submitHeatmap(body);
      const activityId = res?.data?.activity_id;
      if (!activityId) throw new Error("FortyGuard did not return an activity id");
      return { activityId };
    } catch (error) {
      const e = error as FortyGuardError;
      throw new Error(e.message || "FortyGuard request failed");
    }
  });

export const getStatusFn = createServerFn({ method: "GET" })
  .inputValidator((data: { activityId: string }) => {
    const activityId = String(data?.activityId ?? "").trim();
    if (!activityId) throw new Error("activityId is required");
    return { activityId };
  })
  .handler(async ({ data }) => {
    try {
      const res = await getActivityStatus(data.activityId);
      return {
        activityId: res?.data?.activity_id ?? data.activityId,
        status: res?.data?.status ?? "Processing",
        result: res?.data?.result ?? null,
      };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  });

export const submitEnvParamsFn = createServerFn({ method: "POST" })
  .inputValidator(
    (data: {
      latitude: number;
      longitude: number;
      temperature: number;
      startDate: string;
      startTime: string;
    }) => {
      const latitude = Number(data?.latitude);
      const longitude = Number(data?.longitude);
      if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90) {
        throw new Error("Latitude must be between -90 and 90");
      }
      if (!Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
        throw new Error("Longitude must be between -180 and 180");
      }
      if (!Number.isFinite(Number(data?.temperature))) throw new Error("Temperature is required");
      validateHeatmapDateTime({
        filter_type: 1,
        start_date: String(data.startDate),
        start_time: String(data.startTime),
      });
      return {
        latitude,
        longitude,
        temperature: Number(data.temperature),
        startDate: String(data.startDate),
        startTime: String(data.startTime),
      };
    },
  )
  .handler(async ({ data }) => {
    try {
      const res = await submitEnvParams({
        latitude: data.latitude,
        longitude: data.longitude,
        temperature: data.temperature,
        date_time: {
          start_date: data.startDate,
          start_time: data.startTime,
          filter_type: 1,
        },
      });
      const activityId = res?.data?.activity_id;
      if (!activityId) throw new Error("FortyGuard did not return an activity id");
      return { activityId };
    } catch (error) {
      throw new Error((error as Error).message);
    }
  });
