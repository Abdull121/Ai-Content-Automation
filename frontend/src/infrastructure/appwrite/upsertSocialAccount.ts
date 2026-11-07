import "server-only";
import { ID, Query } from "node-appwrite";
import { tablesDB, APPWRITE_DATABASE_ID, TABLES } from "./serverClient";
import { Platform } from "@/domain/entities/Platform";

interface SocialAccountData {
  platform: Platform;
  handle: string;
  status: "connected" | "disconnected" | "expiring_soon";
  externalId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  dailyPostLimit: number;
}

/** Shared by every OAuth callback route — one row per platform, created or updated. */
export async function upsertSocialAccount(data: SocialAccountData) {
  const existing = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.socialAccounts,
    queries: [Query.equal("platform", data.platform), Query.limit(1)],
  });

  if (existing.total > 0) {
    return tablesDB.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.socialAccounts,
      rowId: existing.rows[0].$id,
      data,
    });
  }

  return tablesDB.createRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.socialAccounts,
    rowId: ID.unique(),
    data,
  });
}
