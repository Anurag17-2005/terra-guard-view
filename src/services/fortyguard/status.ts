import { getStatusFn } from "@/lib/fortyguard.functions";
import type { ActivityResponse } from "./types";

export const fortyguardStatus = {
  get(activityId: string): Promise<ActivityResponse> {
    return getStatusFn({ data: { activityId } }) as Promise<ActivityResponse>;
  },
};

export interface PollOptions {
  intervalMs?: number;
  timeoutMs?: number;
  onTick?: (status: string, attempt: number) => void;
  signal?: AbortSignal;
}

/** Bounded polling — never loops forever. */
export async function pollActivity(
  activityId: string,
  { intervalMs = 4000, timeoutMs = 4 * 60 * 1000, onTick, signal }: PollOptions = {},
): Promise<ActivityResponse> {
  const deadline = Date.now() + timeoutMs;
  let attempt = 0;

  while (Date.now() < deadline) {
    if (signal?.aborted) throw new Error("Analysis cancelled");
    const res = await fortyguardStatus.get(activityId);
    attempt += 1;
    onTick?.(res.status, attempt);

    if (res.status === "Completed") return res;
    if (res.status === "Failed") throw new Error("FortyGuard reported the analysis as Failed.");

    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
  throw new Error("FortyGuard analysis timed out. Try a smaller area or coarser granularity.");
}
