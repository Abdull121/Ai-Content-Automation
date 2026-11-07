import { TablesDBIndexType } from "node-appwrite";

export const PLATFORMS = ["youtube", "instagram", "tiktok"];

export const VIDEO_STATUSES = [
  "queued",
  "generating_metadata",
  "scheduled",
  "publishing",
  "published",
  "failed",
];

export const TABLES = {
  videos: "videos",
  socialAccounts: "social_accounts",
  scheduleConfig: "schedule_config",
  publishLogs: "publish_logs",
};

/**
 * The single source of truth for the Appwrite schema. `setup-database.mjs` walks
 * this and creates only what is missing, so it is safe to re-run at any time.
 *
 * Array columns are declared `required: false` — Appwrite rejects defaults on
 * arrays, and a required array buys nothing the application layer isn't already
 * validating in its use cases.
 */
export const SCHEMA = [
  {
    id: TABLES.videos,
    name: "Videos",
    columns: [
      { kind: "string", key: "fileName", size: 255, required: true },
      { kind: "string", key: "fileId", size: 64, required: true },
      { kind: "string", key: "fileUrl", size: 2048, required: true },
      { kind: "enum", key: "targetPlatforms", elements: PLATFORMS, required: false, array: true },
      { kind: "enum", key: "status", elements: VIDEO_STATUSES, required: true },
      { kind: "string", key: "title", size: 255, required: false },
      { kind: "string", key: "description", size: 5000, required: false },
      { kind: "string", key: "hashtags", size: 100, required: false, array: true },
      { kind: "datetime", key: "scheduledAt", required: false },
      { kind: "string", key: "errorMessage", size: 2000, required: false },
      { kind: "datetime", key: "createdAt", required: true },
    ],
    indexes: [
      { key: "idx_status", type: TablesDBIndexType.Key, columns: ["status"] },
      { key: "idx_scheduled_at", type: TablesDBIndexType.Key, columns: ["scheduledAt"] },
    ],
  },
  {
    id: TABLES.socialAccounts,
    name: "Social Accounts",
    columns: [
      { kind: "enum", key: "platform", elements: PLATFORMS, required: true },
      { kind: "string", key: "handle", size: 255, required: true },
      {
        kind: "enum",
        key: "status",
        elements: ["connected", "disconnected", "expiring_soon"],
        required: true,
      },
      { kind: "string", key: "externalId", size: 255, required: false },
      // Tokens are encrypted at rest by Appwrite; they are never returned to the browser.
      { kind: "string", key: "accessToken", size: 4096, required: false, encrypt: true },
      { kind: "string", key: "refreshToken", size: 4096, required: false, encrypt: true },
      { kind: "datetime", key: "tokenExpiresAt", required: false },
      { kind: "integer", key: "dailyPostLimit", required: true, min: 1, max: 200 },
    ],
    indexes: [{ key: "idx_platform", type: TablesDBIndexType.Key, columns: ["platform"] }],
  },
  {
    id: TABLES.scheduleConfig,
    name: "Schedule Config",
    columns: [
      { kind: "string", key: "timezone", size: 64, required: true },
      { kind: "integer", key: "startHour", required: true, min: 0, max: 23 },
      { kind: "integer", key: "endHour", required: true, min: 0, max: 23 },
      { kind: "integer", key: "maxPostsYoutube", required: true, min: 1, max: 50 },
      { kind: "integer", key: "maxPostsInstagram", required: true, min: 1, max: 50 },
      { kind: "integer", key: "maxPostsTiktok", required: true, min: 1, max: 50 },
    ],
    indexes: [],
  },
  {
    id: TABLES.publishLogs,
    name: "Publish Logs",
    columns: [
      { kind: "string", key: "videoId", size: 64, required: true },
      { kind: "enum", key: "platform", elements: PLATFORMS, required: true },
      { kind: "enum", key: "status", elements: ["success", "failed"], required: true },
      { kind: "string", key: "remotePostId", size: 255, required: false },
      { kind: "string", key: "error", size: 2000, required: false },
      { kind: "datetime", key: "publishedAt", required: true },
    ],
    // The rate limiter counts rows per platform inside a rolling 24h window,
    // so platform+publishedAt is the hot query path.
    indexes: [
      {
        key: "idx_platform_published",
        type: TablesDBIndexType.Key,
        columns: ["platform", "publishedAt"],
      },
    ],
  },
];
