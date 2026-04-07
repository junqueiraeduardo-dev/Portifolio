/* ════════════════════════════════════════════════════════════════
   NEXUS STUDIO — script.js
   ════════════════════════════════════════════════════════════════ */

'use strict';

/* ══ 1. NAVIGATION ══ */
(function initNav() {
  const nav    = document.getElementById('nav');
  const burger = document.getElementById('burger');
  const menu   = document.getElementById('mobileMenu');
  const links  = document.querySelectorAll('.mobile-link');

  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  function toggleMenu() {
    const isOpen = menu.classList.toggle('open');
    document.body.style.overflow = isOpen ? 'hidden' : '';
    burger.setAttribute('aria-expanded', isOpen);
  }

  burger.addEventListener('click', toggleMenu);
  links.forEach(l => l.addEventListener('click', toggleMenu));
})();


/* ══ 2. SCROLL REVEAL ══ */
(function initReveal() {
  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

  document.querySelectorAll('.reveal').forEach(el => io.observe(el));
})();


/* ══ 3. PROJECT FILTERS ══ */
(function initFilters() {
  const btns  = document.querySelectorAll('.filter-btn');
  const cards = document.querySelectorAll('.project-card');

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.dataset.filter;

      cards.forEach(card => {
        const cat = card.dataset.category;
        const show = filter === 'all' || cat === filter;

        card.style.transition = 'opacity 0.35s ease, transform 0.35s ease';

        if (show) {
          card.style.opacity   = '1';
          card.style.transform = 'scale(1)';
          card.style.pointerEvents = 'all';
        } else {
          card.style.opacity   = '0.2';
          card.style.transform = 'scale(0.97)';
          card.style.pointerEvents = 'none';
        }
      });
    });
  });
})();


/* ══ 4. TESTIMONIAL SLIDER ══ */
(function initSlider() {
  const track   = document.getElementById('testimonialsTrack');
  const dotsEl  = document.getElementById('tDots');
  const prevBtn = document.getElementById('tPrev');
  const nextBtn = document.getElementById('tNext');

  const cards = Array.from(track.querySelectorAll('.tcard'));
  const total = cards.length;
  let current = 0;
  let auto;
  const GAP = 24;

  function getVisible() {
    if (window.innerWidth <= 768)  return 1;
    if (window.innerWidth <= 1024) return 2;
    return 3;
  }

  /* max index so the last card is always fully visible */
  function maxIdx() { return total - getVisible(); }

  /* number of stop positions = total - visible + 1 */
  function numDots() { return maxIdx() + 1; }

  function buildDots() {
    dotsEl.innerHTML = '';
    for (let i = 0; i < numDots(); i++) {
      const d = document.createElement('button');
      d.className = 'tdot' + (i === 0 ? ' active' : '');
      d.setAttribute('aria-label', `Posição ${i + 1}`);
      d.addEventListener('click', () => { goTo(i); resetAuto(); });
      dotsEl.appendChild(d);
    }
  }

  function goTo(idx) {
    /* clamp between 0 and maxIdx */
    current = Math.max(0, Math.min(idx, maxIdx()));

    /* measure actual card pixel width from the DOM */
    const cardW = cards[0].offsetWidth;
    const offset = current * (cardW + GAP);
    track.style.transform = `translateX(-${offset}px)`;

    document.querySelectorAll('.tdot').forEach((d, i) => {
      d.classList.toggle('active', i === current);
    });
  }

  function next() { goTo(current >= maxIdx() ? 0 : current + 1); }
  function prev() { goTo(current <= 0 ? maxIdx() : current - 1); }

  function startAuto() { auto = setInterval(next, 5000); }
  function resetAuto()  { clearInterval(auto); startAuto(); }

  buildDots();
  goTo(0);
  startAuto();

  nextBtn.addEventListener('click', () => { next(); resetAuto(); });
  prevBtn.addEventListener('click', () => { prev(); resetAuto(); });

  /* touch/swipe */
  let touchX = 0;
  track.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
  track.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) { dx < 0 ? next() : prev(); resetAuto(); }
  }, { passive: true });

  /* pause on hover */
  track.addEventListener('mouseenter', () => clearInterval(auto));
  track.addEventListener('mouseleave', startAuto);

  window.addEventListener('resize', () => {
    buildDots();
    goTo(Math.min(current, maxIdx()));
  }, { passive: true });
})();


/* ══ 8. CONTACT FORM ══ */
(function initForm() {
  const form       = document.getElementById('contactForm');
  const submitBtn  = document.getElementById('submitBtn');
  const submitText = document.getElementById('submitText');
  const success    = document.getElementById('formSuccess');

  function validate(id, errId, condition, msg) {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    if (!condition(el.value.trim())) {
      el.classList.add('error');
      err.textContent = msg;
      return false;
    }
    el.classList.remove('error');
    err.textContent = '';
    return true;
  }

  function clearErr(id, errId) {
    const el  = document.getElementById(id);
    const err = document.getElementById(errId);
    el.addEventListener('input', () => {
      el.classList.remove('error');
      err.textContent = '';
    }, { once: false });
  }

  clearErr('name',    'nameError');
  clearErr('email',   'emailError');
  clearErr('message', 'messageError');

  form.addEventListener('submit', e => {
    e.preventDefault();

    const validName  = validate('name', 'nameError', v => v.length >= 2, 'Informe seu nome completo.');
    const validEmail = validate('email', 'emailError', v => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v), 'Informe um e-mail válido.');
    const validMsg   = validate('message', 'messageError', v => v.length >= 10, 'Mensagem muito curta (mín. 10 caracteres).');

    if (!validName || !validEmail || !validMsg) return;

    /* Simulate async send */
    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';

    setTimeout(() => {
      success.classList.add('visible');
      submitBtn.disabled = false;
      submitText.textContent = 'Enviar mensagem';
      form.reset();
    }, 1800);
  });
})();


/* ══ 9. SMOOTH ACTIVE NAV LINK ══ */
(function initActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const links    = document.querySelectorAll('.nav__link:not(.mobile-link)');

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        links.forEach(l => l.classList.remove('active'));
        const active = document.querySelector(`.nav__link[href="#${e.target.id}"]`);
        if (active) active.classList.add('active');
      }
    });
  }, { threshold: 0.4, rootMargin: '-80px 0px 0px 0px' });

  sections.forEach(s => io.observe(s));
})();


/* ══ 10. CURSOR GLOW ══ */
(function initCursorGlow() {
  if (window.matchMedia('(pointer: coarse)').matches) return;

  const glow = document.createElement('div');
  Object.assign(glow.style, {
    position:      'fixed',
    pointerEvents: 'none',
    zIndex:        '9999',
    width:         '300px',
    height:        '300px',
    borderRadius:  '50%',
    background:    'radial-gradient(circle, rgba(124,58,237,0.08) 0%, transparent 70%)',
    transform:     'translate(-50%, -50%)',
    transition:    'opacity 0.3s ease',
    top:           '-999px',
    left:          '-999px',
  });
  document.body.appendChild(glow);

  let mx = 0, my = 0, gx = 0, gy = 0;

  window.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; }, { passive: true });

  function loop() {
    gx += (mx - gx) * 0.12;
    gy += (my - gy) * 0.12;
    glow.style.left = `${gx}px`;
    glow.style.top  = `${gy}px`;
    requestAnimationFrame(loop);
  }

  loop();

  document.addEventListener('mouseenter', () => { glow.style.opacity = '1'; });
  document.addEventListener('mouseleave', () => { glow.style.opacity = '0'; });
})();
