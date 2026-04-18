import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation } from "react-router";
import { ThemeToggle } from "./ThemeToggle";

// Primary nav items sit inline on desktop. Secondary items live under a
// "More" dropdown to keep the bar uncluttered. Mobile flattens everything
// into the hamburger menu.
const primaryLinks = [
  { to: "/blog", label: "Blog" },
  { to: "/speaking", label: "Speaking" },
] as const;

const secondaryLinks = [
  { to: "/map", label: "Map" },
  { to: "/running", label: "Running" },
  { to: "/changelog", label: "Changelog" },
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

function MoreDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // Close whenever the route changes (so clicking a link inside closes).
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  // Close on outside click and on escape.
  useEffect(() => {
    if (!open) return;
    function onPointer(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  // Show an "active" style on the More trigger itself when any of the
  // secondary routes is currently active.
  const secondaryActive = secondaryLinks.some((l) => pathname.startsWith(l.to));

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={`inline-flex items-center gap-1 cursor-pointer transition-colors ${
          secondaryActive
            ? "text-stone-900 dark:text-zinc-50 font-semibold"
            : "text-stone-400 hover:text-stone-600 dark:text-zinc-500 dark:hover:text-zinc-300"
        }`}
      >
        <span>More</span>
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`w-3 h-3 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[9rem] py-1 bg-white dark:bg-zinc-800 border border-stone-200 dark:border-zinc-700 rounded-xl shadow-lg shadow-stone-900/10 dark:shadow-black/30"
        >
          {secondaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              viewTransition
              role="menuitem"
              className={({ isActive }) =>
                `block px-4 py-2 text-sm transition-colors ${
                  isActive
                    ? "text-stone-900 dark:text-zinc-50 font-semibold"
                    : "text-stone-500 dark:text-zinc-400 hover:text-orange-600 dark:hover:text-orange-400"
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </div>
      )}
    </div>
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

  const allLinks = [...primaryLinks, ...secondaryLinks];

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

        {/* Desktop: primary nav items inline, rest in a More dropdown. */}
        <div className="hidden sm:flex items-center gap-6">
          {primaryLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              viewTransition
              className={navLinkClass}
            >
              {l.label}
            </NavLink>
          ))}
          <MoreDropdown />
          <CmdKButton />
          <ThemeToggle />
        </div>

        {/* Mobile: theme toggle + hamburger */}
        <div className="flex sm:hidden items-center gap-1">
          <ThemeToggle />
          <HamburgerButton open={open} onClick={() => setOpen((o) => !o)} />
        </div>
      </nav>

      {/* Mobile dropdown — slides in below the nav bar. Flattens primary
          and secondary links into a single list, since there's no need
          for a "More" sub-menu when we already have the hamburger. */}
      <div
        className={`sm:hidden overflow-hidden transition-[max-height,opacity] duration-300 ease-out ${
          open ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="px-6 py-3 border-t border-stone-200/40 dark:border-zinc-800/40">
          {allLinks.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
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
