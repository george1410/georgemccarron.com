export interface Talk {
  slug: string;
  title: string;
  date: string;
  videoUrl: string;
  conference: string;
  conferenceUrl: string;
  location: string;
  blurb: string;
  relatedPostSlug?: string;
}

export const talks: Talk[] = [
  {
    slug: "building-fast-maintainable-javascript-monorepos-with-nx",
    title: "Building Fast, Maintainable JavaScript Monorepos with Nx",
    date: "2023-09-26",
    videoUrl:
      "https://www.youtube.com/embed/axcYKMnSI54?si=04zpe-mUZzxCiP6S",
    conference: "JSDayIE",
    conferenceUrl: "https://www.jsconf.ie",
    location: "Dublin, Ireland",
    blurb:
      "In this talk we'll discuss how Nx can help you to manage a monorepo and the benefits that it brings. We will dive into how it can help you to generate new projects, its smart ability to know what's changed and only rebuild what it absolutely needs to, and how its distributed nature can reduce the time you spend waiting for CICD pipelines to run.",
    relatedPostSlug: "my-first-dip-into-conference-speaking-at-jsdayie",
  },
];
