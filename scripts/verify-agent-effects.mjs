import fs from "node:fs";

const t = fs.readFileSync("site/_next/static/chunks/2f6u4m9u9e_qj.js", "utf8");
const i = t.indexOf('label:"Jackpot"');
console.log(t.slice(i - 100, i + 220));
console.log("has agent id", t.includes('id:"agent"'));
console.log("has Agent label", t.includes('label:"Agent"'));

// Unexpected patches - what changed in wallet-ish chunks?
for (const f of ["2snzl3pv_nx71.js", "31tjesjl45oyp.js", "398hlkqzouf6z.js"]) {
  const s = fs.readFileSync(`site/_next/static/chunks/${f}`, "utf8");
  console.log(f, "agent?", s.includes("/agent"), s.includes("Agent"));
}

const home = fs.readFileSync("site/index.html", "utf8");
console.log("home effects css", home.includes('href="/effects.css"'));
console.log("home effects js", home.includes('src="/effects.js"'));
console.log("home Agent nav", /Agent<\/span>/.test(home));
