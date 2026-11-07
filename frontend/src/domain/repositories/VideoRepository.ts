import { Video } from "../entities/Video";

export interface VideoRepository {
  listVideos(): Promise<Video[]>;
  enqueueVideos(files: File[], targetPlatforms: Video["targetPlatforms"]): Promise<Video[]>;
  deleteVideo(id: string): Promise<void>;
}
