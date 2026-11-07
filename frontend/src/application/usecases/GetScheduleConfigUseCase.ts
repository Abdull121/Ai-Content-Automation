import { ScheduleConfigRepository } from "@/domain/repositories/ScheduleConfigRepository";
import { ScheduleConfig } from "@/domain/entities/ScheduleConfig";

export class GetScheduleConfigUseCase {
  constructor(private readonly scheduleConfigRepository: ScheduleConfigRepository) {}

  execute(): Promise<ScheduleConfig> {
    return this.scheduleConfigRepository.getConfig();
  }
}
