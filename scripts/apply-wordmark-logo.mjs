import fs from "fs";
import path from "path";

const root = path.resolve("site");

// Square tile for wallet modal / OG-ish uses
const svgTile = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="none">
  <rect width="512" height="512" fill="#000000"/>
  <text x="48" y="278" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="56" font-weight="500" letter-spacing="-1.5">stablepacks</text>
  <rect x="400" y="252" width="16" height="16" fill="#2EE6C5"/>
</svg>
`;

const favicon = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">
  <rect width="32" height="32" rx="6" fill="#000"/>
  <rect x="11" y="11" width="10" height="10" fill="#2EE6C5"/>
</svg>
`;

// Transparent wordmark SVG (fallback img)
const wordmarkSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 248 40" fill="none">
  <text x="0" y="28" fill="#FFFFFF" font-family="ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif" font-size="26" font-weight="500" letter-spacing="-0.8">stablepacks</text>
  <rect x="232" y="22" width="8" height="8" fill="#2EE6C5"/>
</svg>
`;

fs.mkdirSync(path.join(root, "brand"), { recursive: true });
fs.writeFileSync(path.join(root, "brand", "stablepacks-tile.svg"), svgTile);
fs.writeFileSync(path.join(root, "brand", "favicon.svg"), favicon);
fs.writeFileSync(path.join(root, "brand", "stablepacks-wordmark.svg"), wordmarkSvg);

// Copy selected raster for reference / privy fallback
const srcPng = path.resolve(
  "../.cursor/projects/c-Users-ritix-PROYECTOS-NUEVOS-PFOLIO-SOBRES/assets/logo-08-wordmark-dot.png"
);
const altPng = path.resolve(
  process.env.USERPROFILE || "",
  ".cursor/projects/c-Users-ritix-PROYECTOS-NUEVOS-PFOLIO-SOBRES/assets/logo-08-wordmark-dot.png"
);
for (const p of [srcPng, altPng]) {
  if (fs.existsSync(p)) {
    fs.copyFileSync(p, path.join(root, "brand", "stablepacks-wordmark.png"));
    console.log("copied png from", p);
    break;
  }
}

const NAV_OLD =
  '(0,e.jsx)(i.default,{className:"brand-logo",src:"/packfoliotransparent.png",alt:"",width:46,height:46,priority:!0,"aria-hidden":"true"}),(0,e.jsx)("span",{children:"STABLE PACKS"})';

const NAV_NEW =
  '(0,e.jsxs)("span",{className:"brand-wordmark","aria-hidden":"true",children:["stablepacks",(0,e.jsx)("i",{})]})';

const FOOTER_OLD =
  '(0,l.jsx)(d.default,{className:"brand-logo",src:"/packfoliotransparent.png",alt:"",width:46,height:46,"aria-hidden":"true"}),(0,l.jsx)("span",{children:"STABLE PACKS"})';

const FOOTER_NEW =
  '(0,l.jsxs)("span",{className:"brand-wordmark","aria-hidden":"true",children:["stablepacks",(0,l.jsx)("i",{})]})';

// Generic fallbacks for other chunks
const GENERIC_IMG = 'src:"/packfoliotransparent.png"';
const GENERIC_IMG_NEW = 'src:"/brand/stablepacks-wordmark.svg"';

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (/\.(js|html)$/.test(name)) out.push(p);
  }
  return out;
}

let count = 0;
for (const file of walk(root)) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  if (s.includes(NAV_OLD)) {
    s = s.replaceAll(NAV_OLD, NAV_NEW);
    console.log("nav brand", path.relative(process.cwd(), file));
  }
  if (s.includes(FOOTER_OLD)) {
    s = s.replaceAll(FOOTER_OLD, FOOTER_NEW);
    console.log("footer brand", path.relative(process.cwd(), file));
  }

  // Remaining image refs (preload, privy, etc.)
  if (s.includes("/packfoliotransparent.png")) {
    // Privy square logo
    s = s.replaceAll(
      'logo:"/packfoliotransparent.png"',
      'logo:"/brand/stablepacks-tile.svg"'
    );
    s = s.replaceAll("/packfoliotransparent.png", "/brand/stablepacks-wordmark.svg");
    console.log("asset refs", path.relative(process.cwd(), file));
  }

  // Empty leftover STABLE PACKS spans if any remain next to brand-wordmark
  s = s.replaceAll(
    'jsx)("span",{children:"STABLE PACKS"})',
    'jsx)("span",{className:"visually-hidden",children:"Stable Packs"})'
  );

  if (s !== before) {
    fs.writeFileSync(file, s);
    count++;
  }
}

console.log("patched files:", count);
