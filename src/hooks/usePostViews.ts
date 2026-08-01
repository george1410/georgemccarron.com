import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { track } from "@vercel/analytics";
import type { PostViewResponse } from "../lib/views-types";

/** Only show the public view count once a post reaches this many views. */
export const VIEW_COUNT_DISPLAY_THRESHOLD = 10;

export function shouldShowViewCount(count: number | undefined): count is number {
  return count != null && count >= VIEW_COUNT_DISPLAY_THRESHOLD;
}

export function usePostViewCount(slug: string | undefined) {
  return useQuery({
    queryKey: ["postViews", slug],
    queryFn: async () => {
      const res = await fetch(
        `/api/views?slug=${encodeURIComponent(slug!)}`,
      );
      if (!res.ok) throw new Error("Failed to load view count");
      const data = (await res.json()) as PostViewResponse;
      return data.views;
    },
    enabled: !!slug,
    staleTime: 60_000,
  });
}

// Record one view per browser session. Updates the React Query cache when
// the increment succeeds so the count in the header ticks up immediately.
export function useTrackPostView(slug: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!slug) return;

    const sessionKey = `viewed:${slug}`;
    if (sessionStorage.getItem(sessionKey)) return;
    sessionStorage.setItem(sessionKey, "1");

    track("blog_post_view", { slug });

    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: PostViewResponse | null) => {
        if (data?.views != null) {
          queryClient.setQueryData(["postViews", slug], data.views);
        }
      })
      .catch(() => {
        // Non-critical — don't block reading the post.
      });
  }, [slug, queryClient]);
}

export function formatViewCount(count: number): string {
  return count.toLocaleString();
}
