import { Platform } from "./Platform";

export type PublishOutcome = "published" | "failed" | "skipped";

export interface PublishAttempt {
  videoId: string;
  fileName: string;
  platform: Platform;
  outcome: PublishOutcome;
  reason?: string;
}

export interface PublishCycleResult {
  ranAt: string;
  withinWindow: boolean;
  attempts: PublishAttempt[];
}
