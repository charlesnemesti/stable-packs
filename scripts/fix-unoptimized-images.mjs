import fs from "node:fs";
import path from "node:path";

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|html|css)$/.test(f)) out.push(full);
  }
  return out;
}

let touched = 0;
for (const file of walk("site")) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;

  t = t.split("unoptimized:!1").join("unoptimized:!0");
  t = t.split("unoptimized:false").join("unoptimized:true");

  // Rewrite any baked /_next/image?... URLs back to the original asset path
  t = t.replace(/\/_next\/image\?url=([^&"' )]+)&[^"' )]+/g, (_, enc) => {
    try {
      return decodeURIComponent(enc);
    } catch {
      return enc;
    }
  });

  if (t !== before) {
    fs.writeFileSync(file, t);
    touched++;
    console.log("patched", path.relative(process.cwd(), file));
  }
}

// Patch default image loader to return src as-is (static hosting has no image optimizer)
const dir = "site/_next/static/chunks";
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const full = path.join(dir, f);
  let t = fs.readFileSync(full, "utf8");
  const before = t;

  // Common Next image default loader return
  const patterns = [
    [
      'return`${t.path}?url=${encodeURIComponent(e)}&w=${i}&q=${l}${e.startsWith("/")&&a?`&dpl=${a}`:""}`',
      "return e",
    ],
    [
      "return`${t.path}?url=${encodeURIComponent(e)}&w=${i}&q=${l}${e.startsWith(\"/\")&&a?`&dpl=${a}`:\"\"}`",
      "return e",
    ],
  ];
  for (const [a, b] of patterns) t = t.split(a).join(b);

  // Also catch slightly different minified forms via regex
  t = t.replace(
    /return`\$\{[^}]*path\}[^`]*url=\$\{encodeURIComponent\([^)]+\)\}[^`]*`/g,
    "return e"
  );

  if (t !== before) {
    fs.writeFileSync(full, t);
    console.log("loader", f);
  }
}

console.log("touched", touched);

const imgChunk = fs.readFileSync("site/_next/static/chunks/3j_m42_ggkx3d.js", "utf8");
console.log("unoptimized:!0", (imgChunk.match(/unoptimized:!0/g) || []).length);
console.log("unoptimized:!1", (imgChunk.match(/unoptimized:!1/g) || []).length);
console.log("still builds next/image?", imgChunk.includes("/_next/image?url="));
console.log("loader return e?", /return e\}/.test(imgChunk) || imgChunk.includes("return e"));
