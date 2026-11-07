import type { SVGProps } from "react";

/**
 * Hand-written inline SVG only — no icon packages, no CDN assets.
 *
 * Every status glyph is a 12x12 viewBox rendered at 12x12, stroke=currentColor,
 * strokeWidth=2, strokeLinecap="square", fill="none". Square caps, not round —
 * the geometry has to agree with the borders.
 *
 * Props are plain SVG props, so `className`, `width`, `height` and any aria
 * override all pass through: <IconWarning className="mt-1" width={16} height={16} />
 */
export type IconProps = SVGProps<SVGSVGElement>;

const BASE: SVGProps<SVGSVGElement> = {
  viewBox: "0 0 12 12",
  width: 12,
  height: 12,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "square",
  "aria-hidden": true,
  focusable: "false",
};

/** published / connected */
export function IconCheck(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M2 6.2 L4.9 9.1 L10 2.7" />
    </svg>
  );
}

/** failed */
export function IconCross(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M2 2 L10 10 M10 2 L2 10" />
    </svg>
  );
}

/** queued / disconnected (idle = hollow) */
export function IconSquare(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="2.5" y="2.5" width="7" height="7" />
    </svg>
  );
}

/** scheduled */
export function IconClock(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="1.5" y="1.5" width="9" height="9" />
      <path d="M6 3.6 V6.3 L8.2 7.5" />
    </svg>
  );
}

/** publishing — wrap in <span className="hc-pulse"> */
export function IconDot(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <rect x="3" y="3" width="6" height="6" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** generating_metadata — wrap in <span className="hc-blip"> */
export function IconEllipsis(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <g fill="currentColor" stroke="none">
        <rect x="0.5" y="4.75" width="2.5" height="2.5" />
        <rect x="4.75" y="4.75" width="2.5" height="2.5" />
        <rect x="9" y="4.75" width="2.5" height="2.5" />
      </g>
    </svg>
  );
}

/** expiring_soon (12px) and the error Notice (16px via width/height override) */
export function IconWarning(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M6 1.4 L11.2 10.6 H0.8 Z" />
      <path d="M6 5 V7.2" />
      <rect x="5.1" y="8.5" width="1.8" height="1.8" fill="currentColor" stroke="none" />
    </svg>
  );
}

/** select */
export function IconChevron(props: IconProps) {
  return (
    <svg {...BASE} {...props}>
      <path d="M1.5 4 L6 8.5 L10.5 4" />
    </svg>
  );
}

/** dropzone — 28x28, strokeWidth 3 */
export function IconUpload(props: IconProps) {
  return (
    <svg
      {...BASE}
      viewBox="0 0 28 28"
      width={28}
      height={28}
      strokeWidth={3}
      {...props}
    >
      <path d="M14 19 V4 M6.5 11 L14 3.5 L21.5 11 M3 24.5 H25" />
    </svg>
  );
}
