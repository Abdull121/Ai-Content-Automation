import { Platform } from "./Platform";

export type ConnectionStatus = "connected" | "disconnected" | "expiring_soon";

export interface SocialAccount {
  id: string;
  platform: Platform;
  handle: string;
  status: ConnectionStatus;
  dailyPostCount: number;
  dailyPostLimit: number;
}
