import {
  useLayoutEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { useQuery } from "@tanstack/react-query";
import type { NowPlayingTrack } from "../lib/spotify-types";

type Variant = "hero" | "compact";

export function NowPlaying({ variant = "compact" }: { variant?: Variant } = {}) {
  // react-query dedupes and polls for every instance sharing this key, so
  // the hero card and footer row stay in lockstep with one fetch loop.
  const { data: track } = useQuery<NowPlayingTrack>({
    queryKey: ["nowPlaying"],
    queryFn: async () => {
      const res = await fetch("/api/spotify");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
    refetchOnWindowFocus: false,
  });

  if (!track?.isPlaying || !track.title) return null;

  const label = `Listening to ${track.title} by ${track.artist} on Spotify`;

  if (variant === "hero") {
    return (
      <a
        href={track.songUrl}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="group relative flex items-center gap-4 px-5 py-4 rounded-2xl bg-white dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/60 shadow-sm hover:shadow-xl dark:hover:shadow-black/40 -rotate-1 hover:rotate-0 hover:-translate-y-0.5 transition-all duration-500 w-[26rem] max-w-[calc(100vw-3rem)] overflow-hidden"
      >
        {/* Gradient glow on hover, echoes the profile-picture treatment. */}
        <span
          aria-hidden="true"
          className="absolute -inset-4 rounded-3xl bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 opacity-0 group-hover:opacity-25 blur-2xl transition-opacity duration-700 -z-10"
        />

        {track.albumImageUrl && (
          <img
            src={track.albumImageUrl}
            alt=""
            className="w-16 h-16 rounded-xl flex-shrink-0 object-cover shadow-md"
          />
        )}
        <span className="flex flex-col min-w-0 text-left gap-1.5 flex-1">
          <span className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-stone-400 dark:text-zinc-500 leading-none">
            <SpotifyIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span>Now playing</span>
            <PlayingEqualiser />
          </span>
          <HoverMarquee className="text-[15px] font-semibold text-stone-900 dark:text-zinc-50 leading-tight group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {track.title}
          </HoverMarquee>
          <HoverMarquee className="text-sm text-stone-500 dark:text-zinc-400 leading-tight">
            {track.artist}
          </HoverMarquee>
        </span>

        {/* External-link indicator, subtle */}
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-4 h-4 flex-shrink-0 text-stone-300 dark:text-zinc-600 group-hover:text-orange-500 dark:group-hover:text-orange-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all"
          aria-hidden="true"
        >
          <path d="M7 17L17 7" />
          <path d="M7 7h10v10" />
        </svg>
      </a>
    );
  }

  // compact
  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="group inline-flex items-center gap-2 text-xs text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors max-w-full"
    >
      <SpotifyIcon className="w-4 h-4 text-emerald-500 flex-shrink-0" />
      <span className="flex flex-col gap-0.5 min-w-0">
        <span className="flex items-center gap-1.5">
          <span className="font-semibold uppercase tracking-[0.14em] text-[10px]">
            Now playing
          </span>
          <PlayingEqualiser />
        </span>
        <span className="truncate">
          <span className="font-medium text-stone-600 dark:text-zinc-300 group-hover:text-inherit transition-colors">
            {track.title}
          </span>
          <span className="mx-1">·</span>
          <span>{track.artist}</span>
        </span>
      </span>
    </a>
  );
}

function SpotifyIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.84-.179-.959-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.361 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.42 1.56-.299.421-1.02.599-1.559.3z" />
    </svg>
  );
}

// If `children` overflows its container, animate a left-to-right scroll
// while the containing `.group` is hovered (Spotify-style). Falls back to
// truncation with an ellipsis when the content fits.
function HoverMarquee({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const containerRef = useRef<HTMLSpanElement>(null);
  const textRef = useRef<HTMLSpanElement>(null);
  const [overflow, setOverflow] = useState(0);

  useLayoutEffect(() => {
    const container = containerRef.current;
    const text = textRef.current;
    if (!container || !text) return;
    const diff = text.scrollWidth - container.clientWidth;
    setOverflow(Math.max(0, diff));
  }, [children]);

  const animated = overflow > 0;
  const style: CSSProperties | undefined = animated
    ? ({
        ["--marquee-end" as string]: `-${overflow + 16}px`,
        animationDuration: `${Math.max(4, (overflow + 60) / 35)}s`,
      } as CSSProperties)
    : undefined;

  return (
    <span
      ref={containerRef}
      className={`block overflow-hidden ${animated ? "marquee-fade" : ""} ${className ?? ""}`}
    >
      <span
        ref={textRef}
        style={style}
        className={`inline-block whitespace-nowrap ${animated ? "marquee-on-hover" : ""}`}
      >
        {children}
      </span>
    </span>
  );
}

// Three bars that bob up and down — the universal "audio playing" glyph.
function PlayingEqualiser() {
  return (
    <span className="inline-flex items-end gap-[2px] h-3" aria-hidden="true">
      <span className="w-[2px] rounded-[1px] bg-emerald-500 animate-eq-bar-1 origin-bottom" />
      <span className="w-[2px] rounded-[1px] bg-emerald-500 animate-eq-bar-2 origin-bottom" />
      <span className="w-[2px] rounded-[1px] bg-emerald-500 animate-eq-bar-3 origin-bottom" />
    </span>
  );
}
