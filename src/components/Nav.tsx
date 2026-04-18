import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ThemeToggle } from "./ThemeToggle";

const links = [
  { to: "/", label: "Home", end: true },
  { to: "/blog", label: "Blog", end: false },
  { to: "/speaking", label: "Speaking", end: false },
  { to: "/map", label: "Map", end: false },
  { to: "/running", label: "Running", end: false },
] as const;

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  isActive
    ? "text-stone-900 dark:text-zinc-50 font-semibold"
    : "text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300 transition-colors";

const mobileLinkClass = ({ isActive }: { isActive: boolean }) =>
  `block py-2 text-base ${
    isActive
      ? "text-stone-900 dark:text-zinc-50 font-semibold"
      : "text-stone-500 dark:text-zinc-400"
  }`;

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
      <kbd className="font-sans">
        {navigator.platform?.includes("Mac") ? "⌘" : "Ctrl+"}K
      </kbd>
    </button>
  );
}

function HamburgerButton({
  open,
  onClick,
}: {
  open: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={open ? "Close menu" : "Open menu"}
      aria-expanded={open}
      className="sm:hidden -mr-2 p-2 text-stone-500 dark:text-zinc-400 hover:text-stone-800 dark:hover:text-zinc-100 transition-colors cursor-pointer"
    >
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-5 h-5"
      >
        {open ? (
          <>
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </>
        ) : (
          <>
            <line x1="4" y1="6" x2="20" y2="6" />
            <line x1="4" y1="12" x2="20" y2="12" />
            <line x1="4" y1="18" x2="20" y2="18" />
          </>
        )}
      </svg>
    </button>
  );
}

export function Nav() {
  const [open, setOpen] = useState(false);
  const location = useLocation();

  // Close whenever the route changes.
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // Escape closes the menu.
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

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

        {/* Desktop: all nav items inline */}
        <div className="hidden sm:flex items-center gap-6">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              viewTransition
              className={navLinkClass}
            >
              {l.label}
            </NavLink>
          ))}
          <CmdKButton />
          <ThemeToggle />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-1">
          <ThemeToggle />
          <HamburgerButton open={open} onClick={() => setOpen((o) => !o)} />
        </div>
      </nav>

      {/* Mobile dropdown — slides in below the nav bar */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-3 border-t border-stone-200/40 dark:border-zinc-800/40">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              viewTransition
              className={mobileLinkClass}
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      </div>
    </header>
  );
}
