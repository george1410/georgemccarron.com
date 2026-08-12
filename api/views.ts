// Increment and read blog post view counts.
//
// Backed by Vercel Redis (KV). Env vars required (set when linked):
//   REDIS_KV_REST_API_URL
//   REDIS_KV_REST_API_READ_ONLY_TOKEN  — GET requests
//   REDIS_KV_REST_API_TOKEN            — POST increments
//
// GET  /api/views              → { views: { [slug]: number } }
// GET  /api/views?slug=<slug>    → { slug, views }
// POST /api/views { "slug": "…" } → increment, returns { slug, views }

import { wrapApiHandler } from "./_sentry";
import { Redis } from "@upstash/redis";
import { posts } from "../src/data/posts";
import type {
  PostViewResponse,
  PostViewsResponse,
} from "../src/lib/views-types";

export const config = {
  runtime: "edge",
};

const VALID_SLUGS = new Set(posts.map((p) => p.slug));
const KEY_PREFIX = "post-view:";

function redisRead(): Redis | null {
  const url = process.env.REDIS_KV_REST_API_URL;
  const token = process.env.REDIS_KV_REST_API_READ_ONLY_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function redisWrite(): Redis | null {
  const url = process.env.REDIS_KV_REST_API_URL;
  const token = process.env.REDIS_KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

function viewKey(slug: string) {
  return `${KEY_PREFIX}${slug}`;
}

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

async function getViews(
  client: Redis,
  slugs: string[],
): Promise<Record<string, number>> {
  if (slugs.length === 0) return {};
  const keys = slugs.map(viewKey);
  const values = await client.mget<(number | null)[]>(...keys);
  return Object.fromEntries(
    slugs.map((slug, i) => [slug, values[i] ?? 0]),
  );
}

async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const slugParam = url.searchParams.get("slug");

  if (request.method === "GET") {
    const client = redisRead();
    if (!client) {
      if (slugParam && VALID_SLUGS.has(slugParam)) {
        return json({ slug: slugParam, views: 0 } satisfies PostViewResponse);
      }
      const views = Object.fromEntries(
        posts.map((p) => [p.slug, 0]),
      ) satisfies Record<string, number>;
      return json({ views } satisfies PostViewsResponse);
    }

    if (slugParam) {
      if (!VALID_SLUGS.has(slugParam)) {
        return json({ error: "Unknown slug" }, 404);
      }
      const views = (await client.get<number>(viewKey(slugParam))) ?? 0;
      return json({ slug: slugParam, views } satisfies PostViewResponse);
    }

    const slugs = posts.map((p) => p.slug);
    const views = await getViews(client, slugs);
    return json({ views } satisfies PostViewsResponse);
  }

  if (request.method === "POST") {
    let body: { slug?: string };
    try {
      body = (await request.json()) as { slug?: string };
    } catch {
      return json({ error: "Invalid JSON" }, 400);
    }

    const slug = body.slug;
    if (!slug || !VALID_SLUGS.has(slug)) {
      return json({ error: "Unknown slug" }, 400);
    }

    const client = redisWrite();
    if (!client) {
      return json({ slug, views: 0 } satisfies PostViewResponse);
    }

    const views = await client.incr(viewKey(slug));
    return json({ slug, views } satisfies PostViewResponse);
  }

  return json({ error: "Method not allowed" }, 405);
}

export default wrapApiHandler("views", handler);
