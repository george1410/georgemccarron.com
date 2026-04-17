import { Outlet, useLocation } from "react-router";
import { useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { Nav } from "./Nav";
import { Footer } from "./Footer";
import { CommandPalette } from "./CommandPalette";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <ScrollToTop />
      <CommandPalette />
      <Nav />
      <main className="flex-1 max-w-5xl mx-auto px-6 pt-28 pb-20 w-full">
        <Outlet />
      </main>
      <Footer />
      <Analytics />
      <SpeedInsights />
    </div>
  );
}
