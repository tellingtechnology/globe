/* Telling Technology — Global Activity Globe
   Canvas 2D + d3-geo orthographic projection. Real continents, glowing
   coastlines, blue atmosphere, pulsing city activity, auto-rotate + drag. */
(function () {
  'use strict';

  // ---- Calm Lagoon palette ---------------------------------------------
  const C = {
    primary: '#0B7D74',
    bright:  '#5FC7BA',
    light:   '#C6EEE8',
    mid:     '#2BA89A',
    deep:    '#094843',
    ink:     '#071512',
  };

  const SECONDS_PER_TURN = 45;          // Earth-like slow turn
  const DEG_PER_MS = 360 / (SECONDS_PER_TURN * 1000);

  // ---- Major city nodes (lng, lat, weight) -----------------------------
  const CITIES = [
    [-74.0, 40.7, 1.0],  [-118.2, 34.0, .9], [-87.6, 41.9, .7], [-122.4, 37.8, 1.0],
    [-99.1, 19.4, .8],   [-46.6, -23.5, .9], [-58.4, -34.6, .6], [-70.7, -33.4, .5],
    [-0.12, 51.5, 1.0],  [2.35, 48.85, .9], [13.4, 52.5, .8], [4.9, 52.4, .6],
    [-3.7, 40.4, .6],    [12.5, 41.9, .6], [37.6, 55.75, .8], [18.06, 59.33, .5],
    [-6.26, 53.35, .4],  [28.98, 41.0, .6], [31.2, 30.0, .6], [3.4, 6.45, .6],
    [28.0, -26.2, .6],   [36.8, -1.29, .5], [55.27, 25.2, .8], [77.2, 28.6, .9],
    [72.88, 19.07, .9],  [103.8, 1.35, .9], [101.7, 3.14, .6], [106.8, -6.2, .8],
    [121.5, 31.2, 1.0],  [116.4, 39.9, 1.0], [114.1, 22.3, .8], [126.98, 37.57, .9],
    [139.7, 35.68, 1.0], [151.2, -33.87, .8], [144.96, -37.8, .6], [174.76, -36.85, .4],
    [100.5, 13.75, .6],  [90.4, 23.8, .6], [88.36, 22.57, .6], [120.98, 14.6, .6],
    [-79.4, 43.7, .6],   [-123.1, 49.3, .5], [-43.2, -22.9, .7], [-77.0, -12.0, .5],
    [-100.3, 25.7, .5],  [24.94, 60.17, .4], [10.75, 59.91, .4], [21.0, 52.23, .4],
  ];

  // ---- Setup -----------------------------------------------------------
  const canvas = document.getElementById('globe');
  const ctx = canvas.getContext('2d');
  const stage = document.getElementById('stage');
  const loader = document.getElementById('loader');

  let W = 0, H = 0, R = 0, cx = 0, cy = 0, dpr = 1;
  const projection = d3.geoOrthographic().clipAngle(90).precision(0.3);
  const path = d3.geoPath(projection, ctx);
  const graticule = d3.geoGraticule10();

  // rotation state
  let rot = [0, -12, 0];            // [lambda, phi, gamma]
  let auto = true;
  let velLambda = 0, velPhi = 0;    // drag inertia
  let lastFrame = performance.now();

  // external draw hooks (e.g. packet-trace overlay) + cinematic focus
  const drawHooks = [];
  let focusTarget = null;           // [lng,lat] to ease the globe toward, or null
  function easeAngle(cur, target, k) {
    let d = target - cur;
    while (d > 180) d -= 360;
    while (d < -180) d += 360;
    return cur + d * k;
  }

  // data
  let land = null, borders = null, sphere = { type: 'Sphere' };

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = window.innerWidth || document.documentElement.clientWidth || 0;
    H = window.innerHeight || document.documentElement.clientHeight || 0;
    if (W < 2 || H < 2) return false; // viewport not ready; try again later
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    cx = W / 2;
    cy = H / 2;
    R = Math.min(W, H) * 0.36;
    projection.scale(R).translate([cx, cy]);
    return true;
  }
  window.addEventListener('resize', resize);
  window.addEventListener('load', resize);
  // Self-healing init: retry until the viewport reports real dimensions
  (function initResize() {
    if (!resize()) requestAnimationFrame(initResize);
  })();
  // Observe container size changes (handles 0×0-at-init reflows)
  if (window.ResizeObserver) {
    new ResizeObserver(() => resize()).observe(document.documentElement);
  }

  // ---- Activity model (ripples emitted from city nodes) ----------------
  const ripples = [];
  let activityTimer = 0;

  function emitRipple(now) {
    const c = CITIES[Math.floor(Math.random() * CITIES.length)];
    ripples.push({ lng: c[0], lat: c[1], w: c[2], born: now, life: 2200 + Math.random() * 900 });
  }

  // visible test: is a [lng,lat] on the near hemisphere?
  function visible(lng, lat) {
    const r = projection.rotate();
    const d = d3.geoDistance([lng, lat], [-r[0], -r[1]]);
    return d; // < ~1.57 => front. return distance for limb fade
  }

  // ---- Draw ------------------------------------------------------------
  function draw(now) {
    ctx.clearRect(0, 0, W, H);

    // --- atmospheric halo behind globe ---
    const halo = ctx.createRadialGradient(cx, cy, R * 0.86, cx, cy, R * 1.5);
    halo.addColorStop(0, 'rgba(43,168,154,0.55)');
    halo.addColorStop(0.35, 'rgba(43,168,154,0.18)');
    halo.addColorStop(0.7, 'rgba(11,125,116,0.06)');
    halo.addColorStop(1, 'rgba(43,168,154,0)');
    ctx.fillStyle = halo;
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.5, 0, Math.PI * 2);
    ctx.fill();

    projection.rotate(rot);

    // --- ocean sphere with 3D shading ---
    ctx.save();
    ctx.beginPath();
    path(sphere);
    ctx.clip();
    const ocean = ctx.createRadialGradient(
      cx - R * 0.32, cy - R * 0.38, R * 0.1,
      cx, cy, R * 1.15
    );
    ocean.addColorStop(0, '#0e3b37');
    ocean.addColorStop(0.45, '#082420');
    ocean.addColorStop(1, '#04100e');
    ctx.fillStyle = ocean;
    ctx.fillRect(cx - R, cy - R, R * 2, R * 2);

    // graticule grid (tech feel, subtle)
    ctx.beginPath();
    path(graticule);
    ctx.strokeStyle = 'rgba(95,199,186,0.10)';
    ctx.lineWidth = 0.6;
    ctx.stroke();

    // --- land fill ---
    if (land) {
      ctx.beginPath();
      path(land);
      const landGrad = ctx.createLinearGradient(cx - R, cy - R, cx + R, cy + R);
      landGrad.addColorStop(0, '#11514a');
      landGrad.addColorStop(1, '#073029');
      ctx.fillStyle = landGrad;
      ctx.fill();

      // faint internal borders
      if (borders) {
        ctx.beginPath();
        path(borders);
        ctx.strokeStyle = 'rgba(95,199,186,0.22)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // glowing coastline
      ctx.beginPath();
      path(land);
      ctx.shadowBlur = 14;
      ctx.shadowColor = C.bright;
      ctx.strokeStyle = 'rgba(95,199,186,0.95)';
      ctx.lineWidth = 1.1;
      ctx.stroke();
      ctx.shadowBlur = 0;
    }
    ctx.restore();

    // --- city nodes + pulses (clipped to sphere) ---
    ctx.save();
    ctx.beginPath();
    path(sphere);
    ctx.clip();

    // static node dots
    for (const c of CITIES) {
      const d = visible(c[0], c[1]);
      if (d > 1.57) continue;
      const p = projection([c[0], c[1]]);
      if (!p) continue;
      const fade = Math.max(0, Math.min(1, (1.57 - d) / 0.5));
      const r = (1.4 + c[2] * 1.8);
      ctx.beginPath();
      ctx.arc(p[0], p[1], r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198,238,232,${0.6 * fade})`;
      ctx.shadowBlur = 8 * fade;
      ctx.shadowColor = C.bright;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // expanding ripples
    for (let i = ripples.length - 1; i >= 0; i--) {
      const rp = ripples[i];
      const age = (now - rp.born) / rp.life;
      if (age >= 1) { ripples.splice(i, 1); continue; }
      const d = visible(rp.lng, rp.lat);
      if (d > 1.57) continue;
      const p = projection([rp.lng, rp.lat]);
      if (!p) continue;
      const fade = Math.max(0, Math.min(1, (1.57 - d) / 0.5));
      const maxR = 9 + rp.w * 26;
      const rr = age * maxR;
      const alpha = (1 - age) * fade;

      ctx.beginPath();
      ctx.arc(p[0], p[1], rr, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(95,199,186,${alpha * 0.85})`;
      ctx.lineWidth = 1.3;
      ctx.stroke();

      // bright core flash early in life
      const core = Math.max(0, 1 - age * 2.2) * fade;
      if (core > 0) {
        ctx.beginPath();
        ctx.arc(p[0], p[1], 2.2 + rp.w * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(224,250,245,${core})`;
        ctx.shadowBlur = 14 * core;
        ctx.shadowColor = C.bright;
        ctx.fill();
        ctx.shadowBlur = 0;
      }
    }
    ctx.restore();

    // --- limb / rim light on the sphere edge ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    const rim = ctx.createRadialGradient(cx, cy, R * 0.93, cx, cy, R * 1.03);
    rim.addColorStop(0, 'rgba(95,199,186,0)');
    rim.addColorStop(0.78, 'rgba(95,199,186,0.05)');
    rim.addColorStop(0.94, 'rgba(151,222,212,0.5)');
    rim.addColorStop(1, 'rgba(43,168,154,0)');
    ctx.fillStyle = rim;
    ctx.arc(cx, cy, R * 1.03, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // crisp edge ring
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(95,199,186,0.55)';
    ctx.lineWidth = 1;
    ctx.stroke();

    // --- external overlays (packet trace, etc.) ---
    for (const h of drawHooks) {
      try { h(ctx, now); } catch (e) { /* keep the loop alive */ }
    }
  }

  // ---- Metrics (cosmetic live counters) --------------------------------
  const mNodes = document.getElementById('mNodes');
  const mReq = document.getElementById('mReq');
  const mLat = document.getElementById('mLat');
  let reqDisplay = 18400, latDisplay = 42;
  function fmt(n) { return Math.round(n).toLocaleString('en-US'); }
  let metricTimer = 0;
  function updateMetrics(dt, now) {
    metricTimer += dt;
    if (metricTimer < 90) return;
    metricTimer = 0;
    // count visible nodes
    let vis = 0;
    for (const c of CITIES) { if (visible(c[0], c[1]) < 1.45) vis++; }
    mNodes.textContent = fmt(vis * 1271 + 3120 + Math.random() * 400);
    reqDisplay += (Math.random() - 0.45) * 800;
    reqDisplay = Math.max(9000, Math.min(31000, reqDisplay));
    mReq.textContent = fmt(reqDisplay);
    latDisplay += (Math.random() - 0.5) * 6;
    latDisplay = Math.max(28, Math.min(74, latDisplay));
    mLat.textContent = fmt(latDisplay);
  }

  // ---- Loop ------------------------------------------------------------
  function frame(now) {
    const dt = Math.min(now - lastFrame, 64);
    lastFrame = now;

    // Self-heal: if canvas lost its size (init ran at 0×0), re-resize before drawing
    if (canvas.width < 2 || canvas.height < 2 ||
        canvas.width !== Math.round((window.innerWidth || 0) * dpr)) {
      if (!resize()) return; // still no viewport; skip this frame
    }

    if (dragging) {
      // rotation is updated directly in onMove
    } else if (focusTarget) {
      // cinematic: ease the globe so the active hop faces the viewer
      rot[0] = easeAngle(rot[0], -focusTarget[0], 0.06);
      const tLat = Math.max(-68, Math.min(68, -focusTarget[1]));
      rot[1] += (tLat - rot[1]) * 0.06;
    } else if (auto) {
      rot[0] += DEG_PER_MS * dt;
    } else {
      // inertia
      rot[0] += velLambda * dt;
      rot[1] += velPhi * dt;
      rot[1] = Math.max(-80, Math.min(80, rot[1]));
      velLambda *= 0.94;
      velPhi *= 0.94;
      if (Math.abs(velLambda) < 0.0008 && Math.abs(velPhi) < 0.0008 && !dragging) {
        auto = true;
      }
    }
    if (rot[0] > 360) rot[0] -= 360;
    if (rot[0] < 0) rot[0] += 360;

    // activity emission
    activityTimer += dt;
    const interval = 220; // ms between ripples
    while (activityTimer > interval) {
      activityTimer -= interval;
      emitRipple(now);
    }

    draw(now);
    updateMetrics(dt, now);
  }

  function rafLoop(now) {
    frame(now);
    requestAnimationFrame(rafLoop);
  }

  // ---- Drag interaction ------------------------------------------------
  let dragging = false, lastX = 0, lastY = 0, lastT = 0;
  const SENS = 0.25; // deg per px

  function onDown(e) {
    dragging = true;
    auto = false;
    focusTarget = null;            // user takes over from any cinematic focus
    velLambda = velPhi = 0;
    stage.classList.add('dragging');
    const pt = e.touches ? e.touches[0] : e;
    lastX = pt.clientX; lastY = pt.clientY; lastT = performance.now();
  }
  function onMove(e) {
    if (!dragging) return;
    e.preventDefault();
    const pt = e.touches ? e.touches[0] : e;
    const now = performance.now();
    const dt = Math.max(1, now - lastT);
    const dx = pt.clientX - lastX;
    const dy = pt.clientY - lastY;
    const dLambda = dx * SENS;
    const dPhi = -dy * SENS;
    rot[0] += dLambda;
    rot[1] = Math.max(-80, Math.min(80, rot[1] + dPhi));
    velLambda = dLambda / dt;
    velPhi = dPhi / dt;
    lastX = pt.clientX; lastY = pt.clientY; lastT = now;
  }
  function onUp() {
    if (!dragging) return;
    dragging = false;
    stage.classList.remove('dragging');
  }
  stage.addEventListener('mousedown', onDown);
  window.addEventListener('mousemove', onMove);
  window.addEventListener('mouseup', onUp);
  stage.addEventListener('touchstart', onDown, { passive: false });
  window.addEventListener('touchmove', onMove, { passive: false });
  window.addEventListener('touchend', onUp);

  // ---- Load world data -------------------------------------------------
  const SOURCES = [
    'https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json',
    'https://unpkg.com/world-atlas@2.0.2/countries-110m.json',
  ];

  async function loadWorld() {
    let topo = null, err = null;
    for (const url of SOURCES) {
      try { topo = await fetch(url).then(r => { if (!r.ok) throw new Error(r.status); return r.json(); }); break; }
      catch (e) { err = e; }
    }
    if (!topo) { console.error('World data failed', err); loader.textContent = 'Could not load map data'; return; }
    const obj = topo.objects.countries;
    land = topojson.merge(topo, obj.geometries);
    borders = topojson.mesh(topo, obj, (a, b) => a !== b);
    loader.classList.add('hide');
    loader.style.opacity = '0';
    setTimeout(() => { loader.style.display = 'none'; }, 650);
  }

  loadWorld();

  // ---- Public interface for overlay modules (trace.js) -----------------
  window.GLOBE = {
    get ready() { return !!land; },
    project: (lnglat) => projection(lnglat),
    visible,                                   // (lng,lat) -> angular distance from center
    isFront: (lng, lat) => visible(lng, lat) < 1.57,
    frontFade: (lng, lat) => Math.max(0, Math.min(1, (1.57 - visible(lng, lat)) / 0.5)),
    radius: () => R,
    center: () => [cx, cy],
    geoInterpolate: d3.geoInterpolate,
    geoDistance: d3.geoDistance,
    onDraw: (fn) => { if (typeof fn === 'function') drawHooks.push(fn); },
    setFocus: (lnglat) => { focusTarget = lnglat; auto = false; },
    clearFocus: () => { focusTarget = null; auto = true; },
    isDragging: () => dragging,
    palette: C,
  };
  window.dispatchEvent(new Event('globe-ready'));
  lastFrame = performance.now();
  requestAnimationFrame(rafLoop);
  // Watchdog: drive the render if rAF is throttled (e.g. offscreen iframe)
  setInterval(() => {
    const now = performance.now();
    if (now - lastFrame > 80) frame(now);
  }, 40);
})();
