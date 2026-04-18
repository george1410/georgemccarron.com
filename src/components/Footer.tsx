import { NowPlaying } from "./NowPlaying";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 dark:border-zinc-800/60" style={{ viewTransitionName: "footer" }}>
      <div className="max-w-5xl mx-auto px-6 py-10 grid grid-cols-1 sm:grid-cols-3 items-center gap-4 text-center sm:text-left">
        <span className="text-sm text-stone-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} George McCarron
        </span>
        <div className="flex justify-center">
          <NowPlaying />
        </div>
        <div className="flex justify-center sm:justify-end">
          <SocialLinks />
        </div>
      </div>
    </footer>
  );
}
