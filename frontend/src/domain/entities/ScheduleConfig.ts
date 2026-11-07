import { Platform } from "./Platform";

export interface ScheduleWindow {
  timezone: string;
  startHour: number;
  endHour: number;
}

export interface ScheduleConfig {
  window: ScheduleWindow;
  maxPostsPerDay: Record<Platform, number>;
}
