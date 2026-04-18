import { Link } from "react-router";
import { useTitle } from "../hooks/useTitle";
import { SocialLinks } from "../components/SocialLinks";
import { PostCard, FeaturedPostCard } from "../components/PostCard";
import { Timeline } from "../components/Timeline";
import { NowPlaying } from "../components/NowPlaying";
import { YouTubeEmbed } from "../components/YouTubeEmbed";
import { posts } from "../data/posts";
import { talks } from "../data/talks";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function Home() {
  useTitle();
  const [featured, ...rest] = posts;
  const talk = talks[0]!;

  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="flex flex-col md:flex-row items-center md:items-start gap-10 md:gap-16">
        <div className="flex-1 order-2 md:order-1">
          <h1 className="font-serif italic text-6xl md:text-7xl lg:text-8xl leading-[0.95] tracking-tight">
            <span className="gradient-text-animated">George</span>
            <br />
            <span className="gradient-text-animated">McCarron</span>
            <span className="text-orange-400">.</span>
          </h1>
          <p className="mt-6 text-lg text-stone-500 dark:text-zinc-400 leading-relaxed max-w-md">
            Software engineer based in London, UK. Building the single place you
            turn when things go wrong at{" "}
            <a
              href="https://incident.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 font-medium transition-colors"
            >
              incident.io
            </a>
            .
          </p>
          <div className="mt-5">
            <SocialLinks />
          </div>
        </div>
        <div className="order-1 md:order-2 flex-shrink-0 flex flex-col items-center md:items-end gap-10">
          <div className="group relative">
            <div className="absolute -inset-3 rounded-3xl bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 opacity-0 group-hover:opacity-70 blur-2xl transition-all duration-700" />
            <img
              src="/me2.jpg"
              alt="George McCarron"
              className="relative w-36 h-36 md:w-48 md:h-48 rounded-3xl object-cover shadow-xl ring-4 ring-white dark:ring-zinc-800 rotate-3 group-hover:-rotate-2 group-hover:scale-105 transition-all duration-500"
            />
          </div>
          <NowPlaying variant="hero" />
        </div>
      </section>

      {/* Writing */}
      <section>
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500">
            Writing
          </h2>
          <Link
            viewTransition
            to="/blog"
            className="text-sm text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium"
          >
            All posts &rarr;
          </Link>
        </div>
        <div className="space-y-6">
          {featured && <FeaturedPostCard post={featured} />}
          <div className="grid gap-6 grid-cols-1 sm:grid-cols-3">
            {rest.slice(0, 3).map((post) => (
              <PostCard key={post.slug} post={post} />
            ))}
          </div>
        </div>
      </section>

      {/* Speaking */}
      <section>
        <div className="flex items-baseline justify-between mb-8">
          <h2 className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500">
            Speaking
          </h2>
          <Link
            viewTransition
            to="/speaking"
            className="text-sm text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium"
          >
            View talks &rarr;
          </Link>
        </div>
        <div className="bg-white dark:bg-zinc-800/50 rounded-2xl shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 overflow-hidden">
          <YouTubeEmbed url={talk.videoUrl} />
          <div className="p-6">
            <Link
              viewTransition
              to={`/speaking/${talk.slug}`}
              className="text-lg font-semibold text-stone-900 dark:text-zinc-50 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
            >
              {talk.title}
            </Link>
            <p className="text-sm text-stone-400 dark:text-zinc-500 mt-1">
              <a
                href={talk.conferenceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
              >
                {talk.conference}
              </a>
              <span className="mx-1.5">&middot;</span>
              {formatDate(talk.date)}
              <span className="mx-1.5">&middot;</span>
              {talk.location}
            </p>
            </div>
        </div>
      </section>

      {/* Timeline */}
      <section>
        <h2 id="timeline" className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 mb-8 scroll-mt-24">
          Timeline
        </h2>
        <Timeline />
      </section>

    </div>
  );
}
