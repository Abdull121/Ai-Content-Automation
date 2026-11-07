import { ConnectedAccountsPanel } from "@/presentation/components/dashboard/ConnectedAccountsPanel";
import { UploadPanel } from "@/presentation/components/dashboard/UploadPanel";
import { ScheduleSettingsPanel } from "@/presentation/components/dashboard/ScheduleSettingsPanel";
import { Frame } from "@/presentation/components/ui/Frame";
import { SystemBar, TickerStrip } from "@/presentation/components/ui/SystemBar";

/**
 * HARD COPY — the printed ops sheet.
 *
 * Server component. The three panels and the two system bands each declare
 * their own client boundary, so nothing here needs one.
 *
 * SEAMS: every seam is a `border-bottom` / `border-right` on all-but-last cell
 * with `gap: 0`, so a seam is always exactly 3px and is never doubled. Below
 * `lg` the vertical seam flips to a horizontal one — that flip is performed by
 * the `lg:border-b-0` inside SEAM_COL.
 *
 * BORDER HIERARCHY: FRAME 3px › SEAM 3px › WELL 2px › TILE/ROW/CONTROL 2px.
 * `Frame` supplies the only 3px outer border, the only 8px shadow and the four
 * registration crosses; panels inside it own no border and no shadow.
 *
 * DOM order is Accounts → Upload → Schedule at every breakpoint, which is also
 * the reading order: connect → upload → schedule.
 */
export default function DashboardPage() {
  const SEAM_ROW = "border-b-[3px] border-ink";
  const SEAM_COL = "lg:border-r-[3px] lg:border-ink lg:border-b-0";

  return (
    <>
      {/* Sticky, static operational read. Never animates. */}
      <SystemBar />

      <main className="flex-1 w-full mx-auto max-w-[1280px] px-4 md:px-6 pb-14">
        {/* MASTHEAD — set on paper, bleeding to the frame edge */}
        <header className="pt-10 md:pt-14">
          <h1 className="font-sans font-extrabold uppercase text-ink text-[clamp(2.75rem,8vw,5.25rem)] leading-[0.86] tracking-[-0.04em]">
            Content
            <br />
            Automation
          </h1>
          <div className="mt-4 h-[3px] w-full bg-ink" aria-hidden="true" />
          <p className="mt-4 max-w-[62ch] text-[15px] leading-[1.45] text-muted">
            Bulk upload, schedule, and auto-generate metadata across YouTube, Instagram, and TikTok.
          </p>
        </header>

        {/* TICKER — the only moving element, and it scrolls away the moment work starts */}
        <div className="mt-6">
          <TickerStrip />
        </div>

        {/* THE SPREAD */}
        <Frame className="mt-6">
          {/* ROW A — accounts get the full width: three tiles across */}
          <div className={SEAM_ROW}>
            <ConnectedAccountsPanel />
          </div>

          {/* ROW B — upload is the daily-work surface; schedule is a 380px sticky rail */}
          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className={`${SEAM_ROW} ${SEAM_COL} min-w-0`}>
              <UploadPanel />
            </div>
            <div className="min-w-0 lg:sticky lg:top-[calc(3rem+16px)] lg:self-start">
              <ScheduleSettingsPanel />
            </div>
          </div>
        </Frame>
      </main>
    </>
  );
}
