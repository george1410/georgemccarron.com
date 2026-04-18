import { useQuery } from "@tanstack/react-query";
import type { ContribResponse } from "../lib/github-types";

export function useGithubContributions() {
  return useQuery<ContribResponse>({
    queryKey: ["githubContributions"],
    queryFn: async () => {
      const res = await fetch("/api/github");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    staleTime: 60 * 60_000,
    refetchOnWindowFocus: false,
  });
}
