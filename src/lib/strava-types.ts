// Response shapes for /api/strava and /api/strava-stats. Shared between the
// Vercel functions that produce them and the client code that consumes them.

export type StravaRun = {
  id: number;
  name: string;
  distance: number; // metres
  movingTime: number; // seconds
  elapsedTime: number; // seconds
  totalElevationGain: number; // metres
  startDate: string; // ISO
  // Pre-projected SVG path `d` string — already normalised to a fixed
  // 100×100 viewBox server-side so raw GPS coordinates never reach the
  // client.
  svgPath: string;
  svgSize: number; // viewBox dimension (square)
  activityUrl: string;
  averageSpeed?: number; // m/s
  locationCity?: string;
  locationCountry?: string;
};

export type StravaActivitiesResponse = {
  runs: StravaRun[];
  // Epoch seconds — pass back as `?cursor=` to fetch the next batch of
  // older runs. `null` means we've reached the end of your Strava history.
  nextCursor: number | null;
};

export type StravaStats = {
  count: number;
  distance: number; // metres
  movingTime: number; // seconds
  elevationGain: number; // metres
};

export type StravaStatsResponse = {
  runs: StravaStats;
};
