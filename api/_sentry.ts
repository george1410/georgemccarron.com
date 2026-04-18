// Shared Sentry bootstrap for the Vercel edge functions. Each handler
// imports this file at the top — the `Sentry.init` call runs once per
// cold start as a module side effect. No explicit capture helper is
// needed: `captureConsoleIntegration` turns every `console.error(...)`
// into a Sentry event, and the patched `console.error` below schedules a
// background flush via `waitUntil` so events survive isolate teardown.

import * as Sentry from "@sentry/vercel-edge";
import { waitUntil } from "@vercel/functions";

Sentry.init({
  dsn: "https://013965fb2061e122243c4e22777abe17@o4511241354608641.ingest.de.sentry.io/4511241361490000",
  environment: process.env.VERCEL_ENV ?? "development",
  // Only ship events from production deploys — preview and dev runs
  // stay out of the dashboard.
  enabled: process.env.VERCEL_ENV === "production",
  sendDefaultPii: true,
  tracesSampleRate: 0.2,
  integrations: [
    // Any `console.error(...)` call becomes a Sentry event — covers
    // log-and-return paths that never throw into our catch blocks.
    Sentry.captureConsoleIntegration({ levels: ["error"] }),
  ],
});

// Patch `console.error` so every log automatically schedules a Sentry
// flush that continues running after the handler has returned its
// response. Vercel's `waitUntil` keeps the isolate alive for background
// work, so we get reliable delivery without any response-time latency.
// Sentry's own captureConsoleIntegration has already wrapped console.error
// by the time this runs — we're wrapping again so the flush fires after
// the capture.
{
  const patched = console.error;
  console.error = (...args: unknown[]) => {
    patched.apply(console, args);
    try {
      waitUntil(Sentry.flush(2000));
    } catch {
      // Outside a Vercel request context (module load, local dev) — safe
      // to ignore; flush will still complete eventually.
    }
  };
}

export { Sentry };
