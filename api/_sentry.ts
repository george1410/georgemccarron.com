// Shared Sentry bootstrap for the Vercel edge functions. Each handler
// imports this file at the top — the `Sentry.init` call runs once per
// cold start as a module side effect.
//
// Don't use `captureConsoleIntegration` here. `console.error(label, err)`
// produces issues titled after the raw Error (`Network connection lost.`)
// with culprit `?((vc/edge/function)` and no request/API context. Wrap
// handlers with `wrapApiHandler` and report failures via `captureApiError`
// so events carry the route, tags, and extras we actually need to debug.

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
    // Pulls non-standard fields off thrown Errors (e.g. Cloudflare
    // fetch's `retryable` / `overloaded`) into the event extras.
    Sentry.extraErrorDataIntegration(),
  ],
  beforeSend(event) {
    const api = event.tags?.api;
    const exception = event.exception?.values?.[0];
    if (
      typeof api === "string" &&
      exception?.value &&
      !exception.value.includes(`[api/${api}]`)
    ) {
      // Issue titles are `{type}: {value}`. Prefix so the list shows
      // which function failed instead of a generic runtime message.
      exception.value = `[api/${api}] ${exception.value}`;
    }
    return event;
  },
});

type ApiHandler = (request: Request) => Response | Promise<Response>;

function flush(): void {
  try {
    waitUntil(Sentry.flush(2000));
  } catch {
    // Outside a Vercel request context (module load, local dev) — safe
    // to ignore; flush will still complete eventually.
  }
}

/** Report a handled failure from an API route. Inherits tags/request
 *  context from `wrapApiHandler`. Pass `extra` for upstream URLs, HTTP
 *  status, etc. Also logs to the Vercel function console. */
export function captureApiError(
  err: unknown,
  extra?: Record<string, unknown>,
): void {
  const api = Sentry.getIsolationScope().getScopeData().tags.api;
  console.error(typeof api === "string" ? `[api/${api}]` : "[api]", err);
  Sentry.withScope((scope) => {
    if (extra && Object.keys(extra).length > 0) {
      scope.setExtras(extra);
    }
    Sentry.captureException(err);
  });
  flush();
}

/** Isolate each invocation, name the transaction after the route, and
 *  attach request data so errors aren't filed under
 *  `?((vc/edge/function)`. Unhandled throws are captured and rethrown. */
export function wrapApiHandler(name: string, handler: ApiHandler): ApiHandler {
  return (request) =>
    Sentry.withIsolationScope(async (isolation) => {
      const url = new URL(request.url);
      const transactionName = `${request.method} /api/${name}`;

      isolation.setTag("api", name);
      isolation.setTransactionName(transactionName);
      isolation.setFingerprint(["{{ default }}", name]);
      const headers: Record<string, string> = {};
      request.headers.forEach((value, key) => {
        headers[key] = value;
      });
      isolation.setSDKProcessingMetadata({
        normalizedRequest: {
          url: request.url,
          method: request.method,
          headers,
          query_string: url.search.slice(1) || undefined,
        },
      });
      isolation.setContext("vercel", {
        region: process.env.VERCEL_REGION ?? null,
        deployment: process.env.VERCEL_URL ?? null,
      });
      Sentry.getCurrentScope().setTransactionName(transactionName);

      try {
        const response = await Sentry.startSpan(
          {
            name: transactionName,
            op: "http.server",
            attributes: {
              [Sentry.SEMANTIC_ATTRIBUTE_SENTRY_SOURCE]: "route",
              "http.request.method": request.method,
              "http.route": `/api/${name}`,
            },
          },
          async () => {
            const res = await handler(request);
            const span = Sentry.getActiveSpan();
            if (span) Sentry.setHttpStatus(span, res.status);
            return res;
          },
        );
        return response;
      } catch (err) {
        Sentry.captureException(err);
        throw err;
      } finally {
        flush();
      }
    });
}

export { Sentry };
