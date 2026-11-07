import puppeteer from "puppeteer-core";
import { pathToFileURL, fileURLToPath } from "node:url";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const BRAVE = "/Applications/Brave Browser.app/Contents/MacOS/Brave Browser";
const ROOT = path.dirname(fileURLToPath(import.meta.url));
const FPS = 30, DUR = 58;
const [mode, ...rest] = process.argv.slice(2);

const browser = await puppeteer.launch({ executablePath: BRAVE, headless: true, args: ["--no-sandbox", "--hide-scrollbars", "--force-device-scale-factor=1", "--font-render-hinting=none", "--disable-gpu-vsync"] });

async function open() {
  const page = await browser.newPage();
  await page.setViewport({ width: 1920, height: 1080, deviceScaleFactor: 1 });
  page.on("pageerror", (e) => console.error("PAGEERROR", e.message));
  page.on("console", (m) => { if (m.type() === "error") console.error("CONSOLE", m.text()); });
  await page.goto(pathToFileURL(path.join(ROOT, "index.html")).href);
  await page.evaluate(() => window.READY);
  return page;
}

if (mode === "stills") {
  const dir = path.join(ROOT, "stills"); mkdirSync(dir, { recursive: true });
  const page = await open();
  for (const t of rest.map(Number)) {
    await page.evaluate((t) => window.seek(t), t);
    await page.screenshot({ path: path.join(dir, `t${String(t).replace(".", "_")}.png`), type: "png" });
    console.log("still", t);
  }
} else if (mode === "full") {
  const W = Number(rest[0] || 4);
  const dir = path.join(ROOT, "frames"); mkdirSync(dir, { recursive: true });
  const total = Math.round(DUR * FPS);
  const pages = await Promise.all(Array.from({ length: W }, open));
  let next = 0, done = 0;
  await Promise.all(pages.map(async (page) => {
    for (;;) {
      const i = next++; if (i >= total) break;
      await page.evaluate((t) => window.seek(t), i / FPS);
      await page.screenshot({ path: path.join(dir, `f${String(i).padStart(5, "0")}.jpg`), type: "jpeg", quality: 94 });
      if (++done % 100 === 0) console.log(`frames ${done}/${total}`);
    }
  }));
  writeFileSync(path.join(dir, "DONE"), String(total));
}
await browser.close();
