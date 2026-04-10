import { Link, NavLink } from "react-router";
import { ThemeToggle } from "./ThemeToggle";

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-stone-900 dark:text-zinc-50 font-semibold"
    : "text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors";

function CmdKButton() {
  return (
    <button
      onClick={() =>
        window.dispatchEvent(
          new KeyboardEvent("keydown", { key: "k", metaKey: true }),
        )
      }
      className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-stone-200 dark:border-zinc-700 text-xs text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300 hover:border-stone-300 dark:hover:border-zinc-600 transition-colors cursor-pointer"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-3 h-3"
      >
        <circle cx="11" cy="11" r="8" />
        <line x1="21" y1="21" x2="16.65" y2="16.65" />
      </svg>
      <kbd className="font-sans">{navigator.platform?.includes("Mac") ? "⌘" : "Ctrl+"}K</kbd>
    </button>
  );
}

export function Nav() {
  return (
    <header
      className="fixed top-0 w-full bg-[#faf8f5]/80 dark:bg-zinc-900/80 backdrop-blur-xl border-b border-stone-200/40 dark:border-zinc-800/40 z-50"
      style={{ viewTransitionName: "nav" }}
    >
      <nav className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between text-sm font-medium">
        <Link
          to="/"
          viewTransition
          className="font-serif italic text-lg text-stone-800 dark:text-zinc-100 hover:text-orange-600 dark:hover:text-orange-400 transition-colors"
        >
          <span className="sm:hidden">GM</span>
          <span className="hidden sm:inline">George McCarron</span>
        </Link>
        <div className="flex items-center gap-6">
          <NavLink to="/" end viewTransition className={navLinkClass}>
            Home
          </NavLink>
          <NavLink to="/blog" viewTransition className={navLinkClass}>
            Blog
          </NavLink>
          <NavLink to="/speaking" viewTransition className={navLinkClass}>
            Speaking
          </NavLink>
          <CmdKButton />
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
