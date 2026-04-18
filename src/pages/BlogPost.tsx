import { useParams, Link } from "react-router";
import { useState, useEffect, useRef, type ComponentType } from "react";
import { posts } from "../data/posts";
import { SocialLinks } from "../components/SocialLinks";
import { Callout } from "../components/Callout";
import { YouTubeEmbed } from "../components/YouTubeEmbed";
import { Pre } from "../components/CopyButton";
import { ShareButtons } from "../components/ShareButtons";
import { Minimap } from "../components/Minimap";
import { ScrollProgress } from "../components/ScrollProgress";
import { useTitle } from "../hooks/useTitle";
import type { ReactNode } from "react";

const postModules = import.meta.glob<{
  default: ComponentType<{
    components?: Record<string, ComponentType<Record<string, unknown>>>;
  }>;
}>("../content/posts/*.mdx");

const postLoaders = Object.fromEntries(
  Object.entries(postModules).map(([path, loader]) => [
    path.split("/").pop()!.replace(".mdx", ""),
    loader,
  ]),
);

const mdxComponents: Record<string, ComponentType<Record<string, unknown>>> = {
  Callout: Callout as ComponentType<Record<string, unknown>>,
  YouTubeEmbed: YouTubeEmbed as ComponentType<Record<string, unknown>>,
  pre: Pre as ComponentType<Record<string, unknown>>,
  Caption: (({ children }: { children?: ReactNode }) => (
    <figcaption className="text-center text-sm text-stone-400 dark:text-zinc-500 -mt-4 mb-6 italic">
      {children}
    </figcaption>
  )) as ComponentType<Record<string, unknown>>,
};

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const [Content, setContent] = useState<ComponentType<{
    components?: Record<string, ComponentType<Record<string, unknown>>>;
  }> | null>(null);
  const [loading, setLoading] = useState(true);
  const [readingTime, setReadingTime] = useState<number | null>(null);

  const proseRef = useRef<HTMLDivElement>(null);

  const post = posts.find((p) => p.slug === slug);
  useTitle(post?.title ?? "Blog");

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setContent(null);
    const loader = postLoaders[slug];
    if (loader) {
      loader().then((mod) => {
        setContent(() => mod.default);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [slug]);

  // Calculate reading time from rendered text
  useEffect(() => {
    if (!proseRef.current || loading) return;
    const text = proseRef.current.textContent ?? "";
    const words = text.trim().split(/\s+/).length;
    setReadingTime(Math.max(1, Math.round(words / 230)));
  }, [loading, Content]);

  if (!post) {
    return (
      <div className="text-center py-20">
        <h1 className="font-serif italic text-4xl text-stone-900 dark:text-zinc-50 mb-4">
          Not found
        </h1>
        <Link
          viewTransition
          to="/blog"
          className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors font-medium"
        >
          &larr; Back to blog
        </Link>
      </div>
    );
  }

  return (
    <article>
      <ScrollProgress />
      <Link
        viewTransition
        to="/blog"
        className="text-sm text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium inline-block mb-10"
      >
        &larr; Back to blog
      </Link>

      <header className="mb-10">
        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 mb-3">
          {formatDate(post.date)}
          {readingTime && (
            <>
              <span className="mx-2">&middot;</span>
              {readingTime} min read
            </>
          )}
        </div>
        <h1 className="font-serif italic text-4xl md:text-5xl tracking-tight text-stone-900 dark:text-zinc-50 leading-tight">
          {post.title}
        </h1>
        <p className="text-lg text-stone-500 dark:text-zinc-400 mt-3">
          {post.subtitle}
        </p>
        <div
          className="aspect-video rounded-2xl overflow-hidden mt-8 shadow-lg dark:shadow-none -mx-2 md:-mx-6"
          style={{ viewTransitionName: `post-hero-${slug}` }}
        >
          <img
            src={post.heroImage}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
      </header>

      <Minimap contentRef={proseRef} ready={!loading && Content !== null} />
      <div className="max-w-prose mx-auto">
        {loading ? (
          <div className="space-y-4 animate-pulse">
            <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-5/6" />
            <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-4/6" />
            <div className="h-8" />
            <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-full" />
            <div className="h-4 bg-stone-200 dark:bg-zinc-800 rounded w-3/6" />
          </div>
        ) : Content ? (
          <div ref={proseRef} className="prose prose-stone dark:prose-invert max-w-none prose-headings:font-semibold prose-headings:tracking-tight">
            <Content components={mdxComponents} />
          </div>
        ) : null}

        {!loading && <ShareButtons title={post.title} />}

        {/* Author */}
        <div className="mt-14 pt-8 border-t border-stone-200 dark:border-zinc-800">
          <div className="flex items-center gap-4 bg-white dark:bg-zinc-800/50 rounded-2xl p-6 shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50">
            <img
              src="/me2.jpg"
              alt="George McCarron"
              className="w-14 h-14 rounded-xl flex-shrink-0 shadow-sm dark:shadow-none"
            />
            <div>
              <div className="font-semibold text-stone-900 dark:text-zinc-50">
                George McCarron
              </div>
              <p className="text-sm text-stone-500 dark:text-zinc-400 mt-0.5">
                Software engineer in London. Building{" "}
                <a
                  href="https://incident.io"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
                >
                  incident.io
                </a>
                .
              </p>
              <div className="mt-2">
                <SocialLinks />
              </div>
            </div>
          </div>
        </div>
      </div>
    </article>
  );
}
