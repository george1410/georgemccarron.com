import { Link } from "react-router";
import type { Post } from "../data/posts";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function PostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      viewTransition
      className="group block bg-white dark:bg-zinc-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-lg dark:hover:border-zinc-600/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div
        className="aspect-video overflow-hidden"
        style={{ viewTransitionName: `post-hero-${post.slug}` }}
      >
        <img
          src={post.heroImage}
          alt=""
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
      </div>
      <div className="p-5">
        <span className="text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
          {formatDate(post.date)}
        </span>
        <h3 className="font-semibold text-stone-900 dark:text-zinc-50 mt-1 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
          {post.title}
        </h3>
        <p className="text-sm text-stone-500 dark:text-zinc-400 mt-1.5 leading-relaxed">
          {post.subtitle}
        </p>
      </div>
    </Link>
  );
}

export function FeaturedPostCard({ post }: { post: Post }) {
  return (
    <Link
      to={`/blog/${post.slug}`}
      viewTransition
      className="group block bg-white dark:bg-zinc-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-lg dark:hover:border-zinc-600/50 transition-all duration-300 hover:-translate-y-1"
    >
      <div className="md:flex">
        <div
          className="md:w-1/2 aspect-video md:aspect-auto overflow-hidden"
          style={{ viewTransitionName: `post-hero-${post.slug}` }}
        >
          <img
            src={post.heroImage}
            alt=""
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        </div>
        <div className="p-6 md:p-8 flex flex-col justify-center md:w-1/2">
          <span className="text-xs font-medium text-stone-400 dark:text-zinc-500 uppercase tracking-wider">
            {formatDate(post.date)}
          </span>
          <h3 className="text-xl font-semibold text-stone-900 dark:text-zinc-50 mt-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
            {post.title}
          </h3>
          <p className="text-stone-500 dark:text-zinc-400 mt-2 leading-relaxed">
            {post.subtitle}
          </p>
          <span className="mt-4 text-sm font-semibold text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
            Read more &rarr;
          </span>
        </div>
      </div>
    </Link>
  );
}
