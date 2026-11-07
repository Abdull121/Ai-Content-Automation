import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { tablesDB, APPWRITE_DATABASE_ID, TABLES } from "@/infrastructure/appwrite/serverClient";

const MAX_LIMIT_FIELD: Record<string, string> = {
  youtube: "maxPostsYoutube",
  instagram: "maxPostsInstagram",
  tiktok: "maxPostsTiktok",
};

export async function GET() {
  const { rows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.socialAccounts,
  });

  const { rows: configRows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.scheduleConfig,
    queries: [Query.limit(1)],
  });
  const config = configRows[0];

  const since24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const accounts = await Promise.all(
    rows.map(async (row) => {
      const logs = await tablesDB.listRows({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.publishLogs,
        queries: [
          Query.equal("platform", row.platform),
          Query.equal("status", "success"),
          Query.greaterThanEqual("publishedAt", since24h),
          Query.limit(1),
        ],
      });

      return {
        id: row.$id,
        platform: row.platform,
        handle: row.handle,
        status: row.status,
        dailyPostCount: logs.total,
        // schedule_config's "max posts per day" is what the publish engine actually
        // enforces (see runPublishCycle.ts) — fall back to the account's own limit
        // only if no config row exists yet.
        dailyPostLimit: config ? config[MAX_LIMIT_FIELD[row.platform]] : row.dailyPostLimit,
      };
    })
  );

  return NextResponse.json({ accounts });
}
