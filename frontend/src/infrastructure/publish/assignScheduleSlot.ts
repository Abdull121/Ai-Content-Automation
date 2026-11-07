import "server-only";
import { Query } from "node-appwrite";
import { tablesDB, APPWRITE_DATABASE_ID, TABLES } from "@/infrastructure/appwrite/serverClient";
import { Platform } from "@/domain/entities/Platform";
import { computeDailySlotHours } from "@/domain/policies/PeakPostingSlots";
import { getZonedDateParts, getZonedHour, zonedTimeToUtc } from "./zonedTime";

const MAX_LIMIT_FIELD: Record<Platform, string> = {
  youtube: "maxPostsYoutube",
  instagram: "maxPostsInstagram",
  tiktok: "maxPostsTiktok",
};

function addDays(parts: { year: number; month: number; day: number }, delta: number) {
  const d = new Date(Date.UTC(parts.year, parts.month - 1, parts.day));
  d.setUTCDate(d.getUTCDate() + delta);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1, day: d.getUTCDate() };
}

/** How many videos are already committed (published or scheduled-but-pending) to `platform` on the given calendar day. */
async function committedCountForDay(
  platform: Platform,
  dayStartUtc: Date,
  dayEndUtc: Date
): Promise<number> {
  const startIso = dayStartUtc.toISOString();
  const endIso = dayEndUtc.toISOString();

  const [publishedRes, scheduledRes] = await Promise.all([
    tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.publishLogs,
      queries: [
        Query.equal("platform", platform),
        Query.equal("status", "success"),
        Query.greaterThanEqual("publishedAt", startIso),
        Query.lessThan("publishedAt", endIso),
        Query.limit(1),
      ],
    }),
    tablesDB.listRows({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.videos,
      queries: [
        Query.equal("status", "scheduled"),
        Query.contains("targetPlatforms", platform),
        Query.greaterThanEqual("scheduledAt", startIso),
        Query.lessThan("scheduledAt", endIso),
        Query.limit(1),
      ],
    }),
  ]);

  return publishedRes.total + scheduledRes.total;
}

/** Finds the next open slot for `platform`, walking forward a day at a time if today (and beyond) are full. */
async function findSlotForPlatform(
  platform: Platform,
  timezone: string,
  startHour: number,
  endHour: number,
  dailyLimit: number
): Promise<Date> {
  let dayParts = getZonedDateParts(new Date(), timezone);
  const now = new Date();

  for (let attempt = 0; attempt < 14; attempt++) {
    const dayStartUtc = zonedTimeToUtc(dayParts.year, dayParts.month, dayParts.day, 0, 0, timezone);
    const nextDayParts = addDays(dayParts, 1);
    const dayEndUtc = zonedTimeToUtc(nextDayParts.year, nextDayParts.month, nextDayParts.day, 0, 0, timezone);

    // Only the first day considered is "today" — exclude peak hours that have
    // already passed so a fresh video never gets scheduled into the past.
    const isToday = attempt === 0;
    const afterHour = isToday ? getZonedHour(now, timezone) : undefined;
    const slotHours = computeDailySlotHours(startHour, endHour, dailyLimit, afterHour);

    const committed = await committedCountForDay(platform, dayStartUtc, dayEndUtc);
    if (slotHours.length > 0 && committed < dailyLimit) {
      const hour = slotHours[committed % slotHours.length];
      const jitterMinutes = Math.floor(Math.random() * 30) - 15; // ±15 min so it doesn't look like a bot posting on the dot
      const minute = Math.max(0, Math.min(59, 30 + jitterMinutes));
      return zonedTimeToUtc(dayParts.year, dayParts.month, dayParts.day, hour, minute, timezone);
    }

    dayParts = nextDayParts;
  }

  throw new Error(`No open posting slot found for ${platform} in the next 14 days`);
}

/**
 * Called once a video's AI metadata is ready. Picks a real wall-clock time —
 * spread across the day's peak-engagement hours rather than "as soon as
 * possible" — for every platform the video targets, and commits the video to
 * the latest (most constrained) of those times so no platform's daily limit
 * or window is violated.
 */
export async function assignScheduleSlot(
  targetPlatforms: Platform[]
): Promise<{ scheduledAt: string }> {
  const { rows: configRows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.scheduleConfig,
    queries: [Query.limit(1)],
  });
  const config = configRows[0];
  if (!config) throw new Error("No schedule_config row found");

  const { rows: accountRows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.socialAccounts,
  });
  const accountByPlatform = new Map(accountRows.map((a) => [a.platform, a]));

  let latest: Date | null = null;
  for (const platform of targetPlatforms) {
    const account = accountByPlatform.get(platform);
    if (!account || account.status !== "connected") continue; // nothing to schedule against; runPublishCycle will just skip it

    const slot = await findSlotForPlatform(
      platform,
      config.timezone,
      config.startHour,
      config.endHour,
      config[MAX_LIMIT_FIELD[platform]]
    );
    if (!latest || slot > latest) latest = slot;
  }

  return { scheduledAt: (latest ?? new Date()).toISOString() };
}
