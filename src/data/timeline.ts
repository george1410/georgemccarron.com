export interface TimelineRole {
  title: string;
  date: string;
}

export interface TimelineEntry {
  company: string;
  companyDescription: string;
  excerpt: string;
  url: string;
  logo: string;
  logoBg?: boolean;
  roles: TimelineRole[];
  tags?: string[];
}

export const timeline: TimelineEntry[] = [
  {
    company: "incident.io",
    companyDescription:
      "All-in-one platform for on-call, incident response, and status pages — used by OpenAI, Netflix, and Airbnb.",
    excerpt:
      "Building enterprise integrations with tools like Cisco Webex and ServiceNow in Go and TypeScript/React, helping land multiple large customers.",
    url: "https://incident.io",
    logo: "https://img.logo.dev/incident.io?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64",
    roles: [{ title: "Product Engineer", date: "Jan 2026 – Present" }],
    tags: ["Go", "TypeScript"],
  },
  {
    company: "Orbital",
    companyDescription:
      "AI-powered platform automating review and reporting of real-estate legal documents.",
    excerpt:
      "Built Orbital Copilot from scratch as part of the founding team, scaling it from zero to significant ARR across the UK and US.",
    url: "https://orbital.tech",
    logo: "https://img.logo.dev/orbital.tech?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64",
    roles: [
      { title: "Senior Software Engineer", date: "Feb 2025 – Dec 2025" },
      { title: "Software Engineer", date: "Jul 2023 – Feb 2025" },
    ],
    tags: ["TypeScript", "Python"],
  },
  {
    company: "ClearScore",
    companyDescription:
      "Free credit score and financial marketplace serving 20 million+ users worldwide.",
    excerpt:
      "Full-stack TypeScript across React and Node.js. Led reliability improvements to core marketplace architecture and introduced Nx to optimise the CI/CD pipeline.",
    url: "https://clearscore.com",
    logo: "https://img.logo.dev/clearscore.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64",
    logoBg: true,
    roles: [{ title: "Frontend Engineer", date: "Feb 2022 – Jul 2023" }],
    tags: ["TypeScript"],
  },
  {
    company: "Capital One",
    companyDescription:
      "Leading digital bank and financial services company.",
    excerpt:
      "Built accessible React apps and Node.js backends on AWS. Led re-architecture of serverless microservices, cutting costs and improving performance.",
    url: "https://capitalone.co.uk",
    logo: "https://img.logo.dev/capitalone.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64",
    roles: [{ title: "Software Engineer", date: "Sep 2020 – Feb 2022" }],
    tags: ["JavaScript", "TypeScript", "Python", "Swift", "Objective-C"],
  },
  {
    company: "Capital One",
    companyDescription:
      "Leading digital bank and financial services company.",
    excerpt:
      "Built a public API for hackathons and shipped regulatory features to a business-critical customer-facing application.",
    url: "https://capitalone.co.uk",
    logo: "https://img.logo.dev/capitalone.com?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64",
    roles: [{ title: "Software Engineering Intern", date: "Jul – Sep 2019" }],
    tags: ["Java", "JavaScript"],
  },
  {
    company: "University of Nottingham",
    companyDescription: "",
    excerpt: "First Class Honours.",
    url: "https://nottingham.ac.uk",
    logo: "https://img.logo.dev/nottingham.ac.uk?token=pk_W6gl0JlERfaMoT1Au5v4Xg&retina=true&format=png&size=64",
    roles: [{ title: "BSc (Hons) Computer Science", date: "2017 – 2020" }],
  },
];
