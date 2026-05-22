import { chromium } from "playwright";

export const runtime = "nodejs";

const VIEWPORT_WIDTH = 1200;
const VIEWPORT_HEIGHT = 800;
const DEVICE_SCALE_FACTOR = 3;

export async function GET(request: Request) {
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  try {
    const context = await browser.newContext({
      viewport: { width: VIEWPORT_WIDTH, height: VIEWPORT_HEIGHT },
      deviceScaleFactor: DEVICE_SCALE_FACTOR,
    });
    const page = await context.newPage();
    await page.emulateMedia({ colorScheme: "dark" });
    const sourceUrl = new URL("/", request.url).toString();

    await page.goto(sourceUrl, { waitUntil: "networkidle" });
    await page.addStyleTag({
      content:
        "html, body { margin: 0 !important; background: transparent !important; }",
    });
    await page.waitForFunction(() => document.fonts.status === "loaded");
    const element = await page.waitForSelector(
      '#stats-card[data-stats-ready="true"]',
      {
        state: "visible",
        timeout: 30000,
      },
    );
    const box = await element.boundingBox();
    if (!box) {
      throw new Error("stats-card bounds not found");
    }

    const clip = {
      x: Math.max(0, box.x),
      y: Math.max(0, box.y),
      width: Math.min(box.width, VIEWPORT_WIDTH - box.x),
      height: Math.min(box.height, VIEWPORT_HEIGHT - box.y),
    };

    const png = await page.screenshot({
      type: "png",
      omitBackground: true,
      scale: "device",
      clip,
    });
    const width = Math.ceil(box.width);
    const height = Math.ceil(box.height);
    const base64 = png.toString("base64");
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}"><image href="data:image/png;base64,${base64}" width="${width}" height="${height}"/></svg>`;

    await context.close();

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
