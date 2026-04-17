// Returns what George is currently listening to on Spotify, or `{ isPlaying: false }`.
//
// Env vars required (set on Vercel):
//   SPOTIFY_CLIENT_ID
//   SPOTIFY_CLIENT_SECRET
//   SPOTIFY_REFRESH_TOKEN
//
// See scripts/spotify-auth.ts for the one-time refresh-token bootstrap.

export const config = {
  runtime: "edge",
};

const TOKEN_URL = "https://accounts.spotify.com/api/token";
const NOW_PLAYING_URL =
  "https://api.spotify.com/v1/me/player/currently-playing";

type NowPlaying = {
  isPlaying: boolean;
  title?: string;
  artist?: string;
  album?: string;
  albumImageUrl?: string;
  songUrl?: string;
};

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

function json(body: NowPlaying, status = 200) {
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
    const res = await fetch(NOW_PLAYING_URL, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    // 204 = nothing playing (also covers private sessions)
    if (res.status === 204 || res.status >= 400) {
      return json({ isPlaying: false });
    }

    const data = (await res.json()) as {
      is_playing?: boolean;
      item?: {
        name?: string;
        artists?: { name: string }[];
        album?: {
          name?: string;
          images?: { url: string }[];
        };
        external_urls?: { spotify?: string };
      };
    };

    if (!data.is_playing || !data.item) {
      return json({ isPlaying: false });
    }

    return json({
      isPlaying: true,
      title: data.item.name,
      artist: data.item.artists?.map((a) => a.name).join(", "),
      album: data.item.album?.name,
      albumImageUrl: data.item.album?.images?.[0]?.url,
      songUrl: data.item.external_urls?.spotify,
    });
  } catch {
    // Never leak the error — the client just hides the widget.
    return json({ isPlaying: false });
  }
}
