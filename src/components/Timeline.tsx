import { timeline } from "../data/timeline";

export function Timeline() {
  return (
    <div className="relative">
      {/* Center line — desktop only */}
      <div className="absolute left-1/2 top-0 bottom-0 w-px bg-stone-200 dark:bg-zinc-700/50 hidden sm:block" />

      <div className="space-y-5 sm:space-y-8">
        {timeline.map((entry, i) => {
          const isLeft = i % 2 === 0;
          return (
            <div key={i} className="relative">
              {/* Dot on the center line */}
              <div className="absolute left-1/2 top-6 -translate-x-1/2 w-3 h-3 rounded-full bg-orange-400 ring-4 ring-[#faf8f5] dark:ring-zinc-900 z-10 hidden sm:block" />

              {/* Card */}
              <div
                className={`sm:w-[calc(50%-2rem)] ${isLeft ? "" : "sm:ml-auto"}`}
              >
                <a
                  href={entry.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block bg-white dark:bg-zinc-800/50 rounded-2xl p-5 shadow-sm dark:shadow-none dark:border dark:border-zinc-700/50 hover:shadow-lg dark:hover:border-zinc-600/50 hover:-translate-y-0.5 transition-all duration-300"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <img
                      src={entry.logo}
                      alt=""
                      className={`w-10 h-10 rounded-xl flex-shrink-0 object-contain ${entry.logoBg ? "bg-white p-1" : ""}`}
                    />
                    <div className="font-semibold text-stone-900 dark:text-zinc-50 group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors leading-snug">
                      {entry.company}
                    </div>
                  </div>

                  {/* Roles */}
                  <div className="space-y-1 mb-3">
                    {entry.roles.map((role, j) => (
                      <div key={j} className="flex items-baseline justify-between gap-2">
                        <span className="text-sm font-medium text-stone-700 dark:text-zinc-300">
                          {role.title}
                        </span>
                        <span className="text-xs text-stone-400 dark:text-zinc-500 whitespace-nowrap">
                          {role.date}
                        </span>
                      </div>
                    ))}
                  </div>

                  {entry.companyDescription && (
                    <p className="text-xs text-stone-400 dark:text-zinc-500 leading-relaxed mb-2 italic">
                      {entry.companyDescription}
                    </p>
                  )}
                  <p className="text-sm text-stone-600 dark:text-zinc-300 leading-relaxed">
                    {entry.excerpt}
                  </p>
                  {entry.tags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {entry.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-stone-100 dark:bg-zinc-700/50 text-stone-500 dark:text-zinc-400"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </a>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
