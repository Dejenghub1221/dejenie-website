/* ===================================================
   DEJENIE ABEBE PORTFOLIO — script.js
   Fetches all content live from the backend API at
   http://localhost:5000/api  (falls back to static HTML
   if the server is offline)
   =================================================== */

'use strict';

// Auto-detect API base URL
// - On Vercel (same domain): use relative /api
// - Local file:// or different port: use localhost:5000
const API = (typeof location !== 'undefined' && location.protocol !== 'file:')
  ? '/api'
  : 'http://localhost:5000/api';

/* ─────────────────────────────────────────
   HELPERS
───────────────────────────────────────── */
async function apiFetch(path) {
  try {
    const res = await fetch(API + path);
    if (!res.ok) throw new Error(res.statusText);
    return await res.json();
  } catch {
    return null; // silently fall back to static content
  }
}

function escHtml(str = '') {
  return String(str)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function imgSrc(path, fallbackIcon = 'fa-image') {
  if (path) return `${API.replace('/api', '')}${path}`;
  return null;
}

/* ─────────────────────────────────────────
   POPULATE PROFILE  (hero + about + contact)
───────────────────────────────────────── */
async function loadProfile() {
  const p = await apiFetch('/profile');
  if (!p) return;

  // <title>
  document.title = `${p.name} | ${p.title}`;

  // Nav logo name
  const logoSpan = document.querySelector('.nav-logo span');
  if (logoSpan) logoSpan.textContent = p.name.split(' ')[0] + '.';

  // Nav avatar
  const navAvatar = document.querySelector('.nav-avatar');
  if (navAvatar && p.photo) navAvatar.src = imgSrc(p.photo);

  // Hero badge tagline
  const heroBadge = document.querySelector('.hero-badge');
  if (heroBadge && p.tagline) {
    heroBadge.innerHTML = `<span class="badge-dot"></span>${escHtml(p.tagline)}`;
  }

  // Hero title
  const heroTitle = document.querySelector('.hero-title');
  if (heroTitle && p.headline) {
    // Keep first word + gradient rest trick: split on first space group of words
    heroTitle.innerHTML = escHtml(p.headline)
      .replace(/^(.*?)(IT Solutions|Solutions|IT)/, '$1<span class="text-gradient">$2</span>');
  }

  // Hero description
  const heroDesc = document.querySelector('.hero-desc');
  if (heroDesc && p.bio) heroDesc.textContent = p.bio;

  // Hero stats
  const statNums = document.querySelectorAll('.stat-number');
  if (statNums.length >= 3 && p.stats) {
    statNums[0].textContent = p.stats.experience + '+';
    statNums[1].textContent = p.stats.projects + '+';
    statNums[2].textContent = p.stats.clients + '+';
  }

  // Hero photo
  const heroImg = document.querySelector('.hero-photo img');
  if (heroImg && p.photo) heroImg.src = imgSrc(p.photo);

  // About photo
  const aboutImg = document.querySelector('.about-photo-wrap img');
  if (aboutImg && p.photo) aboutImg.src = imgSrc(p.photo);

  // About info card
  const infoItems = document.querySelectorAll('.about-info-item span');
  if (infoItems.length >= 4) {
    if (p.location)     infoItems[0].textContent = p.location;
    if (p.email)        infoItems[1].textContent = p.email;
    if (p.phone)        infoItems[2].textContent = p.phone;
    if (p.availability) infoItems[3].textContent = p.availability;
  }

  // About paragraphs
  const aboutParas = document.querySelectorAll('.about-text p');
  if (aboutParas.length >= 3) {
    if (p.about1) aboutParas[0].textContent = p.about1;
    if (p.about2) aboutParas[1].textContent = p.about2;
    if (p.about3) aboutParas[2].textContent = p.about3;
  }

  // CV download links
  if (p.cvFile) {
    document.querySelectorAll('a[download]').forEach(a => {
      a.href = imgSrc(p.cvFile);
    });
  }

  // Contact section info
  const contactItems = document.querySelectorAll('.contact-item');
  contactItems.forEach(item => {
    const icon = item.querySelector('i');
    if (!icon) return;
    const span = item.querySelector('span');
    const anchor = item.querySelector('a');
    if (icon.classList.contains('fa-map-marker-alt') && span && p.location) span.textContent = p.location;
    if (icon.classList.contains('fa-envelope') && anchor && p.email) { anchor.textContent = p.email; anchor.href = 'mailto:' + p.email; }
    if (icon.classList.contains('fa-phone') && anchor && p.phone) { anchor.textContent = p.phone; anchor.href = 'tel:' + p.phone.replace(/\s/g,''); }
  });

  // Social links
  const socials = { linkedin: p.linkedin, github: p.github, twitter: p.twitter, telegram: p.telegram };
  document.querySelectorAll('.contact-social a, .footer-social a').forEach(a => {
    const icon = a.querySelector('i');
    if (!icon) return;
    if (icon.classList.contains('fa-linkedin-in') && socials.linkedin) a.href = socials.linkedin;
    if (icon.classList.contains('fa-github') && socials.github)        a.href = socials.github;
    if (icon.classList.contains('fa-twitter') && socials.twitter)      a.href = socials.twitter;
    if (icon.classList.contains('fa-telegram-plane') && socials.telegram) a.href = socials.telegram;
  });

  // Footer name
  const footerLogo = document.querySelector('.footer-logo');
  if (footerLogo && p.name) footerLogo.textContent = p.name.split(' ')[0] + '.';

  // Footer copyright
  const footerCopy = document.querySelector('.footer-bottom p');
  if (footerCopy && p.name) footerCopy.textContent = `© ${new Date().getFullYear()} ${p.name}. All rights reserved.`;
}

/* ─────────────────────────────────────────
   POPULATE EXPERIENCE
───────────────────────────────────────── */
async function loadExperience() {
  const items = await apiFetch('/experience');
  if (!items || !items.length) return;

  const timeline = document.querySelector('.timeline');
  if (!timeline) return;

  timeline.innerHTML = items.map(item => `
    <div class="timeline-item reveal">
      <div class="timeline-dot"></div>
      <div class="timeline-card">
        <div class="timeline-header">
          <div>
            <h3>${escHtml(item.title)}</h3>
            <span class="timeline-company"><i class="fas fa-building"></i> ${escHtml(item.company)}</span>
          </div>
          <span class="timeline-date">${escHtml(item.period)}</span>
        </div>
        <p>${escHtml(item.description)}</p>
        <div class="timeline-tags">
          ${(item.tags || []).map(t => `<span>${escHtml(t)}</span>`).join('')}
        </div>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────
   POPULATE SKILLS
───────────────────────────────────────── */
async function loadSkills() {
  const items = await apiFetch('/skills');
  if (!items || !items.length) return;

  const technical = items.filter(s => s.category === 'Technical');
  const tools     = items.filter(s => s.category !== 'Technical');

  const cols = document.querySelectorAll('.skills-col');
  if (cols.length < 2) return;

  function renderSkills(list) {
    return list.map(s => `
      <div class="skill-item">
        <div class="skill-info">
          <span>${escHtml(s.name)}</span>
          <span>${s.percentage}%</span>
        </div>
        <div class="skill-bar">
          <div class="skill-fill" data-width="${s.percentage}"></div>
        </div>
      </div>
    `).join('');
  }

  cols[0].innerHTML = `<h3 class="skills-col-title">Technical Skills</h3>${renderSkills(technical)}`;
  cols[1].innerHTML = `<h3 class="skills-col-title">Tools &amp; Technologies</h3>${renderSkills(tools)}`;
}

/* ─────────────────────────────────────────
   POPULATE PROJECTS
───────────────────────────────────────── */
async function loadProjects() {
  const items = await apiFetch('/projects');
  if (!items || !items.length) return;

  const grid = document.querySelector('.projects-grid');
  if (!grid) return;

  grid.innerHTML = items.map(item => {
    const src = item.image ? imgSrc(item.image) : null;
    const imgHtml = src
      ? `<img src="${src}" alt="${escHtml(item.title)}" />`
      : `<div class="project-img-placeholder"><i class="fas fa-folder-open"></i></div>`;

    return `
      <div class="project-card reveal">
        <div class="project-img">
          ${imgHtml}
          <div class="project-overlay">
            <a href="${escHtml(item.link || '#')}" target="_blank" rel="noreferrer" class="project-link">
              <i class="fas fa-external-link-alt"></i>
            </a>
          </div>
        </div>
        <div class="project-info">
          <div class="project-tags">
            ${(item.tags || []).map(t => `<span>${escHtml(t)}</span>`).join('')}
          </div>
          <h3>${escHtml(item.title)}</h3>
          <p>${escHtml(item.description)}</p>
        </div>
      </div>
    `;
  }).join('');
}

/* ─────────────────────────────────────────
   POPULATE SERVICES
───────────────────────────────────────── */
async function loadServices() {
  const items = await apiFetch('/services');
  if (!items || !items.length) return;

  const grid = document.querySelector('.services-grid');
  if (!grid) return;

  grid.innerHTML = items.map(item => `
    <div class="service-card reveal">
      <div class="service-icon" style="background:${item.color}22">
        <i class="${escHtml(item.icon)}" style="color:${escHtml(item.color)}"></i>
      </div>
      <h3>${escHtml(item.title)}</h3>
      <p>${escHtml(item.description)}</p>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────
   POPULATE GALLERY
───────────────────────────────────────── */
async function loadGallery() {
  const items = await apiFetch('/gallery');
  if (!items || !items.length) return;

  const grid = document.querySelector('.gallery-grid');
  if (!grid) return;

  // Build gallery images array for lightbox
  window._galleryImages = items.map(item => ({
    src: imgSrc(item.url),
    alt: item.caption || 'Gallery'
  }));

  grid.innerHTML = items.map((item, i) => `
    <div class="gallery-item reveal" data-index="${i}">
      <img src="${imgSrc(item.url)}" alt="${escHtml(item.caption || 'Gallery')}" />
      <div class="gallery-overlay"><i class="fas fa-expand"></i></div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────
   POPULATE CERTIFICATIONS
───────────────────────────────────────── */
async function loadCertifications() {
  const items = await apiFetch('/certifications');
  if (!items || !items.length) return;

  const grid = document.querySelector('.certs-grid');
  if (!grid) return;

  grid.innerHTML = items.map(item => `
    <div class="cert-card reveal">
      <div class="cert-logo" style="color:${escHtml(item.color || '#3b82f6')}; background:${item.color || '#3b82f6'}18">
        <i class="${escHtml(item.icon || 'fas fa-certificate')}"></i>
      </div>
      <div class="cert-info">
        <h3>${escHtml(item.title)}</h3>
        <span class="cert-issuer">${escHtml(item.issuer)}</span>
        <span class="cert-date">${escHtml(item.year)}</span>
        <span class="cert-badge">${escHtml(item.category)}</span>
      </div>
    </div>
  `).join('');
}

/* ─────────────────────────────────────────
   CONTACT FORM  →  POST to API
───────────────────────────────────────── */
function initContactForm() {
  const form = document.getElementById('contactForm');
  const success = document.getElementById('formSuccess');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const inputs = form.querySelectorAll('input[required], textarea[required]');
    let valid = true;
    inputs.forEach(inp => {
      if (!inp.value.trim()) { inp.style.borderColor = '#ef4444'; valid = false; }
      else inp.style.borderColor = '';
    });
    if (!valid) return;

    const btn = form.querySelector('button[type="submit"]');
    btn.textContent = 'Sending...';
    btn.disabled = true;

    const body = {
      name:    form.querySelector('#name').value.trim(),
      email:   form.querySelector('#email').value.trim(),
      subject: form.querySelector('#subject').value.trim(),
      message: form.querySelector('#message').value.trim(),
    };

    try {
      const res = await fetch(`${API}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error();
      form.reset();
      if (success) { success.classList.add('show'); setTimeout(() => success.classList.remove('show'), 5000); }
    } catch {
      alert('Could not send message. Please try again.');
    } finally {
      btn.innerHTML = '<i class="fas fa-paper-plane"></i> Send Message';
      btn.disabled = false;
    }
  });
}

/* ─────────────────────────────────────────
   NAVBAR  (scroll + active link)
───────────────────────────────────────── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  const navLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('section[id]');
  const hamburger = document.getElementById('hamburger');
  const navLinksContainer = document.getElementById('navLinks');

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
    let current = '';
    sections.forEach(s => { if (window.scrollY >= s.offsetTop - 100) current = s.id; });
    navLinks.forEach(l => {
      l.classList.toggle('active', l.getAttribute('href') === `#${current}`);
    });
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('open');
    navLinksContainer.classList.toggle('open');
  });
  navLinksContainer.querySelectorAll('.nav-link').forEach(l => l.addEventListener('click', () => {
    hamburger.classList.remove('open');
    navLinksContainer.classList.remove('open');
  }));

  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (target) {
        e.preventDefault();
        window.scrollTo({ top: target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight, behavior: 'smooth' });
      }
    });
  });
}

/* ─────────────────────────────────────────
   REVEAL ON SCROLL
───────────────────────────────────────── */
function initReveal() {
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  // Observe now + re-observe after dynamic content is injected
  function observeAll() {
    document.querySelectorAll('.reveal').forEach(el => obs.observe(el));
  }
  observeAll();
  // Re-run after dynamic sections load
  setTimeout(observeAll, 500);
  setTimeout(observeAll, 1200);
}

/* ─────────────────────────────────────────
   SKILL BARS ANIMATION
───────────────────────────────────────── */
function initSkillBars() {
  const skillObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.skill-fill').forEach(bar => {
          bar.style.width = bar.getAttribute('data-width') + '%';
        });
        skillObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.3 });

  const skillsSection = document.getElementById('skills');
  if (skillsSection) skillObs.observe(skillsSection);

  // Also trigger after dynamic skills are loaded
  setTimeout(() => { if (skillsSection) skillObs.observe(skillsSection); }, 800);
}

/* ─────────────────────────────────────────
   STAT COUNTER ANIMATION
───────────────────────────────────────── */
function initCounters() {
  function animateCounter(el, target) {
    let n = 0;
    const step = target / (1800 / 16);
    const t = setInterval(() => {
      n += step;
      if (n >= target) { el.textContent = target + '+'; clearInterval(t); }
      else el.textContent = Math.floor(n) + '+';
    }, 16);
  }

  const statsObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.querySelectorAll('.stat-number').forEach(el => {
          const val = parseInt(el.textContent.replace('+', ''));
          if (!isNaN(val)) animateCounter(el, val);
        });
        statsObs.unobserve(e.target);
      }
    });
  }, { threshold: 0.5 });

  const heroStats = document.querySelector('.hero-stats');
  if (heroStats) statsObs.observe(heroStats);
}

/* ─────────────────────────────────────────
   GALLERY LIGHTBOX
───────────────────────────────────────── */
function initLightbox() {
  const lightbox    = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const closeBtn    = document.getElementById('lightboxClose');
  const prevBtn     = document.getElementById('lightboxPrev');
  const nextBtn     = document.getElementById('lightboxNext');
  if (!lightbox) return;

  let current = 0;

  function getImages() {
    return window._galleryImages || Array.from(document.querySelectorAll('.gallery-item img')).map(img => ({ src: img.src, alt: img.alt }));
  }

  function open(i) {
    const imgs = getImages();
    if (!imgs[i]?.src) return;
    current = i;
    lightboxImg.src = imgs[i].src;
    lightboxImg.alt = imgs[i].alt;
    lightbox.classList.add('active');
    document.body.style.overflow = 'hidden';
  }
  function close() { lightbox.classList.remove('active'); document.body.style.overflow = ''; lightboxImg.src = ''; }
  function next() { const imgs = getImages(); open((current + 1) % imgs.length); }
  function prev() { const imgs = getImages(); open((current - 1 + imgs.length) % imgs.length); }

  // Delegate click on gallery grid (handles dynamically added items)
  document.querySelector('.gallery-grid')?.addEventListener('click', e => {
    const item = e.target.closest('.gallery-item');
    if (item) open(parseInt(item.dataset.index) || 0);
  });

  closeBtn?.addEventListener('click', close);
  nextBtn?.addEventListener('click', next);
  prevBtn?.addEventListener('click', prev);
  lightbox.addEventListener('click', e => { if (e.target === lightbox) close(); });
  document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'ArrowLeft') prev();
  });
}

/* ─────────────────────────────────────────
   CHATBOT — full logic
───────────────────────────────────────── */
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

  let isOpen       = false;
  let isTyping     = false;
  let botConfig    = null;
  let hasGreeted   = false;
  const STORAGE_KEY = 'dejenie_chat_history';

  /* ── Load config from API ── */
  async function loadConfig() {
    const cfg = await apiFetch('/chatbot/config');
    if (!cfg) return;
    botConfig = cfg;
    if (botNameEl && cfg.botName) botNameEl.textContent = cfg.botName;
    if (input && cfg.placeholder)  input.placeholder    = cfg.placeholder;
    // Apply custom header color
    if (cfg.color) {
      const header = document.querySelector('.chat-header');
      const sendB  = document.querySelector('.chat-send-btn');
      const togB   = document.querySelector('.chat-toggle-btn');
      const startB = document.querySelector('.chat-start-btn');
      const introIcon = document.querySelector('.chat-intro-icon');
      if (header)    header.style.background    = cfg.color;
      if (sendB)     sendB.style.background     = cfg.color;
      if (togB)      togB.style.background      = cfg.color;
      if (startB)    startB.style.background    = cfg.color;
      if (introIcon) introIcon.style.background = cfg.color;
    }
    renderQuickReplies(cfg.quickReplies || []);
    updateIntroName();
  }

  /* ── Persist chat history ── */
  function saveHistory() {
    const msgs = [...messagesEl.querySelectorAll('.chat-msg')].map(m => ({
      role: m.classList.contains('bot') ? 'bot' : 'user',
      html: m.querySelector('.chat-msg-bubble').innerHTML
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

  /* ── Render a message bubble ── */
  function appendBubble(role, html, skipSave = false) {
    const wrap = document.createElement('div');
    wrap.className = `chat-msg ${role}`;

    const avatar = document.createElement('div');
    avatar.className = 'chat-msg-avatar';
    avatar.innerHTML = role === 'bot'
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

  /* ── Typing indicator ── */
  function showTyping() {
    const wrap = document.createElement('div');
    wrap.className = 'chat-msg bot chat-typing';
    wrap.id = 'chatTypingIndicator';
    wrap.innerHTML = `
      <div class="chat-msg-avatar"><i class="fas fa-robot"></i></div>
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

  /* ── Quick reply chips ── */
  function renderQuickReplies(replies) {
    quickEl.innerHTML = '';
    replies.forEach(text => {
      const btn = document.createElement('button');
      btn.className = 'chat-quick-btn';
      btn.textContent = text;
      btn.addEventListener('click', () => sendMessage(text));
      quickEl.appendChild(btn);
    });
  }

  /* ── Scroll to bottom ── */
  function scrollToBottom() {
    messagesEl.scrollTop = messagesEl.scrollHeight;
  }

  /* ── Send a message ── */
  async function sendMessage(text) {
    const msg = (text || input.value).trim();
    if (!msg || isTyping) return;

    // Show user bubble
    appendBubble('user', escHtml(msg));
    if (!text) { input.value = ''; sendBtn.disabled = true; }
    sendBtn.disabled = true;
    isTyping = true;

    // Show typing indicator (300–800ms delay for realism)
    showTyping();
    const delay = 400 + Math.random() * 500;

    try {
      const res = await fetch(`${API}/chatbot/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg })
      });
      const data = await res.json();

      await new Promise(r => setTimeout(r, delay));
      hideTyping();
      appendBubble('bot', data.reply || 'Sorry, I could not process that.');
    } catch {
      await new Promise(r => setTimeout(r, delay));
      hideTyping();
      appendBubble('bot', '⚠️ I\'m having trouble connecting. Please try again.');
    } finally {
      sendBtn.disabled = false;
      isTyping = false;
      input.focus();
    }
  }

  /* ── Intro screen elements ── */
  const introEl    = document.getElementById('chatIntro')
  const nameInput  = document.getElementById('chatUserName')
  const emailInput = document.getElementById('chatUserEmail')
  const startBtn   = document.getElementById('chatStartBtn')
  const inputArea  = document.getElementById('chatInputArea')
  const introNameEl= document.getElementById('chatIntroName')

  const USER_KEY = 'dejenie_chat_user'
  let chatUser = null

  // Try to restore saved user
  try { chatUser = JSON.parse(localStorage.getItem(USER_KEY)) } catch {}

  // Update intro bot name from config
  function updateIntroName() {
    if (introNameEl && botConfig?.botName) {
      // Strip "Bot" suffix for natural phrasing: "Dejenie Bot" → "Dejenie"
      introNameEl.textContent = botConfig.botName.replace(/\s*bot$/i, '').trim() || 'Dejenie'
    }
  }

  /* ── Show intro or chat based on saved user ── */
  function showIntro() {
    if (introEl)   introEl.style.display    = 'block'
    if (messagesEl) messagesEl.style.display = 'none'
    if (quickEl)   quickEl.style.display    = 'none'
    if (inputArea) inputArea.style.display  = 'none'
  }

  function showChatArea() {
    if (introEl)   introEl.style.display    = 'none'
    if (messagesEl) messagesEl.style.display = 'flex'
    if (quickEl)   quickEl.style.display    = 'flex'
    if (inputArea) inputArea.style.display  = 'flex'
  }

  /* ── Start chatting after intro form ── */
  function startChat() {
    const name  = nameInput?.value.trim()
    const email = emailInput?.value.trim()
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

    // Validate
    if (!name) { nameInput?.classList.add('error'); nameInput?.focus(); return }
    nameInput?.classList.remove('error')
    if (!email || !emailOk) { emailInput?.classList.add('error'); emailInput?.focus(); return }
    emailInput?.classList.remove('error')

    // Save user
    chatUser = { name, email }
    try { localStorage.setItem(USER_KEY, JSON.stringify(chatUser)) } catch {}

    // Switch to chat
    showChatArea()

    // Send personalised greeting
    if (!hasGreeted) {
      hasGreeted = true
      const alreadyHasHistory = loadHistory()
      if (!alreadyHasHistory) {
        const greeting = (botConfig?.greeting || "Hi there! 👋 I'm Dejenie's assistant. Ask me anything!")
          .replace('Hi there!', `Hi ${name}!`)
        setTimeout(() => {
          showTyping()
          setTimeout(() => { hideTyping(); appendBubble('bot', greeting) }, 800)
        }, 300)
      }
    }
    input?.focus()
  }

  /* ── Toggle open/close ── */
  function openChat() {
    isOpen = true
    widget.classList.add('open')
    if (badgeEl) badgeEl.style.display = 'none'

    // If user already introduced themselves → go straight to chat
    if (chatUser) {
      showChatArea()
      if (!hasGreeted) {
        hasGreeted = true
        const alreadyHasHistory = loadHistory()
        if (!alreadyHasHistory) {
          const greeting = (botConfig?.greeting || "Hi there! 👋 I'm Dejenie's assistant.")
            .replace('Hi there!', `Hi ${chatUser.name}!`)
          setTimeout(() => {
            showTyping()
            setTimeout(() => { hideTyping(); appendBubble('bot', greeting) }, 800)
          }, 300)
        }
      }
      input?.focus()
    } else {
      // Show intro form first
      showIntro()
      setTimeout(() => nameInput?.focus(), 300)
    }
  }

  function closeChat() {
    isOpen = false
    widget.classList.remove('open')
  }

  function clearChat() {
    messagesEl.innerHTML = ''
    try { localStorage.removeItem(STORAGE_KEY) } catch {}
    // Also clear user so intro shows again
    try { localStorage.removeItem(USER_KEY) } catch {}
    chatUser = null
    hasGreeted = false
    showIntro()
    if (nameInput)  nameInput.value  = ''
    if (emailInput) emailInput.value = ''
  }

  /* ── Event listeners ── */
  toggleBtn.addEventListener('click', () => isOpen ? closeChat() : openChat())
  closeBtn.addEventListener('click',  closeChat)
  clearBtn.addEventListener('click',  clearChat)

  sendBtn.addEventListener('click',   () => sendMessage())
  input.addEventListener('keydown',   e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() } })

  // Enable/disable send button based on input content
  input.addEventListener('input', () => {
    sendBtn.disabled = input.value.trim().length === 0
  })

  // Intro form submit
  startBtn?.addEventListener('click', startChat)
  nameInput?.addEventListener('keydown',  e => { if (e.key === 'Enter') emailInput?.focus() })
  emailInput?.addEventListener('keydown', e => { if (e.key === 'Enter') startChat() })
  nameInput?.addEventListener('input',  () => nameInput.classList.remove('error'))
  emailInput?.addEventListener('input', () => emailInput.classList.remove('error'))

  // Show badge after 3s if not opened yet
  setTimeout(() => {
    if (!isOpen && badgeEl) badgeEl.style.display = 'flex';
  }, 3000);

  // Load config on init
  loadConfig();
}

/* ─────────────────────────────────────────
   MAIN — load everything
───────────────────────────────────────── */
async function main() {
  // Static UI inits first
  initNavbar();
  initReveal();
  initSkillBars();
  initCounters();
  initLightbox();
  initContactForm();
  initChatbot();

  // Fetch & render dynamic content in parallel
  await Promise.all([
    loadProfile(),
    loadExperience(),
    loadSkills(),
    loadProjects(),
    loadServices(),
    loadGallery(),
    loadCertifications(),
  ]);

  // Re-run reveal & skill bars after dynamic content is injected
  document.querySelectorAll('.reveal').forEach(el => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    obs.observe(el);
  });
  initSkillBars();
}

window.addEventListener('DOMContentLoaded', main);
