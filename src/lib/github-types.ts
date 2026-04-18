// Response shape of /api/github. Shared between the Vercel function that
// produces it and the client component that consumes it.

export type ContribLevel =
  | "NONE"
  | "FIRST_QUARTILE"
  | "SECOND_QUARTILE"
  | "THIRD_QUARTILE"
  | "FOURTH_QUARTILE";

export type ContribDay = {
  date: string;
  count: number;
  level: ContribLevel;
};

export type ContribResponse = {
  totalContributions: number;
  weeks: { days: ContribDay[] }[];
};
