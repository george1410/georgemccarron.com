export type PostViewsResponse = {
  views: Record<string, number>;
};

export type PostViewResponse = {
  slug: string;
  views: number;
};
