/**
 * project-script.js — Projects Page Standalone Logic
 * Handles: holographic gateway animation, cinematic world switching,
 * video modal, scroll reveal, smooth nav scroll.
 */
const gsap = window.gsap;
gsap.registerPlugin(ScrollTrigger);

/* ════════════════════════════════════════════════════════════════
   SMOOTH SCROLL FOR NAVBAR LINKS
════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', function (e) {
    const href = this.getAttribute('href');

    // External page links — let browser handle
    if (href.startsWith('index.html')) return;

    // Same-page anchor links
    e.preventDefault();
    if (href === '#home') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }

    const target = document.querySelector(href);
    if (!target) return;

    const navH = document.getElementById('top-nav').offsetHeight;
    const top = target.getBoundingClientRect().top + window.scrollY - navH - 20;
    const startY = window.scrollY;
    const dist = top - startY;
    const duration = href === '#projects' ? 1700 : 900;
    const t0 = performance.now();

    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }
    function step(now) {
      const prog = Math.min((now - t0) / duration, 1);
      window.scrollTo(0, startY + dist * ease(prog));
      if (prog < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  });
});

/* ════════════════════════════════════════════════════════════════
   SCROLL REVEAL (.reveal-elem)
════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.reveal-elem').forEach(el => {
  gsap.fromTo(el,
    { opacity: 0, y: 40 },
    {
      opacity: 1, y: 0,
      duration: 1.2,
      ease: 'power2.out',
      scrollTrigger: { trigger: el, start: 'top 85%', toggleActions: 'play none none none' }
    }
  );
});

/* ════════════════════════════════════════════════════════════════
   PROJECTS SECTION — CINEMATIC WORLDS EXPERIENCE
════════════════════════════════════════════════════════════════ */
function initProjectsExperience() {
  const projectsSection = document.getElementById('projects');
  if (!projectsSection) return;

  const portals          = Array.from(document.querySelectorAll('.project-portal'));
  const dots             = Array.from(document.querySelectorAll('.indicator-dot'));
  const progressFill     = document.querySelector('.indicator-progress');
  const scrollIndicator  = document.querySelector('.projects-scroll-indicator');
  const particlesWrap    = document.getElementById('projects-particles');
  const navProjects      = document.querySelector('.nav-link[href="#projects"]');
  const mediaCards       = Array.from(document.querySelectorAll('.project-media'));
  const projectCtas      = Array.from(document.querySelectorAll('[data-video-open]'));
  const modal            = document.getElementById('video-modal');
  const modalPlayer      = document.getElementById('video-modal-player');
  const modalClose       = document.getElementById('video-modal-close');
  const modalTitle       = document.querySelector('.video-modal-title');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 991;

  let currentWorld = 0;
  let worldRevealToken = 0;

  /* Ambient particles removed for maximum performance */

  /* ── Cinematic line-by-line text reveal ── */
  document.querySelectorAll('.reveal-lines').forEach(desc => {
    const sentences = desc.textContent.split('. ').filter(Boolean);
    desc.innerHTML = '';
    sentences.forEach((s, idx) => {
      const line = document.createElement('span');
      line.className = 'line';
      line.textContent = idx === sentences.length - 1 ? s : `${s}.`;
      desc.appendChild(line);
    });
  });

  /* ── World switching ── */
  function setActiveWorld(index) {
    currentWorld = index;

    portals.forEach((p, i) => {
      p.classList.toggle('active', i === index);
      p.classList.toggle('dimmed', i !== index);
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));

    const portal = portals[index];
    if (!portal) return;
    
    if (!isMobile && !prefersReducedMotion) {
      const lines = portal.querySelectorAll('.project-description .line');
      gsap.fromTo(lines,
        { opacity: 0.2, y: 10 },
        { opacity: 1, y: 0, duration: 0.4, stagger: 0.05, ease: 'power2.out', overwrite: true }
      );
    }
  }

  /* ── Scroll Trigger: project activation ── */
  portals.forEach((portal, idx) => {
    ScrollTrigger.create({
      trigger: portal,
      start: 'top 65%',
      end: 'bottom 35%',
      onEnter: () => setActiveWorld(idx),
      onEnterBack: () => setActiveWorld(idx)
    });
  });

  /* ── Video Link System ── */
  document.querySelectorAll('.project-media').forEach(media => {
    media.addEventListener('click', function() {
      const ytId = this.dataset.youtubeId;
      if (ytId) {
        window.open(`https://www.youtube.com/watch?v=${ytId}`, '_blank');
      }
    });
  });

  setActiveWorld(0, true);

  /* ── Hover tilt + media parallax removed for performance ── */

  /* ── Active nav highlight ── */
  if (navProjects) {
    ScrollTrigger.create({
      trigger: projectsSection,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: ({ isActive }) => navProjects.classList.toggle('active', isActive)
    });
  }



  /* ── Custom cursor removed for performance ── */



  // Reveal world 0 content immediately on load
  setActiveWorld(0, true);
}

/* Gateway Logic Removed */

initProjectsExperience();
