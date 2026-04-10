import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router";
import { posts } from "../data/posts";
import { talks } from "../data/talks";
import { timeline } from "../data/timeline";

interface CommandItem {
  label: string;
  sublabel?: string;
  action: () => void;
  section: string;
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();

  const go = useCallback(
    (to: string) => {
      setOpen(false);
      navigate(to, { viewTransition: true });
    },
    [navigate],
  );

  const ext = useCallback((url: string) => {
    setOpen(false);
    window.open(url, "_blank", "noopener,noreferrer");
  }, []);

  const toggle = useCallback(() => {
    setOpen((o) => {
      if (!o) {
        setQuery("");
        setActiveIndex(0);
      }
      return !o;
    });
  }, []);

  const allItems: CommandItem[] = [
    { label: "Home", action: () => go("/"), section: "Pages" },
    { label: "Blog", action: () => go("/blog"), section: "Pages" },
    { label: "Speaking", action: () => go("/speaking"), section: "Pages" },
    ...posts.map((p) => ({
      label: p.title,
      sublabel: p.subtitle,
      action: () => go(`/blog/${p.slug}`),
      section: "Posts",
    })),
    ...talks.map((t) => ({
      label: t.title,
      sublabel: `${t.conference} · ${t.location}`,
      action: () => go(`/speaking/${t.slug}`),
      section: "Talks",
    })),
    ...Object.values(
      timeline.reduce<Record<string, { company: string; roles: string[] }>>((acc, entry) => {
        if (!acc[entry.company]) {
          acc[entry.company] = { company: entry.company, roles: [] };
        }
        acc[entry.company]!.roles.push(...entry.roles.map((r) => r.title));
        return acc;
      }, {}),
    ).map((entry) => ({
      label: entry.company,
      sublabel: entry.roles.join(", "),
      action: () => {
        setOpen(false);
        if (location.pathname === "/") {
          document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
        } else {
          navigate("/", { viewTransition: true });
          requestAnimationFrame(() => {
            setTimeout(() => {
              document.getElementById("experience")?.scrollIntoView({ behavior: "smooth" });
            }, 250);
          });
        }
      },
      section: "Experience",
    })),
    {
      label: "Toggle theme",
      sublabel: "Switch between light and dark mode",
      action: () => {
        const isDark = document.documentElement.classList.contains("dark");
        document.documentElement.classList.add("theme-transition");
        document.documentElement.classList.toggle("dark", !isDark);
        localStorage.setItem("theme", isDark ? "light" : "dark");
        setTimeout(() => document.documentElement.classList.remove("theme-transition"), 300);
        setOpen(false);
      },
      section: "Actions",
    },
    {
      label: "Copy email",
      sublabel: "hello@georgemccarron.com",
      action: () => {
        navigator.clipboard.writeText("hello@georgemccarron.com");
        setOpen(false);
      },
      section: "Actions",
    },
    {
      label: "GitHub",
      sublabel: "george1410",
      action: () => ext("https://github.com/george1410"),
      section: "Links",
    },
    {
      label: "X / Twitter",
      sublabel: "@george_mccarron",
      action: () => ext("https://x.com/george_mccarron"),
      section: "Links",
    },
    {
      label: "LinkedIn",
      sublabel: "georgemccarron",
      action: () => ext("https://linkedin.com/in/georgemccarron"),
      section: "Links",
    },
  ];

  const filtered = query
    ? allItems.filter(
        (item) =>
          item.label.toLowerCase().includes(query.toLowerCase()) ||
          item.sublabel?.toLowerCase().includes(query.toLowerCase()),
      )
    : allItems;

  // Group by section
  const sections = filtered.reduce<Record<string, CommandItem[]>>(
    (acc, item) => {
      (acc[item.section] ??= []).push(item);
      return acc;
    },
    {},
  );

  // Flat list for keyboard nav
  const flatItems = Object.values(sections).flat();

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    const el = listRef.current?.querySelector("[data-active='true']");
    el?.scrollIntoView({ block: "nearest" });
  }, [activeIndex]);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        toggle();
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, toggle]);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % flatItems.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + flatItems.length) % flatItems.length);
    } else if (e.key === "Enter" && flatItems[activeIndex]) {
      e.preventDefault();
      flatItems[activeIndex].action();
    }
  }

  if (!open) return null;

  let itemIndex = -1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-start justify-center pt-[20vh]"
      onClick={() => setOpen(false)}
    >
      <div className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl dark:shadow-none dark:border dark:border-zinc-700/50 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Input */}
        <div className="flex items-center gap-3 px-4 border-b border-stone-200 dark:border-zinc-800">
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="w-4 h-4 text-stone-400 dark:text-zinc-500 flex-shrink-0"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            ref={inputRef}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Where to?"
            className="w-full py-3.5 bg-transparent text-stone-900 dark:text-zinc-100 placeholder:text-stone-400 dark:placeholder:text-zinc-500 outline-none text-sm"
          />
          <kbd className="hidden sm:inline-flex text-[10px] font-medium text-stone-400 dark:text-zinc-500 bg-stone-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div ref={listRef} className="max-h-72 overflow-y-auto p-2">
          {flatItems.length === 0 ? (
            <div className="px-3 py-8 text-center text-sm text-stone-400 dark:text-zinc-500">
              No results
            </div>
          ) : (
            Object.entries(sections).map(([section, items]) => (
              <div key={section}>
                <div className="px-3 pt-2 pb-1 text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-zinc-500">
                  {section}
                </div>
                {items.map((item) => {
                  itemIndex++;
                  const isActive = itemIndex === activeIndex;
                  const idx = itemIndex;
                  return (
                    <button
                      key={`${section}-${item.label}`}
                      data-active={isActive}
                      onClick={item.action}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left cursor-pointer transition-colors ${
                        isActive
                          ? "bg-stone-100 dark:bg-zinc-800"
                          : "hover:bg-stone-50 dark:hover:bg-zinc-800/50"
                      }`}
                    >
                      <div className="min-w-0 flex-1">
                        <div
                          className={`text-sm truncate ${isActive ? "text-stone-900 dark:text-zinc-50" : "text-stone-600 dark:text-zinc-300"}`}
                        >
                          {item.label}
                        </div>
                        {item.sublabel && (
                          <div className="text-xs text-stone-400 dark:text-zinc-500 truncate">
                            {item.sublabel}
                          </div>
                        )}
                      </div>
                      {isActive && (
                        <kbd className="hidden sm:inline-flex text-[10px] font-medium text-stone-400 dark:text-zinc-500 bg-stone-200 dark:bg-zinc-700 px-1.5 py-0.5 rounded flex-shrink-0">
                          ↵
                        </kbd>
                      )}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
