import fs from "node:fs";
import path from "node:path";

// 1) Remove agent from nav
await import("./remove-agent.mjs");

// 2) Inject effects into homepage
const home = "site/index.html";
let html = fs.readFileSync(home, "utf8");
if (!html.includes("/effects.css")) {
  html = html.replace("</head>", '<link rel="stylesheet" href="/effects.css"/></head>');
}
if (!html.includes("/effects.js")) {
  html = html.replace("</body>", '<script src="/effects.js" defer></script></body>');
}
fs.writeFileSync(home, html);
console.log("injected effects into home");

// 3) vercel rewrite optional - agent already redirects
const vercelPath = "vercel.json";
if (fs.existsSync(vercelPath)) {
  const v = JSON.parse(fs.readFileSync(vercelPath, "utf8"));
  v.redirects = v.redirects || [];
  if (!v.redirects.some((r) => r.source === "/agent")) {
    v.redirects.push({ source: "/agent", destination: "/", permanent: false });
    v.redirects.push({ source: "/agent/", destination: "/", permanent: false });
    fs.writeFileSync(vercelPath, JSON.stringify(v, null, 2) + "\n");
    console.log("vercel redirects for /agent");
  }
}

// Verify agent gone from main nav html
const pages = ["site/index.html", "site/docs/index.html", "site/jackpot/index.html"];
for (const p of pages) {
  const t = fs.readFileSync(p, "utf8");
  console.log(
    path.basename(path.dirname(p)) || "home",
    "Agent link",
    (t.match(/href="\/agent"/g) || []).length,
    "effects",
    t.includes("effects.css")
  );
}
