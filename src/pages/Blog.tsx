import { PostCard } from "../components/PostCard";
import { posts } from "../data/posts";
import { useTitle } from "../hooks/useTitle";

export function Blog() {
  useTitle("Blog");
  return (
    <div>
      <div className="flex items-end justify-between gap-4 mb-10 flex-wrap">
        <h1 className="font-serif italic text-5xl md:text-6xl tracking-tight">
          <span className="gradient-text-animated">Blog</span>
        </h1>
        <a
          href="/rss.xml"
          className="group inline-flex items-center gap-1.5 text-xs font-medium text-stone-400 dark:text-zinc-500 hover:text-orange-500 dark:hover:text-orange-400 transition-colors"
        >
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-3.5 h-3.5"
            aria-hidden="true"
          >
            <path d="M4 11a9 9 0 0 1 9 9h-2a7 7 0 0 0-7-7v-2zm0-6a15 15 0 0 1 15 15h-2A13 13 0 0 0 4 7V5zm2 12a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
          </svg>
          <span>RSS</span>
        </a>
      </div>
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2">
        {posts.map((post) => (
          <PostCard key={post.slug} post={post} />
        ))}
      </div>
    </div>
  );
}
