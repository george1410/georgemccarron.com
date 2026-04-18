// Returns George's GitHub contribution calendar for the last year by
// scraping the public profile contributions page.
//
// Why scrape instead of using the GraphQL API? The contributionsCollection
// query can't see contributions to orgs that restrict classic PATs, and
// restrictedContributionsCount over-counts (it includes ex-orgs you've
// since left). Scraping the profile page sidesteps both problems — GitHub
// renders the exact same graph a human would see, including private days,
// and the URL takes no token at all.
//
// Env vars required (set on Vercel):
//   GITHUB_USERNAME  — the login whose calendar to fetch (e.g. "george1410")

import type {
  ContribDay,
  ContribLevel,
  ContribResponse,
} from "../src/lib/github-types";

export const config = {
  runtime: "edge",
};

const LEVEL_MAP: Record<string, ContribLevel> = {
  "0": "NONE",
  "1": "FIRST_QUARTILE",
  "2": "SECOND_QUARTILE",
  "3": "THIRD_QUARTILE",
  "4": "FOURTH_QUARTILE",
};

function json(body: ContribResponse, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}

// Group flat cells (sorted by date) into GitHub-style weeks starting on
// Sunday. A partial first week is allowed.
function cellsToWeeks(
  cells: { date: string; level: string; count: number }[],
): { days: ContribDay[] }[] {
  const weeks: { days: ContribDay[] }[] = [];
  for (const c of cells) {
    const dow = new Date(c.date + "T00:00:00Z").getUTCDay();
    if (weeks.length === 0 || dow === 0) weeks.push({ days: [] });
    weeks[weeks.length - 1]!.days.push({
      date: c.date,
      count: c.count,
      level: LEVEL_MAP[c.level] ?? "NONE",
    });
  }
  return weeks;
}

function parseHtml(html: string): ContribResponse {
  // Total contributions — the heading reads "1,492 contributions in the
  // last year" with whitespace between words (it's rendered across lines).
  const totalMatch = html.match(
    /([\d,]+)\s+contributions?\s+in\s+the\s+last\s+year/i,
  );
  const totalContributions = totalMatch
    ? Number(totalMatch[1]!.replace(/,/g, ""))
    : 0;

  // Each day is a `<td class="ContributionCalendar-day" ...>` with
  // data-date, data-level and a stable id. Attributes aren't in a fixed
  // order so we match the tag and then extract fields individually.
  const tdRegex = /<td\b[^>]*?ContributionCalendar-day[^>]*?>/g;
  const byId = new Map<string, { date: string; level: string; count: number }>();
  for (const m of html.matchAll(tdRegex)) {
    const tag = m[0];
    const date = tag.match(/data-date="([^"]+)"/)?.[1];
    const level = tag.match(/data-level="([^"]+)"/)?.[1];
    const id = tag.match(/\bid="([^"]+)"/)?.[1];
    if (date && level && id) byId.set(id, { date, level, count: 0 });
  }

  // Counts live in the <tool-tip for="..."> element paired with each cell.
  // Text reads "No contributions on ..." or "3 contributions on ...".
  const tipRegex =
    /<tool-tip[^>]*?for="(contribution-day-component-[^"]+)"[^>]*?>([^<]+)<\/tool-tip>/g;
  for (const m of html.matchAll(tipRegex)) {
    const cell = byId.get(m[1]!);
    if (!cell) continue;
    const countMatch = m[2]!.match(/^(\d+|No)\s+contribution/i);
    if (countMatch) {
      cell.count =
        countMatch[1]!.toLowerCase() === "no" ? 0 : Number(countMatch[1]);
    }
  }

  const cells = Array.from(byId.values()).sort((a, b) =>
    a.date.localeCompare(b.date),
  );
  return { totalContributions, weeks: cellsToWeeks(cells) };
}

export default async function handler(): Promise<Response> {
  const user = process.env.GITHUB_USERNAME;

  if (!user) {
    console.error("[api/github] Missing GITHUB_USERNAME env var");
    return json({ totalContributions: 0, weeks: [] });
  }

  // Leaving `from`/`to` off returns GitHub's "in the last year" view,
  // matching the rolling window shown on the profile page. With explicit
  // dates GitHub clamps the heading to the calendar year instead.
  const url = `https://github.com/users/${encodeURIComponent(user)}/contributions`;

  try {
    const res = await fetch(url, {
      headers: {
        // Identify ourselves so GitHub's infra has something to trace if
        // this causes issues, and set a normal UA so we get the HTML
        // flavour a browser would see.
        "User-Agent": "georgemccarron.com/1.0 (+contributions-widget)",
        Accept: "text/html,application/xhtml+xml",
      },
    });

    if (!res.ok) throw new Error(`github profile ${res.status}`);
    const html = await res.text();
    return json(parseHtml(html));
  } catch (err) {
    console.error("[api/github]", err);
    return json({ totalContributions: 0, weeks: [] });
  }
}
