/* ============================================================
   Dymek — lean interaction layer
   Four concerns only: reveals, scroll progress, masthead state,
   contents panel. No dependencies.
   ============================================================ */
(function () {
  'use strict';

  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ── 1. reveal on enter ─────────────────────────────────── */
  var revealables = document.querySelectorAll('.r');

  Array.prototype.forEach.call(revealables, function (el) {
    var d = el.getAttribute('data-d');
    if (d) el.style.setProperty('--d', d);
  });

  if (reduce || !('IntersectionObserver' in window)) {
    Array.prototype.forEach.call(revealables, function (el) { el.classList.add('is-in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });

    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });

    // anything already above the fold shows immediately
    requestAnimationFrame(function () {
      Array.prototype.forEach.call(revealables, function (el) {
        if (el.getBoundingClientRect().top < window.innerHeight * 0.92) {
          el.classList.add('is-in');
          io.unobserve(el);
        }
      });
    });
  }

  /* ── 2. masthead + progress + active section ────────────── */
  var head = document.getElementById('masthead');
  var bar = document.getElementById('progressBar');
  var links = document.querySelectorAll('.idx__list a');
  var sections = [];

  Array.prototype.forEach.call(links, function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el) sections.push({ link: a, el: el });
  });

  var lastY = window.scrollY;
  var ticking = false;

  function onFrame() {
    ticking = false;
    var y = window.scrollY;
    var doc = document.documentElement.scrollHeight - window.innerHeight;

    if (bar) bar.style.width = (doc > 0 ? (y / doc) * 100 : 0) + '%';

    // dark hero band behind the header -> transparent; past it -> light
    var heroEnd = (document.getElementById('s1') || {}).offsetHeight || 600;
    head.classList.toggle('is-lifted', y > heroEnd - 120 && !isDarkBandAt(y));
    head.classList.toggle('is-hidden', y > 420 && y > lastY + 4 && !panelOpen);
    lastY = y;

    // nearest section for the contents panel
    var mid = y + window.innerHeight * 0.32;
    var current = null;
    sections.forEach(function (s) {
      if (s.el.offsetTop <= mid) current = s;
    });
    sections.forEach(function (s) {
      s.link.classList.toggle('is-here', s === current);
    });
  }

  // is the strip under the header a dark section?
  function isDarkBandAt(y) {
    var probe = y + 8;
    var dark = document.querySelectorAll('.sec--ink');
    for (var i = 0; i < dark.length; i++) {
      var top = dark[i].offsetTop;
      if (probe >= top && probe <= top + dark[i].offsetHeight) return true;
    }
    return false;
  }

  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(onFrame);
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onFrame();

  /* ── 3. contents panel ──────────────────────────────────── */
  var btn = document.getElementById('idxBtn');
  var panel = document.getElementById('idxPanel');
  var panelOpen = false;

  function setPanel(open) {
    panelOpen = open;
    btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) {
      panel.hidden = false;
      head.classList.remove('is-hidden');
      requestAnimationFrame(function () { panel.classList.add('is-open'); });
    } else {
      panel.classList.remove('is-open');
      window.setTimeout(function () { if (!panelOpen) panel.hidden = true; }, 300);
    }
  }

  btn.addEventListener('click', function () { setPanel(!panelOpen); });

  Array.prototype.forEach.call(links, function (a) {
    a.addEventListener('click', function () { setPanel(false); });
  });

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && panelOpen) { setPanel(false); btn.focus(); }
  });

  document.addEventListener('click', function (e) {
    if (!panelOpen) return;
    if (panel.contains(e.target) || btn.contains(e.target)) return;
    setPanel(false);
  });

  /* ── 4. form ────────────────────────────────────────────── */
  var form = document.getElementById('enquiry');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.classList.add('is-sent');
    });
  }
})();
