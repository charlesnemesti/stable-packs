import fs from "fs";
import path from "path";

const WORDMARK =
  '<span class="brand-wordmark" aria-hidden="true">stablepacks<i></i></span>';

const IMG_RE =
  /<img[^>]*class="brand-logo"[^>]*\/?>(\s*)<span>STABLE PACKS<\/span>/g;

const IMG_RE2 =
  /<img[^>]*class="brand-logo"[^>]*>\s*<span>STABLE PACKS<\/span>/g;

function patchHtml(file) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  s = s.replace(IMG_RE, WORDMARK);
  s = s.replace(IMG_RE2, WORDMARK);

  // Any leftover STABLE PACKS next to brand
  s = s.replace(
    /(<a class="brand"[^>]*>)\s*<img[^>]*>\s*<span>STABLE PACKS<\/span>/g,
    `$1${WORDMARK}`
  );

  // Favicon
  if (!s.includes('/brand/favicon.svg')) {
    s = s.replace(
      /<link rel="icon"[^>]*>/,
      '<link rel="icon" href="/brand/favicon.svg" type="image/svg+xml"/>'
    );
    // if no icon link, inject after charset/viewport block
    if (!s.includes('/brand/favicon.svg')) {
      s = s.replace(
        "<head>",
        '<head><link rel="icon" href="/brand/favicon.svg" type="image/svg+xml"/>'
      );
    }
  }

  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log("html", file);
  } else {
    console.log("no change", file);
  }
}

for (const f of ["site/index.html", "site/docs/index.html", "site/jackpot/index.html"]) {
  if (fs.existsSync(f)) patchHtml(f);
}

// Verify
const html = fs.readFileSync("site/index.html", "utf8");
const i = html.indexOf('class="brand"');
console.log(html.slice(i, i + 280));
console.log("old img brand-logo", html.includes('class="brand-logo"'));
console.log("favicon", html.includes("/brand/favicon.svg"));
