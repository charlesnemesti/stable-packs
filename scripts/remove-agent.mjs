import fs from "node:fs";
import path from "node:path";

const agentEntry =
  '{id:"agent",label:"Agent",href:"/agent"},';
const agentLiHtmlPatterns = [
  // minified nav link for Agent
  /<li><a class="animated-navigation-link"(?:[^>]*)href="\/agent"[^>]*>[\s\S]*?<\/a><\/li>/g,
  /<li><a class="animated-navigation-link is-active"(?:[^>]*)href="\/agent"[^>]*>[\s\S]*?<\/a><\/li>/g,
];

function walk(d, out = []) {
  for (const f of fs.readdirSync(d)) {
    const full = path.join(d, f);
    if (fs.statSync(full).isDirectory()) walk(full, out);
    else if (/\.(js|html)$/.test(f)) out.push(full);
  }
  return out;
}

let n = 0;
for (const file of walk("site")) {
  let t = fs.readFileSync(file, "utf8");
  const before = t;
  t = t.split(agentEntry).join("");
  // also with spaces variants
  t = t.split('{id:"agent",label:"Agent",href:"/agent"}').join("");
  // trailing comma cleanup if ,,{ appears
  t = t.replace(/,\{id:"docs"/g, ',{id:"docs"'); // keep
  // Remove empty object leftovers ,,
  t = t.replace(/,\s*,/g, ",");
  for (const re of agentLiHtmlPatterns) t = t.replace(re, "");
  // mobile nav Agent text links
  t = t.replace(/<a[^>]*href="\/agent"[^>]*>[\s\S]*?Agent[\s\S]*?<\/a>/g, "");
  if (t !== before) {
    fs.writeFileSync(file, t);
    n++;
    console.log("patched", path.relative(process.cwd(), file));
  }
}
console.log("files", n);

// Delete agent page - replace with redirect to home
fs.mkdirSync("site/agent", { recursive: true });
fs.writeFileSync(
  "site/agent/index.html",
  `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"/><meta http-equiv="refresh" content="0;url=/"/><link rel="canonical" href="/"/><title>Redirecting…</title><script>location.replace("/")</script></head><body></body></html>`
);
console.log("agent -> redirect home");

// Verify remaining Agent nav
for (const file of walk("site")) {
  const t = fs.readFileSync(file, "utf8");
  if (t.includes('label:"Agent"') || t.includes('href:"/agent"') || /href="\/agent"/.test(t)) {
    if (file.includes(`${path.sep}agent${path.sep}`)) continue;
    console.log("still", file);
  }
}
