import fs from "fs";

const CA = "TBA after launch";

const HERO_CA_HTML = `<div class="ca-copy-box ca-copy-box-hero" data-ca="${CA}"><div class="ca-copy-meta"><span class="ca-copy-label">$SPACKS · CA</span><span class="ca-copy-chain">Native token · Stable Chain</span></div><div class="ca-copy-row"><code class="ca-copy-value" title="${CA}">${CA}</code><button type="button" class="ca-copy-btn" data-ca-copy aria-label="Copy $SPACKS contract address"><span class="ca-copy-btn-label">Copy</span></button></div></div>`;

const HERO_CA_JS = `(0,l.jsxs)("div",{className:"ca-copy-box ca-copy-box-hero","data-ca":"${CA}",children:[(0,l.jsxs)("div",{className:"ca-copy-meta",children:[(0,l.jsx)("span",{className:"ca-copy-label",children:"$SPACKS · CA"}),(0,l.jsx)("span",{className:"ca-copy-chain",children:"Native token · Stable Chain"})]}),(0,l.jsxs)("div",{className:"ca-copy-row",children:[(0,l.jsx)("code",{className:"ca-copy-value",title:"${CA}",children:"${CA}"}),(0,l.jsx)("button",{type:"button",className:"ca-copy-btn","data-ca-copy":!0,"aria-label":"Copy $SPACKS contract address",children:(0,l.jsx)("span",{className:"ca-copy-btn-label",children:"Copy"})})]})]})`;

// HTML
{
  let html = fs.readFileSync("site/index.html", "utf8");
  // Remove existing hero CA boxes
  html = html.replace(
    /<div class="ca-copy-box ca-copy-box-hero"[\s\S]*?<span class="ca-copy-btn-label">Copy<\/span><\/button><\/div><\/div>/g,
    ""
  );
  html = html.replace(
    /<div class="ca-copy-box ca-copy-box-hero"[\s\S]*?<span class="ca-copy-btn-label">Copy<\/span>\s*<\/button>\s*<\/div>\s*<\/div>/g,
    ""
  );

  // Insert as sibling of hero-copy, before hero-shell closes (before pack-showcase)
  if (html.includes('</div></section><section class="pack-showcase-marquee')) {
    html = html.replace(
      '</div></section><section class="pack-showcase-marquee',
      `</div>${HERO_CA_HTML}</section><section class="pack-showcase-marquee`
    );
    console.log("html: inserted before pack-showcase");
  } else {
    console.log("html: pack-showcase anchor missing");
  }
  fs.writeFileSync("site/index.html", html);

  const h = fs.readFileSync("site/index.html", "utf8");
  const hero = h.slice(h.indexOf("hero-shell"), h.indexOf("pack-showcase"));
  console.log(
    "html hero has CA",
    hero.includes("ca-copy-box-hero"),
    "CA after hero-copy close",
    hero.includes('hero-copy">') &&
      hero.lastIndexOf("ca-copy-box-hero") > hero.lastIndexOf("hero-subtext")
  );
}

// JS
{
  const file = "site/_next/static/chunks/3d7gaukqntbmv.js";
  let s = fs.readFileSync(file, "utf8");

  // Remove any existing hero CA jsx block
  s = s.replace(
    /,?\(0,l\.jsxs\)\("div",\{className:"ca-copy-box ca-copy-box-hero"[\s\S]*?ca-copy-btn-label",children:"Copy"\}\)\}\)\}\)\}\)/g,
    ""
  );

  const oldEnd =
    ':"Open one pack and receive one real USD0 cash drop directly in your wallet."})]})]}),(0,l.jsx)(rz';
  const newEnd =
    `:"Open one pack and receive one real USD0 cash drop directly in your wallet."})]})},${HERO_CA_JS}])})]},(0,l.jsx)(rz`;

  if (s.includes(oldEnd)) {
    s = s.replace(oldEnd, newEnd);
    console.log("js: CA as hero-shell sibling");
  } else {
    console.log("js: end pattern missing");
    const i = s.indexOf("Open one pack and receive one real");
    console.log(JSON.stringify(s.slice(i, i + 240)));
  }

  fs.writeFileSync(file, s);
  const out = fs.readFileSync(file, "utf8");
  const i = out.indexOf("ca-copy-box-hero");
  console.log("js snippet", out.slice(i - 100, i + 60));
}
