import { useEffect, useMemo, useRef, useState } from "react";
import { geoMercator, geoPath } from "d3-geo";
import { feature } from "topojson-client";
import { zoom, zoomIdentity, type ZoomBehavior } from "d3-zoom";
import { select } from "d3-selection";
import "d3-transition";
import type { FeatureCollection, Geometry } from "geojson";
import statesDataUrl from "us-atlas/states-10m.json?url";

const worldDataUrl = "/data/map-units.json";
import {
  visitedCountries,
  visitedStates,
  plannedCountries,
  plannedStates,
  type Visit,
} from "../data/travel";

const toMap = (list: Visit[]) =>
  new Map(list.map((v) => [v.name, { date: v.date, isHome: v.isHome ?? false }]));

type VisitMap = Map<string, { date?: string; isHome: boolean }>;

function formatVisitDate(date: string | undefined): string | null {
  if (!date) return null;
  const [year, month] = date.split("-");
  if (!year || !month) return null;
  const d = new Date(Number(year), Number(month) - 1, 1);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-US", { month: "long", year: "numeric" });
}

const WIDTH = 900;
const HEIGHT = 560;
const MIN_ZOOM = 1;
const MAX_ZOOM = 40;

// Dropped from render + projection fit: doesn't belong on a countries-visited map
// and its sheer size pulls the rest of the world out of shape.
const EXCLUDED = new Set(["Antarctica", "Fr. S. Antarctic Lands"]);

type RegionProps = { name: string };
type Layer = "country" | "state";
type Status = "home" | "visited" | "planned" | "none";
type MapPath = {
  name: string;
  d: string;
  layer: Layer;
  centroid: [number, number];
  bbox: [[number, number], [number, number]];
};
type HoverState = { name: string; layer: Layer; x: number; y: number } | null;
type HighlightState = { name: string; layer: Layer } | null;
type ListEntry = {
  name: string;
  date?: string;
  layer: Layer;
  status: Status;
};

export function WorldMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const gRef = useRef<SVGGElement>(null);
  const zoomRef = useRef<ZoomBehavior<SVGSVGElement, unknown> | null>(null);
  const [hover, setHover] = useState<HoverState>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [scale, setScale] = useState(1);

  const visitedCountryMap: VisitMap = useMemo(() => toMap(visitedCountries), []);
  const visitedStateMap: VisitMap = useMemo(() => toMap(visitedStates), []);
  const plannedCountryMap: VisitMap = useMemo(() => toMap(plannedCountries), []);
  const plannedStateMap: VisitMap = useMemo(() => toMap(plannedStates), []);

  const [isListOpen, setIsListOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const [highlighted, setHighlighted] = useState<HighlightState>(null);

  const [paths, setPaths] = useState<MapPath[] | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch(worldDataUrl).then((r) => r.json()),
      fetch(statesDataUrl).then((r) => r.json()),
    ]).then(([worldData, statesData]) => {
      if (cancelled) return;

      const worldFc = feature(
        worldData as never,
        (worldData as { objects: { units: unknown } }).objects.units as never,
      ) as unknown as FeatureCollection<Geometry, RegionProps>;

      const statesFc = feature(
        statesData as never,
        (statesData as { objects: { states: unknown } }).objects.states as never,
      ) as unknown as FeatureCollection<Geometry, RegionProps>;

      const countryFeatures = worldFc.features.filter(
        (f) => !EXCLUDED.has(f.properties.name),
      );

      // US is dropped from the world data; state features anchor Alaska/Hawaii
      // into the projection fit bounds.
      const fitTarget: FeatureCollection<Geometry, RegionProps> = {
        type: "FeatureCollection",
        features: [...countryFeatures, ...statesFc.features],
      };

      const projection = geoMercator().fitSize([WIDTH, HEIGHT], fitTarget);
      const pathGen = geoPath(projection);

      const countryPaths: MapPath[] = countryFeatures.map((f) => ({
        name: f.properties.name,
        d: pathGen(f) ?? "",
        layer: "country",
        centroid: pathGen.centroid(f) as [number, number],
        bbox: pathGen.bounds(f) as [[number, number], [number, number]],
      }));

      const statePaths: MapPath[] = statesFc.features.map((f) => ({
        name: f.properties.name,
        d: pathGen(f) ?? "",
        layer: "state",
        centroid: pathGen.centroid(f) as [number, number],
        bbox: pathGen.bounds(f) as [[number, number], [number, number]],
      }));

      setPaths([...countryPaths, ...statePaths]);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  // Recover from stuck-drag state if the window loses focus mid-drag (tab
  // switch while holding mouse button, alt-tab, etc.) — the mouseup event
  // never arrives in those cases.
  useEffect(() => {
    const reset = () => setIsPanning(false);
    const onVisibility = () => {
      if (document.hidden) reset();
    };
    window.addEventListener("blur", reset);
    window.addEventListener("pointerup", reset);
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      window.removeEventListener("blur", reset);
      window.removeEventListener("pointerup", reset);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  // Touch dismiss: if the user taps somewhere that isn't a country path
  // while a tooltip is shown, clear it. Mouse interactions clear via
  // onPointerLeave and don't need this.
  useEffect(() => {
    if (!hover) return;
    const onPointerDown = (e: PointerEvent) => {
      if (e.pointerType === "mouse") return;
      const target = e.target as Element | null;
      if (!target?.closest("path")) setHover(null);
    };
    document.addEventListener("pointerdown", onPointerDown, true);
    return () => document.removeEventListener("pointerdown", onPointerDown, true);
  }, [!!hover]);

  // Close the expanded list on Escape or click outside the panel.
  useEffect(() => {
    if (!isListOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsListOpen(false);
    };
    const onClick = (e: MouseEvent) => {
      if (!panelRef.current?.contains(e.target as Node)) setIsListOpen(false);
    };
    window.addEventListener("keydown", onKey);
    // Capture phase: d3-zoom stops propagation of pointer events on the SVG,
    // so a bubbling listener would never see map clicks. Capture runs first.
    document.addEventListener("pointerdown", onClick, true);
    return () => {
      window.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onClick, true);
    };
  }, [isListOpen]);

  useEffect(() => {
    if (!svgRef.current || !gRef.current || !paths) return;

    const svgSelection = select(svgRef.current);
    const gSelection = select(gRef.current);

    const zoomBehavior = zoom<SVGSVGElement, unknown>()
      .scaleExtent([MIN_ZOOM, MAX_ZOOM])
      .translateExtent([
        [0, 0],
        [WIDTH, HEIGHT],
      ])
      .filter((event) => {
        if (event.type === "wheel") return true;
        if (event.type === "dblclick") return false;
        return !event.button || event.button === 0;
      })
      .on("start", (event) => {
        const type = event.sourceEvent?.type;
        if (type === "mousedown" || type === "touchstart" || type === "pointerdown") {
          setIsPanning(true);
          setHover(null);
        }
      })
      .on("zoom", (event) => {
        gSelection.attr("transform", event.transform.toString());
        setScale(event.transform.k);
      })
      .on("end", () => {
        setIsPanning(false);
      });

    svgSelection.call(zoomBehavior);
    svgSelection.on("dblclick.zoom", null);
    zoomRef.current = zoomBehavior;

    return () => {
      svgSelection.on(".zoom", null);
    };
  }, [paths]);

  const zoomBy = (factor: number) => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(250).call(zoomRef.current.scaleBy, factor);
  };

  const resetZoom = () => {
    if (!svgRef.current || !zoomRef.current) return;
    select(svgRef.current).transition().duration(350).call(zoomRef.current.transform, zoomIdentity);
  };

  const pathsByKey = useMemo(() => {
    const map = new Map<string, MapPath>();
    for (const p of paths ?? []) map.set(`${p.layer}:${p.name}`, p);
    return map;
  }, [paths]);

  const zoomTo = (name: string, layer: Layer) => {
    if (!svgRef.current || !zoomRef.current) return;
    const p = pathsByKey.get(`${layer}:${name}`);
    if (!p) return;
    const [[x0, y0], [x1, y1]] = p.bbox;
    const dx = Math.max(1, x1 - x0);
    const dy = Math.max(1, y1 - y0);
    // Fit so the feature fills ~35% of the viewport (leaves context around it).
    const fitK = 0.35 / Math.max(dx / WIDTH, dy / HEIGHT);
    const k = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, fitK));
    const [cx, cy] = p.centroid;
    const transform = zoomIdentity
      .translate(WIDTH / 2 - k * cx, HEIGHT / 2 - k * cy)
      .scale(k);
    select(svgRef.current)
      .transition()
      .duration(700)
      .call(zoomRef.current.transform, transform);
  };

  const statusOf = (name: string, layer: Layer): Status => {
    const visitedMap = layer === "state" ? visitedStateMap : visitedCountryMap;
    const visited = visitedMap.get(name);
    if (visited) return visited.isHome ? "home" : "visited";
    const plannedMap = layer === "state" ? plannedStateMap : plannedCountryMap;
    if (plannedMap.has(name)) return "planned";
    return "none";
  };

  const dateFor = (name: string, layer: Layer, status: Status): string | undefined => {
    if (status === "home" || status === "visited") {
      return (layer === "state" ? visitedStateMap : visitedCountryMap).get(name)?.date;
    }
    if (status === "planned") {
      return (layer === "state" ? plannedStateMap : plannedCountryMap).get(name)?.date;
    }
    return undefined;
  };

  const handleEnter =
    (name: string, layer: Layer) =>
    (e: React.PointerEvent<SVGPathElement>) => {
      if (isPanning) return;
      const rect = containerRef.current?.getBoundingClientRect();
      if (!rect) return;
      setHover({ name, layer, x: e.clientX - rect.left, y: e.clientY - rect.top });
    };

  // Only chase the cursor on mouse — on touch the tooltip pins at tap point.
  const handleMove = (e: React.PointerEvent<SVGPathElement>) => {
    if (isPanning) return;
    if (e.pointerType !== "mouse") return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    setHover((prev) =>
      prev ? { ...prev, x: e.clientX - rect.left, y: e.clientY - rect.top } : prev,
    );
  };

  // Only auto-clear on mouse leave — on touch the tooltip stays until the
  // user taps somewhere else (handled via the document-level pointerdown
  // effect below).
  const handleLeave = (e: React.PointerEvent<SVGPathElement>) => {
    if (e.pointerType === "mouse") setHover(null);
  };

  const compareEntries = (a: ListEntry, b: ListEntry): number => {
    if (a.date && !b.date) return -1;
    if (!a.date && b.date) return 1;
    if (a.date && b.date) return b.date.localeCompare(a.date);
    return a.name.localeCompare(b.name);
  };

  const collectEntries = (list: Visit[], layer: Layer, status: Status): ListEntry[] =>
    list.map((v) => ({
      name: v.name,
      date: v.date,
      layer,
      status: v.isHome ? "home" : status,
    }));

  const entries = useMemo(() => {
    const all: ListEntry[] = [
      ...collectEntries(visitedCountries, "country", "visited"),
      ...collectEntries(visitedStates, "state", "visited"),
      ...collectEntries(plannedCountries, "country", "planned"),
      ...collectEntries(plannedStates, "state", "planned"),
    ];
    return {
      home: all.filter((e) => e.status === "home").sort(compareEntries),
      visited: all.filter((e) => e.status === "visited").sort(compareEntries),
      planned: all.filter((e) => e.status === "planned").sort(compareEntries),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const atDefault = scale <= MIN_ZOOM + 0.001;
  const countryCount = visitedCountryMap.size + (visitedStateMap.size > 0 ? 1 : 0);
  const stateCount = visitedStateMap.size;
  const plannedCount = plannedCountryMap.size + plannedStateMap.size;
  const hasHome = [...visitedCountryMap.values(), ...visitedStateMap.values()].some(
    (v) => v.isHome,
  );

  const cursorClass = isPanning ? "cursor-grabbing" : "cursor-grab";
  const loaded = !!paths;
  const svg = (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      className={`absolute inset-0 w-full h-full text-[#faf8f5] dark:text-zinc-900 touch-none select-none ${cursorClass} transition-opacity duration-500 ease-out ${loaded ? "opacity-100" : "opacity-0"}`}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label={`World map. ${countryCount} countries and ${stateCount} US states visited.`}
    >
      <g ref={gRef}>
        {(paths ?? []).map((p) => {
          const status = statusOf(p.name, p.layer);
          const isHighlighted =
            highlighted?.name === p.name && highlighted?.layer === p.layer;
          // Highlighted = force the :hover shade, nothing more.
          const fillClass =
            status === "home"
              ? isHighlighted
                ? "fill-rose-600 dark:fill-rose-400"
                : "fill-rose-500 hover:fill-rose-600 dark:fill-rose-500 dark:hover:fill-rose-400"
              : status === "visited"
                ? isHighlighted
                  ? "fill-orange-500 dark:fill-orange-300"
                  : "fill-orange-400 hover:fill-orange-500 dark:fill-orange-400 dark:hover:fill-orange-300"
                : status === "planned"
                  ? isHighlighted
                    ? "fill-violet-500 dark:fill-violet-300"
                    : "fill-violet-400 hover:fill-violet-500 dark:fill-violet-400 dark:hover:fill-violet-300"
                  : isHighlighted
                    ? "fill-stone-300 dark:fill-zinc-600/70"
                    : "fill-stone-200 hover:fill-stone-300 dark:fill-zinc-700/60 dark:hover:fill-zinc-600/70";
          return (
            <path
              key={`${p.layer}:${p.name}`}
              d={p.d}
              vectorEffect="non-scaling-stroke"
              strokeWidth={p.layer === "state" ? 0.4 : 0.6}
              className={`stroke-current transition-colors ${cursorClass} ${fillClass}`}
              onPointerEnter={handleEnter(p.name, p.layer)}
              onPointerMove={handleMove}
              onPointerLeave={handleLeave}
            />
          );
        })}
      </g>
    </svg>
  );

  const zoomControls = (
    <div className="flex flex-col bg-white dark:bg-zinc-800 rounded-lg shadow-sm dark:shadow-none border border-stone-200 dark:border-zinc-700 overflow-hidden">
      <button
        type="button"
        onClick={() => zoomBy(1.6)}
        disabled={scale >= MAX_ZOOM - 0.001}
        aria-label="Zoom in"
        className="w-8 h-8 flex items-center justify-center text-stone-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-stone-50 dark:hover:bg-zinc-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div className="h-px bg-stone-200 dark:bg-zinc-700" />
      <button
        type="button"
        onClick={() => zoomBy(1 / 1.6)}
        disabled={atDefault}
        aria-label="Zoom out"
        className="w-8 h-8 flex items-center justify-center text-stone-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-stone-50 dark:hover:bg-zinc-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="w-4 h-4">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
      <div className="h-px bg-stone-200 dark:bg-zinc-700" />
      <button
        type="button"
        onClick={resetZoom}
        disabled={atDefault}
        aria-label="Reset zoom"
        className="w-8 h-8 flex items-center justify-center text-stone-500 dark:text-zinc-400 hover:text-orange-500 dark:hover:text-orange-400 hover:bg-stone-50 dark:hover:bg-zinc-700/50 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <polyline points="3 3 3 8 8 8" />
        </svg>
      </button>
    </div>
  );

  const tooltip = hover && !isPanning && (
    <div
      className="absolute pointer-events-none -translate-x-1/2 -translate-y-full z-10"
      style={{ left: hover.x, top: hover.y - 22 }}
    >
      <div className="relative bg-white/95 dark:bg-zinc-800/95 backdrop-blur-sm border border-stone-200 dark:border-zinc-700 rounded-lg px-3 py-2 shadow-lg shadow-stone-900/10 dark:shadow-black/30">
        <div className="text-sm font-semibold text-stone-900 dark:text-zinc-50 whitespace-nowrap leading-tight">
          {hover.name}
        </div>
        <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium whitespace-nowrap">
          {(() => {
            const status = statusOf(hover.name, hover.layer);
            const formattedDate = formatVisitDate(
              dateFor(hover.name, hover.layer, status),
            );
            if (status === "home") {
              return (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span className="text-rose-600 dark:text-rose-400">Home</span>
                </>
              );
            }
            if (status === "visited") {
              return (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-orange-400" />
                  {formattedDate ? (
                    <span className="text-orange-500 dark:text-orange-400">
                      Last visited{" "}
                      <span className="text-stone-400 dark:text-zinc-500">
                        {formattedDate}
                      </span>
                    </span>
                  ) : (
                    <span className="text-orange-500 dark:text-orange-400">
                      Been there
                    </span>
                  )}
                </>
              );
            }
            if (status === "planned") {
              return (
                <>
                  <span className="inline-block w-1.5 h-1.5 rounded-full bg-violet-400" />
                  <span className="text-violet-500 dark:text-violet-400">Planned</span>
                  {formattedDate && (
                    <span className="text-stone-400 dark:text-zinc-500">
                      · {formattedDate}
                    </span>
                  )}
                </>
              );
            }
            return <span className="text-stone-400 dark:text-zinc-500">Not yet</span>;
          })()}
        </div>
        <div className="absolute left-1/2 top-full -translate-x-1/2 -mt-1 w-2 h-2 rotate-45 bg-white/95 dark:bg-zinc-800/95 border-r border-b border-stone-200 dark:border-zinc-700" />
      </div>
    </div>
  );

  const stats = (
    <div className="flex items-baseline justify-between gap-4 text-sm flex-wrap">
      <div className="flex items-baseline gap-2 flex-wrap">
        <span className="font-semibold text-stone-900 dark:text-zinc-50 text-base">
          {countryCount}
        </span>
        <span className="text-stone-500 dark:text-zinc-400">visited</span>
        {stateCount > 0 && (
          <>
            <span className="text-stone-300 dark:text-zinc-600">·</span>
            <span className="font-semibold text-stone-900 dark:text-zinc-50 text-base">
              {stateCount}
            </span>
            <span className="text-stone-500 dark:text-zinc-400">
              {stateCount === 1 ? "US state" : "US states"}
            </span>
          </>
        )}
        {plannedCount > 0 && (
          <>
            <span className="text-stone-300 dark:text-zinc-600">·</span>
            <span className="font-semibold text-stone-900 dark:text-zinc-50 text-base">
              {plannedCount}
            </span>
            <span className="text-stone-500 dark:text-zinc-400">planned</span>
          </>
        )}
      </div>
      <div className="flex items-center gap-3 text-xs text-stone-400 dark:text-zinc-500">
        {hasHome && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-rose-500" />
            home
          </span>
        )}
        <span className="flex items-center gap-1.5">
          <span className="inline-block w-2.5 h-2.5 rounded-full bg-orange-400" />
          been there
        </span>
        {plannedCount > 0 && (
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-2.5 h-2.5 rounded-full bg-violet-400" />
            planned
          </span>
        )}
      </div>
    </div>
  );

  return (
    <div
      ref={containerRef}
      className={`relative w-full h-[calc(100svh-3.5rem)] bg-[#faf8f5] dark:bg-zinc-900 overflow-hidden ${cursorClass}`}
      onMouseLeave={() => setHover(null)}
    >
        {/* Loading shimmer — fades out as the SVG fades in, so the
            transition feels continuous rather than a hard swap. */}
        <div
          className={`map-shimmer transition-opacity duration-500 ease-out ${loaded ? "opacity-0" : "opacity-100"}`}
          aria-label="Loading map"
          role="status"
          aria-hidden={loaded}
        />

        {svg}

        {/* Title — top-left */}
        <div className="absolute top-6 left-6 sm:top-10 sm:left-12 pointer-events-none">
          <h1 className="font-serif italic text-4xl sm:text-6xl leading-none tracking-tight text-stone-900 dark:text-zinc-50">
            <span className="gradient-text-animated">Travel</span>
            <span className="text-orange-400">.</span>
          </h1>
          <p className="mt-3 text-sm text-stone-500 dark:text-zinc-400 max-w-xs">
            Where I've been, where I'm going.
          </p>
        </div>

        {/* Zoom controls — top-right */}
        <div className="absolute top-6 right-6 sm:top-10 sm:right-12">{zoomControls}</div>

        {/* Stats panel — bottom-left. Click to expand into list. Width is
            fixed across states so only the list height animates, avoiding
            flex-reflow jank. Transform origin pins the growth to the corner. */}
        <div
          ref={panelRef}
          className={`absolute bottom-6 left-6 sm:bottom-10 sm:left-12 w-[min(22rem,calc(100vw-3rem))] origin-bottom-left bg-white/90 dark:bg-zinc-800/90 backdrop-blur-md border border-stone-200 dark:border-zinc-700 rounded-xl shadow-lg shadow-stone-900/10 dark:shadow-black/30 overflow-hidden transition-opacity duration-300 ${
            paths ? "opacity-100" : "opacity-60 pointer-events-none"
          }`}
        >
          <button
            type="button"
            onClick={() => setIsListOpen((v) => !v)}
            aria-expanded={isListOpen}
            aria-label={isListOpen ? "Collapse list" : "Expand list"}
            className="w-full flex items-center gap-3 px-4 py-3 text-left cursor-pointer hover:bg-stone-50/60 dark:hover:bg-zinc-700/30 transition-colors"
          >
            <div className="flex-1 min-w-0">{stats}</div>
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={`w-4 h-4 flex-shrink-0 text-stone-400 dark:text-zinc-500 transition-transform duration-300 ${
                isListOpen ? "rotate-180" : ""
              }`}
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>

          <div
            className={`grid overflow-hidden transition-[grid-template-rows] duration-400 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              isListOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
            }`}
          >
            <div
              className={`min-h-0 overflow-y-auto max-h-[60vh] border-t border-stone-200 dark:border-zinc-700 transition-[opacity,transform] duration-300 ease-out ${
                isListOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-1"
              }`}
            >
              {entries.home.length > 0 && (
                <ListSection title="Home">
                  {entries.home.map((e) => (
                    <ListRow
                      key={`home:${e.name}`}
                      entry={e}
                      onEnter={setHighlighted}
                      onLeave={() => setHighlighted(null)}
                      onClick={zoomTo}
                    />
                  ))}
                </ListSection>
              )}
              {entries.visited.length > 0 && (
                <ListSection title="Visited">
                  {entries.visited.map((e) => (
                    <ListRow
                      key={`v:${e.layer}:${e.name}`}
                      entry={e}
                      onEnter={setHighlighted}
                      onLeave={() => setHighlighted(null)}
                      onClick={zoomTo}
                    />
                  ))}
                </ListSection>
              )}
              {entries.planned.length > 0 && (
                <ListSection title="Planned">
                  {entries.planned.map((e) => (
                    <ListRow
                      key={`p:${e.layer}:${e.name}`}
                      entry={e}
                      onEnter={setHighlighted}
                      onLeave={() => setHighlighted(null)}
                      onClick={zoomTo}
                    />
                  ))}
                </ListSection>
              )}
            </div>
          </div>
        </div>

      {tooltip}
    </div>
  );
}

function ListSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="px-4 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-stone-400 dark:text-zinc-500">
        {title}
      </h3>
      <ul className="pb-1">{children}</ul>
    </section>
  );
}

function ListRow({
  entry,
  onEnter,
  onLeave,
  onClick,
}: {
  entry: ListEntry;
  onEnter: (h: { name: string; layer: Layer }) => void;
  onLeave: () => void;
  onClick: (name: string, layer: Layer) => void;
}) {
  const dotClass =
    entry.status === "home"
      ? "bg-rose-500"
      : entry.status === "planned"
        ? "bg-violet-400"
        : "bg-orange-400";

  const date =
    entry.date &&
    new Date(
      Number(entry.date.slice(0, 4)),
      Number(entry.date.slice(5, 7)) - 1,
      1,
    ).toLocaleDateString("en-US", { month: "short", year: "numeric" });

  return (
    <li>
      <button
        type="button"
        onMouseEnter={() => onEnter({ name: entry.name, layer: entry.layer })}
        onFocus={() => onEnter({ name: entry.name, layer: entry.layer })}
        onMouseLeave={onLeave}
        onBlur={onLeave}
        onClick={() => onClick(entry.name, entry.layer)}
        className="w-full flex items-baseline justify-between gap-3 px-4 py-1.5 text-sm text-left cursor-pointer hover:bg-stone-100/70 dark:hover:bg-zinc-700/40 transition-colors"
      >
        <span className="flex items-baseline gap-2 min-w-0">
          <span
            className={`inline-block w-1.5 h-1.5 rounded-full flex-shrink-0 translate-y-[-1px] ${dotClass}`}
          />
          <span className="text-stone-900 dark:text-zinc-100 truncate">
            {entry.name}
          </span>
          {entry.layer === "state" && (
            <span className="text-[10px] font-medium uppercase tracking-wider text-stone-400 dark:text-zinc-500 flex-shrink-0">
              US
            </span>
          )}
        </span>
        {date ? (
          <span className="text-xs text-stone-400 dark:text-zinc-500 flex-shrink-0">
            {date}
          </span>
        ) : entry.status === "home" ? (
          <span className="text-xs text-rose-500 dark:text-rose-400 flex-shrink-0">
            Home
          </span>
        ) : null}
      </button>
    </li>
  );
}
