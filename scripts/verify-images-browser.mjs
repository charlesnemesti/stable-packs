import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage();

// Test against local first
const url = process.argv[2] || "http://127.0.0.1:4180/";
await page.goto(url, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(5000);

const imgs = await page.evaluate(() => {
  return [...document.querySelectorAll("img")].map((img) => ({
    src: img.currentSrc || img.src,
    naturalWidth: img.naturalWidth,
    complete: img.complete,
    alt: img.alt,
    className: img.className,
  }));
});

const broken = imgs.filter((i) => !i.src || i.naturalWidth === 0 || i.src.includes("/_next/image"));
const ok = imgs.filter((i) => i.naturalWidth > 0);
console.log("url", url);
console.log("imgs", imgs.length, "ok", ok.length, "broken", broken.length);
for (const b of broken.slice(0, 20)) {
  console.log("BROKEN", b.naturalWidth, b.className, b.src.slice(0, 120));
}
for (const o of ok.slice(0, 8)) {
  console.log("OK", o.naturalWidth, o.className, o.src.slice(0, 100));
}
await browser.close();
