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

  // Short heading keeps visual weight consistent with the 404 page. Only
  // override with the actual status code when one is available — otherwise
  // lead with a friendlier word rather than inventing a "500".
  let heading = "Oops";
  let message = "Something broke. Hit refresh, or head home and try again.";
  let detail: string | null = null;

  if (isRouteErrorResponse(error)) {
    heading = `${error.status}`;
    message = error.statusText || message;
    detail = typeof error.data === "string" ? error.data : null;
  } else if (error instanceof Error) {
    detail = error.message;
  }

  return (
    <div className="relative py-16 md:py-24">
      {/* Soft colour wash behind the heading — same gradient vocabulary as
          the hero and featured cards, cranked up and blurred way out. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-start justify-center -z-10"
      >
        <div className="w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 opacity-20 blur-[120px]" />
      </div>

      <div className="max-w-xl mx-auto text-center">
        <h1 className="font-serif italic leading-none tracking-tight mb-6 text-8xl md:text-[10rem]">
          <span className="gradient-text-animated">{heading}</span>
        </h1>

        <p className="text-lg text-stone-600 dark:text-zinc-300">{message}</p>

        <div className="mt-10">
          <Link
            viewTransition
            to="/"
            className="text-sm font-medium text-stone-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            &larr; Go home
          </Link>
        </div>

        {detail && import.meta.env.DEV && (
          <pre className="mt-10 mx-auto max-w-2xl text-left text-xs text-stone-400 dark:text-zinc-500 whitespace-pre-wrap break-words bg-stone-100 dark:bg-zinc-800/50 rounded-lg p-4">
            {detail}
          </pre>
        )}
      </div>
    </div>
  );
}
