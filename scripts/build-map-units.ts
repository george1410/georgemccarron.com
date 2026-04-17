// Builds public/data/map-units.json from the Natural Earth map_units source.
// This is a one-shot build step — run when the source changes.
//
// Usage: npm run build:map   (or: tsx scripts/build-map-units.ts)
//
// Downloads the GeoJSON from martynafford/natural-earth-geojson, strips
// everything except feature name, simplifies, quantizes, and writes a
// compact TopoJSON.

import { topology } from "topojson-server";
import { quantize, mergeArcs } from "topojson-client";
import topojsonSimplify from "topojson-simplify";
import { writeFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";
import type { FeatureCollection, Feature, Geometry } from "geojson";
import type {
  Topology,
  GeometryCollection,
  Polygon as TopoPolygon,
  MultiPolygon as TopoMultiPolygon,
} from "topojson-specification";

type AreaGeom = (TopoPolygon<OutProps> | TopoMultiPolygon<OutProps>) & {
  properties: OutProps;
};

// Narrow the topology()-input type since @types/topojson-server's shape is broad.
type FeatureCollectionIn = FeatureCollection<Geometry, Record<string, unknown>>;

const { presimplify, simplify } = topojsonSimplify;

const SOURCE_URL =
  "https://raw.githubusercontent.com/martynafford/natural-earth-geojson/master/10m/cultural/ne_10m_admin_0_map_units.json";

const OUT = fileURLToPath(
  new URL("../public/data/map-units.json", import.meta.url),
);

// Internal political subdivisions that shouldn't appear as separate features
// on a travel map. Keys are the target (country) name, values are the source
// NAMEs in the NE dataset. Features not listed here pass through untouched.
const MERGE: Record<string, string[]> = {
  Belgium: ["Brussels", "Flemish", "Walloon"],
  "Bosnia and Herz.": ["Fed. of Bos. & Herz.", "Rep. Srpska"],
  Serbia: ["Serbia", "Vojvodina"],
  Iraq: ["Iraq", "Iraqi Kurdistan"],
  Somalia: ["Somalia", "Puntland"],
  Georgia: ["Georgia", "Adjara"],
  Kazakhstan: ["Kazakhstan", "Baikonur"],
  Tanzania: ["Tanzania", "Zanzibar"],
  "Papua New Guinea": ["Papua New Guinea", "Bougainville"],
  Cuba: ["Cuba", "USNB Guantanamo Bay"],
  "North Korea": ["North Korea", "Korean DMZ (north)"],
  "South Korea": ["South Korea", "Korean DMZ (south)"],
  Syria: ["Syria", "UNDOF Zone"],
  "Antigua and Barbuda": ["Antigua", "Barbuda"],
};

// Drop features that either aren't rendered (Antarctica, French S. Antarctic
// Lands, USA — painted via us-atlas states) or are uninhabited rocks nobody
// visits. Each removed feature also removes its arcs, saving real bytes.
const DROP = new Set([
  "United States of America",
  "Antarctica",
  "Fr. S. Antarctic Lands",
  "Bouvet I.",
  "Clipperton I.",
  "Coral Sea Is.",
  "Ashmore and Cartier Is.",
  "Bajo Nuevo Bank",
  "Serranilla Bank",
  "Scarborough Reef",
  "Kingman Reef",
  "Jarvis I.",
  "Wake Atoll",
  "Midway Is.",
  "Howland I.",
  "Baker I.",
  "Palmyra Atoll",
  "Spratly Is.",
  "Paracel Is.",
  "Heard I. and McDonald Is.",
]);

// Minimal shape of the Natural Earth properties we care about.
type NaturalEarthProps = {
  NAME?: string;
  NAME_LONG?: string;
  ADMIN?: string;
};

type OutProps = { name: string };

function nameOf(p: NaturalEarthProps): string | undefined {
  return p.NAME ?? p.NAME_LONG ?? p.ADMIN;
}

console.log("Fetching source...");
const geojson = (await (await fetch(SOURCE_URL)).json()) as FeatureCollection<
  Geometry,
  NaturalEarthProps
>;

console.log(`Read ${geojson.features.length} features.`);

const features: Feature<Geometry, OutProps>[] = geojson.features
  .filter((f) => {
    const name = nameOf(f.properties);
    return name !== undefined && !DROP.has(name);
  })
  .map((f) => ({
    type: "Feature",
    geometry: f.geometry,
    properties: { name: nameOf(f.properties)! },
  }));

console.log(`Kept ${features.length} features (${DROP.size} dropped).`);

const fc: FeatureCollection<Geometry, OutProps> = {
  type: "FeatureCollection",
  features,
};

// Pipeline: quantized topology (so near-coincident boundaries snap to the
// same arcs — critical for mergeArcs) → merge → simplify → re-quantize.
console.log("Building quantized topology...");
let topo = topology(
  { units: fc as unknown as FeatureCollectionIn },
  1e6,
) as Topology<{
  units: GeometryCollection<OutProps>;
}>;

console.log("Merging internal subdivisions...");
let mergedCount = 0;
for (const [target, sources] of Object.entries(MERGE)) {
  const srcSet = new Set(sources);
  const geometries = topo.objects.units.geometries as AreaGeom[];
  const matching = geometries.filter((g) => srcSet.has(g.properties.name));
  if (matching.length === 0) continue;
  const combined = mergeArcs(topo, matching) as AreaGeom;
  combined.properties = { name: target };
  topo.objects.units.geometries = [
    ...geometries.filter((g) => !srcSet.has(g.properties.name)),
    combined,
  ];
  mergedCount += matching.length;
}
console.log(`  merged ${mergedCount} source features into ${Object.keys(MERGE).length} targets.`);

console.log("Simplifying (barely)...");
topo = presimplify(topo);
topo = simplify(topo, 2e-4); // gentle — visible coastlines preserved

console.log("Quantizing...");
topo = quantize(topo, 1e6);

delete topo.bbox; // we never read this on the client

await mkdir(dirname(OUT), { recursive: true });
await writeFile(OUT, JSON.stringify(topo));

const size = (JSON.stringify(topo).length / 1024).toFixed(1);
console.log(`Wrote ${OUT} (${size} KB).`);

