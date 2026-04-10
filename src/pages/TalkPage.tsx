import { useParams, Link } from "react-router";
import { YouTubeEmbed } from "../components/YouTubeEmbed";
import { talks } from "../data/talks";
import { posts } from "../data/posts";
import { useTitle } from "../hooks/useTitle";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function TalkPage() {
  const { slug } = useParams<{ slug: string }>();
  const talk = talks.find((t) => t.slug === slug);
  useTitle(talk?.title ?? "Talk");

  if (!talk) {
    return (
      <div className="text-center py-20">
        <h1 className="font-serif italic text-4xl text-stone-900 dark:text-zinc-50 mb-4">
          Not found<span className="text-orange-400">.</span>
        </h1>
        <Link
          viewTransition
          to="/speaking"
          className="text-orange-500 hover:text-orange-600 dark:text-orange-400 dark:hover:text-orange-300 transition-colors font-medium"
        >
          &larr; Back to speaking
        </Link>
      </div>
    );
  }

  return (
    <article>
      <Link
        viewTransition
        to="/speaking"
        className="text-sm text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors font-medium inline-block mb-10"
      >
        &larr; Back to speaking
      </Link>

      <header className="mb-8">
        <h1 className="font-serif italic text-3xl md:text-4xl tracking-tight text-stone-900 dark:text-zinc-50 leading-tight">
          {talk.title}
          <span className="text-orange-400">.</span>
        </h1>
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-3">
          <a
            href={talk.conferenceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-500 dark:text-orange-400 hover:text-orange-600 dark:hover:text-orange-300 transition-colors"
          >
            {talk.conference}
            <svg
              viewBox="0 0 16 16"
              fill="currentColor"
              className="w-3 h-3 opacity-60"
            >
              <path d="M6.22 8.72a.75.75 0 0 0 1.06 1.06l5.22-5.22v1.69a.75.75 0 0 0 1.5 0v-3.5a.75.75 0 0 0-.75-.75h-3.5a.75.75 0 0 0 0 1.5h1.69L6.22 8.72Z" />
              <path d="M3.5 6.75c0-.69.56-1.25 1.25-1.25H7A.75.75 0 0 0 7 4H4.75A2.75 2.75 0 0 0 2 6.75v4.5A2.75 2.75 0 0 0 4.75 14h4.5A2.75 2.75 0 0 0 12 11.25V9a.75.75 0 0 0-1.5 0v2.25c0 .69-.56 1.25-1.25 1.25h-4.5c-.69 0-1.25-.56-1.25-1.25v-4.5Z" />
            </svg>
          </a>
          <span className="text-stone-300 dark:text-zinc-600">&middot;</span>
          <span className="text-sm text-stone-400 dark:text-zinc-500">
            {formatDate(talk.date)}
          </span>
          <span className="text-stone-300 dark:text-zinc-600">&middot;</span>
          <span className="text-sm text-stone-400 dark:text-zinc-500">
            {talk.location}
          </span>
        </div>
      </header>

      <div className="rounded-2xl overflow-hidden shadow-lg dark:shadow-none mb-8 -mx-2 md:-mx-6">
        <YouTubeEmbed url={talk.videoUrl} />
      </div>

      <div className="prose prose-stone dark:prose-invert max-w-none">
        <p className="text-lg leading-relaxed">{talk.blurb}</p>

        <p>
          As any org scales, at some stage you'll find yourself wanting to share
          code between different projects &mdash; wouldn't it be great to reuse
          that React component we built for the client app in our new admin tool!
          Or maybe you're working in a microfrontend architecture with dozens or
          hundreds of independently deployable frontend applications. One way of
          solving these problems is with a monorepo &mdash; but that brings
          problems in itself around scalability and maintainability... enter{" "}
          <a href="https://nx.dev" target="_blank" rel="noopener noreferrer">
            Nx
          </a>
          !
        </p>
      </div>

      {/* Resources */}
      <div className="flex flex-wrap gap-3 mt-8">
        <a
          href="https://pitch.com/public/1d879346-dc78-46ab-8cdc-80dc9bf1cd45"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 text-sm font-medium text-stone-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-md dark:hover:border-zinc-600/50 transition-all"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4"
          >
            <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
            <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
          </svg>
          View slides
        </a>
        <a
          href="https://github.com/george1410/nx-talk-jsdayie-2023"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 text-sm font-medium text-stone-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-md dark:hover:border-zinc-600/50 transition-all"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
            <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
          </svg>
          Source code
        </a>
      </div>

      {/* Related blog post */}
      {talk.relatedPostSlug && (() => {
        const related = posts.find((p) => p.slug === talk.relatedPostSlug);
        if (!related) return null;
        return (
          <div className="mt-12 pt-8 border-t border-stone-200 dark:border-zinc-800">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 mb-4">
              Related post
            </p>
            <Link
              viewTransition
              to={`/blog/${related.slug}`}
              className="group flex items-center gap-4 bg-white dark:bg-zinc-800/50 rounded-2xl p-4 shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-lg dark:hover:border-zinc-600/50 hover:-translate-y-0.5 transition-all duration-300"
            >
              <img
                src={related.heroImage}
                alt=""
                className="w-20 h-14 rounded-lg object-cover flex-shrink-0"
              />
              <div>
                <div className="font-semibold text-stone-900 dark:text-zinc-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {related.title}
                </div>
                <div className="text-sm text-stone-400 dark:text-zinc-500 mt-0.5">
                  {related.subtitle}
                </div>
              </div>
            </Link>
          </div>
        );
      })()}
    </article>
  );
}
