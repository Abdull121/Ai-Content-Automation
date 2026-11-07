import type { ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "outline" | "done";

const VARIANT: Record<ButtonVariant, string> = {
  /** acid fill / ink text (16.7:1). The Save button and any commit action. */
  primary: "bg-acid text-ink",
  /** white fill / ink text; volt on hover-capable pointers (5.91:1). `Connect →`.
   *  Tailwind v4 already wraps the `hover:` variant in @media (hover: hover). */
  outline: "bg-card text-ink hover:bg-volt hover:text-white",
  /** ink fill / acid text. The transient saved state. */
  done: "bg-ink text-acid",
};

/**
 * Press physics come entirely from `.brut`: rest 4px ink offset, hover
 * translate(-1px,-1px) with a 6px offset behind (hover:hover) and
 * (pointer:fine), `:active` translate(4px,4px) with the shadow collapsed to
 * zero. Minimum hit target 44px tall (h-11). Never sets `outline: none`.
 */
export function Button({
  variant = "primary",
  className = "",
  children,
  type = "button",
  ...rest
}: {
  variant?: ButtonVariant;
  children?: ReactNode;
} & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      type={type}
      className={`brut inline-flex items-center justify-center gap-2 border-2 border-ink px-4 h-11 font-mono text-[13px] font-bold uppercase tracking-[.1em] select-none disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none disabled:hover:translate-x-0 disabled:hover:translate-y-0 ${VARIANT[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
