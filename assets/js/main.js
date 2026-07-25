/* Cleer Money shared site behaviour (vanilla JS, no dependencies) */
(function () {
  'use strict';

  // ── Cookie consent (gates Google Analytics) ─────────────────
  // GA sets analytics cookies, so it must not load until the visitor
  // explicitly accepts (OAIC guidance: no pre-ticked/implied consent).
  // The waitlist form is functional and is not gated by this.
  var GA_ID = 'G-7C6XX8W0JV';
  var CONSENT_KEY = 'cm-cookie-consent'; // 'accepted' | 'declined'

  function readConsent() {
    try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; }
  }

  function storeConsent(value) {
    try { localStorage.setItem(CONSENT_KEY, value); } catch (e) {}
  }

  function loadAnalytics() {
    if (window.gtag) return;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA_ID);
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
  }

  function showCookieBanner() {
    var banner = document.createElement('div');
    banner.className = 'cookie-banner';
    banner.setAttribute('role', 'region');
    banner.setAttribute('aria-label', 'Cookie consent');
    banner.innerHTML =
      '<p class="cookie-banner__text">We’d like to use an analytics cookie (Google Analytics) to understand ' +
      'how people use this site. Nothing is set unless you accept. ' +
      '<a href="/privacy.html">Privacy Policy</a></p>' +
      '<div class="cookie-banner__actions">' +
      '<button type="button" class="btn btn--ghost" data-consent="declined">Decline</button>' +
      '<button type="button" class="btn btn--green" data-consent="accepted">Accept</button>' +
      '</div>';
    banner.addEventListener('click', function (e) {
      var btn = e.target.closest('[data-consent]');
      if (!btn) return;
      var choice = btn.getAttribute('data-consent');
      storeConsent(choice);
      if (choice === 'accepted') loadAnalytics();
      banner.remove();
    });
    document.body.appendChild(banner);
  }

  var consent = readConsent();
  if (consent === 'accepted') {
    loadAnalytics();
  } else if (consent !== 'declined') {
    showCookieBanner();
  }

  // ── Analytics shim (rides on the consented GA4; no-op until consent) ─
  // One helper so every event goes through the same place. If we later swap
  // GA for a cookieless tool (e.g. Plausible), only this function changes.
  function track(name, params) {
    try {
      if (typeof window.gtag === 'function') window.gtag('event', name, params || {});
    } catch (e) {}
  }

  var PAGE = (document.body && document.body.getAttribute('data-page')) || 'other';

  // Named page-view events so the funnel reads cleanly: try_view → demo_completed → cta_click.
  if (PAGE === 'home') track('homepage_view', { page: 'home' });
  if (PAGE === 'try')  track('try_view', { page: 'try' });

  // ── Launch config: point + label every CTA from one source ───
  // Every primary CTA site-wide carries data-cta="<label key>". This reads the
  // active launch state (config.js) and sets the destination + wording, and
  // records a single cta_click event (same event in both launch modes, with the
  // mode as a property) so the funnel stays comparable across launch.
  var LAUNCH = window.CLEER_LAUNCH;
  if (LAUNCH) {
    document.querySelectorAll('[data-cta]').forEach(function (el) {
      if (LAUNCH.href) el.setAttribute('href', LAUNCH.href);
      var key = el.getAttribute('data-cta');
      if (key && LAUNCH.labels && LAUNCH.labels[key]) el.textContent = LAUNCH.labels[key];
      el.addEventListener('click', function () {
        track('cta_click', { mode: LAUNCH.state, source: PAGE, cta: key || 'primary' });
      });
    });
    document.querySelectorAll('[data-launch-badge]').forEach(function (el) {
      if (LAUNCH.badge) el.textContent = LAUNCH.badge;
    });
    document.querySelectorAll('[data-launch-note]').forEach(function (el) {
      if (LAUNCH.note) el.textContent = LAUNCH.note;
    });
  }

  // ── Mobile menu ──────────────────────────────────────────────
  var toggle = document.querySelector('.nav__toggle');
  var menu = document.getElementById('mobileMenu');

  function closeMenu() {
    if (!menu || !toggle) return;
    menu.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  if (toggle && menu) {
    toggle.addEventListener('click', function () {
      var open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
      document.body.style.overflow = open ? 'hidden' : '';
    });
    menu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ── Nav border on scroll ─────────────────────────────────────
  var nav = document.querySelector('.nav');
  if (nav) {
    var onScroll = function () {
      nav.classList.toggle('is-scrolled', window.scrollY > 24);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // ── Scroll reveal ────────────────────────────────────────────
  var reveals = document.querySelectorAll('.reveal');
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (reveals.length) {
    if (reduceMotion || !('IntersectionObserver' in window)) {
      reveals.forEach(function (el) { el.classList.add('is-visible'); });
    } else {
      var observer = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
      reveals.forEach(function (el) { observer.observe(el); });
    }
  }

  // ── FAQ accordion (help page) ────────────────────────────────
  document.querySelectorAll('.faq-question').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var item = btn.parentElement;
      var wasOpen = item.classList.contains('is-open');
      var category = item.closest('.faq-category');
      if (category) {
        category.querySelectorAll('.faq-item').forEach(function (i) {
          i.classList.remove('is-open');
          var q = i.querySelector('.faq-question');
          if (q) q.setAttribute('aria-expanded', 'false');
        });
      }
      if (!wasOpen) {
        item.classList.add('is-open');
        btn.setAttribute('aria-expanded', 'true');
      }
    });
  });

  // ── Scroll spy: highlight the nav link for the section in view ─
  var spyLinks = Array.prototype.slice.call(
    document.querySelectorAll('.nav__links a[href^="#"]')
  );
  if (spyLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    var sections = [];
    spyLinks.forEach(function (link) {
      var id = link.getAttribute('href').slice(1);
      var section = id && document.getElementById(id);
      if (section) { byId[id] = link; sections.push(section); }
    });
    if (sections.length) {
      var clearCurrent = function () {
        spyLinks.forEach(function (l) { l.removeAttribute('aria-current'); });
      };
      var spy = new IntersectionObserver(function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            clearCurrent();
            var link = byId[entry.target.id];
            if (link) link.setAttribute('aria-current', 'location');
          }
        });
      }, { rootMargin: '-45% 0px -50% 0px' });
      sections.forEach(function (s) { spy.observe(s); });
    }
  }

  // ── Interactive Want/Need demo ───────────────────────────────
  var demoDeck = document.getElementById('demoDeck');
  if (demoDeck) {
    var cards = Array.prototype.slice.call(demoDeck.querySelectorAll('.demo__card'));
    var total = cards.length;
    var idx = 0;
    var counts = { need: 0, want: 0 };
    var completed = false; // guards showResult so demo_completed fires exactly once
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var stage = document.querySelector('.demo__stage');
    var controls = document.querySelector('.demo__controls');
    var countEl = document.getElementById('demoCount');
    var totalEl = document.getElementById('demoTotal');
    var result = document.getElementById('demoResult');
    if (totalEl) totalEl.textContent = String(total);

    function positions() {
      cards.forEach(function (card, i) {
        if (i < idx) { card.dataset.pos = 'gone'; return; }
        var rel = i - idx;
        card.dataset.pos = rel <= 2 ? String(rel) : 'hidden';
      });
    }

    function clearStamps(card) {
      card.querySelectorAll('.demo__stamp').forEach(function (s) { s.style.opacity = ''; });
    }

    function classify(choice) {
      if (idx >= total) return;
      var card = cards[idx];
      counts[choice]++;
      idx++;
      if (countEl) countEl.textContent = String(idx);
      var stamp = card.querySelector(choice === 'need' ? '.demo__stamp--need' : '.demo__stamp--want');
      if (stamp) stamp.style.opacity = '1';
      card.style.transition = reduce ? 'none' : 'transform 0.35s ease, opacity 0.35s ease';
      card.style.transform = (choice === 'need' ? 'translateX(140%)' : 'translateX(-140%)') +
        ' rotate(' + (choice === 'need' ? 16 : -16) + 'deg)';
      card.style.opacity = '0';
      var done = function () {
        positions();
        if (idx >= total) showResult();
      };
      if (reduce) done(); else setTimeout(done, 300);
    }

    function showResult() {
      if (completed) return;
      completed = true;
      var t = counts.need + counts.want || 1;
      var needPct = Math.round((counts.need / t) * 100);
      var wantPct = 100 - needPct;
      document.getElementById('demoNeedPct').textContent = String(needPct);
      document.getElementById('demoWantPct').textContent = String(wantPct);
      document.getElementById('demoMsg').textContent =
        needPct >= 70 ? 'Mostly needs. You spend with intention, and Cleer Money helps you keep it that way.'
        : needPct >= 40 ? 'A balanced week. Seeing the split is the first step to shaping it.'
        : 'Plenty of wants this week, no judgement. Awareness is where better habits start.';
      if (stage) stage.hidden = true;
      result.hidden = false;
      var needBar = document.getElementById('demoNeedBar');
      var wantBar = document.getElementById('demoWantBar');
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          needBar.style.width = needPct + '%';
          wantBar.style.width = wantPct + '%';
        });
      });
      track('demo_completed', { page: PAGE, want_pct: wantPct, need_pct: needPct });
    }

    function reset() {
      idx = 0; counts = { need: 0, want: 0 }; completed = false;
      if (countEl) countEl.textContent = '0';
      cards.forEach(function (c) {
        c.style.transition = 'none';
        c.style.transform = ''; c.style.opacity = '';
        clearStamps(c);
      });
      void demoDeck.offsetWidth; // reflow so restored transitions don't animate the reset
      cards.forEach(function (c) { c.style.transition = ''; });
      positions();
      document.getElementById('demoNeedBar').style.width = '0';
      document.getElementById('demoWantBar').style.width = '0';
      result.hidden = true;
      if (stage) stage.hidden = false;
      demoDeck.focus();
    }

    if (controls) {
      controls.addEventListener('click', function (e) {
        var btn = e.target.closest('.demo__btn');
        if (btn) classify(btn.dataset.choice);
      });
    }
    var resetBtn = document.getElementById('demoReset');
    if (resetBtn) resetBtn.addEventListener('click', reset);

    demoDeck.addEventListener('keydown', function (e) {
      if (e.key === 'ArrowRight') { e.preventDefault(); classify('need'); }
      else if (e.key === 'ArrowLeft') { e.preventDefault(); classify('want'); }
    });

    // Pointer drag on the top card
    var dragCard = null, startX = 0, dragging = false;
    demoDeck.addEventListener('pointerdown', function (e) {
      var card = e.target.closest('.demo__card');
      if (!card || card.dataset.pos !== '0' || idx >= total) return;
      dragCard = card; startX = e.clientX; dragging = true;
      card.style.transition = 'none';
      try { card.setPointerCapture(e.pointerId); } catch (err) {}
    });
    demoDeck.addEventListener('pointermove', function (e) {
      if (!dragging || !dragCard) return;
      var dx = e.clientX - startX;
      dragCard.style.transform = 'translateX(' + dx + 'px) rotate(' + (dx / 22) + 'deg)';
      var need = dragCard.querySelector('.demo__stamp--need');
      var want = dragCard.querySelector('.demo__stamp--want');
      if (need) need.style.opacity = dx > 16 ? String(Math.min(1, dx / 110)) : '0';
      if (want) want.style.opacity = dx < -16 ? String(Math.min(1, -dx / 110)) : '0';
    });
    function endDrag(e) {
      if (!dragging || !dragCard) return;
      dragging = false;
      var dx = e.clientX - startX;
      var card = dragCard; dragCard = null;
      card.style.transition = '';
      if (Math.abs(dx) > 88) {
        classify(dx > 0 ? 'need' : 'want');
      } else {
        card.style.transform = '';
        clearStamps(card);
      }
    }
    demoDeck.addEventListener('pointerup', endDrag);
    demoDeck.addEventListener('pointercancel', endDrag);

    positions();
  }

  // ── Waitlist form (posts to a Google Apps Script → Sheet) ────
  var wlForm = document.getElementById('waitlistForm');
  if (wlForm) {
    var wlInput = document.getElementById('waitlistEmail');
    var wlStatus = document.getElementById('waitlistStatus');
    var wlBtn = wlForm.querySelector('button[type="submit"]');
    var emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

    var setWlStatus = function (msg, kind) {
      wlStatus.textContent = msg;
      wlStatus.className = 'waitlist__status is-' + kind;
    };

    wlForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var email = (wlInput.value || '').trim();
      if (!emailRe.test(email)) {
        setWlStatus('Please enter a valid email address.', 'error');
        wlInput.focus();
        return;
      }
      var endpoint = wlForm.getAttribute('data-endpoint');
      if (!endpoint || endpoint.indexOf('PASTE_') === 0) {
        setWlStatus('The waitlist isn’t connected yet. Please check back soon.', 'error');
        return;
      }

      wlBtn.disabled = true;
      setWlStatus('Adding you…', 'pending');

      var body = new URLSearchParams();
      body.set('email', email);
      body.set('source', 'website');
      var hp = wlForm.querySelector('.waitlist__hp');
      body.set('website', hp ? hp.value : '');

      // Apps Script web apps don't return CORS headers, so we use no-cors:
      // the write still happens; we just can't read the response.
      fetch(endpoint, { method: 'POST', mode: 'no-cors', body: body })
        .then(function () {
          wlForm.reset();
          setWlStatus('You’re on the list! We’ll email you the moment Cleer Money launches.', 'success');
        })
        .catch(function () {
          setWlStatus('Something went wrong. Please try again, or email support@cleermoney.com.au.', 'error');
        })
        .finally(function () { wlBtn.disabled = false; });
    });
  }

  // ── Footer year ──────────────────────────────────────────────
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });
})();
