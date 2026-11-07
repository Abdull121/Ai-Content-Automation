import { ScheduleConfig } from "../entities/ScheduleConfig";

export interface ScheduleConfigRepository {
  getConfig(): Promise<ScheduleConfig>;
  saveConfig(config: ScheduleConfig): Promise<void>;
}
