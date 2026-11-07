// Typical high-engagement local hours per timezone (24h, local to that zone).
// Used to auto-fill a sensible default posting window when a user picks a timezone.
// This is a starting point, not a hard rule — users can still adjust the window manually.
export const RECOMMENDED_WINDOWS: Record<string, { startHour: number; endHour: number }> = {
  "America/New_York": { startHour: 17, endHour: 22 },
  "America/Los_Angeles": { startHour: 17, endHour: 22 },
  "America/Chicago": { startHour: 17, endHour: 22 },
  "Asia/Karachi": { startHour: 19, endHour: 23 },
  "Asia/Dubai": { startHour: 19, endHour: 23 },
  "Europe/London": { startHour: 17, endHour: 22 },
  UTC: { startHour: 17, endHour: 22 },
};

export function getRecommendedWindow(timezone: string) {
  return RECOMMENDED_WINDOWS[timezone] ?? { startHour: 17, endHour: 22 };
}
