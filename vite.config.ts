import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import mdx from "@mdx-js/rollup";
import tailwindcss from "@tailwindcss/vite";
import remarkGfm from "remark-gfm";
import rehypeSlug from "rehype-slug";
import rehypePrettyCode from "rehype-pretty-code";

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
  ],
});
