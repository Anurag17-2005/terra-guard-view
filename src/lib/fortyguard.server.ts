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

export interface HeatmapRequestBody {
  polygon_aoi: unknown;
  date_time: { start_date: string; start_time?: string; filter_type: number };
  granularity: number;
  analytic_type: string;
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

/** ISO date bounds documented by FortyGuard: 2019-01-01 .. now + 12h. */
export function validateDateTime(startDate: string, startTime: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(startDate)) throw new FortyGuardError("Date must be YYYY-MM-DD", 400);
  if (!/^\d{2}:\d{2}$/.test(startTime)) throw new FortyGuardError("Time must be HH:MM", 400);
  const requested = new Date(`${startDate}T${startTime}:00Z`).getTime();
  if (!Number.isFinite(requested)) throw new FortyGuardError("Invalid date/time", 400);
  const min = Date.parse("2019-01-01T00:00:00Z");
  const max = Date.now() + 12 * 60 * 60 * 1000;
  if (requested < min) throw new FortyGuardError("Date must be on or after 2019-01-01", 400);
  if (requested > max) throw new FortyGuardError("Date must be within 12 hours of the current time", 400);
}
