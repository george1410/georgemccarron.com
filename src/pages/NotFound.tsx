import { Link } from "react-router";
import { useTitle } from "../hooks/useTitle";

export function NotFound() {
  useTitle("404");

  return (
    <div className="text-center py-20">
      <h1 className="font-serif italic text-6xl md:text-7xl text-stone-900 dark:text-zinc-50 mb-4">
        404<span className="text-orange-400">.</span>
      </h1>
      <p className="text-stone-500 dark:text-zinc-400 mb-8">
        This page doesn't exist.
      </p>
      <Link
        viewTransition
        to="/"
        className="inline-block px-6 py-2.5 bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 text-sm font-medium text-stone-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-md dark:hover:border-zinc-600/50 transition-all"
      >
        Go home
      </Link>
    </div>
  );
}
