import fs from "fs";

const CA_MSG = "Available shortly after the $SPACKS launch.";

function patchJs(file) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  // Remove the overlapping company-mark stack in catalog art/summary top
  // Pattern around: className:"...stack"... companies.slice(0,4).map(...CompanyMark...)
  const stackRe =
    /,?\(0,l\.jsxs\)\("div",\{className:"[^"]*stack"[^]*?e\.companies\.length>4\?\(0,l\.jsxs\)\("span"[^]*?\]\}\):null\]\}\)/;
  // More precise extraction by anchors
  const stackStart = s.indexOf('companies.slice(0,4).map(e=>(0,l.jsx)(el.CompanyMark');
  if (stackStart >= 0) {
    // find the jsxs("div",{className: ... stack that contains this
    const divStart = s.lastIndexOf('(0,l.jsxs)("div",{className:', stackStart);
    // find end of this jsxs call starting at the ( of (0,l.jsxs)
    const callStart = s.indexOf("(", divStart);
    // Actually start at (0,l.jsxs)
    let depth = 0;
    let end = -1;
    const expr = s.indexOf("(0,l.jsxs)", divStart);
    const argParen = s.indexOf("(", expr + "(0,l.jsxs)".length);
    for (let p = argParen; p < s.length; p++) {
      if (s[p] === "(") depth++;
      else if (s[p] === ")") {
        depth--;
        if (depth === 0) {
          end = p + 1;
          break;
        }
      }
    }
    // include leading comma
    let start = expr;
    if (s[start - 1] === ",") start--;
    console.log(file, "removing stack", start, end, s.slice(start, start + 80));
    s = s.slice(0, start) + s.slice(end);
  } else {
    console.log(file, "stack map not found");
  }

  // Remove catalog-facts "N stocks/assets inside" span
  // (0,l.jsxs)("span",{children:[e.companies.length," ","portfolio"===e.kind?"assets":"stocks"," inside"]})
  const factsSpan =
    '(0,l.jsxs)("span",{children:[e.companies.length," ","portfolio"===e.kind?"assets":"stocks"," inside"]})';
  if (s.includes(factsSpan)) {
    // remove span and following comma if present
    s = s.replace("," + factsSpan, "");
    s = s.replace(factsSpan + ",", "");
    s = s.replace(factsSpan, "");
    console.log(file, "removed stocks inside span");
  } else {
    console.log(file, "stocks inside span not exact");
    const i = s.indexOf('"stocks"," inside"');
    console.log("near", i, JSON.stringify(s.slice(i - 120, i + 100)));
  }

  // Replace verifying / checking availability copy
  s = s.replaceAll(
    'reason:"Verifying onchain availability."',
    `reason:"${CA_MSG}"`
  );
  s = s.replaceAll(
    "Verifying onchain availability.",
    CA_MSG
  );

  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log(file, "written");
  }
}

function patchHtml(file) {
  let s = fs.readFileSync(file, "utf8");
  const before = s;

  // Remove company-mark stack block in catalog card
  s = s.replace(
    /<div class="[^"]*stack"[^>]*>[\s\S]*?<\/div>(?=\s*<div class="catalog-summary"|)/,
    ""
  );
  // More targeted: stack with company-mark children
  s = s.replace(
    /<div class="[^"]*stack"[^>]*aria-hidden="true"[^>]*>[\s\S]*?<\/div>/g,
    ""
  );

  // Remove "4 stocks inside" span (with React comment markers)
  s = s.replace(
    /<span>\d+<!-- --> <!-- -->stocks<!-- --> inside<\/span>/g,
    ""
  );
  s = s.replace(/<span>\d+\s*stocks\s*inside<\/span>/gi, "");

  s = s.replaceAll(
    "Verifying onchain availability.",
    CA_MSG
  );

  if (s !== before) {
    fs.writeFileSync(file, s);
    console.log(file, "html written");
  } else {
    console.log(file, "html unchanged");
  }
}

// Hide stack via CSS as safety net
let css = fs.readFileSync("site/effects.css", "utf8");
if (!css.includes("/* catalog card cleanup */")) {
  css += `
/* catalog card cleanup */
.catalog-card .stack,
.catalog-summary .stack,
.catalog-art .stack,
div.stack[aria-hidden="true"] {
  display: none !important;
}
`;
  fs.writeFileSync("site/effects.css", css);
  console.log("css hide stack");
}

patchJs("site/_next/static/chunks/3d7gaukqntbmv.js");
patchHtml("site/index.html");
