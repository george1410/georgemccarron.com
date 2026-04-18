// Response shape of /api/spotify. Shared between the Vercel function that
// produces it and the client component that consumes it.
export type NowPlayingTrack = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
};
