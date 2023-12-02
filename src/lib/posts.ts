import { env } from "@/env";
import { allPosts } from "contentlayer/generated";

export const publishedPosts = allPosts.filter((post) =>
  env.NODE_ENV === "development" ? true : !post.draft
);
