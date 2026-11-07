import type { ComponentType } from "react";
import {
  IconCheck,
  IconClock,
  IconCross,
  IconDot,
  IconEllipsis,
  IconSquare,
  IconWarning,
  type IconProps,
} from "./Icon";

type Tone = {
  bg: string;
  fg: string;
  Glyph: ComponentType<IconProps>;
};

/**
 * Nine states, six distinct glyph shapes — the queue stays readable in pure
 * greyscale, and the one hue collision in the palette (YouTube #FF4D00 rail vs
 * FAILED #D10D0D stamp) is defused structurally: different colour, different
 * shape, different side of the row.
 */
const TONE: Record<string, Tone> = {
  queued:              { bg: "bg-card",  fg: "text-ink",   Glyph: IconSquare },
  disconnected:        { bg: "bg-card",  fg: "text-ink",   Glyph: IconSquare },
  generating_metadata: { bg: "bg-acid",  fg: "text-ink",   Glyph: IconEllipsis },
  scheduled:           { bg: "bg-volt",  fg: "text-white", Glyph: IconClock },
  publishing:          { bg: "bg-amber", fg: "text-ink",   Glyph: IconDot },
  expiring_soon:       { bg: "bg-amber", fg: "text-ink",   Glyph: IconWarning },
  published:           { bg: "bg-ink",   fg: "text-acid",  Glyph: IconCheck },
  connected:           { bg: "bg-ink",   fg: "text-acid",  Glyph: IconCheck },
  failed:              { bg: "bg-alarm", fg: "text-white", Glyph: IconCross },
};

/**
 * The rubber stamp. Signature is byte-identical to the previous Badge, so every
 * existing call site keeps working. Covers both account connection states and
 * video statuses; unknown statuses fall back to `disconnected`.
 */
export function Badge({ status, label }: { status: string; label: string }) {
  const { bg, fg, Glyph } = TONE[status] ?? TONE.disconnected;

  // Derived from STATUS, never from list index, so nothing reshuffles on
  // re-render or reorder. Exactly one status tilts.
  const tilt = status === "published" ? "rotate-[-1.25deg]" : "";

  const glyph =
    status === "publishing" ? (
      <span className="hc-pulse inline-flex">
        <Glyph />
      </span>
    ) : status === "generating_metadata" ? (
      <span className="hc-blip inline-flex">
        <Glyph />
      </span>
    ) : (
      <Glyph />
    );

  return (
    <span
      className={`inline-flex shrink-0 items-center gap-1.5 border-2 border-ink px-2 py-[3px] font-mono text-[11px] font-bold uppercase tracking-[.08em] shadow-[var(--shadow-brut-xs)] ${bg} ${fg} ${tilt}`}
    >
      {glyph}
      {label}
    </span>
  );
}
