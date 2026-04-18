import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import "./index.css";

// Fired by Vite when a lazy-loaded chunk 404s — happens when a visitor has
// a stale index.html in their tab and we've since shipped a new build.
// Silence the default throw and hard-reload so the next load fetches the
// fresh index.html (and matching chunk hashes).
if (typeof window !== "undefined") {
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    window.location.reload();
  });
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
