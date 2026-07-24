import https from "node:https";
import { chromium } from "playwright";

function get(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        const chunks = [];
        res.on("data", (c) => chunks.push(c));
        res.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
      })
      .on("error", reject);
  });
}

const js = await get("https://stable-packs.vercel.app/_next/static/chunks/3d7gaukqntbmv.js");
console.log("len", js.length);
console.log("future-tech find", js.includes('find(e=>"future-tech"===e.id)'));
console.log("ai-pack find", js.includes('find(e=>"ai-pack"===e.id)'));
console.log("Treasury Desk required throw still present as string", js.includes("Treasury Desk is required"));

const browser = await chromium.launch();
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(m.text());
});
await page.goto("https://stable-packs.vercel.app/", { waitUntil: "domcontentloaded", timeout: 60000 });
await page.waitForTimeout(4000);
const title = await page.title();
const bodyText = await page.locator("body").innerText().catch(() => "");
console.log("title", title);
console.log("body snippet", bodyText.slice(0, 200).replace(/\n/g, " | "));
console.log("page errors", errors.slice(0, 15));
await browser.close();
