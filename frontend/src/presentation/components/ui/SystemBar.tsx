"use client";

import { useEffect, useState } from "react";
import { container } from "@/infrastructure/container";
import type { SocialAccount } from "@/domain/entities/SocialAccount";
import { PLATFORM_LABELS } from "@/domain/entities/Platform";

/**
 * Reads accounts and ONLY accounts, via the existing container method. No new
 * use case, no new repository call, no data-flow change. Accounts are never
 * mutated by this UI, so neither band can drift out of sync with the panels.
 *
 * The posting window deliberately does NOT appear in either band — it is
 * editable in panel 03 and would go stale the moment it is saved.
 */
export function useAccountsSummary(): { accounts: SocialAccount[]; loading: boolean } {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    container.getConnectedAccounts.execute().then((result) => {
      setAccounts(result);
      setLoading(false);
    });
  }, []);

  return { accounts, loading };
}

/**
 * STICKY AND STATIC. This is the always-visible operational read and it never
 * moves — the marquee-fatigue risk is solved structurally, not by tuning.
 */
export function SystemBar() {
  const { accounts, loading } = useAccountsSummary();
  const live = accounts.filter((a) => a.status === "connected").length;
  const posts = accounts.reduce((n, a) => n + a.dailyPostCount, 0);

  return (
    <header className="sticky top-0 z-40 flex h-12 items-center gap-4 border-b-[3px] border-ink bg-ink px-4 md:px-6">
      <span className="font-mono text-[12px] font-bold uppercase tracking-[.14em] text-paper">
        CONTENT AUTOMATION // AUTOPILOT
      </span>
      <span className="ml-auto hidden sm:inline font-mono text-[12px] uppercase tracking-[.08em] text-acid tabular-nums">
        {loading
          ? ""
          : `${live}/${accounts.length} CHANNELS LIVE · ${posts} POSTS TODAY`}
      </span>
    </header>
  );
}

/**
 * MOVING AND NOT STICKY — sits under the masthead and scrolls out of view the
 * moment the operator starts working. Pauses on hover and focus-within, dies
 * under prefers-reduced-motion, and is aria-hidden because SystemBar already
 * carries the same numbers as static accessible text.
 *
 * If it is ever judged annoying, delete `.hc-marquee__track`'s animation —
 * nothing functional is lost and the strip degrades to a static status line.
 */
export function TickerStrip() {
  const { accounts, loading } = useAccountsSummary();
  const live = accounts.filter((a) => a.status === "connected").length;
  const posts = accounts.reduce((n, a) => n + a.dailyPostCount, 0);

  const items: string[] = loading
    ? []
    : [
        ...accounts.map((a) =>
          a.status === "connected"
            ? `${PLATFORM_LABELS[a.platform].toUpperCase()} ${a.dailyPostCount}/${a.dailyPostLimit}`
            : `${PLATFORM_LABELS[a.platform].toUpperCase()} OFFLINE`
        ),
        `${live}/${accounts.length} CHANNELS LIVE`,
        `${posts} POSTS TODAY`,
      ];

  return (
    <div className="hc-marquee h-[34px] border-y-[3px] border-ink bg-acid" aria-hidden="true">
      <div className="hc-marquee__track h-full items-center">
        {[0, 1].map((pass) =>
          items.map((item, i) => (
            <span
              key={`${pass}-${i}`}
              className="flex items-center gap-2 whitespace-nowrap px-4 font-mono text-[12px] font-bold uppercase tracking-[.12em] text-ink tabular-nums"
            >
              ● {item}
            </span>
          ))
        )}
      </div>
    </div>
  );
}
