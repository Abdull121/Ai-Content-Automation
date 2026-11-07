import "server-only";
import { Query } from "node-appwrite";
import { tablesDB, APPWRITE_DATABASE_ID, TABLES } from "@/infrastructure/appwrite/serverClient";
import { Platform } from "@/domain/entities/Platform";

/** How many more successful posts `platform` can take in the current rolling 24h window. */
export async function remainingCapacity(platform: Platform, dailyLimit: number): Promise<number> {
  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { total } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.publishLogs,
    queries: [
      Query.equal("platform", platform),
      Query.equal("status", "success"),
      Query.greaterThanEqual("publishedAt", since24h),
      Query.limit(1),
    ],
  });
  return Math.max(0, dailyLimit - total);
}
