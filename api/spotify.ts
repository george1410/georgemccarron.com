// Returns what George is currently listening to on Spotify, or `{ isPlaying: false }`.
//
// Env vars required (set on Vercel):
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN
//
// See scripts/spotify-auth.ts for the one-time refresh-token bootstrap.

import "./_sentry";
import type { NowPlayingTrack } from "../src/lib/spotify-types";

export const config = {
  runtime: "edge",
};

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";
const RECENTLY_PLAYED_URL =
  "https://api.spotify.com/v1/me/player/recently-played?limit=1";

type SpotifyTrack = {
  name?: string;
  artists?: { name: string }[];
  album?: {
    name?: string;
    images?: { url: string }[];
  };
  external_urls?: { spotify?: string };
};

function formatTrack(track: SpotifyTrack, isPlaying: boolean): NowPlayingTrack {
  return {
    isPlaying,
    title: track.name,
    artist: track.artists?.map((a) => a.name).join(", "),
    album: track.album?.name,
    albumImageUrl: track.album?.images?.[0]?.url,
    songUrl: track.external_urls?.spotify,
  };
}

async function getAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing SPOTIFY_* env vars");
  }

  const basic = btoa(`${clientId}:${clientSecret}`);
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${basic}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error(`Token refresh failed: ${res.status}`);
  const json = (await res.json()) as { access_token: string };
  return json.access_token;
}

function json(body: NowPlayingTrack, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Cache at the edge for 30s; serve stale for another 60s while
      // we refetch behind the scenes. Keeps the function quiet on Vercel.
      "Cache-Control": "public, s-maxage=30, stale-while-revalidate=60",
    },
  });
}

export default async function handler(): Promise<Response> {
  try {
    const accessToken = await getAccessToken();

    // First: is something playing right now?
    const playingRes = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (playingRes.status === 200) {
      const data = (await playingRes.json()) as {
        is_playing?: boolean;
        item?: SpotifyTrack;
      };
      if (data.is_playing && data.item) {
        return json(formatTrack(data.item, true));
      }
    }

    // Fallback: most recently played track (acts as the "empty" state so
    // the widget always has something to show when the user isn't listening).
    const recentRes = await fetch(RECENTLY_PLAYED_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (recentRes.status === 200) {
      const data = (await recentRes.json()) as {
        items?: { track: SpotifyTrack }[];
      };
      const track = data.items?.[0]?.track;
      if (track) {
        return json(formatTrack(track, false));
      }
    }

    return json({ isPlaying: false });
  } catch (err) {
    // Never leak the error to the client — just hide the widget. Sentry
    // still sees it via the console-capture integration.
    console.error("[api/spotify]", err);
    return json({ isPlaying: false });
  }
}
