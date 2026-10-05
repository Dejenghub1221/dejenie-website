/* ===================================================
   DEJENIE ABEBE PORTFOLIO — script.js
   Fully device-safe: touch, zoom, keyboard, desktop
   =================================================== */

'use strict';

/* ---- API base URL ---- */
// The portfolio is always served through the Express server at /portfolio
// So the API is always at the same origin — use absolute localhost URL as fallback
// for file:// protocol (direct file open without server)
const API = (() => {
  if (typeof location === 'undefined') return 'http://localhost:5000/api';
  if (location.protocol === 'file:')   return 'http://localhost:5000/api';
  // Served via Express at localhost:PORT/portfolio → API is at same origin
  return `${location.protocol}//${location.host}/api`;
})();

/* ====================================================
   HELPERS
   ==================================================== */
async function apiFetch(path) {
  try {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch {
    return null;
  }
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function imgSrc(path) {
  if (!path) return null;
  // Already an absolute URL (http/https) or a protocol-relative URL — return as-is
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('//')) {
    return path;
  }
  // /uploads/ paths only work locally — on Render they don't persist between deploys.
  // Return null so callers keep the hardcoded fallback image instead of breaking.
  if (path.startsWith('/uploads/')) {
    if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
      return `${API.replace('/api', '')}${path}`;
    }
    return null; // don't replace fallback with a broken URL
  }
  // Relative path starting with / — prepend the API origin
  if (path.startsWith('/')) {
    return `${API.replace('/api', '')}${path}`;
  }
  // Bare relative path — prepend base
  return `${API.replace('/api', '')}/${path}`;
}

/* ====================================================
   POPULATE PROFILE  (hero + about + contact)
   ==================================================== */
async function loadProfile() {
  const p = await apiFetch('/profile');
  if (!p) return;

  document.title = `${p.name} | ${p.title}`;

  const logoSpan = document.querySelector('.nav-logo span');
  if (logoSpan) logoSpan.textContent = p.name.split(' ')[0] + '.';

  const navAvatar = document.querySelector('.nav-avatar');
  if (navAvatar && p.photo) {
    const src = imgSrc(p.photo);
    if (src) navAvatar.src = src;
  }

  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge && p.tagline) {
    heroBadge.innerHTML = `<span class="badge-dot" aria-hidden="true"></span>${escHtml(p.tagline)}`;
  }

  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && p.headline) {
    heroTitle.innerHTML = escHtml(p.headline)
      .replace(/(IT Solutions|Solutions|IT)/, '<span class="text-gradient">$1</span>');
  }

  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc && p.bio) heroDesc.textContent = p.bio;

  const statNums = document.querySelectorAll('.stat-number');
  if (statNums.length >= 3 && p.stats) {
    statNums[0].textContent = p.stats.experience + '+';
    statNums[1].textContent = p.stats.projects + '+';
    statNums[2].textContent = p.stats.clients + '+';
  }

  const heroImg = document.querySelector('.hero-photo img');
  if (heroImg && p.photo) {
    const src = imgSrc(p.photo);
    if (src) heroImg.src = src;
  }

  const aboutImg = document.querySelector('.about-photo-wrap img');
  if (aboutImg && p.photo) {
    const src = imgSrc(p.photo);
    if (src) aboutImg.src = src;
  }

  const infoItems = document.querySelectorAll('.about-info-item span');
  if (infoItems.length >= 4) {
    if (p.location)     infoItems[0].textContent = p.location;
    if (p.email)        infoItems[1].textContent = p.email;
    if (p.phone)        infoItems[2].textContent = p.phone;
    if (p.availability) infoItems[3].textContent = p.availability;
  }

  const aboutParas = document.querySelectorAll('.about-text p');
  if (aboutParas.length >= 3) {
    if (p.about1) aboutParas[0].textContent = p.about1;
    if (p.about2) aboutParas[1].textContent = p.about2;
    if (p.about3) aboutParas[2].textContent = p.about3;
  }

  if (p.cvFile) {
    document.querySelectorAll('a[download]').forEach(a => {
      a.href = imgSrc(p.cvFile);
    });
  }

  document.querySelectorAll('.contact-item').forEach(item => {
    const icon = item.querySelector('i');
    if (!icon) return;
    const span   = item.querySelector('span');
    const anchor = item.querySelector('a');
    if (icon.classList.contains('fa-map-marker-alt') && span && p.location)
      span.textContent = p.location;
    if (icon.classList.contains('fa-envelope') && anchor && p.email) {
      anchor.textContent = p.email;
      anchor.href = 'mailto:' + p.email;
    }
    if (icon.classList.contains('fa-phone') && anchor && p.phone) {
      anchor.textContent = p.phone;
      anchor.href = 'tel:' + p.phone.replace(/\s/g, '');
    }
  });

  const socials = {
    linkedin: p.linkedin,
    github:   p.github,
    twitter:  p.twitter,
    telegram: p.telegram,
  };
  document.querySelectorAll('.contact-social a, .footer-social a').forEach(a => {
    const icon = a.querySelector('i');
    if (!icon) return;
    if (icon.classList.contains('fa-linkedin-in')   && socials.linkedin) a.href = socials.linkedin;
    if (icon.classList.contains('fa-github')         && socials.github)   a.href = socials.github;
    if (icon.classList.contains('fa-twitter')        && socials.twitter)  a.href = socials.twitter;
    if (icon.classList.contains('fa-telegram-plane') && socials.telegram) a.href = socials.telegram;
  });

  const footerLogoSpan = document.querySelector('.footer-logo span');
  if (footerLogoSpan && p.name) footerLogoSpan.textContent = p.name.split(' ')[0] + '.';

  const footerCopy = document.querySelector('.footer-bottom p');
  if (footerCopy && p.name)
    footerCopy.textContent = `\u00A9 ${new Date().getFullYear()} ${p.name}. All rights reserved.`;

  // Footer avatar
  const footerAvatar = document.querySelector('.footer-avatar');
  if (footerAvatar && p.photo) {
    const src = imgSrc(p.photo);
    if (src) footerAvatar.src = src;
  }
}

/* ====================================================
   POPULATE EXPERIENCE
   ==================================================== */
async function loadExperience() {
  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  try {
    const items = await apiFetch('/experience');
    if (!Array.isArray(items) || items.length === 0) return;

    timeline.innerHTML = items.map(item => {
      const tags = Array.isArray(item.tags) ? item.tags : [];
      return `
        <div class="timeline-item reveal" role="listitem">
          <div class="timeline-dot" aria-hidden="true"></div>
          <div class="timeline-card">
            <div class="timeline-header">
              <div>
                <h3>${escHtml(item.title || '')}</h3>
                <span class="timeline-company">
                  <i class="fas fa-building" aria-hidden="true"></i>
                  ${escHtml(item.company || '')}
                </span>
              </div>
              <span class="timeline-date">${escHtml(item.period || '')}</span>
            </div>
            <p>${escHtml(item.description || '')}</p>
            <div class="timeline-tags" aria-label="Technologies used">
              ${tags.map(t => `<span>${escHtml(t)}</span>`).join('')}
            </div>
          </div>
        </div>`;
    }).join('');
  } catch (err) {
    console.error('loadExperience:', err);
  }
}

/* ====================================================
   POPULATE SKILLS
   ==================================================== */
async function loadSkills() {
  const cols = document.querySelectorAll('.skills-col');
  if (cols.length < 2) return;

  try {
    const items = await apiFetch('/skills');
    if (!Array.isArray(items) || items.length === 0) return;

    const technical = items.filter(s => s.category === 'Technical');
    const tools     = items.filter(s => s.category !== 'Technical');

    function renderSkills(list) {
      if (!list.length) return '<p style="color:var(--text-light);font-size:.875rem">No skills available.</p>';
      return list.map(skill => {
        const pct = Math.min(Math.max(Number(skill.percentage) || 0, 0), 100);
        return `
          <div class="skill-item">
            <div class="skill-info">
              <span>${escHtml(skill.name || '')}</span>
              <span aria-label="${pct} percent">${pct}%</span>
            </div>
            <div class="skill-bar"
              role="progressbar"
              aria-valuenow="${pct}"
              aria-valuemin="0"
              aria-valuemax="100"
              aria-label="${escHtml(skill.name || '')} ${pct}%">
              <div class="skill-fill" data-width="${pct}" style="width:0%"></div>
            </div>
          </div>`;
      }).join('');
    }

    cols[0].innerHTML = `<h3 class="skills-col-title">Technical Skills</h3>${renderSkills(technical)}`;
    cols[1].innerHTML = `<h3 class="skills-col-title">Tools &amp; Technologies</h3>${renderSkills(tools)}`;
  } catch (err) {
    console.error('loadSkills:', err);
  }
}

/* ====================================================
   POPULATE PROJECTS
   ==================================================== */
async function loadProjects() {
  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  try {
    const items = await apiFetch('/projects');
    if (!Array.isArray(items) || items.length === 0) return;

    grid.innerHTML = items.map(item => {
      const src  = item.image ? imgSrc(item.image) : null;
      const tags = Array.isArray(item.tags) ? item.tags : [];
      const imgHtml = src
        ? `<img src="${escHtml(src)}" alt="${escHtml(item.title || 'Project')}" loading="lazy" />`
        : `<div class="project-img-placeholder"><i class="fas fa-folder-open" aria-hidden="true"></i></div>`;

      return `
        <article class="project-card reveal">
          <div class="project-img">
            ${imgHtml}
            <div class="project-overlay">
              <a href="${escHtml(item.link || '#')}"
                target="_blank"
                rel="noopener noreferrer"
                class="project-link"
                aria-label="View ${escHtml(item.title || 'project')}">
                <i class="fas fa-external-link-alt" aria-hidden="true"></i>
              </a>
            </div>
          </div>
          <div class="project-info">
            <div class="project-tags">
              ${tags.map(t => `<span>${escHtml(t)}</span>`).join('')}
            </div>
            <h3>${escHtml(item.title || '')}</h3>
            <p>${escHtml(item.description || '')}</p>
          </div>
        </article>`;
    }).join('');
  } catch (err) {
    console.error('loadProjects:', err);
  }
}

/* ====================================================
   POPULATE SERVICES
   ==================================================== */
async function loadServices() {
  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  try {
    const items = await apiFetch('/services');
    if (!Array.isArray(items) || items.length === 0) return;

    grid.innerHTML = items.map(item => `
      <div class="service-card reveal">
        <div class="service-icon"
          style="background:${escHtml(item.color || '#3b82f6')}22"
          aria-hidden="true">
          <i class="${escHtml(item.icon || 'fas fa-cog')}"
            style="color:${escHtml(item.color || '#3b82f6')}"></i>
        </div>
        <h3>${escHtml(item.title || '')}</h3>
        <p>${escHtml(item.description || '')}</p>
      </div>`).join('');
  } catch (err) {
    console.error('loadServices:', err);
  }
}

/* ====================================================
   POPULATE GALLERY
   ==================================================== */
async function loadGallery() {
  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  try {
    const items = await apiFetch('/gallery');
    if (!Array.isArray(items) || items.length === 0) return;

    window._galleryImages = items.map(item => ({
      src: imgSrc(item.url),
      alt: item.caption || 'Gallery image',
    }));

    grid.innerHTML = items.map((item, i) => `
      <div class="gallery-item reveal"
        role="listitem"
        data-index="${i}"
        tabindex="0"
        aria-label="${escHtml(item.caption || `Gallery image ${i + 1}`)} – click to enlarge">
        <img src="${escHtml(imgSrc(item.url) || '')}"
          alt="${escHtml(item.caption || `Gallery image ${i + 1}`)}"
          loading="lazy" />
        <div class="gallery-overlay" aria-hidden="true">
          <i class="fas fa-expand"></i>
        </div>
      </div>`).join('');
  } catch (err) {
    console.error('loadGallery:', err);
  }
}

/* ====================================================
   POPULATE CERTIFICATIONS
   ==================================================== */
async function loadCertifications() {
  const grid = document.querySelector('.certs-grid');
  if (!grid) return;

  try {
    const items = await apiFetch('/certifications');
    if (!Array.isArray(items) || items.length === 0) return;

    grid.innerHTML = items.map(item => `
      <div class="cert-card reveal">
        <div class="cert-logo"
          style="color:${escHtml(item.color || '#3b82f6')};background:${escHtml(item.color || '#3b82f6')}18"
          aria-hidden="true">
          <i class="${escHtml(item.icon || 'fas fa-certificate')}"></i>
        </div>
        <div class="cert-info">
          <h3>${escHtml(item.title || '')}</h3>
          <span class="cert-issuer">${escHtml(item.issuer || '')}</span>
          <span class="cert-date">${escHtml(item.year || '')}</span>
          <span class="cert-badge">${escHtml(item.category || '')}</span>
        </div>
      </div>`).join('');
  } catch (err) {
    console.error('loadCertifications:', err);
  }
}

/* ====================================================
   CONTACT FORM — POST to API
   ==================================================== */
function initContactForm() {
  const form    = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', async e => {
    e.preventDefault();

    // Validate required fields
    let valid = true;
    form.querySelectorAll('input[required], textarea[required]').forEach(inp => {
      const empty = !inp.value.trim();
      inp.style.borderColor = empty ? '#ef4444' : '';
      if (inp.type === 'email' && inp.value.trim()) {
        const ok = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(inp.value.trim());
        if (!ok) { inp.style.borderColor = '#ef4444'; valid = false; }
      }
      if (empty) valid = false;
    });
    if (!valid) {
      // Focus the first invalid field
      const first = form.querySelector('input[style*="#ef4444"], textarea[style*="#ef4444"]');
      first?.focus();
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const origHtml = btn.innerHTML;
    btn.innerHTML = '<i class="fas fa-spinner fa-spin" aria-hidden="true"></i> Sending…';
    btn.disabled  = true;

    const body = {
      name:    form.querySelector('#name').value.trim(),
      email:   form.querySelector('#email').value.trim(),
      subject: form.querySelector('#subject').value.trim(),
      message: form.querySelector('#message').value.trim(),
    };

    try {
      const res = await fetch(`${API}/messages`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify(body),
      });
      if (!res.ok) throw new Error('Server error');
      form.reset();
      // Clear any red borders
      form.querySelectorAll('input, textarea').forEach(el => { el.style.borderColor = ''; });
      if (success) {
        success.classList.add('show');
        setTimeout(() => success.classList.remove('show'), 5000);
      }
    } catch {
      // Show inline error instead of browser alert
      let errBox = form.querySelector('.form-error-msg');
      if (!errBox) {
        errBox = document.createElement('div');
        errBox.className = 'form-error-msg';
        errBox.style.cssText = [
          'display:flex', 'align-items:center', 'gap:10px',
          'margin-top:12px', 'padding:12px 16px',
          'background:#fef2f2', 'border:1px solid #fecaca',
          'border-radius:10px', 'color:#dc2626',
          'font-size:0.875rem', 'font-weight:500',
        ].join(';');
        errBox.innerHTML = '<i class="fas fa-exclamation-circle" aria-hidden="true"></i> Could not send message. Please try again later.';
        btn.insertAdjacentElement('afterend', errBox);
      }
      errBox.style.display = 'flex';
      setTimeout(() => { if (errBox) errBox.style.display = 'none'; }, 5000);
    } finally {
      btn.innerHTML = origHtml;
      btn.disabled  = false;
    }
  });

  // Clear red border on input
  form.querySelectorAll('input, textarea').forEach(el => {
    el.addEventListener('input', () => { el.style.borderColor = ''; });
  });
}

/* ====================================================
   NAVBAR — scroll, active-link, responsive drawer
   ==================================================== */
function initNavbar() {
  const navbar     = document.getElementById('navbar');
  const navLinks   = document.querySelectorAll('.nav-link');
  const sections   = document.querySelectorAll('section[id]');
  const hamburger  = document.getElementById('hamburger');
  const linksWrap  = document.getElementById('navLinks');
  const backdrop   = document.getElementById('navBackdrop');

  /* --- helpers --- */
  function openMenu() {
    if (!hamburger || !linksWrap) return;
    hamburger.classList.add('open');
    hamburger.setAttribute('aria-expanded', 'true');
    hamburger.setAttribute('aria-label', 'Close navigation menu');
    linksWrap.classList.add('open');
    if (backdrop) backdrop.classList.add('open');
    document.body.classList.add('nav-open');
  }

  function closeMenu() {
    if (!hamburger || !linksWrap) return;
    hamburger.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
    hamburger.setAttribute('aria-label', 'Open navigation menu');
    linksWrap.classList.remove('open');
    if (backdrop) backdrop.classList.remove('open');
    document.body.classList.remove('nav-open');
  }

  function toggleMenu() {
    hamburger?.classList.contains('open') ? closeMenu() : openMenu();
  }

  /* --- hamburger click --- */
  hamburger?.addEventListener('click', e => {
    e.stopPropagation();
    toggleMenu();
  });

  /* --- backdrop click --- */
  backdrop?.addEventListener('click', closeMenu);

  /* --- nav link clicks close drawer --- */
  linksWrap?.querySelectorAll('.nav-link, .nav-mobile-cv').forEach(l => {
    l.addEventListener('click', () => {
      // Small delay so the smooth-scroll target is reachable before we close
      setTimeout(closeMenu, 80);
    });
  });

  /* --- click outside open drawer --- */
  document.addEventListener('click', e => {
    if (hamburger?.classList.contains('open')) {
      if (!linksWrap?.contains(e.target) && !hamburger.contains(e.target)) {
        closeMenu();
      }
    }
  });

  /* --- keyboard Escape --- */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && hamburger?.classList.contains('open')) {
      closeMenu();
      hamburger.focus(); // return focus to trigger
    }
  });

  /* --- resize: close drawer when going back to desktop --- */
  const mq = window.matchMedia('(min-width: 1025px)');
  function onMqChange(e) { if (e.matches) closeMenu(); }
  // Use addEventListener for modern browsers, addListener as fallback
  if (mq.addEventListener) mq.addEventListener('change', onMqChange);
  else mq.addListener(onMqChange); // Safari < 14

  /* --- scroll: shadow + active link --- */
  let scrollRaf = null;
  function onScroll() {
    if (scrollRaf) return;
    scrollRaf = requestAnimationFrame(() => {
      scrollRaf = null;

      // Scrolled shadow
      navbar?.classList.toggle('scrolled', window.scrollY > 20);

      // Active link detection
      const scrollY = window.scrollY + parseInt(
        getComputedStyle(document.documentElement).getPropertyValue('--nav-h') || '68'
      ) + 10;

      let current = '';
      sections.forEach(s => {
        if (scrollY >= s.offsetTop) current = s.id;
      });

      // Snap to last section when near page bottom
      const nearBottom = (window.innerHeight + window.scrollY) >= (document.documentElement.scrollHeight - 80);
      if (nearBottom && sections.length) current = sections[sections.length - 1].id;

      navLinks.forEach(l => {
        const isActive = l.getAttribute('href') === `#${current}`;
        l.classList.toggle('active', isActive);
        // Update aria-current
        if (isActive) {
          l.setAttribute('aria-current', 'page');
        } else {
          l.removeAttribute('aria-current');
        }
      });
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run once on load

  /* --- smooth scroll for all anchor links --- */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const href = a.getAttribute('href');
      if (!href || href === '#' || href.length <= 1) return;
      try {
        const target = document.querySelector(href);
        if (!target) return;
        e.preventDefault();
        const navH = navbar ? navbar.offsetHeight : 68;
        const top  = target.getBoundingClientRect().top + window.scrollY - navH;
        window.scrollTo({ top, behavior: 'smooth' });
        // Move focus to target section for accessibility
        target.setAttribute('tabindex', '-1');
        target.focus({ preventScroll: true });
      } catch { /* ignore bad selectors */ }
    });
  });
}

/* ====================================================
   REVEAL ON SCROLL
   ==================================================== */
function initReveal() {
  // Respect reduced-motion: skip animation entirely
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
    return;
  }

  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        obs.unobserve(e.target); // only animate once
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  function observeAll() {
    document.querySelectorAll('.reveal:not(.visible)').forEach(el => obs.observe(el));
  }

  observeAll();
  // Re-run after dynamic content populates
  setTimeout(observeAll, 500);
  setTimeout(observeAll, 1400);
}

/* ====================================================
   SKILL BARS ANIMATION
   ==================================================== */
function initSkillBars() {
  // Reduced-motion: set widths immediately
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    document.querySelectorAll('.skill-fill').forEach(bar => {
      bar.style.width = (bar.getAttribute('data-width') || '0') + '%';
    });
    return;
  }

  const section = document.getElementById('skills');
  if (!section) return;

  let animated = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !animated) {
        animated = true;
        section.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = (bar.getAttribute('data-width') || '0') + '%';
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.25 });

  obs.observe(section);

  // Re-observe after dynamic skills load
  setTimeout(() => {
    if (!animated) {
      animated = false; // allow re-trigger for dynamic content
      obs.observe(section);
    }
  }, 900);
}

/* ====================================================
   STAT COUNTER ANIMATION
   ==================================================== */
function initCounters() {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  function animateCounter(el, target) {
    const duration = 1600;
    const start    = performance.now();
    function step(now) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      el.textContent = Math.floor(eased * target) + '+';
      if (progress < 1) requestAnimationFrame(step);
      else el.textContent = target + '+';
    }
    requestAnimationFrame(step);
  }

  const heroStats = document.querySelector('.hero-stats');
  if (!heroStats) return;

  let counted = false;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !counted) {
        counted = true;
        heroStats.querySelectorAll('.stat-number').forEach(el => {
          const val = parseInt(el.textContent.replace('+', ''), 10);
          if (!isNaN(val)) animateCounter(el, val);
        });
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  obs.observe(heroStats);
}

/* ====================================================
   GALLERY LIGHTBOX
   ==================================================== */
function initLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn    = document.getElementById('lightboxClose');
  const prevBtn     = document.getElementById('lightboxPrev');
  const nextBtn     = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let current        = 0;
  let _prevFocus     = null; // element to return focus to on close

  function getImages() {
    if (window._galleryImages?.length) return window._galleryImages;
    return Array.from(document.querySelectorAll('.gallery-item img')).map(img => ({
      src: img.src,
      alt: img.alt || 'Gallery image',
    }));
  }

  function open(i) {
    const imgs = getImages();
    if (!imgs.length) return;
    current = ((i % imgs.length) + imgs.length) % imgs.length; // wrap safely
    const img = imgs[current];
    if (!img?.src) return;

    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt || 'Gallery image';
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Update aria label on prev/next for context
    prevBtn?.setAttribute('aria-label', `Previous image (${current} of ${imgs.length})`);
    nextBtn?.setAttribute('aria-label', `Next image (${(current + 2)} of ${imgs.length})`);

    // Trap focus inside lightbox
    _prevFocus = document.activeElement;
    setTimeout(() => closeBtn?.focus(), 50);
  }

  function close() {
    lightbox.classList.remove('active');
    document.body.style.overflow = '';
    lightboxImg.src = '';
    lightboxImg.alt = '';
    // Return focus to the gallery item that opened the lightbox
    if (_prevFocus && document.contains(_prevFocus)) {
      _prevFocus.focus();
    }
    _prevFocus = null;
  }

  function next() { open(current + 1); }
  function prev() { open(current - 1); }

  /* --- delegated click on gallery grid (handles dynamic items) --- */
  document.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (item) {
      _prevFocus = item;
      open(parseInt(item.dataset.index, 10) || 0);
    }
  });

  /* --- keyboard activation of gallery items (Enter/Space) --- */
  document.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.gallery-item')) {
      e.preventDefault();
      _prevFocus = e.target;
      open(parseInt(e.target.dataset.index, 10) || 0);
    }
  });

  closeBtn?.addEventListener('click', close);
  nextBtn?.addEventListener('click',  next);
  prevBtn?.addEventListener('click',  prev);

  /* --- click on lightbox backdrop (not on the image) --- */
  lightbox.addEventListener('click', e => {
    if (e.target === lightbox || e.target === lightbox.querySelector('.lightbox-img-wrap')) {
      close();
    }
  });

  /* --- keyboard navigation inside lightbox --- */
  lightbox.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')     { e.preventDefault(); close(); }
    if (e.key === 'ArrowRight') { e.preventDefault(); next(); }
    if (e.key === 'ArrowLeft')  { e.preventDefault(); prev(); }
    // Keep focus inside lightbox (Tab trap)
    if (e.key === 'Tab') {
      const focusable = Array.from(lightbox.querySelectorAll('button'));
      if (!focusable.length) return;
      const first = focusable[0];
      const last  = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault(); last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault(); first.focus();
      }
    }
  });

  /* --- swipe support for touch devices --- */
  let touchStartX = 0;
  let touchStartY = 0;

  lightbox.addEventListener('touchstart', e => {
    touchStartX = e.touches[0].clientX;
    touchStartY = e.touches[0].clientY;
  }, { passive: true });

  lightbox.addEventListener('touchend', e => {
    if (!lightbox.classList.contains('active')) return;
    const dx = e.changedTouches[0].clientX - touchStartX;
    const dy = e.changedTouches[0].clientY - touchStartY;
    // Only act on predominantly horizontal swipes (> 50px, less than 60px vertical)
    if (Math.abs(dx) > 50 && Math.abs(dy) < 60) {
      if (dx < 0) next(); else prev();
    }
  }, { passive: true });
}

/* ====================================================
   CHATBOT — full logic
   ==================================================== */
function initChatbot() {
  const widget     = document.getElementById('chatWidget');
  const toggleBtn  = document.getElementById('chatToggleBtn');
  const closeBtn   = document.getElementById('chatCloseBtn');
  const clearBtn   = document.getElementById('chatClearBtn');
  const input      = document.getElementById('chatInput');
  const sendBtn    = document.getElementById('chatSendBtn');
  const messagesEl = document.getElementById('chatMessages');
  const quickEl    = document.getElementById('chatQuickReplies');
  const botNameEl  = document.getElementById('chatBotName');
  const badgeEl    = document.getElementById('chatUnreadBadge');
  if (!widget) return;

  let isOpen     = false;
  let isTyping   = false;
  let botConfig  = null;
  let hasGreeted = false;

  const STORAGE_KEY = 'dejenie_chat_history';
  const USER_KEY    = 'dejenie_chat_user';

  // Restore saved user
  let chatUser = null;
  try { chatUser = JSON.parse(localStorage.getItem(USER_KEY)); } catch {}

  /* ---- Config from API ---- */
  async function loadConfig() {
    const cfg = await apiFetch('/chatbot/config');
    if (!cfg) return;
    botConfig = cfg;
    if (botNameEl && cfg.botName) botNameEl.textContent = cfg.botName;
    if (input && cfg.placeholder)  input.placeholder = cfg.placeholder;

    if (cfg.color) {
      const els = {
        header:    document.querySelector('.chat-header'),
        sendB:     document.querySelector('.chat-send-btn'),
        togB:      document.querySelector('.chat-toggle-btn'),
        startB:    document.querySelector('.chat-start-btn'),
        introIcon: document.querySelector('.chat-intro-icon'),
      };
      if (els.header)    els.header.style.background    = cfg.color;
      if (els.sendB)     els.sendB.style.background     = cfg.color;
      if (els.togB)      els.togB.style.background      = cfg.color;
      if (els.startB)    els.startB.style.background    = cfg.color;
      if (els.introIcon) els.introIcon.style.background = cfg.color;
    }

    renderQuickReplies(cfg.quickReplies || []);
    updateIntroName();
  }

  /* ---- Chat history persistence ---- */
  function saveHistory() {
    const msgs = [...messagesEl.querySelectorAll('.chat-msg')].map(m => ({
      role: m.classList.contains('bot') ? 'bot' : 'user',
      html: m.querySelector('.chat-msg-bubble')?.innerHTML || '',
    }));
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs)); } catch {}
  }

  function loadHistory() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      if (saved.length) {
        saved.forEach(m => appendBubble(m.role, m.html, true));
        return true;
      }
    } catch {}
    return false;
  }

  /* ---- Render a message bubble ---- */
  function appendBubble(role, html, skipSave = false) {
    const wrap   = document.createElement('div');
    wrap.className = `chat-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className    = 'chat-msg-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.innerHTML    = role === 'bot'
      ? '<i class="fas fa-robot"></i>'
      : '<i class="fas fa-user"></i>';

    const bubble = document.createElement('div');
    bubble.className = 'chat-msg-bubble';
    bubble.innerHTML = html;

    wrap.appendChild(avatar);
    wrap.appendChild(bubble);
    messagesEl.appendChild(wrap);
    scrollToBottom();
    if (!skipSave) saveHistory();
  }

  /* ---- Typing indicator ---- */
  function showTyping() {
    if (document.getElementById('chatTypingIndicator')) return;
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot chat-typing';
    wrap.id = 'chatTypingIndicator';
    wrap.setAttribute('aria-label', 'Bot is typing');
    wrap.innerHTML = `
      <div class="chat-msg-avatar" aria-hidden="true"><i class="fas fa-robot"></i></div>
      <div class="chat-msg-bubble">
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
        <span class="typing-dot"></span>
      </div>`;
    messagesEl.appendChild(wrap);
    scrollToBottom();
  }

  function hideTyping() {
    document.getElementById('chatTypingIndicator')?.remove();
  }

  /* ---- Quick reply chips ---- */
  function renderQuickReplies(replies) {
    if (!quickEl) return;
    quickEl.innerHTML = '';
    replies.forEach(text => {
      const btn = document.createElement('button');
      btn.className   = 'chat-quick-btn';
      btn.type        = 'button';
      btn.textContent = text;
      btn.addEventListener('click', () => sendMessage(text));
      quickEl.appendChild(btn);
    });
  }

  /* ---- Scroll messages to bottom ---- */
  function scrollToBottom() {
    if (messagesEl) messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ---- Send a message ---- */
  async function sendMessage(text) {
    const msg = (text || input?.value || '').trim();
    if (!msg || isTyping) return;

    appendBubble('user', escHtml(msg));
    if (!text && input) { input.value = ''; }
    if (sendBtn) sendBtn.disabled = true;
    isTyping = true;

    showTyping();
    const delay = 400 + Math.random() * 500;

    try {
      const res = await fetch(`${API}/chatbot/message`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ message: msg }),
      });
      const data = await res.json();
      await new Promise(r => setTimeout(r, delay));
      hideTyping();
      appendBubble('bot', data.reply || 'Sorry, I could not process that.');
    } catch {
      await new Promise(r => setTimeout(r, delay));
      hideTyping();
      appendBubble('bot', '&#9888;&#65039; I\'m having trouble connecting. Please try again.');
    } finally {
      isTyping = false;
      if (sendBtn) sendBtn.disabled = (input?.value.trim().length === 0);
      input?.focus();
    }
  }

  /* ---- Intro screen elements ---- */
  const introEl     = document.getElementById('chatIntro');
  const nameInput   = document.getElementById('chatUserName');
  const emailInput  = document.getElementById('chatUserEmail');
  const startBtn    = document.getElementById('chatStartBtn');
  const inputArea   = document.getElementById('chatInputArea');
  const introNameEl = document.getElementById('chatIntroName');

  function updateIntroName() {
    if (introNameEl && botConfig?.botName) {
      introNameEl.textContent = botConfig.botName.replace(/\s*bot$/i, '').trim() || 'Dejenie';
    }
  }

  /* ---- Show intro or chat area ---- */
  function showIntro() {
    if (introEl)    introEl.style.display    = 'block';
    if (messagesEl) messagesEl.style.display = 'none';
    if (quickEl)    quickEl.style.display    = 'none';
    if (inputArea)  inputArea.style.display  = 'none';
  }

  function showChatArea() {
    if (introEl)    introEl.style.display    = 'none';
    if (messagesEl) messagesEl.style.display = 'flex';
    if (quickEl)    quickEl.style.display    = 'flex';
    if (inputArea)  inputArea.style.display  = 'flex';
  }

  /* ---- Start chat after intro form ---- */
  function startChat() {
    const name     = nameInput?.value.trim() || '';
    const email    = emailInput?.value.trim() || '';
    const emailOk  = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

    if (!name) {
      nameInput?.classList.add('error');
      nameInput?.focus();
      return;
    }
    nameInput?.classList.remove('error');

    if (!email || !emailOk) {
      emailInput?.classList.add('error');
      emailInput?.focus();
      return;
    }
    emailInput?.classList.remove('error');

    chatUser = { name, email };
    try { localStorage.setItem(USER_KEY, JSON.stringify(chatUser)); } catch {}

    showChatArea();

    if (!hasGreeted) {
      hasGreeted = true;
      const alreadyHasHistory = loadHistory();
      if (!alreadyHasHistory) {
        const greeting = (botConfig?.greeting || "Hi there! 👋 I'm Dejenie's assistant. Ask me anything!")
          .replace('Hi there!', `Hi ${name}!`);
        setTimeout(() => {
          showTyping();
          setTimeout(() => { hideTyping(); appendBubble('bot', greeting); }, 800);
        }, 300);
      }
    }
    input?.focus();
  }

  /* ---- Toggle open/close ---- */
  function openChat() {
    isOpen = true;
    widget.classList.add('open');
    toggleBtn?.setAttribute('aria-expanded', 'true');
    toggleBtn?.setAttribute('aria-label', 'Close chat');
    if (badgeEl) badgeEl.style.display = 'none';

    if (chatUser) {
      showChatArea();
      if (!hasGreeted) {
        hasGreeted = true;
        const alreadyHasHistory = loadHistory();
        if (!alreadyHasHistory) {
          const greeting = (botConfig?.greeting || "Hi there! 👋 I'm Dejenie's assistant.")
            .replace('Hi there!', `Hi ${chatUser.name}!`);
          setTimeout(() => {
            showTyping();
            setTimeout(() => { hideTyping(); appendBubble('bot', greeting); }, 800);
          }, 300);
        }
      }
      input?.focus();
    } else {
      showIntro();
      setTimeout(() => nameInput?.focus(), 300);
    }
  }

  function closeChat() {
    isOpen = false;
    widget.classList.remove('open');
    toggleBtn?.setAttribute('aria-expanded', 'false');
    toggleBtn?.setAttribute('aria-label', 'Open chat');
    toggleBtn?.focus(); // return focus to trigger
  }

  function clearChat() {
    if (messagesEl) messagesEl.innerHTML = '';
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    try { localStorage.removeItem(USER_KEY); } catch {}
    chatUser   = null;
    hasGreeted = false;
    if (nameInput)  nameInput.value  = '';
    if (emailInput) emailInput.value = '';
    showIntro();
    setTimeout(() => nameInput?.focus(), 100);
  }

  /* ---- Event listeners ---- */
  toggleBtn?.addEventListener('click', () => isOpen ? closeChat() : openChat());
  closeBtn?.addEventListener('click',   closeChat);
  clearBtn?.addEventListener('click',   clearChat);

  sendBtn?.addEventListener('click', () => sendMessage());

  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
  });

  input?.addEventListener('input', () => {
    if (sendBtn) sendBtn.disabled = (input.value.trim().length === 0);
  });

  // Intro form
  startBtn?.addEventListener('click', startChat);
  nameInput?.addEventListener('keydown',  e => { if (e.key === 'Enter') { e.preventDefault(); emailInput?.focus(); } });
  emailInput?.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); startChat(); } });
  nameInput?.addEventListener('input',  () => nameInput.classList.remove('error'));
  emailInput?.addEventListener('input', () => emailInput.classList.remove('error'));

  // Close on Escape when chat is open
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && isOpen) closeChat();
  });

  // Show unread badge after 3s if not opened
  setTimeout(() => {
    if (!isOpen && badgeEl) badgeEl.style.display = 'flex';
  }, 3000);

  // Load config
  loadConfig();
}

/* ====================================================
   MAIN — initialise everything
   ==================================================== */
async function main() {
  // UI interactions first (don't wait for API)
  initNavbar();
  initReveal();
  initSkillBars();
  initCounters();
  initLightbox();
  initContactForm();
  initChatbot();

  // Fetch dynamic content in parallel
  await Promise.all([
    loadProfile(),
    loadExperience(),
    loadSkills(),
    loadProjects(),
    loadServices(),
    loadGallery(),
    loadCertifications(),
  ]);

  // Re-trigger reveal and skill bars for dynamically injected elements
  initReveal();
  initSkillBars();
}

document.addEventListener('DOMContentLoaded', main);
