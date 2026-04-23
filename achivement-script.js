(() => {
  const section = document.getElementById('achievements');
  if (!section || !window.gsap) return;

  const gsap = window.gsap;
  if (window.ScrollTrigger) gsap.registerPlugin(window.ScrollTrigger);

  const cards = Array.from(section.querySelectorAll('.arc-card'));
  const modal = document.getElementById('reward-modal');
  const modalClose = modal?.querySelector('.arc-modal-close');

  // Entrance Animation: Bottom-up fade-in
  const animateEntrance = () => {
    gsap.fromTo('.arc-header', 
      { opacity: 0, y: 50 }, 
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    );

    gsap.fromTo(cards, 
      { opacity: 0, y: 100, scale: 0.8 },
      { 
        opacity: (i) => (i === 1 ? 1 : 0.75), // Center card is more opaque
        y: 0, 
        scale: (i) => (i === 1 ? 1.22 : 0.85), // Preserve the arc scale
        duration: 1.2, 
        stagger: 0.15, 
        ease: 'power4.out',
        delay: 0.3
      }
    );
  };

  ScrollTrigger.create({
    trigger: section,
    start: 'top 75%',
    once: true,
    onEnter: animateEntrance
  });

  // Modal Functionality
  function openModal(card) {
    if (!modal) return;
    
    const title = card.querySelector('.arc-card-title')?.textContent || '';
    const desc = card.querySelector('.arc-card-desc')?.textContent || '';
    const xp = card.querySelector('.arc-card-xp')?.textContent || '';
    const imgSrc = card.querySelector('img')?.src || '';

    const mTitle = modal.querySelector('.arc-modal-title');
    const mDesc = modal.querySelector('.arc-modal-desc');
    const mImg = modal.querySelector('.arc-modal-img-wrap');
    const mXP = modal.querySelector('#m-xp-val');

    if (mTitle) mTitle.textContent = title;
    if (mDesc) mDesc.textContent = desc;
    if (mXP) mXP.textContent = xp;
    if (mImg) {
      mImg.innerHTML = `<img src="${imgSrc}" alt="${title}">`;
    }

    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  cards.forEach(card => {
    card.addEventListener('click', () => openModal(card));
  });

  modalClose?.addEventListener('click', closeModal);
  modal?.querySelector('.arc-modal-backdrop')?.addEventListener('click', closeModal);
})();
