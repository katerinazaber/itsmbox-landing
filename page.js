/* Process pages (ITIL practice pages): reveal, steps switcher, TOC highlight, form */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Reveal */
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && !reduce) {
    const io = new IntersectionObserver(entries => {
      entries.forEach(en => {
        if (!en.isIntersecting) return;
        const el = en.target;
        const sibs = [...el.parentElement.children].filter(c => c.classList.contains('reveal'));
        el.style.transitionDelay = `${Math.min(sibs.indexOf(el), 4) * 80}ms`;
        el.classList.add('is-in');
        io.unobserve(el);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
    reveals.forEach(r => io.observe(r));
  } else reveals.forEach(r => r.classList.add('is-in'));

  /* Steps -> screenshot */
  document.querySelectorAll('[data-steps]').forEach(box => {
    const img = box.querySelector('.steps__shot img');
    const label = box.querySelector('.shot__label');
    const steps = [...box.querySelectorAll('.step')];
    steps.forEach(st => st.addEventListener('click', () => {
      steps.forEach(s => { const on = s === st; s.classList.toggle('is-active', on); s.setAttribute('aria-expanded', on); });
      const src = `../assets/img/${st.dataset.shot}.webp`;
      if (img.getAttribute('src') === src) return;
      img.classList.add('is-swapping');
      setTimeout(() => {
        img.src = src;
        img.alt = `Скриншот ITSMBox: ${st.dataset.label}`;
        label.textContent = st.dataset.label;
        img.onload = () => img.classList.remove('is-swapping');
        setTimeout(() => img.classList.remove('is-swapping'), 400);
      }, reduce ? 0 : 180);
    }));
  });

  /* TOC highlight */
  const tocLinks = [...document.querySelectorAll('.toc a')];
  const targets = tocLinks.map(a => document.querySelector(a.getAttribute('href'))).filter(Boolean);
  const onScroll = () => {
    let cur = -1;
    targets.forEach((t, i) => { if (t.getBoundingClientRect().top < window.innerHeight * 0.3) cur = i; });
    tocLinks.forEach((a, i) => a.classList.toggle('is-current', i === cur));
  };
  if (tocLinks.length) { window.addEventListener('scroll', onScroll, { passive: true }); onScroll(); }

  /* Forms */
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
      if (ok) form.querySelectorAll('input:not([type=radio]):not([type=checkbox]):not([type=hidden]),textarea').forEach(i => i.value = '');
    });
    form.addEventListener('input', e => { const f = e.target.closest('.field'); if (f) f.classList.remove('is-error'); });
  });
})();
