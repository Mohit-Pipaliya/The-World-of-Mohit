/**
 * script.js — PURE FLOATING TEXT THEME 2026
 *
 * Exact identical sequence:
 * 1. BG clean load
 * 2. Breathing Idle center
 * 3. Walking.glb smooth → bottom
 * 4. Waving.glb immediate wave
 * 5. Welcome NO BOX pure text explode
 * 6. Model clean disappear
 * 7. Name pure text
 * 8. Role pure text
 * 9. Navbar drop
 */
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

const gsap = window.gsap;

/* ════════════════════════════════════════════════════════════════
   RENDERER & SCENE (Clean, no bloom needed for pure PBR)
════════════════════════════════════════════════════════════════ */
const container = document.getElementById('canvas-container');
const renderer = new THREE.WebGLRenderer({ 
    antialias: true, 
    alpha: true,
    powerPreference: 'high-performance',
    precision: 'highp'
});
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.setSize(container.clientWidth, container.clientHeight);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.1;
container.appendChild(renderer.domElement);
renderer.setClearColor(0x000000, 0);

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0.1, 200);
camera.position.set(0, 0, 9.1);

/* ════════════════════════════════════════════════════════════════
   BACKGROUND PARALLAX (MOUSE + SCROLL)
════════════════════════════════════════════════════════════════ */
let targetMouseX = 0;
let targetMouseY = 0;
let currentBgX = 0;
let currentBgY = 0;

window.addEventListener('mousemove', (e) => {
    // Calculate mouse position relative to center (-25px to 25px range)
    targetMouseX = (e.clientX / window.innerWidth - 0.5) * 50;
    targetMouseY = (e.clientY / window.innerHeight - 0.5) * 50;
});

/* ════════════════════════════════════════════════════════════════
   LIGHTING
════════════════════════════════════════════════════════════════ */
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

const blueLight = new THREE.DirectionalLight(0x3b82f6, 1.5);
blueLight.position.set(5, 5, 5);
scene.add(blueLight);

const fillLight = new THREE.DirectionalLight(0xffffff, 0.8);
fillLight.position.set(-5, 3, 5);
scene.add(fillLight);

const rimLight = new THREE.DirectionalLight(0xffffff, 1.8);
rimLight.position.set(0, 5, -5);
scene.add(rimLight);

/* ════════════════════════════════════════════════════════════════
   MODELS & TEXTURES
════════════════════════════════════════════════════════════════ */
const texLoader = new THREE.TextureLoader();
const customTextures = {};

async function loadTextures() {
    const texNames = ['1_tga', '5_tga', '7_tga', '9_tga'];
    return Promise.all(texNames.map(name => {
        return new Promise(resolve => {
            texLoader.load(`texture/${name}.png`, t => { 
                t.colorSpace = THREE.SRGBColorSpace; 
                t.flipY = false; 
                customTextures[name] = t;
                resolve();
            });
        });
    }));
}

function applyTexture(model) {
    // Gather all unique materials
    const uniqueMats = [];
    model.traverse(c => {
        if (c.isMesh && c.material) {
            const mats = Array.isArray(c.material) ? c.material : [c.material];
            mats.forEach(m => {
                if(!uniqueMats.includes(m)) uniqueMats.push(m);
            });
        }
    });

    // Smartly assign custom textures to materials
    uniqueMats.forEach((m, index) => {
        let tex = null;
        const n = m.name.toLowerCase();
        
        // Try matching material name to texture name
        if (n.includes('1')) tex = customTextures['1_tga'];
        else if (n.includes('5')) tex = customTextures['5_tga'];
        else if (n.includes('7')) tex = customTextures['7_tga'];
        else if (n.includes('9')) tex = customTextures['9_tga'];
        
        // Fallback: apply by index if exactly 4 materials exist
        if (!tex) {
            const keys = ['1_tga', '5_tga', '7_tga', '9_tga'];
            tex = customTextures[keys[index % keys.length]];
        }
        
        if (tex) {
            m.map = tex;
            m.roughness = 0.6;
            m.metalness = 0.2;
            m.needsUpdate = true;
        }
    });
}

const gltfLoader = new GLTFLoader();
const models = {}, mixers = {}, actions = {}, clock = new THREE.Clock();

function loadModel(name, path) {
    return new Promise(r => {
        gltfLoader.load(path, g => {
            applyTexture(g.scene);
            g.scene.visible = false;
            scene.add(g.scene);
            models[name] = g.scene;
            if (g.animations?.length) {
                mixers[name] = new THREE.AnimationMixer(g.scene);
                let action = mixers[name].clipAction(g.animations[0]);
                actions[name] = action;
                
                if (name === 'walking') {
                    action.timeScale = 0.5; // Make walking slower and smoother
                }
                if (name === 'waving') {
                    action.setLoop(THREE.LoopOnce, 1);
                    action.clampWhenFinished = true; // Stop perfectly after waving
                }
            }
            r();
        }, undefined, () => r());
    });
}

function showModel(n, x, y, z, s) {
    const m = models[n];
    if (m) { 
        m.position.set(x,y,z); 
        m.scale.setScalar(s); 
        m.visible = true; 
        if (actions[n]) {
            actions[n].reset().play(); // Play from start when shown
        }
    }
}
function hideModel(n) { 
    if (models[n]) models[n].visible = false; 
}

function cleanRemoveModels() {
    Object.keys(models).forEach(k => {
        const m = models[k];
        if (!m || !m.visible) return;
        
        gsap.to(m.scale, {
            x: 0.01, y: 0.01, z: 0.01,
            duration: 0.5,
            ease: "expo.out",
            onComplete: () => {
                scene.remove(m);
                m.traverse(c => {
                    if(c.isMesh) {
                        c.geometry?.dispose();
                        if(c.material.map) c.material.map.dispose();
                        c.material.dispose();
                    }
                });
                models[k] = null;
                if(mixers[k]) { mixers[k].stopAllAction(); delete mixers[k]; }
            }
        });
    });
}

/* ════════════════════════════════════════════════════════════════
   REALISTIC ATMOSPHERIC DUST
════════════════════════════════════════════════════════════════ */
let dustParticles;
function createDust() {
    const particleCount = 600;
    const geo = new THREE.BufferGeometry();
    const pos = new Float32Array(particleCount * 3);
    for(let i=0; i < particleCount * 3; i++) {
        pos[i] = (Math.random() - 0.5) * 40; // Spread across scene
    }
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    
    const mat = new THREE.PointsMaterial({
        color: 0x90c0ff, // Magical blue-white dust
        size: 0.05,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
        depthWrite: false
    });
    
    dustParticles = new THREE.Points(geo, mat);
    scene.add(dustParticles);
}

/* ════════════════════════════════════════════════════════════════
   LOOP
════════════════════════════════════════════════════════════════ */
const bgElem = document.getElementById('parallax-bg');

function animate() {
    requestAnimationFrame(animate);
    const dt = clock.getDelta();
    Object.values(mixers).forEach(m => m && m.update(dt));
    
    if (models.idle && models.idle.visible) models.idle.rotation.y += 0.003;
    
    // Animate atmospheric dust
    if (dustParticles) {
        dustParticles.rotation.y += 0.001;
        dustParticles.rotation.x += 0.0005;
    }

    // Smooth parallax interpolation for background
    currentBgX += (targetMouseX - currentBgX) * 0.05;
    currentBgY += (targetMouseY - currentBgY) * 0.05;
    
    if (bgElem) {
        const scrollY = window.scrollY;
        // Combine mouse movement and scroll depth, adding a slight scale to hide edges
        bgElem.style.transform = `translate3d(${-currentBgX}px, calc(${-scrollY * 0.4}px + ${-currentBgY}px), 0) scale(1.05)`;
    }
    
    renderer.render(scene, camera);
}

/* ════════════════════════════════════════════════════════════════
   EXACT TIMELINE (CLEAN FLOATING TEXT)
════════════════════════════════════════════════════════════════ */
// NAVBAR RESPONSIVE TOGGLE
function initNavbarMobile() {
  const navToggle = document.getElementById('nav-toggle');
  const navList = document.getElementById('nav-list');
  const navLinks = document.querySelectorAll('.nav-link');

  if (navToggle && navList) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navList.classList.toggle('active');
      document.body.classList.toggle('nav-open');
    });

    // Close menu when clicking a link
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navList.classList.remove('active');
        document.body.classList.remove('nav-open');
      });
    });

    // Close menu when clicking outside
    document.addEventListener('click', (e) => {
      if (navList.classList.contains('active') && !navList.contains(e.target) && !navToggle.contains(e.target)) {
        navToggle.classList.remove('active');
        navList.classList.remove('active');
        document.body.classList.remove('nav-open');
      }
    });
  }
}

async function boot() {
    initNavbarMobile();
    createDust(); // Add atmospheric dust
    await loadTextures(); // Ensure all 4 textures are loaded before applying
    await Promise.all([
        loadModel('idle', '3d-model/Breathing Idle.glb'),
        loadModel('walking', '3d-model/Walking.glb'),
        loadModel('waving', '3d-model/Waving Gesture.glb')
    ]);
    animate();

    const tl = gsap.timeline();

    // 1: BG clean load

    // 2: Idle breathing - START IMMEDIATELY
    tl.add(() => showModel('idle', 0, 0, -2.9, 0.85), 0.1);

    // 3: Walking smooth walk -> bottom BIG
    tl.add(() => { hideModel('idle'); showModel('walking', 0, 0, -2.9, 0.85); }, 1.5);
    if(models.walking) {
        tl.to(models.walking.position, { y: -5, duration: 2, ease: 'none' }, 1.5);
        tl.to(models.walking.scale, { x: 2.4, y: 2.4, z: 2.4, duration: 2, ease: 'none' }, 1.5);
    }
    tl.to(camera.position, { y: -1.6, duration: 2, ease: 'none' }, 1.5);

    // 4: Waving immediate clean wave
    tl.add(() => {
        hideModel('walking'); 
        showModel('waving', 0, -5, -2.9, 2.4);
    }, 3.5);

    // 5: Sequential Hello -> Welcome (After model waving finish)
    tl.to(camera.position, { y: 0, z: 9.1, duration: 1.0, ease: 'expo.inOut' }, 3.6);
    
    // Show HELLO
    tl.to('#text-hello', { opacity: 1, scale: 1.0, duration: 1.2, ease: 'expo.out' }, 4.0);
    tl.to('#text-hello', { opacity: 0, scale: 1.2, duration: 0.5, ease: 'expo.in' }, 5.2);
    
    // Show WELCOME
    tl.to('#text-welcome', { opacity: 1, scale: 1.0, duration: 1.2, ease: 'expo.out' }, 5.8);
    tl.to('#text-welcome', { opacity: 0, scale: 1.2, duration: 0.5, ease: 'expo.in' }, 7.0);

    // 6: Model clean disappear (Sync with Hello/Welcome transitions)
    tl.add(() => { cleanRemoveModels(); }, 5.5);

    // 7: "I am Mohit Pipaliya" - Show after Welcome
    tl.to('#text-name', {
        opacity: 1, y: 0, scale: 1, duration: 1.5, ease: 'elastic.out(1, 0.5)'
    }, 7.5);

    // 8: "Game Developer and Creator"
    tl.to('#text-role', {
        opacity: 1, y: 0, duration: 1.5, ease: 'back.out(1.7)'
    }, 8.0);

    // 9: Navbar drop
    tl.to('#top-nav', {
        y: 0, opacity: 1, duration: 1.5, ease: 'expo.out'
    }, 8.5);

    /* ════════════════════════════════════════════════════════════════
       ABOUT SECTION SCROLL ANIMATION
    ════════════════════════════════════════════════════════════════ */
    gsap.registerPlugin(ScrollTrigger);

    const aboutTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#about",
        start: "top 75%", // Triggers when the About section comes into view
        toggleActions: "play none none reverse",
      }
    });

    // LEFT: image slide from left, rotateY(720deg), scale(1.1)
    aboutTl.fromTo(".about-img-container", 
      { x: -500, opacity: 0, rotationY: -720, scale: 0.5 },
      { x: 0, opacity: 1, rotationY: 0, scale: 1.1, duration: 1.8, ease: "power4.out" },
      0
    );

    // RIGHT: About title
    aboutTl.fromTo(".about-title", 
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1.2, ease: "power3.out" },
      0.4
    );

    // RIGHT: About text paragraphs stagger up
    aboutTl.fromTo("#about .text-line",
      { y: 40, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, stagger: 0.2, ease: "power3.out" },
      0.7
    );

    /* ════════════════════════════════════════════════════════════════
       TECHNICAL SKILLS SCROLL ANIMATION
    ════════════════════════════════════════════════════════════════ */
    const techTl = gsap.timeline({
      scrollTrigger: {
        trigger: "#tech-skills",
        start: "top 75%",
        toggleActions: "play none none reverse",
      }
    });

    // Title
    techTl.fromTo("#tech-skills .section-title", 
      { y: 80, opacity: 0 },
      { y: 0, opacity: 1, duration: 1, ease: "power3.out" },
      0
    );

    // Categories and Cards Stagger
    techTl.fromTo("#tech-skills .text-line",
      { y: 50, opacity: 0 },
      { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: "power3.out" },
      0.3
    );

    // Progress Rings — HUD fill animation
    const ringFills = document.querySelectorAll('.hud-progress-fill');
    ringFills.forEach((ring) => {
      let percent = parseFloat(ring.getAttribute('data-percent'));
      let offset = 565.48 - (565.48 * percent) / 100;
      techTl.to(ring, { strokeDashoffset: offset, duration: 2, ease: 'expo.out' }, 1.0);
    });

    // Counters — HUD number roll-up
    const percentTexts = document.querySelectorAll('.hud-number');
    percentTexts.forEach((text) => {
      let percent = parseInt(text.getAttribute('data-percent'));
      let counter = { val: 0 };
      techTl.to(counter, {
        val: percent,
        duration: 2,
        ease: 'expo.out',
        onUpdate: function() {
          text.textContent = Math.round(counter.val) + '%';
        }
      }, 1.0);
    });

    /* ════════════════════════════════════════════════════════════════
       SOFT SKILLS CAROUSEL
    ════════════════════════════════════════════════════════════════ */
    function initSoftSkillsCarousel() {
      const track = document.getElementById('soft-carousel-track');
      if (!track) return;
      const cards = Array.from(track.querySelectorAll('.soft-card'));
      const prevBtn = document.querySelector('.soft-carousel-btn.prev-btn');
      const nextBtn = document.querySelector('.soft-carousel-btn.next-btn');
      
      let currentIndex = 0;
      let startX = 0;
      let isDragging = false;
      
      function updateCarousel() {
        cards.forEach((card, i) => {
          card.className = 'soft-card'; // reset classes
          let offset = i - currentIndex;
          
          // Linear logic (no wrap around)
          if (offset === 0) card.classList.add('active');
          else if (offset === -1) card.classList.add('prev-1');
          else if (offset === 1) card.classList.add('next-1');
          else if (offset === -2) card.classList.add('prev-2');
          else if (offset === 2) card.classList.add('next-2');
          else if (offset < -2) card.classList.add('far-prev');
          else if (offset > 2) card.classList.add('far-next');
        });

        // Hide/Show buttons based on index
        if (prevBtn) prevBtn.style.opacity = (currentIndex === 0) ? "0" : "1";
        if (prevBtn) prevBtn.style.pointerEvents = (currentIndex === 0) ? "none" : "auto";
        if (nextBtn) nextBtn.style.opacity = (currentIndex === cards.length - 1) ? "0" : "1";
        if (nextBtn) nextBtn.style.pointerEvents = (currentIndex === cards.length - 1) ? "none" : "auto";
      }
      
      function nextSlide() {
        if (currentIndex < cards.length - 1) {
          currentIndex++;
          updateCarousel();
        }
      }
      
      function prevSlide() {
        if (currentIndex > 0) {
          currentIndex--;
          updateCarousel();
        }
      }
      
      if (nextBtn) nextBtn.addEventListener('click', nextSlide);
      if (prevBtn) prevBtn.addEventListener('click', prevSlide);
      
      // Click a specific card to make it active
      cards.forEach((card, i) => {
        card.addEventListener('click', () => {
          if (!card.classList.contains('active')) {
            currentIndex = i;
            updateCarousel();
          }
        });
      });

      // Drag & Touch Swipe
      function handleDragStart(e) {
        isDragging = true;
        startX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        track.style.cursor = 'grabbing';
      }
      
      function handleDragMove(e) {
        if (!isDragging) return;
        const currentX = e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        const diffX = currentX - startX;
        
        if (Math.abs(diffX) > 60) {
          if (diffX > 0) prevSlide();
          else nextSlide();
          isDragging = false; // Prevents multiple slides in one gesture
          track.style.cursor = 'grab';
        }
      }
      
      function handleDragEnd() {
        isDragging = false;
        track.style.cursor = 'grab';
      }
      
      track.style.cursor = 'grab';
      track.addEventListener('mousedown', handleDragStart);
      track.addEventListener('mousemove', handleDragMove);
      track.addEventListener('mouseup', handleDragEnd);
      track.addEventListener('mouseleave', handleDragEnd);
      
      track.addEventListener('touchstart', handleDragStart, { passive: true });
      track.addEventListener('touchmove', handleDragMove, { passive: true });
      track.addEventListener('touchend', handleDragEnd);
      
      // Keyboard support
      document.addEventListener('keydown', (e) => {
        const section = document.getElementById('soft-skills');
        if (!section) return;
        const rect = section.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
          if (e.key === 'ArrowLeft') prevSlide();
          if (e.key === 'ArrowRight') nextSlide();
        }
      });

      // Initialize
      updateCarousel();

      // Entrance animation
      ScrollTrigger.create({
        trigger: '#soft-skills',
        start: 'top 75%',
        once: true,
        onEnter: () => {
          gsap.fromTo('#soft-skills .section-title',
            { y: 40, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.2, ease: 'power2.out' }
          );
          gsap.fromTo('#soft-skills .section-subtitle',
            { y: 25, opacity: 0 },
            { y: 0, opacity: 1, duration: 1.0, ease: 'power2.out', delay: 0.3 }
          );
          gsap.fromTo('.soft-carousel-track-container',
            { scale: 0.8, opacity: 0 },
            { scale: 1, opacity: 1, duration: 1.5, ease: 'back.out(1.2)', delay: 0.4 }
          );
        }
      });
    }
    initSoftSkillsCarousel();
}

boot();

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight; camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

/* ════════════════════════════════════════════════════════════════
   SMOOTH SCROLL FOR NAVBAR LINKS
════════════════════════════════════════════════════════════════ */
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#home') {
            window.scrollTo({ top: 0, behavior: 'smooth' });
            return;
        }
        const targetSection = document.querySelector(targetId);
        if (targetSection) {
            const navHeight = document.getElementById('top-nav').offsetHeight;
            const targetPosition = targetSection.getBoundingClientRect().top + window.scrollY - navHeight - 20;
            const startY = window.scrollY;
            const distance = targetPosition - startY;
            const duration = targetId === '#projects' ? 1700 : 900;
            const startTime = performance.now();

            const projectsSection = document.getElementById('projects');
            if (targetId === '#projects' && projectsSection) {
                projectsSection.classList.add('pulse-glow');
                setTimeout(() => projectsSection.classList.remove('pulse-glow'), 1400);
            }

            function easeInOutCubic(t) {
                return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
            }

            function cinematicScroll(now) {
                const elapsed = now - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const eased = easeInOutCubic(progress);
                window.scrollTo(0, startY + distance * eased);
                if (progress < 1) requestAnimationFrame(cinematicScroll);
            }

            requestAnimationFrame(cinematicScroll);
        }
    });
});

/* ════════════════════════════════════════════════════════════════
   SCROLL REVEAL ANIMATIONS
════════════════════════════════════════════════════════════════ */
function initScrollReveal() {
  const revealElems = document.querySelectorAll('.reveal-elem');
  revealElems.forEach(el => {
    gsap.fromTo(el, 
      { opacity: 0, y: 40 },
      {
        opacity: 1, y: 0,
        duration: 1.2,
        ease: "power2.out",
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          toggleActions: "play none none none"
        }
      }
    );
  });
}

initScrollReveal();

/* ════════════════════════════════════════════════════════════════
   PROJECTS SECTION — CINEMATIC WORLDS EXPERIENCE
════════════════════════════════════════════════════════════════ */
function initProjectsExperience() {
  const projectsSection = document.getElementById('projects');
  if (!projectsSection) return;

  gsap.registerPlugin(ScrollTrigger);

  const portals = Array.from(document.querySelectorAll('.project-portal'));
  const dots = Array.from(document.querySelectorAll('.indicator-dot'));
  const progressFill = document.querySelector('.indicator-progress');
  const scrollIndicator = document.querySelector('.projects-scroll-indicator');
  const cameraStage = document.querySelector('.projects-camera-stage');
  const worldsWrap = document.querySelector('.projects-worlds');
  const particlesWrap = document.getElementById('projects-particles');
  const navProjects = document.querySelector('.nav-link[href="#projects"]');
  const mediaCards = Array.from(document.querySelectorAll('.project-media'));
  const projectCtas = Array.from(document.querySelectorAll('[data-video-open]'));
  const modal = document.getElementById('video-modal');
  const modalPlayer = document.getElementById('video-modal-player');
  const modalClose = document.getElementById('video-modal-close');
  const modalTitle = document.querySelector('.video-modal-title');

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isMobile = window.innerWidth <= 991;
  let currentWorld = 0;
  const portalCarControllers = new Map();
  let carBusy = false;
  let pendingWorldIndex = null;
  let worldRevealToken = 0;
  const carAnimPlayed = new Set(); // tracks which portals have had car animation

  // Ambient particles for futuristic depth.
  if (particlesWrap) {
    const particleCount = isMobile ? 28 : 80;
    for (let i = 0; i < particleCount; i += 1) {
      const p = document.createElement('span');
      p.className = 'projects-particle';
      p.style.left = `${Math.random() * 100}%`;
      p.style.top = `${Math.random() * 100}%`;
      p.style.animationDuration = `${6 + Math.random() * 14}s`;
      p.style.animationDelay = `${Math.random() * 10}s`;
      p.style.opacity = `${0.2 + Math.random() * 0.5}`;
      particlesWrap.appendChild(p);
    }
  }

  // Cinematic text reveal (line-by-line feel).
  document.querySelectorAll('.reveal-lines').forEach((desc) => {
    const sentences = desc.textContent.split('. ').filter(Boolean);
    desc.innerHTML = '';
    sentences.forEach((sentence, idx) => {
      const line = document.createElement('span');
      line.className = 'line';
      line.textContent = idx === sentences.length - 1 ? sentence : `${sentence}.`;
      desc.appendChild(line);
    });
  });

  function setActiveWorld(index, instantReveal = false) {
    // Only return if we are already in the process of revealing this world to avoid overlap
    if (!instantReveal && index === currentWorld && carBusy) {
      return;
    }

    const revealToken = ++worldRevealToken;
    currentWorld = index;
    portals.forEach((portal, i) => {
      portal.classList.toggle('active', i === index);
      portal.classList.toggle('dimmed', i !== index);
      // ALWAYS remove content-visible when world is not active or when switching
      if (i !== index) {
        portal.classList.remove('content-visible');
      }
    });
    dots.forEach((dot, i) => dot.classList.toggle('is-active', i === index));

    const revealPortalContent = () => {
      if (revealToken !== worldRevealToken) return;
      const activePortal = portals[index];
      if (!activePortal) return;
      activePortal.classList.add('content-visible');
      const activeLines = activePortal.querySelectorAll('.project-description .line');
      gsap.fromTo(activeLines,
        { opacity: 0.2, y: 16 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.09, ease: 'power3.out', overwrite: true }
      );
    };

    portals[index]?.classList.remove('content-visible');

    if (!instantReveal && !isMobile && !prefersReducedMotion) {
      if (carBusy) {
        if (pendingWorldIndex !== index) pendingWorldIndex = index;
        return;
      }

      const controller = portalCarControllers.get(index);
      if (controller) {
        carBusy = true;
        const direction = portals[index].dataset.enterDirection || 'right';
        controller.run(direction, portals[index]).finally(() => {
          carBusy = false;
          // Removed carAnimPlayed check to allow repeatable animation
          revealPortalContent();
          if (pendingWorldIndex !== null && pendingWorldIndex !== index) {
            const nextIdx = pendingWorldIndex;
            pendingWorldIndex = null;
            setActiveWorld(nextIdx);
          }
        });
        return;
      }
    }

    revealPortalContent();
  }

  // Side progress indicator + portal focus mode.
  if (!isMobile) {
    ScrollTrigger.create({
      trigger: projectsSection,
      start: 'top 35%',
      end: 'bottom 40%',
      onToggle: ({ isActive }) => scrollIndicator?.classList.toggle('visible', isActive),
      onUpdate: ({ progress }) => {
        if (progressFill) progressFill.style.height = `${Math.min(progress * 100, 100)}%`;
      },
      onLeave: () => {
        // Reset all portals when leaving section so they re-animate on return
        portals.forEach(p => p.classList.remove('content-visible'));
        currentWorld = -1; 
      },
      onLeaveBack: () => {
        portals.forEach(p => p.classList.remove('content-visible'));
        currentWorld = -1;
      }
    });

    portals.forEach((portal, idx) => {
      ScrollTrigger.create({
        trigger: portal,
        start: 'top 60%',
        end: 'bottom 40%',
        onEnter: () => setActiveWorld(idx),
        onEnterBack: () => setActiveWorld(idx),
        onRefresh: (self) => {
          if (self.isActive && currentWorld !== idx) {
            setActiveWorld(idx);
          }
        }
      });
    });
  } else {
    portals.forEach((portal) => {
      portal.classList.add('active');
      portal.classList.remove('dimmed');
      const lines = portal.querySelectorAll('.project-description .line');
      lines.forEach((line) => {
        line.style.opacity = '1';
        line.style.transform = 'none';
      });
    });
  }

  dots.forEach((dot) => {
    dot.addEventListener('click', () => {
      const targetWorld = Number(dot.dataset.worldDot || 0);
      const navHeight = document.getElementById('top-nav').offsetHeight;
      const targetPortal = portals[targetWorld];
      if (targetPortal) {
        const jump = targetPortal.getBoundingClientRect().top + window.scrollY - navHeight - 24;
        window.scrollTo({ top: jump, behavior: 'smooth' });
      }
      setActiveWorld(targetWorld);
    });
  });

  // Hover lift + dynamic neon tilt.
  portals.forEach((portal) => {
    const card = portal.querySelector('.project-content');
    if (!card || isMobile) return;
    portal.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width - 0.5;
      const ny = (e.clientY - rect.top) / rect.height - 0.5;
      gsap.to(card, {
        rotateY: nx * 7,
        rotateX: -ny * 7,
        y: -8,
        duration: 0.35,
        ease: 'power2.out'
      });

      const media = portal.querySelector('.project-media');
      if (media) {
        gsap.to(media, {
          x: nx * 8,
          y: ny * 8,
          duration: 0.4,
          ease: 'power2.out'
        });
      }
    });
    portal.addEventListener('mouseleave', () => {
      gsap.to(card, { rotateY: 0, rotateX: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      const media = portal.querySelector('.project-media');
      if (media) {
        gsap.to(media, { x: 0, y: 0, duration: 0.4, ease: 'power2.out' });
      }
    });
  });

  // Projects nav active state.
  if (navProjects) {
    ScrollTrigger.create({
      trigger: projectsSection,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: ({ isActive }) => navProjects.classList.toggle('active', isActive)
    });
  }

  // Fullscreen cinematic video modal.
  function openModal(videoEl, title) {
    if (!modal || !modalPlayer) return;
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    modalPlayer.src = videoEl.currentSrc || videoEl.src;
    modalPlayer.currentTime = videoEl.currentTime || 0;
    modalPlayer.play().catch(() => {});
    modalTitle.textContent = title;
  }

  function closeModal() {
    if (!modal || !modalPlayer) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    modalPlayer.pause();
    modalPlayer.removeAttribute('src');
    modalPlayer.load();
  }

  mediaCards.forEach((media) => {
    const video = media.querySelector('video');
    if (!video) return;
    media.addEventListener('click', () => {
      openModal(video, media.dataset.videoTitle || 'Project Showcase');
    });
  });

  projectCtas.forEach((cta) => {
    const portal = cta.closest('.project-portal');
    const video = portal?.querySelector('.project-media video');
    const title = portal?.querySelector('.project-media')?.dataset.videoTitle || 'Project Showcase';
    cta.addEventListener('click', () => {
      if (video) openModal(video, title);
    });
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => {
    if (e.target.classList.contains('video-modal-backdrop')) closeModal();
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('open')) closeModal();
  });

  // Custom cursor glow for project section.
  if (!isMobile) {
    const cursor = document.createElement('div');
    cursor.className = 'custom-cursor-glow';
    document.body.appendChild(cursor);
    document.addEventListener('mousemove', (e) => {
      cursor.style.transform = `translate(${e.clientX - 11}px, ${e.clientY - 11}px)`;

      if (projectsSection.contains(e.target)) {
        const rect = projectsSection.getBoundingClientRect();
        const localX = ((e.clientX - rect.left) / rect.width) * 100;
        const localY = ((e.clientY - rect.top) / rect.height) * 100;
        projectsSection.style.setProperty('--mx', `${Math.max(0, Math.min(100, localX))}%`);
        projectsSection.style.setProperty('--my', `${Math.max(0, Math.min(100, localY))}%`);
      }
    });
    document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
  }

  // 3D car world-transition controller (separate for each project box).
  if (!isMobile && !prefersReducedMotion) {
    const carModelCandidates = ['3d-model/Car for portfolio.glb', '3d-model/portfolio.glb'];

    portals.forEach((portal, portalIndex) => {
      const carLayer = portal.querySelector('.project-car-layer');
      const carCanvas = portal.querySelector('.project-car-canvas');
      const trail = portal.querySelector('.car-neon-trail');
      const smokeField = portal.querySelector('.car-smoke-field');
      const smoke = portal.querySelector('.car-smoke-burst');
      const reflection = portal.querySelector('.car-reflection');

      if (!carCanvas || !carLayer || !trail || !smokeField || !smoke || !reflection) return;

      const carRenderer = new THREE.WebGLRenderer({ canvas: carCanvas, antialias: false, alpha: true });
      const carScene = new THREE.Scene();
      const carCamera = new THREE.PerspectiveCamera(45, carCanvas.clientWidth / carCanvas.clientHeight, 0.1, 100);
      carCamera.position.set(0, 1.3, 5.8);
      carRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.25));
      carRenderer.setSize(carCanvas.clientWidth || window.innerWidth, carCanvas.clientHeight || window.innerHeight);

      const carAmbient = new THREE.AmbientLight(0xffffff, 0.45);
      const carKey = new THREE.DirectionalLight(0x22d3ee, 1.7);
      carKey.position.set(2, 3, 4);
      const headLightL = new THREE.PointLight(0x99f6ff, 0, 8, 2.1);
      const headLightR = new THREE.PointLight(0x99f6ff, 0, 8, 2.1);
      headLightL.position.set(-0.35, 0.25, 1.1);
      headLightR.position.set(0.35, 0.25, 1.1);
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
      const tryLoadCar = (index = 0) => {
        if (index >= carModelCandidates.length) return;
        gltfLoader.load(carModelCandidates[index], (gltf) => {
          carModel = gltf.scene;
          carModel.scale.setScalar(0.92);
          carModel.position.y = -0.35;
          carPivot.add(carModel);
          carPivot.add(headLightL, headLightR);

          // FIX 1: Auto-trigger car animation for world 0 when model finally loads
          if (portalIndex === currentWorld && !carBusy) {
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
                if (pendingWorldIndex !== null && pendingWorldIndex !== portalIndex) {
                  const next = pendingWorldIndex;
                  pendingWorldIndex = null;
                  setActiveWorld(next);
                }
              });
            } else {
              carBusy = false;
            }
          }
        }, undefined, () => tryLoadCar(index + 1));
      };
      tryLoadCar();

      let renderActive = false;
      let rafId = null;
      const renderCarLoop = () => {
        if (!renderActive) return;
        carRenderer.render(carScene, carCamera);
        rafId = requestAnimationFrame(renderCarLoop);
      };
      const startRenderLoop = () => {
        if (renderActive) return;
        renderActive = true;
        renderCarLoop();
      };
      const stopRenderLoop = () => {
        renderActive = false;
        if (rafId) cancelAnimationFrame(rafId);
        rafId = null;
      };

      window.addEventListener('resize', () => {
        if (!carCanvas) return;
        const w = carCanvas.clientWidth || window.innerWidth;
        const h = carCanvas.clientHeight || window.innerHeight;
        carCamera.aspect = w / h;
        carCamera.updateProjectionMatrix();
        carRenderer.setSize(w, h);
      });

      let activeTimeline = null;
      let finalizeRun = null;

      portalCarControllers.set(portalIndex, {
        run(direction, portal) {
          return new Promise((resolve) => {
            if (!carModel) {
              resolve();
              return;
            }

            if (activeTimeline) {
              activeTimeline.kill();
              activeTimeline = null;
            }
            if (typeof finalizeRun === 'function') {
              finalizeRun();
            }

            const movingFromRight = direction === 'right';
            const startX = movingFromRight ?  7.0 : -7.0;   // start well off-screen
            const stopX = movingFromRight ? -1.4 : 1.4;
            const exitX = movingFromRight ? -9.0 : 9.0;     // FIX 2: exit far off-screen
            const smokeRect = portal.getBoundingClientRect();
            const smokeBaseX = Math.max(smokeRect.width * 0.42, 14);
            const smokeBaseY = Math.max(smokeRect.height * 0.55, 12);

            const emitRealisticSmoke = (burstCount = 12) => {
              for (let i = 0; i < burstCount; i++) {
                const puff = document.createElement('span');
                puff.className = 'car-smoke-puff';
                
                // Organic variation in size and starting position
                const size = 40 + Math.random() * 80;
                const driftX = (movingFromRight ? 1 : -1) * (50 + Math.random() * 150);
                const driftY = -10 - Math.random() * 80;
                const rotate = Math.random() * 360;
                
                puff.style.width = `${size}px`;
                puff.style.height = `${size}px`;
                puff.style.left = `${smokeBaseX}px`;
                puff.style.top = `${smokeBaseY}px`;
                puff.style.transform = `translate(-50%, -50%) rotate(${rotate}deg)`;
                
                smokeField.appendChild(puff);

                const tl = gsap.timeline({ onComplete: () => puff.remove() });
                tl.fromTo(puff,
                  { opacity: 0, scale: 0.1, x: 0, y: 0 },
                  { 
                    opacity: 0.7 + Math.random() * 0.3, 
                    scale: 1.5, 
                    duration: 0.4, 
                    ease: 'power2.out' 
                  }
                );
                tl.to(puff, {
                  opacity: 0,
                  scale: 3 + Math.random() * 2,
                  x: driftX,
                  y: driftY,
                  duration: 1.2 + Math.random() * 0.8,
                  ease: 'power1.out'
                });
              }
            };

            startRenderLoop();
            carLayer.style.opacity = '1';
            smokeField.innerHTML = '';
            carPivot.position.set(startX, -0.38, 0);
            carPivot.rotation.y = movingFromRight ? -Math.PI / 2 : Math.PI / 2;
            headLightL.intensity = 0;
            headLightR.intensity = 0;
            gsap.killTweensOf([smoke, trail, reflection, headLightL, headLightR, carPivot.position]);
            gsap.set(smoke, { opacity: 0, scale: 0.2 });
            gsap.set(reflection, { opacity: 0.5 });

            gsap.set(trail, {
              opacity: 0.9,
              width: 0,
              left: movingFromRight ? 'auto' : '0%',
              right: movingFromRight ? '0%' : 'auto'
            });

            const completeOnce = (() => {
              let done = false;
              return () => {
                if (done) return;
                done = true;
                stopRenderLoop();
                carLayer.style.opacity = '0';
                smokeField.innerHTML = '';
                finalizeRun = null;
                if (activeTimeline) {
                  activeTimeline.kill();
                  activeTimeline = null;
                }
                resolve();
              };
            })();
            finalizeRun = completeOnce;
            let failSafeTimer = setTimeout(() => {
              completeOnce();
            }, 3000);

            const tl = gsap.timeline({
              onComplete: () => {
                if (failSafeTimer) {
                  clearTimeout(failSafeTimer);
                  failSafeTimer = null;
                }
                completeOnce(); // carLayer already faded inside timeline
              },
              onInterrupt: () => {
                if (failSafeTimer) {
                  clearTimeout(failSafeTimer);
                  failSafeTimer = null;
                }
                completeOnce();
              }
            });
            activeTimeline = tl;

            tl.to(carPivot.position, { x: stopX, duration: 0.82, ease: 'power2.out' }, 0);
            tl.to(trail, { width: '30%', duration: 0.75, ease: 'power2.out' }, 0);
            tl.to(headLightL, { intensity: 2.2, duration: 0.12, yoyo: true, repeat: 1 }, 0.98);
            tl.to(headLightR, { intensity: 2.2, duration: 0.12, yoyo: true, repeat: 1 }, 0.98);
            tl.to(smoke, {
              opacity: 0.88,
              scale: 1.7,
              duration: 0.2,
              onStart: () => {
                smoke.style.left = `${smokeBaseX}px`;
                smoke.style.top = `${smokeBaseY}px`;
                emitRealisticSmoke(6);
              }
            }, 0.8);
            tl.call(() => emitRealisticSmoke(5), [], 1.0);
            tl.to(smoke, { opacity: 0.55, scale: 2.2, duration: 0.6, ease: 'none' }, 1.0);
            tl.to(carPivot.position, { x: exitX, duration: 0.55, ease: 'power3.in' }, 1.05);
            // ── Original smoke dissipation restored ──
            // exitX = ±9.0 so car is well off-screen; carLayer stays visible while smoke fades naturally
            tl.to(smoke, { opacity: 0.07, scale: 3.0, duration: 0.85, ease: 'power2.out' }, 1.55);
            tl.to(reflection, { opacity: 0, duration: 0.3 }, 1.60);
            tl.to(trail, { opacity: 0, duration: 0.3 }, 1.60);
            // Fade carLayer AFTER smoke is near-transparent, then stop render safely
            tl.to(carLayer, { opacity: 0, duration: 0.28, ease: 'power2.in' }, 2.32);
            tl.call(() => stopRenderLoop(), [], 2.62);
          });
        }
      });
    });
  }

  // World 0: Force car animation on first open by setting instantReveal to false
  setActiveWorld(0, false);
}

  // Project Video Modal Logic
  const videoModal = document.getElementById('project-video-modal');
  const modalVideo = document.getElementById('modal-main-video');
  const modalTitle = document.getElementById('modal-video-title');
  const modalClose = videoModal?.querySelector('.video-modal-close');

  const openVideoModal = (src, title) => {
    if (!videoModal || !modalVideo) return;
    modalVideo.src = src;
    if (modalTitle) modalTitle.textContent = title;
    videoModal.classList.add('open');
    modalVideo.play();
    document.body.style.overflow = 'hidden'; // Prevent scrolling
  };

  const closeVideoModal = () => {
    if (!videoModal || !modalVideo) return;
    videoModal.classList.remove('open');
    modalVideo.pause();
    modalVideo.src = ""; // Clear src to stop loading
    document.body.style.overflow = ''; 
  };

  // Add listeners to project media and CTA buttons
  document.querySelectorAll('.project-portal').forEach(portal => {
    const media = portal.querySelector('.project-media');
    const btn = portal.querySelector('[data-video-open]');
    const video = media?.querySelector('video');
    const title = media?.dataset.videoTitle || "Project Gameplay";

    const triggerOpen = () => {
      if (video) openVideoModal(video.src, title);
    };

    media?.addEventListener('click', triggerOpen);
    btn?.addEventListener('click', triggerOpen);
  });

  modalClose?.addEventListener('click', closeVideoModal);
  videoModal?.querySelector('.video-modal-backdrop')?.addEventListener('click', closeVideoModal);

initProjectsExperience();

function initAchievementsExperience() {
  const section = document.getElementById('achievements');
  if (!section) return;

  gsap.registerPlugin(ScrollTrigger);

  const cards = Array.from(section.querySelectorAll('.sleek-card'));
  const navAchievements = document.querySelector('.nav-link[href="#achievements"]');
  const overlay = document.getElementById('achievement-overlay');
  const overlayClose = overlay?.querySelector('.achievement-overlay-close');
  const overlayMedia = overlay?.querySelector('.achievement-overlay-media');
  const overlayTitle = overlay?.querySelector('.achievement-overlay-title');
  const overlayDesc = overlay?.querySelector('.achievement-overlay-description');

  // Add background image to sleek cards dynamically for blurred background
  cards.forEach(card => {
    const imgEl = card.querySelector('.sleek-card-image img');
    const imageContainer = card.querySelector('.sleek-card-image');
    if (imgEl && imageContainer) {
      imageContainer.style.setProperty('background-image', `url('${imgEl.src}')`);
    }
  });

  ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      cards.forEach((card, idx) => {
        gsap.fromTo(card,
          { opacity: 0, y: 50 },
          {
            opacity: 1,
            y: 0,
            duration: 0.75,
            delay: idx * 0.18,
            ease: 'back.out(1.4)',
            clearProps: 'y,transform', // release inline transform so CSS hover takes over
            onStart: () => card.classList.add('is-visible')
          }
        );
      });
    }
  });


  if (navAchievements) {
    ScrollTrigger.create({
      trigger: section,
      start: 'top 45%',
      end: 'bottom 45%',
      onToggle: ({ isActive }) => navAchievements.classList.toggle('active', isActive)
    });
  }

  function buildOverlayMedia(mediaEl) {
    if (!overlayMedia || !mediaEl) return;
    overlayMedia.innerHTML = '';
    const iframe = mediaEl.querySelector('iframe');
    const image = mediaEl.querySelector('img');

    if (iframe) {
      const full = document.createElement('iframe');
      full.src = iframe.getAttribute('src') || '';
      full.title = iframe.getAttribute('title') || 'Achievement document';
      overlayMedia.appendChild(full);
      return;
    }

    if (image) {
      const full = document.createElement('img');
      full.src = image.getAttribute('src') || '';
      full.alt = image.getAttribute('alt') || 'Achievement image';
      overlayMedia.appendChild(full);
    }
  }

  function openAchievement(card) {
    if (!overlay) return;
    const title = card.dataset.achievementTitle || card.querySelector('h3')?.textContent || 'Achievement';
    const desc = card.querySelector('.bento-content p')?.textContent || '';
    const media = card.querySelector('.bento-media');

    if (overlayTitle) overlayTitle.textContent = title;
    if (overlayDesc) overlayDesc.textContent = desc;
    buildOverlayMedia(media);

    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('achievement-focus-active');
  }

  function closeAchievement() {
    if (!overlay) return;
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('achievement-focus-active');
    if (overlayMedia) overlayMedia.innerHTML = '';
  }

  cards.forEach((card) => {
    card.addEventListener('click', () => openAchievement(card));
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openAchievement(card);
      }
    });
  });

  overlayClose?.addEventListener('click', closeAchievement);
  overlay?.addEventListener('click', (e) => {
    if (e.target.classList.contains('achievement-overlay-backdrop')) closeAchievement();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && overlay?.classList.contains('open')) {
      closeAchievement();
    }
  });
}

initAchievementsExperience();

function initCertificationsExperience() {
  const section = document.getElementById('certifications');
  if (!section) return;

  gsap.registerPlugin(ScrollTrigger);

  const cards = Array.from(section.querySelectorAll('.certificate-card'));
  const modal = document.getElementById('certificate-modal');
  const modalClose = document.getElementById('certificate-modal-close');
  const modalImage = document.getElementById('certificate-modal-image');

  // Scroll Reveal for Cards
  ScrollTrigger.create({
    trigger: section,
    start: 'top 60%',
    once: true,
    onEnter: () => {
      cards.forEach((card, idx) => {
        // We use a simple opacity and slight scale/y-axis entrance animation.
        // The rotation and exact positioning comes from CSS custom properties.
        gsap.to(card, {
          opacity: 1,
          duration: 0.8,
          delay: idx * 0.1,
          ease: 'back.out(1.2)',
          onStart: () => card.classList.add('is-visible')
        });
      });
    }
  });

  // Modal Functionality
  function openModal(imgSrc, imgAlt) {
    if (!modal || !modalImage) return;
    modalImage.src = imgSrc;
    modalImage.alt = imgAlt || 'Certificate';
    modal.classList.add('active');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    if (!modal || !modalImage) return;
    modal.classList.remove('active');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    // slight delay to clear image src so animation isn't jumpy
    setTimeout(() => {
      modalImage.src = '';
    }, 400);
  }

  cards.forEach(card => {
    card.addEventListener('click', () => {
      const img = card.querySelector('img');
      if (img) {
        openModal(img.src, img.alt);
      }
    });

    // Keyboard support for accessibility
    card.setAttribute('tabindex', '0');
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const img = card.querySelector('img');
        if (img) openModal(img.src, img.alt);
      }
    });
  });

  modalClose?.addEventListener('click', closeModal);

  modal?.addEventListener('click', (e) => {
    if (e.target.classList.contains('certificate-modal-backdrop')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal?.classList.contains('active')) {
      closeModal();
    }
  });
}

initCertificationsExperience();
