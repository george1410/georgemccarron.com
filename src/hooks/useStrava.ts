import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type {
  StravaActivitiesResponse,
  StravaStatsResponse,
} from "../lib/strava-types";

type PageParam = { cursor: number | null; count: number };

export function useStravaStats() {
  return useQuery<StravaStatsResponse>({
    queryKey: ["stravaStats"],
    queryFn: async () => {
      const res = await fetch("/api/strava-stats");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60 * 60_000,
    refetchOnWindowFocus: false,
  });
}

// First page returns 16 runs (1 featured + 5 rows of 3 in the grid).
// Subsequent pages return 15 to keep the grid a clean multiple of 3.
export function useStravaRuns() {
  return useInfiniteQuery<
    StravaActivitiesResponse,
    Error,
    { pages: StravaActivitiesResponse[]; pageParams: PageParam[] },
    readonly string[],
    PageParam
  >({
    queryKey: ["stravaRuns"],
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
}
