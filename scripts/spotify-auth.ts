// One-time: obtain a Spotify refresh token for the /api/spotify endpoint.
//
// Prerequisites:
// 1. https://developer.spotify.com/dashboard → create an app, note Client ID
//    and Client Secret.
// 2. In the app's settings, add redirect URI:  http://127.0.0.1:8888/callback
//
// Usage:
//   SPOTIFY_CLIENT_ID=... SPOTIFY_CLIENT_SECRET=... npm run spotify:auth
//
// The script opens a browser, captures the auth code on a local callback,
// exchanges it for a refresh token, and prints it. Paste the printed
// refresh token into Vercel as the SPOTIFY_REFRESH_TOKEN env var (plus the
// same client ID/secret).

import { createServer } from "node:http";
import { URL } from "node:url";
import { exec } from "node:child_process";

const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = "http://127.0.0.1:8888/callback";
const SCOPE = "user-read-currently-playing user-read-recently-played";
const PORT = 8888;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing SPOTIFY_CLIENT_ID / SPOTIFY_CLIENT_SECRET env vars. Export them and retry.",
  );
  process.exit(1);
}

const authUrl = new URL("https://accounts.spotify.com/authorize");
authUrl.searchParams.set("response_type", "code");
authUrl.searchParams.set("client_id", CLIENT_ID);
authUrl.searchParams.set("scope", SCOPE);
authUrl.searchParams.set("redirect_uri", REDIRECT_URI);

console.log(`\nOpen this URL to authorize (also attempting to open automatically):\n\n  ${authUrl.toString()}\n`);

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

  const reqUrl = new URL(req.url, `http://127.0.0.1:${PORT}`);
  const code = reqUrl.searchParams.get("code");
  const error = reqUrl.searchParams.get("error");

  if (error || !code) {
    res.writeHead(400, { "Content-Type": "text/plain" }).end(
      `Spotify returned an error: ${error ?? "no code"}`,
    );
    console.error("Auth failed:", error);
    server.close();
    process.exit(1);
  }

  try {
    const basic = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const tokenRes = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${basic}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: REDIRECT_URI,
      }),
    });

    if (!tokenRes.ok) {
      const text = await tokenRes.text();
      throw new Error(`Token exchange failed (${tokenRes.status}): ${text}`);
    }

    const json = (await tokenRes.json()) as { refresh_token: string };

    res.writeHead(200, { "Content-Type": "text/html" }).end(
      "<h1>Done.</h1><p>You can close this tab. Refresh token printed in terminal.</p>",
    );

    console.log("\n\n✅ Refresh token (save as SPOTIFY_REFRESH_TOKEN in Vercel):\n");
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

server.listen(PORT, "127.0.0.1", () => {
  console.log(`Listening on http://127.0.0.1:${PORT}/callback ...\n`);
});
