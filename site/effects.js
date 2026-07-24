(() => {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function ready(fn) {
    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", fn);
    else fn();
  }

  ready(() => {
    // CA copy boxes
    document.addEventListener("click", async (event) => {
      const btn = event.target.closest("[data-ca-copy]");
      if (!btn) return;
      const root = btn.closest("[data-ca]");
      const value = root?.getAttribute("data-ca")?.trim();
      if (!value) return;
      try {
        await navigator.clipboard.writeText(value);
      } catch {
        const ta = document.createElement("textarea");
        ta.value = value;
        ta.setAttribute("readonly", "");
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        ta.remove();
      }
      const label = btn.querySelector(".ca-copy-btn-label");
      const prev = label?.textContent || "Copy";
      btn.classList.add("is-copied");
      if (label) label.textContent = "Copied";
      window.setTimeout(() => {
        btn.classList.remove("is-copied");
        if (label) label.textContent = prev;
      }, 1400);
    });

    // Hero entrance classes (home only)
    const copy = document.querySelector(".hero-copy");
    if (copy && !reduce) {
      copy.querySelector(".eyebrow")?.classList.add("fx-hero-in");
      copy.querySelector("h1")?.classList.add("fx-hero-in");
      copy.querySelector(".hero-subtext")?.classList.add("fx-hero-in");
    }

    // Scroll reveal targets
    const targets = [
      ...document.querySelectorAll(
        ".catalog-section, .how-it-works-section, .pack-showcase-marquee, .portfolio-section, .how-money-route, .catalog-group, .ca-section"
      ),
    ];
    for (const el of targets) el.classList.add("fx-reveal");

    if (reduce) {
      for (const el of targets) el.classList.add("is-in");
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            e.target.classList.add("is-in");
            io.unobserve(e.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    for (const el of targets) io.observe(el);

    // Soft parallax on hero video
    const media = document.querySelector(".hero-media");
    const video = media?.querySelector("video");
    if (media && video) {
      let ticking = false;
      window.addEventListener(
        "scroll",
        () => {
          if (ticking) return;
          ticking = true;
          requestAnimationFrame(() => {
            const y = Math.min(window.scrollY, 420);
            video.style.transform = `scale(1.04) translate3d(0, ${y * 0.12}px, 0)`;
            ticking = false;
          });
        },
        { passive: true }
      );
    }
  });
})();
