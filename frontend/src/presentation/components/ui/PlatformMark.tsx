import type { Platform } from "@/domain/entities/Platform";

/**
 * PLATFORM and STATUS are separated by SHAPE AND POSITION, not hue.
 * Platform reads on the LEFT (rail + two-letter tag), status on the RIGHT
 * (stamp). This rule is what makes the queue scannable before colour is parsed
 * and it must never be relaxed.
 *
 * There are no platform icon glyphs anywhere in the system. The rail plus the
 * two-letter tag is the whole platform vocabulary.
 */
export const PLATFORM_TAG: Record<Platform, string> = {
  youtube: "YT",
  instagram: "IG",
  tiktok: "TT",
};

export const PLATFORM_BG: Record<Platform, string> = {
  youtube: "bg-yt",
  instagram: "bg-ig",
  tiktok: "bg-tt",
};

export const PLATFORM_FG: Record<Platform, string> = {
  youtube: "text-ink",
  instagram: "text-white",
  tiktok: "text-ink",
};

/**
 * A 10px-wide solid bar on the LEFT edge of any card or row. A video targeting
 * all three platforms shows three stacked colour bands in one 10px rail.
 * Never a pill, never on the right.
 *
 * Pass `className="hc-rail-run"` while a row is publishing.
 */
export function PlatformRail({
  platforms,
  className = "",
}: {
  platforms: Platform[];
  className?: string;
}) {
  return (
    <div
      className={`w-[10px] shrink-0 self-stretch flex flex-col ${className}`}
      aria-hidden="true"
    >
      {platforms.map((platform) => (
        <div key={platform} className={`flex-1 ${PLATFORM_BG[platform]}`} />
      ))}
    </div>
  );
}

/** Two letters, always uppercase, always ink-bordered. */
export function PlatformTag({ platform }: { platform: Platform }) {
  return (
    <span
      className={`inline-flex items-center border-2 border-ink px-1.5 py-px font-mono text-[11px] font-bold tracking-[.06em] ${PLATFORM_BG[platform]} ${PLATFORM_FG[platform]}`}
    >
      {PLATFORM_TAG[platform]}
    </span>
  );
}
