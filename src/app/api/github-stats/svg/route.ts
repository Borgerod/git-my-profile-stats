import { chromium } from "playwright";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const browser = await chromium.launch({ headless: true });

  try {
    const page = await browser.newPage({
      viewport: { width: 1200, height: 800 },
    });
    await page.emulateMedia({ colorScheme: "dark" });
    const sourceUrl = new URL("/", request.url).toString();

    await page.goto(sourceUrl, { waitUntil: "networkidle" });
    const element = await page.waitForSelector("#stats-card", {
      state: "visible",
      timeout: 30000,
    });
    const box = await element.boundingBox();
    if (!box) {
      throw new Error("stats-card bounds not found");
    }

    const png = await element.screenshot({ type: "png", omitBackground: true });
    const width = Math.ceil(box.width);
    const height = Math.ceil(box.height);
    const base64 = png.toString("base64");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="data:image/png;base64,${base64}" width="${width}" height="${height}"/></svg>`;

    return new Response(svg, {
      headers: {
        "Content-Type": "image/svg+xml",
        "Cache-Control": "public, max-age=3600, stale-while-revalidate=86400",
      },
    });
  } finally {
    await browser.close();
  }
}
