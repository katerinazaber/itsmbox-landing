(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Tabs ---------- */
  const tabs = [...document.querySelectorAll('.tab')];
  const activateTab = (tab, focus) => {
    tabs.forEach(t => {
      const on = t === tab;
      t.classList.toggle('is-active', on);
      t.setAttribute('aria-selected', on ? 'true' : 'false');
      t.tabIndex = on ? 0 : -1;
      const p = document.getElementById(t.getAttribute('aria-controls'));
      p.hidden = !on;
      p.classList.toggle('is-active', on);
    });
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => activateTab(t));
    t.addEventListener('keydown', e => {
      let n = null;
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') n = tabs[(i + 1) % tabs.length];
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') n = tabs[(i - 1 + tabs.length) % tabs.length];
      if (e.key === 'Home') n = tabs[0];
      if (e.key === 'End') n = tabs[tabs.length - 1];
      if (n) { e.preventDefault(); activateTab(n, true); }
    });
  });

  /* ---------- Functions -> screenshot ---------- */
  document.querySelectorAll('.panel').forEach(panel => {
    const fns = [...panel.querySelectorAll('.fn')];
    const img = panel.querySelector('.shot img');
    const label = panel.querySelector('.shot__label');
    fns.forEach(fn => fn.addEventListener('click', () => {
      fns.forEach(f => { f.classList.toggle('is-active', f === fn); f.setAttribute('aria-expanded', f === fn ? 'true' : 'false'); });
      const name = fn.querySelector('.fn__t').textContent;
      label.textContent = name;
      const src = `assets/img/${fn.dataset.shot}.webp`;
      img.alt = `Скриншот ITSMBox: ${name}`;
      if (img.getAttribute('src') === src) return;
      img.classList.add('is-swapping');
      const pre = new Image();
      pre.onload = () => { img.src = src; requestAnimationFrame(() => img.classList.remove('is-swapping')); };
      pre.src = src;
    }));
    const first = fns[0];
    if (first) img.alt = `Скриншот ITSMBox: ${first.querySelector('.fn__t').textContent}`;
  });

  /* ---------- Reveal ---------- */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (en.isIntersecting) {
          const el = en.target;
          const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
          el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 4) * 80}ms`;
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(r => io.observe(r));
  } else reveals.forEach(r => r.classList.add('is-in'));

  /* ---------- Count up ---------- */
  const fmt = n => n.toLocaleString('ru-RU').replace(/\u00a0/g, ' ');
  const counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduce) {
    const co = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target, target = +el.dataset.count, t0 = performance.now(), dur = 1400;
        const step = t => {
          const p = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - p, 3);
          el.textContent = fmt(Math.round(target * e));
          if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
        co.unobserve(el);
      });
    }, { threshold: 0.4 });
    counters.forEach(c => co.observe(c));
  }

  /* ---------- Dock ---------- */
  const dock = document.querySelector('.dock');
  const hero = document.querySelector('.hero');
  const formSec = document.getElementById('form');
  const dockLinks = [...dock.querySelectorAll('a:not(.dock__cta)')];
  const secs = dockLinks.map(a => document.querySelector(a.getAttribute('href')));
  const onScroll = () => {
    const heroEnd = hero.getBoundingClientRect().bottom;
    const formTop = formSec.getBoundingClientRect().top;
    dock.classList.toggle('is-visible', heroEnd < 0 && formTop > window.innerHeight * 0.6);
    let cur = -1;
    secs.forEach((s, i) => { if (s.getBoundingClientRect().top < window.innerHeight * 0.4) cur = i; });
    dockLinks.forEach((a, i) => a.classList.toggle('is-current', i === cur));
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- Interest preselect ---------- */
  document.querySelectorAll('[data-interest]').forEach(a => a.addEventListener('click', () => {
    const r = document.querySelector(`.form input[name="interest"][value="${a.dataset.interest}"]`);
    if (r) r.checked = true;
  }));

  /* ---------- Forms ---------- */
  document.querySelectorAll('.form').forEach(form => {
    const msg = form.querySelector('.form__msg');
    const okText = form.dataset.ok || 'Спасибо! Заявка принята, мы свяжемся с вами в течение рабочего дня.';
    form.addEventListener('submit', e => {
      e.preventDefault();
      let ok = true;
      form.querySelectorAll('.field').forEach(f => {
        const inp = f.querySelector('input[required]');
        if (!inp) return;
        const bad = !inp.value.trim() || (inp.type === 'email' && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inp.value));
        f.classList.toggle('is-error', bad);
        if (bad) ok = false;
      });
      const c = form.querySelector('.consent');
      const cBad = !c.querySelector('input').checked;
      c.classList.toggle('is-error', cBad);
      if (cBad) ok = false;
      msg.className = 'form__msg ' + (ok ? 'ok' : 'err');
      msg.textContent = ok ? okText : 'Проверьте выделенные поля и согласие на обработку данных.';
      if (ok) form.querySelectorAll('input:not([type=radio]):not([type=checkbox]),textarea').forEach(i => i.value = '');
    });
    form.addEventListener('input', e => { const f = e.target.closest('.field'); if (f) f.classList.remove('is-error'); });
  });

})();
