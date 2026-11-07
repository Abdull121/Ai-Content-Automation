import { NextResponse } from "next/server";
import {
  tablesDB,
  storage,
  APPWRITE_DATABASE_ID,
  APPWRITE_BUCKET_ID,
  TABLES,
} from "@/infrastructure/appwrite/serverClient";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const row = await tablesDB
    .getRow({ databaseId: APPWRITE_DATABASE_ID, tableId: TABLES.videos, rowId: id })
    .catch(() => null);

  if (row?.fileId) {
    // The file may already be gone (auto-cleanup ran, or a retry after a
    // partial failure) — that's fine, we're deleting either way.
    await storage
      .deleteFile({ bucketId: APPWRITE_BUCKET_ID, fileId: row.fileId })
      .catch(() => {});
  }

  await tablesDB
    .deleteRow({ databaseId: APPWRITE_DATABASE_ID, tableId: TABLES.videos, rowId: id })
    .catch(() => {});

  return NextResponse.json({ deleted: true });
}
