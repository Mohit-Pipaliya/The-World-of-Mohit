/**
 * project-script.js — Projects Page Standalone Logic
 * Handles: car 3D animation, cinematic world switching,
 * video modal, scroll reveal, smooth nav scroll.
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gsap = window.gsap;
gsap.registerPlugin(ScrollTrigger);

const gltfLoader = new GLTFLoader();

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
  const portalCarControllers = new Map();
  let carBusy = false;
  let pendingWorldIndex = null;
  let worldRevealToken = 0;
  const carAnimPlayed = new Set(); // tracks which portals have already had car animation

  /* ── Ambient Particles ── */
  if (particlesWrap) {
    const count = isMobile ? 28 : 80;
    for (let i = 0; i < count; i++) {
      const p = document.createElement('span');
      p.className = 'projects-particle';
      p.style.left            = `${Math.random() * 100}%`;
      p.style.top             = `${Math.random() * 100}%`;
      p.style.animationDuration = `${6 + Math.random() * 14}s`;
      p.style.animationDelay  = `${Math.random() * 10}s`;
      p.style.opacity         = `${0.2 + Math.random() * 0.5}`;
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
  function setActiveWorld(index, instantReveal = false) {
    if (!instantReveal && index === currentWorld && portals[index]?.classList.contains('content-visible')) return;

    const token = ++worldRevealToken;
    currentWorld = index;

    portals.forEach((p, i) => {
      p.classList.toggle('active', i === index);
      p.classList.toggle('dimmed', i !== index);
      p.classList.toggle('content-visible', i !== index ? false : p.classList.contains('content-visible'));
    });
    dots.forEach((d, i) => d.classList.toggle('is-active', i === index));

    const revealContent = () => {
      if (token !== worldRevealToken) return;
      const portal = portals[index];
      if (!portal) return;
      portal.classList.add('content-visible');
      const lines = portal.querySelectorAll('.project-description .line');
      gsap.fromTo(lines,
        { opacity: 0.2, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out', overwrite: true }
      );
    };

    portals[index]?.classList.remove('content-visible');

    if (!instantReveal && !isMobile && !prefersReducedMotion) {
      if (carBusy) { if (pendingWorldIndex !== index) pendingWorldIndex = index; return; }
      const ctrl = portalCarControllers.get(index);
      if (ctrl) {
        carBusy = true;
        const dir = portals[index].dataset.enterDirection || 'right';
        ctrl.run(dir, portals[index]).finally(() => {
          carBusy = false;
          carAnimPlayed.add(index);
          revealContent();
          if (pendingWorldIndex !== null && pendingWorldIndex !== index) {
            const next = pendingWorldIndex;
            pendingWorldIndex = null;
            setActiveWorld(next);
          }
        });
        return;
      }
    }
    revealContent();
  }

  /* ── Scroll Trigger: progress indicator + portal switching ── */
  if (!isMobile) {
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
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => setActiveWorld(idx),
        onEnterBack: () => setActiveWorld(idx)
      });
    });
  } else {
    portals.forEach(portal => {
      portal.classList.add('active');
      portal.classList.remove('dimmed');
      portal.querySelectorAll('.project-description .line').forEach(l => {
        l.style.opacity = '1';
        l.style.transform = 'none';
      });
    });
  }

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

  /* ── Hover tilt + media parallax ── */
  portals.forEach(portal => {
    const card = portal.querySelector('.project-content');
    if (!card || isMobile) return;
    portal.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const nx = (e.clientX - r.left) / r.width - 0.5;
      const ny = (e.clientY - r.top) / r.height - 0.5;
      gsap.to(card, { rotateY: nx * 7, rotateX: -ny * 7, y: -8, duration: 0.35, ease: 'power2.out' });
      const media = portal.querySelector('.project-media');
      if (media) gsap.to(media, { x: nx * 8, y: ny * 8, duration: 0.4, ease: 'power2.out' });
    });
    portal.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      const media = portal.querySelector('.project-media');
      if (media) gsap.to(media, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
    });
  });

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

  /* ── 3D Car Animation (per portal) ── */
  if (!isMobile && !prefersReducedMotion) {
    const carModelCandidates = ['3d-model/Car for portfolio.glb', '3d-model/portfolio.glb'];

    portals.forEach((portal, portalIndex) => {
      const carLayer   = portal.querySelector('.project-car-layer');
      const carCanvas  = portal.querySelector('.project-car-canvas');
      const trail      = portal.querySelector('.car-neon-trail');
      const smokeField = portal.querySelector('.car-smoke-field');
      const smoke      = portal.querySelector('.car-smoke-burst');
      const reflection = portal.querySelector('.car-reflection');

      if (!carCanvas || !carLayer || !trail || !smokeField || !smoke || !reflection) return;

      const carRenderer = new THREE.WebGLRenderer({ canvas: carCanvas, antialias: false, alpha: true });
      const carScene    = new THREE.Scene();
      const carCamera   = new THREE.PerspectiveCamera(45, carCanvas.clientWidth / carCanvas.clientHeight, 0.1, 100);
      carCamera.position.set(0, 1.3, 5.8);
      carRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      carRenderer.setSize(carCanvas.clientWidth || window.innerWidth, carCanvas.clientHeight || window.innerHeight);

      const carAmbient  = new THREE.AmbientLight(0xffffff, 0.45);
      const carKey      = new THREE.DirectionalLight(0x22d3ee, 1.7);
      carKey.position.set(2, 3, 4);
      const headLightL  = new THREE.PointLight(0x99f6ff, 0, 8, 2.1);
      const headLightR  = new THREE.PointLight(0x99f6ff, 0, 8, 2.1);
      headLightL.position.set(-0.35, 0.25, 1.1);
      headLightR.position.set( 0.35, 0.25, 1.1);
      carScene.add(carAmbient, carKey);

      const ground = new THREE.Mesh(
        new THREE.PlaneGeometry(6, 1.7),
        new THREE.MeshBasicMaterial({ color: 0x22d3ee, transparent: true, opacity: 0.09 })
      );
      ground.rotation.x = -Math.PI / 2;
      ground.position.y = -0.55;
      carScene.add(ground);

      const carPivot = new THREE.Group();
      carScene.add(carPivot);
      let carModel = null;

      const tryLoadCar = (idx = 0) => {
        if (idx >= carModelCandidates.length) return;
        gltfLoader.load(carModelCandidates[idx], gltf => {
          carModel = gltf.scene;
          carModel.scale.setScalar(0.92);
          carModel.position.y = -0.35;
          carPivot.add(carModel);
          carPivot.add(headLightL, headLightR);

          // FIX 1: If this portal is the currently active world and car hasn't played yet,
          // re-trigger animation now that the model has loaded.
          if (portalIndex === currentWorld && !carBusy && !carAnimPlayed.has(portalIndex)) {
            carBusy = true;
            const dir = portals[portalIndex]?.dataset.enterDirection || 'right';
            const ctrl = portalCarControllers.get(portalIndex);
            if (ctrl) {
              ctrl.run(dir, portals[portalIndex]).finally(() => {
                carBusy = false;
                carAnimPlayed.add(portalIndex);
                const activePortal = portals[portalIndex];
                if (activePortal) {
                  activePortal.classList.add('content-visible');
                  const lines = activePortal.querySelectorAll('.project-description .line');
                  gsap.fromTo(lines,
                    { opacity: 0.2, y: 16 },
                    { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out' }
                  );
                }
                if (pendingWorldIndex !== null) {
                  const next = pendingWorldIndex;
                  pendingWorldIndex = null;
                  setActiveWorld(next);
                }
              });
            } else {
              carBusy = false;
            }
          }
        }, undefined, () => tryLoadCar(idx + 1));
      };
      tryLoadCar();

      let renderActive = false;
      let rafId = null;
      const renderLoop = () => {
        if (!renderActive) return;
        carRenderer.render(carScene, carCamera);
        rafId = requestAnimationFrame(renderLoop);
      };
      const startRender = () => { if (!renderActive) { renderActive = true; renderLoop(); } };
      const stopRender  = () => { renderActive = false; if (rafId) { cancelAnimationFrame(rafId); rafId = null; } };

      window.addEventListener('resize', () => {
        if (!carCanvas) return;
        const w = carCanvas.clientWidth  || window.innerWidth;
        const h = carCanvas.clientHeight || window.innerHeight;
        carCamera.aspect = w / h;
        carCamera.updateProjectionMatrix();
        carRenderer.setSize(w, h);
      });

      let activeTl   = null;
      let finalizeRun = null;

      portalCarControllers.set(portalIndex, {
        run(direction, portal) {
          return new Promise(resolve => {
            if (!carModel) { resolve(); return; }

            if (activeTl) { activeTl.kill(); activeTl = null; }
            if (typeof finalizeRun === 'function') finalizeRun();

            const fromRight  = direction === 'right';
            const startX     = fromRight ?  7.0 : -7.0;   // start well off-screen
            const stopX      = fromRight ? -1.4 :  1.4;
            const exitX      = fromRight ? -9.0 :  9.0;   // FIX 2: exit far off-screen
            const rect       = portal.getBoundingClientRect();
            const smokeBaseX = Math.max(rect.width  * 0.42, 14);
            const smokeBaseY = Math.max(rect.height * 0.55, 12);

            const emitSmoke = (count = 7) => {
              for (let i = 0; i < count; i++) {
                const puff = document.createElement('span');
                puff.className = 'car-smoke-puff';
                const size  = 30 + Math.random() * 58;
                const driftX = (fromRight ? -1 : 1) * (32 + Math.random() * 88);
                const driftY = -26 - Math.random() * 74;
                puff.style.cssText = `
                  width:${size}px; height:${size}px;
                  left:${smokeBaseX + (Math.random() * 36 - 18)}px;
                  top:${smokeBaseY  + (Math.random() * 28 - 14)}px;
                `;
                smokeField.appendChild(puff);
                gsap.fromTo(puff,
                  { opacity: 0.64 + Math.random() * 0.18, scale: 0.35 + Math.random() * 0.3, x: 0, y: 0 },
                  { opacity: 0, scale: 1.6 + Math.random() * 1.2, x: driftX, y: driftY,
                    duration: 0.9 + Math.random() * 0.9, ease: 'power2.out',
                    onComplete: () => puff.remove() }
                );
              }
            };

            startRender();
            carLayer.style.opacity = '1';
            smokeField.innerHTML   = '';
            carPivot.position.set(startX, -0.38, 0);
            carPivot.rotation.y = fromRight ? -Math.PI / 2 : Math.PI / 2;
            headLightL.intensity = 0;
            headLightR.intensity = 0;

            gsap.killTweensOf([smoke, trail, reflection, headLightL, headLightR, carPivot.position]);
            gsap.set(smoke,      { opacity: 0, scale: 0.2 });
            gsap.set(reflection, { opacity: 0.5 });
            gsap.set(trail, {
              opacity: 0.9, width: 0,
              left:  fromRight ? 'auto' : '0%',
              right: fromRight ? '0%'   : 'auto'
            });

            const completeOnce = (() => {
              let done = false;
              return () => {
                if (done) return;
                done = true;
                stopRender();
                carLayer.style.opacity = '0';
                smokeField.innerHTML   = '';
                finalizeRun = null;
                if (activeTl) { activeTl.kill(); activeTl = null; }
                resolve();
              };
            })();
            finalizeRun = completeOnce;

            let safeTimer = setTimeout(completeOnce, 3000);

            const tl = gsap.timeline({
              onComplete: () => {
                clearTimeout(safeTimer);
                completeOnce(); // carLayer already faded inside timeline
              },
              onInterrupt: () => { clearTimeout(safeTimer); completeOnce(); }
            });
            activeTl = tl;

            tl.to(carPivot.position,   { x: stopX, duration: 0.82, ease: 'power2.out' },              0);
            tl.to(trail,               { width: '30%', duration: 0.75, ease: 'power2.out' },           0);
            tl.to(headLightL,          { intensity: 2.2, duration: 0.12, yoyo: true, repeat: 1 },     0.98);
            tl.to(headLightR,          { intensity: 2.2, duration: 0.12, yoyo: true, repeat: 1 },     0.98);
            tl.to(smoke, {
              opacity: 0.88, scale: 1.7, duration: 0.2,
              onStart: () => { smoke.style.left = `${smokeBaseX}px`; smoke.style.top = `${smokeBaseY}px`; emitSmoke(6); }
            }, 0.8);
            tl.call(() => emitSmoke(5), [], 1.0);
            tl.to(smoke,               { opacity: 0.55, scale: 2.2, duration: 0.6, ease: 'none' },    1.0);
            tl.to(carPivot.position,   { x: exitX, duration: 0.55, ease: 'power3.in' },               1.05);
            // ── Original smoke dissipation restored ──
            // exitX = ±9.0 so car is off-screen; carLayer stays visible while smoke fades naturally
            tl.to(smoke,               { opacity: 0.07, scale: 3.0, duration: 0.85, ease: 'power2.out' }, 1.55);
            tl.to(reflection,          { opacity: 0, duration: 0.3  },                                1.60);
            tl.to(trail,               { opacity: 0, duration: 0.3  },                                1.60);
            // Fade carLayer AFTER smoke is near-transparent, then stop render safely
            tl.to(carLayer,            { opacity: 0, duration: 0.28, ease: 'power2.in' },             2.32);
            tl.call(() => stopRender(), [], 2.62);
          });
        }
      });
    });
  }

  // World 0: content revealed immediately (car will auto-play once model loads via tryLoadCar callback)
  // We reveal content without car first so the page isn't blank on load.
  setActiveWorld(0, true);
}

initProjectsExperience();
