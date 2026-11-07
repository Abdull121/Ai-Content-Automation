const CYCLE_INTERVAL_MS = 5 * 60 * 1000;

export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { runPublishCycle } = await import("@/infrastructure/publish/runPublishCycle");
  const { cleanupPublishedVideos } = await import("@/infrastructure/publish/cleanupPublishedVideos");

  const tick = async () => {
    try {
      const result = await runPublishCycle();
      const published = result.attempts.filter((a) => a.outcome === "published").length;
      console.log(
        `[publish-engine] ${result.ranAt} withinWindow=${result.withinWindow} published=${published} attempts=${result.attempts.length}`
      );
    } catch (error) {
      console.error("[publish-engine] cycle failed", error);
    }

    try {
      const { cleaned } = await cleanupPublishedVideos();
      if (cleaned.length > 0) console.log(`[publish-engine] cleaned up storage for ${cleaned.length} video(s)`);
    } catch (error) {
      console.error("[publish-engine] cleanup failed", error);
    }
  };

  setInterval(tick, CYCLE_INTERVAL_MS);
  // Also run one cycle shortly after boot rather than waiting a full interval.
  setTimeout(tick, 10_000);
}
