import { useQuery } from "@tanstack/react-query";
import type { NowPlayingTrack } from "../lib/spotify-types";

// Single source of truth for the Spotify query — callers get the same
// cache, polling cadence, and error handling everywhere.
export function useNowPlaying() {
  return useQuery<NowPlayingTrack>({
    queryKey: ["nowPlaying"],
    queryFn: async () => {
      const res = await fetch("/api/spotify");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
  });
}
