import fs from "node:fs";
import path from "node:path";

const dir = path.join("site", "_next", "static", "chunks");
for (const f of fs.readdirSync(dir).filter((x) => x.endsWith(".js"))) {
  const t = fs.readFileSync(path.join(dir, f), "utf8");
  if (!t.includes("Remittance Rails") && !t.includes("Payroll Flow") && !t.includes('id:"ai-pack"')) continue;
  const stock = (t.match(/kind:"stock"/g) || []).length;
  const portfolio = (t.match(/kind:"portfolio"/g) || []).length;
  const payroll = t.includes("Payroll Flow");
  const rem = t.includes("Remittance Rails");
  console.log(f, { stock, portfolio, payroll, rem, hasLetC: t.includes("let c=[") });
}
