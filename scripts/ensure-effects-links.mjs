import fs from "fs";

function ensureEffects(file) {
  let html = fs.readFileSync(file, "utf8");
  const before = html;
  if (!html.includes('href="/effects.css"')) {
    html = html.replace("</head>", '<link rel="stylesheet" href="/effects.css"/></head>');
  }
  if (!html.includes('src="/effects.js"')) {
    html = html.replace("</body>", '<script src="/effects.js" defer></script></body>');
  }
  if (html !== before) {
    fs.writeFileSync(file, html);
    console.log("effects linked", file);
  } else {
    console.log("effects already", file);
  }
}

ensureEffects("site/docs/index.html");
ensureEffects("site/index.html");
ensureEffects("site/jackpot/index.html");
