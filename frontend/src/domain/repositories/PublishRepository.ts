import { PublishCycleResult } from "../entities/PublishCycleResult";

export interface PublishRepository {
  runCycle(): Promise<PublishCycleResult>;
}
