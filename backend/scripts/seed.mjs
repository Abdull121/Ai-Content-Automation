import "dotenv/config";
import { Client, TablesDB, Query, ID } from "node-appwrite";
import { TABLES } from "./schema.mjs";

const client = new Client()
  .setEndpoint(process.env.APPWRITE_ENDPOINT)
  .setProject(process.env.APPWRITE_PROJECT_ID)
  .setKey(process.env.APPWRITE_API_KEY);

const tablesDB = new TablesDB(client);
const databaseId = process.env.APPWRITE_DATABASE_ID;

// --- schedule_config: exactly one row, the app's default posting window and caps ---
const existingConfig = await tablesDB.listRows({
  databaseId,
  tableId: TABLES.scheduleConfig,
  queries: [Query.limit(1)],
});

if (existingConfig.total > 0) {
  console.log("schedule_config — default row already exists, skipping");
} else {
  await tablesDB.createRow({
    databaseId,
    tableId: TABLES.scheduleConfig,
    rowId: ID.unique(),
    data: {
      timezone: "America/New_York",
      startHour: 9,
      endHour: 21,
      maxPostsYoutube: 6,
      maxPostsInstagram: 15,
      maxPostsTiktok: 10,
    },
  });
  console.log("schedule_config — default row created");
}
