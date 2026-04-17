import { useEffect, useState } from "react";

type Track = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
};

export function NowPlaying() {
  const [track, setTrack] = useState<Track | null>(null);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch("/api/spotify");
        if (!res.ok) return;
        const data = (await res.json()) as Track;
        if (!cancelled) setTrack(data);
      } catch {
        // silently fail — widget just stays hidden
      }
    };

    load();
    const id = setInterval(load, 60_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  if (!track?.isPlaying || !track.title) return null;

  return (
    <a
      href={track.songUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="group inline-flex items-center gap-3 px-2.5 py-1.5 rounded-full bg-white dark:bg-zinc-800/80 border border-stone-200 dark:border-zinc-700/60 shadow-sm hover:shadow-md hover:border-stone-300 dark:hover:border-zinc-600 transition-all max-w-full"
      aria-label={`Listening to ${track.title} by ${track.artist} on Spotify`}
    >
      {track.albumImageUrl && (
        <img
          src={track.albumImageUrl}
          alt=""
          className="w-7 h-7 rounded-md flex-shrink-0 object-cover"
        />
      )}
      <span className="flex flex-col min-w-0 text-left">
        <span className="text-xs text-stone-400 dark:text-zinc-500 flex items-center gap-1">
          <SpotifyIcon className="w-3 h-3" />
          Now playing
        </span>
        <span className="text-sm font-medium text-stone-900 dark:text-zinc-50 truncate">
          {track.title}
          <span className="text-stone-400 dark:text-zinc-500 font-normal">
            {" · "}
            {track.artist}
          </span>
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
