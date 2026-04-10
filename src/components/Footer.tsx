import { SocialLinks } from "./SocialLinks";

export function Footer() {
  return (
    <footer className="border-t border-stone-200/60 dark:border-zinc-800/60" style={{ viewTransitionName: "footer" }}>
      <div className="max-w-5xl mx-auto px-6 py-10 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span className="text-sm text-stone-400 dark:text-zinc-500">
          &copy; {new Date().getFullYear()} George McCarron
        </span>
        <SocialLinks />
      </div>
    </footer>
  );
}
