import { Platform } from "./Platform";

export type VideoStatus =
  | "queued"
  | "generating_metadata"
  | "scheduled"
  | "publishing"
  | "published"
  | "failed";

export interface GeneratedMetadata {
  title: string;
  description: string;
  hashtags: string[];
}

export interface Video {
  id: string;
  fileName: string;
  fileUrl: string;
  targetPlatforms: Platform[];
  status: VideoStatus;
  metadata?: GeneratedMetadata;
  scheduledAt?: string;
  errorMessage?: string;
  createdAt: string;
}
