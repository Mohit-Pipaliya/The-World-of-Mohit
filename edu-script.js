import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// --- Scroll Reveal Animations ---
gsap.registerPlugin(ScrollTrigger);
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

// --- Academic Results 3D System ---
(async function initResults() {
  const stage = document.getElementById('results-stage');
  if(!stage) return;

  const canvas      = document.getElementById('results-canvas');
  const panel       = document.getElementById('results-panel');
  const placeholder = document.getElementById('results-placeholder');
  const selectEl    = document.getElementById('edu-select');
  // selectEl.disabled = true; // removed to allow instant interaction

  /* ── Marksheet Data ── */
  const DATA = [
    {
      title: 'SSC (10th Standard) - May 2021', badge: '69.00%',
      cols: ['Subject Name (Code)', 'Internal Marks (20)', 'Secondary Level (80)', 'Total Marks (100)', 'Grade'],
      rows: [
        ['Gujarati FL (01)', '15', '55', '070', 'B2'],
        ['Social Science (10)', '15', '50', '065', 'B2'],
        ['Science (11)', '15', '43', '058', 'C1'],
        ['Mathematics (12)', '16', '65', '081', 'A2'],
        ['English SL (16)', '14', '50', '064', 'B2'],
        ['Sanskrit SL (17)', '16', '60', '076', 'B1']
      ],
      total: ['Grand Total', '', '', '414', 'B2'],
      footer: { left: 'Percentage', lv: '69.00%', right: 'Result', rv: 'PASS' }
    },
    {
      title: 'HSC (12th Science Stream) - March 2023', badge: '49.85%',
      cols: ['Subject Name (Code)', 'Total Marks', 'Marks Obtained', 'Subject Grade'],
      rows: [
        ['English SL (013)', '100', '057', 'C1'],
        ['Mathematics (050)', '100', '042', 'C2'],
        ['Chemistry Theory (052)', '100', '033*', 'D'],
        ['Chemistry Practical (053)', '050', '038', 'B1'],
        ['Physics Theory (054)', '100', '033*', 'D'],
        ['Physics Practical (055)', '050', '035', 'B2'],
        ['Computer Theory (331)', '100', '049', 'C2'],
        ['Computer Practical (332)', '050', '050', 'A1']
      ],
      total: ['Total', '650', '324', 'C2'],
      footer: { left: 'Percentage', lv: '49.85%', right: 'Result', rv: 'PASS' }
    },
    {
      title: 'College - Semester 1', badge: 'SPI: 6.65',
      cols: ['Subject Code', 'Subject Name', 'Theory (ESE)', 'Theory (PA)', 'Theory (Total)', 'Practical (ESE)', 'Practical (PA)', 'Practical (Total)', 'Subject Grade'],
      rows: [
        ['3110005', 'Basic Electrical Engineering', 'BC', 'CC', 'CC', 'AA', 'AA', 'AA', 'BC'],
        ['3110006', 'Basic Mechanical Engineering', 'CD', 'BB', 'CC', 'AA', 'AB', 'AB', 'BC'],
        ['3110007', 'Environmental Sciences', 'DD', 'CC', 'DD', '-', '-', '-', 'PS'],
        ['3110014', 'Mathematics - 1', 'DD', 'CC', 'CD', '-', '-', '-', 'CD'],
        ['3110017', 'Induction Program', '-', '-', '-', '-', '-', '-', 'PS'],
        ['3110018', 'Physics', 'BC', 'CD', 'BC', 'AA', 'AA', 'AA', 'BB']
      ],
      footer: { left: 'SPI', lv: '6.65', right: 'CPI', rv: '6.65' }
    },
    {
      title: 'College - Semester 2', badge: 'SPI: 7.82',
      cols: ['Subject Code', 'Subject Name', 'Theory (ESE)', 'Theory (PA)', 'Theory (Total)', 'Practical (ESE)', 'Practical (PA)', 'Practical (Total)', 'Subject Grade'],
      rows: [
        ['3110002', 'English', '-', 'BB', 'AB', 'AA', 'AA', 'AA', 'AB'],
        ['3110003', 'Programming', '-', 'AB', 'BB', 'AB', 'AA', 'AA', 'AB'],
        ['3110012', 'Workshop', '-', '-', '-', 'AA', 'AA', 'AA', 'AA'],
        ['3110013', 'Eng. Graphics', '-', 'BC', 'AA', 'AA', 'AA', 'AA', 'AB'],
        ['3110015', 'Maths - 2', 'DD', 'BB', 'CD', '-', '-', '-', 'CD'],
        ['3110016', 'Basic Electronics', 'DD', 'BB', 'CC', 'AB', 'AA', 'AA', 'BC']
      ],
      footer: { left: 'SPI', lv: '7.82', right: 'CPI', rv: '7.50' }
    },
    {
      title: 'College - Semester 3', badge: 'SPI: 7.83',
      cols: ['Subject Code', 'Subject Name', 'Theory (ESE)', 'Theory (PA)', 'Theory (Total)', 'Practical (ESE)', 'Practical (PA)', 'Practical (Total)', 'Subject Grade'],
      rows: [
        ['3130004', 'Effective Technical Communication', 'BC', 'AA', 'BB', 'AA', 'AA', 'AA', 'AB'],
        ['3130006', 'Probability and Statistics', 'CD', 'AB', 'CC', '-', '-', '-', 'CC'],
        ['3130007', 'Indian Constitution', 'PS', '-', 'PS', '-', '-', '-', 'PS'],
        ['3130008', 'Design Engineering - I A', '-', '-', '-', 'AA', 'AA', 'AA', 'AA'],
        ['3130702', 'Data Structures', 'CC', 'AA', 'BB', 'AA', 'AA', 'AA', 'AB'],
        ['3130703', 'Database Management Systems', 'CD', 'AA', 'BC', 'AA', 'AA', 'AA', 'BB'],
        ['3130704', 'Digital Fundamentals', 'CD', 'BC', 'CC', 'AB', 'AA', 'AA', 'BC']
      ],
      footer: { left: 'SPI', lv: '7.83', right: 'CPI', rv: '6.65' }
    },
    {
      title: 'College - Semester 4', badge: 'SPI: 8.74',
      cols: ['Subject Code', 'Subject Name', 'Theory (ESE)', 'Theory (PA)', 'Theory (Total)', 'Practical (ESE)', 'Practical (PA)', 'Practical (Total)', 'Subject Grade'],
      rows: [
        ['3140005', 'Design Engineering 1 B', '-', '-', '-', 'AA', 'AA', 'AA', 'AA'],
        ['3140702', 'Operating System', 'AA', 'AB', 'AB', 'AA', 'AA', 'AA', 'AA'],
        ['3140705', 'Object Oriented Programming - I', 'AB', 'AB', 'AB', 'AA', 'AA', 'AA', 'AB'],
        ['3140707', 'Computer Organization & Architecture', 'CC', 'BB', 'BC', 'AA', 'AA', 'AA', 'BB'],
        ['3140708', 'Discrete Mathematics', 'CC', 'AA', 'BB', '-', '-', '-', 'BB'],
        ['3140709', 'Principles of Economics and Management', 'BC', 'AA', 'BB', '-', '-', '-', 'BB']
      ],
      footer: { left: 'SPI', lv: '8.74', right: 'CPI', rv: '7.84' }
    },
    {
      title: 'College - Semester 5', badge: 'SPI: 8.74',
      cols: ['Subject Code', 'Subject Name', 'Theory (ESE)', 'Theory (PA)', 'Theory (Total)', 'Practical (ESE)', 'Practical (PA)', 'Practical (Total)', 'Subject Grade'],
      rows: [
        ['3150001', 'Design Engineering - II A', '-', '-', '-', 'AA', 'AA', 'AA', 'AA'],
        ['3150005', 'Integrated Personality Development', 'AA', 'BB', 'AA', 'AB', 'AA', 'AA', 'AA'],
        ['3150703', 'Analysis and Design of Algorithms', 'BB', 'AA', 'AB', 'AA', 'AA', 'AA', 'AB'],
        ['3150709', 'Professional ethics', 'BB', 'AA', 'AB', '-', '-', '-', 'AB'],
        ['3150710', 'Computer Networks', 'BC', 'AA', 'BB', 'AA', 'AA', 'AA', 'BB'],
        ['3150711', 'Software Engineering', 'BC', 'BC', 'BC', 'BB', 'AA', 'AB', 'BB'],
        ['3150713', 'Python for Data Science', 'BC', 'AA', 'BB', 'AB', 'AA', 'AA', 'AB']
      ],
      footer: { left: 'SPI', lv: '8.74', right: 'CGPA', rv: '8.74' }
    }
  ];

  function gc(g){ return 'g-' + g.replace(/\*/g,''); }
  function buildMarksheet(i){
    const d = DATA[i];
    const rows = d.rows.map(r =>
      `<tr>${r.map((c,j)=>`<td${j===r.length-1?` class="${gc(c)}"`:''}>${c}</td>`).join('')}</tr>`
    ).join('');
    const totalRow = d.total
      ? `<tr class="total-row">${d.total.map((c,j)=>`<td${j===d.total.length-1?` class="${gc(c)}"`:''}>${c}</td>`).join('')}</tr>`
      : '';
    return `
      <div class="ms-header">
        <span class="ms-title">${d.title}</span>
        <span class="ms-badge">${d.badge}</span>
      </div>
      <div class="ms-body">
        <table class="ms-table">
          <thead><tr>${d.cols.map(c=>`<th>${c}</th>`).join('')}</tr></thead>
          <tbody>${rows}${totalRow}</tbody>
        </table>
      </div>
      <div class="ms-footer">
        <div class="ms-stat">${d.footer.left}: <span>${d.footer.lv}</span></div>
        <div class="ms-stat">${d.footer.right}: <span>${d.footer.rv}</span></div>
      </div>`;
  }

  /* ── Three.js Orthographic Scene ── */
  const W = () => stage.clientWidth;
  const H = () => stage.clientHeight;

  const rend = new THREE.WebGLRenderer({canvas, antialias:true, alpha:true});
  rend.setPixelRatio(Math.min(devicePixelRatio, 2));
  rend.setSize(W(), H());
  rend.toneMapping = THREE.ACESFilmicToneMapping;

  const rScene = new THREE.Scene();

  const viewSize = 10; // 10 units vertically
  const aspect = W() / H();
  const rCam = new THREE.OrthographicCamera(-aspect * viewSize / 2, aspect * viewSize / 2, viewSize / 2, -viewSize / 2, 0.1, 100);
  rCam.position.set(0, -0.2, 10); // slightly lowered to center character visually
  rCam.lookAt(0, -0.2, 0);

  rScene.add(new THREE.AmbientLight(0xffffff, 1.4));
  const dl = new THREE.DirectionalLight(0x00ffff, 2); dl.position.set(4,6,5); rScene.add(dl);
  const dl2= new THREE.DirectionalLight(0xd946ef, 1.5); dl2.position.set(-4,4,5); rScene.add(dl2);

  const rClock = new THREE.Clock();
  let rMixer = null, charModel = null;
  let pushClip = null, walkClip = null;
  let pushAction = null, walkAction = null;

  const loader = new GLTFLoader();

  /* Custom Texture Loading */
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
    const uniqueMats = [];
    model.traverse(c => {
      if (c.isMesh && c.material) {
        const mats = Array.isArray(c.material) ? c.material : [c.material];
        mats.forEach(m => {
          if(!uniqueMats.includes(m)) uniqueMats.push(m);
        });
      }
    });

    uniqueMats.forEach((m, index) => {
      let tex = null;
      const n = m.name.toLowerCase();
      if (n.includes('1')) tex = customTextures['1_tga'];
      else if (n.includes('5')) tex = customTextures['5_tga'];
      else if (n.includes('7')) tex = customTextures['7_tga'];
      else if (n.includes('9')) tex = customTextures['9_tga'];
      
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

  await loadTextures();

  loader.load('3d-model/Pushing.glb', gltf => {
    charModel = gltf.scene;
    applyTexture(charModel);
    
    // Scale character so it looks big and matches result box height
    charModel.scale.setScalar(3.2);
    charModel.position.set(-30, -4.0, 0); 
    charModel.visible = false;
    rScene.add(charModel);

    rMixer = new THREE.AnimationMixer(charModel);
    pushClip = gltf.animations[0];
    pushAction = rMixer.clipAction(pushClip);

    loader.load('3d-model/Walking.glb', w => {
      walkClip = w.animations[0];
      walkAction = rMixer.clipAction(walkClip);
      selectEl.disabled = false; // models loaded, enable selection
    });
  });

  /* Render loop */
  (function loop(){
    requestAnimationFrame(loop);
    if(rMixer) rMixer.update(rClock.getDelta());
    rend.render(rScene, rCam);
  })();

  window.addEventListener('resize', () => {
    rend.setSize(W(), H());
    const newAspect = W() / H();
    rCam.left = -newAspect * viewSize / 2;
    rCam.right = newAspect * viewSize / 2;
    rCam.updateProjectionMatrix();
  });

  /* ── Animation helpers ── */
  function playPush(){
    if(!rMixer) return;
    if(walkAction) walkAction.stop();
    if(pushAction){ pushAction.reset(); pushAction.play(); }
  }
  function playWalk(){
    if(!rMixer) return;
    if(pushAction) pushAction.stop();
    if(walkAction){ walkAction.reset(); walkAction.play(); }
  }

  /* ── Perfect Synchronization Logic ── */
  let charObj = { x: -30 };
  const handOffsetUnits = 2.4; // Increased for larger model scale
  const panelWidth = 760;

  function getPixelsPerUnit() {
    return H() / viewSize;
  }

  function updateRightSync() {
    if (!charModel) return;
    charModel.position.x = charObj.x;
    
    const ppu = getPixelsPerUnit();
    const charPx = charObj.x * ppu;
    const handPx = charPx + (handOffsetUnits * ppu);
    
    // Panel's absolute center is 0 (since it's inside left:50% container)
    // We want its LEFT edge to align with handPx.
    // So its center should be at handPx + panelWidth/2.
    const panelCenterX = handPx + (panelWidth / 2);
    panel.style.transform = `translate(calc(-50% + ${panelCenterX}px), -50%)`;
  }

  function updateLeftSync() {
    if (!charModel) return;
    charModel.position.x = charObj.x;
    
    const ppu = getPixelsPerUnit();
    const charPx = charObj.x * ppu;
    const handPx = charPx - (handOffsetUnits * ppu);
    
    // We want its RIGHT edge to align with handPx.
    // So its center should be at handPx - panelWidth/2.
    const panelCenterX = handPx - (panelWidth / 2);
    panel.style.transform = `translate(calc(-50% + ${panelCenterX}px), -50%)`;
  }

  let curIdx = -1;
  let animating = false;

  function seqPushIn(idx, onDone) {
    if(!charModel) { onDone && onDone(); return; }
    gsap.killTweensOf(charObj);
    selectEl.disabled = true; // Disable select during animation
    placeholder.style.display = 'none';
    panel.style.display = 'block';
    panel.innerHTML = buildMarksheet(idx);

    charModel.visible = true;
    charModel.rotation.y = 0; // face right
    playWalk();

    const ppu = getPixelsPerUnit();
    const targetCharX = (- (panelWidth / 2) - (handOffsetUnits * ppu)) / ppu;
    const pushStartX = targetCharX - 16;
    const walkStartX = pushStartX - 6;

    charObj.x = walkStartX;

    // Phase 1: Walk in (Panel follows hand)
    gsap.to(charObj, {
      x: pushStartX,
      duration: 1.5,
      ease: "power1.inOut",
      onUpdate: updateRightSync, // Synchronize panel position from the start
      onComplete: () => {
        // Phase 2: Push
        playPush();
        panel.classList.add('glow-pulse');
        
        gsap.to(charObj, {
          x: targetCharX,
          duration: 2.5,
          ease: "power2.out",
          onUpdate: updateRightSync,
          onComplete: () => {
            panel.classList.remove('glow-pulse');
            if(onDone) onDone(); // Enable select NOW, don't wait for character to exit
            
            // Phase 3: Walk slightly forward
            playWalk();
            gsap.to(charObj, {
              x: targetCharX + 2,
              duration: 1.0,
              ease: "power1.inOut",
              onUpdate: () => { charModel.position.x = charObj.x; },
              onComplete: () => {
                // Phase 4: Turn and exit
                charModel.rotation.y = Math.PI; // Face left
                gsap.to(charObj, {
                  x: -30,
                  duration: 2.5,
                  ease: "power1.inOut",
                  onUpdate: () => { charModel.position.x = charObj.x; },
                  onComplete: () => {
                    charModel.visible = false;
                    charModel.rotation.y = 0;
                  }
                });
              }
            });
          }
        });
      }
    });
  }

  function seqSwap(newIdx, onDone) {
    if(!charModel) { onDone && onDone(); return; }
    gsap.killTweensOf(charObj);
    selectEl.disabled = true; // Disable select during animation

    charModel.visible = true;
    charModel.rotation.y = Math.PI; // Face left
    playWalk();

    const ppu = getPixelsPerUnit();
    const attachX = ((panelWidth / 2) + (handOffsetUnits * ppu)) / ppu;
    const walkInStart = attachX + 16;
    const pushEndX = attachX - 35; // push far off left

    charObj.x = walkInStart;

    // Phase 1: Walk to center panel (Panel stays static until hand reaches it)
    gsap.to(charObj, {
      x: attachX,
      duration: 1.5,
      ease: "power1.inOut",
      onUpdate: () => { charModel.position.x = charObj.x; },
      onComplete: () => {
        // Phase 2: Push left
        playPush();
        panel.classList.add('glow-pulse');
        
        gsap.to(charObj, {
          x: pushEndX,
          duration: 2.5,
          ease: "power2.in",
          onUpdate: updateLeftSync,
          onComplete: () => {
            charModel.visible = false;
            panel.style.display = 'none';
            panel.classList.remove('glow-pulse');
            
            // Phase 3: Bring new panel in from left
            setTimeout(() => {
              seqPushIn(newIdx, onDone);
            }, 300);
          }
        });
      }
    });
  }

  selectEl.addEventListener('change', e => {
    if(animating) return;
    const newIdx = parseInt(e.target.value);
    animating = true;

    const finish = () => { 
      animating = false; 
      selectEl.disabled = false; // Re-enable select
    };

    if(curIdx === -1){
      seqPushIn(newIdx, finish);
    } else {
      seqSwap(newIdx, finish);
    }
    curIdx = newIdx;
  });

})();
