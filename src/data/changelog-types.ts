// An entry is either a real changelog item, or a marker that the commit
// was inspected and deliberately skipped. Keeping both kinds in a single
// array means dedupe and display each walk one list.
export type ChangelogEntry = {
  // Full ISO-8601 timestamp — we need time-of-day resolution so commits
  // made on the same day sort correctly.
  date: string;
  // Original commit subject. Kept for dedupe (author-date + subject is
  // stable across amends, unlike commit hash). Not rendered.
  subject?: string;
  title?: string;
  summary?: string;
  // Marker for commits Claude declined to include. Skipped entries are
  // filtered out of the rendered changelog but still block re-processing.
  skipped?: true;
};
