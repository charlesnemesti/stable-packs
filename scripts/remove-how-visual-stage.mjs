import fs from "node:fs";
import path from "node:path";

let html = fs.readFileSync("site/index.html", "utf8");
const before = html.length;

// Remove entire how-visual-column / how-visual-stage blocks
html = html.replace(/<div class="how-visual-column"[\s\S]*?<\/div>\s*(?=<div class="how-|$)/g, (m) => {
  // only if it contains how-visual-stage
  if (!m.includes("how-visual-stage")) return m;
  return "";
});

// More precise: remove how-visual-stage wrappers and their content
html = html.replace(/<div class="how-visual-stage"[\s\S]*?<\/div>(?=\s*<\/div>\s*<\/section>|\s*<\/div>\s*<div class="how-)/g, "");

// Broader fallback: strip how-visual-column completely if still present
if (html.includes("how-visual-stage") || html.includes("how-visual-column")) {
  html = html.replace(/<div class="how-visual-column"[\s\S]*?<\/section>/, (m) => {
    // keep closing section by finding last parts carefully
    return m.replace(/<div class="how-visual-column"[\s\S]*$/, "") + "</section>";
  });
}

// Safer approach: remove from how-visual-column open to matching end before section close
function removeDivByClass(source, className) {
  const token = `class="${className}"`;
  let idx = source.indexOf(token);
  while (idx >= 0) {
    // find opening <div before class
    const open = source.lastIndexOf("<div", idx);
    if (open < 0) break;
    let i = open;
    let depth = 0;
    let inStr = false;
    let quote = null;
    let escaped = false;
    for (; i < source.length; i++) {
      const ch = source[i];
      // rough tag scan
      if (!inStr && source.startsWith("<div", i)) {
        depth++;
        i += 3;
        continue;
      }
      if (!inStr && source.startsWith("</div>", i)) {
        depth--;
        if (depth === 0) {
          const end = i + 6;
          source = source.slice(0, open) + source.slice(end);
          break;
        }
        i += 5;
        continue;
      }
      if (!inStr && (ch === '"' || ch === "'")) {
        inStr = true;
        quote = ch;
        continue;
      }
      if (inStr) {
        if (escaped) {
          escaped = false;
          continue;
        }
        if (ch === "\\") {
          escaped = true;
          continue;
        }
        if (ch === quote) inStr = false;
      }
    }
    idx = source.indexOf(token);
  }
  return source;
}

html = fs.readFileSync("site/index.html", "utf8");
html = removeDivByClass(html, "how-visual-stage");
html = removeDivByClass(html, "how-visual-column");
// Also remove mobile odds panel we added earlier if user only pointed at visual stage - keep narrative.
// User specifically asked for how-visual-stage removal.

fs.writeFileSync("site/index.html", html);
console.log("html", before, "->", html.length);
console.log("stage left", html.includes("how-visual-stage"));
console.log("column left", html.includes("how-visual-column"));

// Hide via CSS as belt-and-suspenders against hydration
const cssPath = path.join("site", "_next", "static", "chunks", "2k0a278v4nzoa.css");
let css = fs.readFileSync(cssPath, "utf8");
const hide = `.how-visual-stage,.how-visual-column{display:none!important;height:0!important;overflow:hidden!important;visibility:hidden!important;pointer-events:none!important}`;
if (!css.includes(".how-visual-stage,.how-visual-column{display:none")) {
  css += hide;
  fs.writeFileSync(cssPath, css);
  console.log("css hide added");
}

// Patch JS that renders how visual column/stage to return null
const jsPath = path.join("site", "_next", "static", "chunks", "3d7gaukqntbmv.js");
let js = fs.readFileSync(jsPath, "utf8");
const jsBefore = js;
// Neutralize how-scene-pack component body to empty fragment if present
js = js.replace(
  /function eE\([^)]*\)\{return\(0,l\.jsxs\)\("div",\{className:"how-scene how-scene-pack",children:\[[\s\S]*?\]\}\)\}/,
  'function eE(){return null}',
);
// Also hide by forcing className display via replacing how-visual-stage render - search occurrences
if (js.includes('className:"how-visual-stage"')) {
  // wrap is hard; CSS hide is enough for hydration
  console.log("js still has how-visual-stage class (css will hide)");
}
if (js !== jsBefore) {
  fs.writeFileSync(jsPath, js);
  console.log("js how-scene-pack nulled");
} else {
  console.log("js structural replace skipped");
}
