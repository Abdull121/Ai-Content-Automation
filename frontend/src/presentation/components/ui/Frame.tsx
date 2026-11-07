import type { ReactNode } from "react";

/**
 * The printed sheet. 3px ink border, white fill, the ONLY 8px shadow on the
 * page, plus the four registration crosses (two from `.hc-frame::before/after`,
 * two from the `.hc-reg` overlay).
 *
 * Nothing inside it gets a 3px border except the panel seams, which keeps the
 * border hierarchy readable:
 *   FRAME 3px › SEAM 3px › WELL 2px › TILE/ROW/CONTROL/STAMP 2px
 */
export function Frame({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={`hc-frame ${className}`}>
      <div className="hc-reg" aria-hidden="true" />
      {children}
    </div>
  );
}
