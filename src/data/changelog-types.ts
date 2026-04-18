export type ChangelogEntry = {
  // Full ISO-8601 timestamp — we need time-of-day resolution so commits
  // made on the same day sort correctly.
  date: string;
  title: string;
  summary: string;
  // Original commit subject. Kept for dedupe (author-date + subject is
  // stable across amends, unlike commit hash). Not rendered.
  subject?: string;
};
