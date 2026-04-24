/* ════════════════════════════════════════════════════════════════
   NEXUS STUDIO — script.js
   ════════════════════════════════════════════════════════════════ */

'use strict';


/* ══ 0. INTRO ══ */
(function initIntro() {
  const intro = document.getElementById('intro');
  if (!intro) return;
  document.body.style.overflow = 'hidden';

  function dismiss() {
    intro.classList.add('exit');
    intro.addEventListener('transitionend', () => {
      intro.remove();
      document.body.style.overflow = '';
    }, { once: true });
  }

  // Last letter at ~2.02s + 0.55s anim + 0.6s hold before exit
  setTimeout(dismiss, 3200);
  intro.addEventListener('click', dismiss, { once: true });
})();


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


/* ══ 2. ROTATING TEXT ══ */
(function initRotatingText() {
  const el = document.getElementById('rotatingText');
  if (!el) return;

  const texts       = ['Front-end', 'UI/UX', 'Web Apps', 'Interfaces'];
  const INTERVAL    = 2500;
  const STAGGER_IN  = 30;
  const STAGGER_OUT = 18;
  let idx  = 0;
  let busy = false;

  function buildDOM(text, cls, stagger) {
    const words = text.split(' ');
    const frag  = document.createDocumentFragment();
    const total = [...text.replace(/ /g, '')].length;
    let pos = 0;

    words.forEach((word, wi) => {
      const wSpan = document.createElement('span');
      wSpan.className = 'rt-word';
      ;[...word].forEach((c, ci) => {
        const s = document.createElement('span');
        s.className = `rt-char ${cls}`;
        s.textContent = c;
        s.style.animationDelay = `${(total - 1 - (pos + ci)) * stagger}ms`;
        wSpan.appendChild(s);
      });
      pos += word.length;
      frag.appendChild(wSpan);
      if (wi < words.length - 1) {
        const sp = document.createElement('span');
        sp.className = 'rt-space';
        frag.appendChild(sp);
      }
    });
    return frag;
  }

  function render(text) {
    el.innerHTML = '';
    el.appendChild(buildDOM(text, 'rt-char--in', STAGGER_IN));
  }

  function rotate() {
    if (busy) return;
    busy = true;
    const chars = Array.from(el.querySelectorAll('.rt-char'));
    chars.forEach((c, i) => {
      c.classList.remove('rt-char--in');
      c.style.animationDelay = `${(chars.length - 1 - i) * STAGGER_OUT}ms`;
      c.classList.add('rt-char--out');
    });
    setTimeout(() => {
      idx = (idx + 1) % texts.length;
      render(texts[idx]);
      busy = false;
    }, chars.length * STAGGER_OUT + 260);
  }

  render(texts[idx]);
  setInterval(rotate, INTERVAL);
})();


/* ══ 3. SCROLL REVEAL ══ */
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

  if (!track) return;

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

    submitBtn.disabled = true;
    submitText.textContent = 'Enviando...';

    fetch('https://api.web3forms.com/submit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(Object.fromEntries(new FormData(form)))
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          success.classList.add('visible');
          form.reset();
        } else {
          submitText.textContent = 'Erro ao enviar. Tente novamente.';
          submitBtn.disabled = false;
        }
      })
      .catch(() => {
        submitText.textContent = 'Erro ao enviar. Tente novamente.';
        submitBtn.disabled = false;
      })
      .finally(() => {
        submitText.textContent = 'Enviar mensagem';
      });
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
    background:    'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)',
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


/* ══ 11. SIDE STAGGER NAV ══ */
(function initSideNav() {
  const overlay = document.getElementById('snOverlay');
  const trigger = document.getElementById('snTrigger');
  if (!overlay || !trigger) return;

  let isOpen = false;
  let closeTimer = null;

  function open() {
    clearTimeout(closeTimer);
    overlay.classList.remove('closing');
    overlay.classList.add('open');
    trigger.classList.add('open');
    trigger.setAttribute('aria-expanded', 'true');
    overlay.removeAttribute('aria-hidden');
    isOpen = true;
  }

  function close() {
    if (!isOpen) return;
    isOpen = false;
    overlay.classList.add('closing');
    trigger.classList.remove('open');
    trigger.setAttribute('aria-expanded', 'false');
    overlay.setAttribute('aria-hidden', 'true');
    closeTimer = setTimeout(() => {
      overlay.classList.remove('open', 'closing');
    }, 500);
  }

  trigger.addEventListener('click', e => {
    e.stopPropagation();
    isOpen ? close() : open();
  });

  overlay.querySelectorAll('.sn-item').forEach(a => {
    a.addEventListener('click', () => close());
  });

  document.getElementById('snBg').addEventListener('click', () => close());

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
})();


/* ══ 12. SCROLL FLOAT ══ */
(function initScrollFloat() {
  const targets = document.querySelectorAll('.scroll-float');
  if (!targets.length) return;

  function splitWords(el) {
    const nodes = Array.from(el.childNodes);
    el.innerHTML = '';
    let idx = 0;

    nodes.forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
        node.textContent.split(/(\s+)/).forEach(part => {
          if (/^\s+$/.test(part)) {
            el.appendChild(document.createTextNode(part));
          } else if (part) {
            const s = document.createElement('span');
            s.className = 'sf-word';
            s.style.setProperty('--sf-i', idx++);
            s.textContent = part;
            el.appendChild(s);
          }
        });
      } else if (node.nodeName === 'BR') {
        el.appendChild(node.cloneNode());
      } else if (node.nodeType === Node.ELEMENT_NODE) {
        node.classList.add('sf-word');
        node.style.setProperty('--sf-i', idx++);
        el.appendChild(node);
      }
    });

    el.setAttribute('data-sf', '1');
  }

  targets.forEach(splitWords);

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('sf-visible');
        io.unobserve(e.target);
      }
    });
  }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => io.observe(el));
})();


/* ══ 12. PROFILE CARD ══ */
(function initProfileCard() {
  const wrap  = document.getElementById('profileCard');
  const shell = document.getElementById('profileCardShell');
  const card  = shell && shell.querySelector('.pc-card');
  if (!wrap || !shell || !card) return;

  const clamp  = (v, mn = 0, mx = 100) => Math.min(Math.max(v, mn), mx);
  const round  = (v, p = 3) => parseFloat(v.toFixed(p));
  const adjust = (v, fMin, fMax, tMin, tMax) => round(tMin + ((tMax - tMin) * (v - fMin)) / (fMax - fMin));

  let rafId = null, running = false, lastTs = 0;
  let curX = 0, curY = 0, tgtX = 0, tgtY = 0;
  let initialUntil = 0;
  const TAU = 0.14, TAU_INIT = 0.6;

  function setVars(x, y) {
    const W = shell.clientWidth  || 1;
    const H = shell.clientHeight || 1;
    const px = clamp((100 / W) * x);
    const py = clamp((100 / H) * y);
    const cx = px - 50, cy = py - 50;
    const props = {
      '--pointer-x':          `${px}%`,
      '--pointer-y':          `${py}%`,
      '--background-x':       `${adjust(px, 0, 100, 35, 65)}%`,
      '--background-y':       `${adjust(py, 0, 100, 35, 65)}%`,
      '--pointer-from-center': `${clamp(Math.hypot(py - 50, px - 50) / 50, 0, 1)}`,
      '--pointer-from-top':   `${py / 100}`,
      '--pointer-from-left':  `${px / 100}`,
      '--rotate-x':           `${round(-(cx / 5))}deg`,
      '--rotate-y':           `${round(cy / 4)}deg`,
    };
    for (const [k, v] of Object.entries(props)) wrap.style.setProperty(k, v);
  }

  function step(ts) {
    if (!running) return;
    if (lastTs === 0) lastTs = ts;
    const dt = (ts - lastTs) / 1000;
    lastTs = ts;
    const tau = ts < initialUntil ? TAU_INIT : TAU;
    const k = 1 - Math.exp(-dt / tau);
    curX += (tgtX - curX) * k;
    curY += (tgtY - curY) * k;
    setVars(curX, curY);
    const far = Math.abs(tgtX - curX) > 0.05 || Math.abs(tgtY - curY) > 0.05;
    if (far || document.hasFocus()) {
      rafId = requestAnimationFrame(step);
    } else {
      running = false; lastTs = 0;
      cancelAnimationFrame(rafId); rafId = null;
    }
  }

  function startLoop() {
    if (running) return;
    running = true; lastTs = 0;
    rafId = requestAnimationFrame(step);
  }

  function toCenter() {
    tgtX = shell.clientWidth  / 2;
    tgtY = shell.clientHeight / 2;
    startLoop();
  }

  let enterTimer = null, leaveRaf = null;

  shell.addEventListener('pointerenter', e => {
    const r = shell.getBoundingClientRect();
    tgtX = e.clientX - r.left;
    tgtY = e.clientY - r.top;
    shell.classList.add('active', 'entering');
    if (enterTimer) clearTimeout(enterTimer);
    enterTimer = setTimeout(() => shell.classList.remove('entering'), 180);
    card.classList.add('active');
    wrap.classList.add('active');
    startLoop();
  });

  shell.addEventListener('pointermove', e => {
    const r = shell.getBoundingClientRect();
    tgtX = e.clientX - r.left;
    tgtY = e.clientY - r.top;
    startLoop();
  });

  shell.addEventListener('pointerleave', () => {
    toCenter();
    const check = () => {
      if (Math.hypot(tgtX - curX, tgtY - curY) < 0.6) {
        shell.classList.remove('active');
        card.classList.remove('active');
        wrap.classList.remove('active');
        leaveRaf = null;
      } else {
        leaveRaf = requestAnimationFrame(check);
      }
    };
    if (leaveRaf) cancelAnimationFrame(leaveRaf);
    leaveRaf = requestAnimationFrame(check);
  });

  /* boot animation */
  curX = shell.clientWidth - 70;
  curY = 60;
  setVars(curX, curY);
  toCenter();
  initialUntil = performance.now() + 1200;
  startLoop();
})();


/* ══ 13. CARD SWAP ══ */
(function initCardSwap() {
  const container = document.getElementById('cardSwap');
  if (!container || typeof gsap === 'undefined') return;

  const cards   = Array.from(container.querySelectorAll('.cs-card'));
  const total   = cards.length;

  const mobile          = window.innerWidth <= 480;
  const cardDistance    = mobile ? 20 : 44;
  const verticalDistance = mobile ? 24 : 52;
  const delay           = 4000;
  const skewAmount      = 4;

  const cfg = {
    ease:           'elastic.out(0.6,0.9)',
    durDrop:        2,
    durMove:        2,
    durReturn:      2,
    promoteOverlap: 0.9,
    returnDelay:    0.05,
  };

  const makeSlot = (i) => ({
    x:      i * cardDistance,
    y:     -i * verticalDistance,
    z:     -i * cardDistance * 1.5,
    zIndex: total - i,
  });

  cards.forEach((card, i) => {
    const s = makeSlot(i);
    gsap.set(card, {
      x: s.x, y: s.y, z: s.z,
      xPercent: -50, yPercent: -50,
      skewY: skewAmount,
      transformOrigin: 'center center',
      zIndex: s.zIndex,
      force3D: true,
    });
  });

  const order = cards.map((_, i) => i);
  let isAnimating = false;

  function swap() {
    if (isAnimating || order.length < 2) return;
    isAnimating = true;

    const [front, ...rest] = order;
    const elFront = cards[front];
    const tl = gsap.timeline();

    tl.to(elFront, { y: '+=500', duration: cfg.durDrop, ease: cfg.ease });

    tl.addLabel('promote', `-=${cfg.durDrop * cfg.promoteOverlap}`);
    rest.forEach((idx, i) => {
      const s = makeSlot(i);
      tl.set(cards[idx], { zIndex: s.zIndex }, 'promote');
      tl.to(cards[idx], {
        x: s.x, y: s.y, z: s.z,
        duration: cfg.durMove,
        ease: cfg.ease,
      }, `promote+=${i * 0.15}`);
    });

    const backSlot = makeSlot(total - 1);
    tl.addLabel('return', `promote+=${cfg.durMove * cfg.returnDelay}`);
    tl.call(() => gsap.set(elFront, { zIndex: backSlot.zIndex }), undefined, 'return');
    tl.to(elFront, {
      x: backSlot.x, y: backSlot.y, z: backSlot.z,
      duration: cfg.durReturn,
      ease: cfg.ease,
    }, 'return');

    tl.call(() => {
      order.splice(0, order.length, ...rest, front);
      isAnimating = false;
    });
  }

  swap();
  let timer = setInterval(swap, delay);

  container.addEventListener('click', () => {
    if (isAnimating) return;
    clearInterval(timer);
    swap();
    timer = setInterval(swap, delay);
  });
})();

/* ══ 14. CLICKER GAME — Simulador de Programador ══ */
(function initClickerGame() {
  const clickBtn = document.getElementById('clickBtn');
  if (!clickBtn) return;

  const STORAGE_KEY = 'nexus.clicker.v1';
  // auto-save removed — user saves manually via button
  const TICK_HZ = 10;
  const OFFLINE_CAP_SEC = 4 * 60 * 60;
  const OFFLINE_EFFICIENCY = 0.5;

  const upgrades = {
    coffee:   { baseCost: 15,      baseRate: 0.5,  growth: 1.15, name: 'Café' },
    keyboard: { baseCost: 100,     baseRate: 3,    growth: 1.15, name: 'Teclado mecânico' },
    cloud:    { baseCost: 1100,    baseRate: 25,   growth: 1.15, name: 'Servidor na nuvem' },
    startup:  { baseCost: 12000,   baseRate: 120,  growth: 1.15, name: 'Startup' },
    employee: { baseCost: 130000,  baseRate: 800,  growth: 1.15, name: 'Funcionários' },
    contract: { baseCost: 1500000, baseRate: 6000, growth: 1.15, name: 'Contrato corporativo' },
  };

  const UPGRADE_KEYS = Object.keys(upgrades);

  const state = {
    loc: 0,
    totalClicks: 0,
    counts: Object.fromEntries(UPGRADE_KEYS.map(k => [k, 0])),
    lastSave: Date.now(),
  };

  const els = {
    loc: document.getElementById('locCount'),
    lps: document.getElementById('lpsCount'),
    clicks: document.getElementById('totalClicks'),
    reset: document.getElementById('resetBtn'),
    save: document.getElementById('saveBtn'),
    upgrades: document.querySelectorAll('[data-buy]'),
    costs:  Object.fromEntries(UPGRADE_KEYS.map(k => [k, document.querySelector(`[data-cost="${k}"]`)])),
    counts: Object.fromEntries(UPGRADE_KEYS.map(k => [k, document.querySelector(`[data-count="${k}"]`)])),
  };

  function formatNum(n, decimals) {
    if (n < 1000) {
      if (decimals && n > 0 && n < 100) return n.toFixed(1).replace(/\.0$/, '');
      return Math.floor(n).toString();
    }
    if (n < 1e6)  return (n / 1e3).toFixed(n < 1e4 ? 2 : 1).replace(/\.?0+$/, '') + 'K';
    if (n < 1e9)  return (n / 1e6).toFixed(n < 1e7 ? 2 : 1).replace(/\.?0+$/, '') + 'M';
    if (n < 1e12) return (n / 1e9).toFixed(2).replace(/\.?0+$/, '') + 'B';
    return (n / 1e12).toFixed(2).replace(/\.?0+$/, '') + 'T';
  }

  function costOf(key) {
    const cfg = upgrades[key];
    return Math.ceil(cfg.baseCost * Math.pow(cfg.growth, state.counts[key]));
  }

  function lps() {
    let total = 0;
    for (const key in upgrades) total += upgrades[key].baseRate * state.counts[key];
    return total;
  }

  function load() {
    let raw;
    try { raw = localStorage.getItem(STORAGE_KEY); } catch (e) { return; }
    if (!raw) return;
    let data;
    try { data = JSON.parse(raw); } catch (e) { return; }
    if (!data || typeof data !== 'object') return;

    state.loc = Number(data.loc) || 0;
    state.totalClicks = Number(data.totalClicks) || 0;
    UPGRADE_KEYS.forEach(k => { state.counts[k] = Number(data.counts?.[k]) || 0; });
    state.lastSave = Number(data.lastSave) || Date.now();

    const elapsedSec = Math.max(0, Math.min(OFFLINE_CAP_SEC, (Date.now() - state.lastSave) / 1000));
    const offlineGain = lps() * elapsedSec * OFFLINE_EFFICIENCY;
    if (offlineGain >= 1 && elapsedSec >= 30) {
      state.loc += offlineGain;
      const mins = Math.floor(elapsedSec / 60);
      const timeStr = mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}min` : `${mins} min`;
      showToast(`Bem-vindo de volta! Seus bots escreveram <strong>${formatNum(offlineGain)}</strong> linhas em ${timeStr}.`);
    }
  }

  function save() {
    state.lastSave = Date.now();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({
        loc: state.loc,
        totalClicks: state.totalClicks,
        counts: state.counts,
        lastSave: state.lastSave,
      }));
    } catch (e) { /* quota / disabled — silent */ }
  }

  function showToast(html) {
    let toast = document.querySelector('.game__toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.className = 'game__toast';
      toast.setAttribute('role', 'status');
      document.body.appendChild(toast);
    }
    toast.innerHTML = html;
    requestAnimationFrame(() => toast.classList.add('show'));
    clearTimeout(toast._t);
    toast._t = setTimeout(() => toast.classList.remove('show'), 6000);
  }

  function spawnFloat(text) {
    const rect = clickBtn.getBoundingClientRect();
    const f = document.createElement('span');
    f.className = 'game__float';
    f.textContent = text;
    f.style.position = 'fixed';
    f.style.left = (rect.left + rect.width / 2 + (Math.random() * 40 - 20)) + 'px';
    f.style.top = (rect.top + rect.height / 3) + 'px';
    f.style.pointerEvents = 'none';
    f.style.zIndex = 9998;
    document.body.appendChild(f);
    setTimeout(() => f.remove(), 1100);
  }

  function buy(key) {
    const cost = costOf(key);
    if (state.loc < cost) return;
    state.loc -= cost;
    state.counts[key] += 1;
    render();
  }

  function click() {
    state.loc += 1;
    state.totalClicks += 1;
    spawnFloat('+1');
    if (els.loc) {
      els.loc.classList.remove('bump');
      void els.loc.offsetWidth;
      els.loc.classList.add('bump');
    }
    clickBtn.classList.add('pressed');
    setTimeout(() => clickBtn.classList.remove('pressed'), 120);
    render();
  }

  function render() {
    if (els.loc) els.loc.textContent = formatNum(state.loc);
    if (els.lps) els.lps.textContent = formatNum(lps(), true);
    if (els.clicks) els.clicks.textContent = formatNum(state.totalClicks);
    els.upgrades.forEach((btn) => {
      const key = btn.dataset.buy;
      const cost = costOf(key);
      const can = state.loc >= cost;
      btn.disabled = !can;
      btn.classList.toggle('affordable', can);
      if (els.costs[key]) els.costs[key].textContent = formatNum(cost);
      if (els.counts[key]) els.counts[key].textContent = state.counts[key];
    });
  }

  function tick() {
    const gain = lps() / TICK_HZ;
    if (gain > 0) {
      state.loc += gain;
      render();
    }
  }

  clickBtn.addEventListener('click', click);

  els.upgrades.forEach((btn) => {
    btn.addEventListener('click', () => buy(btn.dataset.buy));
  });

  if (els.reset) {
    els.reset.addEventListener('click', () => {
      if (!confirm('Resetar todo o progresso? Isso não pode ser desfeito.')) return;
      state.loc = 0;
      state.totalClicks = 0;
      state.counts = { coffee: 0, keyboard: 0, cloud: 0 };
      try { localStorage.removeItem(STORAGE_KEY); } catch (e) {}
      render();
    });
  }

  if (els.save) {
    els.save.addEventListener('click', () => {
      save();
      els.save.classList.add('saved');
      const orig = els.save.innerHTML;
      els.save.innerHTML = '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" aria-hidden="true"><polyline points="20 6 9 17 4 12"/></svg> Salvo!';
      clearTimeout(els.save._t);
      els.save._t = setTimeout(() => {
        els.save.classList.remove('saved');
        els.save.innerHTML = orig;
      }, 1800);
    });
  }

  load();
  render();
  setInterval(tick, 1000 / TICK_HZ);
})();

/* ══ 15. BACK TO TOP ══ */
(function initBackToTop() {
  const btn = document.getElementById('bttBtn');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('btt--visible', window.scrollY > 400);
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();

