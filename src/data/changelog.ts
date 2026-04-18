import type { ChangelogEntry } from "./changelog-types";
import data from "./changelog.json";

// `changelog.json` is managed by scripts/build-changelog.ts via the
// post-commit hook. Don't edit it by hand — hand edits would get
// clobbered on the next commit. Accepts both the current flat array
// shape and the legacy `{ entries, skipped }` object shape.
type Shape = ChangelogEntry[] | { entries: ChangelogEntry[]; skipped?: unknown };

const shape = data as Shape;
const all: ChangelogEntry[] = Array.isArray(shape) ? shape : shape.entries;

// Skipped markers are for dedupe only — never rendered.
export const changelog: ChangelogEntry[] = all.filter((e) => !e.skipped);

