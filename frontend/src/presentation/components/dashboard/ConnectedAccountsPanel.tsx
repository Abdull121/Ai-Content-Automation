"use client";

import { useEffect, useState, type ComponentType, type SVGProps } from "react";
import { container } from "@/infrastructure/container";
import { SocialAccount } from "@/domain/entities/SocialAccount";
import { PLATFORM_LABELS, type Platform } from "@/domain/entities/Platform";
import { Card, CardTitle, CardBody } from "@/presentation/components/ui/Card";
import { Badge } from "@/presentation/components/ui/Badge";
import { Button } from "@/presentation/components/ui/Button";
import { Notice } from "@/presentation/components/ui/Notice";
import {
  PLATFORM_BG,
  PLATFORM_FG,
  PlatformRail,
} from "@/presentation/components/ui/PlatformMark";
import { SegmentMeter, quotaRatio } from "@/presentation/components/ui/SegmentMeter";
import { SkeletonAccountTile } from "@/presentation/components/ui/Skeleton";

const STATUS_LABELS: Record<SocialAccount["status"], string> = {
  connected: "Connected",
  disconnected: "Not connected",
  expiring_soon: "Expiring soon",
};

// YouTube and Instagram have registered OAuth apps; TikTok's audit for public
// posting is still pending, so its Connect button stays informational only —
// see backend/scripts/seed-accounts.mjs and the platform approval roadmap.
const OAUTH_AVAILABLE: Record<Platform, boolean> = {
  youtube: true,
  instagram: true,
  tiktok: false,
};

const CONNECT_ERROR_MESSAGES: Record<string, string> = {
  invalid_state: "Connection request expired or was tampered with — please try again.",
  no_refresh_token: "Google didn't return a refresh token — revoke access in your Google Account and reconnect.",
  missing_app_secret: "Instagram app secret isn't configured yet on the server.",
  code_exchange_failed: "Instagram rejected the authorization code.",
  token_exchange_failed: "Failed to exchange the Instagram token.",
};

function parseConnectFeedback(search: string) {
  const params = new URLSearchParams(search);
  const connected = params.get("connected");
  const connectError = params.get("connect_error");
  if (!connected && !connectError) return null;

  if (connected) {
    return { tone: "success" as const, text: `${PLATFORM_LABELS[connected as Platform]} connected.` };
  }
  const [platform, reason] = (connectError ?? "").split(":");
  const label = PLATFORM_LABELS[platform as Platform] ?? platform;
  const message = CONNECT_ERROR_MESSAGES[reason] ?? "Something went wrong while connecting.";
  return { tone: "error" as const, text: `${label}: ${message}` };
}

/* ──────────────────────────────────────────────────────────────────────────
   PLATFORM GLYPHS — hand-written inline SVG, no packages, `currentColor` only.
   They are DECORATIVE (aria-hidden): platform identity is already carried by
   the 10px rail on the left edge and the full platform name in ink. The glyph
   sits inside a 2px ink-bordered plate filled with the platform hue, so the
   hue is always enclosed by ink and never a free-floating field — same law as
   the stamps and the meter.
   16×16 viewBox, strokeWidth 2, square caps: the geometry agrees with the
   borders everywhere else in the system.
   ────────────────────────────────────────────────────────────────────────── */

type GlyphProps = SVGProps<SVGSVGElement>;

function Glyph({ children, ...rest }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 16 16"
      width={16}
      height={16}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="square"
      strokeLinejoin="miter"
      aria-hidden={true}
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  );
}

/** Screen + play triangle. */
function GlyphYouTube(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="1.4" y="3.4" width="13.2" height="9.2" />
      <path d="M6.6 6.1 L10.6 8 L6.6 9.9 Z" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Square body, lens, corner light. */
function GlyphInstagram(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <rect x="1.4" y="1.4" width="13.2" height="13.2" />
      <circle cx="8" cy="8" r="3.1" />
      <rect x="10.9" y="3.4" width="1.9" height="1.9" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

/** Note: square head, stem, flag. */
function GlyphTikTok(props: GlyphProps) {
  return (
    <Glyph {...props}>
      <path d="M7 11.2 V2.4 H8.7 C8.7 4.8 10.3 6 12.6 6" />
      <rect x="2.6" y="8.8" width="4.4" height="4.4" fill="currentColor" stroke="none" />
    </Glyph>
  );
}

const PLATFORM_GLYPH: Record<Platform, ComponentType<GlyphProps>> = {
  youtube: GlyphYouTube,
  instagram: GlyphInstagram,
  tiktok: GlyphTikTok,
};

/** Hue plate + glyph. Decorative — the name beside it carries the meaning. */
function PlatformPlate({ platform }: { platform: Platform }) {
  const Mark = PLATFORM_GLYPH[platform];
  return (
    <span
      className={`inline-flex h-[28px] w-[28px] shrink-0 items-center justify-center border-2 border-ink ${PLATFORM_BG[platform]} ${PLATFORM_FG[platform]}`}
      aria-hidden="true"
    >
      <Mark />
    </span>
  );
}

const pad2 = (n: number) => String(n).padStart(2, "0");

export function ConnectedAccountsPanel({ className = "" }: { className?: string }) {
  const [accounts, setAccounts] = useState<SocialAccount[]>([]);
  const [loading, setLoading] = useState(true);
  // Lazily reads the ?connected= / ?connect_error= params the OAuth callback
  // routes redirect back with — computed once during the initial render
  // rather than via a setState-in-effect, since it never needs to re-run.
  const [feedback] = useState<ReturnType<typeof parseConnectFeedback>>(() =>
    typeof window === "undefined" ? null : parseConnectFeedback(window.location.search)
  );

  useEffect(() => {
    container.getConnectedAccounts.execute().then((result) => {
      setAccounts(result);
      setLoading(false);
    });
  }, []);

  // Strips the feedback params from the URL so a refresh doesn't re-show them.
  useEffect(() => {
    if (!feedback) return;
    window.history.replaceState(null, "", window.location.pathname);
  }, [feedback]);

  function handleConnect(platform: Platform) {
    if (!OAUTH_AVAILABLE[platform]) return;
    window.location.assign(`/api/auth/${platform}/start`);
  }

  // Derived in render from the array the component already holds — no new data flow.
  const live = accounts.filter((a) => a.status === "connected").length;

  return (
    <Card className={className}>
      <CardTitle index="01" meta={loading ? undefined : `${live}/${accounts.length} LIVE`}>
        Accounts
      </CardTitle>
      <CardBody className="space-y-3">
        {feedback &&
          (feedback.tone === "error" ? (
            <Notice>{feedback.text}</Notice>
          ) : (
            <div
              role="status"
              className="hc-msg-in border-2 border-ink bg-acid px-3 py-2.5 font-mono text-[13px] font-bold uppercase tracking-[.05em] text-ink"
            >
              {feedback.text}
            </div>
          ))}
        {loading ? (
          <div className="border-2 border-ink bg-paper p-3" aria-busy="true">
            <span className="hc-sr">Loading accounts</span>
            <div className="grid grid-cols-1 md:grid-cols-3 border-2 border-ink bg-card">
              <SkeletonAccountTile />
              <SkeletonAccountTile />
              <SkeletonAccountTile />
            </div>
          </div>
        ) : (
          <div className="border-2 border-ink bg-paper p-3">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-0 border-2 border-ink bg-card">
              {accounts.map((account) => {
                const ratio = quotaRatio(account.dailyPostCount, account.dailyPostLimit);
                const remaining = Math.max(0, account.dailyPostLimit - account.dailyPostCount);
                const pct = Math.round(ratio * 100);

                return (
                  <article
                    key={account.id}
                    className="flex min-w-0 border-b-2 border-ink last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0"
                  >
                    <PlatformRail platforms={[account.platform]} />
                    <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
                      {/* ROW 1 — platform reads LEFT, status reads RIGHT. */}
                      {/* Below sm the stamp drops to its own line (still right
                          aligned) rather than clipping the platform name on a
                          375px viewport — all three tiles stack identically. */}
                      <div className="flex min-w-0 flex-col items-stretch gap-2 sm:flex-row sm:items-center sm:gap-2.5">
                        <div className="flex min-w-0 items-center gap-2.5">
                          <PlatformPlate platform={account.platform} />
                          <span className="truncate text-[15px] font-bold text-ink">
                            {PLATFORM_LABELS[account.platform]}
                          </span>
                        </div>
                        <span className="ml-auto shrink-0">
                          <Badge
                            status={account.status}
                            label={STATUS_LABELS[account.status]}
                          />
                        </span>
                      </div>

                      {/* ROW 2 — handle. 13px muted on white = 6.90:1. */}
                      <p className="truncate font-mono text-[13px] text-muted">
                        @{account.handle}
                      </p>

                      {/* ROW 3 — branching preserved exactly: quota when connected,
                          Connect when not (so expiring_soon still gets Connect). */}
                      {account.status === "connected" && (
                        <div className="mt-auto space-y-2">
                          <div className="flex items-baseline gap-1.5">
                            <span className="font-mono text-[34px] font-bold leading-none tabular-nums text-ink">
                              {pad2(account.dailyPostCount)}
                            </span>
                            <span className="font-mono text-[15px] font-semibold tabular-nums text-muted">
                              /{pad2(account.dailyPostLimit)}
                            </span>
                            <span className="ml-1 font-mono text-[11px] uppercase tracking-[.08em] text-ink">
                              posts today
                            </span>
                            {ratio >= 1 && (
                              <span className="ml-auto inline-flex shrink-0 items-center border-2 border-ink bg-alarm px-1.5 py-px font-mono text-[11px] font-bold uppercase tracking-[.06em] text-white">
                                At cap
                              </span>
                            )}
                            {ratio >= 0.8 && ratio < 1 && (
                              <span className="ml-auto inline-flex shrink-0 items-center border-2 border-ink bg-amber px-1.5 py-px font-mono text-[11px] font-bold uppercase tracking-[.06em] text-ink">
                                Near cap
                              </span>
                            )}
                          </div>
                          <SegmentMeter
                            count={account.dailyPostCount}
                            limit={account.dailyPostLimit}
                          />
                          {/* How much of today's ceiling is actually burned —
                              pure ink at 11px (19.2:1), so it is legal and it is
                              the fastest read on the tile. */}
                          <p className="font-mono text-[11px] uppercase tracking-[.08em] tabular-nums text-ink">
                            {pad2(remaining)} left · {pct}% of cap used
                          </p>
                        </div>
                      )}

                      {account.status !== "connected" && (
                        <div className="mt-auto space-y-2">
                          <p className="text-[13px] leading-[1.45] text-muted">
                            {!OAUTH_AVAILABLE[account.platform]
                              ? `${PLATFORM_LABELS[account.platform]} isn't approved for publishing yet — pending platform audit.`
                              : account.status === "expiring_soon"
                                ? "Token expires soon — reconnect to keep publishing."
                                : "Not connected — nothing publishes to this platform."}
                          </p>
                          <Button
                            variant="outline"
                            className="w-full"
                            disabled={!OAUTH_AVAILABLE[account.platform]}
                            aria-label={`Connect ${PLATFORM_LABELS[account.platform]}`}
                            onClick={() => handleConnect(account.platform)}
                          >
                            {OAUTH_AVAILABLE[account.platform] ? "Connect →" : "Pending approval"}
                          </Button>
                        </div>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
