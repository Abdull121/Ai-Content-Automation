import "server-only";
import { spawn } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { tablesDB, APPWRITE_DATABASE_ID, TABLES } from "@/infrastructure/appwrite/serverClient";
import { transcribeAudio, generateMetadata } from "./groqClient";
import { assignScheduleSlot } from "@/infrastructure/publish/assignScheduleSlot";
import { Platform } from "@/domain/entities/Platform";

function extractAudio(videoPath: string, audioPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const ffmpeg = spawn("ffmpeg", [
      "-y",
      "-i", videoPath,
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-f", "mp3",
      audioPath,
    ]);
    let stderr = "";
    ffmpeg.stderr.on("data", (chunk) => (stderr += chunk));
    ffmpeg.on("error", reject);
    ffmpeg.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}: ${stderr.slice(-500)}`));
    });
  });
}

/**
 * Runs after the upload response has already been sent (see the `after()`
 * call in the videos route) — failures here update the row to `failed`
 * with a reason rather than surfacing anywhere the client is waiting on.
 */
export async function processVideoMetadata(
  videoRowId: string,
  fileUrl: string,
  fileName: string,
  targetPlatforms: Platform[]
) {
  const setStatus = (data: Record<string, unknown>) =>
    tablesDB.updateRow({
      databaseId: APPWRITE_DATABASE_ID,
      tableId: TABLES.videos,
      rowId: videoRowId,
      data,
    });

  let tempDir: string | undefined;
  try {
    await setStatus({ status: "generating_metadata" });

    const videoRes = await fetch(fileUrl);
    if (!videoRes.ok) throw new Error(`Failed to download video: ${videoRes.status}`);
    const videoBuffer = Buffer.from(await videoRes.arrayBuffer());

    tempDir = await mkdtemp(join(tmpdir(), "content-automation-"));
    const videoPath = join(tempDir, fileName);
    const audioPath = join(tempDir, "audio.mp3");
    await writeFile(videoPath, videoBuffer);
    await extractAudio(videoPath, audioPath);

    const audioBuffer = await readFile(audioPath);
    // Whisper errors on files with no audio track at all rather than
    // returning empty text — that's still a valid "no transcript" case.
    const transcript = await transcribeAudio(audioBuffer, "audio.mp3").catch(() => "");

    const metadata = await generateMetadata(fileName, transcript);
    const { scheduledAt } = await assignScheduleSlot(targetPlatforms);

    await setStatus({
      status: "scheduled",
      title: metadata.title,
      description: metadata.description,
      hashtags: metadata.hashtags,
      scheduledAt,
    });
  } catch (error) {
    await setStatus({
      status: "failed",
      errorMessage: error instanceof Error ? error.message.slice(0, 2000) : "Metadata generation failed",
    });
  } finally {
    if (tempDir) await rm(tempDir, { recursive: true, force: true });
  }
}
