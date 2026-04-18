// Regenerates src/data/changelog.json by running Claude over any git
// commit not yet present in the cache. Triggered by the post-commit
// git hook. Requires ANTHROPIC_API_KEY in the environment.

import {
  readFileSync,
  writeFileSync,
  existsSync,
  mkdirSync,
} from "node:fs";
import { execSync } from "node:child_process";
import { dirname } from "node:path";
import { config as loadEnv } from "dotenv";
import Anthropic from "@anthropic-ai/sdk";
import type { ChangelogEntry } from "../src/data/changelog-types";

// Match Vite's env precedence: .env.local wins over .env. dotenv doesn't
// overwrite existing vars on subsequent loads, so the .local file takes
// priority when both define the same key.
loadEnv({ path: ".env.local" });
loadEnv({ path: ".env" });

const CACHE_PATH = "src/data/changelog.json";
// Scan this many commits on each run once the cache has something in it
// — comfortably more than a typical working session's worth of commits.
// When the cache is empty (first run), we skip the cap and process the
// full history so nothing gets dropped.
const MAX_COMMITS = 50;
// Hard cap on the diff we send to Claude per commit; keeps input token
// counts (and therefore cost) predictable.
const MAX_DIFF_CHARS = 8000;
const MODEL = "claude-haiku-4-5";

type Commit = { hash: string; date: string; subject: string };

type Cache = { entries: ChangelogEntry[]; skipped: string[] };

function loadCache(): Cache {
  if (!existsSync(CACHE_PATH)) return { entries: [], skipped: [] };
  const raw = JSON.parse(readFileSync(CACHE_PATH, "utf-8"));
  // Legacy array-only format — migrate into the new shape on read.
  if (Array.isArray(raw)) return { entries: raw as ChangelogEntry[], skipped: [] };
  return {
    entries: (raw.entries ?? []) as ChangelogEntry[],
    skipped: (raw.skipped ?? []) as string[],
  };
}

function saveCache(cache: Cache) {
  const dir = dirname(CACHE_PATH);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2) + "\n", "utf-8");
}

function recentCommits(limit: number | null): Commit[] {
  const RSEP = "<<<R>>>";
  const FSEP = "<<<F>>>";
  const nFlag = limit != null ? `-n ${limit}` : "";
  const out = execSync(
    `git log --no-merges ${nFlag} --pretty=format:'%H${FSEP}%aI${FSEP}%s${RSEP}'`,
    { encoding: "utf-8", maxBuffer: 10_000_000 },
  );
  return out
    .split(RSEP)
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [hash, date, subject] = s.split(FSEP);
      return {
        hash: (hash ?? "").trim(),
        date: (date ?? "").trim(),
        subject: (subject ?? "").trim(),
      };
    });
}

function commitDiff(hash: string): string {
  try {
    const out = execSync(`git show --no-color --stat-count=50 ${hash}`, {
      encoding: "utf-8",
      maxBuffer: 2_000_000,
    });
    return out.slice(0, MAX_DIFF_CHARS);
  } catch {
    return "";
  }
}

const TOOLS = [
  {
    name: "add_entry",
    description:
      "Record a changelog entry for this commit. Use when the commit changes something a site visitor might care about.",
    input_schema: {
      type: "object" as const,
      properties: {
        title: {
          type: "string",
          description:
            "3–8 words, no trailing punctuation, no prefix like 'Added'/'Fixed'. Sentence case.",
        },
        summary: {
          type: "string",
          description:
            "1–2 sentences. Focus on the user-visible change or reader-interesting detail. Natural tone, contractions fine, no exclamation marks.",
        },
      },
      required: ["title", "summary"],
    },
  },
  {
    name: "skip",
    description:
      "Skip the commit entirely. Use for typo fixes, formatting-only changes, dependency bumps, WIP/chore commits, or anything too trivial to tell someone about.",
    input_schema: {
      type: "object" as const,
      properties: {
        reason: { type: "string" },
      },
    },
  },
];

async function summarise(
  client: Anthropic,
  commit: Commit,
): Promise<{ title: string; summary: string } | null> {
  const diff = commitDiff(commit.hash);
  if (!diff) return null;

  const prompt = `You are writing an entry for the changelog page of a personal website. Voice: casual, specific, short. Think "building in public" diary, not marketing copy.

Decide whether this commit deserves a changelog entry, then call either \`add_entry\` or \`skip\`.

Commit subject: ${commit.subject}

Git show output (truncated):
${diff}`;

  try {
    const res = await client.messages.create({
      model: MODEL,
      max_tokens: 400,
      tools: TOOLS,
      tool_choice: { type: "any" },
      messages: [{ role: "user", content: prompt }],
    });

    const toolUse = res.content.find((b) => b.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") return null;
    if (toolUse.name === "skip") return null;
    if (toolUse.name !== "add_entry") return null;

    const input = toolUse.input as { title?: string; summary?: string };
    if (!input.title || !input.summary) return null;
    return { title: input.title.trim(), summary: input.summary.trim() };
  } catch (err) {
    console.error(`  ! failed on ${commit.hash.slice(0, 7)}: ${err}`);
    return null;
  }
}

async function main() {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    console.log(
      "[changelog] ANTHROPIC_API_KEY not set — skipping (commit proceeds).",
    );
    return;
  }

  const client = new Anthropic({ apiKey });
  const cache = loadCache();
  const processedHashes = new Set([
    ...cache.entries.map((e) => e.hash),
    ...cache.skipped,
  ]);
  const totalCached = cache.entries.length + cache.skipped.length;
  // Cache empty → first run → process everything. Cache populated →
  // only look at the recent window, since anything older is already in.
  // git log returns newest-first; reverse so we summarise in chronological
  // order. If a long run is interrupted, the cache retains full history
  // up to the point of failure rather than just the latest few commits.
  const commits = recentCommits(
    totalCached === 0 ? null : MAX_COMMITS,
  ).reverse();

  const newEntries: ChangelogEntry[] = [];
  const newSkipped: string[] = [];
  for (const c of commits) {
    const shortHash = c.hash.slice(0, 7);
    if (processedHashes.has(shortHash)) continue;

    process.stdout.write(`[changelog] summarising ${shortHash} "${c.subject}" … `);
    const result = await summarise(client, c);
    if (!result) {
      console.log("skip");
      newSkipped.push(shortHash);
      continue;
    }

    console.log(`"${result.title}"`);
    newEntries.push({
      date: c.date,
      title: result.title,
      summary: result.summary,
      hash: shortHash,
    });
  }

  if (newEntries.length === 0 && newSkipped.length === 0) {
    console.log("[changelog] no new entries.");
    return;
  }

  // Full ISO timestamps compare lexicographically == chronologically.
  const merged: ChangelogEntry[] = [...newEntries, ...cache.entries].sort(
    (a, b) => b.date.localeCompare(a.date),
  );
  saveCache({
    entries: merged,
    skipped: [...cache.skipped, ...newSkipped],
  });
  console.log(
    `[changelog] added ${newEntries.length} entrie(s), ${newSkipped.length} skip(s).`,
  );
}

main().catch((err) => {
  console.error("[changelog]", err);
  process.exit(1);
});
