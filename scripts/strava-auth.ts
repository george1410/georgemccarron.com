// One-time: obtain a Strava refresh token for the /api/strava endpoint.
//
// Prerequisites:
// 1. https://www.strava.com/settings/api → create an app. Note Client ID and
//    Client Secret.
// 2. In the app's settings, set "Authorization Callback Domain" to `localhost`.
//
// Usage:
//   STRAVA_CLIENT_ID=... STRAVA_CLIENT_SECRET=... npm run strava:auth
//
// The script opens a browser, captures the auth code on a local callback,
// exchanges it for a refresh token, and prints it. Paste the printed token
// into .env.local / Vercel as STRAVA_REFRESH_TOKEN.

import { createServer } from "node:http";
import { URL } from "node:url";
import { exec } from "node:child_process";

const CLIENT_ID = process.env.STRAVA_CLIENT_ID;
const CLIENT_SECRET = process.env.STRAVA_CLIENT_SECRET;
const REDIRECT_URI = "http://localhost:8889/callback";
// activity:read_all = public + private activities. Use activity:read for
// public only.
const SCOPE = "activity:read_all";
const PORT = 8889;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing STRAVA_CLIENT_ID / STRAVA_CLIENT_SECRET env vars. Export them and retry.",
  );
  process.exit(1);
}

const authUrl = new URL("https://www.strava.com/oauth/authorize");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);
authUrl.searchParams.set("approval_prompt", "force");
authUrl.searchParams.set("scope", SCOPE);

console.log(
  `\nOpen this URL to authorize (also attempting to open automatically):\n\n  ${authUrl.toString()}\n`,
);

const opener =
  process.platform === "darwin"
    ? "open"
    : process.platform === "win32"
      ? "start"
      : "xdg-open";
exec(`${opener} "${authUrl.toString()}"`);

const server = createServer(async (req, res) => {
  if (!req.url?.startsWith("/callback")) {
    res.writeHead(404).end();
    return;
  }

  const reqUrl = new URL(req.url, `http://localhost:${PORT}`);
  const code = reqUrl.searchParams.get("code");
  const error = reqUrl.searchParams.get("error");

  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/plain" }).end(
      `Strava returned an error: ${error ?? "no code"}`,
    );
    console.error("Auth failed:", error);
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch("https://www.strava.com/api/v3/oauth/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: CLIENT_ID!,
        client_secret: CLIENT_SECRET!,
        code,
        grant_type: "authorization_code",
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`);
    }

    const json = (await tokenRes.json()) as {
      refresh_token: string;
      athlete?: { id: number; firstname: string; lastname: string };
    };

    res.writeHead(200, { "Content-Type": "text/html" }).end(
      "<h1>Done.</h1><p>You can close this tab. Refresh token printed in terminal.</p>",
    );

    console.log(
      `\n\nAuthorised as ${json.athlete?.firstname ?? "?"} ${json.athlete?.lastname ?? ""} (id ${json.athlete?.id ?? "?"}).`,
    );
    console.log("\n✅ Refresh token (save as STRAVA_REFRESH_TOKEN in .env.local / Vercel):\n");
    console.log(json.refresh_token);
    console.log("\n");
    server.close();
    process.exit(0);
  } catch (e) {
    res.writeHead(500, { "Content-Type": "text/plain" }).end(String(e));
    console.error(e);
    server.close();
    process.exit(1);
  }
});

server.listen(PORT, "localhost", () => {
  console.log(`Listening on http://localhost:${PORT}/callback ...\n`);
});
