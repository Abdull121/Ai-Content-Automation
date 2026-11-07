import { VideoRepository } from "@/domain/repositories/VideoRepository";
import { Video } from "@/domain/entities/Video";
import { Platform } from "@/domain/entities/Platform";

export class AppwriteVideoRepository implements VideoRepository {
  async listVideos(): Promise<Video[]> {
    const res = await fetch("/api/videos");
    if (!res.ok) throw new Error("Failed to load videos");
    const { videos } = await res.json();
    return videos;
  }

  async enqueueVideos(files: File[], targetPlatforms: Platform[]): Promise<Video[]> {
    const formData = new FormData();
    for (const file of files) formData.append("files", file);
    for (const platform of targetPlatforms) formData.append("targetPlatforms", platform);

    const res = await fetch("/api/videos", { method: "POST", body: formData });
    if (!res.ok) {
      const { error } = await res.json().catch(() => ({ error: "Upload failed" }));
      throw new Error(error ?? "Upload failed");
    }
    const { videos } = await res.json();
    return videos;
  }

  async deleteVideo(id: string): Promise<void> {
    const res = await fetch(`/api/videos/${id}`, { method: "DELETE" });
    if (!res.ok) throw new Error("Failed to delete video");
  }
}
