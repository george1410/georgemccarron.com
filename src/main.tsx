// MUST be first — Sentry needs to initialise before any other code runs.
import "./instrument";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { reactErrorHandler } from "@sentry/react";
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

// React 19 delivers errors through these three callbacks — piping them to
// Sentry captures uncaught errors, errors caught by error boundaries, and
// recoverable errors alike.
createRoot(document.getElementById("root")!, {
  onUncaughtError: reactErrorHandler(),
  onCaughtError: reactErrorHandler(),
  onRecoverableError: reactErrorHandler(),
}).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
