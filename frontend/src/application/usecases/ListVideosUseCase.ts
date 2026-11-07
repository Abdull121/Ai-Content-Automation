import { VideoRepository } from "@/domain/repositories/VideoRepository";
import { Video } from "@/domain/entities/Video";

export class ListVideosUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  execute(): Promise<Video[]> {
    return this.videoRepository.listVideos();
  }
}
