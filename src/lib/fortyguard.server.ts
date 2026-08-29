/** Server-only FortyGuard API access. The API key never leaves the server. */

const BASE_URL = "https://api.fortyguard.com/v1";

export class FortyGuardError extends Error {
  status: number;
  constructor(message: string, status = 500) {
    super(message);
    this.status = status;
  }
}

function apiKey(): string {
  const key = process.env["FORTYGUARD_API_KEY"];
  if (!key) {
    throw new FortyGuardError(
      "FortyGuard API key is not configured on the server. Add FORTYGUARD_API_KEY to enable environmental data.",
      401,
    );
  }
  return key;
}

function friendlyMessage(status: number, fallback: string): string {
  switch (status) {
    case 400:
    case 422:
      return `Invalid request sent to FortyGuard: ${fallback}`;
    case 401:
      return "FortyGuard rejected the API key (unauthorized).";
    case 403:
      return "Your FortyGuard plan does not include this endpoint.";
    case 404:
      return "FortyGuard activity not found.";
    case 429:
      return "FortyGuard rate limit exceeded. Please wait and try again.";
    default:
      return status >= 500 ? "FortyGuard service error. Please try again later." : fallback;
  }
}

async function call<T>(path: string, init: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    ...init,
    headers: {
      "api-key": apiKey(),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });

  const text = await res.text();
  let body: unknown = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }

  if (!res.ok) {
    const detail =
      (body as { message?: string; detail?: string } | null)?.message ??
      (body as { detail?: string } | null)?.detail ??
      `Request failed (${res.status})`;
    throw new FortyGuardError(friendlyMessage(res.status, detail), res.status);
  }
  return body as T;
}

export interface HeatmapDateTime {
  filter_type: number;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
}

export interface HeatmapRequestBody {
  polygon_aoi: unknown;
  date_time: HeatmapDateTime;
  granularity: number;
  analytic_type: string;
  threshold?: number;
  direction?: string;
}

export function submitHeatmap(body: HeatmapRequestBody) {
  return call<{ data?: { activity_id?: string } }>("/heatmap", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function submitEnvParams(body: Record<string, unknown>) {
  return call<{ data?: { activity_id?: string } }>("/env_params", {
    method: "POST",
    body: JSON.stringify(body),
  });
}

export function getActivityStatus(activityId: string) {
  return call<{
    data?: { activity_id?: string; status?: string; result?: unknown };
    message?: string;
  }>(`/status/${encodeURIComponent(activityId)}`, { method: "GET" });
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

/**
 * Server-side guard for the documented heatmap temporal contract:
 * filter_type 1 (hour), 2 (same-day range), 3 (full day), 4 (date range),
 * dates from 2019-01-01 up to now + 12h.
 */
export function validateHeatmapDateTime(input: HeatmapDateTime): HeatmapDateTime {
  const filterType = Number(input?.filter_type);
  if (![1, 2, 3, 4].includes(filterType)) {
    throw new FortyGuardError("filter_type must be 1, 2, 3 or 4", 400);
  }
  const startDate = String(input?.start_date ?? "");
  if (!DATE_RE.test(startDate)) throw new FortyGuardError("Date must be YYYY-MM-DD", 400);

  const result: HeatmapDateTime = { filter_type: filterType, start_date: startDate };

  if (filterType === 1 || filterType === 2) {
    const startTime = String(input?.start_time ?? "");
    if (!TIME_RE.test(startTime)) throw new FortyGuardError("Time must be HH:MM", 400);
    result.start_time = startTime;
  }
  if (filterType === 2) {
    const endTime = String(input?.end_time ?? "");
    if (!TIME_RE.test(endTime)) throw new FortyGuardError("End time must be HH:MM", 400);
    if (endTime <= result.start_time!) {
      throw new FortyGuardError("End time must be after start time on the same day", 400);
    }
    result.end_time = endTime;
  }
  if (filterType === 4) {
    const endDate = String(input?.end_date ?? "");
    if (!DATE_RE.test(endDate)) throw new FortyGuardError("End date must be YYYY-MM-DD", 400);
    if (Date.parse(`${endDate}T00:00:00Z`) < Date.parse(`${startDate}T00:00:00Z`)) {
      throw new FortyGuardError("End date must be after the start date", 400);
    }
    result.end_date = endDate;
  }

  const min = Date.parse("2019-01-01T00:00:00Z");
  const max = Date.now() + 12 * 60 * 60 * 1000;
  const earliest = Date.parse(`${startDate}T${result.start_time ?? "00:00"}:00Z`);
  const latestDate = result.end_date ?? startDate;
  const latest = Date.parse(`${latestDate}T${result.end_time ?? "00:00"}:00Z`);
  if (!Number.isFinite(earliest)) throw new FortyGuardError("Invalid date/time", 400);
  if (earliest < min) throw new FortyGuardError("Date must be on or after 2019-01-01", 400);
  if (latest > max) {
    throw new FortyGuardError("Date must be within 12 hours of the current time", 400);
  }
  return result;
}
