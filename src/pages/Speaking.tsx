import { Link } from "react-router";
import { talks } from "../data/talks";
import { useTitle } from "../hooks/useTitle";

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function getThumbnail(embedUrl: string): string {
  const id = embedUrl.split("/embed/")[1]?.split("?")[0];
  return `https://img.youtube.com/vi/${id}/maxresdefault.jpg`;
}

export function Speaking() {
  useTitle("Speaking");
  return (
    <div>
      <h1 className="font-serif italic text-5xl md:text-6xl tracking-tight mb-10">
        <span className="gradient-text-animated">Speaking</span>
      </h1>

      <div className="space-y-6">
        {talks.map((talk) => (
          <Link
            key={talk.slug}
            viewTransition
            to={`/speaking/${talk.slug}`}
            className="group block bg-white dark:bg-zinc-800/50 rounded-2xl overflow-hidden shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-lg dark:hover:border-zinc-600/50 hover:-translate-y-1 transition-all duration-300"
          >
            <div className="md:flex">
              <div className="md:w-2/5 aspect-video md:aspect-auto overflow-hidden relative">
                <img
                  src={getThumbnail(talk.videoUrl)}
                  alt=""
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/90 dark:bg-zinc-900/90 flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-orange-500 ml-0.5">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              <div className="p-6 md:p-8 flex flex-col justify-center md:w-3/5">
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-stone-400 dark:text-zinc-500">
                  <span className="font-medium text-orange-500 dark:text-orange-400">
                    {talk.conference}
                  </span>
                  <span>&middot;</span>
                  <span>{formatDate(talk.date)}</span>
                  <span>&middot;</span>
                  <span>{talk.location}</span>
                </div>
                <h2 className="text-xl font-semibold text-stone-900 dark:text-zinc-50 mt-2 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                  {talk.title}
                </h2>
                <p className="text-stone-500 dark:text-zinc-400 mt-2 leading-relaxed line-clamp-2">
                  {talk.blurb}
                </p>
                <span className="mt-4 text-sm font-semibold text-orange-500 dark:text-orange-400 group-hover:text-orange-600 dark:group-hover:text-orange-300 transition-colors">
                  Watch talk &rarr;
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
