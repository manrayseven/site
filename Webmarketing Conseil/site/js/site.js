/* Webmarketing Conseil — scripts combinés (Webflow) */

/* ===== site.js ===== */
/* ============================================================
   site.js — production behaviours: reveal on scroll + diagnostic.
   (The page switcher lives only in variantes.html / app.js.)
   ============================================================ */
(function () {
  document.documentElement.classList.add('js-anim');

  var els = document.querySelectorAll('.reveal');
  function show(el){ el.classList.add('in'); }
  if (!('IntersectionObserver' in window)) { els.forEach(show); }
  else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { show(en.target); io.unobserve(en.target); }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    els.forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight * 0.96) show(el); else io.observe(el);
    });
  }
  /* hard fail-safe: never leave content hidden */
  setTimeout(function () { document.querySelectorAll('.reveal').forEach(show); }, 2200);
})();

/* ============ Diagnostic (homepage only) ============ */
(function () {
  var root = document.getElementById('diag');
  if (!root) return;

  var QS = [
    { q: "Où en êtes-vous aujourd'hui&nbsp;?", opts: [
      { t: "Je démarre — moins de 3k€/mois, en dents de scie", k: "clarte", s: "en lancement, avec des revenus en dents de scie" },
      { t: "La roue du hamster — entre 3 et 10k€/mois", k: "systeme", s: "coincé dans la roue du hamster" },
      { t: "Un palier à passer — au-delà de 50k€/mois", k: "seo", s: "à un palier à franchir" }
    ]},
    { q: "Votre base de prospects aujourd'hui&nbsp;?", opts: [
      { t: "Quasi inexistante — personne ne me connaît", k: "seo", s: "quasiment sans base de prospects" },
      { t: "Une base existe mais je l'exploite mal", k: "cold", s: "avec une base existante mais sous-exploitée" },
      { t: "Des contacts, mais ça ne convertit pas", k: "clarte", s: "des contacts qui ne convertissent pas" }
    ]},
    { q: "Votre principal problème actuellement&nbsp;?", opts: [
      { t: "Pas de stratégie claire", k: "clarte", s: "votre frein nº1 : l'absence de stratégie claire" },
      { t: "Pas de système d'acquisition efficace", k: "systeme", s: "votre frein nº1 : l'absence de système d'acquisition" },
      { t: "Pas de flux régulier de rendez-vous qualifiés", k: "cold", s: "votre frein nº1 : pas de flux régulier de rendez-vous" }
    ]},
    { q: "Sous quel délai visez-vous des résultats&nbsp;?", opts: [
      { t: "C'est urgent — il me faut des rendez-vous vite", k: "cold", s: "" },
      { t: "Dans les 3 prochains mois", k: "systeme", s: "" },
      { t: "Je bâtis sur le long terme", k: "seo", s: "" }
    ]},
    { q: "Prêt à investir pour accélérer&nbsp;?", opts: [
      { t: "Oui, si le retour sur investissement est clair", k: "", s: "" },
      { t: "J'évalue encore", k: "", s: "" },
      { t: "Pas tout de suite", k: "", s: "" }
    ]}
  ];

  // result framed as "nous pouvons vous aider à …" — ending chosen by context
  var RESULT = {
    cold:    { lever: "à installer votre machine à rendez-vous qualifiés", href: "https://www.webmarketing-conseil.fr/cold-emailing/",
      desc: "Une prospection (cold email) qui remplit votre agenda de rendez-vous — ciblée, automatisée, et qui reste la vôtre." },
    seo:     { lever: "à bâtir votre actif d'acquisition durable", href: "https://www.webmarketing-conseil.fr/contact/",
      desc: "Une présence organique — SEO & contenu augmentés à l'IA — qui compose mois après mois et attire un flux de prospects sans relancer." },
    clarte:  { lever: "à clarifier votre stratégie d'acquisition", href: "https://www.webmarketing-conseil.fr/contact/",
      desc: "Positionnement, client idéal, offre, message : le socle qui rend chaque euro d'acquisition rentable, avant tout canal." },
    systeme: { lever: "à orchestrer votre système d'acquisition complet", href: "https://www.webmarketing-conseil.fr/contact/",
      desc: "Stratégie + 1 à 2 canaux qui se renforcent, pour transformer votre expertise en flux de clients prévisible." }
  };

  var stepEl = document.getElementById('diagStep'),
      qEl    = document.getElementById('diagQ'),
      optsEl = document.getElementById('diagOpts'),
      dotsEl = document.getElementById('diagDots'),
      synthEl= document.getElementById('diagSynth'),
      leverEl= document.getElementById('diagLever'),
      descEl = document.getElementById('diagDesc'),
      ctaEl  = document.getElementById('diagCta'),
      restartEl = document.getElementById('diagRestart');

  var idx = 0, tally = { cold: 0, seo: 0, clarte: 0, systeme: 0 }, picks = [];

  // build the right number of progress dots
  dotsEl.innerHTML = "";
  QS.forEach(function () { dotsEl.appendChild(document.createElement('span')); });

  function render() {
    var item = QS[idx];
    stepEl.textContent = "Question " + (idx + 1) + " / " + QS.length;
    qEl.innerHTML = item.q;
    optsEl.innerHTML = "";
    item.opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = "button"; b.className = "diag__opt";
      b.innerHTML = "<span>" + o.t + "</span>";
      b.addEventListener('click', function () { choose(o); });
      optsEl.appendChild(b);
    });
    dotsEl.querySelectorAll('span').forEach(function (s, i) { s.classList.toggle('on', i <= idx); });
  }

  function choose(o) {
    if (o.k && tally[o.k] != null) tally[o.k]++;
    if (o.s) picks.push(o.s);
    idx++;
    if (idx < QS.length) render(); else finish();
  }

  function finish() {
    var keys = ["cold", "seo", "clarte"];
    keys.sort(function (a, b) { return tally[b] - tally[a]; });
    var top = keys[0], second = keys[1];
    var pick = (tally[top] - tally[second] <= 1 && tally[top] > 0) ? "systeme" : top;
    var r = RESULT[pick];
    // synthesise their situation from the qualifying picks
    if (synthEl) {
      var parts = picks.slice(0, 3);
      var sentence = parts.length
        ? "Vous êtes " + parts.slice(0, -1).join(", ") + (parts.length > 1 ? ", et " : "") + parts[parts.length - 1] + "."
        : "Votre acquisition manque de système.";
      synthEl.textContent = sentence;
    }
    leverEl.textContent = r.lever;
    descEl.textContent = r.desc;
    ctaEl.setAttribute('href', r.href);
    root.classList.add('is-done');
    dotsEl.querySelectorAll('span').forEach(function (s) { s.classList.add('on'); });
  }

  restartEl.addEventListener('click', function () {
    idx = 0; tally = { cold: 0, seo: 0, clarte: 0, systeme: 0 }; picks = [];
    root.classList.remove('is-done');
    render();
  });

  render();
})();

/* ============ placeholder forms: demo redirect until Brevo is wired ============ */
(function () {
  document.querySelectorAll('form[data-demo-redirect]').forEach(function (f) {
    f.addEventListener('submit', function (e) {
      if (f.getAttribute('action').indexOf('REMPLACEZ') !== -1) {
        e.preventDefault();
        window.location.href = f.getAttribute('data-demo-redirect');
      }
    });
  });
})();

/* ============ preview shim: only when served as explicit .html files
   (e.g. design preview), append index.html to directory-style links.
   On a real static host pathname never ends in .html, so this is a no-op. */
(function () {
  if (!/\.html$/.test(location.pathname)) return;
  document.querySelectorAll('a[href]').forEach(function (a) {
    var h = a.getAttribute('href');
    if (!h || h.indexOf('://') !== -1 || h.charAt(0) === '#') return;
    if (h.slice(-1) === '/') a.setAttribute('href', h + 'index.html');
  });
})();


/* ===== craft.js ===== */
/* ============================================================
   craft.js — bespoke motion. Two pieces:
     · heroSignal()  — animated acquisition curve on a canvas
     · logoMarquee() — seamless, monochrome logo loop
   Both theme-aware (read live CSS vars), both honour
   prefers-reduced-motion, both clean up on resize.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- helpers ---------- */
  function cssVar(name, fallback) {
    var site = document.getElementById("site");
    var v = site && getComputedStyle(site).getPropertyValue(name).trim();
    return v || fallback;
  }

  /* ============================================================
     HERO SIGNAL — jagged "dents de scie" resolving into a smooth
     compounding climb. The literal picture of "we turn volatile
     acquisition into a predictable system."
     ============================================================ */
  function heroSignal() {
    var hero = document.querySelector(".hero-main");
    if (!hero) return;
    if (hero.getAttribute("data-fx")) return;   // a bespoke hero fx owns this hero

    var canvas = document.createElement("canvas");
    canvas.className = "hero-fx";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext("2d");

    var W = 0, H = 0, dpr = 1, pts = [], climb = [], started = 0;
    var trail = [], pulses = [], lastPulse = 0, prevDotT = 0;
    var parX = 0, parY = 0, tgX = 0, tgY = 0;

    var smooth = function (a, b, x) {
      x = Math.min(1, Math.max(0, (x - a) / (b - a)));
      return x * x * (3 - 2 * x);
    };

    function build() {
      var r = hero.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;   // hero not laid out yet
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px";
      canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      var N = Math.max(170, Math.round(W / 4.2));
      var baseY = H * 0.92;     // volatile signal stays low
      var topY = H * 0.30;      // climb now peaks UP near the headline
      pts = []; climb = [];
      for (var i = 0; i <= N; i++) {
        var x = i / N;
        // trend: flat until ~0.26, rises, plateaus by ~0.74
        var trend = smooth(0.26, 0.74, x);
        var cy = baseY - (baseY - topY) * trend;
        climb.push({ x: x * W, y: cy });
        // volatility envelope: strong on the left, gone by ~0.52
        var vol = 1 - smooth(0.0, 0.52, x);
        var amp = H * 0.17 * vol;
        pts.push({ x: x * W, cy: cy, amp: amp, ph: i * 0.6 });
      }
      return true;
    }

    function strokePath(arr, upTo) {
      ctx.beginPath();
      var n = Math.floor(upTo * (arr.length - 1));
      for (var i = 0; i <= n; i++) {
        var p = arr[i];
        if (i === 0) ctx.moveTo(p.x, p.y);
        else {
          var prev = arr[i - 1];
          var mx = (prev.x + p.x) / 2, my = (prev.y + p.y) / 2;
          ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
        }
      }
      ctx.stroke();
    }

    /* paint a full frame. `t` drives motion (0 for the static paint),
       `dotT` (0..1 or null) places the comet, `bob` is a vertical breath.
       Everything lives in the LOWER hero so the headline stays clean. */
    function paint(t, dotT, bob) {
      if (!W || !H || !climb.length) return;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(parX, parY + (bob || 0));

      var signal = cssVar("--signal", "#CBF24A");
      var line = cssVar("--line", "rgba(255,255,255,.1)");

      /* faint guide grid */
      ctx.strokeStyle = line;
      ctx.lineWidth = 1;
      ctx.globalAlpha = 0.5;
      var step = Math.max(64, W / 16);
      for (var gx = step; gx < W; gx += step) {
        ctx.beginPath(); ctx.moveTo(gx, 0); ctx.lineTo(gx, H); ctx.stroke();
      }
      for (var gy = step; gy < H; gy += step) {
        ctx.beginPath(); ctx.moveTo(0, gy); ctx.lineTo(W, gy); ctx.stroke();
      }
      ctx.globalAlpha = 1;
      ctx.lineJoin = "round"; ctx.lineCap = "round";

      /* ghost echoes of the climb — depth */
      for (var g = 3; g >= 1; g--) {
        ctx.save(); ctx.translate(0, g * 8);
        ctx.strokeStyle = hexA(signal, 0.045 * g);
        ctx.lineWidth = 1;
        strokePath(climb, 1);
        ctx.restore();
      }

      /* soft fill under the climb */
      var grad = ctx.createLinearGradient(0, H * 0.22, 0, H);
      grad.addColorStop(0, hexA(signal, 0.13));
      grad.addColorStop(1, hexA(signal, 0));
      ctx.beginPath();
      ctx.moveTo(climb[0].x, H);
      for (var k = 0; k < climb.length; k++) ctx.lineTo(climb[k].x, climb[k].y);
      ctx.lineTo(climb[climb.length - 1].x, H);
      ctx.closePath();
      ctx.fillStyle = grad; ctx.fill();

      /* LIVE volatile signal — wiggles on the left, calms to the right */
      ctx.strokeStyle = hexA(signal, 0.42);
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (var v = 0; v < pts.length; v++) {
        var pv = pts[v];
        var jit =
          Math.sin(pv.x * 0.05 + t * 2.2 + pv.ph) * 0.5 +
          Math.sin(pv.x * 0.11 - t * 3.1) * 0.3 +
          (((pv.x * 0.02 + t * 1.3) % 1) - 0.5) * 0.6;   // travelling sawtooth
        var vy = pv.cy + jit * pv.amp;
        if (v === 0) ctx.moveTo(pv.x, vy); else ctx.lineTo(pv.x, vy);
      }
      ctx.stroke();

      /* sweeping scan line — a soft vertical light passing over */
      var sx = ((t * 0.13) % 1.25 - 0.12) * W;
      var sg = ctx.createLinearGradient(sx - 46, 0, sx + 46, 0);
      sg.addColorStop(0, hexA(signal, 0));
      sg.addColorStop(0.5, hexA(signal, 0.16));
      sg.addColorStop(1, hexA(signal, 0));
      ctx.fillStyle = sg;
      ctx.fillRect(sx - 46, H * 0.30, 92, H * 0.70);

      /* the smooth climb — hero line with strong glow */
      ctx.shadowColor = hexA(signal, 0.65);
      ctx.shadowBlur = 22;
      ctx.strokeStyle = signal;
      ctx.lineWidth = 3;
      strokePath(climb, 1);
      ctx.shadowBlur = 0;

      /* expanding pulse rings emitted by the comet */
      for (var pi = 0; pi < pulses.length; pi++) {
        var pl = pulses[pi];
        var age = t - pl.born;
        if (age < 0 || age > 1.45) continue;
        var rr = age * 150;
        ctx.beginPath();
        ctx.arc(pl.x, pl.y, rr, 0, Math.PI * 2);
        ctx.strokeStyle = hexA(signal, 0.3 * (1 - age / 1.45));
        ctx.lineWidth = 1.5;
        ctx.stroke();
      }

      /* comet trail riding the climb */
      if (trail.length > 1) {
        for (var ti = 1; ti < trail.length; ti++) {
          var a = (ti / trail.length);
          ctx.beginPath();
          ctx.moveTo(trail[ti - 1].x, trail[ti - 1].y);
          ctx.lineTo(trail[ti].x, trail[ti].y);
          ctx.strokeStyle = hexA(signal, a * 0.6);
          ctx.lineWidth = 1 + a * 3;
          ctx.stroke();
        }
      }

      /* the comet head */
      if (dotT != null) {
        var di = Math.floor(dotT * (climb.length - 1));
        var p = climb[di] || climb[climb.length - 1];
        ctx.beginPath();
        ctx.arc(p.x, p.y, 5, 0, Math.PI * 2);
        ctx.fillStyle = signal;
        ctx.shadowColor = signal; ctx.shadowBlur = 26;
        ctx.fill(); ctx.shadowBlur = 0;
      }

      ctx.restore();
    }

    function frame(now) {
      if (!started) started = now;
      if (!W || !climb.length) { raf = requestAnimationFrame(frame); return; }
      var t = (now - started) / 1000;
      var dotT = (t / 6) % 1;                 // comet crosses every 6s
      var bob = Math.sin(t * 0.6) * 4;        // gentle vertical breath

      /* comet position → feed trail + pulses */
      var di = Math.floor(dotT * (climb.length - 1));
      var dp = climb[di] || climb[climb.length - 1];
      if (dotT < prevDotT) trail.length = 0;  // reset on wrap, no streak-back
      prevDotT = dotT;
      trail.push({ x: dp.x, y: dp.y });
      if (trail.length > 28) trail.shift();
      if (t - lastPulse > 1.5) { lastPulse = t; pulses.push({ x: dp.x, y: dp.y, born: t }); }
      if (pulses.length > 6) pulses.shift();

      /* easing parallax */
      parX += (tgX - parX) * 0.06;
      parY += (tgY - parY) * 0.06;

      paint(t, dotT, bob);
      raf = requestAnimationFrame(frame);
    }

    /* hex/rgb + alpha → rgba() */
    function hexA(c, a) {
      c = c.trim();
      if (c[0] === "#") {
        var h = c.slice(1);
        if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
        var n = parseInt(h, 16);
        return "rgba(" + ((n>>16)&255) + "," + ((n>>8)&255) + "," + (n&255) + "," + a + ")";
      }
      if (c.indexOf("rgb") === 0) return c.replace(/rgba?\(([^)]+)\)/, function (_, inner) {
        var p = inner.split(",").slice(0,3).join(",");
        return "rgba(" + p + "," + a + ")";
      });
      return c;
    }

    var raf = 0;

    /* robust startup: retry with TIMERS (they run even while the
       document is hidden — rAF and ResizeObserver don't), so the
       canvas never gets stuck at 0×0 in background/export contexts */
    function startOrRetry(tries) {
      if (build()) {
        paint(0, reduce ? null : 0, 0);     // synchronous full paint — never blank
        if (!reduce && !raf) raf = requestAnimationFrame(frame);
        return;
      }
      if (tries > 0) setTimeout(function () { startOrRetry(tries - 1); }, 200);
    }
    startOrRetry(50);
    window.addEventListener("load", function () { if (!W) startOrRetry(50); });
    document.addEventListener("visibilitychange", function () { if (!W) startOrRetry(50); });

    /* subtle pointer parallax */
    if (!reduce) {
      var r2 = hero.getBoundingClientRect();
      var refreshR2 = function () { r2 = hero.getBoundingClientRect(); };
      window.addEventListener("resize", refreshR2, { passive: true });
      window.addEventListener("scroll", refreshR2, { passive: true });
      hero.addEventListener("pointermove", function (e) {
        var nx = (e.clientX - r2.left) / r2.width - 0.5;
        var ny = (e.clientY - r2.top) / r2.height - 0.5;
        tgX = nx * 18; tgY = ny * 12;
        canvas.style.transform = "translate(" + (-nx * 8) + "px," + (-ny * 6) + "px)";
      });
      hero.addEventListener("pointerleave", function () { tgX = 0; tgY = 0; canvas.style.transform = ""; });
    }

    var rt;
    function rebuild() {
      clearTimeout(rt);
      rt = setTimeout(function () {
        started = 0; trail.length = 0; pulses.length = 0;
        if (build()) paint(0, reduce ? null : 0, 0);
        if (!reduce && !raf) raf = requestAnimationFrame(frame);
      }, 160);
    }
    window.addEventListener("resize", rebuild);

    /* size-driven rebuild — covers font reflow, scaled preview, 0-width init */
    if (window.ResizeObserver) {
      var lastW = 0, lastH = 0;
      new ResizeObserver(function (entries) {
        var cr = entries[0].contentRect;
        if (Math.abs(cr.width - lastW) < 2 && Math.abs(cr.height - lastH) < 2) return;
        lastW = cr.width; lastH = cr.height;
        rebuild();
      }).observe(hero);
    }

    /* repaint when the direction (theme) changes */
    var site = document.getElementById("site");
    if (site && window.MutationObserver) {
      new MutationObserver(function () { /* colours are read live each frame */ })
        .observe(site, { attributes: true, attributeFilter: ["data-theme", "style"] });
    }
  }

  /* ============================================================
     LOGO MARQUEE — seamless monochrome loop.
     ============================================================ */
  function logoMarquee() {
    var wall = document.querySelector(".logos");
    if (!wall || wall.classList.contains("logowall")) return;
    var imgs = Array.prototype.slice.call(wall.querySelectorAll("img"));
    if (imgs.length < 2) return;

    wall.classList.add("logowall");
    var track = document.createElement("div");
    track.className = "logowall__track";
    imgs.forEach(function (im) { track.appendChild(im); });
    // duplicate the set so the -50% loop is seamless
    imgs.forEach(function (im) {
      var c = im.cloneNode(true);
      c.setAttribute("aria-hidden", "true");
      track.appendChild(c);
    });
    wall.appendChild(track);
  }

  /* ============================================================
     STATS COUNT-UP — numbers build themselves once, on first view.
     Quiet, 1.1s, easeOut; honours prefers-reduced-motion.
     ============================================================ */
  function statsCountUp() {
    if (reduce || !window.IntersectionObserver) return;
    var nums = document.querySelectorAll(".stat__num");
    if (!nums.length) return;
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        io.unobserve(en.target);
        var el = en.target;
        var m = el.textContent.trim().match(/^([+\-]?)(\d+)([\s\S]*)$/);
        if (!m) return;
        var prefix = m[1], target = parseInt(m[2], 10), suffix = m[3];
        var t0 = performance.now(), dur = 1100;
        (function tick(now) {
          var p = Math.min(1, (now - t0) / dur);
          var e = 1 - Math.pow(1 - p, 3);
          el.textContent = prefix + Math.round(target * e) + suffix;
          if (p < 1) requestAnimationFrame(tick);
        })(t0);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (el) { io.observe(el); });
  }

  function init() { heroSignal(); logoMarquee(); statsCountUp(); }
  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", init);
  else init();
})();


/* ===== hero-engine.js ===== */
/* ============================================================
   hero-engine.js — "La machine à clients", made literal.
   A particle field tells the brand story: scattered, volatile
   traffic on the LEFT is pulled through a SYSTEM (the aperture)
   and emerges as an ordered, ascending stream of qualified
   CLIENTS on the right — chaos → predictable climb.
   Theme-true (reads --signal live), rAF-driven, mouse parallax,
   static snapshot for reduced motion. Owns the hero when:
       <header class="hero-main" data-fx="engine">
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function cssVar(name, fb) {
    var s = document.getElementById("site");
    var v = s && getComputedStyle(s).getPropertyValue(name).trim();
    return v || fb;
  }
  function hexA(c, a) {
    c = (c || "").trim();
    if (c[0] === "#") {
      var h = c.slice(1);
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n = parseInt(h, 16);
      return "rgba(" + ((n>>16)&255) + "," + ((n>>8)&255) + "," + (n&255) + "," + a + ")";
    }
    if (c.indexOf("rgb") === 0)
      return c.replace(/rgba?\(([^)]+)\)/, function (_, i) { return "rgba(" + i.split(",").slice(0,3).join(",") + "," + a + ")"; });
    return c;
  }

  function engine() {
    var hero = document.querySelector('[data-fx="engine"]');
    if (!hero) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";

    var canvas = document.createElement("canvas");
    canvas.className = "hero-fx hero-fx--engine";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);
    var ctx = canvas.getContext("2d");

    var W = 0, H = 0, dpr = 1, raf = 0, started = 0, prevT = 0;
    var parts = [], N = 0;
    var Ax = 0, Ay = 0;                       // aperture (the "system")
    var px = 0, py = 0, tgx = 0, tgy = 0;     // eased pointer parallax

    function climb(t) {                       // post-aperture ascending path
      var x = Ax + t * (W * 0.52);
      var y = Ay - Math.pow(t, 0.82) * (Ay - H * 0.17);
      return { x: x, y: y };
    }

    function reset(p, randomT) {
      p.state = 0;                            // 0 = volatile inflow, 1 = converted climb
      p.x = -W * 0.04 + Math.random() * W * 0.12;
      p.y = H * (0.12 + Math.random() * 0.78);
      p.vx = 0; p.vy = 0;
      p.ph = Math.random() * 6.28;
      p.spd = 0.6 + Math.random() * 0.8;
      p.ct = 0;
      p.size = 0.8 + Math.random() * 1.4;
      if (randomT) {                          // seed mid-stream so it's never empty
        if (Math.random() < 0.4) { p.state = 1; p.ct = Math.random(); }
        else { p.x = Math.random() * Ax; }
      }
      return p;
    }

    function build() {
      var r = hero.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      W = r.width; H = r.height;
      canvas.width = Math.round(W * dpr); canvas.height = Math.round(H * dpr);
      canvas.style.width = W + "px"; canvas.style.height = H + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      Ax = W * 0.56; Ay = H * 0.5;
      N = Math.round(Math.min(180, Math.max(80, W / 9)));
      parts = [];
      for (var i = 0; i < N; i++) parts.push(reset({}, true));
      return true;
    }

    function step(p, dt, t) {
      if (p.state === 0) {
        // volatility: jittery drift, stronger far from the system
        var dx = Ax - p.x, dy = Ay - p.y;
        var dist = Math.hypot(dx, dy) || 1;
        var vol = Math.min(1, p.x < Ax ? (Ax - p.x) / Ax : 0);   // 1 at far left → 0 at aperture
        var jit = (Math.sin(t * 2.3 + p.ph) + Math.sin(t * 3.7 + p.ph * 1.7)) * 0.5;
        var pull = 70 + (1 - vol) * 140;
        p.vx += (dx / dist) * pull * dt;
        p.vy += (dy / dist) * pull * dt + jit * vol * 60 * dt;
        p.vx *= 0.92; p.vy *= 0.92;
        p.x += p.vx * dt; p.y += p.vy * dt;
        if (dist < 18) { p.state = 1; p.ct = 0; }                 // enters the system → converts
      } else {
        p.ct += dt * 0.5 * p.spd;
        var c = climb(p.ct);
        p.x = c.x; p.y = c.y;
        if (p.ct >= 1 || p.x > W + 30 || p.y < -30) reset(p, false);
      }
    }

    function paint(t) {
      if (!W) return;
      ctx.clearRect(0, 0, W, H);
      ctx.save();
      ctx.translate(px, py);

      var signal = cssVar("--signal", "#CBF24A");
      var ink = cssVar("--ink-soft", "#D8D3C2");

      /* faint funnel guides — "the system" funnelling traffic in */
      ctx.strokeStyle = hexA(signal, 0.10); ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(-20, H * 0.14); ctx.lineTo(Ax, Ay); ctx.stroke();
      ctx.beginPath(); ctx.moveTo(-20, H * 0.9); ctx.lineTo(Ax, Ay); ctx.stroke();

      /* the climb guide — predictable ascent the clients ride */
      ctx.strokeStyle = hexA(signal, 0.16); ctx.lineWidth = 1.5;
      ctx.beginPath();
      for (var s = 0; s <= 1.001; s += 0.05) { var c = climb(s); s === 0 ? ctx.moveTo(c.x, c.y) : ctx.lineTo(c.x, c.y); }
      ctx.stroke();

      /* network lines among nearby pre-system particles (prospects meeting) */
      ctx.lineWidth = 1;
      for (var i = 0; i < parts.length; i++) {
        var a = parts[i]; if (a.state !== 0) continue;
        for (var j = i + 1; j < parts.length; j++) {
          var b = parts[j]; if (b.state !== 0) continue;
          var d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 78) {
            ctx.strokeStyle = hexA(ink, 0.10 * (1 - d / 78));
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      }

      /* aperture — the system / conversion lens */
      var pulse = 0.5 + 0.5 * Math.sin(t * 1.6);
      ctx.beginPath(); ctx.arc(Ax, Ay, 14 + pulse * 6, 0, 6.2832);
      ctx.strokeStyle = hexA(signal, 0.35 + pulse * 0.25); ctx.lineWidth = 1.5; ctx.stroke();
      ctx.beginPath(); ctx.arc(Ax, Ay, 4, 0, 6.2832);
      ctx.fillStyle = signal; ctx.shadowColor = signal; ctx.shadowBlur = 18; ctx.fill(); ctx.shadowBlur = 0;

      /* particles */
      for (var k = 0; k < parts.length; k++) {
        var p = parts[k];
        if (p.state === 0) {
          var vol = Math.min(1, (Ax - p.x) / Ax);
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size, 0, 6.2832);
          ctx.fillStyle = hexA(ink, 0.25 + (1 - vol) * 0.35);  // dim, brightening toward the system
          ctx.fill();
        } else {
          var br = 0.4 + p.ct * 0.6;
          ctx.beginPath(); ctx.arc(p.x, p.y, p.size + p.ct * 1.6, 0, 6.2832);
          ctx.fillStyle = hexA(signal, br);
          ctx.shadowColor = signal; ctx.shadowBlur = 8 * br; ctx.fill(); ctx.shadowBlur = 0;
        }
      }
      ctx.restore();
    }

    function frame(now) {
      if (!started) { started = now; prevT = now; }
      var t = (now - started) / 1000;
      var dt = Math.min(0.05, (now - prevT) / 1000); prevT = now;
      px += (tgx - px) * 0.05; py += (tgy - py) * 0.05;
      for (var i = 0; i < parts.length; i++) step(parts[i], dt, t);
      paint(t);
      raf = requestAnimationFrame(frame);
    }

    function staticPaint() {
      for (var s = 0; s < 240; s++) for (var i = 0; i < parts.length; i++) step(parts[i], 0.03, s * 0.03);
      paint(2.0);
    }

    function startOrRetry(tries) {
      if (build()) {
        if (reduce) { staticPaint(); return; }
        if (!raf) raf = requestAnimationFrame(frame);
        return;
      }
      if (tries > 0) setTimeout(function () { startOrRetry(tries - 1); }, 200);
    }
    startOrRetry(50);
    window.addEventListener("load", function () { if (!W) startOrRetry(50); });

    if (!reduce) {
      var r3 = hero.getBoundingClientRect();
      var refreshR3 = function () { r3 = hero.getBoundingClientRect(); };
      window.addEventListener("resize", refreshR3, { passive: true });
      window.addEventListener("scroll", refreshR3, { passive: true });
      hero.addEventListener("pointermove", function (e) {
        tgx = ((e.clientX - r3.left) / r3.width - 0.5) * -26;
        tgy = ((e.clientY - r3.top) / r3.height - 0.5) * -18;
      });
      hero.addEventListener("pointerleave", function () { tgx = 0; tgy = 0; });
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { started = 0; if (build()) { if (reduce) staticPaint(); else if (!raf) raf = requestAnimationFrame(frame); } }, 160);
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", engine);
  else engine();
})();


/* ===== hero-aurora.js ===== */
/* ============================================================
   hero-aurora.js — the "WOW" hero. A flowing, full-spectrum
   iridescent oil-slick rendered in a WebGL fragment shader:
   domain-warped fractal noise → shifting bands of colour that
   morph forever. Mouse + scroll parallax. A DOM scrim (added by
   CSS) keeps the headline readable over any colour.
   Owns the hero when  <header ... data-fx="aurora">.
   Reduced motion → one calm static frame. No WebGL → clean hero.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function signalRGB() {
    var s = document.getElementById("site");
    var v = (s && getComputedStyle(s).getPropertyValue("--signal").trim()) || "#CBF24A";
    if (v[0] === "#") {
      var h = v.slice(1);
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n = parseInt(h, 16);
      return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255];
    }
    var m = v.match(/[\d.]+/g);
    if (m) return [(+m[0])/255, (+m[1])/255, (+m[2])/255];
    return [0.8, 0.95, 0.29];
  }

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uT; uniform vec3 uSig; uniform vec2 uM; uniform float uScroll;",
    "float hash(vec3 p){p=fract(p*0.3183099+0.1);p*=17.0;return fract(p.x*p.y*p.z*(p.x+p.y+p.z));}",
    "float vnoise(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.0-2.0*f);",
    " return mix(mix(mix(hash(i+vec3(0,0,0)),hash(i+vec3(1,0,0)),f.x),",
    "   mix(hash(i+vec3(0,1,0)),hash(i+vec3(1,1,0)),f.x),f.y),",
    "   mix(mix(hash(i+vec3(0,0,1)),hash(i+vec3(1,0,1)),f.x),",
    "   mix(hash(i+vec3(0,1,1)),hash(i+vec3(1,1,1)),f.x),f.y),f.z);}",
    "float fbm(vec3 p){float a=0.55,s=0.0;for(int i=0;i<5;i++){s+=a*vnoise(p);p*=2.03;a*=0.5;}return s;}",
    // vivid full-spectrum cosine palette (oil-slick)
    "vec3 pal(float t){vec3 a=vec3(0.5),b=vec3(0.5),c=vec3(1.0,1.0,1.0),d=vec3(0.00,0.33,0.67);",
    " return a+b*cos(6.28318*(c*t+d));}",
    "void main(){",
    " vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;",
    " uv += uM*0.18;",                                  // mouse parallax
    " float t = uT*0.05 + uScroll*0.00035;",            // time + scroll drift
    " vec3 P = vec3(uv*1.15, t);",
    // two-stage domain warp → liquid flow
    " vec2 q = vec2(fbm(P), fbm(P+vec3(5.2,1.3,0.0)));",
    " vec2 r = vec2(fbm(P+vec3(q*1.9,0.0)+vec3(1.7,9.2,0.0)), fbm(P+vec3(q*1.9,0.0)+vec3(8.3,2.8,0.0)));",
    " float f = fbm(P+vec3(r*2.4,0.0));",
    " float hue = f*1.1 + length(r)*0.55 + uv.x*0.18 + t*0.6;",
    " vec3 col = pal(hue);",
    " col = mix(col, pal(hue*2.0+0.25), 0.40*sin(f*11.0)*0.5+0.20);",   // thin-film shimmer
    " col = mix(col, uSig, 0.14);",                     // brand anchoring
    " float bright = smoothstep(0.0,1.1, f*1.25+0.18);",
    " col *= 0.5 + bright*1.05;",                        // depth shaping
    " col = pow(col, vec3(0.92));",                      // gentle gamma → richer
    " float core = exp(-length(uv-vec2(0.35,0.05))*1.7);",
    " col += uSig*0.12*core;",                           // signal bloom
    " col *= 1.0 - 0.30*length(uv*vec2(0.72,1.0));",     // vignette
    " gl_FragColor = vec4(max(col,0.0), 1.0);",
    "}"
  ].join("\n");

  function build() {
    var hero = document.querySelector('[data-fx="aurora"]');
    if (!hero) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";

    var canvas = document.createElement("canvas");
    canvas.className = "hero-fx hero-fx--aurora";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);

    // adaptive scrim — guarantees headline contrast over any colour
    var scrim = document.createElement("div");
    scrim.className = "hero-scrim";
    scrim.setAttribute("aria-hidden", "true");
    hero.insertBefore(scrim, canvas.nextSibling);

    var gl = canvas.getContext("webgl", { alpha: false, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    if (!gl) { canvas.remove(); scrim.remove(); return; }

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) { return null; }
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.remove(); scrim.remove(); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); scrim.remove(); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "uRes");
    var uT = gl.getUniformLocation(prog, "uT");
    var uSig = gl.getUniformLocation(prog, "uSig");
    var uM = gl.getUniformLocation(prog, "uM");
    var uScroll = gl.getUniformLocation(prog, "uScroll");

    var W = 0, H = 0, raf = 0, started = 0;
    var mx = 0, my = 0, tgx = 0, tgy = 0, scrollY = 0;

    function size() {
      var r = hero.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.62; // soft + light
      W = Math.max(2, Math.round(r.width * scale));
      H = Math.max(2, Math.round(r.height * scale));
      canvas.width = W; canvas.height = H;
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
      gl.viewport(0, 0, W, H);
      return true;
    }

    function draw(time) {
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uT, time);
      var sig = signalRGB();
      gl.uniform3f(uSig, sig[0], sig[1], sig[2]);
      mx += (tgx - mx) * 0.045; my += (tgy - my) * 0.045;
      gl.uniform2f(uM, mx, my);
      gl.uniform1f(uScroll, scrollY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }

    function frame(now) {
      if (!started) started = now;
      draw((now - started) / 1000);
      raf = requestAnimationFrame(frame);
    }

    function startOrRetry(tries) {
      if (size()) {
        if (reduce) { draw(3.0); return; }
        if (!raf) raf = requestAnimationFrame(frame);
        return;
      }
      if (tries > 0) setTimeout(function () { startOrRetry(tries - 1); }, 200);
    }
    startOrRetry(50);
    window.addEventListener("load", function () { if (!W) startOrRetry(50); });

    if (!reduce) {
      window.addEventListener("pointermove", function (e) {
        tgx = (e.clientX / innerWidth - 0.5) * 0.9;
        tgy = (e.clientY / innerHeight - 0.5) * 0.7;
      }, { passive: true });
      // scroll parallax: canvas lags, shader drifts
      window.addEventListener("scroll", function () {
        scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        canvas.style.transform = "translate3d(0," + (scrollY * 0.35) + "px,0)";
      }, { passive: true });
    }

    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { started = 0; if (size() && reduce) draw(3.0); }, 160);
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* ===== hero-current.js ===== */
/* ============================================================
   hero-current.js — "Le courant d'acquisition".
   A WebGL flow-field: iridescent light filaments sweep in from
   the left (scattered traffic), curve and CONVERGE toward a
   bright focus on the right (the system → clients), drifting
   upward (growth). Beautiful like the aurora, but it MEANS the
   business: attract → channel → grow.
   Owns the hero when  <header ... data-fx="current">.
   Mouse + scroll parallax · reduced-motion static · WebGL-guarded.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function signalRGB() {
    var s = document.getElementById("site");
    var v = (s && getComputedStyle(s).getPropertyValue("--signal").trim()) || "#CBF24A";
    if (v[0] === "#") {
      var h = v.slice(1);
      if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n = parseInt(h, 16);
      return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255];
    }
    var m = v.match(/[\d.]+/g);
    if (m) return [(+m[0])/255, (+m[1])/255, (+m[2])/255];
    return [0.8, 0.95, 0.29];
  }

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uT; uniform vec3 uSig; uniform vec2 uM; uniform float uScroll;",
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);",
    " float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));",
    " return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
    "float fbm(vec2 p){float s=0.0,a=0.55;for(int i=0;i<5;i++){s+=a*vnoise(p);p*=2.02;a*=0.5;}return s;}",
    // iridescent palette
    "vec3 pal(float t){vec3 a=vec3(0.5),b=vec3(0.5),c=vec3(1.0),d=vec3(0.0,0.33,0.67);",
    " return a+b*cos(6.28318*(c*t+d));}",
    "void main(){",
    " vec2 res=uRes; vec2 uv=(gl_FragCoord.xy-0.5*res)/res.y;",
    " uv += uM*0.12;",
    " float asp=res.x/res.y;",
    " vec2 A=vec2(0.42,0.02);",                              // attractor (the system / clients), right-of-centre
    " float t=uT;",
    // ---- build a flow direction field ----
    " vec2 toA=A-uv; float dA=length(toA);",
    " vec2 conv=toA/(dA+0.15)*smoothstep(1.5,0.0,dA)*1.1;",  // convergence near the focus
    " float n=fbm(uv*1.5+vec2(t*0.05,0.0));",                // organic curl
    " vec2 curl=vec2(cos(n*6.2831),sin(n*6.2831))*0.55;",
    " vec2 flow=normalize(vec2(1.0,0.28)+conv+curl);",       // global drift right+up + converge + curl
    // ---- streak coordinate: phase advances ALONG the flow & time ----
    " float along=dot(uv,flow);",
    " float across=dot(uv,vec2(-flow.y,flow.x));",
    " float warp=fbm(uv*2.2+flow*1.3+vec2(0.0,t*0.04));",
    " float phase=across*9.0 + warp*5.0 - (along*3.0 + t*0.9);", // filaments stream toward the focus
    " float band=abs(fract(phase)-0.5)*2.0;",
    " float streak=smoothstep(0.62,0.0,band);",              // thin bright filaments
    " streak*=0.55+0.6*fbm(uv*3.0+t*0.05);",                 // vary intensity organically
    // ---- colour: iridescent, hue follows the field; brighten toward focus & upward ----
    " float hue=warp*0.9+across*0.25+along*0.15+t*0.05;",
    " vec3 col=pal(hue);",
    " col=mix(col,uSig,0.16);",
    " float focus=exp(-dA*1.7);",                            // glow at the convergence
    " float ascent=smoothstep(-0.6,0.6,uv.y);",             // growth = brighter upward
    " col*= 0.32 + streak*1.15;",                            // filaments carry the light
    " col+= uSig*focus*0.9;",                                // bright client-focus bloom
    " col+= pal(hue+0.2)*focus*0.5;",
    " col*= 0.7 + 0.5*ascent;",
    " col*= 1.0 - 0.30*length(uv*vec2(0.7,1.0));",           // vignette
    " col=pow(max(col,0.0),vec3(0.92));",
    " gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("\n");

  function build() {
    var hero = document.querySelector('[data-fx="current"]');
    if (!hero) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";

    var canvas = document.createElement("canvas");
    canvas.className = "hero-fx hero-fx--current";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);

    var scrim = document.createElement("div");
    scrim.className = "hero-scrim";
    scrim.setAttribute("aria-hidden", "true");
    hero.insertBefore(scrim, canvas.nextSibling);

    var gl = canvas.getContext("webgl", { alpha: false, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    if (!gl) { canvas.remove(); scrim.remove(); return; }

    function sh(type, src) {
      var s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) return null;
      return s;
    }
    var vs = sh(gl.VERTEX_SHADER, VERT), fs = sh(gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { canvas.remove(); scrim.remove(); return; }
    var prog = gl.createProgram();
    gl.attachShader(prog, vs); gl.attachShader(prog, fs); gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { canvas.remove(); scrim.remove(); return; }
    gl.useProgram(prog);

    var buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 3,-1, -1,3]), gl.STATIC_DRAW);
    var loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    var uRes = gl.getUniformLocation(prog, "uRes");
    var uT = gl.getUniformLocation(prog, "uT");
    var uSig = gl.getUniformLocation(prog, "uSig");
    var uM = gl.getUniformLocation(prog, "uM");
    var uScroll = gl.getUniformLocation(prog, "uScroll");

    var W = 0, H = 0, raf = 0, started = 0;
    var mx = 0, my = 0, tgx = 0, tgy = 0, scrollY = 0;

    function size() {
      var r = hero.getBoundingClientRect();
      if (r.width < 2 || r.height < 2) return false;
      var scale = Math.min(window.devicePixelRatio || 1, 1.5) * 0.66;
      W = Math.max(2, Math.round(r.width * scale));
      H = Math.max(2, Math.round(r.height * scale));
      canvas.width = W; canvas.height = H;
      canvas.style.width = r.width + "px"; canvas.style.height = r.height + "px";
      gl.viewport(0, 0, W, H);
      return true;
    }
    function draw(time) {
      gl.uniform2f(uRes, W, H);
      gl.uniform1f(uT, time);
      var sig = signalRGB();
      gl.uniform3f(uSig, sig[0], sig[1], sig[2]);
      mx += (tgx - mx) * 0.045; my += (tgy - my) * 0.045;
      gl.uniform2f(uM, mx, my);
      gl.uniform1f(uScroll, scrollY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      if (!started) started = now;
      draw((now - started) / 1000);
      raf = requestAnimationFrame(frame);
    }
    function startOrRetry(tries) {
      if (size()) { if (reduce) { draw(3.0); return; } if (!raf) raf = requestAnimationFrame(frame); return; }
      if (tries > 0) setTimeout(function () { startOrRetry(tries - 1); }, 200);
    }
    startOrRetry(50);
    window.addEventListener("load", function () { if (!W) startOrRetry(50); });

    if (!reduce) {
      window.addEventListener("pointermove", function (e) {
        tgx = (e.clientX / innerWidth - 0.5) * 0.9;
        tgy = (e.clientY / innerHeight - 0.5) * 0.7;
      }, { passive: true });
      window.addEventListener("scroll", function () {
        scrollY = window.pageYOffset || document.documentElement.scrollTop || 0;
        canvas.style.transform = "translate3d(0," + (scrollY * 0.35) + "px,0)";
      }, { passive: true });
    }
    var rt;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(function () { started = 0; if (size() && reduce) draw(3.0); }, 160);
    });
  }

  if (document.readyState === "loading")
    document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* ===== hero-morph.js ===== */
/* ============================================================
   hero-morph.js — morphing between REAL images.
   A WebGL hero that liquid-morphs through a sequence of real
   photos (your client portraits by default), unified with a
   brand DUOTONE (deep ink → signal) + grain, so it reads as one
   editorial piece rather than a slideshow. Says, literally:
   "real clients, real results."
   Owns the hero when  <header ... data-fx="morph">.
   Image list: data-imgs="a.jpg,b.jpg,…" (else a sensible default).
   Mouse parallax · auto-advance · reduced-motion = static duotone.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function signalRGB() {
    var s = document.getElementById("site");
    var v = (s && getComputedStyle(s).getPropertyValue("--signal").trim()) || "#CBF24A";
    if (v[0] === "#") {
      var h = v.slice(1); if (h.length === 3) h = h[0]+h[0]+h[1]+h[1]+h[2]+h[2];
      var n = parseInt(h, 16); return [((n>>16)&255)/255, ((n>>8)&255)/255, (n&255)/255];
    }
    var m = v.match(/[\d.]+/g); return m ? [(+m[0])/255,(+m[1])/255,(+m[2])/255] : [0.8,0.95,0.29];
  }

  var VERT = "attribute vec2 p;varying vec2 v;void main(){v=p*0.5+0.5;gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "varying vec2 v;",
    "uniform sampler2D texA, texB;",
    "uniform float uMix, uAspA, uAspB, uCan, uT, uZoomA, uZoomB;",
    "uniform vec2 uM;",
    "uniform vec3 uShadow, uMid, uHi, uSig;",
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);",
    " float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));",
    " return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
    "float fbm(vec2 p){float s=0.0,a=0.55;for(int i=0;i<4;i++){s+=a*vnoise(p);p*=2.05;a*=0.5;}return s;}",
    "vec2 coverUV(vec2 uv, float imgAsp, float zoom, vec2 par){",
    " vec2 scale = uCan > imgAsp ? vec2(1.0, imgAsp/uCan) : vec2(uCan/imgAsp, 1.0);",
    " return (uv-0.5)*scale*zoom + 0.5 + par;",
    "}",
    "vec3 duotone(vec3 c){",
    " float lum = dot(c, vec3(0.299,0.587,0.114)); lum = pow(clamp(lum,0.0,1.0), 0.92);",
    " vec3 col = lum < 0.5 ? mix(uShadow, uMid, lum*2.0) : mix(uMid, uHi, (lum-0.5)*2.0);",
    " return col;",
    "}",
    "void main(){",
    " vec2 uv = v;",
    " float m = smoothstep(0.0,1.0,uMix);",
    " float n = fbm(uv*3.2 + uT*0.06);",
    " vec2 disp = (vec2(n, fbm(uv*3.2+7.3-uT*0.05))-0.5);",
    " vec2 parA = uM*0.05 + disp*0.10*m;",          // melt-out displacement on A
    " vec2 parB = uM*0.05 - disp*0.10*(1.0-m);",    // melt-in displacement on B
    " vec3 a = texture2D(texA, coverUV(uv, uAspA, uZoomA, parA)).rgb;",
    " vec3 b = texture2D(texB, coverUV(uv, uAspB, uZoomB, parB)).rgb;",
    " float wipe = smoothstep(m-0.22, m+0.22, n*0.55 + uv.x*0.30 + (1.0-uv.y)*0.15);",
    " vec3 mixed = mix(a, b, m*0.55 + wipe*0.45);", // crossfade + liquid wipe
    " vec3 col = duotone(mixed);",
    " col += uSig * 0.10 * exp(-length((uv-vec2(0.5,0.45))*vec2(1.1,1.0))*2.0);", // soft signal bloom
    " col += (hash(uv*uT*60.0)-0.5)*0.045;",        // film grain
    " col *= 1.0 - 0.34*length((uv-0.5)*vec2(1.25,1.15));", // vignette
    " gl_FragColor = vec4(max(col,0.0), 1.0);",
    "}"
  ].join("\n");

  function build() {
    var hero = document.querySelector('[data-fx="morph"]');
    if (!hero) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";

    var list = (hero.getAttribute("data-imgs") || "").split(",").map(function (s){return s.trim();}).filter(Boolean);
    if (!list.length) return;

    var canvas = document.createElement("canvas");
    canvas.className = "hero-fx hero-fx--morph";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);
    var scrim = document.createElement("div");
    scrim.className = "hero-scrim"; scrim.setAttribute("aria-hidden", "true");
    hero.insertBefore(scrim, canvas.nextSibling);

    var gl = canvas.getContext("webgl", { alpha: false, antialias: true, preserveDrawingBuffer: true });
    if (!gl) { canvas.remove(); scrim.remove(); return; }

    function sh(t, src){ var s=gl.createShader(t); gl.shaderSource(s,src); gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null; }
    var vs=sh(gl.VERTEX_SHADER,VERT), fs=sh(gl.FRAGMENT_SHADER,FRAG);
    if(!vs||!fs){ canvas.remove(); scrim.remove(); return; }
    var prog=gl.createProgram(); gl.attachShader(prog,vs); gl.attachShader(prog,fs); gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){ canvas.remove(); scrim.remove(); return; }
    gl.useProgram(prog);

    var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(prog,"p"); gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);

    var U={}; ["uMix","uAspA","uAspB","uCan","uT","uZoomA","uZoomB","uM","uShadow","uMid","uHi","uSig","texA","texB"]
      .forEach(function(n){ U[n]=gl.getUniformLocation(prog,n); });
    gl.uniform1i(U.texA,0); gl.uniform1i(U.texB,1);

    // duotone stops from brand signal
    var sig=signalRGB();
    gl.uniform3f(U.uShadow, 0.055,0.052,0.035);                 // deep ink
    gl.uniform3f(U.uMid, sig[0]*0.34+0.04, sig[1]*0.40+0.05, sig[2]*0.18+0.03); // olive mid
    gl.uniform3f(U.uHi, Math.min(1,sig[0]*1.05+0.10), Math.min(1,sig[1]*1.02+0.06), sig[2]*0.7+0.20); // bright signal
    gl.uniform3f(U.uSig, sig[0],sig[1],sig[2]);

    // textures
    var tex=[], asp=[], ready=[];
    function mkTex(){ var t=gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D,t);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);
      // 1px placeholder
      gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,1,1,0,gl.RGBA,gl.UNSIGNED_BYTE,new Uint8Array([20,20,16,255]));
      return t; }
    list.forEach(function(src,i){
      tex[i]=mkTex(); asp[i]=1; ready[i]=false;
      var img=new Image(); img.crossOrigin="anonymous"; img.decoding="async";
      img.onload=function(){
        asp[i]=img.naturalWidth/img.naturalHeight;
        gl.bindTexture(gl.TEXTURE_2D,tex[i]);
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);
        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,false);
        try{ gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,img); ready[i]=true; }catch(e){}
      };
      img.src=src;
    });

    var W=0,H=0,raf=0,started=0,prev=0;
    var idx=0, mix=0, holding=true, holdT=0;
    var HOLD=2.6, TRANS=1.8;          // seconds
    var zoomBase=1.0, zA=1.0, zB=1.04;
    var mxx=0,myy=0,tgx=0,tgy=0;

    function size(){ var r=hero.getBoundingClientRect(); if(r.width<2||r.height<2) return false;
      var sc=Math.min(window.devicePixelRatio||1,2)*0.85;
      W=Math.max(2,Math.round(r.width*sc)); H=Math.max(2,Math.round(r.height*sc));
      canvas.width=W; canvas.height=H; canvas.style.width=r.width+"px"; canvas.style.height=r.height+"px";
      gl.viewport(0,0,W,H); return true; }

    function bind(unit, i){ gl.activeTexture(gl.TEXTURE0+unit); gl.bindTexture(gl.TEXTURE_2D, tex[i]||tex[0]); }

    function render(t){
      gl.uniform1f(U.uCan, W/H);
      gl.uniform1f(U.uT, t);
      mxx+=(tgx-mxx)*0.05; myy+=(tgy-myy)*0.05;
      gl.uniform2f(U.uM, mxx, myy);
      var i=idx, j=(idx+1)%list.length;
      bind(0,i); bind(1,j);
      gl.uniform1f(U.uAspA, asp[i]||1); gl.uniform1f(U.uAspB, asp[j]||1);
      // gentle ken-burns
      var kb = 1.0 - 0.05*(holding? (holdT/HOLD) : 1.0);
      gl.uniform1f(U.uZoomA, 1.02 - 0.04*mix);
      gl.uniform1f(U.uZoomB, 1.06 - 0.04*mix);
      gl.uniform1f(U.uMix, mix);
      gl.drawArrays(gl.TRIANGLES,0,3);
    }

    function frame(now){
      if(!started){started=now;prev=now;}
      var t=(now-started)/1000, dt=Math.min(0.05,(now-prev)/1000); prev=now;
      if(holding){ holdT+=dt; if(holdT>=HOLD){ holding=false; } }
      else { mix+=dt/TRANS; if(mix>=1.0){ mix=0; holding=true; holdT=0; idx=(idx+1)%list.length; } }
      render(t);
      raf=requestAnimationFrame(frame);
    }

    function staticDraw(){ render(2.0); }

    function start(tries){
      if(size()){ if(reduce){ staticDraw(); return; } if(!raf) raf=requestAnimationFrame(frame); return; }
      if(tries>0) setTimeout(function(){start(tries-1);},200);
    }
    start(50);
    window.addEventListener("load", function(){ if(!W) start(50); });

    if(!reduce){
      window.addEventListener("pointermove", function(e){
        tgx=(e.clientX/innerWidth-0.5)*1.0; tgy=(e.clientY/innerHeight-0.5)*0.8;
      }, {passive:true});
      window.addEventListener("scroll", function(){
        var y=window.pageYOffset||document.documentElement.scrollTop||0;
        canvas.style.transform="translate3d(0,"+(y*0.3)+"px,0)";
      }, {passive:true});
    }
    var rt; window.addEventListener("resize", function(){ clearTimeout(rt);
      rt=setTimeout(function(){ if(size()&&reduce) staticDraw(); },160); });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* ===== hero-silk.js ===== */
/* ============================================================
   hero-silk.js — faithful to the reference GIF.
   Flowing strands of iridescent silk / fibre-optic light: long
   coherent filaments that wave and stream, lit in vivid warm
   iridescence (orange · magenta · violet · blue) over near-black,
   with a moving specular sheen. A real "wow" hero.
   Owns the hero when  <header ... data-fx="silk">.
   Mouse + scroll parallax · reduced-motion static · WebGL-guarded.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VERT = "attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}";

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uT; uniform vec2 uM;",
    "float hash(vec2 p){p=fract(p*vec2(123.34,456.21));p+=dot(p,p+45.32);return fract(p.x*p.y);}",
    "float vnoise(vec2 p){vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);",
    " float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));",
    " return mix(mix(a,b,f.x),mix(c,d,f.x),f.y);}",
    "float fbm(vec2 p){float s=0.0,a=0.55;for(int i=0;i<5;i++){s+=a*vnoise(p);p*=2.04;a*=0.5;}return s;}",
    // vivid warm iridescent palette: orange -> magenta -> violet -> blue -> cyan
    "vec3 pal(float t){",
    " vec3 a=vec3(0.55,0.42,0.55), b=vec3(0.50,0.45,0.50), c=vec3(1.0,1.0,1.0), d=vec3(0.00,0.18,0.42);",
    " return a + b*cos(6.28318*(c*t+d));}",
    // one layer of flowing strands
    "vec4 strands(vec2 uv, float t, float scale, float count, float seed, float speed){",
    " vec2 dir = normalize(vec2(0.55,-1.0));",                 // flowing down-right (like the GIF)
    " float along = dot(uv,dir);",
    " float across = dot(uv, vec2(-dir.y,dir.x));",
    // turbulence that varies slowly ALONG the strand -> long coherent waves
    " float bend = fbm(vec2(across*1.1, along*0.45 - t*speed) + seed);",
    " float bend2 = fbm(vec2(across*2.3 + 4.0, along*0.8 - t*speed*1.3) + seed);",
    " float sc = across*count + bend*7.0 + bend2*3.0;",
    " float band = abs(fract(sc)-0.5)*2.0;",
    " float strand = pow(smoothstep(0.55,0.0,band), 2.2);",    // thin glossy filament
    " float id = floor(sc);",
    " float dens = fbm(vec2(id*0.21+seed, along*0.6 - t*speed)); ", // organic density variation
    " strand *= smoothstep(0.25,0.75,dens);",
    " float hue = id*0.045 + along*0.10 + bend*0.20 + 0.04*t;",
    " vec3 col = pal(hue);",
    // moving specular sheen running along the strands
    " float sheen = sin(sc*0.6 - along*5.0 + t*2.2);",
    " col += vec3(1.0,0.96,0.92)*strand*smoothstep(0.6,1.0,sheen)*0.7;",
    " return vec4(col*strand, strand);",
    "}",
    "void main(){",
    " vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;",
    " uv += uM*0.10;",
    " float t=uT;",
    " vec3 col=vec3(0.0); float acc=0.0;",
    // three layered ribbons of strands -> depth & density
    " vec4 s1=strands(uv*1.15, t, 1.0, 20.0, 0.0, 0.9); col+=s1.rgb*1.0; acc+=s1.a;",
    " vec4 s2=strands(uv*1.55+vec2(0.6,0.0), t, 1.0, 30.0, 11.0, 1.2); col+=s2.rgb*0.8; acc+=s2.a*0.8;",
    " vec4 s3=strands(uv*0.85+vec2(-0.4,0.2), t, 1.0, 13.0, 23.0, 0.65); col+=s3.rgb*0.9; acc+=s3.a*0.9;",
    // concentrate the glowing mass toward centre-right (text sits left), fade elsewhere
    " float massX = smoothstep(-1.4,0.2,uv.x);",
    " float mass = massX * smoothstep(1.2,-0.2,abs(uv.y)*0.8);",
    " col *= 0.5 + 1.1*mass;",
    " col = col/(1.0+col*0.55);",                              // soft filmic rolloff (gloss)
    " col += pal(0.06)*acc*0.05;",                             // faint warm ambient from the mass
    " col *= 1.0 - 0.32*length(uv*vec2(0.7,1.0));",            // vignette
    " col = pow(max(col,0.0), vec3(0.90));",                   // richer
    " gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("\n");

  function build() {
    var hero = document.querySelector('[data-fx="silk"]');
    if (!hero) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";

    var canvas = document.createElement("canvas");
    canvas.className = "hero-fx hero-fx--silk";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);
    var scrim = document.createElement("div");
    scrim.className = "hero-scrim"; scrim.setAttribute("aria-hidden", "true");
    hero.insertBefore(scrim, canvas.nextSibling);

    var gl = canvas.getContext("webgl", { alpha: false, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    if (!gl) { canvas.remove(); scrim.remove(); return; }
    function sh(t,src){var s=gl.createShader(t);gl.shaderSource(s,src);gl.compileShader(s);return gl.getShaderParameter(s,gl.COMPILE_STATUS)?s:null;}
    var vs=sh(gl.VERTEX_SHADER,VERT), fs=sh(gl.FRAGMENT_SHADER,FRAG);
    if(!vs||!fs){canvas.remove();scrim.remove();return;}
    var prog=gl.createProgram();gl.attachShader(prog,vs);gl.attachShader(prog,fs);gl.linkProgram(prog);
    if(!gl.getProgramParameter(prog,gl.LINK_STATUS)){canvas.remove();scrim.remove();return;}
    gl.useProgram(prog);
    var buf=gl.createBuffer();gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var loc=gl.getAttribLocation(prog,"p");gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc,2,gl.FLOAT,false,0,0);
    var uRes=gl.getUniformLocation(prog,"uRes"), uT=gl.getUniformLocation(prog,"uT"), uM=gl.getUniformLocation(prog,"uM");

    var W=0,H=0,raf=0,started=0, mx=0,my=0,tgx=0,tgy=0;
    function size(){var r=hero.getBoundingClientRect();if(r.width<2||r.height<2)return false;
      var sc=Math.min(window.devicePixelRatio||1,1.5)*0.7;
      W=Math.max(2,Math.round(r.width*sc));H=Math.max(2,Math.round(r.height*sc));
      canvas.width=W;canvas.height=H;canvas.style.width=r.width+"px";canvas.style.height=r.height+"px";
      gl.viewport(0,0,W,H);return true;}
    function draw(time){gl.uniform2f(uRes,W,H);gl.uniform1f(uT,time);
      mx+=(tgx-mx)*0.045;my+=(tgy-my)*0.045;gl.uniform2f(uM,mx,my);
      gl.drawArrays(gl.TRIANGLES,0,3);}
    function frame(now){if(!started)started=now;draw((now-started)/1000);raf=requestAnimationFrame(frame);}
    function start(tries){if(size()){if(reduce){draw(3.0);return;}if(!raf)raf=requestAnimationFrame(frame);return;}
      if(tries>0)setTimeout(function(){start(tries-1);},200);}
    start(50);
    window.addEventListener("load",function(){if(!W)start(50);});
    if(!reduce){
      window.addEventListener("pointermove",function(e){tgx=(e.clientX/innerWidth-0.5)*0.9;tgy=(e.clientY/innerHeight-0.5)*0.7;},{passive:true});
      window.addEventListener("scroll",function(){var y=window.pageYOffset||document.documentElement.scrollTop||0;canvas.style.transform="translate3d(0,"+(y*0.35)+"px,0)";},{passive:true});
    }
    var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){started=0;if(size()&&reduce)draw(3.0);},160);});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* ===== hero-fibers.js ===== */
/* ============================================================
   hero-fibers.js — the "wow": a 3D filament system.
   ~1500 fine strands rendered as WebGL lines, rotating in 3D and
   MORPHING ON A LOOP through organic forms — radial burst → vortex
   → hanging rope → radial disc (anemone) — silver/white fibres with
   a glowing golden-orange core & ember tips. Mouse parallax.
   Owns the hero when  <header ... data-fx="fibers">.
   Reduced motion → a single static frame. No WebGL → clean hero.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var VERT = [
    "precision highp float;",
    "attribute float aId, aSeg, aRnd;",
    "uniform float uT, uAspect;",
    "uniform mat3 uRot;",
    "uniform vec4 uW;",                       // morph weights: sphere, vortex, rope, disc
    "varying float vSeg, vRnd, vDepth;",
    "vec3 hashDir(float id){",
    " float a=fract(sin(id*12.9898)*43758.5453);",
    " float b=fract(sin(id*78.233)*43758.5453);",
    " float theta=a*6.28318; float phi=acos(2.0*b-1.0);",
    " return vec3(sin(phi)*cos(theta), cos(phi), sin(phi)*sin(theta));",
    "}",
    "void main(){",
    " float id=aId, seg=aSeg;",
    " vec3 dir=hashDir(id);",
    " vec3 up=vec3(0.0,1.0,0.0);",
    " vec3 tang=normalize(cross(dir,up)+vec3(1e-3));",
    " float curl=sin(uT*0.8 + id*0.7 + seg*6.28318)*0.14*seg;",
    // --- shape A: radial sphere burst ---
    " vec3 pSphere=dir*(seg*1.05) + tang*curl;",
    // --- shape B: vortex / spiral ---
    " float ang=seg*3.4 + uT*0.6 + id*0.001;",
    " mat3 tw=mat3(cos(ang),0.0,sin(ang), 0.0,1.0,0.0, -sin(ang),0.0,cos(ang));",
    " vec3 pVortex=tw*dir; pVortex.y+=(seg-0.5)*1.7; pVortex*=mix(0.18,1.0,seg);",
    // --- shape C: hanging rope / bundle, fraying down ---
    " vec3 pRope=mix(dir*0.12, vec3(0.0,-1.45,0.0), seg);",
    " pRope.xz+=dir.xz*(0.18*(1.0-seg)) + tang.xz*curl*1.4;",
    // --- shape D: flat radial disc (anemone) ---
    " vec3 fd=normalize(vec3(dir.x, dir.y*0.14, dir.z));",
    " vec3 pDisc=fd*(seg*1.15) + up*sin(seg*3.14159)*0.05;",
    " vec3 pos = pSphere*uW.x + pVortex*uW.y + pRope*uW.z + pDisc*uW.w;",
    " pos = uRot*pos;",
    // perspective projection
    " float zc=3.1; float z=pos.z+zc;",
    " vec2 pr=pos.xy/z*1.9; pr.x/=uAspect;",
    " gl_Position=vec4(pr,0.0,1.0);",
    " vSeg=seg; vRnd=aRnd; vDepth=clamp((pos.z+1.3)/2.6,0.0,1.0);",
    "}"
  ].join("\n");

  var FRAG = [
    "precision highp float;",
    "varying float vSeg, vRnd, vDepth;",
    "uniform vec3 uGold;",
    "void main(){",
    " float shade=0.30+0.70*vDepth;",
    " vec3 silver=vec3(0.90,0.92,0.97)*shade;",
    " float goldMask=step(0.70,vRnd)*smoothstep(0.5,1.0,vSeg);",   // some strand ends glow gold
    " vec3 col=mix(silver, uGold*1.35, goldMask);",
    " float a=(0.20+0.80*vDepth)*(0.5+0.5*vSeg);",
    " gl_FragColor=vec4(col, a);",
    "}"
  ].join("\n");

  // a soft additive core glow drawn as a fullscreen-ish quad
  var GVERT = "attribute vec2 p;varying vec2 v;void main(){v=p;gl_Position=vec4(p,0.,1.);}";
  var GFRAG = [
    "precision highp float; varying vec2 v;",
    "uniform float uAspect, uT; uniform vec3 uGold; uniform vec2 uCore;",
    "void main(){",
    " vec2 d=(v-uCore); d.x*=uAspect;",
    " float r=length(d);",
    " float pulse=0.85+0.15*sin(uT*1.3);",
    " float core=exp(-r*4.6)*pulse;",
    " float halo=exp(-r*1.9)*0.5;",
    " vec3 col=uGold*(core*1.5) + mix(uGold,vec3(1.0,0.95,0.85),0.55)*core*0.8 + uGold*halo*0.22;",
    " gl_FragColor=vec4(col, 1.0);",   // additive (blend ONE,ONE)
    "}"
  ].join("\n");

  function build() {
    var hero = document.querySelector('[data-fx="fibers"]');
    if (!hero) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";

    var canvas = document.createElement("canvas");
    canvas.className = "hero-fx hero-fx--fibers";
    canvas.setAttribute("aria-hidden", "true");
    hero.insertBefore(canvas, hero.firstChild);
    var scrim = document.createElement("div");
    scrim.className = "hero-scrim"; scrim.setAttribute("aria-hidden", "true");
    hero.insertBefore(scrim, canvas.nextSibling);

    var gl = canvas.getContext("webgl", { alpha: false, antialias: true, preserveDrawingBuffer: true, powerPreference: "high-performance" });
    if (!gl) { canvas.remove(); scrim.remove(); return; }
    function mkProg(vsrc, fsrc){
      function sh(t,s){var o=gl.createShader(t);gl.shaderSource(o,s);gl.compileShader(o);return gl.getShaderParameter(o,gl.COMPILE_STATUS)?o:null;}
      var vs=sh(gl.VERTEX_SHADER,vsrc), fs=sh(gl.FRAGMENT_SHADER,fsrc);
      if(!vs||!fs) return null;
      var p=gl.createProgram();gl.attachShader(p,vs);gl.attachShader(p,fs);gl.linkProgram(p);
      return gl.getProgramParameter(p,gl.LINK_STATUS)?p:null;
    }
    var prog=mkProg(VERT,FRAG), glow=mkProg(GVERT,GFRAG);
    if(!prog||!glow){ canvas.remove(); scrim.remove(); return; }

    // ---- build line geometry: N strands × M segments → LINES ----
    var N=1500, M=14;
    var verts=[];
    for(var id=0; id<N; id++){
      var rnd=Math.abs(Math.sin(id*91.7)*43758.5453)%1;
      for(var s=0; s<M-1; s++){
        var s0=s/(M-1), s1=(s+1)/(M-1);
        verts.push(id, s0, rnd, id, s1, rnd);
      }
    }
    var arr=new Float32Array(verts);
    var buf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,buf);
    gl.bufferData(gl.ARRAY_BUFFER,arr,gl.STATIC_DRAW);
    var vCount=arr.length/3;
    var aId=gl.getAttribLocation(prog,"aId"), aSeg=gl.getAttribLocation(prog,"aSeg"), aRnd=gl.getAttribLocation(prog,"aRnd");

    // glow quad
    var gbuf=gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER,gbuf);
    gl.bufferData(gl.ARRAY_BUFFER,new Float32Array([-1,-1,3,-1,-1,3]),gl.STATIC_DRAW);
    var gp=gl.getAttribLocation(glow,"p");

    var U={
      uT:gl.getUniformLocation(prog,"uT"), uAspect:gl.getUniformLocation(prog,"uAspect"),
      uRot:gl.getUniformLocation(prog,"uRot"), uW:gl.getUniformLocation(prog,"uW"),
      uGold:gl.getUniformLocation(prog,"uGold")
    };
    var GU={
      uAspect:gl.getUniformLocation(glow,"uAspect"), uT:gl.getUniformLocation(glow,"uT"),
      uGold:gl.getUniformLocation(glow,"uGold"), uCore:gl.getUniformLocation(glow,"uCore")
    };
    var GOLD=[1.0,0.62,0.18];

    var W=0,H=0,raf=0,started=0, mrx=0,mry=0,tgx=0,tgy=0;
    function size(){var r=hero.getBoundingClientRect();if(r.width<2||r.height<2)return false;
      var sc=Math.min(window.devicePixelRatio||1,2);
      W=Math.round(r.width*sc);H=Math.round(r.height*sc);
      canvas.width=W;canvas.height=H;canvas.style.width=r.width+"px";canvas.style.height=r.height+"px";
      gl.viewport(0,0,W,H);return true;}

    function weights(t){
      // loop through 4 shapes; one full cycle every L seconds
      var L=30.0, p=(t/ (L/4)) % 4.0;
      var w=[0,0,0,0];
      for(var k=0;k<4;k++){
        var dd=Math.abs(((p-k+6)%4)-2);   // cyclic distance 0..2
        var x=Math.max(0,1-dd);            // triangular
        w[k]=x*x*(3-2*x);                  // smoothstep
      }
      var sum=w[0]+w[1]+w[2]+w[3]||1;
      return [w[0]/sum,w[1]/sum,w[2]/sum,w[3]/sum];
    }
    function rotMat(t){
      mrx+=(tgx-mrx)*0.05; mry+=(tgy-mry)*0.05;
      var ay=t*0.18 + mrx*1.2, ax=Math.sin(t*0.12)*0.3 + mry*0.8;
      var cy=Math.cos(ay),sy=Math.sin(ay),cx=Math.cos(ax),sx=Math.sin(ax);
      // Ry then Rx (column-major mat3)
      var Ry=[cy,0,-sy, 0,1,0, sy,0,cy];
      var Rx=[1,0,0, 0,cx,sx, 0,-sx,cx];
      // m = Rx * Ry
      function mul(a,b){var r=[];for(var c=0;c<3;c++)for(var rr=0;rr<3;rr++){var s=0;for(var k=0;k<3;k++)s+=a[k*3+rr]*b[c*3+k];r[c*3+rr]=s;}return r;}
      return mul(Rx,Ry);
    }

    function render(t){
      gl.clearColor(0.055,0.052,0.040,1.0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE);   // additive glow

      // core glow first
      gl.useProgram(glow);
      gl.bindBuffer(gl.ARRAY_BUFFER,gbuf);
      gl.enableVertexAttribArray(gp); gl.vertexAttribPointer(gp,2,gl.FLOAT,false,0,0);
      gl.uniform1f(GU.uAspect,W/H); gl.uniform1f(GU.uT,t);
      gl.uniform3f(GU.uGold,GOLD[0],GOLD[1],GOLD[2]); gl.uniform2f(GU.uCore,0.0,0.0);
      gl.drawArrays(gl.TRIANGLES,0,3);

      // fibres (additive over the glow)
      gl.useProgram(prog);
      gl.bindBuffer(gl.ARRAY_BUFFER,buf);
      gl.enableVertexAttribArray(aId); gl.vertexAttribPointer(aId,1,gl.FLOAT,false,12,0);
      gl.enableVertexAttribArray(aSeg);gl.vertexAttribPointer(aSeg,1,gl.FLOAT,false,12,4);
      gl.enableVertexAttribArray(aRnd);gl.vertexAttribPointer(aRnd,1,gl.FLOAT,false,12,8);
      gl.uniform1f(U.uT,t); gl.uniform1f(U.uAspect,W/H);
      gl.uniform3f(U.uGold,GOLD[0],GOLD[1],GOLD[2]);
      gl.uniform4fv(U.uW,weights(t));
      gl.uniformMatrix3fv(U.uRot,false,rotMat(t));
      gl.drawArrays(gl.LINES,0,vCount);
    }

    function frame(now){ if(!started)started=now; render((now-started)/1000); raf=requestAnimationFrame(frame); }
    canvas.__render = render;                       // manual hook (first paint / verification)
    function start(tries){ if(size()){ render(reduce?6.0:0.1); if(reduce){return;} if(!raf)raf=requestAnimationFrame(frame); return; }
      if(tries>0) setTimeout(function(){start(tries-1);},200); }
    start(50);
    window.addEventListener("load",function(){if(!W)start(50);});
    if(!reduce){
      window.addEventListener("pointermove",function(e){ tgx=(e.clientX/innerWidth-0.5)*1.0; tgy=(e.clientY/innerHeight-0.5)*0.7; },{passive:true});
      window.addEventListener("scroll",function(){var y=window.pageYOffset||document.documentElement.scrollTop||0;canvas.style.transform="translate3d(0,"+(y*0.3)+"px,0)";},{passive:true});
    }
    var rt;window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){if(size()&&reduce)render(6.0);},160);});
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", build);
  else build();
})();


/* ===== hero-fibers3d.js ===== */
/* ============================================================
   hero-fibers3d.js — REAL 3D filaments (Three.js).
   Thousands of lit tube segments (InstancedMesh) form a fibrous
   organism that rotates in true perspective and MORPHS ON A LOOP
   through forms (radial burst → vortex → hanging rope → disc).
   Real depth occlusion + shading make it read as solid 3D, with a
   glowing golden core. Mouse parallax. Loads Three.js on demand.
   Owns the hero when  <header ... data-fx="fibers3d">.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THREE_URL = "https://unpkg.com/three@0.128.0/build/three.min.js";

  function ready(){ return document.querySelector('[data-fx="fibers3d"]'); }

  function load(cb){
    if (window.THREE) return cb();
    var s = document.createElement("script");
    s.src = THREE_URL; s.async = true;
    s.onload = cb;
    s.onerror = function(){ /* leave hero clean if CDN blocked */ };
    document.head.appendChild(s);
  }

  function init(){
    var hero = ready();
    if (!hero || !window.THREE) return;
    if (getComputedStyle(hero).position === "static") hero.style.position = "relative";
    var THREE = window.THREE;

    var holder = document.createElement("div");
    holder.className = "hero-fx hero-fx--fibers3d";
    holder.setAttribute("aria-hidden","true");
    hero.insertBefore(holder, hero.firstChild);
    var scrim = document.createElement("div");
    scrim.className = "hero-scrim"; scrim.setAttribute("aria-hidden","true");
    hero.insertBefore(scrim, holder.nextSibling);

    var W = hero.clientWidth || 1, H = hero.clientHeight || 1;

    var renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:"high-performance" });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1, 2));
    renderer.setSize(W, H);
    if (THREE.ACESFilmicToneMapping) renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.15;
    if ("outputEncoding" in renderer && THREE.sRGBEncoding) renderer.outputEncoding = THREE.sRGBEncoding;
    holder.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0E0D09);
    scene.fog = new THREE.Fog(0x0E0D09, 3.0, 6.4);          // depth fade

    var camera = new THREE.PerspectiveCamera(42, W/H, 0.1, 50);
    camera.position.set(0, 0, 3.5);

    // lights — key + rim + warm core
    scene.add(new THREE.AmbientLight(0x404048, 0.9));
    var key = new THREE.DirectionalLight(0xffffff, 2.2); key.position.set(-1.4, 1.6, 1.2); scene.add(key);
    var rim = new THREE.DirectionalLight(0x9fb6ff, 1.1); rim.position.set(1.5, -0.8, -1.0); scene.add(rim);
    var coreLight = new THREE.PointLight(0xffa53a, 6.0, 4.0, 2.0); coreLight.position.set(0,0,0); scene.add(coreLight);

    var group = new THREE.Group(); scene.add(group);

    // ---------- fibre geometry as instanced tube segments ----------
    var N = (W < 760 ? 420 : 760);     // fibres
    var S = 9;                          // segments per fibre
    var COUNT = N * S;
    var geo = new THREE.CylinderGeometry(1, 1, 1, 5, 1, true);  // unit cylinder along +Y
    geo.translate(0, 0.5, 0);          // base at origin → easier segment placement
    var mat = new THREE.MeshStandardMaterial({ color:0xffffff, roughness:0.42, metalness:0.05, vertexColors:false });
    var mesh = new THREE.InstancedMesh(geo, mat, COUNT);
    mesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    mesh.frustumCulled = false;
    // per-instance colour (gold tips)
    var colors = new Float32Array(COUNT*3);
    group.add(mesh);

    // precompute per-fibre direction + seed
    var dirs = new Float32Array(N*3), rnd = new Float32Array(N);
    for (var i=0;i<N;i++){
      var a = fract(Math.sin(i*12.9898)*43758.5453);
      var b = fract(Math.sin(i*78.233)*43758.5453);
      var theta = a*Math.PI*2, phi = Math.acos(2*b-1);
      dirs[i*3]   = Math.sin(phi)*Math.cos(theta);
      dirs[i*3+1] = Math.cos(phi);
      dirs[i*3+2] = Math.sin(phi)*Math.sin(theta);
      rnd[i] = fract(Math.sin(i*3.7)*9301.17);
    }
    function fract(x){ return x - Math.floor(x); }

    // colour: white fibres, gold near tips for ~30% of fibres
    var cGold = new THREE.Color(0xffa23a), cWhite = new THREE.Color(0xf4f6ff), tmpC = new THREE.Color();
    for (var f=0; f<N; f++){
      var goldFibre = rnd[f] > 0.7;
      for (var s=0; s<S; s++){
        var idx = f*S + s;
        var segT = s/(S-1);
        var g = goldFibre ? smooth(0.45, 1.0, segT) : 0.0;
        tmpC.copy(cWhite).lerp(cGold, g);
        colors[idx*3]=tmpC.r; colors[idx*3+1]=tmpC.g; colors[idx*3+2]=tmpC.b;
      }
    }
    mesh.instanceColor = new THREE.InstancedBufferAttribute(colors, 3);

    // core glow sprite (additive)
    var glowTex = makeGlow();
    var glow = new THREE.Sprite(new THREE.SpriteMaterial({ map:glowTex, color:0xffb24d, blending:THREE.AdditiveBlending, depthWrite:false, depthTest:false, transparent:true }));
    glow.scale.set(2.2,2.2,1); group.add(glow);

    // contained object, shifted right so the left-column copy stays clear
    group.scale.setScalar(0.86);
    group.position.x = 0.35;

    // ---------- morph maths ----------
    var v0=new THREE.Vector3(), v1=new THREE.Vector3(), dir=new THREE.Vector3(), up=new THREE.Vector3(0,1,0),
        mid=new THREE.Vector3(), q=new THREE.Quaternion(), sc=new THREE.Vector3(), dummy=new THREE.Object3D(),
        yAxis=new THREE.Vector3(0,1,0), tang=new THREE.Vector3();

    function shapePoint(out, fi, segT, t, w){
      var dx=dirs[fi*3], dy=dirs[fi*3+1], dz=dirs[fi*3+2];
      // tangent for curl
      tang.set(dx,dy,dz).cross(yAxis); if (tang.lengthSq()<1e-5) tang.set(1,0,0); tang.normalize();
      var curl = Math.sin(t*0.8 + fi*0.7 + segT*6.2831)*0.14*segT;
      // sphere
      var sx=dx*segT*1.05 + tang.x*curl, sy=dy*segT*1.05 + tang.y*curl, sz=dz*segT*1.05 + tang.z*curl;
      // vortex
      var ang=segT*3.4 + t*0.6, ca=Math.cos(ang), sa=Math.sin(ang);
      var vx=dx*ca+dz*sa, vz=-dx*sa+dz*ca, vy=dy;
      var k=0.18+(1.0-0.18)*segT; vx*=k; vy=(vy*k)+(segT-0.5)*1.7; vz*=k;
      // rope
      var rx=lerp(dx*0.12,0,segT)+dx*0.18*(1-segT)+tang.x*curl*1.4;
      var ry=lerp(dy*0.12,-1.45,segT);
      var rz=lerp(dz*0.12,0,segT)+dz*0.18*(1-segT)+tang.z*curl*1.4;
      // disc
      var dl=Math.hypot(dx,dy*0.14,dz)||1; var fx=dx/dl, fy=(dy*0.14)/dl, fz=dz/dl;
      var ex=fx*segT*1.15, ey=fy*segT*1.15 + Math.sin(segT*3.14159)*0.05, ez=fz*segT*1.15;
      out.x = sx*w[0]+vx*w[1]+rx*w[2]+ex*w[3];
      out.y = sy*w[0]+vy*w[1]+ry*w[2]+ey*w[3];
      out.z = sz*w[0]+vz*w[1]+rz*w[2]+ez*w[3];
      return out;
    }
    function lerp(a,b,t){return a+(b-a)*t;}
    function smooth(e0,e1,x){ x=Math.min(1,Math.max(0,(x-e0)/(e1-e0))); return x*x*(3-2*x); }

    function weights(t){
      var L=30.0, p=(t/(L/4))%4.0, w=[0,0,0,0], sum=0;
      for(var k=0;k<4;k++){ var dd=Math.abs(((p-k+6)%4)-2); var x=Math.max(0,1-dd); w[k]=x*x*(3-2*x); sum+=w[k]; }
      sum=sum||1; for(var k2=0;k2<4;k2++) w[k2]/=sum; return w;
    }

    var pts = []; for (var pI=0; pI<=S; pI++) pts.push(new THREE.Vector3());

    function build(t){
      var w = weights(t);
      var baseR = 0.014;
      for (var f=0; f<N; f++){
        // compute S+1 points for this fibre
        for (var s=0; s<=S; s++) shapePoint(pts[s], f, s/S, t, w);
        for (var s2=0; s2<S; s2++){
          var idx=f*S+s2;
          v0.copy(pts[s2]); v1.copy(pts[s2+1]);
          mid.addVectors(v0,v1).multiplyScalar(0.5);
          dir.subVectors(v1,v0); var len=dir.length()||1e-4; dir.divideScalar(len);
          q.setFromUnitVectors(yAxis, dir);
          var taper = baseR*(1.0 - 0.6*(s2/(S-1)));
          dummy.position.copy(mid);
          dummy.quaternion.copy(q);
          dummy.scale.set(taper, len, taper);
          dummy.updateMatrix();
          mesh.setMatrixAt(idx, dummy.matrix);
        }
      }
      mesh.instanceMatrix.needsUpdate = true;
    }

    // ---------- loop ----------
    var started=0, raf=0, tgx=0,tgy=0, rx=0, ry=0;
    function frame(now){
      if(!started) started=now;
      var t=(now-started)/1000;
      build(t);
      ry += ((tgx*1.1) - ry)*0.05;
      rx += ((tgy*0.8) - rx)*0.05;
      group.rotation.y = t*0.18 + ry;
      group.rotation.x = Math.sin(t*0.12)*0.28 + rx;
      var pulse = 1.0 + 0.12*Math.sin(t*1.3);
      coreLight.intensity = 5.0*pulse;
      glow.scale.set(2.0*pulse, 2.0*pulse, 1);
      renderer.render(scene, camera);
      raf = requestAnimationFrame(frame);
    }
    function renderOnce(t){ build(t); group.rotation.y=t*0.18; renderer.render(scene,camera); }
    holder.__render = renderOnce;

    if (reduce) { renderOnce(6.0); }
    else { renderOnce(0.1); raf = requestAnimationFrame(frame); }

    if(!reduce){
      window.addEventListener("pointermove", function(e){ tgx=(e.clientX/innerWidth-0.5)*1.0; tgy=(e.clientY/innerHeight-0.5)*0.7; }, {passive:true});
      window.addEventListener("scroll", function(){ var y=window.pageYOffset||document.documentElement.scrollTop||0; holder.style.transform="translate3d(0,"+(y*0.3)+"px,0)"; }, {passive:true});
    }
    var rt; window.addEventListener("resize", function(){ clearTimeout(rt); rt=setTimeout(function(){
      W=hero.clientWidth||1; H=hero.clientHeight||1; renderer.setSize(W,H); camera.aspect=W/H; camera.updateProjectionMatrix();
      if (reduce) renderOnce(6.0);
    },160); });

    function makeGlow(){
      var c=document.createElement("canvas"); c.width=c.height=128; var g=c.getContext("2d");
      var rad=g.createRadialGradient(64,64,0,64,64,64);
      rad.addColorStop(0,"rgba(255,210,140,1)");
      rad.addColorStop(0.25,"rgba(255,160,60,0.7)");
      rad.addColorStop(1,"rgba(255,140,40,0)");
      g.fillStyle=rad; g.fillRect(0,0,128,128);
      var tx=new THREE.CanvasTexture(c); return tx;
    }
  }

  function boot(){ if (ready()) load(init); }
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();


/* ===== hero-signal.js ===== */
/* ============================================================
   hero-signal.js — "Vous, le centre de gravité du marché."
   A story-driven 3D particle piece (Three.js):
     1. NOISE   — a chaotic grey cloud = the crowded market.
     2. CLARITY — it collapses into a structured spiral galaxy
                  (strategy / system / algorithm brings order).
     3. SIGNAL  — a unique GREEN core ignites at the centre = you,
                  distinct from the grey competitors.
     4. PULL    — grey particles are drawn into orbit = clients won.
   Loops. Clear camera parallax on mouse. Loads Three.js on demand.
   Owns the hero when  <header ... data-fx="signal">.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THREE_URL = "https://unpkg.com/three@0.128.0/build/three.min.js";

  function ready(){ return document.querySelector('[data-fx="signal"]'); }
  function load(cb){ if(window.THREE) return cb();
    var s=document.createElement("script"); s.src=THREE_URL; s.async=true; s.onload=cb;
    s.onerror=function(){}; document.head.appendChild(s); }

  function signalColor(){
    var el=document.getElementById("site");
    var v=(el&&getComputedStyle(el).getPropertyValue("--signal").trim())||"#CBF24A";
    if(v[0]==="#"){var h=v.slice(1);if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var n=parseInt(h,16);
      return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];}
    var m=v.match(/[\d.]+/g); return m?[(+m[0])/255,(+m[1])/255,(+m[2])/255]:[0.8,0.95,0.29];
  }

  function init(){
    var hero=ready(); if(!hero||!window.THREE) return;
    if(getComputedStyle(hero).position==="static") hero.style.position="relative";
    var THREE=window.THREE, SIG=signalColor();

    var holder=document.createElement("div"); holder.className="hero-fx hero-fx--signal"; holder.setAttribute("aria-hidden","true");
    hero.insertBefore(holder, hero.firstChild);
    var scrim=document.createElement("div"); scrim.className="hero-scrim"; scrim.setAttribute("aria-hidden","true");
    hero.insertBefore(scrim, holder.nextSibling);

    var W=hero.clientWidth||1, H=hero.clientHeight||1;
    var renderer=new THREE.WebGLRenderer({antialias:true, alpha:false, powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
    renderer.setSize(W,H);
    holder.appendChild(renderer.domElement);

    var scene=new THREE.Scene(); scene.background=new THREE.Color(0x0C0B07);
    var camera=new THREE.PerspectiveCamera(48, W/H, 0.1, 100); camera.position.set(0,0,4.0);
    var group=new THREE.Group(); scene.add(group);

    // ---------- build particle data ----------
    var N = (W<760? 1800 : 3400);
    var noise=new Float32Array(N*3), order=new Float32Array(N*3), rndA=new Float32Array(N), typeA=new Float32Array(N);
    var GA=Math.PI*(3-Math.sqrt(5));           // golden angle
    for(var i=0;i<N;i++){
      // noise: random in a fat sphere
      var u=Math.random()*2-1, th=Math.random()*Math.PI*2, rr=Math.pow(Math.random(),0.5)*2.0;
      var s2=Math.sqrt(1-u*u);
      noise[i*3]=Math.cos(th)*s2*rr; noise[i*3+1]=u*rr*0.8; noise[i*3+2]=Math.sin(th)*s2*rr;
      // order: spiral galaxy disc
      var t=i/N;
      var rad=0.12+Math.pow(t,0.62)*1.55;
      var arm=GA*i + rad*2.4;                  // logarithmic-ish winding
      var jitter=(Math.random()-0.5)*0.06;
      order[i*3]=Math.cos(arm)*rad + jitter;
      order[i*3+1]=(Math.random()-0.5)*0.12*(1.0-t*0.5) + Math.sin(rad*3.0)*0.02; // thin disc
      order[i*3+2]=Math.sin(arm)*rad + jitter;
      rndA[i]=Math.random();
      typeA[i]= rad<0.42 ? 1.0 : 0.0;          // inner core particles glow green ( = you )
    }

    var pgeo=new THREE.BufferGeometry();
    pgeo.setAttribute("aNoise", new THREE.BufferAttribute(noise,3));
    pgeo.setAttribute("aOrder", new THREE.BufferAttribute(order,3));
    pgeo.setAttribute("aRnd", new THREE.BufferAttribute(rndA,1));
    pgeo.setAttribute("aType", new THREE.BufferAttribute(typeA,1));
    pgeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(N*3),3)); // dummy

    var pmat=new THREE.ShaderMaterial({
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
      uniforms:{ uMorph:{value:0}, uTime:{value:0}, uDpr:{value:renderer.getPixelRatio()},
        uGreen:{value:new THREE.Color(SIG[0],SIG[1],SIG[2])}, uPull:{value:0},
        uMouse:{value:new THREE.Vector2(2,2)}, uMouseStr:{value:0}, uAspect:{value:W/H} },
      vertexShader:[
        "attribute vec3 aNoise,aOrder; attribute float aRnd,aType;",
        "uniform float uMorph,uTime,uDpr,uPull,uMouseStr,uAspect; uniform vec2 uMouse;",
        "varying float vType,vDepth,vRnd;",
        "void main(){",
        " float m=uMorph;",
        " vec3 pos=mix(aNoise,aOrder,m);",
        // chaotic jitter while noisy
        " pos+=0.10*(1.0-m)*vec3(sin(uTime*1.3+aRnd*40.0),cos(uTime*1.1+aRnd*25.0),sin(uTime*0.9+aRnd*15.0));",
        // magnetism pull: grey particles drawn toward centre during PULL beat
        " float pull=uPull*(1.0-aType)*smoothstep(0.0,1.0,aRnd);",
        " pos=mix(pos, pos*0.25, pull*0.6);",
        " float spin=uTime*0.25*m;",            // galaxy rotation (extra to group)
        " float cs=cos(spin),sn=sin(spin); pos.xz=mat2(cs,-sn,sn,cs)*pos.xz;",
        " vec4 mv=modelViewMatrix*vec4(pos,1.0);",
        " vec4 clip=projectionMatrix*mv;",
        // interactive cursor repulsion in screen space (a ripple that follows the mouse)
        " vec2 ndc=clip.xy/clip.w; vec2 toM=ndc-uMouse; toM.x*=uAspect;",
        " float dm=length(toM); float infl=exp(-dm*dm*7.0)*uMouseStr;",
        " clip.xy += normalize(toM+1e-5)*infl*0.30*clip.w;",
        " gl_Position=clip;",
        " float base=(aType>0.5?2.3:1.3);",
        " gl_PointSize=base*uDpr*(1.0/max(0.2,-mv.z))*46.0*(1.0+infl*1.4);",
        " vType=aType; vDepth=clamp((-mv.z-2.0)/3.2,0.0,1.0); vRnd=aRnd;",
        "}"
      ].join("\n"),
      fragmentShader:[
        "precision highp float; uniform vec3 uGreen; varying float vType,vDepth,vRnd;",
        "void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); if(r>0.5) discard;",
        " float a=smoothstep(0.5,0.0,r);",
        " vec3 grey=vec3(0.55,0.58,0.60)*(0.35+0.65*vDepth);",
        " vec3 col=mix(grey, uGreen*1.5, vType);",
        " gl_FragColor=vec4(col, a*(0.30+0.70*vDepth));",
        "}"
      ].join("\n")
    });
    var points=new THREE.Points(pgeo,pmat); points.frustumCulled=false; group.add(points);

    // ---------- network lines (appear with order) ----------
    // connect each point to nearest neighbour in ORDER space (sampled subset for perf)
    var LN=Math.min(N, 2200);
    var lnNoise=[], lnOrder=[];
    (function(){
      // grid hash for nearest-neighbour
      var cell=0.28, grid={};
      function key(x,y,z){return Math.round(x/cell)+","+Math.round(y/cell)+","+Math.round(z/cell);}
      for(var i=0;i<N;i++){var k=key(order[i*3],order[i*3+1],order[i*3+2]);(grid[k]=grid[k]||[]).push(i);}
      for(var i=0;i<LN;i++){
        var ox=order[i*3],oy=order[i*3+1],oz=order[i*3+2], best=-1,bd=1e9;
        var cx=Math.round(ox/cell),cy=Math.round(oy/cell),cz=Math.round(oz/cell);
        for(var gx=-1;gx<=1;gx++)for(var gy=-1;gy<=1;gy++)for(var gz=-1;gz<=1;gz++){
          var arr=grid[(cx+gx)+","+(cy+gy)+","+(cz+gz)]; if(!arr)continue;
          for(var a=0;a<arr.length;a++){var j=arr[a]; if(j===i)continue;
            var dx=order[j*3]-ox,dy=order[j*3+1]-oy,dz=order[j*3+2]-oz,dd=dx*dx+dy*dy+dz*dz;
            if(dd<bd){bd=dd;best=j;}}
        }
        if(best>=0 && bd<cell*cell*2.2){
          lnNoise.push(noise[i*3],noise[i*3+1],noise[i*3+2], noise[best*3],noise[best*3+1],noise[best*3+2]);
          lnOrder.push(order[i*3],order[i*3+1],order[i*3+2], order[best*3],order[best*3+1],order[best*3+2]);
        }
      }
    })();
    var lgeo=new THREE.BufferGeometry();
    lgeo.setAttribute("aNoise", new THREE.BufferAttribute(new Float32Array(lnNoise),3));
    lgeo.setAttribute("aOrder", new THREE.BufferAttribute(new Float32Array(lnOrder),3));
    lgeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(lnOrder.length),3));
    var lmat=new THREE.ShaderMaterial({
      transparent:true, depthWrite:false, blending:THREE.AdditiveBlending,
      uniforms:{ uMorph:{value:0}, uTime:{value:0}, uGreen:{value:new THREE.Color(SIG[0],SIG[1],SIG[2])} },
      vertexShader:[
        "attribute vec3 aNoise,aOrder; uniform float uMorph,uTime; varying float vd;",
        "void main(){ vec3 pos=mix(aNoise,aOrder,uMorph);",
        " float spin=uTime*0.25*uMorph; float cs=cos(spin),sn=sin(spin); pos.xz=mat2(cs,-sn,sn,cs)*pos.xz;",
        " vec4 mv=modelViewMatrix*vec4(pos,1.0); gl_Position=projectionMatrix*mv; vd=clamp((-mv.z-2.0)/3.2,0.0,1.0); }"
      ].join("\n"),
      fragmentShader:[
        "precision highp float; uniform float uMorph; uniform vec3 uGreen; varying float vd;",
        "void main(){ gl_FragColor=vec4(mix(vec3(0.4,0.42,0.44),uGreen,0.25)*(0.3+0.7*vd), 0.16*uMorph); }"
      ].join("\n")
    });
    var lines=new THREE.LineSegments(lgeo,lmat); lines.frustumCulled=false; group.add(lines);

    // ---------- green core glow ----------
    function glowTex(){var c=document.createElement("canvas");c.width=c.height=128;var g=c.getContext("2d");
      var rad=g.createRadialGradient(64,64,0,64,64,64);
      rad.addColorStop(0,"rgba(220,255,150,1)"); rad.addColorStop(0.22,"rgba("+Math.round(SIG[0]*255)+","+Math.round(SIG[1]*255)+","+Math.round(SIG[2]*255)+",0.7)");
      rad.addColorStop(1,"rgba("+Math.round(SIG[0]*255)+","+Math.round(SIG[1]*255)+","+Math.round(SIG[2]*255)+",0)");
      g.fillStyle=rad;g.fillRect(0,0,128,128);return new THREE.CanvasTexture(c);}
    var core=new THREE.Sprite(new THREE.SpriteMaterial({map:glowTex(), color:0xffffff, blending:THREE.AdditiveBlending, depthWrite:false, depthTest:false, transparent:true}));
    core.scale.set(1.2,1.2,1); group.add(core);

    // ---------- phase timeline (loop) ----------
    function phase(t){
      // L-second loop: noise -> clarity(order) -> signal/pull -> back
      var L=18.0, p=(t%L)/L;   // 0..1
      var morph, pull;
      if(p<0.28){ morph=smooth(0,1, (p-0.06)/0.22); pull=0; }          // collapse to galaxy
      else if(p<0.62){ morph=1; pull=0; }                              // hold structured
      else if(p<0.80){ morph=1; pull=smooth(0,1,(p-0.62)/0.18); }      // magnetism pull-in
      else if(p<0.90){ morph=1; pull=smooth(1,0,(p-0.80)/0.10); }      // release
      else { morph=smooth(1,0,(p-0.90)/0.10); pull=0; }                // dissolve to noise
      return [Math.max(0,Math.min(1,morph)), Math.max(0,Math.min(1,pull))];
    }
    function smooth(a,b,x){x=Math.min(1,Math.max(0,x));var s=x*x*(3-2*x);return a+(b-a)*s;}

    var started=0, raf=0, tgx=0,tgy=0, cax=0,cay=0, mEnvX=2,mEnvY=2, mStr=0;
    function renderAt(t){
      var ph=phase(t), m=ph[0], pull=ph[1];
      pmat.uniforms.uMorph.value=m; pmat.uniforms.uTime.value=t; pmat.uniforms.uPull.value=pull;
      pmat.uniforms.uMouse.value.set(mEnvX, mEnvY); pmat.uniforms.uMouseStr.value=mStr; pmat.uniforms.uAspect.value=camera.aspect;
      mStr *= 0.94;                              // ripple decays when the cursor stops moving
      lmat.uniforms.uMorph.value=m; lmat.uniforms.uTime.value=t;
      var pulse=1.0+0.18*Math.sin(t*1.6);
      core.scale.setScalar((0.5+1.1*m)*pulse);
      // clear camera parallax (obvious)
      cax += (tgx - cax)*0.06; cay += (tgy - cay)*0.06;
      camera.position.x = cax*1.4; camera.position.y = -cay*1.0; camera.lookAt(0,0,0);
      group.rotation.y = t*0.05;                 // gentle base spin
      group.rotation.x = 0.32 + cay*0.25;        // tilt the galaxy + parallax tilt
      renderer.render(scene,camera);
    }
    holder.__render=renderAt;
    function frame(now){ if(!started)started=now; renderAt((now-started)/1000); raf=requestAnimationFrame(frame); }
    if(reduce){ renderAt(8.0); } else { renderAt(0.1); raf=requestAnimationFrame(frame); }

    if(!reduce){
      // cache the hero rect — reading getBoundingClientRect() on every pointermove
      // forces a synchronous layout and is what makes the cursor feel laggy.
      var hr=hero.getBoundingClientRect();
      var refreshRect=function(){ hr=hero.getBoundingClientRect(); };
      window.addEventListener("resize",refreshRect,{passive:true});
      window.addEventListener("pointermove",function(e){
        // camera parallax (whole galaxy)
        tgx=(e.clientX/innerWidth-0.5)*2.0; tgy=(e.clientY/innerHeight-0.5)*2.0;
        // cursor position in the hero, as NDC, for the repulsion ripple
        mEnvX = ((e.clientX-hr.left)/hr.width)*2-1;
        mEnvY = -(((e.clientY-hr.top)/hr.height)*2-1);
        mStr = Math.min(1.4, mStr+0.5);          // energise the ripple on movement
      },{passive:true});
      window.addEventListener("scroll",function(){ var y=window.pageYOffset||document.documentElement.scrollTop||0; refreshRect(); holder.style.transform="translate3d(0,"+(y*0.28)+"px,0)"; },{passive:true});
    }
    var rt; window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){
      W=hero.clientWidth||1;H=hero.clientHeight||1;renderer.setSize(W,H);camera.aspect=W/H;camera.updateProjectionMatrix();
      pmat.uniforms.uDpr.value=renderer.getPixelRatio(); if(reduce)renderAt(8.0);},160);});
  }

  function boot(){ if(ready()) load(init); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();


/* ===== hero-flux.js ===== */
/* ============================================================
   hero-flux.js — a REALISTIC black hole (gravitational lensing).
   A full-screen fragment shader marches each light ray and bends
   it around the singularity, so the accretion disk lenses up and
   over the event horizon — the Interstellar / Gargantua look.
   Event horizon (black), lensed disk, Doppler beaming, starfield,
   interactive camera orbit on mouse. data-variant tunes the disk
   palette / tilt per page. Loads Three.js on demand.
   Owns the hero when  <header ... data-fx="flux" data-variant="…">.
   ============================================================ */
(function () {
  "use strict";
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var THREE_URL = "https://unpkg.com/three@0.128.0/build/three.min.js";
  function ready(){ return document.querySelector('[data-fx="flux"]'); }
  function load(cb){ if(window.THREE) return cb();
    var s=document.createElement("script"); s.src=THREE_URL; s.async=true; s.onload=cb; s.onerror=function(){};
    document.head.appendChild(s); }
  function sig(){ var el=document.getElementById("site");
    var v=(el&&getComputedStyle(el).getPropertyValue("--signal").trim())||"#CBF24A";
    if(v[0]==="#"){var h=v.slice(1);if(h.length===3)h=h[0]+h[0]+h[1]+h[1]+h[2]+h[2];var n=parseInt(h,16);
      return [((n>>16)&255)/255,((n>>8)&255)/255,(n&255)/255];}
    var m=v.match(/[\d.]+/g); return m?[(+m[0])/255,(+m[1])/255,(+m[2])/255]:[0.8,0.95,0.29]; }

  // per-page disk palette (inner hot, outer) + tilt
  function variantOf(name, SIG){
    var P={
      lanes:  { c1:[1.0,0.92,0.7], c2:[SIG[0],SIG[1],SIG[2]], tilt:0.26 },
      grid:   { c1:[0.8,1.0,0.95], c2:[0.25,0.9,0.7],          tilt:0.20 },
      spiral: { c1:[1.0,0.85,0.55],c2:[1.0,0.5,0.2],           tilt:0.30 },
      helix:  { c1:[0.85,1.0,0.8], c2:[SIG[0],SIG[1],SIG[2]],  tilt:0.16 },
      wave:   { c1:[0.7,0.95,1.0], c2:[0.2,0.7,0.95],          tilt:0.24 },
      rings:  { c1:[1.0,0.9,0.6],  c2:[1.0,0.7,0.25],          tilt:0.34 }
    };
    return P[name]||P.lanes;
  }

  var FRAG = [
    "precision highp float;",
    "uniform vec2 uRes; uniform float uT; uniform vec2 uMouse; uniform vec3 uC1,uC2; uniform float uTilt;",
    "float hash(vec2 p){ p=fract(p*vec2(123.34,345.45)); p+=dot(p,p+34.345); return fract(p.x*p.y); }",
    "float vnoise(vec2 p){ vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f);",
    " float a=hash(i),b=hash(i+vec2(1,0)),c=hash(i+vec2(0,1)),d=hash(i+vec2(1,1));",
    " return mix(mix(a,b,f.x),mix(c,d,f.x),f.y); }",
    "float fbm(vec2 p){ float s=0.0,a=0.5; for(int i=0;i<5;i++){ s+=a*vnoise(p); p*=2.03; a*=0.5; } return s; }",
    "vec3 stars(vec3 dir){ vec2 uv=vec2(atan(dir.z,dir.x), asin(clamp(dir.y,-1.0,1.0)));",
    " float s=pow(hash(floor(uv*120.0)),120.0)*1.4; float s2=pow(hash(floor(uv*60.0)+7.0),90.0)*0.8;",
    " return vec3(s+s2)*vec3(0.8,0.85,1.0); }",
    "mat3 rotX(float a){ float c=cos(a),s=sin(a); return mat3(1.,0.,0., 0.,c,-s, 0.,s,c); }",
    "mat3 rotY(float a){ float c=cos(a),s=sin(a); return mat3(c,0.,s, 0.,1.,0., -s,0.,c); }",
    "void main(){",
    " vec2 uv=(gl_FragCoord.xy-0.5*uRes)/uRes.y;",
    " uv.x -= 0.16;",                                  // nudge the hole toward centre-right
    " float yaw=uMouse.x*0.5, pitch=uTilt + uMouse.y*0.25;",
    " mat3 rot=rotY(yaw)*rotX(pitch);",
    " vec3 ro=rot*vec3(0.0,0.0,5.2);",
    " vec3 fwd=normalize(-ro); vec3 rgt=normalize(cross(vec3(0.0,1.0,0.0),fwd)); vec3 upv=cross(fwd,rgt);",
    " vec3 rd=normalize(uv.x*rgt + uv.y*upv + 1.7*fwd);",
    " vec3 pos=ro, vel=rd; vec3 col=vec3(0.0); float alpha=0.0; bool horizon=false;",
    " float h=0.105, rs=0.55, GM=0.95; float prevY=pos.y;",
    " for(int i=0;i<150;i++){",
    "  float r=length(pos);",
    "  vec3 acc=-GM*pos/(r*r*r); vel+=acc*h; prevY=pos.y; pos+=vel*h; r=length(pos);",
    "  if(r<rs){ horizon=true; break; }",
    "  if(prevY*pos.y<0.0){",                          // crossed the disk plane y=0
    "   float tt=prevY/(prevY-pos.y); vec3 cp=mix(pos-vel*h,pos,tt);",
    "   float rr=length(cp.xz);",
    "   if(rr>0.78 && rr<2.7){",
    "    float ang=atan(cp.z,cp.x);",
    "    float sw=fbm(vec2(rr*2.6 - uT*0.25, ang*2.2 + uT*0.1));",
    "    float temp=smoothstep(2.7,0.78,rr);",
    "    vec3 dcol=mix(uC2,uC1,temp); dcol=mix(dcol,vec3(1.0),temp*temp*0.75);",
    "    float dop=0.45+0.85*cos(ang+1.3);",            // Doppler: one side brighter
    "    float bright=(0.35+sw*1.1)*dop*smoothstep(2.7,1.0,rr)*smoothstep(0.78,1.1,rr);",
    "    bright=max(bright,0.0); float a=clamp(bright,0.0,1.0)*0.92;",
    "    col+=dcol*bright*(1.0-alpha); alpha+=a*(1.0-alpha);",
    "    if(alpha>0.96) break;",
    "   }",
    "  }",
    "  if(r>9.0) break;",
    " }",
    " if(!horizon){ col += stars(normalize(vel))*(1.0-alpha); }",
    " // faint photon-ring rim glow around the shadow",
    " col = col/(1.0+col*0.6); col=pow(max(col,0.0),vec3(0.86));",
    " col *= 1.0 - 0.25*length(uv*vec2(0.6,1.0));",
    " gl_FragColor=vec4(col,1.0);",
    "}"
  ].join("\n");

  function init(){
    var hero=ready(); if(!hero||!window.THREE) return;
    if(getComputedStyle(hero).position==="static") hero.style.position="relative";
    var THREE=window.THREE, SIG=sig(), V=variantOf((hero.getAttribute("data-variant")||"lanes").trim(), SIG);

    var holder=document.createElement("div"); holder.className="hero-fx hero-fx--flux"; holder.setAttribute("aria-hidden","true");
    hero.insertBefore(holder, hero.firstChild);
    var scrim=document.createElement("div"); scrim.className="hero-scrim"; scrim.setAttribute("aria-hidden","true");
    hero.insertBefore(scrim, holder.nextSibling);

    var W=hero.clientWidth||1, H=hero.clientHeight||1;
    var renderer=new THREE.WebGLRenderer({antialias:false, alpha:false, powerPreference:"high-performance"});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.5)*0.72);
    renderer.setSize(W,H);
    holder.appendChild(renderer.domElement);
    var scene=new THREE.Scene();
    var cam=new THREE.OrthographicCamera(-1,1,1,-1,0,1);
    var uniforms={ uRes:{value:new THREE.Vector2(renderer.domElement.width,renderer.domElement.height)},
      uT:{value:0}, uMouse:{value:new THREE.Vector2(0,0)},
      uC1:{value:new THREE.Vector3(V.c1[0],V.c1[1],V.c1[2])}, uC2:{value:new THREE.Vector3(V.c2[0],V.c2[1],V.c2[2])},
      uTilt:{value:V.tilt} };
    var mat=new THREE.ShaderMaterial({ uniforms:uniforms,
      vertexShader:"void main(){ gl_Position=vec4(position.xy,0.0,1.0); }", fragmentShader:FRAG });
    scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2,2), mat));

    // ---------- infalling matter stream (spirals into the hole, mouse-reactive) ----------
    var PN=(W<760?820:1500);
    var aA0=new Float32Array(PN), aR0=new Float32Array(PN), aOff=new Float32Array(PN), aSpd=new Float32Array(PN);
    for(var p=0;p<PN;p++){ aA0[p]=Math.random()*6.2831; aR0[p]=0.45+Math.random()*0.7; aOff[p]=Math.random(); aSpd[p]=0.6+Math.random()*0.8; }
    var ggeo=new THREE.BufferGeometry();
    ggeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(PN*3),3));
    ggeo.setAttribute("aA0", new THREE.BufferAttribute(aA0,1));
    ggeo.setAttribute("aR0", new THREE.BufferAttribute(aR0,1));
    ggeo.setAttribute("aOff", new THREE.BufferAttribute(aOff,1));
    ggeo.setAttribute("aSpd", new THREE.BufferAttribute(aSpd,1));
    var pUni={ uT:{value:0}, uAspect:{value:H/W}, uHole:{value:new THREE.Vector2(0.16,0)},
      uYScale:{value:0.40+V.tilt*0.5}, uMouse:{value:new THREE.Vector2(2,2)}, uMouseStr:{value:0}, uDpr:{value:renderer.getPixelRatio()},
      uGreen:{value:new THREE.Vector3(SIG[0],SIG[1],SIG[2])} };
    var pmat=new THREE.ShaderMaterial({ transparent:true, depthTest:false, depthWrite:false, blending:THREE.AdditiveBlending, uniforms:pUni,
      vertexShader:[
        "attribute float aA0,aR0,aOff,aSpd; uniform float uT,uAspect,uYScale,uMouseStr,uDpr; uniform vec2 uHole,uMouse;",
        "varying float vB,vA;",
        "void main(){ float jp=fract(aOff+uT*(0.05+aSpd*0.05));",
        " float fall=jp*jp; float radius=mix(aR0,0.012,fall);",
        " float ang=aA0 + jp*12.566*aSpd + uT*0.25;",
        " vec2 pp=uHole + vec2(cos(ang)*radius*uAspect, sin(ang)*radius*uYScale);",
        " vec2 toM=pp-uMouse; float dm=length(toM); float infl=exp(-dm*dm*16.0)*uMouseStr;",
        " pp-=normalize(toM+1e-5)*infl*0.14;",
        " gl_Position=vec4(pp,0.0,1.0);",
        " float near=clamp(1.0-radius/aR0,0.0,1.0);",
        " vB=0.30+near*1.35; vA=smoothstep(0.0,0.06,jp)*smoothstep(1.0,0.86,jp);",
        " gl_PointSize=(1.0+near*3.2)*uDpr*(1.0+infl*2.2);",
        "}"
      ].join("\n"),
      fragmentShader:[
        "precision highp float; uniform vec3 uGreen; varying float vB,vA;",
        "void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); if(r>0.5) discard;",
        " float a=smoothstep(0.5,0.0,r)*vA;",
        " vec3 col=mix(vec3(0.65,0.78,0.9), uGreen, 0.5)*vB;",
        " col=mix(col, vec3(1.0), clamp(vB-0.85,0.0,1.0));",
        " gl_FragColor=vec4(col, a); }"
      ].join("\n")
    });
    var pts=new THREE.Points(ggeo,pmat); pts.frustumCulled=false; scene.add(pts);

    // ---------- neutron beam: a fine current streaming in from the LEFT, converging into the hole ----------
    var BN=(W<760?360:720);
    var bSeed=new Float32Array(BN), bLane=new Float32Array(BN), bSpd=new Float32Array(BN);
    for(var q=0;q<BN;q++){ bSeed[q]=Math.random(); bLane[q]=Math.random()*2-1; bSpd[q]=0.6+Math.random()*0.9; }
    var bgeo=new THREE.BufferGeometry();
    bgeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(BN*3),3));
    bgeo.setAttribute("bSeed", new THREE.BufferAttribute(bSeed,1));
    bgeo.setAttribute("bLane", new THREE.BufferAttribute(bLane,1));
    bgeo.setAttribute("bSpd",  new THREE.BufferAttribute(bSpd,1));
    var bmat=new THREE.ShaderMaterial({ transparent:true, depthTest:false, depthWrite:false, blending:THREE.AdditiveBlending,
      uniforms:{ uT:pUni.uT, uAspect:pUni.uAspect, uYScale:pUni.uYScale, uHole:pUni.uHole, uDpr:pUni.uDpr, uMouse:pUni.uMouse, uMouseStr:pUni.uMouseStr },
      vertexShader:[
        "attribute float bSeed,bLane,bSpd; uniform float uT,uAspect,uYScale,uMouseStr,uDpr; uniform vec2 uHole,uMouse;",
        "varying float vB,vA;",
        "void main(){ float jp=fract(bSeed+uT*(0.05+bSpd*0.05));",
        " float e=jp*jp;",
        " float startX=-1.18;",
        " float x=mix(startX, uHole.x, e);",
        " float conv=1.0-jp;",
        " float lane=bLane*0.26*conv;",
        " float arc=sin(jp*3.1416)*0.045*sign(bLane);",
        " vec2 pp=vec2(x, uHole.y + (lane+arc)*uYScale);",
        " vec2 toM=pp-uMouse; float dm=length(toM); float infl=exp(-dm*dm*16.0)*uMouseStr;",
        " pp-=normalize(toM+1e-5)*infl*0.12;",
        " gl_Position=vec4(pp,0.0,1.0);",
        " float near=e; vB=0.24+near*1.2;",
        " vA=smoothstep(0.0,0.04,jp)*smoothstep(1.0,0.74,jp);",
        " gl_PointSize=(0.8+near*2.4)*uDpr;",
        "}"
      ].join("\n"),
      fragmentShader:[
        "precision highp float; varying float vB,vA;",
        "void main(){ vec2 d=gl_PointCoord-0.5; float r=length(d); if(r>0.5) discard;",
        " float a=smoothstep(0.5,0.0,r)*vA;",
        " vec3 col=mix(vec3(0.55,0.72,1.0), vec3(0.95,0.98,1.0), clamp(vB-0.4,0.0,1.0))*vB;",
        " gl_FragColor=vec4(col, a); }"
      ].join("\n")
    });
    var beam=new THREE.Points(bgeo,bmat); beam.frustumCulled=false; scene.add(beam);

    var started=0, raf=0, tgx=0,tgy=0, mx=0,my=0, pmx=2,pmy=2, pStr=0;
    function size(){ W=hero.clientWidth||1; H=hero.clientHeight||1; renderer.setSize(W,H);
      uniforms.uRes.value.set(renderer.domElement.width, renderer.domElement.height);
      pUni.uAspect.value=H/W; pUni.uHole.value.set(0.32*H/W, 0); pUni.uDpr.value=renderer.getPixelRatio(); }
    function renderAt(t){ uniforms.uT.value=t; pUni.uT.value=t;
      mx+=(tgx-mx)*0.05; my+=(tgy-my)*0.05; uniforms.uMouse.value.set(mx,my);
      pUni.uMouse.value.set(pmx,pmy); pUni.uMouseStr.value=Math.min(1.0,0.45+pStr); pStr*=0.93;
      renderer.render(scene,cam); }
    holder.__render=renderAt;
    function frame(now){ if(!started)started=now; renderAt((now-started)/1000); raf=requestAnimationFrame(frame); }
    size();
    if(reduce){ renderAt(2.0); } else { renderAt(0.1); raf=requestAnimationFrame(frame); }

    if(!reduce){
      window.addEventListener("pointermove",function(e){ var r=hero.getBoundingClientRect();
        tgx=(e.clientX/innerWidth-0.5)*1.0; tgy=(e.clientY/innerHeight-0.5)*0.7;
        pmx=((e.clientX-r.left)/r.width)*2-1; pmy=-(((e.clientY-r.top)/r.height)*2-1);
        pStr=Math.min(1.2, pStr+0.4);
      },{passive:true});
      window.addEventListener("scroll",function(){ var y=window.pageYOffset||document.documentElement.scrollTop||0; holder.style.transform="translate3d(0,"+(y*0.25)+"px,0)"; },{passive:true});
    }
    var rt; window.addEventListener("resize",function(){clearTimeout(rt);rt=setTimeout(function(){ size(); if(reduce)renderAt(2.0); },160);});
  }
  function boot(){ if(ready()) load(init); }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",boot);
  else boot();
})();


/* ===== scroll-anim.js ===== */
/* ============================================================
   scroll-anim.js — the "scroll cinema" engine.
   Pure vanilla, rAF-batched, no libraries. Everything is
   progressive: with no JS the page is the normal static site.
   Honours prefers-reduced-motion (content stays visible, motion
   is dropped) and disables scroll-pinning on small screens.
   ============================================================ */
(function () {
  "use strict";
  var docEl = document.documentElement;
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  docEl.classList.add("js-scroll");

  /* ---------------- 0 · scroll progress bar ---------------- */
  var bar = document.createElement("div");
  bar.className = "scrollbar";
  bar.setAttribute("aria-hidden", "true");
  document.body.appendChild(bar);

  /* ---------------- 1 · kinetic hero title ---------------- */
  (function kineticTitle() {
    var title = document.querySelector("[data-kin]") || document.querySelector(".hero-main__title");
    if (!title) return;

    function wrapWord(word) {
      var kw = document.createElement("span");
      kw.className = "kw";
      var i = document.createElement("i");
      i.textContent = word;
      kw.appendChild(i);
      return kw;
    }
    var idx = 0;
    var nodes = Array.prototype.slice.call(title.childNodes);
    title.innerHTML = "";
    nodes.forEach(function (node) {
      if (node.nodeType === 3) {                 // text → split into words
        var parts = node.textContent.split(/(\s+)/);
        parts.forEach(function (p) {
          if (/^\s+$/.test(p)) { title.appendChild(document.createTextNode(p)); }
          else if (p.length) {
            var kw = wrapWord(p);
            kw.firstChild.style.setProperty("--kd", (idx++ * 0.07) + "s");
            title.appendChild(kw);
          }
        });
      } else if (node.nodeName === "BR") {
        title.appendChild(node);
      } else {                                    // element (e.g. .ital.hl) → rise as one unit
        var kw = document.createElement("span");
        kw.className = "kw";
        var i = document.createElement("i");
        i.appendChild(node);
        i.style.setProperty("--kd", (idx++ * 0.07) + "s");
        kw.appendChild(i);
        title.appendChild(kw);
      }
    });
    title.classList.add("kin-arm");                 // hide words for the entrance (visible is the default state)
    requestAnimationFrame(function () {
      requestAnimationFrame(function () { title.classList.remove("kin-arm"); });
    });
    setTimeout(function () { title.classList.remove("kin-arm"); }, 1400);   // failsafe: never leave words hidden
  })();

  /* ---------------- 2 · IO reveals (clip + rise) ---------------- */
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { rootMargin: "0px 0px -12% 0px", threshold: 0.12 });

    document.querySelectorAll("[data-reveal-clip]").forEach(function (el) { io.observe(el); });
    document.querySelectorAll("[data-rise]").forEach(function (g) {
      Array.prototype.forEach.call(g.children, function (c, i) { c.style.setProperty("--i", i); });
      io.observe(g);
    });
  } else {
    document.querySelectorAll("[data-reveal-clip],[data-rise]").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------------- 3 · custom cursor + magnetic buttons ---------------- */
  var fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
  if (fine && !reduce) {
    docEl.classList.add("has-cur");
    var dot = document.createElement("div"); dot.className = "cur";
    var ring = document.createElement("div"); ring.className = "cur-ring";
    document.body.appendChild(dot); document.body.appendChild(ring);
    var mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener("pointermove", function (e) {
      mx = e.clientX; my = e.clientY;
      dot.style.transform = "translate(" + mx + "px," + my + "px) translate(-50%,-50%)";
    }, { passive: true });
    (function ringLoop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      ring.style.transform = "translate(" + rx + "px," + ry + "px) translate(-50%,-50%)";
      requestAnimationFrame(ringLoop);
    })();
    var hot = "a,button,summary,.btn,.diag__opt,input,[role=button]";
    document.addEventListener("pointerover", function (e) {
      if (e.target.closest(hot)) ring.classList.add("is-hot");
    });
    document.addEventListener("pointerout", function (e) {
      if (e.target.closest(hot) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(hot)))
        ring.classList.remove("is-hot");
    });

    /* magnetic pull on primary CTAs */
    document.querySelectorAll(".btn--lg, .btn[data-mag]").forEach(function (b) {
      b.setAttribute("data-mag", "");
      b.addEventListener("pointermove", function (e) {
        var r = b.getBoundingClientRect();
        var dx = (e.clientX - (r.left + r.width / 2)) * 0.3;
        var dy = (e.clientY - (r.top + r.height / 2)) * 0.4;
        b.classList.add("pulled");
        b.style.setProperty("--mx", dx + "px");
        b.style.setProperty("--my", dy + "px");
      });
      b.addEventListener("pointerleave", function () {
        b.classList.remove("pulled");
        b.style.setProperty("--mx", "0px"); b.style.setProperty("--my", "0px");
      });
    });
  }

  /* ---------------- 4 · scroll-bound work (parallax + pin) ---------------- */
  var pars = Array.prototype.slice.call(document.querySelectorAll("[data-par]"));
  var pinwrap = document.querySelector(".pinwrap");
  var pin = pinwrap && pinwrap.querySelector(".pin");
  var panels = pinwrap ? Array.prototype.slice.call(pinwrap.querySelectorAll(".pin__panel")) : [];
  var numEl = pinwrap && pinwrap.querySelector(".pin__num");
  var dots = pinwrap ? Array.prototype.slice.call(pinwrap.querySelectorAll(".pin__dots i")) : [];
  var countEl = pinwrap && pinwrap.querySelector(".pin__count");

  var pinActive = false;
  function pinOn() { return !reduce && innerWidth > 760; }

  function setPin(p) {                 // p: 0..1 progress across the section
    if (!panels.length) return;
    var n = panels.length;
    var seg = Math.min(n - 1, Math.floor(p * n));
    var within = (p * n) - seg;        // 0..1 inside the active segment
    panels.forEach(function (panel, i) {
      panel.classList.toggle("is-on", i === seg);
      panel.classList.toggle("is-prev", i < seg);
    });
    if (numEl) {
      var num = String(seg + 1).padStart(2, "0");
      numEl.textContent = num;
      numEl.setAttribute("data-fillnum", num);
      numEl.style.setProperty("--np", within.toFixed(3));
    }
    dots.forEach(function (d, i) {
      d.classList.toggle("done", i < seg);
      d.classList.toggle("active", i === seg);
      if (i === seg) d.style.setProperty("--seg", (within * 100).toFixed(1) + "%");
    });
    if (countEl) countEl.textContent = "Étape " + (seg + 1) + " / " + n;
  }

  function onScroll() {
    var st = window.pageYOffset || docEl.scrollTop;
    var docH = docEl.scrollHeight - innerHeight;
    bar.style.width = (docH > 0 ? (st / docH) * 100 : 0) + "%";

    /* parallax */
    for (var i = 0; i < pars.length; i++) {
      var el = pars[i];
      var r = el.getBoundingClientRect();
      var speed = parseFloat(el.getAttribute("data-par")) || 0.12;
      var center = r.top + r.height / 2 - innerHeight / 2;
      el.style.setProperty("--py", (-center * speed).toFixed(1) + "px");
    }

    /* pinned méthode */
    if (pinwrap && pinActive) {
      var pr = pinwrap.getBoundingClientRect();
      var total = pinwrap.offsetHeight - innerHeight;
      var p = total > 0 ? Math.min(1, Math.max(0, -pr.top / total)) : 0;
      setPin(p);
    }
  }

  var ticking = false;
  function reqScroll() {
    if (ticking) return; ticking = true;
    requestAnimationFrame(function () { onScroll(); ticking = false; });
  }

  function configurePin() {
    if (!pinwrap) return;
    var want = pinOn();
    if (want && !pinActive) { pinActive = true; }
    else if (!want && pinActive) {
      pinActive = false;
      panels.forEach(function (panel) { panel.classList.remove("is-on", "is-prev"); });
    }
    pinwrap.classList.toggle("pin-static", !want);
  }

  window.addEventListener("scroll", reqScroll, { passive: true });
  window.addEventListener("resize", function () { configurePin(); reqScroll(); }, { passive: true });
  configurePin();
  onScroll();
})();

