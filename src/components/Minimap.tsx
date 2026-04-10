import { useState, useEffect, useRef, type RefObject } from "react";

interface Heading {
  id: string;
  text: string;
  level: number;
}

export function Minimap({
  contentRef,
  ready,
}: {
  contentRef: RefObject<HTMLDivElement | null>;
  ready: boolean;
}) {
  const [headings, setHeadings] = useState<Heading[]>([]);
  const [activeId, setActiveId] = useState<string>("");
  const [visible, setVisible] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<IntersectionObserver | null>(null);

  // Extract headings once content renders
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    const nodes = el.querySelectorAll("h2, h3");
    const items: Heading[] = Array.from(nodes)
      .filter((node) => node.id)
      .map((node) => ({
        id: node.id,
        text: node.textContent ?? "",
        level: node.tagName === "H3" ? 3 : 2,
      }));

    setHeadings(items);
  }, [contentRef, ready]);

  // Show minimap only once the prose content is scrolled into view
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;

    sentinelRef.current = new IntersectionObserver(
      ([entry]) => {
        if (entry) setVisible(entry.isIntersecting);
      },
      { rootMargin: "0px 0px -80% 0px" },
    );

    sentinelRef.current.observe(el);
    return () => sentinelRef.current?.disconnect();
  }, [contentRef, ready]);

  // Track active heading
  useEffect(() => {
    if (headings.length === 0) return;

    observerRef.current?.disconnect();
    const visibleIds = new Set<string>();

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            visibleIds.add(entry.target.id);
          } else {
            visibleIds.delete(entry.target.id);
          }
        });

        const first = headings.find((h) => visibleIds.has(h.id));
        if (first) {
          setActiveId(first.id);
        }
      },
      { rootMargin: "-80px 0px -60% 0px" },
    );

    headings.forEach((h) => {
      const el = document.getElementById(h.id);
      if (el) observerRef.current!.observe(el);
    });

    return () => observerRef.current?.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav
      className={`hidden xl:block fixed right-8 top-24 w-44 transition-opacity duration-300 ${visible ? "opacity-100" : "opacity-0 pointer-events-none"}`}
    >
      <div className="text-[10px] font-semibold uppercase tracking-widest text-stone-400 dark:text-zinc-500 mb-3">
        On this page
      </div>
      <ul className="space-y-1.5 border-l border-stone-200 dark:border-zinc-700/50">
        {headings.map((h) => {
          const isActive = h.id === activeId;
          return (
            <li key={h.id}>
              <a
                href={`#${h.id}`}
                onClick={(e) => {
                  e.preventDefault();
                  const el = document.getElementById(h.id);
                  if (el) {
                    const top =
                      el.getBoundingClientRect().top + window.scrollY - 96;
                    window.scrollTo({ top, behavior: "smooth" });
                  }
                }}
                className={`block text-xs leading-snug transition-colors duration-150 -ml-px border-l-2 ${
                  h.level === 3 ? "pl-5" : "pl-3"
                } ${
                  isActive
                    ? "border-orange-400 text-stone-900 dark:text-zinc-100 font-medium"
                    : "border-transparent text-stone-400 dark:text-zinc-500 hover:text-stone-600 dark:hover:text-zinc-300"
                }`}
              >
                {h.text}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
