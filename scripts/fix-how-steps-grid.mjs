import fs from "fs";

const path = "site/effects.css";
let c = fs.readFileSync(path, "utf8");
const start = c.indexOf("/* How it works");
const end = c.indexOf("/* Contract address");
if (start < 0 || end < 0) {
  console.log("markers missing", start, end);
  process.exit(1);
}

const next = `/* How it works — compact full-width step grid */
.how-it-works-section {
  max-width: 1320px !important;
}

.how-it-works-section .how-heading {
  max-width: 720px;
  margin-left: auto;
  margin-right: auto;
  margin-bottom: clamp(2rem, 4vw, 3rem) !important;
  text-align: center;
}

.how-it-works-section .how-heading > p:last-child {
  margin-left: auto;
  margin-right: auto;
}

.how-it-works-section .how-story {
  display: block !important;
}

.how-it-works-section .how-visual-column {
  display: none !important;
}

.how-it-works-section .how-mobile-scene {
  display: none !important;
}

.how-it-works-section .how-narrative {
  counter-reset: how-step;
  display: grid !important;
  grid-template-columns: repeat(2, minmax(0, 1fr)) !important;
  gap: 1.25rem 1.5rem !important;
  border-top: 1px solid var(--line);
  padding-top: clamp(1.5rem, 3vw, 2.25rem) !important;
  width: 100% !important;
  max-width: none !important;
}

.how-it-works-section .how-stage-copy,
.how-it-works-section .how-stage-copy:last-child {
  min-height: 0 !important;
  height: auto !important;
  border-left: none !important;
  padding: 1.25rem 1.15rem !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  align-items: flex-start !important;
  gap: 0.7rem !important;
  position: relative !important;
  border: 1px solid var(--line);
  border-radius: 16px;
  background: #050705;
}

.how-it-works-section .how-stage-marker {
  position: static !important;
  left: auto !important;
  margin: 0 !important;
}

.how-it-works-section .how-stage-copy::before {
  counter-increment: how-step;
  content: counter(how-step, decimal-leading-zero);
  color: color-mix(in srgb, var(--fx-accent) 75%, var(--muted));
  font-family: var(--font-geist-sans), system-ui, sans-serif;
  font-size: 0.7rem;
  font-weight: 650;
  letter-spacing: 0.12em;
}

.how-it-works-section .how-stage-copy h3 {
  margin: 0 !important;
  max-width: none !important;
  width: 100% !important;
  font-size: clamp(1.2rem, 2vw, 1.65rem) !important;
  line-height: 1.15 !important;
  letter-spacing: -0.035em !important;
}

.how-it-works-section .how-stage-copy > p {
  margin: 0 !important;
  max-width: none !important;
  width: 100% !important;
  color: var(--muted);
  font-size: clamp(0.88rem, 1.2vw, 1rem) !important;
  line-height: 1.5 !important;
}

@media (min-width: 1100px) {
  .how-it-works-section .how-narrative {
    grid-template-columns: repeat(4, minmax(0, 1fr)) !important;
    gap: 1rem !important;
  }

  .how-it-works-section .how-stage-copy {
    padding: 1.1rem 1rem !important;
  }

  .how-it-works-section .how-stage-copy h3 {
    font-size: clamp(1.05rem, 1.3vw, 1.35rem) !important;
  }
}

@media (max-width: 720px) {
  .how-it-works-section .how-narrative {
    grid-template-columns: 1fr !important;
    gap: 0.9rem !important;
  }
}

`;

fs.writeFileSync(path, c.slice(0, start) + next + c.slice(end));
console.log("rewrote how-it-works css");
