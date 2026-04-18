import { Link, isRouteErrorResponse, useRouteError } from "react-router";
import { useTitle } from "../hooks/useTitle";

// Stale-chunk detection — fires when a user with an old index.html in a
// cached tab tries to lazy-load a page whose chunk hash no longer exists.
// Vite's thrown message is very consistent across browsers.
function isChunkLoadError(err: unknown): boolean {
  if (!(err instanceof Error)) return false;
  return (
    /Failed to fetch dynamically imported module/i.test(err.message) ||
    /Importing a module script failed/i.test(err.message) ||
    /error loading dynamically imported module/i.test(err.message)
  );
}

// Guards against infinite reload loops when a chunk is genuinely broken
// (not just stale). First failure triggers one reload; if it fails again
// within the session, we fall through to the real ErrorPage.
const RELOAD_KEY = "__chunk_reload_attempted";

export function ErrorPage() {
  useTitle("Something broke");
  const error = useRouteError();

  if (
    typeof window !== "undefined" &&
    isChunkLoadError(error) &&
    !sessionStorage.getItem(RELOAD_KEY)
  ) {
    sessionStorage.setItem(RELOAD_KEY, "1");
    window.location.reload();
    return null;
  }
  // If we made it past the reload (or this isn't a chunk error), clear the
  // sentinel so the next unrelated load starts fresh.
  if (typeof window !== "undefined") sessionStorage.removeItem(RELOAD_KEY);

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
