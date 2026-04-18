// Returns a batch of George's public runs on Strava, cursor-paginated so
// the frontend can fill exact grid rows without losing runs to filtering.
//
// Query params:
//   count  (default 15)     — number of runs to return
//   cursor (default unset)  — epoch seconds; return runs older than this
//
// Env vars required (set on Vercel):
//   STRAVA_CLIENT_ID
//   STRAVA_CLIENT_SECRET
//   STRAVA_REFRESH_TOKEN

import { decodePolyline, polylineToSvgPath } from "../src/lib/polyline";
import type {
  StravaActivitiesResponse,
  StravaRun,
} from "../src/lib/strava-types";

// Fixed SVG viewBox size — every run is projected into the same 100×100
// box so the client can render the path as-is without ever seeing lat/lng.
const SVG_SIZE = 100;
const SVG_PADDING = 6;

export const config = {
  runtime: "edge",
};

const TOKEN_URL = "https://www.strava.com/api/v3/oauth/token";
// Strava caps per_page at 200. One fetch is almost always enough to fill
// a single grid page (~16 runs), so the loop below only iterates more
// than once in the rare case that a long non-running stretch is in view.
const STRAVA_PER_PAGE = 200;
const MAX_LOOPS = 2;

// Token cache shared across edge-function invocations (warm starts reuse
// the same isolate; dev shares via the Vite module scope). Strava tokens
// are valid for ~6h so caching saves almost all refresh round-trips.
type TokenCache = { token: string; expiresAt: number };
declare const globalThis: { __stravaTokenCache?: TokenCache } & typeof global;

type StravaActivity = {
  id: number;
  name: string;
  type: string;
  sport_type?: string;
  distance: number;
  moving_time: number;
  elapsed_time: number;
  total_elevation_gain: number;
  start_date: string;
  average_speed?: number;
  location_city?: string | null;
  location_country?: string | null;
  visibility?: "everyone" | "followers_only" | "only_me";
  private?: boolean;
  map?: { summary_polyline?: string | null };
};

async function getAccessToken(): Promise<string> {
  const cached = globalThis.__stravaTokenCache;
  // Refresh a minute before true expiry to avoid edge cases.
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

function isShareableRun(a: StravaActivity): boolean {
  if (a.type !== "Run" && a.sport_type !== "Run") return false;
  if (!a.map?.summary_polyline) return false;
  // Exclude strictly private activities ("only me"). Everything else —
  // public or followers-only — is fair game for the site.
  if (a.visibility === "only_me") return false;
  if (!a.visibility && a.private === true) return false;
  return true;
}

function toStravaRun(a: StravaActivity): StravaRun | null {
  const points = decodePolyline(a.map!.summary_polyline!);
  if (points.length < 2) return null;
  const svgPath = polylineToSvgPath(points, SVG_SIZE, SVG_SIZE, SVG_PADDING);
  return {
    id: a.id,
    name: a.name,
    distance: a.distance,
    movingTime: a.moving_time,
    elapsedTime: a.elapsed_time,
    totalElevationGain: a.total_elevation_gain,
    startDate: a.start_date,
    svgPath,
    svgSize: SVG_SIZE,
    activityUrl: `https://www.strava.com/activities/${a.id}`,
    averageSpeed: a.average_speed,
    locationCity: a.location_city ?? undefined,
    locationCountry: a.location_country ?? undefined,
  };
}

function json(body: StravaActivitiesResponse, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=3600",
    },
  });
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const count = Math.max(1, Math.min(60, Number(url.searchParams.get("count")) || 15));
  const cursorParam = url.searchParams.get("cursor");
  const initialCursor = cursorParam ? Number(cursorParam) : null;

  try {
    const accessToken = await getAccessToken();
    const headers = { Authorization: `Bearer ${accessToken}` };

    const runs: StravaRun[] = [];
    let before: number | null = initialCursor;
    let exhausted = false;
    let loops = 0;
    // Tracks the start_date (epoch s) of the most recently inspected
    // activity — this becomes the next cursor once we've filled our quota.
    let cursor: number | null = null;

    while (runs.length < count && !exhausted && loops++ < MAX_LOOPS) {

      const activitiesUrl = new URL(
        "https://www.strava.com/api/v3/athlete/activities",
      );
      activitiesUrl.searchParams.set("per_page", String(STRAVA_PER_PAGE));
      if (before != null) activitiesUrl.searchParams.set("before", String(before));

      const res = await fetch(activitiesUrl.toString(), { headers });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(`activities ${res.status}: ${text}`);
      }
      const activities = (await res.json()) as StravaActivity[];
      if (activities.length === 0) {
        exhausted = true;
        break;
      }

      // Walk the batch in order (newest → oldest), picking out runs until
      // we hit the quota. Remember where we stopped so the cursor can
      // exclude everything we've seen.
      let stoppedAt = activities.length - 1;
      for (let i = 0; i < activities.length; i++) {
        const a = activities[i]!;
        if (isShareableRun(a)) {
          const run = toStravaRun(a);
          if (!run) continue;
          runs.push(run);
          if (runs.length >= count) {
            stoppedAt = i;
            break;
          }
        }
      }

      const cutoff = activities[stoppedAt]!;
      cursor = Math.floor(new Date(cutoff.start_date).getTime() / 1000);
      before = cursor;

      // If we consumed the entire Strava batch and it was short, there's
      // nothing older to fetch.
      if (stoppedAt === activities.length - 1 && activities.length < STRAVA_PER_PAGE) {
        exhausted = true;
      }
    }

    const nextCursor = !exhausted && runs.length > 0 ? cursor : null;
    return json({ runs, nextCursor });
  } catch (err) {
    console.error("[api/strava]", err);
    return json({ runs: [], nextCursor: null });
  }
}
