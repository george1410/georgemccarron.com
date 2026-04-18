import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";
import { posts } from "./src/data/posts";
import { talks } from "./src/data/talks";

const SITE_URL = "https://georgemccarron.com";

function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function ogImageUrl(title: string, subtitle: string, kind: "post" | "talk") {
  const params = new URLSearchParams({ title, subtitle, kind });
  return `${SITE_URL}/api/og?${params.toString()}`;
}

function replaceMeta(
  html: string,
  patterns: { selector: RegExp; value: string }[],
) {
  let out = html;
  for (const { selector, value } of patterns) {
    out = out.replace(selector, `$1${value}$2`);
  }
  return out;
}

// Runs api/*.ts (Vercel serverless functions) in the Vite dev server.
// Fetches /api/<name> → dynamically loads api/<name>.ts, executes its default
// export as a (Request) => Response handler, and streams the response back.
// Env vars come from .env.local via Vite's loadEnv.
//
// Successful GET responses are held in an in-memory cache that honours the
// response's own Cache-Control header (s-maxage preferred, falling back to
// max-age) — the same contract Vercel's edge applies in production.
// Append `?no-cache` to any URL to force a miss.
function parseCacheTtlMs(cacheControl: string | null): number {
  if (!cacheControl) return 0;
  const parts = cacheControl.split(",").map((p) => p.trim().toLowerCase());
  if (parts.includes("no-store") || parts.includes("private")) return 0;
  const pick = (key: string) => {
    const hit = parts.find((p) => p.startsWith(`${key}=`));
    if (!hit) return undefined;
    const n = Number(hit.slice(key.length + 1));
    return Number.isFinite(n) && n > 0 ? n : undefined;
  };
  const seconds = pick("s-maxage") ?? pick("max-age") ?? 0;
  return seconds * 1000;
}

function vercelApiDev(): Plugin {
  type CacheEntry = {
    expiresAt: number;
    status: number;
    headers: [string, string][];
    body: Buffer;
  };
  const cache = new Map<string, CacheEntry>();

  return {
    name: "vercel-api-dev",
    apply: "serve",
    async configureServer(server) {
      // Pull .env / .env.local / .env.development into process.env so
      // the handlers see the same variables they will on Vercel.
      const env = loadEnv(server.config.mode, server.config.root, "");
      for (const [k, v] of Object.entries(env)) {
        if (!(k in process.env)) process.env[k] = v;
      }

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) return next();
        const path = await import("node:path");
        const fs = await import("node:fs/promises");

        const pathname = req.url.split("?")[0]!;
        const name = pathname.slice("/api/".length).replace(/\/+$/, "");
        if (!name) return next();

        // Try .ts then .tsx
        const candidates = ["ts", "tsx"].map((ext) =>
          path.resolve(server.config.root, `api/${name}.${ext}`),
        );
        let file: string | null = null;
        for (const c of candidates) {
          try {
            await fs.access(c);
            file = c;
            break;
          } catch {
            // try next
          }
        }
        if (!file) return next();

        const isGet = !req.method || req.method === "GET";
        const bypass = req.url.includes("no-cache");
        const cacheKey = req.url;

        if (isGet && !bypass) {
          const hit = cache.get(cacheKey);
          if (hit && hit.expiresAt > Date.now()) {
            res.statusCode = hit.status;
            for (const [k, v] of hit.headers) res.setHeader(k, v);
            res.setHeader("X-Dev-Cache", "HIT");
            res.end(hit.body);
            return;
          }
        }

        try {
          const mod = await server.ssrLoadModule(file);
          const handler = mod.default;
          if (typeof handler !== "function") return next();

          const host = req.headers.host ?? "localhost";
          const url = new URL(req.url, `http://${host}`);

          // Read request body if one is present (for POST/PUT etc).
          let body: Buffer | undefined;
          if (req.method && !["GET", "HEAD"].includes(req.method)) {
            const chunks: Buffer[] = [];
            for await (const chunk of req)
              chunks.push(chunk as unknown as Buffer);
            if (chunks.length) body = Buffer.concat(chunks);
          }

          const request = new Request(url.toString(), {
            method: req.method,
            headers: req.headers as Record<string, string>,
            body: body as unknown as ArrayBuffer | undefined,
          });

          const response: Response = await handler(request);
          const buf = Buffer.from(await response.arrayBuffer());
          const headerPairs: [string, string][] = [];
          response.headers.forEach((value, key) => headerPairs.push([key, value]));

          // Only cache successful GETs with a positive Cache-Control TTL —
          // this mirrors Vercel's edge, which also only caches responses
          // that explicitly opt in.
          const ttlMs = parseCacheTtlMs(response.headers.get("Cache-Control"));
          if (
            isGet &&
            !bypass &&
            ttlMs > 0 &&
            response.status >= 200 &&
            response.status < 300
          ) {
            cache.set(cacheKey, {
              expiresAt: Date.now() + ttlMs,
              status: response.status,
              headers: headerPairs,
              body: buf,
            });
          }

          res.statusCode = response.status;
          for (const [k, v] of headerPairs) res.setHeader(k, v);
          res.setHeader("X-Dev-Cache", "MISS");
          res.end(buf);
        } catch (err) {
          console.error(`[vercel-api-dev] ${file}:`, err);
          res.statusCode = 500;
          res.setHeader("Content-Type", "text/plain");
          res.end(err instanceof Error ? err.stack ?? err.message : String(err));
        }
      });
    },
  };
}

// Builds an RSS 2.0 feed from the blog posts list. Served at /rss.xml in
// both dev and the final build.
function generateRssXml(): string {
  const items = posts
    .map((p) => {
      const url = `${SITE_URL}/blog/${p.slug}`;
      const pubDate = new Date(p.date).toUTCString();
      return `    <item>
      <title>${escapeHtml(p.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeHtml(p.subtitle)}</description>
    </item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>George McCarron</title>
    <link>${SITE_URL}</link>
    <description>Writing from George McCarron — software engineer at incident.io.</description>
    <language>en</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items}
  </channel>
</rss>
`;
}

function rssFeed(): Plugin {
  return {
    name: "rss-feed",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        const pathname = req.url?.split("?")[0];
        if (pathname === "/rss.xml") {
          res.setHeader("Content-Type", "application/rss+xml; charset=utf-8");
          res.end(generateRssXml());
          return;
        }
        next();
      });
    },
    async closeBundle() {
      if (this.meta?.watchMode) return;
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      await fs.writeFile(
        path.resolve("dist", "rss.xml"),
        generateRssXml(),
        "utf-8",
      );
    },
  };
}

function generateOgPages(): Plugin {
  return {
    name: "generate-og-pages",
    apply: "build",
    async closeBundle() {
      const fs = await import("node:fs/promises");
      const path = await import("node:path");
      const dist = path.resolve("dist");
      const template = await fs.readFile(path.join(dist, "index.html"), "utf-8");

      async function writePage(
        urlPath: string,
        title: string,
        description: string,
        kind: "post" | "talk",
      ) {
        const pageUrl = `${SITE_URL}${urlPath}`;
        const fullTitle = `${title} — George McCarron`;
        const og = ogImageUrl(title, description, kind);
        const ogType = kind === "post" ? "article" : "website";

        const html = replaceMeta(template, [
          { selector: /(<title>).*?(<\/title>)/, value: escapeHtml(fullTitle) },
          {
            selector: /(<meta name="description" content=")[^"]*(")/,
            value: escapeHtml(description),
          },
          {
            selector: /(<link rel="canonical" href=")[^"]*(")/,
            value: pageUrl,
          },
          {
            selector: /(<meta property="og:type" content=")[^"]*(")/,
            value: ogType,
          },
          {
            selector: /(<meta property="og:url" content=")[^"]*(")/,
            value: pageUrl,
          },
          {
            selector: /(<meta property="og:title" content=")[^"]*(")/,
            value: escapeHtml(fullTitle),
          },
          {
            selector: /(<meta property="og:description" content=")[^"]*(")/,
            value: escapeHtml(description),
          },
          {
            selector: /(<meta property="og:image" content=")[^"]*(")/,
            value: escapeHtml(og),
          },
          {
            selector: /(<meta name="twitter:title" content=")[^"]*(")/,
            value: escapeHtml(fullTitle),
          },
          {
            selector: /(<meta name="twitter:description" content=")[^"]*(")/,
            value: escapeHtml(description),
          },
          {
            selector: /(<meta name="twitter:image" content=")[^"]*(")/,
            value: escapeHtml(og),
          },
        ]);

        const dir = path.join(dist, urlPath);
        await fs.mkdir(dir, { recursive: true });
        await fs.writeFile(path.join(dir, "index.html"), html, "utf-8");
      }

      for (const p of posts) {
        await writePage(`/blog/${p.slug}`, p.title, p.subtitle, "post");
      }
      for (const t of talks) {
        await writePage(`/speaking/${t.slug}`, t.title, t.blurb, "talk");
      }
    },
  };
}

export default defineConfig({
  // `hidden` emits .map files for Sentry to upload but doesn't reference
  // them from the bundles — end-users' browsers never download them.
  build: { sourcemap: "hidden" },
  server: {
    proxy: {
      "/cv": {
        target: "",
        bypass: () => "/cv.pdf",
      },
    },
  },
  plugins: [
    { enforce: "pre", ...mdx({
      remarkPlugins: [remarkGfm],
      rehypePlugins: [
        rehypeSlug,
        [rehypePrettyCode, { theme: "github-dark-dimmed" }],
      ],
    }) },
    react(),
    tailwindcss(),
    vercelApiDev(),
    rssFeed(),
    generateOgPages(),
    // Uploads source maps to Sentry after the bundle is built. Disabled
    // automatically when SENTRY_AUTH_TOKEN is missing (e.g. local
    // builds), so we don't need to gate it manually.
    sentryVitePlugin({
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      authToken: process.env.SENTRY_AUTH_TOKEN,
      telemetry: false,
      // Delete the .map files from the final bundle after upload so they
      // aren't served alongside the app.
      sourcemaps: {
        filesToDeleteAfterUpload: ["dist/**/*.map"],
      },
    }),
  ],
});
