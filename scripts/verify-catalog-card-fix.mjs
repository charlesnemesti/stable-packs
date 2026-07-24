import fs from "fs";

const js = fs.readFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", "utf8");
const html = fs.readFileSync("site/index.html", "utf8");

console.log("company-mark-stack", js.includes("company-mark-stack"));
console.log("companies.slice(0,4)", js.includes("companies.slice(0,4)"));
console.log('stocks"," inside', js.includes('"stocks"," inside"'));
console.log("SPACKS msg js", js.includes("Available shortly after the $SPACKS launch."));
console.log("Verifying js", js.includes("Verifying onchain availability."));
console.log("SPACKS msg html", html.includes("Available shortly after the $SPACKS launch."));
console.log("Verifying html", html.includes("Verifying onchain availability."));
console.log("stocks inside html", html.includes("stocks") && html.includes("inside"));

const i = html.indexOf("catalog-facts");
console.log("catalog-facts:", html.slice(i, i + 280));

// Also update Checking availability label to match
let j = js;
const before = j;
j = j.replaceAll(
  'label:"Checking availability"',
  'label:"Coming Soon"'
);
if (j !== before) {
  fs.writeFileSync("site/_next/static/chunks/3d7gaukqntbmv.js", j);
  console.log("updated checking label to Coming Soon");
}

let h = html;
h = h.replaceAll("Checking availability", "Coming Soon");
if (h !== html) {
  fs.writeFileSync("site/index.html", h);
  console.log("updated html checking label");
}
