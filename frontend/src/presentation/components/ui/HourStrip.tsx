/**
 * The signature control: the abstract string "Posting window: 5:00 PM – 10:00 PM"
 * becomes a bar whose shape you read in one saccade.
 *
 * Presentational only — it never writes state. The sliders remain the sole input.
 */

const HOURS = Array.from({ length: 24 }, (_, h) => h);

/** Matches ScheduleSettingsPanel's own `formatHour` output exactly ("5:00 PM"). */
function formatHour(hour: number): string {
  const period = hour >= 12 ? "PM" : "AM";
  const displayHour = hour % 12 === 0 ? 12 : hour % 12;
  return `${displayHour}:00 ${period}`;
}

const AXIS_LABELS: Record<number, string> = {
  0: "12A",
  6: "6A",
  12: "12P",
  18: "6P",
};

export function HourStrip({
  startHour,
  endHour,
  recommended,
}: {
  startHour: number;
  endHour: number;
  recommended: { startHour: number; endHour: number };
}) {
  const invalid = startHour >= endHour;

  return (
    <div className="border-2 border-ink bg-card">
      {/* 24 hour cells — the selected window */}
      <div
        className="flex h-[30px]"
        role="img"
        aria-label={
          invalid
            ? "Invalid posting window"
            : `Posting window ${formatHour(startHour)} to ${formatHour(endHour)}`
        }
      >
        {HOURS.map((h) => {
          const inWindow = !invalid && h >= startHour && h < endHour;
          return (
            <div
              key={h}
              className={`flex-1 border-r-2 border-ink last:border-r-0 transition-colors duration-[120ms] ${
                invalid ? "hc-hatch" : inWindow ? "bg-acid" : "bg-card"
              }`}
            />
          );
        })}
      </div>

      {/* RECOMMENDATION MARKER — surfaces getRecommendedWindow(), which is
          otherwise invisible the moment auto-fill runs. Different thickness,
          different line, far-apart hue: the two marks never compete. */}
      <div className="flex h-[4px] border-t-2 border-ink" aria-hidden="true">
        {HOURS.map((h) => (
          <div
            key={h}
            className={`flex-1 ${
              h >= recommended.startHour && h < recommended.endHour ? "bg-volt" : ""
            }`}
          />
        ))}
      </div>

      {/* AXIS — 10px is permitted here because it is pure ink at 19.2:1 */}
      <div className="flex" aria-hidden="true">
        {HOURS.map((h) => (
          <div key={h} className="flex-1 font-mono text-[10px] text-ink">
            {AXIS_LABELS[h] ?? ""}
          </div>
        ))}
      </div>
    </div>
  );
}
