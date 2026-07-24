import fs from "node:fs";

const TBA = "TBA after launch";

// --- Docs JS chunk ---
const jsFile = "site/_next/static/chunks/28kfqxycp5ftz.js";
let js = fs.readFileSync(jsFile, "utf8");

const coreOld =
  'c.STABLE_PACKS_ADDRESS!==c.ZERO_ADDRESS?(0,t.jsxs)("a",{href:u(c.STABLE_PACKS_ADDRESS),target:"_blank",rel:"noreferrer",children:[c.STABLE_PACKS_ADDRESS,(0,t.jsx)(s.ExternalLinkIcon,{"aria-hidden":"true"})]}):(0,t.jsx)("code",{children:"Configured at production deployment"})';
const coreNew = `(0,t.jsx)("code",{children:"${TBA}"})`;

const usdOld =
  '(0,t.jsxs)("a",{href:u(c.USDT_ADDRESS),target:"_blank",rel:"noreferrer",children:[c.USDT_ADDRESS,(0,t.jsx)(s.ExternalLinkIcon,{"aria-hidden":"true"})]})';
const usdNew = `(0,t.jsx)("code",{children:"${TBA}"})`;

if (!js.includes(coreOld)) console.log("WARN: core pattern not found");
else js = js.split(coreOld).join(coreNew);

if (!js.includes(usdOld)) console.log("WARN: usd pattern not found");
else js = js.split(usdOld).join(usdNew);

js = js.split("Configured at production deployment").join(TBA);
fs.writeFileSync(jsFile, js);
console.log("patched", jsFile);

// --- Docs HTML SSR ---
let html = fs.readFileSync("site/docs/index.html", "utf8");
const before = html;

// Replace address links with plain TBA code
html = html.replace(
  /<a href="https:\/\/[^"]*\/address\/0xcEE660F80Da315b1D4e386c38FbFE72DbDb56a16"[^>]*>0xcEE660F80Da315b1D4e386c38FbFE72DbDb56a16[\s\S]*?<\/a>/,
  `<code>${TBA}</code>`
);
html = html.replace(
  /<a href="https:\/\/[^"]*\/address\/0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168"[^>]*>0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168[\s\S]*?<\/a>/,
  `<code>${TBA}</code>`
);

// Fallback: any remaining bare addresses in docs page
html = html.split("0xcEE660F80Da315b1D4e386c38FbFE72DbDb56a16").join(TBA);
html = html.split("0x5fc5360D0400a0Fd4f2af552ADD042D716F1d168").join(TBA);
html = html.split("Configured at production deployment").join(TBA);

if (html !== before) {
  fs.writeFileSync("site/docs/index.html", html);
  console.log("patched docs html");
}

// Verify
const j2 = fs.readFileSync(jsFile, "utf8");
const h2 = fs.readFileSync("site/docs/index.html", "utf8");
console.log("js TBA count", j2.split(TBA).length - 1);
console.log("js still shows core addr", j2.includes("0xcEE660"));
console.log("html TBA", h2.includes(TBA));
console.log("html core addr", h2.includes("0xcEE660"));
console.log("html usdt addr", h2.includes("0x5fc5360"));
