// Returns all-time totals across George's shareable runs on Strava.
//
// Strava's own /athletes/{id}/stats has a quirk: `count` excludes hidden
// activities but the distance/time/elevation sums don't, which gives a
// mismatched picture. So instead we page through the full activities list
// ourselves, apply the same visibility filter as /api/strava, and sum.
//
// Cached aggressively — results barely change between runs.
//
// Env vars required (set on Vercel):
//   STRAVA_CLIENT_ID
//   STRAVA_CLIENT_SECRET
//   STRAVA_REFRESH_TOKEN

import type { StravaStatsResponse } from "../src/lib/strava-types";

export const config = {
  runtime: "edge",
};

const TOKEN_URL = "https://www.strava.com/api/v3/oauth/token";
const STRAVA_PER_PAGE = 200;
// Hard ceiling so a misbehaving call can't hammer the API. At per_page=200
// this covers up to 4000 activities — well more than a decade of running.
const MAX_LOOPS = 20;

type TokenCache = { token: string; expiresAt: number };
declare const globalThis: { __stravaTokenCache?: TokenCache } & typeof global;

type StravaActivity = {
  type: string;
  sport_type?: string;
  distance: number;
  moving_time: number;
  total_elevation_gain: number;
  start_date: string;
  visibility?: "everyone" | "followers_only" | "only_me";
  private?: boolean;
};

async function getAccessToken(): Promise<string> {
  const cached = globalThis.__stravaTokenCache;
  if (cached && cached.expiresAt > Date.now() + 60_000) {
    return cached.token;
  }

  const clientId = process.env.STRAVA_CLIENT_ID;
  const clientSecret = process.env.STRAVA_CLIENT_SECRET;
  const refreshToken = process.env.STRAVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Missing STRAVA_* env vars");
  }

  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) throw new Error(`Strava token refresh failed: ${res.status}`);
  const json = (await res.json()) as {
    access_token: string;
    expires_in: number;
  };
  globalThis.__stravaTokenCache = {
    token: json.access_token,
    expiresAt: Date.now() + json.expires_in * 1000,
  };
  return json.access_token;
}

// Mirror of isShareableRun in /api/strava, minus the polyline requirement
// — treadmill runs without GPS still count toward lifetime totals.
function isShareableRun(a: StravaActivity): boolean {
  if (a.type !== "Run" && a.sport_type !== "Run") return false;
  if (a.visibility === "only_me") return false;
  if (!a.visibility && a.private === true) return false;
  return true;
}

function json(body: StravaStatsResponse, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      // Aggregate stats change slowly — cache half a day, serve stale for
      // a week while revalidating behind the scenes.
      "Cache-Control": "public, s-maxage=43200, stale-while-revalidate=604800",
    },
  });
}

export default async function handler(): Promise<Response> {
  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    let count = 0;
    let distance = 0;
    let movingTime = 0;
    let elevationGain = 0;

    let before: number | null = null;
    let loops = 0;

    while (loops++ < MAX_LOOPS) {
      const url = new URL("https://www.strava.com/api/v3/athlete/activities");
      url.searchParams.set("per_page", String(STRAVA_PER_PAGE));
      if (before != null) url.searchParams.set("before", String(before));

      const res = await fetch(url.toString(), { headers });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`activities ${res.status}: ${text}`);
      }
      const activities = (await res.json()) as StravaActivity[];
      if (activities.length === 0) break;

      for (const a of activities) {
        if (!isShareableRun(a)) continue;
        count++;
        distance += a.distance;
        movingTime += a.moving_time;
        elevationGain += a.total_elevation_gain;
      }

      // Reached the end of history — the final page came back short.
      if (activities.length < STRAVA_PER_PAGE) break;

      const oldest = activities[activities.length - 1]!;
      before = Math.floor(new Date(oldest.start_date).getTime() / 1000);
    }

    return json({ runs: { count, distance, movingTime, elevationGain } });
  } catch (err) {
    console.error("[api/strava-stats]", err);
    return json({
      runs: { count: 0, distance: 0, movingTime: 0, elevationGain: 0 },
    });
  }
}
