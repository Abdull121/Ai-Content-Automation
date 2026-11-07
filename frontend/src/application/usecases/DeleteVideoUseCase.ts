import { VideoRepository } from "@/domain/repositories/VideoRepository";

export class DeleteVideoUseCase {
  constructor(private readonly videoRepository: VideoRepository) {}

  execute(id: string): Promise<void> {
    return this.videoRepository.deleteVideo(id);
  }
}
