/* Aperia guides — shared interactive layer. Everything runs in the browser; nothing entered here is sent anywhere. */
(function () {
  'use strict';
  var doc = document, root = doc.documentElement;
  var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  var $ = function (s, c) { return (c || doc).querySelector(s); };
  var $$ = function (s, c) { return Array.prototype.slice.call((c || doc).querySelectorAll(s)); };

  // Same model as /cycle-skin-calculator (estimate only).
  var PH = {
    period:     { name: 'Period phase',      days: 'Days 1–5',   text: 'Hormones are at their lowest. Skin can feel drier or more sensitive, and last week’s spots often start to calm.' },
    follicular: { name: 'Follicular phase',  days: 'Days 6–12',  text: 'Estrogen is rising. For many people skin looks calmer, more even and better hydrated.' },
    ovulation:  { name: 'Ovulation window',  days: 'Days 13–15', text: 'Estrogen peaks and testosterone rises briefly. Often the “glow” days, with oil starting to pick up.' },
    luteal:     { name: 'Early luteal phase', days: 'Days 16–21', text: 'Progesterone rises. More oil and the first congested pores are common if your skin follows your cycle.' },
    watch:      { name: 'Watch week',        days: 'Days 22–28', text: 'The days before your period, when breakouts most often appear, commonly around the chin and jawline.' }
  };
  var ORDER = ['period', 'follicular', 'ovulation', 'luteal', 'watch'];
  function phaseFor(day, len, per) {
    var ov = len - 14, watchStart = len - 6;
    if (day <= per) return 'period';
    if (day >= watchStart) return 'watch';
    if (day >= ov - 1 && day <= ov + 1) return 'ovulation';
    if (day > ov + 1) return 'luteal';
    return 'follicular';
  }
  function segments(len, per) {
    var out = [], cur = phaseFor(1, len, per), start = 1;
    for (var d = 2; d <= len + 1; d++) {
      var k = d <= len ? phaseFor(d, len, per) : null;
      if (k !== cur) { out.push({ key: cur, from: start, to: d - 1 }); cur = k; start = d; }
    }
    return out;
  }

  if (!reduce) root.classList.add('g-anim');

  // ── Reading progress ────────────────────────────────────────────────
  var bar = doc.createElement('div'); bar.className = 'g-progress'; bar.innerHTML = '<i></i>';
  doc.body.appendChild(bar);
  var barI = bar.firstChild, article = $('article') || $('main');

  // ── Back to top ────────────────────────────────────────────────────
  var top = doc.createElement('button');
  top.className = 'g-top'; top.type = 'button'; top.setAttribute('aria-label', 'Back to top'); top.textContent = '↑';
  top.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });
  doc.body.appendChild(top);

  // ── Phase hero ring ────────────────────────────────────────────────
  $$('.phase-hero').forEach(function (hero) {
    var focus = hero.getAttribute('data-phase') || 'all';
    var svg = $('svg', hero), NS = 'http://www.w3.org/2000/svg';
    var segs = segments(28, 5), circles = {};
    segs.forEach(function (s) {
      var c = doc.createElementNS(NS, 'circle');
      c.setAttribute('cx', 50); c.setAttribute('cy', 50); c.setAttribute('r', 40);
      c.setAttribute('pathLength', 100); c.setAttribute('class', 'seg');
      c.style.stroke = 'var(--' + s.key + ')';
      c.style.strokeDashoffset = String(-((s.from - 1) / 28) * 100);
      c.dataset.len = String(((s.to - s.from + 1) / 28) * 100 - 0.8);
      svg.appendChild(c); circles[s.key] = c;
    });
    var dot = doc.createElementNS(NS, 'circle');
    dot.setAttribute('r', 6); dot.setAttribute('class', 'dot');
    svg.appendChild(dot);

    var label = $('b', hero), sub = $('span', hero), kicker = $('small', hero);
    var orig = { k: kicker.textContent, b: label.textContent, s: sub.textContent };
    function placeDot(key) {
      var s = segs.filter(function (x) { return x.key === key; })[0];
      if (!s) { dot.style.opacity = '0'; return; }
      var mid = ((s.from - 1 + (s.to - s.from + 1) / 2) / 28) * Math.PI * 2;
      dot.setAttribute('cx', 50 + 40 * Math.cos(mid)); dot.setAttribute('cy', 50 + 40 * Math.sin(mid));
      dot.style.opacity = '';
    }
    function highlight(key) {
      ORDER.forEach(function (k) { if (circles[k]) circles[k].classList.toggle('dim', key !== 'all' && k !== key); });
      placeDot(key);
    }
    function draw() {
      ORDER.forEach(function (k, i) {
        var c = circles[k]; if (!c) return;
        setTimeout(function () { c.style.strokeDasharray = c.dataset.len + ' 100'; }, reduce ? 0 : 120 + i * 140);
      });
      setTimeout(function () { hero.classList.add('on'); highlight(focus); }, reduce ? 0 : 200);
    }
    // Legend: tap a phase to explore it.
    var legend = doc.createElement('div'); legend.className = 'legend';
    ORDER.forEach(function (k) {
      var b = doc.createElement('button'); b.type = 'button'; b.style.setProperty('--c', 'var(--' + k + ')');
      b.textContent = PH[k].name.replace('Early luteal phase', 'Luteal').replace(' phase', '').replace(' window', '');
      b.setAttribute('aria-pressed', String(k === focus));
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true' && k !== focus;
        $$('button', legend).forEach(function (x) { x.setAttribute('aria-pressed', 'false'); });
        if (on || (b.getAttribute('aria-pressed') === 'true')) {
          highlight(focus); kicker.textContent = orig.k; label.textContent = orig.b; sub.textContent = orig.s;
          var fb = legend.children[ORDER.indexOf(focus)]; if (fb) fb.setAttribute('aria-pressed', 'true');
          return;
        }
        b.setAttribute('aria-pressed', 'true'); highlight(k);
        kicker.textContent = PH[k].days + ' of a 28-day cycle'; label.textContent = PH[k].name; sub.textContent = PH[k].text;
      });
      legend.appendChild(b);
    });
    sub.parentNode.appendChild(legend);
    if (doc.readyState === 'complete') draw(); else window.addEventListener('load', draw);
  });

  // ── Mini calculator ────────────────────────────────────────────────
  $$('[data-mini-calc]').forEach(function (box) {
    var today = new Date(); today.setHours(0, 0, 0, 0);
    var iso = function (d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
    var min = new Date(today); min.setDate(min.getDate() - 120);
    box.classList.add('mini-calc');
    box.innerHTML =
      '<h3>Where is your skin in its cycle today?</h3>' +
      '<p class="mc-sub">Pick the first day of your last period. It stays on your device.</p>' +
      '<div class="mc-row">' +
        '<label>Last period started<input type="date" max="' + iso(today) + '" min="' + iso(min) + '"></label>' +
        '<label>Cycle length<span class="step"><button type="button" data-d="-1" aria-label="Shorter cycle">−</button><output>28</output><button type="button" data-d="1" aria-label="Longer cycle">+</button></span></label>' +
      '</div>' +
      '<div class="mc-out" aria-live="polite"></div>';
    var input = $('input', box), out = $('.mc-out', box), num = $('output', box), len = 28;
    function render() {
      var m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(input.value);
      if (!m) { out.classList.remove('show'); return; }
      var start = new Date(+m[1], +m[2] - 1, +m[3]);
      var diff = Math.round((today - start) / 864e5);
      if (diff < 0 || diff > 120) { out.classList.remove('show'); return; }
      var day = (diff % len) + 1, key = phaseFor(day, len, 5);
      var barHtml = segments(len, 5).map(function (s) {
        return '<i style="width:' + ((s.to - s.from + 1) / len * 100) + '%;background:var(--' + s.key + ')"></i>';
      }).join('') + '<em style="left:' + ((day - 0.5) / len * 100) + '%"></em>';
      out.style.setProperty('--c', 'var(--' + key + ')');
      out.innerHTML = '<b>Day ' + day + ' · ' + PH[key].name + '</b>' +
        '<div class="mc-bar" aria-hidden="true">' + barHtml + '</div>' +
        '<p>' + PH[key].text + '</p>' +
        '<a href="/cycle-skin-calculator">See your full cycle and upcoming dates →</a>' +
        '<p class="mc-note">An estimate based on a typical cycle, not a prediction of ovulation.</p>';
      out.classList.remove('show'); void out.offsetWidth; out.classList.add('show');
    }
    input.addEventListener('change', render); input.addEventListener('input', render);
    $$('.step button', box).forEach(function (b) {
      b.addEventListener('click', function () {
        len = Math.max(21, Math.min(45, len + +b.getAttribute('data-d'))); num.textContent = len; render();
      });
    });
  });

  // ── Takeaways checklist ────────────────────────────────────────────
  $$('.takeaways').forEach(function (t) {
    var items = $$('li', t); if (!items.length) return;
    items.forEach(function (li) {
      li.setAttribute('role', 'checkbox'); li.setAttribute('aria-checked', 'false'); li.tabIndex = 0;
      var toggle = function () { var on = li.classList.toggle('done'); li.setAttribute('aria-checked', String(on)); };
      li.addEventListener('click', toggle);
      li.addEventListener('keydown', function (e) { if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); toggle(); } });
    });
    var hint = doc.createElement('p'); hint.className = 'tk-hint'; hint.textContent = 'Tap to tick off what you already do.';
    t.appendChild(hint);
  });

  // ── Smooth FAQ accordion ───────────────────────────────────────────
  if (!reduce && Element.prototype.animate) {
    $$('details').forEach(function (d) {
      var s = $('summary', d); if (!s) return;
      var anim = null;
      s.addEventListener('click', function (e) {
        e.preventDefault();
        if (anim) anim.cancel();
        var startH = d.offsetHeight;
        if (d.open) {
          var endH = s.offsetHeight + parseFloat(getComputedStyle(d).paddingTop) + parseFloat(getComputedStyle(d).paddingBottom);
          anim = d.animate({ height: [startH + 'px', endH + 'px'] }, { duration: 260, easing: 'cubic-bezier(.2,.7,.2,1)' });
          anim.onfinish = function () { d.open = false; anim = null; };
        } else {
          d.open = true;
          var full = d.offsetHeight;
          anim = d.animate({ height: [startH + 'px', full + 'px'] }, { duration: 320, easing: 'cubic-bezier(.2,.7,.2,1)' });
          anim.onfinish = function () { anim = null; };
        }
      });
    });
  }

  // ── Scroll reveal (only for things below the fold) ─────────────────
  if (!reduce && 'IntersectionObserver' in window) {
    var targets = $$('article > h2, article > .callout, .takeaways, .cta, .related, .mini-calc, .calc-card, .gtile, .post, .gcard, article > details');
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px' });
    var vh = window.innerHeight;
    targets.forEach(function (el) {
      if (el.getBoundingClientRect().top > vh) { el.classList.add('rv'); io.observe(el); }
    });
  }

  // ── TOC scroll-spy + section bar ───────────────────────────────────
  var toc = $('.toc'), links = toc ? $$('a[href^="#"]', toc) : [];
  var heads = links.map(function (a) { return doc.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
  var secbar = null, secLabel = null, secLinks = [];
  if (toc && links.length) {
    toc.classList.add('side');
    secbar = doc.createElement('div'); secbar.className = 'secbar';
    secbar.innerHTML = '<button type="button" aria-expanded="false"><small>On this page</small><span></span><i>⌄</i></button><ol></ol>';
    var ol = $('ol', secbar);
    links.forEach(function (a) {
      var li = doc.createElement('li'), c = doc.createElement('a');
      c.href = a.getAttribute('href'); c.textContent = a.textContent; li.appendChild(c); ol.appendChild(li);
      c.addEventListener('click', function () { secbar.classList.remove('open'); $('button', secbar).setAttribute('aria-expanded', 'false'); });
    });
    secLinks = $$('a', ol); secLabel = $('span', secbar);
    $('button', secbar).addEventListener('click', function () {
      var o = secbar.classList.toggle('open'); this.setAttribute('aria-expanded', String(o));
    });
    doc.body.appendChild(secbar);
    var hdr = $('header'); if (hdr) root.style.setProperty('--hdr', hdr.offsetHeight + 'px');
    root.style.scrollPaddingTop = '120px';
  }

  var ticking = false;
  function onScroll() {
    ticking = false;
    var y = window.scrollY, h = root.scrollHeight - window.innerHeight;
    var a = article.getBoundingClientRect();
    var p = Math.min(1, Math.max(0, (y - (a.top + y) + window.innerHeight * 0.3) / Math.max(1, a.height - window.innerHeight * 0.5)));
    barI.style.transform = 'scaleX(' + (h > 0 ? p : 0) + ')';
    top.classList.toggle('show', y > 1100);
    if (!links.length) return;
    var idx = -1;
    for (var i = 0; i < heads.length; i++) if (heads[i] && heads[i].getBoundingClientRect().top < 140) idx = i;
    links.forEach(function (l, i) { l.classList.toggle('active', i === idx); });
    secLinks.forEach(function (l, i) { l.classList.toggle('active', i === idx); });
    var tb = toc.getBoundingClientRect().bottom;
    secbar.classList.toggle('show', tb < 60 && idx >= 0 && a.bottom > 200);
    if (idx >= 0) secLabel.textContent = links[idx].textContent;
  }
  window.addEventListener('scroll', function () { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();
})();
