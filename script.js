(() => {
  const root = document.documentElement;
  root.classList.add('js');

  const progressFill = document.querySelector('.scroll-progress > span');
  let scrollFramePending = false;
  function updateScrollProgress() {
    const scrollRange = document.documentElement.scrollHeight - window.innerHeight;
    const progress = scrollRange > 0 ? window.scrollY / scrollRange : 0;
    if (progressFill) progressFill.style.transform = `scaleX(${Math.max(0, Math.min(1, progress))})`;
    scrollFramePending = false;
  }
  window.addEventListener('scroll', () => {
    if (scrollFramePending) return;
    scrollFramePending = true;
    window.requestAnimationFrame(updateScrollProgress);
  }, { passive: true });
  window.addEventListener('resize', updateScrollProgress);
  updateScrollProgress();

  const themeButtons = [...document.querySelectorAll('.theme-toggle')];
  const savedTheme = (() => {
    try { return localStorage.getItem('kevin-theme-v2'); }
    catch { return null; }
  })();

  function setTheme(theme, persist = true) {
    const dark = theme === 'dark';
    root.dataset.theme = dark ? 'dark' : 'light';
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0d1422' : '#f7f9fd');
    themeButtons.forEach((button) => {
      button.setAttribute('aria-pressed', String(dark));
      button.setAttribute('aria-label', dark ? 'Switch to light mode' : 'Switch to dark mode');
      const copy = button.querySelector('.theme-copy');
      if (copy) copy.textContent = dark ? 'Light appearance' : 'Dark appearance';
      const icon = button.querySelector('.theme-icon svg');
      if (icon) icon.innerHTML = dark
        ? '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />'
        : '<path d="M20.2 15.2A8.5 8.5 0 0 1 8.8 3.8 8.7 8.7 0 1 0 20.2 15.2Z" />';
    });
    if (persist) {
      try { localStorage.setItem('kevin-theme-v2', dark ? 'dark' : 'light'); }
      catch { /* Theme remains available for this page view if storage is blocked. */ }
    }
  }

  setTheme(savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light', false);
  themeButtons.forEach((button) => button.addEventListener('click', () => {
    setTheme(root.dataset.theme === 'dark' ? 'light' : 'dark');
  }));

  const menuButton = document.querySelector('.menu-toggle');
  const mobileNav = document.querySelector('.mobile-nav');
  function closeMenu() {
    if (!menuButton || !mobileNav) return;
    menuButton.setAttribute('aria-expanded', 'false');
    menuButton.setAttribute('aria-label', 'Open navigation menu');
    mobileNav.hidden = true;
  }
  menuButton?.addEventListener('click', () => {
    const opening = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(opening));
    menuButton.setAttribute('aria-label', opening ? 'Close navigation menu' : 'Open navigation menu');
    if (mobileNav) mobileNav.hidden = !opening;
  });
  mobileNav?.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  window.addEventListener('resize', () => { if (window.innerWidth > 900) closeMenu(); });

  const sections = [...document.querySelectorAll('.section-anchor')];
  const desktopLinks = [...document.querySelectorAll('.nav-link')];
  function markActive(id) {
    desktopLinks.forEach((link) => {
      const active = link.getAttribute('href') === `#${id}`;
      link.classList.toggle('is-active', active);
      if (active) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
  }
  function updateActiveSection() {
    if (!sections.length) return;
    let current = sections[0];
    const activationY = window.scrollY + Math.max(100, window.innerHeight * 0.3);
    sections.forEach((section) => {
      if (section.getBoundingClientRect().top + window.scrollY <= activationY) current = section;
    });
    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2) {
      current = sections[sections.length - 1];
    }
    markActive(current.id);
  }
  let activeScrollFramePending = false;
  function scheduleActiveSectionUpdate() {
    if (activeScrollFramePending) return;
    activeScrollFramePending = true;
    window.requestAnimationFrame(() => {
      activeScrollFramePending = false;
      updateActiveSection();
    });
  }
  window.addEventListener('scroll', scheduleActiveSectionUpdate, { passive: true });
  window.addEventListener('resize', scheduleActiveSectionUpdate);
  updateActiveSection();

  if ('IntersectionObserver' in window) {
    if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: .08, rootMargin: '0px 0px -35px 0px' });
      document.querySelectorAll('.reveal').forEach((item) => revealObserver.observe(item));
    } else {
      document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
    }
  } else {
    document.querySelectorAll('.reveal').forEach((item) => item.classList.add('is-visible'));
  }

  const caseStudy = document.querySelector('.samridhy-case-study');
  let countersStarted = false;
  caseStudy?.addEventListener('toggle', () => {
    if (!caseStudy.open || countersStarted) return;
    countersStarted = true;
    const counters = [...caseStudy.querySelectorAll('[data-qa-count]')];
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    counters.forEach((counter) => {
      const target = Number(counter.getAttribute('data-qa-count'));
      if (!Number.isFinite(target)) return;
      if (reduceMotion) {
        counter.textContent = target.toLocaleString('en-US');
        return;
      }
      const start = performance.now();
      const duration = 720;
      const tick = (now) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);
        counter.textContent = Math.round(target * eased).toLocaleString('en-US');
        if (progress < 1) window.requestAnimationFrame(tick);
      };
      window.requestAnimationFrame(tick);
    });
  });

  const moreExamplesButton = caseStudy?.querySelector('.qa-more-button');
  const extraExamples = caseStudy?.querySelector('#qa-extra-cases');
  moreExamplesButton?.addEventListener('click', () => {
    const expanded = moreExamplesButton.getAttribute('aria-expanded') === 'true';
    moreExamplesButton.setAttribute('aria-expanded', String(!expanded));
    if (extraExamples) extraExamples.hidden = expanded;
    moreExamplesButton.textContent = expanded ? 'View two more examples ↓' : 'Show fewer examples ↑';
  });

  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        event.preventDefault();
        target.scrollIntoView({ behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
        history.replaceState(null, '', link.getAttribute('href'));
      }
    });
  });
  const postitLightbox = document.getElementById('postit-lightbox');
  const postitLightboxImage = document.getElementById('postit-lightbox-image');
  const postitLightboxCaption = document.getElementById('postit-lightbox-caption');
  const postitLightboxClose = postitLightbox?.querySelector('.postit-lightbox-close');

  function closePostitLightbox() {
    if (!postitLightbox) return;
    if (typeof postitLightbox.close === 'function' && postitLightbox.open) {
      postitLightbox.close();
    } else {
      postitLightbox.removeAttribute('open');
    }
  }

  document.querySelectorAll('.postit-shot-open').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const thumbnail = trigger.querySelector('img');
      if (!postitLightbox || !postitLightboxImage || !thumbnail) return;
      postitLightboxImage.src = thumbnail.currentSrc || thumbnail.src;
      postitLightboxImage.alt = thumbnail.alt;
      if (postitLightboxCaption) {
        postitLightboxCaption.textContent = trigger.dataset.caption || thumbnail.alt;
      }
      if (typeof postitLightbox.showModal === 'function') {
        postitLightbox.showModal();
      } else {
        postitLightbox.setAttribute('open', '');
      }
    });
  });

  postitLightboxClose?.addEventListener('click', closePostitLightbox);
  postitLightbox?.addEventListener('click', (event) => {
    if (event.target === postitLightbox) closePostitLightbox();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && postitLightbox?.open && typeof postitLightbox.close !== 'function') {
      closePostitLightbox();
    }
  });
})();
