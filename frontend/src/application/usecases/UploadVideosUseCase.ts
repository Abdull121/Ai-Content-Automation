import { VideoRepository } from "@/domain/repositories/VideoRepository";
import { Video } from "@/domain/entities/Video";
import { Platform } from "@/domain/entities/Platform";

export class UploadVideosUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  execute(files: File[], targetPlatforms: Platform[]): Promise<Video[]> {
    if (files.length === 0) {
      throw new Error("No files selected");
    }
    if (targetPlatforms.length === 0) {
      throw new Error("Select at least one target platform");
    }
    return this.videoRepository.enqueueVideos(files, targetPlatforms);
  }
}
