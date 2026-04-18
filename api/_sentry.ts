// Shared Sentry bootstrap for the Vercel edge functions. Each handler
// imports this file at the top — the `Sentry.init` call runs once per
// cold start as a module side effect. `reportError` is a convenience
// helper that captures and flushes (the edge runtime can exit before
// in-flight events are sent otherwise).

import * as Sentry from "@sentry/vercel-edge";

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

export async function reportError(err: unknown, context: string) {
  Sentry.captureException(err, { tags: { handler: context } });
  // Up to 2s to push the event before the isolate is torn down.
  await Sentry.flush(2000);
}

export { Sentry };
