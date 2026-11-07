import "server-only";

/** Returns the current hour (0-23) in the given IANA timezone. */
function currentHourIn(timezone: string): number {
  const formatted = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "numeric",
    hour12: false,
  }).format(new Date());
  // "24" shows up at midnight in some ICU implementations instead of "0".
  return Number(formatted) % 24;
}

export function isWithinPostingWindow(timezone: string, startHour: number, endHour: number): boolean {
  const hour = currentHourIn(timezone);
  return hour >= startHour && hour < endHour;
}
