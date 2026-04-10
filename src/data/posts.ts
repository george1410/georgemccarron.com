export interface Post {
  slug: string;
  title: string;
  subtitle: string;
  date: string;
  heroImage: string;
}

export const posts: Post[] = [
  {
    slug: "preventing-supabase-pausing",
    title: "Preventing Supabase Pausing",
    subtitle:
      "A quick trick to stop Supabase pausing your database on low-traffic projects",
    date: "2024-04-20",
    heroImage: "/images/preventing-supabase-pausing/hero.jpg",
  },
  {
    slug: "rendering-rich-markdown-table-cells",
    title: "Rendering Rich Markdown Table Cells",
    subtitle: "A story about being pragmatic and getting things done",
    date: "2024-01-21",
    heroImage: "/images/rendering-rich-markdown-table-cells/hero.png",
  },
  {
    slug: "downsizing-my-first-6-months-of-startup-life",
    title: "Downsizing: My First 6 Months of Startup Life",
    subtitle:
      "My thoughts on startups after switching from much bigger companies",
    date: "2024-01-10",
    heroImage: "/images/downsizing-my-first-6-months-of-startup-life/hero.png",
  },
  {
    slug: "my-first-dip-into-conference-speaking-at-jsdayie",
    title: "My First Dip into Conference Speaking at JSDayIE",
    subtitle:
      "Reflecting on my experience speaking about monorepos and Nx at JSDayIE",
    date: "2023-10-16",
    heroImage:
      "/images/my-first-dip-into-conference-speaking-at-jsdayie/hero.jpg",
  },
];
