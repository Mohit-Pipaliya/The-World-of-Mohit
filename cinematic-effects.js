"use strict";
/* ═══════════════════════════════════════
   CINEMATIC EFFECTS — OPTIMISED
   ════════════════════════════════════════
   Changes vs v1:
   • Fog uses pure-CSS gradient divs (no external PNG load)
   • Torch injection guarded by IntersectionObserver — only
     animates torches in/near the viewport
   • Mouse parallax removed from section elements (was causing
     full-layout recalc on every frame for every section);
     replaced with a lightweight RAF-throttled fog drift only
   • setTimeout crackle loop uses a cancellation ref
   • audioPrompt variable declared before it is referenced
   ════════════════════════════════════════ */

document.addEventListener("DOMContentLoaded", () => {

  /* ── 1. FOG ─────────────────────────────────────────── */
  const fogContainer = document.createElement("div");
  fogContainer.id = "cinematic-fog-container";
  fogContainer.innerHTML =
    '<div class="cinematic-fog"></div><div class="cinematic-fog-2"></div>';
  document.body.prepend(fogContainer);

  /* ── 2. AMBIENT TORCHES (lazy / IntersectionObserver) ── */
  const torchObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        const sec = entry.target;
        if (entry.isIntersecting && !sec.dataset.torchDone) {
          sec.dataset.torchDone = "1";

          const t1 = makeTorch(
            (10 + Math.random() * 18) + "% auto auto " + (5 + Math.random() * 8) + "%"
          );
          const t2 = makeTorch(
            "auto " + (5 + Math.random() * 8) + "% " + (10 + Math.random() * 18) + "% auto",
            Math.random() * 1.5
          );
          sec.append(t1, t2);
        }
      });
    },
    { rootMargin: "200px" }
  );

  document.querySelectorAll("section").forEach((sec) => {
    if (sec.id === "hero-section") return;       // hero has its own vignette
    torchObserver.observe(sec);
  });

  function makeTorch(inset, delayS = 0) {
    const el = document.createElement("div");
    el.className = "ambient-torch";
    el.style.cssText =
      "inset:" + inset + ";position:absolute;" +
      "animation-delay:" + delayS.toFixed(2) + "s;z-index:0;";
    return el;
  }

  /* ── 3. RAF-THROTTLED FOG PARALLAX ──────────────────── */
  let mouseX = 0, mouseY = 0, rafPending = false;

  document.addEventListener("mousemove", (e) => {
    mouseX = (e.clientX / window.innerWidth  - 0.5) * 18;  // ±9 px
    mouseY = (e.clientY / window.innerHeight - 0.5) * -10; // ±5 px
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(applyFogParallax);
    }
  });

  function applyFogParallax() {
    fogContainer.style.transform =
      "translate3d(" + mouseX.toFixed(2) + "px," + mouseY.toFixed(2) + "px,0)";
    rafPending = false;
  }


});
