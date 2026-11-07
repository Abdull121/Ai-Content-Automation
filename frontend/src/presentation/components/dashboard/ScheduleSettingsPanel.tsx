"use client";

import { useEffect, useState } from "react";
import { container } from "@/infrastructure/container";
import { ScheduleConfig } from "@/domain/entities/ScheduleConfig";
import { PublishCycleResult } from "@/domain/entities/PublishCycleResult";
import { ALL_PLATFORMS, PLATFORM_LABELS } from "@/domain/entities/Platform";
import { getRecommendedWindow } from "@/domain/policies/RecommendedPostingWindow";
import { Card, CardTitle, CardBody } from "@/presentation/components/ui/Card";
import {
  FieldLabel,
  FieldHint,
  SelectField,
  NumberField,
} from "@/presentation/components/ui/Field";
import { HourStrip } from "@/presentation/components/ui/HourStrip";
import { PlatformTag } from "@/presentation/components/ui/PlatformMark";
import { Button } from "@/presentation/components/ui/Button";
import { Notice } from "@/presentation/components/ui/Notice";
import { SkeletonScheduleBody } from "@/presentation/components/ui/Skeleton";
import { IconCheck } from "@/presentation/components/ui/Icon";

const TIMEZONES = [
  "America/New_York",
  "America/Los_Angeles",
  "America/Chicago",
  "Asia/Karachi",
  "Asia/Dubai",
  "Europe/London",
  "UTC",
];

function formatHour(hour: number) {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

export function ScheduleSettingsPanel() {
  const [config, setConfig] = useState<ScheduleConfig | null>(null);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [publishResult, setPublishResult] = useState<PublishCycleResult | null>(null);
  const [publishing, setPublishing] = useState(false);
  const [publishError, setPublishError] = useState<string | null>(null);

  useEffect(() => {
    container.getScheduleConfig.execute().then(setConfig);
  }, []);

  async function handleRunPublishCycle() {
    setPublishing(true);
    setPublishError(null);
    try {
      const result = await container.runPublishCycle.execute();
      setPublishResult(result);
    } catch (e) {
      setPublishError(e instanceof Error ? e.message : "Failed to run publish cycle");
    } finally {
      setPublishing(false);
    }
  }

  async function handleSave() {
    if (!config) return;
    setError(null);
    setSaved(false);
    try {
      await container.saveScheduleConfig.execute(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to save");
    }
  }

  if (!config) {
    return (
      <Card>
        <CardTitle index="03">Schedule</CardTitle>
        <CardBody aria-busy="true">
          <span className="hc-sr">Loading schedule</span>
          <SkeletonScheduleBody />
        </CardBody>
      </Card>
    );
  }

  // Two derived values, no new state. The strip and the inline hint both read
  // them; the sliders remain the sole input and the use case remains
  // authoritative on save.
  const windowInvalid = config.window.startHour >= config.window.endHour;
  const recommended = getRecommendedWindow(config.window.timezone);

  return (
    <Card>
      <CardTitle
        index="03"
        meta={`${formatHour(config.window.startHour)}–${formatHour(config.window.endHour)}`}
      >
        Schedule
      </CardTitle>

      <CardBody className="space-y-6">
        {/* ——— 1 · TIMEZONE ——— */}
        <div>
          <FieldLabel htmlFor="tz">Timezone</FieldLabel>
          <SelectField
            id="tz"
            value={config.window.timezone}
            onChange={(e) => {
              const timezone = e.target.value;
              const recommendedWindow = getRecommendedWindow(timezone);
              setConfig({
                ...config,
                window: { ...config.window, timezone, ...recommendedWindow },
              });
            }}
          >
            {TIMEZONES.map((tz) => (
              <option key={tz} value={tz}>
                {tz}
              </option>
            ))}
          </SelectField>
          <FieldHint>
            Posting window below auto-fills to typical high-engagement hours for the selected timezone — adjust it manually if needed.
          </FieldHint>
        </div>

        {/* ——— 2 · POSTING WINDOW ——— */}
        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <span className="font-mono text-[12px] font-semibold uppercase tracking-[.1em] text-ink">
              Posting window
            </span>
            <span className="font-mono text-[15px] font-bold tabular-nums text-ink">
              {formatHour(config.window.startHour)} – {formatHour(config.window.endHour)}
            </span>
          </div>

          {/* The abstract string becomes a bar you read in one saccade. */}
          <HourStrip
            startHour={config.window.startHour}
            endHour={config.window.endHour}
            recommended={recommended}
          />

          <div className="mt-1.5 flex flex-wrap items-center gap-x-4 gap-y-1 font-mono text-[11px] uppercase tracking-[.06em] text-ink">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-4 border-2 border-ink bg-acid" aria-hidden="true" />
              Selected
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-[4px] w-4 bg-volt" aria-hidden="true" />
              Recommended
            </span>
          </div>

          {/* Two independent values, so two stacked sliders — never one line,
              which would imply a single range control. */}
          <label className="mt-3 block">
            <span className="mb-1 block font-mono text-[12px] font-semibold uppercase tracking-[.1em] text-ink">
              Start · <span className="tabular-nums">{formatHour(config.window.startHour)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={23}
              value={config.window.startHour}
              onChange={(e) =>
                setConfig({
                  ...config,
                  window: { ...config.window, startHour: Number(e.target.value) },
                })
              }
              className="hc-range"
              aria-label="Posting window start hour"
              aria-valuetext={formatHour(config.window.startHour)}
            />
          </label>

          <label className="block">
            <span className="mb-1 block font-mono text-[12px] font-semibold uppercase tracking-[.1em] text-ink">
              End · <span className="tabular-nums">{formatHour(config.window.endHour)}</span>
            </span>
            <input
              type="range"
              min={0}
              max={23}
              value={config.window.endHour}
              onChange={(e) =>
                setConfig({
                  ...config,
                  window: { ...config.window, endHour: Number(e.target.value) },
                })
              }
              className="hc-range hc-range--end"
              aria-label="Posting window end hour"
              aria-valuetext={formatHour(config.window.endHour)}
            />
          </label>

          {/* Caught at the slider because that is faster; still caught at the
              use case because that is authoritative. Save stays enabled. */}
          {windowInvalid && (
            <FieldHint tone="alarm">Start hour must be before end hour.</FieldHint>
          )}
        </div>

        {/* ——— 3 · MAX POSTS PER DAY ——— */}
        <div>
          <FieldLabel>Max posts per day (per platform)</FieldLabel>
          <div className="space-y-3">
            {ALL_PLATFORMS.map((platform) => {
              const value = config.maxPostsPerDay[platform];
              return (
                <div key={platform} className="flex items-center gap-3">
                  <PlatformTag platform={platform} />
                  <span className="flex-1 text-[14px] font-semibold text-ink">
                    {PLATFORM_LABELS[platform]}
                  </span>
                  <NumberField
                    className="w-[92px]"
                    min={1}
                    max={50}
                    value={value}
                    invalid={value < 1 || value > 50}
                    aria-label={`Max posts per day for ${PLATFORM_LABELS[platform]}`}
                    onChange={(e) =>
                      setConfig({
                        ...config,
                        maxPostsPerDay: {
                          ...config.maxPostsPerDay,
                          [platform]: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* ——— 4 · ERROR + SAVE ——— */}
        {error && <Notice>{error}</Notice>}

        <Button
          variant={saved ? "done" : "primary"}
          className={
            saved
              ? "hc-saved-flash w-full max-md:sticky max-md:bottom-4"
              : "w-full max-md:sticky max-md:bottom-4"
          }
          onClick={handleSave}
        >
          {saved ? (
            <>
              <IconCheck /> Saved
            </>
          ) : (
            "Save settings"
          )}
        </Button>

        {/* ——— 5 · PUBLISH ENGINE ——— */}
        <div className="border-t-2 border-ink pt-4">
          <FieldLabel>Publish engine</FieldLabel>
          <FieldHint>
            Runs automatically every 5 minutes while the server is up — only inside the posting window and under each platform&apos;s daily limit. Trigger a cycle now to test it immediately.
          </FieldHint>

          <Button
            variant="outline"
            className="mt-2 w-full"
            onClick={handleRunPublishCycle}
            disabled={publishing}
          >
            {publishing ? "Running…" : "Run publish cycle now"}
          </Button>

          {publishError && <Notice>{publishError}</Notice>}

          {publishResult && (
            <div className="mt-3 border-2 border-ink bg-paper p-2.5">
              <p className="font-mono text-[11px] uppercase tracking-[.06em] text-ink">
                {publishResult.withinWindow ? "Ran" : "Skipped — outside posting window"} ·{" "}
                {new Date(publishResult.ranAt).toLocaleTimeString()}
              </p>
              {publishResult.attempts.length === 0 ? (
                <p className="mt-1 text-[13px] text-muted">Nothing to publish.</p>
              ) : (
                <ul className="mt-1.5 space-y-1">
                  {publishResult.attempts.map((attempt, i) => (
                    <li key={i} className="flex items-center gap-2 font-mono text-[12px]">
                      <span
                        className={
                          attempt.outcome === "published"
                            ? "text-ink"
                            : attempt.outcome === "failed"
                              ? "text-alarm"
                              : "text-muted"
                        }
                      >
                        {attempt.outcome === "published" ? "✓" : attempt.outcome === "failed" ? "✕" : "–"}
                      </span>
                      <span className="truncate text-ink">{attempt.fileName}</span>
                      <span className="text-muted">→ {attempt.platform}</span>
                      {attempt.reason && <span className="truncate text-muted">({attempt.reason})</span>}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
