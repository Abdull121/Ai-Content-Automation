import type {
  InputHTMLAttributes,
  ReactNode,
  SelectHTMLAttributes,
} from "react";
import { IconChevron, IconWarning } from "./Icon";

/**
 * 12px is the floor for the structural mono layer. 11px is permitted ONLY for
 * ink-coloured text and stamp interiors; muted grey is never used below 13px.
 */
export function FieldLabel({
  htmlFor,
  children,
  className = "",
}: {
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label
      htmlFor={htmlFor}
      className={`block font-mono text-[12px] font-semibold uppercase tracking-[.1em] text-ink mb-2 ${className}`}
    >
      {children}
    </label>
  );
}

/**
 * `muted` = #5A5A5A at 13px (6.90:1 on white).
 * `alarm` = red at 13px (5.56:1) plus the 140ms settle entrance and a warning
 * glyph. No shake, ever.
 */
export function FieldHint({
  children,
  tone = "muted",
}: {
  children: ReactNode;
  tone?: "muted" | "alarm";
}) {
  if (tone === "alarm") {
    return (
      <p className="hc-msg-in mt-2 text-[13px] leading-[1.45] text-alarm">
        <IconWarning className="inline-block mr-1.5 align-[-1px]" />
        {children}
      </p>
    );
  }
  return <p className="mt-2 text-[13px] leading-[1.45] text-muted">{children}</p>;
}

/** Native chevron suppressed and redrawn square. 44px hit height. */
export function SelectField({
  className = "",
  children,
  ...rest
}: SelectHTMLAttributes<HTMLSelectElement> & { children: ReactNode }) {
  return (
    <div className="relative">
      <select
        className={`hc-select brut w-full h-11 border-2 border-ink bg-card pl-3 pr-9 font-mono text-[13px] text-ink ${className}`}
        {...rest}
      >
        {children}
      </select>
      <IconChevron className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink" />
    </div>
  );
}

/**
 * Native spinners are suppressed (they render round on WebKit and break the
 * square language); the field stays a real `type="number"` so keyboard
 * stepping, min/max and mobile numeric keypads are unchanged.
 */
export function NumberField({
  invalid,
  className = "",
  ...rest
}: InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }) {
  return (
    <input
      type="number"
      className={`hc-number brut h-11 border-2 border-ink bg-card px-3 text-center font-mono text-[15px] font-semibold tabular-nums text-ink ${
        invalid ? "border-alarm shadow-[var(--shadow-brut-alarm)]" : ""
      } ${className}`}
      aria-invalid={invalid || undefined}
      {...rest}
    />
  );
}
