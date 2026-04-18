import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
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
function vercelApiDev(): Plugin {
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
          res.statusCode = response.status;
          response.headers.forEach((value, key) => res.setHeader(key, value));
          const buf = Buffer.from(await response.arrayBuffer());
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
    generateOgPages(),
  ],
});
