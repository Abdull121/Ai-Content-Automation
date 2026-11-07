import { NextResponse } from "next/server";
import { tablesDB, APPWRITE_DATABASE_ID, TABLES } from "@/infrastructure/appwrite/serverClient";

async function getConfigRow() {
  const { rows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.scheduleConfig,
  });
  if (rows.length === 0) throw new Error("No schedule_config row found — run backend/scripts/seed.mjs");
  return rows[0];
}

function toConfig(row: Awaited<ReturnType<typeof getConfigRow>>) {
  return {
    window: {
      timezone: row.timezone,
      startHour: row.startHour,
      endHour: row.endHour,
    },
    maxPostsPerDay: {
      youtube: row.maxPostsYoutube,
      instagram: row.maxPostsInstagram,
      tiktok: row.maxPostsTiktok,
    },
  };
}

export async function GET() {
  const row = await getConfigRow();
  return NextResponse.json(toConfig(row));
}

export async function PUT(request: Request) {
  const body = await request.json();
  const row = await getConfigRow();

  const updated = await tablesDB.updateRow({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.scheduleConfig,
    rowId: row.$id,
    data: {
      timezone: body.window.timezone,
      startHour: body.window.startHour,
      endHour: body.window.endHour,
      maxPostsYoutube: body.maxPostsPerDay.youtube,
      maxPostsInstagram: body.maxPostsPerDay.instagram,
      maxPostsTiktok: body.maxPostsPerDay.tiktok,
    },
  });

  return NextResponse.json(toConfig(updated));
}
