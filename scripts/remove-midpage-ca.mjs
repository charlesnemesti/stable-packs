import fs from "fs";

let html = fs.readFileSync("site/index.html", "utf8");
const before = html;
html = html.replace(
  /<section class="ca-section"[^>]*>[\s\S]*?<\/section>/g,
  ""
);
if (html === before) {
  // fallback by id
  html = html.replace(
    /<section[^>]*id="contract-address"[^>]*>[\s\S]*?<\/section>/g,
    ""
  );
}
fs.writeFileSync("site/index.html", html);
console.log(
  "removed",
  html !== before,
  "ca-section",
  html.includes("ca-section"),
  "contract-address",
  html.includes('id="contract-address"'),
  "hero ca",
  html.includes("ca-copy-box-hero")
);
