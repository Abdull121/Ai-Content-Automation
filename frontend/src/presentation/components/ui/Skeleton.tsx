/**
 * Replaces both bare `Loading...` strings. Flat ink-bordered rectangles with a
 * single hard-edged acid sweep — the same printed language as everything else.
 *
 * Every loading region must carry `aria-busy="true"` on its container plus a
 * visually hidden `<span className="hc-sr">Loading</span>`.
 */
export function SkeletonBlock({ className = "" }: { className?: string }) {
  return <div className={`hc-skeleton border-2 border-ink ${className}`} aria-hidden="true" />;
}

/** Reproduces the real account tile geometry exactly, so nothing jumps on load. */
export function SkeletonAccountTile() {
  return (
    <div
      className="flex min-w-0 border-b-2 border-ink last:border-b-0 md:border-b-0 md:border-r-2 md:last:border-r-0"
      aria-hidden="true"
    >
      <div className="w-[10px] shrink-0 self-stretch bg-paper" />
      <div className="min-w-0 flex-1 p-4 space-y-3">
        <SkeletonBlock className="h-[18px] w-[92px]" />
        <SkeletonBlock className="h-[14px] w-[130px]" />
        <SkeletonBlock className="h-[34px] w-[86px]" />
        <SkeletonBlock className="h-[14px] w-full" />
      </div>
    </div>
  );
}

/** Timezone select, hour strip, legend, three number rows, save button. */
export function SkeletonScheduleBody() {
  return (
    <div className="space-y-4" aria-hidden="true">
      <SkeletonBlock className="h-[44px] w-full" />
      <SkeletonBlock className="h-[30px] w-full" />
      <SkeletonBlock className="h-[26px] w-full" />
      <SkeletonBlock className="h-[44px] w-full" />
      <SkeletonBlock className="h-[44px] w-full" />
      <SkeletonBlock className="h-[44px] w-full" />
      <SkeletonBlock className="h-[44px] w-[160px]" />
    </div>
  );
}
