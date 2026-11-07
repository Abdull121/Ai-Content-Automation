"use client";

import { useEffect, useRef, useState } from "react";
import { container } from "@/infrastructure/container";
import { Video } from "@/domain/entities/Video";
import { Platform, ALL_PLATFORMS, PLATFORM_LABELS } from "@/domain/entities/Platform";
import { Card, CardTitle, CardBody } from "@/presentation/components/ui/Card";
import { Badge } from "@/presentation/components/ui/Badge";
import { Notice } from "@/presentation/components/ui/Notice";
import { IconUpload, IconCross } from "@/presentation/components/ui/Icon";
import {
  PLATFORM_BG,
  PLATFORM_FG,
  PlatformRail,
  PlatformTag,
} from "@/presentation/components/ui/PlatformMark";

const STATUS_LABELS: Record<Video["status"], string> = {
  queued: "Queued",
  generating_metadata: "Generating metadata",
  scheduled: "Scheduled",
  publishing: "Publishing",
  published: "Published",
  failed: "Failed",
};

// AI metadata generation runs in the background after upload (see the
// `after()` call in api/videos/route.ts) — a video is still "in flight" if
// it's actively generating, or if it's queued with no metadata yet (meaning
// generation hasn't started or the poll caught it mid-transition).
function isAwaitingMetadata(video: Video): boolean {
  return video.status === "generating_metadata" || (video.status === "queued" && !video.metadata);
}

const POLL_INTERVAL_MS = 3000;

export function UploadPanel() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(["youtube", "instagram"]);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingIds, setPendingIds] = useState<Set<string>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    container.listVideos.execute().then(setVideos);
  }, []);

  // Polls while any freshly-uploaded video hasn't settled (generated
  // metadata or failed) yet — stops itself once nothing is pending.
  useEffect(() => {
    if (pendingIds.size === 0) return;

    const interval = setInterval(async () => {
      const latest = await container.listVideos.execute();
      setVideos(latest);
      setPendingIds((prev) => {
        const next = new Set(prev);
        for (const video of latest) {
          if (next.has(video.id) && !isAwaitingMetadata(video)) next.delete(video.id);
        }
        return next;
      });
    }, POLL_INTERVAL_MS);

    return () => clearInterval(interval);
  }, [pendingIds.size]);

  function togglePlatform(platform: Platform) {
    setSelectedPlatforms((prev) =>
      prev.includes(platform) ? prev.filter((p) => p !== platform) : [...prev, platform]
    );
  }

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    try {
      const newVideos = await container.uploadVideos.execute(
        Array.from(fileList),
        selectedPlatforms
      );
      setVideos((prev) => [...newVideos, ...prev]);
      setPendingIds((prev) => new Set([...prev, ...newVideos.map((v) => v.id)]));
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    }
  }

  async function handleDelete(id: string) {
    if (!window.confirm("Delete this video and its uploaded file? This can't be undone.")) return;
    setDeletingIds((prev) => new Set(prev).add(id));
    try {
      await container.deleteVideo.execute(id);
      setVideos((prev) => prev.filter((v) => v.id !== id));
    } catch {
      setError("Failed to delete video");
      setDeletingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  return (
    <Card>
      <CardTitle index="02" meta={`${videos.length} items`}>
        Upload
      </CardTitle>

      <CardBody className="space-y-4">
        {/* ——— TARGET PLATFORMS ——— */}
        <div className="flex flex-wrap gap-3" role="group" aria-label="Target platforms">
          {ALL_PLATFORMS.map((platform) => {
            const isSelected = selectedPlatforms.includes(platform);
            return (
              <button
                key={platform}
                type="button"
                aria-pressed={isSelected}
                onClick={() => togglePlatform(platform)}
                className={`brut inline-flex h-11 items-center gap-2 border-2 border-ink px-3 font-mono text-[12px] font-bold uppercase tracking-[.1em] select-none ${
                  isSelected
                    ? `${PLATFORM_BG[platform]} ${PLATFORM_FG[platform]}`
                    : "bg-card text-muted shadow-none"
                }`}
              >
                <span
                  className={`h-2.5 w-2.5 shrink-0 border-2 border-ink ${
                    isSelected ? "bg-ink" : "bg-card"
                  }`}
                  aria-hidden="true"
                />
                {PLATFORM_LABELS[platform]}
              </button>
            );
          })}
        </div>

        {/* ——— DROPZONE ——— */}
        <div
          role="button"
          tabIndex={0}
          aria-label="Drag and drop videos here, or activate to select files"
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            handleFiles(e.dataTransfer.files);
          }}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              fileInputRef.current?.click();
            }
          }}
          className={`brut flex min-h-[150px] cursor-pointer flex-col items-center justify-center gap-3 border-[3px] p-8 text-center ${
            isDragging
              ? "border-solid border-volt bg-[#e8edff] hc-dropzone--drag"
              : "border-dashed border-ink bg-card"
          }`}
        >
          <IconUpload className="text-ink" />
          <p className="text-[15px] font-semibold text-ink">
            Drag &amp; drop videos here, or click to select (50-100 files supported)
          </p>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="video/*"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
        </div>

        {error && <Notice>{error}</Notice>}

        {/* ——— QUEUE ——— */}
        <div>
          <div className="mb-2 flex items-baseline gap-2">
            <h3 className="font-mono text-[12px] font-semibold uppercase tracking-[.1em] text-ink">
              Queue
            </h3>
            <span className="ml-auto font-mono text-[12px] tabular-nums text-muted">
              {videos.length} items
            </span>
          </div>

          <div className="hc-scroll max-h-[420px] overflow-y-auto overscroll-contain border-2 border-ink bg-paper p-2">
            {videos.length === 0 ? (
              <p className="px-1 py-3 text-[13px] leading-[1.45] text-muted">
                Nothing queued yet — drop files above to start a batch.
              </p>
            ) : (
              <div className="space-y-2">
                {videos.map((video) => (
                  <article
                    key={video.id}
                    className={`hc-stamp-in brut-sm relative flex min-h-[60px] items-center border-2 border-ink py-2.5 ${
                      video.status === "published" ? "bg-paper" : "bg-card"
                    }`}
                  >
                    <PlatformRail
                      platforms={video.targetPlatforms}
                      className={video.status === "publishing" ? "hc-rail-run" : ""}
                    />
                    <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-mono text-[13px] font-semibold text-ink">
                          {video.fileName}
                        </p>
                        {video.metadata?.title && (
                          <p className="mt-0.5 truncate text-[13px] leading-[1.3] text-ink">
                            {video.metadata.title}
                          </p>
                        )}
                        <div className="mt-1 flex flex-wrap items-center gap-1">
                          {video.targetPlatforms.map((p) => (
                            <PlatformTag key={p} platform={p} />
                          ))}
                          <span className="hc-sr">
                            {video.targetPlatforms.map((p) => PLATFORM_LABELS[p]).join(", ")}
                          </span>
                          {video.metadata?.hashtags && video.metadata.hashtags.length > 0 && (
                            <span className="truncate font-mono text-[11px] text-muted">
                              {video.metadata.hashtags.slice(0, 4).join(" ")}
                            </span>
                          )}
                        </div>
                        {video.status === "scheduled" && video.scheduledAt && (
                          <p className="mt-0.5 font-mono text-[11px] text-muted">
                            Goes out{" "}
                            {new Date(video.scheduledAt).toLocaleString(undefined, {
                              weekday: "short",
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </p>
                        )}
                        {video.status === "failed" && video.errorMessage && (
                          <p className="mt-0.5 truncate text-[11px] text-alarm" title={video.errorMessage}>
                            {video.errorMessage}
                          </p>
                        )}
                      </div>
                      <Badge status={video.status} label={STATUS_LABELS[video.status]} />
                      <button
                        type="button"
                        onClick={() => handleDelete(video.id)}
                        disabled={deletingIds.has(video.id)}
                        aria-label={`Delete ${video.fileName}`}
                        className="brut flex h-8 w-8 shrink-0 items-center justify-center border-2 border-ink bg-card text-ink hover:bg-alarm hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <IconCross width={12} height={12} />
                      </button>
                    </div>
                    {video.status === "generating_metadata" && (
                      <span
                        className="hc-scan absolute inset-x-0 bottom-0 h-[3px] bg-acid"
                        aria-hidden="true"
                      />
                    )}
                  </article>
                ))}
              </div>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
