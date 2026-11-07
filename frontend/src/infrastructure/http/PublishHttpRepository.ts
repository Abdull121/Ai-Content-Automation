import { PublishRepository } from "@/domain/repositories/PublishRepository";
import { PublishCycleResult } from "@/domain/entities/PublishCycleResult";

export class PublishHttpRepository implements PublishRepository {
  async runCycle(): Promise<PublishCycleResult> {
    const res = await fetch("/api/publish/run", { method: "POST" });
    if (!res.ok) throw new Error("Failed to run publish cycle");
    return res.json();
  }
}
