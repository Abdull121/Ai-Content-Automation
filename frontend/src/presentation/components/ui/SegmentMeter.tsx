/** Quota as a physical meter. */

export function quotaRatio(count: number, limit: number): number {
  return limit > 0 ? count / limit : 0;
}

/**
 * CELL COUNT IS DERIVED, NOT FIXED — `dailyPostLimit` is arbitrary per account
 * (25 for Instagram in the seed data). At or below 12 the meter is literally
 * one cell per post; above that it is 12 proportional cells.
 *
 * Every cell is enclosed and divided by 2px ink, so segment boundaries are
 * drawn in ink and the fill hue is NEVER the sole delineator — that is what
 * keeps amber (2.2:1 on white) and acid (1.17:1 on white) legal here, and also
 * why neither may ever be used as a free-floating field or as text on white.
 *
 * The numeral beside the meter stays INK at every threshold; the ≥80% / 100%
 * signal is carried by the meter fill plus a NEAR CAP / AT CAP stamp.
 */
export function SegmentMeter({ count, limit }: { count: number; limit: number }) {
  const cells = limit > 0 && limit <= 12 ? limit : 12;
  const ratio = quotaRatio(count, limit);
  const filled = limit > 0 ? Math.min(cells, Math.ceil(ratio * cells)) : 0;
  const fill = ratio >= 1 ? "bg-alarm" : ratio >= 0.8 ? "bg-amber" : "bg-acid";

  return (
    <div
      className="flex h-[14px] w-full border-2 border-ink bg-card"
      role="img"
      aria-label={`${count} of ${limit} posts used today`}
    >
      {Array.from({ length: cells }, (_, i) => (
        <div
          key={i}
          className={`flex-1 border-r-2 border-ink last:border-r-0 ${
            i < filled ? fill : "bg-card"
          }`}
        />
      ))}
    </div>
  );
}
