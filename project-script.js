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

  /* ── Ambient Particles ── */
  if (particlesWrap) {
    const count = isMobile ? 10 : 20;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'projects-particle';
      p.style.left            = `${Math.random() * 100}%`;
      p.style.top             = `${Math.random() * 100}%`;
      p.style.animationDuration = `${10 + Math.random() * 10}s`;
      p.style.animationDelay  = `${Math.random() * 5}s`;
      p.style.opacity         = `${0.1 + Math.random() * 0.3}`;
      particlesWrap.appendChild(p);
    }
  }

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

  /* ── Scroll Trigger: progress indicator + portal switching ── */
  ScrollTrigger.create({
    trigger: projectsSection,
    start: 'top 35%',
    end: 'bottom 40%',
    onToggle: ({ isActive }) => scrollIndicator?.classList.toggle('visible', isActive),
    onUpdate: ({ progress }) => {
      if (progressFill) progressFill.style.height = `${Math.min(progress * 100, 100)}%`;
    }
  });

  portals.forEach((portal, idx) => {
    ScrollTrigger.create({
      trigger: portal,
      start: 'top 50%',
      end: 'bottom 50%',
      onEnter: () => setActiveWorld(idx),
      onEnterBack: () => setActiveWorld(idx)
    });
  });


  /* ── Dot navigation ── */
  dots.forEach(dot => {
    dot.addEventListener('click', () => {
      const targetIdx = Number(dot.dataset.worldDot || 0);
      const navH = document.getElementById('top-nav').offsetHeight;
      const targetPortal = portals[targetIdx];
      if (targetPortal) {
        const top = targetPortal.getBoundingClientRect().top + window.scrollY - navH - 24;
        window.scrollTo({ top, behavior: 'smooth' });
      }
      setActiveWorld(targetIdx);
    });
  });

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

  /* ── Video Modal ── */
  function openModal(videoEl, title) {
    if (!modal || !modalPlayer) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modalPlayer.src = videoEl.currentSrc || videoEl.src;
    modalPlayer.currentTime = videoEl.currentTime || 0;
    modalPlayer.play().catch(() => {});
    if (modalTitle) modalTitle.textContent = title;
  }

  function closeModal() {
    if (!modal || !modalPlayer) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalPlayer.pause();
    modalPlayer.removeAttribute('src');
    modalPlayer.load();
  }

  mediaCards.forEach(media => {
    const video = media.querySelector('video');
    if (!video) return;
    media.addEventListener('click', () => openModal(video, media.dataset.videoTitle || 'Project Showcase'));
  });

  projectCtas.forEach(cta => {
    const portal = cta.closest('.project-portal');
    const video = portal?.querySelector('.project-media video');
    const title = portal?.querySelector('.project-media')?.dataset.videoTitle || 'Project Showcase';
    cta.addEventListener('click', () => { if (video) openModal(video, title); });
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => {
    if (e.target.classList.contains('video-modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  });

  /* ── Custom cursor glow ── */
  if (!isMobile) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor-glow';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', e => {
      cursor.style.transform = `translate(${e.clientX - 11}px, ${e.clientY - 11}px)`;
      if (projectsSection.contains(e.target)) {
        const rect = projectsSection.getBoundingClientRect();
        const lx = ((e.clientX - rect.left) / rect.width) * 100;
        const ly = ((e.clientY - rect.top) / rect.height) * 100;
        projectsSection.style.setProperty('--mx', `${Math.max(0, Math.min(100, lx))}%`);
        projectsSection.style.setProperty('--my', `${Math.max(0, Math.min(100, ly))}%`);
      }
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  }



  // Reveal world 0 content immediately on load
  setActiveWorld(0, true);
}

/* ════════════════════════════════════════════════════════════════
   HOLOGRAPHIC GATEWAY — Entrance Reveal + Interactivity
════════════════════════════════════════════════════════════════ */
function initGatewayExperience() {
  const gateway = document.querySelector('.project-gateway');
  if (!gateway) return;

  /* ── Scroll-reveal entrance (IntersectionObserver) ── */
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          gateway.classList.add('gateway-revealed');
          animateCounters();
          io.unobserve(gateway);
        }
      });
    },
    { threshold: 0.25 }
  );
  io.observe(gateway);

  /* Trigger immediately if already in view (e.g. Project.html top load) */
  const rect = gateway.getBoundingClientRect();
  if (rect.top < window.innerHeight * 0.85) {
    gateway.classList.add('gateway-revealed');
    animateCounters();
  }

  /* ── Animated number counters for stat strip ── */
  function animateCounters() {
    gateway.querySelectorAll('.gateway-stat-num').forEach(el => {
      const raw   = el.textContent.trim();
      const hasPlus = raw.endsWith('+');
      const target  = parseInt(raw, 10);
      if (isNaN(target)) return;
      let start = null;
      const duration = 900;
      function step(ts) {
        if (!start) start = ts;
        const progress = Math.min((ts - start) / duration, 1);
        const ease = 1 - Math.pow(1 - progress, 3); // ease-out cubic
        el.textContent = Math.round(ease * target) + (hasPlus ? '+' : '');
        if (progress < 1) requestAnimationFrame(step);
      }
      requestAnimationFrame(step);
    });
  }

  /* ── Mouse parallax on orb stage (desktop only) ── */
  const orbStage = gateway.querySelector('.gateway-orb-stage');
  if (!orbStage || window.innerWidth <= 768) return;

  const section = document.getElementById('projects') || document.querySelector('.projects-section');
  if (section) {
    section.addEventListener('mousemove', e => {
      const r  = gateway.getBoundingClientRect();
      const cx = r.left + r.width  / 2;
      const cy = r.top  + r.height / 2;
      const dx = (e.clientX - cx) / (window.innerWidth  / 2);
      const dy = (e.clientY - cy) / (window.innerHeight / 2);
      gsap.to(orbStage, {
        rotateY:  dx * 18,
        rotateX: -dy * 12,
        duration: 0.6,
        ease: 'power2.out',
        transformPerspective: 800
      });
    });
    section.addEventListener('mouseleave', () => {
      gsap.to(orbStage, { rotateY: 0, rotateX: 0, duration: 0.8, ease: 'elastic.out(1, 0.6)' });
    });
  }
}

initProjectsExperience();
initGatewayExperience();
