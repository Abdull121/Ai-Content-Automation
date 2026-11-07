// Generic, widely-cited social media peak-engagement hours (local clock hours,
// same idea as RecommendedPostingWindow but at daily-slot granularity). Used to
// decide *when inside the window* each of today's videos should go out, rather
// than dumping everything the moment the queue is checked.
const DEFAULT_ANCHOR_HOURS = [8, 11, 14, 17, 20];

// How many distinct times a day's posts should spread across, at most — past
// this, extra posts cycle back through the same distinct hours (with jitter)
// rather than adding more, since realistic peak-engagement moments are finite.
const MAX_DISTINCT_SLOTS = 6;

function evenlySpaced(startHour: number, endHour: number, count: number): number[] {
  const span = Math.max(1, endHour - startHour);
  const slots = Math.max(1, count);
  return Array.from({ length: slots }, (_, i) => {
    const offset = (i + 0.5) * (span / slots);
    return Math.min(endHour - 1, Math.floor(startHour + offset));
  });
}

/**
 * Returns up to `count` target hours (0-23) inside [startHour, endHour), spread
 * across real peak-engagement times where possible.
 *
 * A window can be too narrow to contain enough of the default anchors to
 * avoid clustering (e.g. a midnight-10am window only contains "8") — when
 * that happens, the real anchor(s) found are blended with evenly-spaced
 * fill hours so the day still gets genuine spread rather than every post
 * landing near the single available peak hour.
 *
 * `afterHour`, when given, excludes anchors at or before that hour — used to
 * assign "today's" remaining slots without picking a peak time that has
 * already passed. Returns an empty array if nothing remains today.
 */
export function computeDailySlotHours(
  startHour: number,
  endHour: number,
  count: number,
  afterHour?: number
): number[] {
  const effectiveStart = afterHour !== undefined ? Math.max(startHour, afterHour + 1) : startHour;
  if (effectiveStart >= endHour) return [];

  const span = endHour - effectiveStart;
  const targetDistinct = Math.min(count, span, MAX_DISTINCT_SLOTS);

  const pool = new Set(DEFAULT_ANCHOR_HOURS.filter((h) => h >= effectiveStart && h < endHour));

  if (pool.size < targetDistinct) {
    for (const hour of evenlySpaced(effectiveStart, endHour, targetDistinct)) {
      if (pool.size >= targetDistinct) break;
      pool.add(hour);
    }
  }

  const sortedPool = [...pool].sort((a, b) => a - b);
  return Array.from({ length: count }, (_, i) => sortedPool[i % sortedPool.length]);
}
