import { defineConfig, type Plugin } from "vite";
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
    generateOgPages(),
  ],
});
