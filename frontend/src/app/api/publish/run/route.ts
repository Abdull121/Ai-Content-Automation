import { NextResponse } from "next/server";
import { runPublishCycle } from "@/infrastructure/publish/runPublishCycle";
import { cleanupPublishedVideos } from "@/infrastructure/publish/cleanupPublishedVideos";

export async function POST(request: Request) {
  // Optional shared secret so an externally exposed deployment can't be triggered by strangers.
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const result = await runPublishCycle();
  await cleanupPublishedVideos().catch(() => {});
  return NextResponse.json(result);
}
