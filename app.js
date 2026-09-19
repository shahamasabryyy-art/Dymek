(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
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
    }, { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    Array.prototype.forEach.call(revealables, function (el) { io.observe(el); });
  }

  var bar = document.getElementById('progressBar');
  window.addEventListener('scroll', function () {
    var y = window.scrollY;
    var doc = document.documentElement.scrollHeight - window.innerHeight;
    if (bar) bar.style.width = (doc > 0 ? (y / doc) * 100 : 0) + '%';
  }, { passive: true });

  var horizontalLinks = document.querySelectorAll('.nav-horizontal a');
  var hSections = [];
  Array.prototype.forEach.call(horizontalLinks, function (a) {
    var el = document.querySelector(a.getAttribute('href'));
    if (el) hSections.push({ link: a, el: el });
  });

  window.addEventListener('scroll', function () {
    var mid = window.scrollY + window.innerHeight * 0.35;
    var currentH = null;
    hSections.forEach(function (s) { if (s.el.offsetTop <= mid) currentH = s; });
    hSections.forEach(function (s) { s.link.classList.toggle('is-here', s === currentH); });
  }, { passive: true });

  var faqTabs = document.querySelectorAll('.faq-tab-btn');
  var faqPanels = document.querySelectorAll('.faq-panel');
  Array.prototype.forEach.call(faqTabs, function (btn) {
    btn.addEventListener('click', function () {
      var targetIdx = btn.getAttribute('data-faq');
      
      Array.prototype.forEach.call(faqTabs, function (t) {
        t.classList.remove('active');
        t.setAttribute('aria-selected', 'false');
      });
      btn.classList.add('active');
      btn.setAttribute('aria-selected', 'true');

      Array.prototype.forEach.call(faqPanels, function (p) {
        p.classList.remove('active');
      });
      var targetPanel = document.querySelector('.faq-panel[data-faq-panel="' + targetIdx + '"]');
      if (targetPanel) {
        targetPanel.classList.add('active');
      }
    });
  });

  var form = document.getElementById('enquiry');
  if (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      form.style.opacity = '0.5';
      form.style.pointerEvents = 'none';
      alert('Enquiry received. Dymek coordination team will contact you.');
    });
  }
})();
