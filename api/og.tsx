import { ImageResponse } from "@vercel/og";

export const config = {
  runtime: "edge",
};

async function loadGoogleFont(family: string, text: string) {
  const url = `https://fonts.googleapis.com/css2?family=${family}&text=${encodeURIComponent(text)}`;
  const css = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const match = css.match(/src: url\((https:\/\/[^)]+)\) format\('(?:opentype|truetype|woff2)'\)/);
  if (!match) throw new Error(`Could not load font: ${family}`);
  const res = await fetch(match[1]!);
  return res.arrayBuffer();
}

export default async function handler(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = (searchParams.get("title") ?? "George McCarron").slice(0, 120);
  const subtitle = (searchParams.get("subtitle") ?? "").slice(0, 200);
  const kind = searchParams.get("kind") ?? "site";

  const kindLabel = kind === "talk" ? "Talk" : kind === "post" ? "Writing" : null;

  const fontText = `${title}${subtitle}${kindLabel ?? ""}George McCarron/georgemccarron.com`;

  const [playfair, inter] = await Promise.all([
    loadGoogleFont("Playfair+Display:ital,wght@1,700", fontText),
    loadGoogleFont("Inter:wght@500;600", fontText),
  ]);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          backgroundColor: "#faf8f5",
          backgroundImage:
            "radial-gradient(circle at 100% 0%, rgba(249, 115, 22, 0.22) 0%, transparent 55%), radial-gradient(circle at 0% 100%, rgba(139, 92, 246, 0.22) 0%, transparent 55%)",
          fontFamily: "Inter",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "18px", fontSize: 26 }}>
          <div
            style={{
              width: 14,
              height: 14,
              borderRadius: "50%",
              backgroundColor: "#fb923c",
            }}
          />
          <div style={{ fontWeight: 600, color: "#1c1917" }}>George McCarron</div>
          {kindLabel && (
            <>
              <div style={{ color: "#d6d3d1" }}>·</div>
              <div style={{ color: "#78716c" }}>{kindLabel}</div>
            </>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          <div
            style={{
              display: "flex",
              fontFamily: "Playfair Display",
              fontStyle: "italic",
              fontWeight: 700,
              fontSize: title.length > 50 ? 72 : 92,
              lineHeight: 1.02,
              letterSpacing: "-0.02em",
              color: "#1c1917",
            }}
          >
            {title}
            <span style={{ color: "#fb923c" }}>.</span>
          </div>
          {subtitle && (
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 500,
                color: "#78716c",
                lineHeight: 1.35,
                maxWidth: "92%",
              }}
            >
              {subtitle}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontSize: 22,
            color: "#a8a29e",
            fontWeight: 500,
          }}
        >
          <div>georgemccarron.com</div>
          <div style={{ display: "flex", gap: "10px" }}>
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "#fb923c" }} />
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "#f43f5e" }} />
            <div style={{ width: 22, height: 22, borderRadius: 6, background: "#8b5cf6" }} />
          </div>
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [
        { name: "Playfair Display", data: playfair, style: "italic", weight: 700 },
        { name: "Inter", data: inter, style: "normal", weight: 500 },
        { name: "Inter", data: inter, style: "normal", weight: 600 },
      ],
    },
  );
}
