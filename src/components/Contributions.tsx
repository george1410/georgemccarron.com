import { useEffect, useRef, useState, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { useQuery } from "@tanstack/react-query";
import type { ContribLevel, ContribResponse } from "../lib/github-types";

// Orange-scale palette so the heatmap sits inside the site's accent
// colour rather than clashing with it like GitHub's default green.
const LEVEL_CLASS: Record<ContribLevel, string> = {
  NONE: "bg-stone-200/70 dark:bg-zinc-800",
  FIRST_QUARTILE: "bg-orange-200 dark:bg-orange-950",
  SECOND_QUARTILE: "bg-orange-300 dark:bg-orange-800",
  THIRD_QUARTILE: "bg-orange-400 dark:bg-orange-600",
  FOURTH_QUARTILE: "bg-orange-500 dark:bg-orange-400",
};

// Slightly punchier versions for the tooltip dot — the default NONE
// fill disappears against the tooltip's own background, so bump the
// contrast for anything sitting on the card.
const DOT_CLASS: Record<ContribLevel, string> = {
  ...LEVEL_CLASS,
  NONE: "bg-stone-300 dark:bg-zinc-600",
};

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

export function Contributions() {
  const { data, isLoading } = useQuery<ContribResponse>({
    queryKey: ["githubContributions"],
    queryFn: async () => {
      const res = await fetch("/api/github");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60 * 60_000,
    refetchOnWindowFocus: false,
  });

  // When the grid overflows on narrow viewports, default the scroll
  // position to the right so "today" is visible.
  const scrollRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!data || !scrollRef.current) return;
    scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
  }, [data]);

  // Single floating tooltip driven by event delegation at the grid level —
  // 371 cell-level listeners would be overkill, and rendering one node
  // lets us portal it out of the scroll container.
  const [tooltip, setTooltip] = useState<{
    count: number;
    date: string;
    level: ContribLevel;
    x: number;
    y: number;
  } | null>(null);

  function handlePointerOver(e: PointerEvent<HTMLDivElement>) {
    const target = (e.target as HTMLElement).closest<HTMLElement>(
      "[data-contrib-date]",
    );
    if (!target) return;
    const rect = target.getBoundingClientRect();
    setTooltip({
      count: Number(target.dataset.contribCount),
      date: target.dataset.contribDate!,
      level: target.dataset.contribLevel as ContribLevel,
      x: rect.left + rect.width / 2,
      y: rect.top,
    });
  }

  if (isLoading || !data || data.weeks.length === 0) {
    return (
      <div className="h-[172px] bg-white dark:bg-zinc-800/50 rounded-2xl border border-stone-200 dark:border-zinc-700/50 animate-pulse" />
    );
  }

  return (
    <>
    <a
      href={`https://github.com/${GITHUB_USERNAME}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${data.totalContributions} contributions on GitHub — view profile`}
      className="group block bg-white dark:bg-zinc-800/50 rounded-2xl p-5 md:p-6 shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-lg dark:hover:border-zinc-600/50 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="flex items-baseline justify-between mb-5 gap-4">
        <p className="flex items-center gap-2 text-sm text-stone-600 dark:text-zinc-300">
          <GithubIcon className="w-4 h-4 text-stone-500 dark:text-zinc-400 group-hover:text-orange-500 dark:group-hover:text-orange-400 transition-colors self-center" />
          <span>
            <span className="font-semibold text-stone-900 dark:text-zinc-50 tabular-nums group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
              {data.totalContributions.toLocaleString()}
            </span>{" "}
            contributions in the last year
          </span>
        </p>
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-stone-400 dark:text-zinc-500">
          <span>Less</span>
          <Legend />
          <span>More</span>
        </div>
      </div>

      <div ref={scrollRef} className="overflow-x-auto -mx-1 px-1 pb-1">
        <div
          style={{
            display: "grid",
            // Column 1 is the day-of-week labels (auto-sized to text),
            // column 2 holds both the month labels row and the main grid.
            // Rows auto + main: the main cell's aspect-ratio drives the
            // shared row height so the day labels align to their rows.
            gridTemplateColumns: "auto 1fr",
            columnGap: "8px",
            rowGap: "6px",
            minWidth: "540px",
          }}
        >
          {/* Top-left: blank corner */}
          <div />

          {/* Top-right: month labels. One cell per week; most empty, filled
              only where the month rolls over from the previous week. */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: `repeat(${data.weeks.length}, minmax(0, 1fr))`,
              gap: "3px",
            }}
          >
            {data.weeks.map((w, i) => {
              const firstDay = w.days[0];
              if (!firstDay) return null;
              const prevFirstDay = i > 0 ? data.weeks[i - 1]!.days[0] : null;
              if (!prevFirstDay) return null;
              const month = new Date(firstDay.date + "T00:00:00Z").getUTCMonth();
              const prevMonth = new Date(
                prevFirstDay.date + "T00:00:00Z",
              ).getUTCMonth();
              if (month === prevMonth) return null;
              const label = new Date(
                firstDay.date + "T00:00:00Z",
              ).toLocaleDateString("en-GB", { month: "short" });
              return (
                <span
                  key={firstDay.date}
                  style={{ gridColumnStart: i + 1 }}
                  className="text-[10px] text-stone-400 dark:text-zinc-500"
                >
                  {label}
                </span>
              );
            })}
          </div>

          {/* Bottom-left: day-of-week labels. 7 rows matching the main
              grid's 7 rows; only Mon/Wed/Fri show text to avoid clutter. */}
          <div
            style={{
              display: "grid",
              gridTemplateRows: "repeat(7, minmax(0, 1fr))",
              gap: "3px",
            }}
            className="text-[10px] text-stone-400 dark:text-zinc-500"
          >
            <span />
            <span className="self-center leading-none">Mon</span>
            <span />
            <span className="self-center leading-none">Wed</span>
            <span />
            <span className="self-center leading-none">Fri</span>
            <span />
          </div>

          {/* Bottom-right: main contribution grid. */}
          <div
            onPointerOver={handlePointerOver}
            onPointerLeave={() => setTooltip(null)}
            style={{
              display: "grid",
              gap: "3px",
              gridTemplateColumns: `repeat(${data.weeks.length}, minmax(0, 1fr))`,
              gridTemplateRows: "repeat(7, minmax(0, 1fr))",
              aspectRatio: `${data.weeks.length * 11 + (data.weeks.length - 1) * 3} / ${7 * 11 + 6 * 3}`,
            }}
          >
          {data.weeks.flatMap((w, weekIdx) =>
            w.days.map((d) => {
              // GitHub returns date as YYYY-MM-DD; parse as UTC to get a
              // consistent day-of-week regardless of the viewer's timezone.
              const dow = new Date(d.date + "T00:00:00Z").getUTCDay();
              return (
                <div
                  key={d.date}
                  data-contrib-count={d.count}
                  data-contrib-date={d.date}
                  data-contrib-level={d.level}
                  style={{
                    gridColumnStart: weekIdx + 1,
                    gridRowStart: dow + 1,
                  }}
                  className={`rounded-[2px] ${LEVEL_CLASS[d.level]}`}
                />
              );
            }),
          )}
          </div>
        </div>
      </div>

    </a>

    {tooltip &&
      createPortal(
        <div
          style={{
            position: "fixed",
            left: tooltip.x,
            top: tooltip.y - 10,
          }}
          className="pointer-events-none -translate-x-1/2 -translate-y-full z-[100]"
        >
          <div className="relative bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm border border-stone-200 dark:border-zinc-700 rounded-lg px-3 py-2 shadow-lg shadow-stone-900/10 dark:shadow-black/30">
            <div className="text-sm font-semibold text-stone-900 dark:text-zinc-50 whitespace-nowrap leading-tight">
              {tooltip.count === 0
                ? "No contributions"
                : `${tooltip.count} contribution${tooltip.count === 1 ? "" : "s"}`}
            </div>
            <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap">
              <span
                className={`inline-block w-1.5 h-1.5 rounded-full ${DOT_CLASS[tooltip.level]}`}
              />
              <span className="text-stone-400 dark:text-zinc-500">
                {formatDate(tooltip.date)}
              </span>
            </div>
            <div
              aria-hidden="true"
              className="absolute left-1/2 top-full -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-white/95 dark:bg-zinc-800/95 border-r border-b border-stone-200 dark:border-zinc-700"
            />
          </div>
        </div>,
        document.body,
      )}
    </>
  );
}

const GITHUB_USERNAME = "george1410";

function GithubIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function Legend() {
  const levels: ContribLevel[] = [
    "NONE",
    "FIRST_QUARTILE",
    "SECOND_QUARTILE",
    "THIRD_QUARTILE",
    "FOURTH_QUARTILE",
  ];
  return (
    <div className="flex items-center gap-[3px]">
      {levels.map((l) => (
        <div
          key={l}
          className={`w-[11px] h-[11px] rounded-[2px] ${LEVEL_CLASS[l]}`}
        />
      ))}
    </div>
  );
}
