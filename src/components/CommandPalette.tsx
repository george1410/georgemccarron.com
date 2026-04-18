import { useState, useEffect, useRef, useCallback, type ReactNode } from "react";
import { useNavigate, useLocation } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { posts } from "../data/posts";
import { talks } from "../data/talks";
import { timeline } from "../data/timeline";
import { timelineEntryId } from "./Timeline";
import type { NowPlayingTrack } from "../lib/spotify-types";

interface CommandItem {
  label: string;
  sublabel?: string;
  action: () => void;
  section: string;
  icon: ReactNode;
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

  // Reuses the cached fetch from <NowPlaying /> — same queryKey.
  const { data: track } = useQuery<NowPlayingTrack>({
    queryKey: ["nowPlaying"],
    queryFn: async () => {
      const res = await fetch("/api/spotify");
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    refetchInterval: 30_000,
    staleTime: 25_000,
    refetchOnWindowFocus: false,
  });

  const toggle = useCallback(() => {
    setOpen((o) => {
      if (!o) {
        setQuery("");
        setActiveIndex(0);
      }
      return !o;
    });
  }, []);

  const nowPlayingItems: CommandItem[] =
    track?.title && track.songUrl
      ? [
          {
            label: `${track.title} · ${track.artist ?? ""}`,
            sublabel: track.isPlaying
              ? "Now playing on Spotify"
              : "Last played on Spotify",
            action: () => ext(track.songUrl!),
            section: track.isPlaying ? "Now playing" : "Last played",
            icon: track.albumImageUrl ? (
              <img
                src={track.albumImageUrl}
                alt=""
                className="w-5 h-5 rounded object-cover"
              />
            ) : (
              <MusicIcon />
            ),
          },
        ]
      : [];

  const allItems: CommandItem[] = [
    ...nowPlayingItems,
    { label: "Home", action: () => go("/"), section: "Pages", icon: <HomeIcon /> },
    { label: "Blog", action: () => go("/blog"), section: "Pages", icon: <PencilIcon /> },
    { label: "Speaking", action: () => go("/speaking"), section: "Pages", icon: <MicIcon /> },
    { label: "Map", action: () => go("/map"), section: "Pages", icon: <MapPinIcon /> },
    ...posts.map((p) => ({
      label: p.title,
      sublabel: p.subtitle,
      action: () => go(`/blog/${p.slug}`),
      section: "Posts",
      icon: <DocumentIcon />,
    })),
    ...talks.map((t) => ({
      label: t.title,
      sublabel: `${t.conference} · ${t.location}`,
      action: () => go(`/speaking/${t.slug}`),
      section: "Talks",
      icon: <MicIcon />,
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
        const targetId = timelineEntryId(entry.company);
        setOpen(false);
        const scroll = () =>
          document
            .getElementById(targetId)
            ?.scrollIntoView({ behavior: "smooth", block: "start" });
        if (location.pathname === "/") {
          scroll();
        } else {
          navigate("/", { viewTransition: true });
          requestAnimationFrame(() => {
            setTimeout(scroll, 250);
          });
        }
      },
      section: "Timeline",
      icon: <BriefcaseIcon />,
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
      icon: <ThemeIcon />,
    },
    {
      label: "Copy email",
      sublabel: "hello@georgemccarron.com",
      action: () => {
        navigator.clipboard.writeText("hello@georgemccarron.com");
        setOpen(false);
      },
      section: "Actions",
      icon: <AtIcon />,
    },
    {
      label: "GitHub",
      sublabel: "george1410",
      action: () => ext("https://github.com/george1410"),
      section: "Links",
      icon: <GithubIcon />,
    },
    {
      label: "X / Twitter",
      sublabel: "@george_mccarron",
      action: () => ext("https://x.com/george_mccarron"),
      section: "Links",
      icon: <XIcon />,
    },
    {
      label: "LinkedIn",
      sublabel: "georgemccarron",
      action: () => ext("https://linkedin.com/in/georgemccarron"),
      section: "Links",
      icon: <LinkedinIcon />,
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

  // Lock body scroll while the palette is open.
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
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
                      <span
                        className={`flex items-center justify-center w-5 h-5 flex-shrink-0 ${isActive ? "text-stone-700 dark:text-zinc-200" : "text-stone-400 dark:text-zinc-500"} transition-colors`}
                      >
                        {item.icon}
                      </span>
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

// Icon set for the command palette. All 20×20 via currentColor so row
// state can recolour them.
const iconCls = "w-[18px] h-[18px]";
const strokeProps = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: "2",
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  className: iconCls,
};

function HomeIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}
function PencilIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}
function MicIcon() {
  return (
    <svg {...strokeProps}>
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M19 10a7 7 0 0 1-14 0" />
      <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
  );
}
function MapPinIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}
function DocumentIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="8" y1="13" x2="16" y2="13" />
      <line x1="8" y1="17" x2="14" y2="17" />
    </svg>
  );
}
function BriefcaseIcon() {
  return (
    <svg {...strokeProps}>
      <rect x="2" y="7" width="20" height="14" rx="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </svg>
  );
}
function ThemeIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
function AtIcon() {
  return (
    <svg {...strokeProps}>
      <circle cx="12" cy="12" r="4" />
      <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
    </svg>
  );
}
function MusicIcon() {
  return (
    <svg {...strokeProps}>
      <path d="M9 18V5l12-2v13" />
      <circle cx="6" cy="18" r="3" />
      <circle cx="18" cy="16" r="3" />
    </svg>
  );
}
function GithubIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconCls}>
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}
function XIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconCls}>
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function LinkedinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={iconCls}>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
