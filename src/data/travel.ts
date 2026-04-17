// Country/state names must match `properties.name` from the two topojsons:
//   public/data/map-units.json (Natural Earth 10m, countries + dependencies)
//   us-atlas states-10m        (US states, DC, territories)
//
// Natural Earth "map units" splits overseas departments into their own features:
// French Guiana, Guadeloupe, Svalbard Islands, Falkland Islands, etc. The UK
// is split into England / Scotland / Wales / N. Ireland. Short-form names:
// "Cabo Verde", "United States of America", "South Korea".
//
// `date` is optional YYYY-MM. For visited entries it represents the last visit;
// for planned entries, the intended trip date. `isHome: true` flags the place
// where you currently live — shown in rose on the map.

export type Visit = { name: string; date?: string; isHome?: boolean };

export const visitedCountries: Visit[] = [
  { name: "England", isHome: true },
  { name: "Ireland", date: "2023-09" },
  { name: "Iceland", date: "2015-02" },
  { name: "France", date: "2013-07"},
  { name: "Spain", date: "2025-08" },
  { name: "Portugal", date: "2014-08"},
  { name: "Italy", date: "2013-02" },
  { name: "Netherlands", date: "2023-09"},
  { name: "Cabo Verde", date: "2017-07" },
  { name: "Cyprus" },
  { name: "Malta" },
  { name: "Switzerland", date: "2016-08" },
  { name: "Guernsey", date: "2017-07" },
  { name: "Jersey", date: "2016-06" },
];

export const visitedStates: Visit[] = [];

export const plannedCountries: Visit[] = [];
export const plannedStates: Visit[] = [{ name: "Washington", date: "2026-05" }];
