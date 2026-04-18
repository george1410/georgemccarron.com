import { NowPlaying } from "./NowPlaying";
import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 dark:border-zinc-800/60" style={{ viewTransitionName: "footer" }}>
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row items-center justify-between gap-4">
        <NowPlaying />
        <SocialLinks />
      </div>
    </footer>
  );
}
