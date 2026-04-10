import { useState, useEffect } from "react";

export function ScrollProgress() {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    function onScroll() {
      const scrollTop = window.scrollY;
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(docHeight > 0 ? scrollTop / docHeight : 0);
    }

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (progress <= 0) return null;

  return (
    <div className="fixed top-14 left-0 right-0 h-0.5 z-50">
      <div
        className="h-full bg-gradient-to-r from-orange-400 via-rose-400 to-violet-500"
        style={{ width: `${progress * 100}%` }}
      />
    </div>
  );
}
