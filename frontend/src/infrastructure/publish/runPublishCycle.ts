import "server-only";
import { Query } from "node-appwrite";
import { tablesDB, APPWRITE_DATABASE_ID, TABLES } from "@/infrastructure/appwrite/serverClient";
import { ALL_PLATFORMS, Platform } from "@/domain/entities/Platform";
import { PublishCycleResult, PublishAttempt } from "@/domain/entities/PublishCycleResult";
import { isWithinPostingWindow } from "./withinWindow";
import { remainingCapacity } from "./rateLimit";
import { publishToYouTube } from "./youtubePublisher";
import { publishToInstagram } from "./instagramPublisher";

const MAX_LIMIT_FIELD: Record<Platform, string> = {
  youtube: "maxPostsYoutube",
  instagram: "maxPostsInstagram",
  tiktok: "maxPostsTiktok",
};

async function alreadyPublished(videoId: string, platform: Platform): Promise<boolean> {
  const { total } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.publishLogs,
    queries: [
      Query.equal("videoId", videoId),
      Query.equal("platform", platform),
      Query.equal("status", "success"),
      Query.limit(1),
    ],
  });
  return total > 0;
}

async function logAttempt(
  videoId: string,
  platform: Platform,
  status: "success" | "failed",
  extra: { remotePostId?: string; error?: string }
) {
  await tablesDB.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.publishLogs,
    rowId: crypto.randomUUID(),
    data: {
      videoId,
      platform,
      status,
      remotePostId: extra.remotePostId,
      error: extra.error,
      publishedAt: new Date().toISOString(),
    },
  });
}

/**
 * One pass over the queue: respects the configured posting window and each
 * platform's rolling 24h rate limit. Safe to call repeatedly (manual button
 * or the interval in instrumentation.ts) — already-published platforms for a
 * video are skipped via publish_logs, so nothing double-posts.
 */
export async function runPublishCycle(): Promise<PublishCycleResult> {
  const attempts: PublishAttempt[] = [];
  const ranAt = new Date().toISOString();

  const { rows: configRows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.scheduleConfig,
    queries: [Query.limit(1)],
  });
  const config = configRows[0];
  if (!config) return { ranAt, withinWindow: false, attempts };

  // Informational only now — each video's scheduledAt was already chosen
  // inside the window at assignment time (see assignScheduleSlot.ts), so the
  // real gate below is "is this specific video's slot due yet", not a global
  // block. That lets a slot missed by a brief server outage still go out
  // late rather than being silently skipped until tomorrow.
  const withinWindow = isWithinPostingWindow(config.timezone, config.startHour, config.endHour);

  const { rows: accountRows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.socialAccounts,
  });
  const accountByPlatform = new Map(accountRows.map((a) => [a.platform, a]));

  const remaining: Partial<Record<Platform, number>> = {};
  for (const platform of ALL_PLATFORMS) {
    const account = accountByPlatform.get(platform);
    if (!account || account.status !== "connected") continue;
    // The daily limit the user actually controls lives on schedule_config (the
    // "Max posts per day" fields in the dashboard), not on the account row.
    remaining[platform] = await remainingCapacity(platform, config[MAX_LIMIT_FIELD[platform]]);
  }

  const { rows: videos } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.videos,
    queries: [
      Query.equal("status", "scheduled"),
      Query.lessThanEqual("scheduledAt", new Date().toISOString()),
      Query.orderAsc("scheduledAt"),
      Query.limit(20),
    ],
  });

  for (const video of videos) {
    if (!video.title) continue; // metadata not generated yet — leave it for the AI pipeline

    const targetPlatforms: Platform[] = video.targetPlatforms ?? [];
    let videoBuffer: Buffer | null = null;
    let anyAttempted = false;
    let anyFailed = false;
    let allDone = true;

    for (const platform of targetPlatforms) {
      const account = accountByPlatform.get(platform);

      if (!account || account.status !== "connected") {
        attempts.push({ videoId: video.$id, fileName: video.fileName, platform, outcome: "skipped", reason: "not connected" });
        allDone = false;
        continue;
      }
      if (await alreadyPublished(video.$id, platform)) continue; // already done in a prior cycle

      if ((remaining[platform] ?? 0) <= 0) {
        attempts.push({ videoId: video.$id, fileName: video.fileName, platform, outcome: "skipped", reason: "daily limit reached" });
        allDone = false;
        continue;
      }

      anyAttempted = true;
      try {
        const metadata = { title: video.title, description: video.description ?? "", hashtags: video.hashtags ?? [] };

        let remotePostId: string;
        if (platform === "youtube") {
          if (!videoBuffer) {
            const res = await fetch(video.fileUrl);
            if (!res.ok) throw new Error(`Failed to download video: ${res.status}`);
            videoBuffer = Buffer.from(await res.arrayBuffer());
          }
          remotePostId = await publishToYouTube({ refreshToken: account.refreshToken }, videoBuffer, metadata);
        } else if (platform === "instagram") {
          remotePostId = await publishToInstagram(
            { accessToken: account.accessToken, externalId: account.externalId },
            video.fileUrl,
            metadata
          );
        } else {
          throw new Error(`${platform} publishing isn't implemented yet`);
        }

        await logAttempt(video.$id, platform, "success", { remotePostId });
        remaining[platform] = (remaining[platform] ?? 1) - 1;
        attempts.push({ videoId: video.$id, fileName: video.fileName, platform, outcome: "published" });
      } catch (error) {
        const reason = error instanceof Error ? error.message : "Unknown error";
        await logAttempt(video.$id, platform, "failed", { error: reason.slice(0, 2000) });
        attempts.push({ videoId: video.$id, fileName: video.fileName, platform, outcome: "failed", reason });
        anyFailed = true;
        allDone = false;
      }
    }

    if (allDone && targetPlatforms.length > 0) {
      await tablesDB.updateRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.videos,
        rowId: video.$id,
        data: { status: "published" },
      });
    } else if (anyFailed) {
      await tablesDB.updateRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.videos,
        rowId: video.$id,
        data: { status: "failed", errorMessage: "One or more platforms failed to publish — see publish_logs" },
      });
    } else if (anyAttempted) {
      // Some platforms succeeded, others are still waiting on rate limit/connection — stays queued for the next cycle.
    }
  }

  return { ranAt, withinWindow, attempts };
}
