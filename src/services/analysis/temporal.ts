import type { TemporalContext, TimeRange, ValidationIssue } from "./types";

export interface FortyGuardDateTime {
  filter_type: number;
  start_date: string;
  end_date?: string;
  start_time?: string;
  end_time?: string;
}

export const MIN_DATE = "2019-01-01";
/** FortyGuard rejects requests more than 12 hours into the future. */
export const FORECAST_WINDOW_MS = 12 * 60 * 60 * 1000;
/** filter_type 4 supports at most one month. */
export const MAX_RANGE_DAYS = 31;

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^\d{2}:\d{2}$/;

export function parseUtc(date: string, time = "00:00"): number {
  return Date.parse(`${date}T${time}:00Z`);
}

/**
 * Validates the normalized temporal model. Returns issues instead of throwing so
 * the UI can list exactly what needs fixing before any API call happens.
 */
export function validateTimeRange(range: TimeRange): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  const { mode, startDate, endDate, startTime, endTime } = range;

  if (!DATE_RE.test(startDate ?? "")) {
    issues.push({ field: "startDate", message: "Start date must be a valid YYYY-MM-DD date." });
    return issues;
  }

  const minMs = parseUtc(MIN_DATE);
  const maxMs = Date.now() + FORECAST_WINDOW_MS;

  if (mode === "single_hour" || mode === "time_range") {
    if (!TIME_RE.test(startTime ?? "")) {
      issues.push({ field: "startTime", message: "Start time must be a valid HH:MM time." });
    }
  }
  if (mode === "time_range" && !TIME_RE.test(endTime ?? "")) {
    issues.push({ field: "endTime", message: "End time must be a valid HH:MM time." });
  }
  if (mode === "time_range" && startTime && endTime && startTime >= endTime) {
    issues.push({
      field: "endTime",
      message:
        "End time must be after start time. A range that crosses midnight is not supported by the heatmap API — split it into two same-day analyses.",
    });
  }

  if (mode === "multi_day") {
    if (!DATE_RE.test(endDate ?? "")) {
      issues.push({ field: "endDate", message: "End date must be a valid YYYY-MM-DD date." });
    } else {
      const days = (parseUtc(endDate!) - parseUtc(startDate)) / 86_400_000;
      if (days < 0) issues.push({ field: "endDate", message: "End date must be after start date." });
      if (days > MAX_RANGE_DAYS) {
        issues.push({
          field: "endDate",
          message: `The heatmap API supports a maximum range of ${MAX_RANGE_DAYS} days.`,
        });
      }
    }
    if (startTime || endTime) {
      // Guard rail: never silently map a cross-day time window onto filter_type 4.
      issues.push({
        field: "mode",
        message:
          "A multi-day range covers whole days. Times cannot be applied across days with this API — use a same-day time range instead.",
      });
    }
  }

  const earliest = parseUtc(startDate, mode === "multi_day" ? "00:00" : startTime ?? "00:00");
  const latestDate = mode === "multi_day" && endDate ? endDate : startDate;
  const latest = parseUtc(latestDate, mode === "time_range" ? endTime ?? "23:59" : "23:59");

  if (Number.isFinite(earliest) && earliest < minMs) {
    issues.push({ field: "startDate", message: "Date must be on or after 2019-01-01." });
  }
  if (Number.isFinite(latest) && latest > maxMs) {
    issues.push({
      field: "startDate",
      message: "FortyGuard only forecasts up to 12 hours ahead of the current time.",
    });
  }

  return issues;
}

/** The single translation point from the normalized model to the API contract. */
export function toFortyGuardDateTime(range: TimeRange): FortyGuardDateTime {
  switch (range.mode) {
    case "single_hour":
      return { filter_type: 1, start_date: range.startDate, start_time: range.startTime! };
    case "time_range":
      return {
        filter_type: 2,
        start_date: range.startDate,
        start_time: range.startTime!,
        end_time: range.endTime!,
      };
    case "full_day":
      return { filter_type: 3, start_date: range.startDate };
    case "multi_day":
      return { filter_type: 4, start_date: range.startDate, end_date: range.endDate! };
    default:
      throw new Error("Unsupported time mode");
  }
}

/** Describes (never guesses) whether the request is historical, recent or forecast. */
export function temporalContext(range: TimeRange): TemporalContext {
  const now = Date.now();
  const start = parseUtc(range.startDate, range.startTime ?? "00:00");
  if (start > now) return "forecast";
  if (now - start <= 7 * 86_400_000) return "recent";
  return "historical";
}
