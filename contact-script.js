/* ── CONTACT GAME ENGINE ── */
(function () {
  'use strict';

  /* ─── DOM refs ─── */
  const initialView   = document.getElementById('contact-initial-view');
  const gameView      = document.getElementById('contact-game-view');
  const detailsView   = document.getElementById('contact-details-view');
  const btnPlay       = document.getElementById('btn-play-game');
  const btnSkip       = document.getElementById('btn-skip-game');
  const btnPlayAgain  = document.getElementById('btn-play-again');
  const btnGameClose  = document.getElementById('btn-game-close');   /* ✖ in-game close */
  const btnGameSkip   = document.getElementById('btn-game-skip');    /* ⏭ in-game skip  */
  const avatar        = document.getElementById('game-avatar');
  const arena         = document.getElementById('game-arena');
  const scoreEl       = document.getElementById('game-score-current');
  const scoreFill     = document.getElementById('game-score-bar-fill');
  const winMsg        = document.getElementById('game-win-msg');

  const TOTAL         = 5;
  let score           = 0;
  let moveTimer       = null;
  let running         = false;

  /* ─── STARS CANVAS ─── */
  const canvas = document.getElementById('contact-stars-canvas');
  const ctx    = canvas.getContext('2d');
  let stars    = [];

  function resizeCanvas() {
    canvas.width  = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  function initStars() {
    stars = [];
    for (let i = 0; i < 140; i++) {
      stars.push({
        x:   Math.random() * canvas.width,
        y:   Math.random() * canvas.height,
        r:   Math.random() * 1.4 + 0.3,
        a:   Math.random(),
        da:  (Math.random() * 0.006 + 0.002) * (Math.random() < 0.5 ? 1 : -1),
        vx:  (Math.random() - 0.5) * 0.15,
        vy:  (Math.random() - 0.5) * 0.15,
      });
    }
  }

  function animateStars() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    stars.forEach(s => {
      s.x += s.vx; s.y += s.vy; s.a += s.da;
      if (s.a <= 0 || s.a >= 1) s.da *= -1;
      if (s.x < 0) s.x = canvas.width;
      if (s.x > canvas.width) s.x = 0;
      if (s.y < 0) s.y = canvas.height;
      if (s.y > canvas.height) s.y = 0;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 255, 255, ${s.a * 0.7})`;
      ctx.fill();
    });
    requestAnimationFrame(animateStars);
  }

  resizeCanvas(); initStars(); animateStars();
  window.addEventListener('resize', () => { resizeCanvas(); initStars(); });

  /* ─── HELPERS ─── */
  function fadeIn(el, duration = 0.5, cb) {
    el.style.display = 'flex';
    el.style.opacity = '0';
    requestAnimationFrame(() => {
      el.style.transition = `opacity ${duration}s cubic-bezier(.4,0,.2,1)`;
      el.style.opacity    = '1';
      if (cb) setTimeout(cb, duration * 1000);
    });
  }

  function fadeOut(el, duration = 0.4, cb) {
    el.style.transition = `opacity ${duration}s cubic-bezier(.4,0,.2,1)`;
    el.style.opacity    = '0';
    setTimeout(() => { el.style.display = 'none'; if (cb) cb(); }, duration * 1000);
  }

  /* ─── UPDATE SCORE UI ─── */
  function updateScore() {
    scoreEl.textContent = score;
    const pct = (score / TOTAL) * 100;
    scoreFill.style.width = pct + '%';

    /* colour gradient on bar */
    if (pct < 40) {
      scoreFill.style.background = 'linear-gradient(90deg, #00ffff, #00bfff)';
    } else if (pct < 80) {
      scoreFill.style.background = 'linear-gradient(90deg, #00ffff, #a855f7)';
    } else {
      scoreFill.style.background = 'linear-gradient(90deg, #a855f7, #ec4899)';
    }
  }

  /* ─── AVATAR MOVEMENT ─── */
  function getRandomPos() {
    const arenaBounds = arena.getBoundingClientRect();
    const avatarSize  = avatar.offsetWidth || 110;
    const padding     = 20;
    const maxX = arenaBounds.width  - avatarSize - padding;
    const maxY = arenaBounds.height - avatarSize - padding;
    return {
      x: Math.floor(Math.random() * maxX + padding),
      y: Math.floor(Math.random() * maxY + padding),
    };
  }

  function moveAvatar(fast = false) {
    const { x, y }    = getRandomPos();
    const duration    = fast ? 0.28 : (0.55 + Math.random() * 0.35);

    avatar.style.transition = `left ${duration}s cubic-bezier(.68,-0.55,.27,1.55), top ${duration}s cubic-bezier(.68,-0.55,.27,1.55)`;
    avatar.style.left = x + 'px';
    avatar.style.top  = y + 'px';
  }

  function scheduleMoves() {
    if (!running) return;
    /* base interval shrinks as score grows → harder */
    const base    = 1400 - score * 180;
    const jitter  = Math.random() * 400;
    const delay   = Math.max(380, base + jitter);

    moveTimer = setTimeout(() => {
      moveAvatar();
      scheduleMoves();
    }, delay);
  }

  /* ─── CLICK POP FX ─── */
  function popAvatar() {
    avatar.classList.add('pop');
    avatar.addEventListener('animationend', () => avatar.classList.remove('pop'), { once: true });
  }

  function spawnParticle(x, y) {
    const colours = ['#00ffff', '#a855f7', '#ec4899', '#fbbf24', '#34d399'];
    for (let i = 0; i < 8; i++) {
      const p = document.createElement('div');
      p.className = 'click-particle';
      p.style.cssText = `
        left: ${x}px; top: ${y}px;
        background: ${colours[i % colours.length]};
        --vx: ${(Math.random() - 0.5) * 180}px;
        --vy: ${(Math.random() - 0.5) * 180}px;
      `;
      arena.appendChild(p);
      p.addEventListener('animationend', () => p.remove());
    }
  }

  /* ─── GAME WIN ─── */
  function handleWin() {
    running = false;
    clearTimeout(moveTimer);

    /* shrink & hide avatar */
    avatar.style.transition = 'transform 0.4s ease, opacity 0.4s ease';
    avatar.style.transform  = 'scale(0) rotate(360deg)';
    avatar.style.opacity    = '0';
    avatar.style.pointerEvents = 'none';

    /* show win message */
    setTimeout(() => {
      winMsg.classList.add('show');
      /* after 1.8s slide to contact view */
      setTimeout(() => {
        fadeOut(gameView, 0.4, () => {
          fadeIn(detailsView, 0.6);
          animateContactCards();
        });
      }, 1800);
    }, 450);
  }

  /* ─── ANIMATE CONTACT CARDS IN ─── */
  function animateContactCards() {
    const cards = detailsView.querySelectorAll('.contact-info-card');
    cards.forEach((card, i) => {
      card.style.opacity   = '0';
      card.style.transform = 'translateY(30px)';
      setTimeout(() => {
        card.style.transition = 'opacity 0.5s ease, transform 0.5s cubic-bezier(.2,.8,.2,1)';
        card.style.opacity    = '1';
        card.style.transform  = 'translateY(0)';
      }, 200 + i * 120);
    });

    // Show toggle button instead of form directly
    const toggleBtn = document.getElementById('btn-toggle-feedback');
    if (toggleBtn) {
      setTimeout(() => {
        fadeIn(toggleBtn, 0.5);
      }, 200 + cards.length * 120 + 200);
    }
  }

  /* ─── AVATAR CLICK ─── */
  avatar.addEventListener('click', (e) => {
    if (!running) return;
    score++;
    updateScore();
    popAvatar();

    /* particle burst at click point relative to arena */
    const rect = arena.getBoundingClientRect();
    spawnParticle(e.clientX - rect.left, e.clientY - rect.top);

    if (score >= TOTAL) {
      handleWin();
    } else {
      /* immediately jump to new spot */
      clearTimeout(moveTimer);
      moveAvatar(true);
      scheduleMoves();
    }
  });

  /* ─── START GAME ─── */
  function startGame() {
    score   = 0;
    running = true;
    updateScore();

    /* reset avatar */
    avatar.style.transform   = 'scale(1) rotate(0)';
    avatar.style.opacity     = '1';
    avatar.style.transition  = 'none';
    avatar.style.left        = '50%';
    avatar.style.top         = '50%';
    avatar.style.pointerEvents = 'auto';
    winMsg.classList.remove('show');

    fadeOut(initialView, 0.35, () => {
      fadeIn(gameView, 0.5, () => {
        /* place avatar in centre, then start moving */
        requestAnimationFrame(() => {
          moveAvatar();
          scheduleMoves();
        });
      });
    });
  }

  /* ─── STOP GAME (shared helper) ─── */
  function stopGame() {
    running = false;
    clearTimeout(moveTimer);
    avatar.style.pointerEvents = 'none';
  }

  /* ─── SKIP (initial prompt → contact info) ─── */
  function skipToContact() {
    fadeOut(initialView, 0.35, () => {
      fadeIn(detailsView, 0.6);
      animateContactCards();
    });
  }

  /* ─── CLOSE GAME ✖ (stop + exit to contact info) ─── */
  function closeGame() {
    stopGame();
    /* brief shake on close button for tactile feel */
    btnGameClose.classList.add('shake');
    btnGameClose.addEventListener('animationend', () => btnGameClose.classList.remove('shake'), { once: true });

    fadeOut(gameView, 0.4, () => {
      fadeIn(detailsView, 0.6);
      animateContactCards();
    });
  }

  /* ─── IN-GAME SKIP ⏭ (same as close, different UX signal) ─── */
  function inGameSkip() {
    stopGame();
    fadeOut(gameView, 0.35, () => {
      fadeIn(detailsView, 0.6);
      animateContactCards();
    });
  }

  /* ─── PLAY AGAIN ─── */
  function playAgain() {
    fadeOut(detailsView, 0.35, () => {
      startGame();
    });
  }

  /* ─── EVENT BINDINGS ─── */
  btnPlay.addEventListener('click',      startGame);
  btnSkip.addEventListener('click',      skipToContact);    /* initial prompt skip */
  btnPlayAgain.addEventListener('click', playAgain);
  btnGameClose.addEventListener('click', closeGame);        /* ✖ in-game close */
  btnGameSkip.addEventListener('click',  inGameSkip);       /* ⏭ in-game skip  */

  /* ─── FEEDBACK TOGGLE ─── */
  const btnToggleFeedback = document.getElementById('btn-toggle-feedback');
  const formWrap = document.getElementById('feedback-form-wrap');
  if (btnToggleFeedback && formWrap) {
    btnToggleFeedback.addEventListener('click', () => {
      // Hide button
      fadeOut(btnToggleFeedback, 0.3, () => {
        // Show form
        formWrap.style.display = 'block';
        // Give slight delay for display block to register before animating class
        requestAnimationFrame(() => {
          formWrap.classList.add('show');
        });
      });
    });
  }

  /* ─── FEEDBACK FORM SUBMIT ─── */
  const feedbackForm = document.getElementById('contact-feedback-form');
  const btnSubmitFeedback = document.getElementById('btn-submit-feedback');

  if (feedbackForm && btnSubmitFeedback) {
    feedbackForm.addEventListener('submit', (e) => {
      e.preventDefault();
      
      const btnText = btnSubmitFeedback.querySelector('.btn-text');
      
      // Simulate sending state
      btnText.innerHTML = 'Sending... <i class="fa-solid fa-spinner fa-spin"></i>';
      btnSubmitFeedback.style.pointerEvents = 'none';

      // Simulate network request delay
      setTimeout(() => {
        btnSubmitFeedback.classList.add('success');
        btnText.innerHTML = 'Message Sent ✅';
        
        // Optionally reset form after some time
        setTimeout(() => {
          feedbackForm.reset();
          btnSubmitFeedback.classList.remove('success');
          btnText.innerHTML = 'Send Message <i class="fa-regular fa-paper-plane"></i>';
          btnSubmitFeedback.style.pointerEvents = 'auto';
        }, 3000);
      }, 1500);
    });
  }

})();
