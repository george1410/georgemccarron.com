import { Link, useLocation } from "react-router";
import { useTitle } from "../hooks/useTitle";
import { posts } from "../data/posts";
import { talks } from "../data/talks";

// Standard iterative Levenshtein distance — two rolling rows keep it at
// O(min(a,b)) memory. 40-something lines of self-contained algorithm
// earns us a "did you mean?" suggestion on the 404 page.
function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  let prev = new Array<number>(b.length + 1);
  let curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;

  for (let i = 1; i <= a.length; i++) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(
        curr[j - 1]! + 1, // insert
        prev[j]! + 1, // delete
        prev[j - 1]! + cost, // replace
      );
    }
    [prev, curr] = [curr, prev];
  }
  return prev[b.length]!;
}

type Candidate = { to: string; label: string };

function allCandidates(): Candidate[] {
  return [
    { to: "/", label: "Home" },
    { to: "/blog", label: "Blog" },
    { to: "/speaking", label: "Speaking" },
    { to: "/map", label: "Map" },
    { to: "/running", label: "Running" },
    ...posts.map((p) => ({ to: `/blog/${p.slug}`, label: p.title })),
    ...talks.map((t) => ({ to: `/speaking/${t.slug}`, label: t.title })),
  ];
}

// Returns the closest-known route to what the user typed, but only if it
// feels close enough to be worth suggesting — otherwise the suggestion is
// noise.
function closestMatch(attempted: string): Candidate | null {
  const normalized = attempted.toLowerCase().replace(/\/+$/, "") || "/";
  let best: (Candidate & { distance: number }) | null = null;

  for (const c of allCandidates()) {
    const d = levenshtein(normalized, c.to.toLowerCase());
    if (!best || d < best.distance) best = { ...c, distance: d };
  }

  if (!best) return null;
  // Accept suggestions within ~30% of the URL length (so small typos pass,
  // totally unrelated URLs don't). Also cap the minimum so 5-char typos
  // still surface a match.
  const threshold = Math.max(3, Math.floor(normalized.length * 0.3));
  return best.distance <= threshold ? best : null;
}

export function NotFound() {
  useTitle("404");
  const { pathname } = useLocation();
  const suggestion = closestMatch(pathname);

  return (
    <div className="relative py-16 md:py-24">
      {/* Soft colour wash behind the number — same gradient vocabulary as
          the hero and featured cards, cranked up and blurred way out. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-start justify-center -z-10"
      >
        <div className="w-[32rem] h-[32rem] rounded-full bg-gradient-to-br from-orange-400 via-rose-400 to-violet-500 opacity-20 blur-[120px]" />
      </div>

      <div className="max-w-xl mx-auto text-center">
        <h1 className="font-serif italic text-8xl md:text-[10rem] leading-none tracking-tight mb-6">
          <span className="gradient-text-animated">404</span>
        </h1>

        <p className="text-lg text-stone-600 dark:text-zinc-300">
          Hmm, that page doesn't exist.
        </p>

        {pathname && pathname !== "/" && (
          <p className="mt-2 text-xs text-stone-400 dark:text-zinc-500 font-mono break-all">
            {pathname}
          </p>
        )}

        {suggestion ? (
          <p className="mt-8 text-lg text-stone-600 dark:text-zinc-300">
            Did you mean{" "}
            <Link
              viewTransition
              to={suggestion.to}
              className="font-serif italic text-stone-900 dark:text-zinc-50 hover:text-orange-600 dark:hover:text-orange-400 transition-colors underline decoration-orange-400/50 hover:decoration-orange-500 underline-offset-4 decoration-2"
            >
              {suggestion.label}
            </Link>
            ?
          </p>
        ) : null}

        <div className="mt-10">
          <Link
            viewTransition
            to="/"
            className="text-sm font-medium text-stone-400 dark:text-zinc-500 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
          >
            &larr; Go home
          </Link>
        </div>
      </div>
    </div>
  );
}
