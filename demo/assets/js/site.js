/* BK-Dach GmbH — Demo
   Bewegungsschicht nach dem Vorbild von klindworthroofing.com:
   weiches Scrollen (Lenis), drei Auftrittsarten und Parallax über --parallax-percent. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var touch = ('ontouchstart' in window) || navigator.maxTouchPoints > 2;

  /* =======================================================
     Überschriften in Zeilen und Wörter zerlegen
     ======================================================= */
  function splitWords(el) {
    if (el.dataset.split === 'done') return;
    var raw = el.innerHTML;
    // vorhandene Auszeichnung im Text (z. B. <span class="accent">) bleibt erhalten
    var tmp = document.createElement('div');
    tmp.innerHTML = raw;

    var parts = [];
    (function walk(node) {
      node.childNodes.forEach(function (n) {
        if (n.nodeType === 3) {
          n.textContent.split(/(\s+)/).forEach(function (t) {
            if (t.trim()) parts.push({ text: t, wrap: null });
            else if (t) parts.push({ text: ' ', wrap: 'space' });
          });
        } else if (n.nodeType === 1) {
          if (n.tagName === 'BR') { parts.push({ text: '', wrap: 'br' }); return; }
          var open = n.cloneNode(false).outerHTML.replace(/<\/[a-z]+>$/i, '');
          n.childNodes.forEach(function () {});
          // einfache Inline-Auszeichnung: Inhalt als ein Wort behandeln
          parts.push({ text: n.textContent, wrap: 'el', html: open + n.innerHTML + '</' + n.tagName.toLowerCase() + '>' });
        }
      });
    })(tmp);

    el.innerHTML = '';
    var frag = document.createDocumentFragment();
    parts.forEach(function (p) {
      if (p.wrap === 'space') { frag.appendChild(document.createTextNode(' ')); return; }
      if (p.wrap === 'br') { frag.appendChild(document.createElement('br')); return; }
      var s = document.createElement('span');
      s.className = 'word';
      if (p.wrap === 'el') s.innerHTML = p.html; else s.textContent = p.text;
      frag.appendChild(s);
      frag.appendChild(document.createTextNode(' '));
    });
    el.appendChild(frag);

    // Wörter nach ihrer visuellen Zeile gruppieren
    var words = Array.prototype.slice.call(el.querySelectorAll('.word'));
    if (!words.length) { el.dataset.split = 'done'; return; }
    var lines = [];
    var current = null;
    var lastTop = null;
    words.forEach(function (w) {
      var top = Math.round(w.offsetTop);
      if (lastTop === null || Math.abs(top - lastTop) > 4) { current = []; lines.push(current); lastTop = top; }
      current.push(w);
    });

    el.innerHTML = '';
    lines.forEach(function (group) {
      var line = document.createElement('span');
      line.className = 'line';
      line.style.display = 'block';
      group.forEach(function (w, i) {
        line.appendChild(w);
        if (i < group.length - 1) line.appendChild(document.createTextNode(' '));
      });
      el.appendChild(line);
    });
    el.dataset.split = 'done';
  }

  var splitDone = false;
  function splitAll() {
    if (splitDone) return;
    splitDone = true;
    document.querySelectorAll('[data-animate="words"]').forEach(splitWords);
    if (typeof measureAll === 'function') measureAll();
  }
  // Erst zerlegen, wenn die Schriften sitzen — sonst stimmen die Zeilenumbrüche nicht.
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(splitAll);
    setTimeout(splitAll, 1200);
  } else {
    splitAll();
  }

  /* =======================================================
     Auftritt beim Scrollen
     ======================================================= */
  var reveals = [];
  function collectReveals() {
    reveals = Array.prototype.slice.call(document.querySelectorAll('[data-animate]:not([data-animated])')).map(function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, top: r.top + window.scrollY };
    });
  }

  function runReveals() {
    var factor = window.innerWidth > 1000 ? 0.85 : 0.94;
    var line = window.scrollY + window.innerHeight * factor;
    if (reveals.length) {
      var done = [];
      for (var i = 0; i < reveals.length; i++) {
        if (reveals[i].top <= line) {
          reveals[i].el.setAttribute('data-animated', '');
          done.push(i);
        }
      }
      for (var j = done.length - 1; j >= 0; j--) reveals.splice(done[j], 1);
    }
    runCounters(line);
  }

  /* =======================================================
     Kennzahlen hochzählen
     ======================================================= */
  var counters = [];
  function collectCounters() {
    counters = Array.prototype.slice.call(document.querySelectorAll('[data-count]:not([data-counted])')).map(function (el) {
      var r = el.getBoundingClientRect();
      return { el: el, top: r.top + window.scrollY };
    });
  }

  function countText(value, suffix) {
    // erst ab vier Stellen ein Trennzeichen, sonst bleibt die Zahl blank
    return (value >= 1000 ? value.toLocaleString('de-DE') : String(value)) + suffix;
  }

  function startCount(el) {
    el.setAttribute('data-counted', '');
    var target = parseFloat(el.getAttribute('data-count'));
    if (!isFinite(target)) return;
    target = Math.round(target);
    var suffix = el.getAttribute('data-suffix') || '';
    if (reduced) { el.textContent = countText(target, suffix); return; }

    var begin = 0;
    el.textContent = countText(0, suffix);
    requestAnimationFrame(function step(now) {
      if (!begin) begin = now;
      var t = (now - begin) / 1400;
      if (t >= 1) { el.textContent = countText(target, suffix); return; }
      el.textContent = countText(Math.round(target * (1 - Math.pow(1 - t, 3))), suffix);
      requestAnimationFrame(step);
    });
  }

  function runCounters(line) {
    if (!counters.length) return;
    var rest = [];
    for (var i = 0; i < counters.length; i++) {
      if (counters[i].top <= line) startCount(counters[i].el);
      else rest.push(counters[i]);
    }
    counters = rest;
  }

  /* =======================================================
     Parallax
     ======================================================= */
  var parallax = [];
  function collectParallax() {
    parallax = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]')).map(function (el) {
      var r = el.getBoundingClientRect();
      var top = r.top + window.scrollY;
      return { el: el, top: top, height: el.offsetHeight, bottom: top + el.offsetHeight };
    });
  }

  function runParallax() {
    var vh = window.innerHeight;
    var y = window.scrollY;
    var bodyH = document.body.scrollHeight;
    for (var i = 0; i < parallax.length; i++) {
      var p = parallax[i];
      if (y + vh < p.top || y > p.bottom) continue;
      var v;
      if (p.top < vh) {
        v = y / Math.max(vh, p.bottom);
      } else if (p.bottom > bodyH - vh) {
        v = (y + vh - p.top) / Math.max(1, bodyH - p.top);
      } else {
        v = (y + vh - p.top) / (p.height + vh);
      }
      v = v > 1 ? 1 : v < 0 ? 0 : v;
      p.el.style.setProperty('--parallax-percent', v.toFixed(4));
    }
  }

  /* =======================================================
     Weiches Scrollen
     ======================================================= */
  var lenis = null;
  if (!reduced && !touch && window.Lenis) {
    lenis = new window.Lenis({
      duration: 1.1,
      easing: function (t) { return Math.min(1, 1.001 - Math.pow(2, -10 * t)); },
      smoothWheel: true,
      touchMultiplier: 1.6,
    });
    var raf = function (time) { lenis.raf(time); requestAnimationFrame(raf); };
    requestAnimationFrame(raf);
    lenis.on('scroll', onScroll);
  }

  var ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      runPins();
      runReveals();
      runParallax();
      ticking = false;
    });
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', function () {
    collectReveals();
    collectCounters();
    collectPins();
    collectParallax();
    onScroll();
  });

  /* =======================================================
     Angeheftete Sektion: senkrechtes Scrollen schiebt waagerecht
     ======================================================= */
  var pins = [];

  function pinActive() {
    // Auf schmalen Schirmen und bei reduzierter Bewegung bleibt es beim Wischen
    return !reduced && window.innerWidth > 900;
  }

  function collectPins() {
    pins = [];
    document.querySelectorAll('.rail-pin').forEach(function (pin) {
      var rail = pin.querySelector('.rail');
      if (!rail) return;

      var span = rail.scrollWidth - rail.clientWidth;
      var on = pinActive() && span > 40;

      pin.classList.toggle('is-pinning', on);
      // Der Rahmen wird um genau die Scrollweite höher — dadurch läuft die
      // Bewegung 1:1 mit dem Scrollrad.
      pin.style.height = on ? 'calc(100lvh + ' + Math.round(span) + 'px)' : '';
      if (!on) { rail.scrollLeft = 0; return; }

      var top = pin.getBoundingClientRect().top + window.scrollY;
      pins.push({ pin: pin, rail: rail, top: top, span: span });
    });
  }

  function runPins() {
    for (var i = 0; i < pins.length; i++) {
      var p = pins[i];
      var progress = (window.scrollY - p.top) / p.span;
      progress = progress > 1 ? 1 : progress < 0 ? 0 : progress;
      var want = Math.round(progress * p.span);
      if (Math.abs(p.rail.scrollLeft - want) > 1) p.rail.scrollLeft = want;
    }
  }

  function measureAll() {
    collectReveals();
    collectCounters();
    collectPins();
    collectParallax();
    runReveals();
    runPins();
    runParallax();
  }

  measureAll();
  window.addEventListener('load', measureAll);
  // Nachmessen, sobald die Schriften sitzen — sonst stimmen die Positionen nicht
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(measureAll);

  /* =======================================================
     Overlay-Navigation
     ======================================================= */
  var btn = document.querySelector('.menu-btn');
  var nav = document.querySelector('.nav-overlay');

  if (btn && nav) {
    var lastFocus = null;

    var setNav = function (open) {
      btn.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('open', open);
      nav.setAttribute('aria-hidden', String(!open));
      btn.setAttribute('aria-label', open ? 'Menü schließen' : 'Menü öffnen');
      if (lenis) { open ? lenis.stop() : lenis.start(); }
      document.body.style.overflow = open ? 'hidden' : '';
      if (open) {
        lastFocus = document.activeElement;
        var first = nav.querySelector('a');
        if (first) first.focus({ preventScroll: true });
      } else if (lastFocus) {
        lastFocus.focus({ preventScroll: true });
      }
    };

    btn.addEventListener('click', function () {
      setNav(btn.getAttribute('aria-expanded') !== 'true');
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && btn.getAttribute('aria-expanded') === 'true') setNav(false);
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setNav(false);
    });
  }

  /* =======================================================
     Karussell
     ======================================================= */
  document.querySelectorAll('[data-rail]').forEach(function (root) {
    var rail = root.querySelector('.rail');
    var prev = root.querySelector('[data-rail-prev]');
    var next = root.querySelector('[data-rail-next]');
    var bar = root.querySelector('.rail-bar i');
    if (!rail) return;

    var step = function () {
      var first = rail.firstElementChild;
      if (!first) return rail.clientWidth * 0.8;
      var gap = parseFloat(getComputedStyle(rail).columnGap || '0') || 0;
      return first.getBoundingClientRect().width + gap;
    };

    var sync = function () {
      var max = rail.scrollWidth - rail.clientWidth;
      if (prev) prev.disabled = rail.scrollLeft <= 2;
      if (next) next.disabled = rail.scrollLeft >= max - 2;
      if (bar) {
        var visible = max > 0 ? Math.min(rail.clientWidth / rail.scrollWidth, 1) : 1;
        var progress = max > 0 ? rail.scrollLeft / max : 0;
        bar.style.transform = 'translateX(' + ((1 - visible) * progress * 100) + '%) scaleX(' + visible + ')';
      }
    };

    // Ist die Sektion angeheftet, steuert das Seitenscrollen die Reihe —
    // die Pfeile müssen dann die Seite bewegen, nicht die Reihe.
    var pinned = function () {
      var p = rail.closest('.rail-pin');
      return p && p.classList.contains('is-pinning');
    };
    var move = function (dir) {
      var d = dir * step();
      if (pinned()) {
        if (lenis) lenis.scrollTo(window.scrollY + d, { duration: 0.8 });
        else window.scrollBy({ top: d, behavior: reduced ? 'auto' : 'smooth' });
      } else {
        rail.scrollBy({ left: d, behavior: reduced ? 'auto' : 'smooth' });
      }
    };

    if (prev) prev.addEventListener('click', function () { move(-1); });
    if (next) next.addEventListener('click', function () { move(1); });

    rail.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    sync();

    /* Mit der Maus ziehen wie in der Referenz */
    var dragging = false, startX = 0, startLeft = 0, moved = 0;
    rail.addEventListener('pointerdown', function (e) {
      if (e.pointerType === 'touch') return; // Touch scrollt nativ
      if (pinned()) return;                  // angeheftet steuert das Seitenscrollen
      dragging = true; moved = 0;
      startX = e.clientX; startLeft = rail.scrollLeft;
      rail.style.cursor = 'grabbing';
      rail.setPointerCapture(e.pointerId);
    });
    rail.addEventListener('pointermove', function (e) {
      if (!dragging) return;
      var dx = e.clientX - startX;
      moved = Math.abs(dx);
      rail.scrollLeft = startLeft - dx;
    });
    var endDrag = function (e) {
      if (!dragging) return;
      dragging = false;
      rail.style.cursor = '';
      try { rail.releasePointerCapture(e.pointerId); } catch (err) {}
    };
    rail.addEventListener('pointerup', endDrag);
    rail.addEventListener('pointercancel', endDrag);
    // ein Zug darf keinen Klick auf die Karte auslösen
    rail.addEventListener('click', function (e) {
      if (moved > 6) { e.preventDefault(); e.stopPropagation(); moved = 0; }
    }, true);
  });

  /* =======================================================
     Stimmen
     ======================================================= */
  var quotes = document.querySelector('[data-quotes]');
  if (quotes) {
    var items = Array.prototype.slice.call(quotes.querySelectorAll('.quote-item'));
    var qPrev = quotes.querySelector('[data-quote-prev]');
    var qNext = quotes.querySelector('[data-quote-next]');
    var i = 0;

    var show = function (n) {
      i = (n + items.length) % items.length;
      items.forEach(function (el, k) {
        el.classList.toggle('on', k === i);
        el.setAttribute('aria-hidden', String(k !== i));
      });
    };

    if (qPrev) qPrev.addEventListener('click', function () { show(i - 1); });
    if (qNext) qNext.addEventListener('click', function () { show(i + 1); });
    show(0);
  }

  /* ---------- Jahr in der Fußzeile ---------- */
  var y = document.querySelector('[data-year]');
  if (y) y.textContent = String(new Date().getFullYear());
})();
