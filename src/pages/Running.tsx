import { useEffect, useRef } from "react";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import { useTitle } from "../hooks/useTitle";
import { decodePolyline, polylineToSvgPath } from "../lib/polyline";
import type {
  StravaActivitiesResponse,
  StravaRun,
  StravaStatsResponse,
} from "../lib/strava-types";

type PageParam = { cursor: number | null; count: number };

export function Running() {
  useTitle("Running");

  const { data: statsData } = useQuery<StravaStatsResponse>({
    queryKey: ["stravaStats"],
    queryFn: async () => {
      const res = await fetch("/api/strava-stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60 * 60_000,
    refetchOnWindowFocus: false,
  });

  const {
    data,
    isLoading,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteQuery<
    StravaActivitiesResponse,
    Error,
    { pages: StravaActivitiesResponse[]; pageParams: PageParam[] },
    readonly string[],
    PageParam
  >({
    queryKey: ["stravaRuns"],
    // First page: 16 runs (1 featured + 5 rows of 3). Subsequent: 15.
    initialPageParam: { cursor: null, count: 16 },
    queryFn: async ({ pageParam }) => {
      const url = new URL("/api/strava", window.location.origin);
      url.searchParams.set("count", String(pageParam.count));
      if (pageParam.cursor != null)
        url.searchParams.set("cursor", String(pageParam.cursor));
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    getNextPageParam: (lastPage) =>
      lastPage.nextCursor != null
        ? { cursor: lastPage.nextCursor, count: 15 }
        : undefined,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const runs = data?.pages.flatMap((p) => p.runs) ?? [];
  const stats = statsData?.runs;

  // IntersectionObserver sentinel — trigger the next page when it comes
  // into view (plus a generous rootMargin so we prefetch before the user
  // hits the bottom).
  const sentinelRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasNextPage || isFetchingNextPage) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) fetchNextPage();
      },
      { rootMargin: "600px" },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  if (isLoading) return <LoadingSkeleton />;
  if (isError || runs.length === 0) return <EmptyState />;

  const [latest, ...rest] = runs;

  return (
    <div className="space-y-16">
      {/* Header */}
      <section>
        <h1 className="font-serif italic text-5xl md:text-7xl leading-[0.95] tracking-tight">
          <span className="gradient-text-animated">Running</span>
          <span className="text-orange-400">.</span>
        </h1>
        <p className="mt-6 text-lg text-stone-500 dark:text-zinc-400 leading-relaxed max-w-xl">
          Every squiggle below is a real route, pulled fresh from Strava.
        </p>
      </section>

      {/* All-time stats */}
      {stats && stats.count > 0 && (
        <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Stat label="Distance" value={formatDistance(stats.distance)} />
          <Stat label="Runs" value={stats.count.toLocaleString()} />
          <Stat label="Time" value={formatTotalTime(stats.movingTime)} />
          <Stat label="Elevation" value={formatElevation(stats.elevationGain)} />
        </section>
      )}

      {/* Latest run featured */}
      {latest && <FeaturedRun run={latest} />}

      {/* Grid of previous runs */}
      {rest.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 mb-8">
            Previously
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {rest.map((run) => (
              <RunCard key={run.id} run={run} />
            ))}
          </div>

          {/* Pagination sentinel + footer */}
          <div ref={sentinelRef} aria-hidden="true" />
          {isFetchingNextPage && (
            <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {Array.from({ length: 3 }).map((_, i) => (
                <CardSkeleton key={i} />
              ))}
            </div>
          )}
          {!hasNextPage && (
            <p className="mt-12 text-center text-xs text-stone-400 dark:text-zinc-500">
              That's the lot.
            </p>
          )}
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-5 shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-zinc-500">
        {label}
      </div>
      <div className="mt-2 text-2xl font-semibold text-stone-900 dark:text-zinc-50 tabular-nums">
        {value}
      </div>
    </div>
  );
}

function FeaturedRun({ run }: { run: StravaRun }) {
  return (
    <a
      href={run.activityUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative block bg-white dark:bg-zinc-800/50 rounded-3xl p-6 md:p-8 shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-xl dark:hover:shadow-black/30 dark:hover:border-zinc-600/50 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden"
    >
      <span
        aria-hidden="true"
        className="absolute -inset-6 rounded-[2rem] bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 opacity-0 group-hover:opacity-20 blur-3xl transition-opacity duration-700 -z-10"
      />

      <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">
        <div className="w-full md:w-72 aspect-square flex-shrink-0 relative">
          <RunPolyline
            polyline={run.polyline}
            className="w-full h-full text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
            strokeWidth={1.4}
            endpoints
          />
        </div>

        <div className="flex-1 min-w-0 w-full">
          <div className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-zinc-500">
            <StravaIcon className="w-3.5 h-3.5 text-orange-500" />
            <span>Latest run</span>
          </div>
          <h2 className="mt-3 font-serif italic text-3xl md:text-4xl leading-tight text-stone-900 dark:text-zinc-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {run.name}
          </h2>
          <div className="mt-2 text-sm text-stone-500 dark:text-zinc-400">
            {formatDateLong(run.startDate)}
            {run.locationCity && <> · {run.locationCity}</>}
          </div>

          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
            <MiniStat label="Distance" value={formatDistance(run.distance)} />
            <MiniStat label="Time" value={formatDuration(run.movingTime)} />
            <MiniStat label="Pace" value={formatPace(run.averageSpeed)} />
            <MiniStat label="Elevation" value={`${Math.round(run.totalElevationGain)} m`} />
          </div>
        </div>
      </div>
    </a>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-zinc-500">
        {label}
      </div>
      <div className="mt-1 text-lg font-semibold text-stone-900 dark:text-zinc-50 tabular-nums">
        {value}
      </div>
    </div>
  );
}

function RunCard({ run }: { run: StravaRun }) {
  return (
    <a
      href={run.activityUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-white dark:bg-zinc-800/50 rounded-2xl p-5 shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-lg dark:hover:border-zinc-600/50 hover:-translate-y-0.5 transition-all duration-300"
    >
      <div className="aspect-square mb-4">
        <RunPolyline
          polyline={run.polyline}
          className="w-full h-full text-orange-500 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors"
          strokeWidth={1.6}
          endpoints
        />
      </div>
      <h3 className="font-semibold text-stone-900 dark:text-zinc-50 truncate leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
        {run.name}
      </h3>
      <div className="mt-1 text-xs text-stone-400 dark:text-zinc-500">
        {relativeDate(run.startDate)}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm">
        <span className="tabular-nums font-semibold text-stone-700 dark:text-zinc-200">
          {formatDistance(run.distance)}
        </span>
        <span className="tabular-nums text-stone-500 dark:text-zinc-400">
          {formatDuration(run.movingTime)}
        </span>
        <span className="tabular-nums text-stone-500 dark:text-zinc-400">
          {formatPace(run.averageSpeed)}
        </span>
      </div>
    </a>
  );
}

// Draws the polyline inside a 100×100 viewBox via currentColor stroke.
function RunPolyline({
  polyline,
  className,
  strokeWidth = 2,
  endpoints = false,
}: {
  polyline: string;
  className?: string;
  strokeWidth?: number;
  endpoints?: boolean;
}) {
  const SIZE = 100;
  const points = decodePolyline(polyline);
  if (points.length < 2) return null;
  const d = polylineToSvgPath(points, SIZE, SIZE, 6);

  const firstMatch = d.match(/^M([\d.]+),([\d.]+)/);
  const lastMatch = d.match(/L([\d.]+),([\d.]+)$/);

  return (
    <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className={className} aria-hidden="true">
      <path
        d={d}
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {endpoints && firstMatch && lastMatch && (
        <>
          <circle
            cx={firstMatch[1]}
            cy={firstMatch[2]}
            r={strokeWidth * 1.3}
            fill="currentColor"
          />
          <circle
            cx={lastMatch[1]}
            cy={lastMatch[2]}
            r={strokeWidth * 1.3}
            fill="currentColor"
            opacity="0.4"
          />
        </>
      )}
    </svg>
  );
}

function StravaIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M15.387 17.944l-2.089-4.116h-3.065L15.387 24l5.15-10.172h-3.066m-7.008-5.599l2.836 5.598h4.172L10.463 0l-7 13.828h4.169" />
    </svg>
  );
}

function formatDistance(meters: number): string {
  const km = meters / 1000;
  if (km >= 1000) return `${Math.round(km).toLocaleString()} km`;
  if (km >= 100) return `${km.toFixed(0)} km`;
  if (km >= 10) return `${km.toFixed(1)} km`;
  return `${km.toFixed(2)} km`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}h ${m.toString().padStart(2, "0")}m`;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// For the all-time stat — switches unit as the number grows so it stays
// readable.
function formatTotalTime(seconds: number): string {
  const hours = seconds / 3600;
  if (hours >= 48) {
    const days = Math.floor(hours / 24);
    const remHours = Math.round(hours - days * 24);
    return `${days}d ${remHours}h`;
  }
  return `${Math.round(hours)} h`;
}

function formatElevation(meters: number): string {
  if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
  return `${Math.round(meters).toLocaleString()} m`;
}

function formatPace(metersPerSecond?: number): string {
  if (!metersPerSecond || metersPerSecond <= 0) return "—";
  const secPerKm = 1000 / metersPerSecond;
  const m = Math.floor(secPerKm / 60);
  const s = Math.round(secPerKm % 60);
  return `${m}:${s.toString().padStart(2, "0")}/km`;
}

function formatDateLong(iso: string): string {
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function relativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / 86400_000);
  if (days < 1) return "today";
  if (days === 1) return "yesterday";
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return new Date(iso).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: new Date(iso).getFullYear() === new Date().getFullYear() ? undefined : "numeric",
  });
}

function CardSkeleton() {
  return (
    <div className="bg-white dark:bg-zinc-800/50 rounded-2xl p-5 border border-stone-200 dark:border-zinc-700/50 animate-pulse">
      <div className="aspect-square mb-4 rounded-xl bg-stone-100 dark:bg-zinc-800" />
      <div className="h-4 w-3/4 rounded-full bg-stone-200 dark:bg-zinc-700" />
      <div className="mt-2 h-3 w-1/3 rounded-full bg-stone-200 dark:bg-zinc-700" />
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="space-y-16">
      <section>
        <div className="h-16 w-72 rounded-lg bg-stone-200 dark:bg-zinc-800 animate-pulse" />
        <div className="mt-6 h-5 w-full max-w-xl rounded-full bg-stone-200 dark:bg-zinc-800 animate-pulse" />
      </section>
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-2xl bg-white dark:bg-zinc-800/50 border border-stone-200 dark:border-zinc-700/50 animate-pulse"
          />
        ))}
      </section>
      <section className="bg-white dark:bg-zinc-800/50 rounded-3xl p-6 md:p-8 border border-stone-200 dark:border-zinc-700/50 animate-pulse">
        <div className="flex flex-col md:flex-row gap-8 md:gap-10 items-center">
          <div className="w-full md:w-72 aspect-square rounded-xl bg-stone-100 dark:bg-zinc-800" />
          <div className="flex-1 w-full space-y-4">
            <div className="h-3 w-24 rounded-full bg-stone-200 dark:bg-zinc-700" />
            <div className="h-9 w-3/4 rounded-full bg-stone-200 dark:bg-zinc-700" />
            <div className="h-4 w-1/2 rounded-full bg-stone-200 dark:bg-zinc-700" />
          </div>
        </div>
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="space-y-16">
      <section>
        <h1 className="font-serif italic text-5xl md:text-7xl leading-[0.95] tracking-tight">
          <span className="gradient-text-animated">Running</span>
          <span className="text-orange-400">.</span>
        </h1>
        <p className="mt-6 text-lg text-stone-500 dark:text-zinc-400 leading-relaxed max-w-xl">
          Nothing to show right now — check back after the next run.
        </p>
      </section>
    </div>
  );
}
