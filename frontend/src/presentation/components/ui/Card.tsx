import type { HTMLAttributes, ReactNode } from "react";

/**
 * A panel CELL, not a floating card: no border, no shadow, no padding, no
 * radius. Seams are supplied by the page shell through `className`
 * (`border-b-[3px] border-ink`, `lg:border-r-[3px]`) on all-but-last child, so
 * a seam is always exactly 3px and never doubled.
 */
export function Card({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`bg-card flex flex-col min-w-0 ${className}`}>{children}</div>;
}

/**
 * The full-bleed ink chapter band. `index` is the decorative chapter number
 * ("01" / "02" / "03"); `meta` is an optional right-aligned acid readout.
 *
 * NOTE: signature changed from the old `CardTitle({ children })` — `index` is
 * required. All three panels are rewritten in this pass.
 */
export function CardTitle({
  index,
  children,
  meta,
}: {
  index: string;
  children: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <header className="flex items-center gap-3 bg-ink text-paper px-4 py-2.5">
      <h2 className="font-mono text-[12px] font-semibold uppercase tracking-[.1em] text-paper">
        {children}
      </h2>
      {meta && (
        <span className="ml-auto font-mono text-[11px] uppercase tracking-[.08em] text-acid">
          {meta}
        </span>
      )}
      <span
        className={`font-mono text-[20px] font-bold leading-none text-acid tabular-nums ${
          meta ? "" : "ml-auto"
        }`}
        aria-hidden="true"
      >
        {index}
      </span>
    </header>
  );
}

/** Panel padding lives here, never on Card, so the ink band can bleed edge to edge. */
export function CardBody({
  children,
  className = "",
  ...rest
}: {
  children: ReactNode;
  className?: string;
} & HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={`p-5 ${className}`} {...rest}>
      {children}
    </div>
  );
}
