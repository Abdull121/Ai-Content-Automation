import type { ReactNode } from "react";
import { IconWarning } from "./Icon";

/**
 * The single error surface in the system, used identically by UploadPanel and
 * ScheduleSettingsPanel.
 *
 * NO SHAKE. The operator sees these errors repeatedly; a motion-based alert on
 * a control used dozens of times a day becomes an insult by week two. The
 * entrance is a 140ms 4px settle, nothing more.
 *
 * Red is reserved exclusively for failure — Notice, the FAILED stamp, over-cap
 * meter cells, and invalid field borders are the complete list.
 */
export function Notice({ children }: { children: ReactNode }) {
  return (
    <div
      role="alert"
      className="hc-msg-in flex items-start gap-2 border-2 border-alarm bg-card px-3 py-2.5 text-[14px] leading-[1.45] text-alarm shadow-[var(--shadow-brut-alarm)]"
    >
      <IconWarning className="mt-[3px] shrink-0" width={16} height={16} />
      <span>{children}</span>
    </div>
  );
}
