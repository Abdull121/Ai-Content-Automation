import { ScheduleConfigRepository } from "@/domain/repositories/ScheduleConfigRepository";
import { ScheduleConfig } from "@/domain/entities/ScheduleConfig";

export class AppwriteScheduleConfigRepository implements ScheduleConfigRepository {
  async getConfig(): Promise<ScheduleConfig> {
    const res = await fetch("/api/schedule");
    if (!res.ok) throw new Error("Failed to load schedule config");
    return res.json();
  }

  async saveConfig(config: ScheduleConfig): Promise<void> {
    const res = await fetch("/api/schedule", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    if (!res.ok) throw new Error("Failed to save schedule config");
  }
}
