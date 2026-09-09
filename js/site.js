/* E.B.D. Kežmarok — progressive enhancement. Page reads fully without JS. */
(function () {
  'use strict';

  var doc = document;
  var nav = doc.getElementById('nav');
  var toggle = nav && nav.querySelector('.nav-toggle');
  var links = Array.prototype.slice.call(doc.querySelectorAll('.nav-links a'));
  var sections = Array.prototype.slice.call(doc.querySelectorAll('main section[id]'));
  var sheet = doc.querySelector('.sheet');
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* e-mail: never present as plain text in the HTML; assembled here.
     Parts are stored reversed so naive address scrapers miss them. */
  var rev = function (s) { return s.split('').reverse().join(''); };
  var addr = rev('koramzekdbe') + String.fromCharCode(64) + rev('ks.koramzekdbe');
  var templates = {
    konzultacia: {
      s: 'Konzultácia – E.B.D. Kežmarok',
      b: 'Dobrý deň,\n\nmám záujem o konzultáciu.\n\nKto sme (obec / firma): \nO čo ide (ÚPN, ZaD, zámer EIA, SEA, záväzné stanovisko): \nAktuálny stav: \nTermín: \nTelefón: \n\nS pozdravom\n'
    },
    dopyt: {
      s: 'Dopyt – poradenstvo',
      b: 'Dobrý deň,\n\nKto sme (obec / firma): \nO čo ide (ÚPN, ZaD, zámer EIA, SEA, záväzné stanovisko): \nAktuálny stav (rok schválenia ÚPN / stupeň prípravy zámeru): \nTermín, dokedy potrebujeme výstup: \nTelefón: \n\nS pozdravom\n'
    }
  };
  Array.prototype.slice.call(doc.querySelectorAll('.js-mail')).forEach(function (el) {
    var kind = el.getAttribute('data-mail');
    if (kind === 'plain') {
      if (el.tagName === 'A') { el.href = 'mailto:' + addr; }
      else {
        var a = doc.createElement('a');
        a.href = 'mailto:' + addr;
        a.textContent = addr;
        a.className = el.className.replace('js-mail', '').trim();
        el.replaceWith(a);
      }
      return;
    }
    var t = templates[kind] || templates.konzultacia;
    el.href = 'mailto:' + addr + '?subject=' + encodeURIComponent(t.s) + '&body=' + encodeURIComponent(t.b);
  });

  /* hero drawing: layers appear in drawing order, once */
  if (sheet) {
    requestAnimationFrame(function () {
      setTimeout(function () { sheet.classList.add('drawn'); }, 80);
    });
  }

  /* mobile menu */
  if (toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
      toggle.setAttribute('aria-label', open ? 'Zavrieť menu' : 'Otvoriť menu');
    });
    links.forEach(function (a) {
      a.addEventListener('click', function () {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      });
    });
    doc.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.focus();
      }
    });
  }

  /* active section in nav */
  var ticking = false;
  function updateActive() {
    var y = window.scrollY + 120;
    var current = null;
    for (var i = 0; i < sections.length; i++) {
      if (sections[i].offsetTop <= y) current = sections[i].id;
    }
    links.forEach(function (a) {
      var on = current && a.getAttribute('href') === '#' + current;
      a.classList.toggle('active', !!on);
      if (on) a.setAttribute('aria-current', 'true'); else a.removeAttribute('aria-current');
    });
  }
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () { updateActive(); ticking = false; });
  }, { passive: true });
  updateActive();

  /* short fade-in for blocks */
  var items = Array.prototype.slice.call(doc.querySelectorAll('.reveal'));
  if (reduce || !('IntersectionObserver' in window)) {
    items.forEach(function (el) { el.classList.add('in-view'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        en.target.classList.add('in-view');
        io.unobserve(en.target);
      });
    }, { threshold: 0.05, rootMargin: '0px 0px -40px 0px' });
    items.forEach(function (el) { io.observe(el); });
  }

  /* anchor scroll offset for fixed nav */
  doc.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = a.getAttribute('href').slice(1);
    var target = id && doc.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var top = target.getBoundingClientRect().top + window.scrollY - ((nav ? nav.offsetHeight : 0) + 12);
    window.scrollTo({ top: Math.max(top, 0), behavior: reduce ? 'auto' : 'smooth' });
    if (history.pushState) history.pushState(null, '', '#' + id);
  });
})();
