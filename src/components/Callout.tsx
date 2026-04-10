import type { ReactNode } from "react";

export function Callout({ children }: { children: ReactNode }) {
  return (
    <div className="border-l-4 border-orange-400 dark:border-orange-500 bg-orange-50 dark:bg-orange-950/30 rounded-r-xl px-5 py-4 my-6 text-sm text-stone-600 dark:text-zinc-300 [&>p]:m-0">
      {children}
    </div>
  );
}
