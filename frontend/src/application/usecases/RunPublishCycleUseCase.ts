import { PublishRepository } from "@/domain/repositories/PublishRepository";
import { PublishCycleResult } from "@/domain/entities/PublishCycleResult";

export class RunPublishCycleUseCase {
  constructor(private readonly publishRepository: PublishRepository) {}

  execute(): Promise<PublishCycleResult> {
    return this.publishRepository.runCycle();
  }
}
