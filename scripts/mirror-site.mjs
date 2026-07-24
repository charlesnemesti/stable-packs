import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ORIGIN = "https://packfolio.org";
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "site");

const SEED_PATHS = ["/", "/docs", "/agent", "/jackpot"];
const MAX_PAGES = 80;
const CONCURRENCY = 10;

const visitedPages = new Set();
const visitedAssets = new Set();
const queue = [...SEED_PATHS];
const assetQueue = [];
const errors = [];

function decodeHtmlEntities(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function toAbsoluteUrl(raw, baseHref) {
  try {
    let cleaned = decodeHtmlEntities(String(raw).trim());
    if (!cleaned || cleaned.startsWith("#") || cleaned.startsWith("mailto:") || cleaned.startsWith("tel:")) {
      return null;
    }
    if (cleaned.startsWith("data:") || cleaned.startsWith("blob:") || cleaned.startsWith("javascript:")) {
      return null;
    }
    // Reject JS false positives / template fragments
    if (/[,{}`$]|location\.|window\.|\.href|\.url|\.src|addBasePath/.test(cleaned) && !cleaned.startsWith("http") && !cleaned.startsWith("/")) {
      return null;
    }
    if (cleaned.includes(",") && cleaned.includes("/_next/image")) {
      // srcset blob — handled elsewhere
      return null;
    }

    const url = new URL(cleaned, baseHref);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    if (url.hostname !== "packfolio.org" && url.hostname !== "www.packfolio.org") return null;
    url.hash = "";
    // Drop cache-buster deployment id; keep meaningful image params only when needed
    if (url.searchParams.has("dpl")) url.searchParams.delete("dpl");
    if (url.searchParams.has("v") && !url.pathname.includes("/_next/image")) url.searchParams.delete("v");
    return url;
  } catch {
    return null;
  }
}

function expandSrcSet(value, baseHref) {
  const urls = [];
  for (const part of value.split(",")) {
    const token = part.trim().split(/\s+/)[0];
    const abs = toAbsoluteUrl(token, baseHref);
    if (abs) urls.push(abs);
  }
  return urls;
}

function localPathForUrl(url) {
  // Prefer original image behind Next optimizer
  if (url.pathname === "/_next/image") {
    const inner = url.searchParams.get("url");
    if (inner) {
      const original = toAbsoluteUrl(inner, ORIGIN);
      if (original) return localPathForUrl(original);
    }
  }

  let pathname = decodeURIComponent(url.pathname);
  if (pathname.endsWith("/")) pathname += "index.html";
  if (!path.extname(pathname) && !pathname.includes(".")) {
    pathname = pathname.replace(/\/?$/, "/index.html");
  }
  return path.join(OUT, pathname.replace(/^\//, ""));
}

function publicPathForUrl(url) {
  const local = localPathForUrl(url);
  return "/" + path.relative(OUT, local).split(path.sep).join("/");
}

async function ensureDir(filePath) {
  await fs.mkdir(path.dirname(filePath), { recursive: true });
}

async function fetchBuffer(url) {
  const res = await fetch(url.href, {
    headers: {
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36",
      accept: "*/*",
    },
    redirect: "follow",
  });
  if (!res.ok) throw new Error(`HTTP ${res.status} for ${url.href}`);
  const contentType = res.headers.get("content-type") || "";
  const buf = Buffer.from(await res.arrayBuffer());
  return { buf, contentType, finalUrl: new URL(res.url) };
}

function extractUrlsFromHtml(text, baseHref) {
  const found = new Set();

  for (const match of text.matchAll(/\b(?:href|src|poster|data-src)=["']([^"']+)["']/gi)) {
    const abs = toAbsoluteUrl(match[1], baseHref);
    if (abs) found.add(abs.href);
  }

  for (const match of text.matchAll(/\bsrcset=["']([^"']+)["']/gi)) {
    for (const u of expandSrcSet(match[1], baseHref)) found.add(u.href);
  }

  // Explicit asset path strings in RSC payload
  for (const match of text.matchAll(/["'](\/(?:_next\/static|packfolio|brand|video)\/[^"']+)["']/gi)) {
    const abs = toAbsoluteUrl(match[1], baseHref);
    if (abs) found.add(abs.href);
  }

  for (const match of text.matchAll(/["'](\/(?:docs|agent|jackpot)(?:\/[^"'?#]*)?)["']/gi)) {
    const abs = toAbsoluteUrl(match[1], baseHref);
    if (abs) found.add(abs.href);
  }

  return [...found].map((href) => new URL(href));
}

function extractUrlsFromCss(text, baseHref) {
  const found = new Set();
  for (const match of text.matchAll(/url\((["']?)([^"')]+)\1\)/gi)) {
    const abs = toAbsoluteUrl(match[2], baseHref);
    if (abs) found.add(abs.href);
  }
  return [...found].map((href) => new URL(href));
}

function isHtmlContentType(contentType) {
  return contentType.includes("text/html");
}

function isLikelyPage(url) {
  if (url.pathname.startsWith("/_next/")) return false;
  const ext = path.extname(url.pathname).toLowerCase();
  return !ext || ext === ".html" || ext === ".htm";
}

function rewriteHtmlForLocal(html, pageUrl) {
  let out = html;
  out = out.replaceAll("https://www.packfolio.org", "");
  out = out.replaceAll("https://packfolio.org", "");

  // Rewrite srcset entries to local original assets
  out = out.replace(/\bsrcset=(["'])([^"']+)\1/gi, (_, quote, value) => {
    const rewritten = value
      .split(",")
      .map((part) => {
        const bits = part.trim().split(/\s+/);
        const abs = toAbsoluteUrl(bits[0], pageUrl.href);
        if (!abs) return part.trim();
        const local = publicPathForUrl(abs);
        return [local, ...bits.slice(1)].join(" ");
      })
      .join(", ");
    return `srcset=${quote}${rewritten}${quote}`;
  });

  // Rewrite href/src/poster with query strings or next/image
  out = out.replace(/\b(href|src|poster|data-src)=(["'])([^"']+)\2/gi, (full, attr, quote, raw) => {
    const abs = toAbsoluteUrl(raw, pageUrl.href);
    if (!abs) return full;
    if (!raw.includes("?") && !raw.includes("/_next/image") && !raw.startsWith("http")) return full;
    return `${attr}=${quote}${publicPathForUrl(abs)}${quote}`;
  });

  // Clean remaining ?dpl= and ?v= on local paths inside strings
  out = out.replace(/(\/(?:_next|packfolio|brand|video|packfolio[^"'\\\s]*)[^"'\\\s]*)\?(?:dpl|v)=[^"'\\\s&]*/gi, "$1");
  out = out.replace(/(\/(?:_next|packfolio|brand|video)[^"'\\\s]*)\?[^"'\\\s]*/gi, (m, p1) => {
    if (m.includes("/_next/image")) {
      try {
        const u = new URL(m, ORIGIN);
        return publicPathForUrl(u);
      } catch {
        return p1;
      }
    }
    return p1;
  });

  return out;
}

function rewriteCssForLocal(css, cssUrl) {
  return css.replace(/url\((["']?)([^"')]+)\1\)/gi, (full, quote, raw) => {
    const abs = toAbsoluteUrl(raw, cssUrl.href);
    if (!abs) return full;
    if (!raw.includes("?") && !raw.startsWith("http") && !raw.includes("/_next/image")) return full;
    const local = publicPathForUrl(abs);
    // Make relative to css file when possible
    const cssDir = path.posix.dirname("/" + path.relative(OUT, localPathForUrl(cssUrl)).split(path.sep).join("/"));
    let rel = path.posix.relative(cssDir, local);
    if (!rel.startsWith(".")) rel = "./" + rel;
    return `url(${quote}${rel}${quote})`;
  });
}

async function saveAsset(url) {
  // Normalize to original image if optimizer
  let fetchUrl = url;
  let saveAs = url;
  if (url.pathname === "/_next/image") {
    const inner = url.searchParams.get("url");
    if (inner) {
      const original = toAbsoluteUrl(inner, ORIGIN);
      if (original) {
        saveAs = original;
        fetchUrl = original; // prefer original assets for editing
      }
    }
  } else {
    // strip dpl for fetch — originals usually work without it
    fetchUrl = new URL(url.href);
    fetchUrl.searchParams.delete("dpl");
    fetchUrl.searchParams.delete("v");
    saveAs = fetchUrl;
  }

  const key = saveAs.pathname;
  if (visitedAssets.has(key)) return;
  visitedAssets.add(key);

  try {
    let buf;
    let contentType;
    let finalUrl;
    try {
      ({ buf, contentType, finalUrl } = await fetchBuffer(fetchUrl));
    } catch {
      // fallback to original URL with query if stripped failed
      ({ buf, contentType, finalUrl } = await fetchBuffer(url));
    }

    const target = localPathForUrl(saveAs);
    await ensureDir(target);

    if (contentType.includes("css") || target.endsWith(".css")) {
      const text = buf.toString("utf8");
      const rewritten = rewriteCssForLocal(text, finalUrl);
      await fs.writeFile(target, rewritten, "utf8");
      for (const found of extractUrlsFromCss(text, finalUrl.href)) {
        if (!visitedAssets.has(found.pathname === "/_next/image" ? found.searchParams.get("url") || found.href : found.pathname)) {
          assetQueue.push(found);
        }
      }
    } else {
      await fs.writeFile(target, buf);
      if (
        contentType.includes("javascript") ||
        contentType.includes("json") ||
        /\.(js|mjs|json|svg|xml|txt|map)$/i.test(target)
      ) {
        // Do not crawl arbitrary JS string false-positives aggressively
      }
    }

    process.stdout.write(`A ${path.relative(OUT, target)}\n`);
  } catch (err) {
    errors.push(`ASSET ${url.href}: ${err.message}`);
  }
}

async function savePage(pathnameWithOptionalSearch) {
  const pageUrl = new URL(pathnameWithOptionalSearch, ORIGIN);
  const pageKey = pageUrl.pathname;
  if (visitedPages.has(pageKey)) return;
  if (visitedPages.size >= MAX_PAGES) return;
  visitedPages.add(pageKey);

  try {
    const { buf, contentType, finalUrl } = await fetchBuffer(pageUrl);
    if (!isHtmlContentType(contentType)) {
      await saveAsset(finalUrl);
      return;
    }

    const html = buf.toString("utf8");
    const found = extractUrlsFromHtml(html, finalUrl.href);

    for (const u of found) {
      if (isLikelyPage(u)) {
        if (!visitedPages.has(u.pathname) && visitedPages.size + queue.length < MAX_PAGES) {
          queue.push(u.pathname);
        }
      } else {
        assetQueue.push(u);
      }
    }

    const rewritten = rewriteHtmlForLocal(html, finalUrl);
    const target = path.join(
      OUT,
      finalUrl.pathname === "/" ? "index.html" : path.join(finalUrl.pathname.replace(/^\//, ""), "index.html"),
    );
    await ensureDir(target);
    await fs.writeFile(target, rewritten, "utf8");
    process.stdout.write(`P ${finalUrl.pathname}\n`);
  } catch (err) {
    errors.push(`PAGE ${pageUrl.href}: ${err.message}`);
  }
}

async function runPool(items, worker, concurrency) {
  let idx = 0;
  await Promise.all(
    Array.from({ length: concurrency }, async () => {
      while (true) {
        const current = idx++;
        if (current >= items.length) break;
        await worker(items[current]);
      }
    }),
  );
}

async function main() {
  await fs.rm(OUT, { recursive: true, force: true });
  await fs.mkdir(OUT, { recursive: true });

  while (queue.length) {
    const batch = queue.splice(0, queue.length);
    await runPool(batch, savePage, CONCURRENCY);
  }

  while (assetQueue.length) {
    const unique = [];
    const seen = new Set();
    while (assetQueue.length) {
      const u = assetQueue.shift();
      if (!u) continue;
      const key = u.pathname === "/_next/image" ? u.searchParams.get("url") || u.href : u.pathname + u.search;
      if (seen.has(key) || visitedAssets.has(u.pathname === "/_next/image" ? u.searchParams.get("url") || u.pathname : u.pathname)) {
        continue;
      }
      seen.add(key);
      unique.push(u);
    }
    await runPool(unique, saveAsset, CONCURRENCY);
  }

  // Also download common static roots discovered from homepage without query
  const extras = [
    "/packfoliotransparent.png",
    "/packfoliofavicon.svg",
    "/video/packfoliomain.mp4",
    "/video/packfoliopacks2.mp4",
  ];
  for (const p of extras) {
    await saveAsset(new URL(p, ORIGIN));
  }

  const manifest = {
    mirroredAt: new Date().toISOString(),
    origin: ORIGIN,
    pages: [...visitedPages].sort(),
    assets: visitedAssets.size,
    errors,
  };
  await fs.writeFile(path.join(OUT, "mirror-manifest.json"), JSON.stringify(manifest, null, 2));

  console.log("\nDone.");
  console.log(`Pages: ${visitedPages.size}`);
  console.log(`Assets: ${visitedAssets.size}`);
  console.log(`Errors: ${errors.length}`);
  if (errors.length) console.log(errors.slice(0, 20).join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
