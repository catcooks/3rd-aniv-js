/* Requires icons.js (defines the global ICONS object with inline SVG strings). */
(() => {
  "use strict";

  /* ─────────────  EDIT THESE  ───────────── */
  const TITLE = "Happy Anniversary";
  const MESSAGE = [
    "Every second with you feels like my favorite one.",
    "Thank you for being my calm, my laughter, and my home.",
  ];
  const SIGN_OFF = "Yours, always";

  // image files (put them in the assets folder)
  const HERO_IMG = "assets/bouquet.png";

  const BURST_ICONS = [
    "IoFlower", "BsFlower1", "IoIosFlower", "GiFlowerTwirl", "GiSpotedFlower", "GiDandelionFlower",
  ];

  const PALETTES = {
    mixed:  ["#f6a5c0", "#ffd23f", "#c9a7ee", "#ffffff", "#e8506a", "#8fb996"], // hero
    pink:   ["#f6a5c0", "#ff8fa3", "#ffc4d6", "#e8506a"],
    blue:   ["#8ec5ff", "#5aa9f0", "#bfe0ff", "#ffffff"],
    yellow: ["#ffd23f", "#ffe08a", "#ffb347", "#fff7d6"],
    lpink:  ["#ffe3ec", "#fbd5e0", "#ffc4d6", "#fff1ea"],
    violet: ["#c9a7ee", "#a77bc4", "#d7b8f3", "#e6d4fa"],
    green:  ["#8fb996", "#b7d9a8", "#6fae85", "#e6f2c8"],
  };

  // One entry per small bouquet. Even index = bouquet on the left, odd = on the right.
  // nudge = extra push down (px), tilt = rotation (deg) → the "scattered" feel.
  const STOPS = [
    { img: "assets/1.png", burst: PALETTES.pink,   title: "The beginning",
      text: "It was tough, I'm so glad we made it this far after all that happened",
      nudge: 0,  tilt: -4 },
    { img: "assets/2.png", burst: PALETTES.blue,   title: "Little things",
      text: "Even the smallest things you do gives me warmth",
      nudge: 26, tilt: 3 },
    { img: "assets/3.png", burst: PALETTES.yellow, title: "Your laugh",
      text: "I love how you laugh at how goofy I am",
      nudge: 8,  tilt: -2 },
    { img: "assets/4.png", burst: PALETTES.lpink,  title: "Thank you",
      text: "Thank you for choosing me, again and again, on the easy days and the hard ones.",
      nudge: 30, tilt: 4 },
    { img: "assets/5.png", burst: PALETTES.violet, title: "Home",
      text: "Wherever we are, you're the place I want to come home to.",
      nudge: 4,  tilt: -3 },
    { img: "assets/6.png", burst: PALETTES.green,  title: "Always",
      text: "Here's to us, to today, and to every day after it. I love you. my sweetie",
      nudge: 22, tilt: 2 },
  ];

  const HOVER_MS = 3000;       // how long the plane hovers at a message before moving on
  const AUTO_SCROLL = false;   // true = page scrolls to the next bouquet when the plane leaves
  const BLOOMS_ON_MINI = false; // true = also sprinkle icon flowers on the small bouquets
  /* ───────────────────────────────────────── */

  /* ───────────── trail / plane tuning ───────────── */
  const TRAIL_SIZE = 10;   // max strokes in the DOM at once (keeps it light)
  const CLEARANCE = 20;    // px ahead of the plane before the first stroke
  const LINE_RUNS = [4, 3, 5, 4, 3, 5]; // broken lines between hearts (3–5)
  const DASH_LEN = 16;     // 1rem
  const HEART_LEN = 18;
  const BIT_GAP = 10;
  const PLANE_SPEED = 0.38; // px per ms
  const SAMPLES = 36;

  const BURST_COUNT = 22;
  const LEAF_ICONS = ["GiFallingLeaf", "GiMapleLeaf", "GiOakLeaf"];
  const LEAF_COLORS = [
    "#f0b45b", // amber
    "#e58a8a", // rose
    "#d9824a", // burnt orange
    "#c9a24b", // gold
    "#a77bc4", // lilac
    "#8fb996", // sage
  ];
  const LEAVES_PER_CLICK = 26;

  /*
    Flowers sitting in the bouquet opening.
    x / y = center of the flower as a fraction of the bouquet image (0–1),
    size  = flower width as a fraction of the image width,
    rot   = tilt in degrees.
    Listed roughly top → bottom so lower flowers overlap the upper ones.
  */
  const fl = (icon, x, y, size, color, rot = 0) => ({ icon, x, y, size, color, rot });
  const FLOWERS = [
    fl("GiFlowerTwirl",    0.6,  0.09, 0.15, "#ffd1a1", 20),
    fl("IoFlower",         0.43, 0.1,  0.16, "#ffc4d6", -12),
    fl("GiSunflower",      0.5,  0.15, 0.3,  "#ffd23f", 8),
    fl("GiDandelionFlower",0.77, 0.16, 0.14, "#ffffff", 15),
    fl("BsFlower1",        0.25, 0.17, 0.14, "#ffe3ec", -18),
    fl("GiSunflower",      0.36, 0.14, 0.12, "#ffe08a", 25),
    fl("IoFlower",         0.3,  0.24, 0.24, "#f6a5c0", -10),
    fl("GiFlowerTwirl",    0.7,  0.24, 0.24, "#c9a7ee", 12),
    fl("GiSpotedFlower",   0.5,  0.3,  0.2,  "#e8506a", 0),
    fl("GiDandelionFlower",0.88, 0.3,  0.12, "#fff7d6", -20),
    fl("BsFlower1",        0.14, 0.31, 0.12, "#fff1ea", 18),
    fl("BsFlower1",        0.38, 0.36, 0.2,  "#fff1ea", -8),
    fl("GiDandelionFlower",0.64, 0.36, 0.17, "#fff7d6", 10),
    fl("GiSunflower",      0.8,  0.37, 0.16, "#ffb347", -14),
    fl("IoIosFlower",      0.22, 0.38, 0.18, "#fbd5e0", 6),
    fl("GiSpotedFlower",   0.31, 0.45, 0.14, "#ff8fa3", -22),
    fl("IoFlower",         0.52, 0.43, 0.15, "#f6a5c0", 16),
    fl("IoIosFlower",      0.7,  0.46, 0.14, "#d7b8f3", -6),
  ];
  const MINI_FLOWERS = FLOWERS.slice(0, 9);

  /* ═══════════════  helpers  ═══════════════ */

  const $ = (id) => document.getElementById(id);
  const rand = (min, max) => Math.random() * (max - min) + min;
  const pick = (arr) => arr[Math.floor(rand(0, arr.length))];
  const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function el(tag, className, parent) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (parent) parent.appendChild(node);
    return node;
  }
  const icon = (name) => ICONS[name] || "";

  /* ═══════════════  Burst (confetti flowers)  ═══════════════ */

  function spawnBurst(container, colors) {
    const group = [];
    for (let i = 0; i < BURST_COUNT; i++) {
      const angle = rand(0, Math.PI * 2);
      const dist = rand(0.25, 0.75); // in em (scales with bouquet size)
      const piece = el("span", "anniv__piece", container);
      piece.innerHTML = icon(pick(BURST_ICONS));
      const w = `${rand(0.09, 0.17)}em`;
      const s = piece.style;
      s.width = w;
      s.height = `${rand(0.09, 0.17)}em`;
      s.color = pick(colors);
      s.animationDuration = `${rand(1.7, 2.5)}s`;
      s.setProperty("--dx", `${(Math.cos(angle) * dist).toFixed(3)}em`);
      s.setProperty("--dy", `${(Math.sin(angle) * dist - 0.12).toFixed(3)}em`); // slight upward bias
      s.setProperty("--fall", `${rand(0.9, 1.7).toFixed(3)}em`);
      s.setProperty("--spin", `${rand(-540, 540)}deg`);
      group.push(piece);
    }
    setTimeout(() => group.forEach((p) => p.remove()), 2800);
  }

  /* ═══════════════  Bouquet (hero + small ones)  ═══════════════ */

  function createBouquet({
    src, flowers, size, bloomFrom, tilt = 0, label,
    burstColors = PALETTES.mixed, onClick,
  }) {
    const btn = el("button", "anniv__bouquet");
    btn.type = "button";
    btn.setAttribute("aria-label", label);
    btn.style.fontSize = size;
    btn.style.transform = `rotate(${tilt}deg)`;

    const shake = el("span", "anniv__shake", btn);
    const img = el("img", "anniv__img", shake);
    img.src = src;
    img.alt = "";
    img.draggable = false;

    flowers.forEach((f, i) => {
      const wrap = el("span", "anniv__flower", shake);
      wrap.style.left = `${f.x * 100}%`;
      wrap.style.top = `${f.y * 100}%`;
      wrap.style.width = `${f.size}em`;
      wrap.style.height = `${f.size}em`;
      wrap.style.setProperty("--rot", `${f.rot}deg`);
      const bloom = el("span", "anniv__bloom", wrap);
      bloom.style.color = f.color;
      bloom.style.animationDelay = `${bloomFrom + i * 0.07}s`;
      bloom.innerHTML = icon(f.icon);
    });

    const burst = el("span", "anniv__burst", btn);
    burst.setAttribute("aria-hidden", "true");

    btn.addEventListener("click", () => {
      if (!reducedMotion()) {
        shake.animate(
          [
            { transform: "rotate(0deg)" },
            { transform: "rotate(-9deg)", offset: 0.12 },
            { transform: "rotate(8deg)", offset: 0.28 },
            { transform: "rotate(-6deg)", offset: 0.44 },
            { transform: "rotate(5deg)", offset: 0.6 },
            { transform: "rotate(-3deg)", offset: 0.76 },
            { transform: "rotate(1.5deg)", offset: 0.9 },
            { transform: "rotate(0deg)" },
          ],
          { duration: 700, easing: "ease-in-out" },
        );
        spawnBurst(burst, burstColors); // surprise flower burst
      }
      onClick();
    });

    return btn;
  }

  /* ═══════════════  Paper-airplane flight engine  ═══════════════ */

  const ease = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  function lowerBound(arr, v) {
    let lo = 0;
    let hi = arr.length;
    while (lo < hi) {
      const mid = (lo + hi) >> 1;
      if (arr[mid] < v) lo = mid + 1;
      else hi = mid;
    }
    return lo;
  }

  function posAt(r, d) {
    const dd = Math.max(0, Math.min(r.total, d));
    let lo = 0;
    let hi = r.cum.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >> 1;
      if (r.cum[mid] <= dd) lo = mid;
      else hi = mid;
    }
    const span = r.cum[hi] - r.cum[lo] || 1;
    const t = (dd - r.cum[lo]) / span;
    return {
      x: r.xs[lo] + (r.xs[hi] - r.xs[lo]) * t,
      y: r.ys[lo] + (r.ys[hi] - r.ys[lo]) * t,
      a: Math.atan2(r.ys[hi] - r.ys[lo], r.xs[hi] - r.xs[lo]),
    };
  }

  // wps: [{x, y, kind}] with kind "S" start, "A" approach, "H" hover, "E" end
  function makeRoute(wps, aims) {
    const xs = [];
    const ys = [];
    const cum = [];
    const wd = [0];
    let total = 0;

    const push = (x, y) => {
      if (xs.length)
        total += Math.hypot(x - xs[xs.length - 1], y - ys[ys.length - 1]);
      xs.push(x);
      ys.push(y);
      cum.push(total);
    };
    push(wps[0].x, wps[0].y);

    // Smooth S-curves between waypoints. Leaving a hover/approach point the curve
    // starts sideways (so it never cuts through a message card), and arriving at an
    // approach/end point it drops in vertically.
    for (let n = 0; n < wps.length - 1; n++) {
      const P = wps[n];
      const Q = wps[n + 1];
      const dx = Q.x - P.x;
      const dy = Q.y - P.y;
      const dir = dx >= 0 ? 1 : -1;
      const kv = Math.max(Math.abs(dy) * 0.5, 20);
      const kh = Math.max(Math.abs(dx) * 0.5, 20);
      const c1 = P.kind === "S" ? { x: P.x, y: P.y + kv } : { x: P.x + dir * kh, y: P.y };
      const c2 = Q.kind === "H" ? { x: Q.x - dir * kh, y: Q.y } : { x: Q.x, y: Q.y - kv };
      for (let s = 1; s <= SAMPLES; s++) {
        const t = s / SAMPLES;
        const u = 1 - t;
        push(
          u * u * u * P.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * Q.x,
          u * u * u * P.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * Q.y,
        );
      }
      wd.push(total);
    }

    const base = { xs, ys, cum, total };

    // Pre-compute where every heart / broken line sits along the route.
    // Pattern: heart, 3–5 broken lines, heart, 3–5 broken lines, …
    const items = [];
    let cursor = 30;
    let run = 0;
    const place = (kind, len) => {
      const d = cursor + len / 2;
      cursor += len + BIT_GAP;
      if (d > total - 4) return;
      const p = posAt(base, d);
      const deg = (p.a * 180) / Math.PI - 90;
      items.push({
        id: items.length,
        kind,
        x: p.x,
        y: p.y,
        d,
        tf:
          kind === "dash"
            ? `translate(-50%, -50%) rotate(${deg.toFixed(1)}deg)`
            : "translate(-50%, -50%)",
      });
    };
    while (cursor < total) {
      place("heart", HEART_LEN);
      const lines = LINE_RUNS[run++ % LINE_RUNS.length];
      for (let k = 0; k < lines; k++) place("dash", DASH_LEN);
    }

    return { ...base, wd, aims, items, itemD: items.map((b) => b.d) };
  }

  function createFlight(h, count) {
    // waypoint indexes: 0 = start, 1+2i = approach bouquet i, 2+2i = hover at message i, last = end
    const END_WP = 2 * count + 1;
    let route = null;
    let d = 0;
    let wp = 0;
    let rot = 0;
    let win = -1;
    let token = 0;
    let raf = 0;
    let aim = null;
    let anim = null;
    const timers = [];

    const render = () => {
      if (!route) return;
      const p = posAt(route, d);
      h.plane.style.transform = `translate3d(${p.x.toFixed(1)}px, ${p.y.toFixed(1)}px, 0)`;

      // the airplane icon points up, so +90°. At rest it looks at its target, otherwise along the path.
      const heading = aim ? Math.atan2(aim.y - p.y, aim.x - p.x) : p.a;
      let deg = (heading * 180) / Math.PI + 90;
      deg += 360 * Math.round((rot - deg) / 360); // never spin the long way round
      if (Math.abs(deg - rot) > 0.4) {
        rot = deg;
        h.tilt.style.transform = `rotate(${deg.toFixed(1)}deg)`;
      }

      const first = lowerBound(route.itemD, d + CLEARANCE);
      if (first !== win) {
        win = first;
        h.setWin(first);
      }
    };

    const tick = (now) => {
      const a = anim;
      if (!a) {
        raf = 0;
        return;
      }
      const p = Math.min(1, (now - a.t0) / a.dur);
      d = a.from + (a.to - a.from) * ease(p);
      render();
      if (p >= 1) {
        anim = null;
        raf = 0;
        a.done();
        return;
      }
      raf = requestAnimationFrame(tick);
    };

    const glide = (to) =>
      new Promise((resolve) => {
        if (!route) return resolve();
        // already flying there → just wait for that flight
        if (anim && anim.wp === to) {
          const prev = anim.done;
          anim.done = () => {
            prev();
            resolve();
          };
          return;
        }
        const old = anim;
        anim = null;
        if (old) old.done();

        wp = to;
        const dest = route.wd[to];
        if (Math.abs(dest - d) < 1) {
          d = dest;
          aim = route.aims[to];
          render();
          return resolve();
        }
        aim = null;
        const dur = reducedMotion()
          ? 1
          : Math.min(2800, Math.max(800, Math.abs(dest - d) / PLANE_SPEED));
        anim = {
          from: d,
          to: dest,
          wp: to,
          t0: performance.now(),
          dur,
          done: () => {
            aim = (route && route.aims[to]) || null;
            render();
            resolve();
          },
        };
        cancelAnimationFrame(raf);
        raf = requestAnimationFrame(tick);
      });

    const wait = (ms) =>
      new Promise((resolve) => {
        timers.push(window.setTimeout(resolve, ms));
      });

    const build = () => {
      const cr = h.box.getBoundingClientRect();
      if (!cr.width) return;
      const rel = (node) => {
        if (!node) return { l: 0, t: 0, w: 0, h: 0 };
        const r = node.getBoundingClientRect();
        return { l: r.left - cr.left, t: r.top - cr.top, w: r.width, h: r.height };
      };

      const wps = [{ x: cr.width / 2, y: 22, kind: "S" }];
      const aims = [null];
      for (let i = 0; i < count; i++) {
        const b = rel(h.arts[i] && h.arts[i].firstElementChild);
        const s = rel(h.slots[i]);
        const onLeft = i % 2 === 0;
        // approach: just beside the top inner corner of the bouquet, looking at it
        wps.push({
          x: onLeft ? b.l + b.w + 14 : b.l - 14,
          y: b.t + b.h * 0.1,
          kind: "A",
        });
        aims.push({ x: b.l + b.w / 2, y: b.t + b.h * 0.5 });
        // hover: above the message card, looking down at it
        const hx = s.l + s.w / 2;
        const hy = s.t + 20;
        wps.push({ x: hx, y: hy, kind: "H" });
        aims.push({ x: hx, y: hy + 80 });
      }
      wps.push({ x: cr.width / 2, y: cr.height - 36, kind: "E" });
      aims.push(null);

      route = makeRoute(wps, aims);
      if (anim) {
        const a = anim;
        anim = null;
        a.done();
      }
      d = route.wd[wp];
      aim = route.aims[wp];
      win = -1;
      h.setItems(route.items);
      render();
    };

    const play = async (i) => {
      const my = ++token;
      const live = () => my === token;
      await glide(2 * i + 1); // be next to the bouquet
      if (!live()) return;
      await glide(2 * i + 2); // hover at its message
      if (!live()) return;
      await wait(HOVER_MS);
      if (!live()) return;
      if (i === count - 1) {
        await glide(END_WP); // last one: drift away and fade
        if (!live()) return;
        h.setGone(true);
        return;
      }
      if (AUTO_SCROLL && h.arts[i + 1])
        h.arts[i + 1].scrollIntoView({ behavior: "smooth", block: "center" });
      await glide(2 * i + 3); // on to the next bouquet
    };

    const start = () => {
      if (wp === 0) glide(1);
    };

    const destroy = () => {
      token++;
      anim = null;
      cancelAnimationFrame(raf);
      timers.forEach(clearTimeout);
    };

    return { build, play, start, destroy, waypoint: () => wp };
  }

  const fade = (rank) => (rank < 5 ? 1 : Math.max(0.12, 1 - (rank - 4) / 6));

  /* ═══════════════  Page  ═══════════════ */

  // ── text ──
  
  $("title").textContent = TITLE;
  document.title = TITLE;
  $("chevron").innerHTML = icon("HiChevronDown");
  $("bob").innerHTML = icon("HiPaperAirplane");

  // ── hero ──
  const leavesBox = $("leaves");
  const heroHint = $("heroHint");
  const heroNote = $("heroNote");
  let heroOpen = false;

  function showHeroNote() {
    heroHint.hidden = true;
    heroNote.innerHTML = "";
    MESSAGE.forEach((line) => {
      const p = el("p", "", heroNote);
      p.textContent = line;
    });
    const sign = el("p", "anniv__sign", heroNote);
    sign.append(`${SIGN_OFF} `);
    const heart = el("span", "anniv__tiny", sign);
    heart.innerHTML = icon("FaHeart");
    heroNote.hidden = false;
  }

  function dropLeaves() {
    const group = [];
    for (let i = 0; i < LEAVES_PER_CLICK; i++) {
      const leaf = el("span", "anniv__leaf", leavesBox);
      leaf.innerHTML = icon(pick(LEAF_ICONS));
      const s = leaf.style;
      s.left = `${rand(0, 100)}%`;
      s.fontSize = `${rand(20, 42)}px`;
      s.color = pick(LEAF_COLORS);
      s.animationDuration = `${rand(5, 9)}s, ${rand(2.5, 4.5)}s`;
      s.animationDelay = `${rand(0, 1.2)}s, 0s`;
      s.setProperty("--drift", `${rand(-90, 90)}px`);
      s.setProperty("--spin", `${rand(-540, 540)}deg`);
      group.push(leaf);
    }
    // remove this batch once its longest leaf has landed
    setTimeout(() => group.forEach((l) => l.remove()), 11000);
  }

  $("heroBouquet").appendChild(
    createBouquet({
      src: HERO_IMG,
      flowers: FLOWERS,
      size: "min(62vw, 260px)",
      bloomFrom: 1.5,
      label: "Shake the bouquet",
      onClick: () => {
        if (!heroOpen) {
          heroOpen = true;
          showHeroNote();
        }
        dropLeaves();
      },
    }),
  );

  // ── trail ──
  const trail = $("trail");
  const rows = $("rows");
  const bitsBox = $("bits");
  const plane = $("plane");
  const tilt = $("tilt");

  const arts = [];
  const slots = [];
  const hints = [];
  const opened = STOPS.map(() => false);

  STOPS.forEach((s, i) => {
    const stop = el("div", `stop ${i % 2 === 0 ? "stop--left" : "stop--right"}`, rows);

    const art = el("div", "stop__art", stop);
    art.style.marginTop = `${s.nudge}px`;
    const bq = el("div", "stop__bq", art);
    arts[i] = bq;
    bq.appendChild(
      createBouquet({
        src: s.img,
        flowers: BLOOMS_ON_MINI ? MINI_FLOWERS : [],
        size: "min(40vw, 190px)",
        bloomFrom: 0.2,
        tilt: s.tilt,
        label: `Open message ${i + 1}`,
        burstColors: s.burst,
        onClick: () => openStop(i),
      }),
    );
    const hint = el("span", "stop__hint", art);
    hint.textContent = "tap me";
    hints[i] = hint;

    slots[i] = el("div", "stop__slot", stop);
  });

  // trail strokes: only TRAIL_SIZE ever exist; the last ones fade out
  let bits = [];
  let win = 0;
  const bitEls = new Map();

  function renderBits() {
    const slice = bits.slice(win, win + TRAIL_SIZE);
    const keep = new Set(slice.map((b) => b.id));
    for (const [id, node] of bitEls) {
      if (!keep.has(id)) {
        node.remove();
        bitEls.delete(id);
      }
    }
    slice.forEach((b, r) => {
      let node = bitEls.get(b.id);
      if (!node) {
        node = el("span", `trail__bit trail__bit--${b.kind}`, bitsBox);
        node.style.left = `${b.x}px`;
        node.style.top = `${b.y}px`;
        node.style.transform = b.tf;
        if (b.kind === "heart") node.innerHTML = icon("IoMdHeartEmpty");
        bitEls.set(b.id, node);
      }
      node.style.opacity = fade(r);
    });
  }

  const flight = createFlight(
    {
      box: trail,
      plane,
      tilt,
      arts,
      slots,
      setItems: (list) => {
        // route was rebuilt → positions changed, so start fresh
        bits = list;
        bitEls.forEach((n) => n.remove());
        bitEls.clear();
      },
      setWin: (n) => {
        win = n;
        renderBits();
      },
      setGone: (g) => plane.classList.toggle("trail__plane--gone", g),
    },
    STOPS.length,
  );

  function updateHints() {
    const next = opened.indexOf(false);
    hints.forEach((h, i) => {
      h.style.visibility = i === next ? "visible" : "hidden";
    });
  }

  function openStop(i) {
    if (opened[i]) return;
    opened[i] = true;

    const note = el("div", "stop__note");
    const h3 = el("h3", "", note);
    h3.textContent = STOPS[i].title;
    const p = el("p", "", note);
    p.append(`${STOPS[i].text} `);
    const heart = el("span", "anniv__tiny", p);
    heart.innerHTML = icon("FaHeart");
    slots[i].appendChild(note);

    updateHints();
    // only fly if the plane hasn't already passed this bouquet
    if (flight.waypoint() <= 2 * i + 1) flight.play(i);
  }

  updateHints();
  flight.build();

  // re-measure whenever layout changes (resize, images loading, fonts…)
  const ro = new ResizeObserver(() => flight.build());
  ro.observe(trail);
  arts.forEach((a) => ro.observe(a));
  window.addEventListener("load", () => flight.build());

  // the plane takes off once the first bouquet scrolls into view
  const io = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        flight.start();
        io.disconnect();
      }
    },
    { threshold: 0.4 },
  );
  io.observe(arts[0]);

  // ── "scroll me" ──
  $("scrollBtn").addEventListener("click", () => {
    trail.scrollIntoView({
      behavior: reducedMotion() ? "auto" : "smooth",
      block: "start",
    });
  });
})();
