import { ScheduleConfigRepository } from "@/domain/repositories/ScheduleConfigRepository";
import { ScheduleConfig } from "@/domain/entities/ScheduleConfig";

export class SaveScheduleConfigUseCase {
  constructor(private readonly scheduleConfigRepository: ScheduleConfigRepository) {}

  execute(config: ScheduleConfig): Promise<void> {
    for (const [platform, limit] of Object.entries(config.maxPostsPerDay)) {
      if (limit < 1 || limit > 50) {
        throw new Error(`Invalid daily limit for ${platform}: must be between 1 and 50`);
      }
    }
    if (config.window.startHour >= config.window.endHour) {
      throw new Error("Schedule window start hour must be before end hour");
    }
    return this.scheduleConfigRepository.saveConfig(config);
  }
}
