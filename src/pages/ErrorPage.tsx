import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { useTitle } from "../hooks/useTitle";

export function ErrorPage() {
  useTitle("Something broke");
  const error = useRouteError();

  let heading = "Something broke";
  let message = "Hit refresh, or head home and try again.";
  let detail: string | null = null;

  if (isRouteErrorResponse(error)) {
    heading = `${error.status}`;
    message = error.statusText || message;
    detail = typeof error.data === "string" ? error.data : null;
  } else if (error instanceof Error) {
    detail = error.message;
  }

  return (
    <div className="text-center py-20">
      <h1 className="font-serif italic text-6xl md:text-7xl mb-4">
        <span className="gradient-text-animated">{heading}</span>
        <span className="text-orange-400">.</span>
      </h1>
      <p className="text-stone-500 dark:text-zinc-400 mb-8">{message}</p>
      <Link
        viewTransition
        to="/"
        className="inline-block px-6 py-2.5 bg-white dark:bg-zinc-800/50 rounded-xl shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 text-sm font-medium text-stone-700 dark:text-zinc-300 hover:text-orange-600 dark:hover:text-orange-400 hover:shadow-md dark:hover:border-zinc-600/50 transition-all"
      >
        Go home
      </Link>
      {detail && import.meta.env.DEV && (
        <pre className="mt-10 mx-auto max-w-2xl text-left text-xs text-stone-400 dark:text-zinc-500 whitespace-pre-wrap break-words bg-stone-100 dark:bg-zinc-800/50 rounded-lg p-4">
          {detail}
        </pre>
      )}
    </div>
  );
}
