// Sentry bootstrap. Must be imported as the very first side-effect in the
// entry file so it wires itself up before any app code runs.

import * as Sentry from "@sentry/react";
import { useEffect } from "react";
import {
  createRoutesFromChildren,
  matchRoutes,
  useLocation,
  useNavigationType,
} from "react-router";

Sentry.init({
  dsn: "https://013965fb2061e122243c4e22777abe17@o4511241354608641.ingest.de.sentry.io/4511241361490000",
  environment: import.meta.env.MODE,
  // Keep dev runs out of the dashboard. Flip to `true` (or drop this line)
  // to enable local event capture while debugging.
  enabled: import.meta.env.PROD,
  sendDefaultPii: true,
  integrations: [
    // Router-aware tracing: names transactions by route pattern and tracks
    // navigation spans across SPA route changes (React Router v7).
    Sentry.reactRouterV7BrowserTracingIntegration({
      useEffect,
      useLocation,
      useNavigationType,
      createRoutesFromChildren,
      matchRoutes,
    }),
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
  // Tracing — sample 20% of transactions in prod (generous for a personal
  // site; tune down if volume ever grows).
  tracesSampleRate: 0.2,
  tracePropagationTargets: [
    "localhost",
    /^https:\/\/(www\.)?georgemccarron\.com/,
  ],
  // Session replay — record 10% of sessions normally, everything on error.
  replaysSessionSampleRate: 0.1,
  replaysOnErrorSampleRate: 1.0,
});
