import { NextResponse, after } from "next/server";
import { ID, Query } from "node-appwrite";
import { InputFile } from "node-appwrite/file";
import {
  tablesDB,
  storage,
  APPWRITE_DATABASE_ID,
  APPWRITE_BUCKET_ID,
  TABLES,
} from "@/infrastructure/appwrite/serverClient";
import { processVideoMetadata } from "@/infrastructure/ai/processVideoMetadata";
import { Platform } from "@/domain/entities/Platform";

export async function GET() {
  const { rows } = await tablesDB.listRows({
    databaseId: APPWRITE_DATABASE_ID,
    tableId: TABLES.videos,
    queries: [Query.orderDesc("createdAt"), Query.limit(100)],
  });

  const videos = rows.map((row) => ({
    id: row.$id,
    fileName: row.fileName,
    fileUrl: row.fileUrl,
    targetPlatforms: row.targetPlatforms ?? [],
    status: row.status,
    metadata:
      row.title || row.description || (row.hashtags?.length ?? 0) > 0
        ? { title: row.title ?? "", description: row.description ?? "", hashtags: row.hashtags ?? [] }
        : undefined,
    scheduledAt: row.scheduledAt ?? undefined,
    errorMessage: row.errorMessage ?? undefined,
    createdAt: row.createdAt,
  }));

  return NextResponse.json({ videos });
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const files = formData.getAll("files").filter((f): f is File => f instanceof File);
  const targetPlatforms = formData.getAll("targetPlatforms").map(String);

  if (files.length === 0) {
    return NextResponse.json({ error: "No files provided" }, { status: 400 });
  }
  if (targetPlatforms.length === 0) {
    return NextResponse.json({ error: "Select at least one target platform" }, { status: 400 });
  }

  const created = await Promise.all(
    files.map(async (file) => {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await storage.createFile({
        bucketId: APPWRITE_BUCKET_ID,
        fileId: ID.unique(),
        file: InputFile.fromBuffer(buffer, file.name),
      });

      const fileUrl = `${process.env.APPWRITE_ENDPOINT}/storage/buckets/${APPWRITE_BUCKET_ID}/files/${uploaded.$id}/view?project=${process.env.APPWRITE_PROJECT_ID}`;

      const row = await tablesDB.createRow({
        databaseId: APPWRITE_DATABASE_ID,
        tableId: TABLES.videos,
        rowId: ID.unique(),
        data: {
          fileName: file.name,
          fileId: uploaded.$id,
          fileUrl,
          targetPlatforms,
          status: "queued",
          createdAt: new Date().toISOString(),
        },
      });

      // Runs after this response is sent — the client sees "queued" immediately
      // and polls GET /api/videos to watch it move to generating_metadata → scheduled (with metadata + a real slot time) or failed.
      after(() => processVideoMetadata(row.$id, fileUrl, file.name, targetPlatforms as Platform[]));

      return {
        id: row.$id,
        fileName: row.fileName,
        fileUrl: row.fileUrl,
        targetPlatforms: row.targetPlatforms,
        status: row.status,
        createdAt: row.createdAt,
      };
    })
  );

  return NextResponse.json({ videos: created }, { status: 201 });
}
