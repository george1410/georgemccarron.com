import type { ChangelogEntry } from "./changelog-types";
import data from "./changelog.json";

// `changelog.json` is managed by scripts/build-changelog.ts via the
// post-commit hook. Don't edit it by hand — hand edits would get
// clobbered on the next commit. The file can be either an array of
// entries (legacy) or an object with `entries` + `skipped` arrays.
type Shape = ChangelogEntry[] | { entries: ChangelogEntry[]; skipped: string[] };

const shape = data as Shape;
export const changelog: ChangelogEntry[] = Array.isArray(shape)
  ? shape
  : shape.entries;

