import "server-only";
import { Query } from "node-appwrite";
import {
  tablesDB,
  storage,
  APPWRITE_DATABASE_ID,
  APPWRITE_BUCKET_ID,
  TABLES,
} from "@/infrastructure/appwrite/serverClient";

const CLEANUP_DELAY_MS = 3 * 60 * 1000;

/**
 * Once a video has been published everywhere it was targeted, its source
 * file is just occupying storage — this deletes the file (keeping the DB row
 * as a history record: title, hashtags, publish_logs) a few minutes after
 * the last successful publish, so the bucket doesn't fill up over time.
 */
export async function cleanupPublishedVideos(): Promise<{ cleaned: string[] }> {
  const cleaned: string[] = [];

  const { rows: videos } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.videos,
    queries: [Query.equal("status", "published"), Query.limit(100)],
  });

  for (const video of videos) {
    if (!video.fileId) continue; // already cleaned up

    const { rows: logs } = await tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.publishLogs,
      queries: [
        Query.equal("videoId", video.$id),
        Query.equal("status", "success"),
        Query.orderDesc("publishedAt"),
        Query.limit(1),
      ],
    });
    const lastPublishedAt = logs[0]?.publishedAt;
    if (!lastPublishedAt) continue;

    const age = Date.now() - new Date(lastPublishedAt).getTime();
    if (age < CLEANUP_DELAY_MS) continue;

    await storage.deleteFile({ bucketId: APPWRITE_BUCKET_ID, fileId: video.fileId }).catch(() => {});
    await tablesDB.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.videos,
      rowId: video.$id,
      data: { fileId: "", fileUrl: "" },
    });
    cleaned.push(video.$id);
  }

  return { cleaned };
}
