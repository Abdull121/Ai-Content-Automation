import { AppwriteSocialAccountRepository } from "./appwrite/AppwriteSocialAccountRepository";
import { AppwriteVideoRepository } from "./appwrite/AppwriteVideoRepository";
import { AppwriteScheduleConfigRepository } from "./appwrite/AppwriteScheduleConfigRepository";
import { PublishHttpRepository } from "./http/PublishHttpRepository";

import { GetConnectedAccountsUseCase } from "@/application/usecases/GetConnectedAccountsUseCase";
import { ListVideosUseCase } from "@/application/usecases/ListVideosUseCase";
import { UploadVideosUseCase } from "@/application/usecases/UploadVideosUseCase";
import { GetScheduleConfigUseCase } from "@/application/usecases/GetScheduleConfigUseCase";
import { SaveScheduleConfigUseCase } from "@/application/usecases/SaveScheduleConfigUseCase";
import { RunPublishCycleUseCase } from "@/application/usecases/RunPublishCycleUseCase";
import { DeleteVideoUseCase } from "@/application/usecases/DeleteVideoUseCase";

// These call the Next.js API routes under src/app/api/*, which are the only
// part of the app allowed to hold the Appwrite API key (see serverClient.ts).
const socialAccountRepository = new AppwriteSocialAccountRepository();
const videoRepository = new AppwriteVideoRepository();
const scheduleConfigRepository = new AppwriteScheduleConfigRepository();
const publishRepository = new PublishHttpRepository();

export const container = {
  getConnectedAccounts: new GetConnectedAccountsUseCase(socialAccountRepository),
  listVideos: new ListVideosUseCase(videoRepository),
  uploadVideos: new UploadVideosUseCase(videoRepository),
  getScheduleConfig: new GetScheduleConfigUseCase(scheduleConfigRepository),
  saveScheduleConfig: new SaveScheduleConfigUseCase(scheduleConfigRepository),
  runPublishCycle: new RunPublishCycleUseCase(publishRepository),
  deleteVideo: new DeleteVideoUseCase(videoRepository),
};
