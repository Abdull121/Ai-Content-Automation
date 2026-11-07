import "server-only";
import { Client, TablesDB, Storage } from "node-appwrite";

// Server-only: uses the Appwrite API key, so this file must never be imported
// from a Client Component or bundled into the browser. Route handlers only.
function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env var: ${name}`);
  return value;
}

export const APPWRITE_DATABASE_ID = requiredEnv("APPWRITE_DATABASE_ID");
export const APPWRITE_BUCKET_ID = requiredEnv("APPWRITE_BUCKET_ID");

const client = new Client()
  .setEndpoint(requiredEnv("APPWRITE_ENDPOINT"))
  .setProject(requiredEnv("APPWRITE_PROJECT_ID"))
  .setKey(requiredEnv("APPWRITE_API_KEY"));

export const tablesDB = new TablesDB(client);
export const storage = new Storage(client);

export const TABLES = {
  videos: "videos",
  socialAccounts: "social_accounts",
  scheduleConfig: "schedule_config",
  publishLogs: "publish_logs",
} as const;
