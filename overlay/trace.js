/* Telling Technology — Globe overlay engine
   Two overlay modes on top of the rotating globe (globe.js):
     • "My Network"  — your LinkedIn connections placed across global hubs,
                       lighting up with monogram avatars as the Earth turns.
     • Packet traces — a packet hopping along a real-world network path.
   A master toggle turns the whole overlay off, leaving a plain draggable globe.

   Routes use real cities, IXPs, subsea cables, carriers and ASNs with realistic
   cumulative latencies — representative paths, not a live capture. */
(function () {
  'use strict';

  // ----- home node (the user, in Stockholm) -----
  const HOME = { loc: [18.07, 59.33], label: 'You · Stockholm' };
  const ORIGIN = { host: 'macbook.local', ip: '192.168.1.24', city: 'Stockholm, SE', loc: [18.07, 59.33], asn: '', org: 'Local network' };

  // ===================================================================
  //  PACKET TRACE ROUTES
  // ===================================================================
  const ROUTES = [
    {
      id: 'apple-hq',
      label: 'apple.com · HQ Cupertino',
      target: 'www.apple.com',
      ip: '17.253.144.10',
      hops: [
        ORIGIN,
        { host: 'sthlm-gw11.telia.net',   ip: '81.228.166.1',  city: 'Stockholm, SE',      loc: [18.07, 59.33],  asn: 'AS1299', org: 'Arelion / Telia', ms: 2.1 },
        { host: 'kbn-bb1.ip.arelion.net', ip: '62.115.123.5',  city: 'Copenhagen, DK',     loc: [12.57, 55.68],  asn: 'AS1299', org: 'Arelion',         ms: 9.3 },
        { host: 'ams-ix-peer.nl-ix.net',  ip: '80.249.208.1',  city: 'Amsterdam, NL',      loc: [4.90, 52.37],   asn: 'IX',     org: 'AMS-IX',          ms: 24.5 },
        { host: 'linx-lon1.as5459.net',   ip: '195.66.224.21', city: 'London, UK',         loc: [-0.13, 51.51],  asn: 'IX',     org: 'LINX',            ms: 31.2 },
        { host: 'ae3.nyc-bb1.lumen.net',  ip: '4.69.140.10',   city: 'New York, US',       loc: [-74.01, 40.71], asn: 'AS3356', org: 'Lumen (Level3)',  ms: 109.8 },
        { host: 'ae1.chi-bb2.lumen.net',  ip: '4.69.133.2',    city: 'Chicago, US',        loc: [-87.63, 41.88], asn: 'AS3356', org: 'Lumen',           ms: 131.6 },
        { host: 'ae6.den-bb1.lumen.net',  ip: '4.69.144.6',    city: 'Denver, US',         loc: [-104.99, 39.74],asn: 'AS3356', org: 'Lumen',           ms: 150.3 },
        { host: 'ae9.slc-bb1.lumen.net',  ip: '4.69.151.9',    city: 'Salt Lake City, US', loc: [-111.89, 40.76],asn: 'AS3356', org: 'Lumen',           ms: 162.0 },
        { host: 'sj-edge1.apple.com',     ip: '17.121.8.1',    city: 'San Jose, US',       loc: [-121.89, 37.34],asn: 'AS714',  org: 'Apple',           ms: 175.4 },
        { host: 'www.apple.com',          ip: '17.253.144.10', city: 'Cupertino, US',      loc: [-122.03, 37.32],asn: 'AS714',  org: 'Apple Park',      ms: 178.1, dest: true },
      ],
    },
    {
      id: 'africa',
      label: 'google.com · Nairobi',
      target: 'google.com',
      ip: '142.250.27.100',
      hops: [
        ORIGIN,
        { host: 'sthlm-gw11.telia.net',     ip: '81.228.166.1',   city: 'Stockholm, SE', loc: [18.07, 59.33], asn: 'AS1299', org: 'Arelion / Telia', ms: 2.1 },
        { host: 'ffm-bb2.ip.arelion.net',   ip: '62.115.45.2',    city: 'Frankfurt, DE', loc: [8.68, 50.11],  asn: 'AS1299', org: 'Arelion',         ms: 22.4 },
        { host: 'mrs-ix.franceix.net',      ip: '195.42.144.5',   city: 'Marseille, FR', loc: [5.37, 43.30],  asn: 'IX',     org: 'France-IX · subsea', ms: 38.0 },
        { host: 'mba-cls.seacom.mu',        ip: '105.16.0.9',     city: 'Mombasa, KE',   loc: [39.66, -4.04], asn: 'AS37100',org: 'SEACOM (subsea)', ms: 142.0 },
        { host: 'kixp.tespok.co.ke',        ip: '196.6.220.10',   city: 'Nairobi, KE',   loc: [36.82, -1.29], asn: 'IX',     org: 'KIXP',            ms: 151.0 },
        { host: 'nbo01s.1e100.net',         ip: '142.250.27.100', city: 'Nairobi, KE',   loc: [36.84, -1.31], asn: 'AS15169',org: 'Google',          ms: 154.3, dest: true },
      ],
    },
    {
      id: 'samerica',
      label: 'MercadoLibre · São Paulo',
      target: 'mercadolibre.com.br',
      ip: '170.246.0.10',
      hops: [
        ORIGIN,
        { host: 'sthlm-gw11.telia.net',    ip: '81.228.166.1',  city: 'Stockholm, SE',  loc: [18.07, 59.33],  asn: 'AS1299', org: 'Arelion / Telia', ms: 2.1 },
        { host: 'ams-ix-peer.nl-ix.net',   ip: '80.249.208.1',  city: 'Amsterdam, NL',  loc: [4.90, 52.37],   asn: 'IX',     org: 'AMS-IX',          ms: 24.5 },
        { host: 'mad-espanix.net',         ip: '185.6.36.40',   city: 'Madrid, ES',     loc: [-3.70, 40.42],  asn: 'AS1299', org: 'ESPANIX',         ms: 52.0 },
        { host: 'lis-ellalink.pt',         ip: '195.8.30.1',    city: 'Lisbon, PT',     loc: [-9.14, 38.72],  asn: 'AS1299', org: 'EllaLink landing',ms: 58.0 },
        { host: 'for-ix.br.nic.br',        ip: '200.219.142.1', city: 'Fortaleza, BR',  loc: [-38.52, -3.73], asn: 'AS28571',org: 'IX.br · subsea',  ms: 121.8 },
        { host: 'spo-ix.br.nic.br',        ip: '200.219.143.10',city: 'São Paulo, BR',  loc: [-46.63, -23.55],asn: 'AS28571',org: 'IX.br',           ms: 138.0 },
        { host: 'edge-gru.mercadolibre.com',ip: '170.246.0.10', city: 'São Paulo, BR',  loc: [-46.65, -23.53],asn: 'AS28220',org: 'MercadoLibre',    ms: 142.4, dest: true },
      ],
    },
  ];

  // ===================================================================
  //  MY NETWORK — place LinkedIn connections across global hubs
  // ===================================================================
  const HUBS = [
    [18.07, 59.33, 16], [11.97, 57.71, 4], [13.00, 55.60, 3], [10.75, 59.91, 3],
    [12.57, 55.68, 3], [24.94, 60.17, 2], [-0.13, 51.51, 5], [4.90, 52.37, 3],
    [13.40, 52.52, 3], [8.68, 50.11, 2], [11.58, 48.14, 2], [2.35, 48.85, 3],
    [-3.70, 40.42, 2], [9.19, 45.46, 2], [8.54, 47.37, 2], [21.01, 52.23, 2],
    [-6.26, 53.35, 2], [16.37, 48.21, 1], [-74.01, 40.71, 3], [-122.42, 37.77, 3],
    [-118.24, 34.05, 1], [-79.38, 43.65, 1], [-97.74, 30.27, 1], [-71.06, 42.36, 1],
    [77.59, 12.97, 2], [72.88, 19.07, 1], [103.82, 1.35, 2], [139.69, 35.68, 1],
    [151.21, -33.87, 1], [55.27, 25.20, 2], [34.78, 32.08, 1], [-46.63, -23.55, 1],
    [3.40, 6.45, 1], [36.82, -1.29, 1], [18.42, -33.92, 1],
  ];

  function seeded(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }

  const PEOPLE = (window.LINKEDIN && window.LINKEDIN.people) || [];
  const TOTAL = (window.LINKEDIN && window.LINKEDIN.count) || PEOPLE.length;

  // weighted hub bag
  const bag = [];
  HUBS.forEach((h, i) => { for (let k = 0; k < h[2]; k++) bag.push(i); });

  // globe pins: sample the full list down to a calm number of pins
  const PIN_STEP = Math.max(1, Math.floor(PEOPLE.length / 240));
  const nodes = [];
  for (let idx = 0; idx < PEOPLE.length; idx += PIN_STEP) {
    const hub = HUBS[bag[(idx * 7 + 3) % bag.length]];
    const jx = (seeded(idx + 1) - 0.5) * 4.6;
    const jy = (seeded(idx + 9) - 0.5) * 2.8;
    nodes.push({ loc: [hub[0] + jx, hub[1] + jy], tw: seeded(idx + 4) * 6.28 });
  }

  // ===================================================================
  //  DOM
  // ===================================================================
  const elPanel = document.getElementById('trace');
  const elInner = document.getElementById('panelInner');
  const elRoutes = document.getElementById('routes');
  const toggle = document.getElementById('overlayToggle');
  const statusText = document.getElementById('statusText');

  const MODES = [{ id: 'network', label: 'My Network' }].concat(ROUTES.map(r => ({ id: r.id, label: r.label })));
  MODES.forEach(m => {
    const b = document.createElement('button');
    b.className = 'pill';
    b.textContent = m.label;
    b.dataset.id = m.id;
    b.addEventListener('click', () => setMode(m.id, true));
    elRoutes.appendChild(b);
  });
  const pills = [...elRoutes.querySelectorAll('.pill')];

  // ===================================================================
  //  STATE
  // ===================================================================
  let overlayOn = (localStorage.getItem('bs-overlay') || 'on') !== 'off';
  let mode = 'network';

  // --- trace playback ---
  let cur = null, reached = 1, segT = 0, phase = 'dwell', phaseT = 0, segDur = 1000, interp = null;
  let manualHold = 0;
  const pulses = [];
  const DWELL = 620, PAUSE = 1500;

  // --- network (terminal stream) ---
  const STREAM_RATE = 50;            // names per second
  let streamIdx = 0;                 // current index into PEOPLE (loops)
  let streamCount = 0;               // total emitted (for the hex id)
  let streamAcc = 0;                 // ms accumulator
  let termBody = null;
  const TERM_MAX = 64;               // max lines kept in the DOM

  let lastNow = 0;

  // ===================================================================
  //  MODE / TOGGLE
  // ===================================================================
  function setMode(id, manual) {
    mode = id;
    pills.forEach(p => p.classList.toggle('on', p.dataset.id === id));
    if (id === 'network') startNetwork();
    else startTrace(ROUTES.find(r => r.id === id), manual);
  }

  function applyOverlay() {
    document.body.classList.toggle('overlay-off', !overlayOn);
    toggle.classList.toggle('on', overlayOn);
    toggle.setAttribute('aria-checked', String(overlayOn));
    if (!overlayOn) {
      if (window.GLOBE) GLOBE.clearFocus();   // plain draggable, auto-rotating globe
    } else {
      setMode(mode, false);
    }
  }
  toggle.addEventListener('click', () => {
    overlayOn = !overlayOn;
    localStorage.setItem('bs-overlay', overlayOn ? 'on' : 'off');
    applyOverlay();
  });

  // ===================================================================
  //  NETWORK MODE
  // ===================================================================
  function startNetwork() {
    if (statusText) statusText.textContent = 'Live · streaming connections';
    if (window.GLOBE) GLOBE.clearFocus();     // normal Earth rotation, no focus
    buildNetworkPanel();
    termBody = document.getElementById('termBody');
    streamAcc = 0;
    // prime a few lines so it doesn't start empty
    for (let k = 0; k < 18; k++) emitLine();
  }

  function buildNetworkPanel() {
    elInner.innerHTML =
      `<div class="termHead">` +
        `<i class="r"></i><i class="y"></i><i class="g"></i>` +
        `<span class="termTitle">connections — live stream</span>` +
      `</div>` +
      `<div class="termPrompt">bitesize@globe ~ % stream --rate ${STREAM_RATE} <span class="cnt">· ${TOTAL.toLocaleString('en-US')} nodes</span></div>` +
      `<div class="termBody" id="termBody"></div>`;
  }

  function emitLine() {
    if (!termBody || !PEOPLE.length) return;
    const p = PEOPLE[streamIdx % PEOPLE.length];
    streamIdx++;
    streamCount++;
    const id = '0x' + (streamCount & 0xffff).toString(16).toUpperCase().padStart(4, '0');
    const line = document.createElement('div');
    line.className = 'tline';
    line.innerHTML =
      `<span class="tId">${id}</span>` +
      `<span class="tNm">${p.s}</span>`;
    termBody.appendChild(line);
    while (termBody.childElementCount > TERM_MAX) termBody.removeChild(termBody.firstChild);
    termBody.scrollTop = termBody.scrollHeight;
  }

  function updateNetwork(now, dt) {
    if (!termBody || !termBody.isConnected) { termBody = document.getElementById('termBody'); }
    streamAcc += dt;
    const per = 1000 / STREAM_RATE;
    let budget = 10;                 // cap lines per frame to avoid bursts after a stall
    while (streamAcc >= per && budget-- > 0) { streamAcc -= per; emitLine(); }
    if (streamAcc > per) streamAcc = per;
  }

  // ===================================================================
  //  TRACE MODE
  // ===================================================================
  function segDuration(a, b) {
    const dms = Math.max(0, (b.ms || 0) - (a.ms || 0));
    return Math.max(680, Math.min(1700, 520 + Math.sqrt(dms) * 95));
  }
  function startTrace(tr, manual) {
    cur = tr; reached = 1; segT = 0; phase = 'dwell'; phaseT = 0; interp = null;
    pulses.length = 0; manualHold = manual ? 6000 : 0;
    if (statusText) statusText.textContent = 'Live · tracing packet route';
    buildTracePanel(tr);
    paintRows();
    if (window.GLOBE) GLOBE.setFocus(tr.hops[0].loc);
  }
  function buildTracePanel(tr) {
    const lastMs = tr.hops[tr.hops.length - 1].ms;
    let rows = '';
    tr.hops.forEach((h, i) => {
      const asn = h.asn ? `<span class="asn">${h.asn}</span> ` : '';
      const dest = h.dest ? '<span class="dest">target</span>' : '';
      rows +=
        `<div class="hop pending">` +
          `<div class="n">${i === 0 ? '\u25b8' : i}</div>` +
          `<div class="body"><div class="host">${h.host}${dest}</div>` +
          `<div class="sub">${asn}${h.city}</div></div>` +
          `<div class="ms">${i === 0 ? '\u2014' : h.ms.toFixed(1)}</div>` +
        `</div>`;
    });
    elInner.innerHTML =
      `<div class="tHead">` +
        `<div class="tTitle">Packet Trace</div>` +
        `<div class="tTarget"><b>${tr.target}</b><span>${tr.ip}</span></div>` +
        `<div class="tMeta"><span><b>${tr.hops.length}</b> hops</span><span><b>${Math.round(lastMs)}</b> ms</span></div>` +
      `</div>` +
      `<div class="tRows" id="tRows">${rows}</div>` +
      `<div class="tNote">Representative path · real carriers, IXPs &amp; geography</div>`;
  }
  function paintRows() {
    const elRows = document.getElementById('tRows');
    if (!elRows) return;
    const rows = elRows.children;
    for (let i = 0; i < rows.length; i++) {
      rows[i].classList.remove('active', 'done', 'pending');
      if (i < reached - 1) rows[i].classList.add('done');
      else if (i === reached - 1) rows[i].classList.add('active');
      else rows[i].classList.add('pending');
    }
    const active = rows[reached - 1];
    if (active) elRows.scrollTop = Math.max(0, active.offsetTop - elRows.clientHeight * 0.5 + active.offsetHeight * 0.5);
  }
  function nextTrace() {
    const idx = ROUTES.findIndex(r => r.id === cur.id);
    const next = ROUTES[(idx + 1) % ROUTES.length];
    setMode(next.id, false);
  }
  function updateTrace(now, dt) {
    if (window.GLOBE && GLOBE.isDragging()) return;   // freeze while inspecting
    if (manualHold > 0) manualHold -= dt;
    phaseT += dt;
    const hops = cur.hops;
    if (phase === 'dwell') {
      if (window.GLOBE) GLOBE.setFocus(hops[reached - 1].loc);
      if (phaseT >= DWELL) {
        if (reached < hops.length) {
          phase = 'travel'; phaseT = 0; segT = 0;
          interp = GLOBE.geoInterpolate(hops[reached - 1].loc, hops[reached].loc);
          segDur = segDuration(hops[reached - 1], hops[reached]);
        } else { phase = 'pause'; phaseT = 0; }
      }
    } else if (phase === 'travel') {
      segT = Math.min(1, phaseT / segDur);
      if (window.GLOBE && interp) GLOBE.setFocus(interp(segT));
      if (segT >= 1) {
        reached++;
        pulses.push({ loc: hops[reached - 1].loc, born: now, life: 1100, w: hops[reached - 1].dest ? 1.4 : 1 });
        paintRows();
        phase = 'dwell'; phaseT = 0;
      }
    } else if (phase === 'pause') {
      if (window.GLOBE) GLOBE.clearFocus();
      if (phaseT >= PAUSE && manualHold <= 0) nextTrace();
    }
  }

  // ===================================================================
  //  RENDER HELPERS
  // ===================================================================
  function strokeArc(ctx, a, b, tEnd, width, color, glow) {
    const ip = GLOBE.geoInterpolate(a, b);
    const steps = 48;
    ctx.lineWidth = width; ctx.strokeStyle = color; ctx.lineCap = 'round';
    if (glow) { ctx.shadowBlur = glow; ctx.shadowColor = color; }
    let drawing = false;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * tEnd;
      const ll = ip(t);
      if (!GLOBE.isFront(ll[0], ll[1])) { drawing = false; continue; }
      const p = GLOBE.project(ll);
      if (!p) { drawing = false; continue; }
      if (!drawing) { ctx.moveTo(p[0], p[1]); drawing = true; } else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
    ctx.shadowBlur = 0;
  }
  function dot(ctx, ll, r, fill, glow) {
    if (!GLOBE.isFront(ll[0], ll[1])) return null;
    const p = GLOBE.project(ll); if (!p) return null;
    ctx.beginPath(); ctx.arc(p[0], p[1], r, 0, Math.PI * 2); ctx.fillStyle = fill;
    if (glow) { ctx.shadowBlur = glow; ctx.shadowColor = '#5FC7BA'; }
    ctx.fill(); ctx.shadowBlur = 0; return p;
  }
  function roundRect(ctx, x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }
  function tag(ctx, p, text, mono) {
    ctx.font = (mono ? '600 11px ui-monospace, "SF Mono", Menlo, monospace' : '600 12px Inter, system-ui, sans-serif');
    const w = ctx.measureText(text).width;
    const px = p[0] + 12, py = p[1] - 10;
    ctx.fillStyle = 'rgba(6,22,20,0.8)'; ctx.strokeStyle = 'rgba(95,199,186,0.32)'; ctx.lineWidth = 1;
    roundRect(ctx, px, py - 13, w + 16, 20, 6); ctx.fill(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(px, py - 3);
    ctx.strokeStyle = 'rgba(95,199,186,0.45)'; ctx.stroke();
    ctx.fillStyle = '#DCF3EE'; ctx.fillText(text, px + 8, py + 1);
  }
  function avatarMarker(ctx, p, initials, rad) {
    ctx.save();
    ctx.beginPath(); ctx.arc(p[0], p[1], rad, 0, Math.PI * 2);
    const g = ctx.createLinearGradient(p[0] - rad, p[1] - rad, p[0] + rad, p[1] + rad);
    g.addColorStop(0, '#7adccf'); g.addColorStop(1, '#2BA89A');
    ctx.fillStyle = g; ctx.shadowBlur = 16; ctx.shadowColor = '#5FC7BA'; ctx.fill(); ctx.shadowBlur = 0;
    ctx.lineWidth = 1.4; ctx.strokeStyle = 'rgba(234,251,247,0.85)'; ctx.stroke();
    ctx.fillStyle = '#04100e'; ctx.font = '700 ' + Math.round(rad * 0.82) + 'px Inter, system-ui, sans-serif';
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText(initials, p[0], p[1] + 0.5);
    ctx.textAlign = 'start'; ctx.textBaseline = 'alphabetic';
    ctx.restore();
  }

  // ===================================================================
  //  RENDER
  // ===================================================================
  function renderNetwork(ctx, now) {
    // super-thin pins standing up from each connection's location; the globe
    // keeps its normal Earth rotation. No arcs, no labels.
    const C0 = GLOBE.center();
    for (let i = 0; i < nodes.length; i++) {
      const n = nodes[i];
      const f = GLOBE.frontFade(n.loc[0], n.loc[1]);
      if (f <= 0) continue;
      const p = GLOBE.project(n.loc);
      if (!p) continue;
      // radial (outward) direction in screen space
      let dx = p[0] - C0[0], dy = p[1] - C0[1];
      const len = Math.hypot(dx, dy) || 1;
      dx /= len; dy /= len;
      const L = 5 + 3 * f;
      const tipx = p[0] + dx * L, tipy = p[1] + dy * L;
      const tw = 0.7 + 0.3 * Math.sin(now / 600 + n.tw);   // gentle twinkle
      // thin stem
      ctx.beginPath();
      ctx.moveTo(p[0], p[1]);
      ctx.lineTo(tipx, tipy);
      ctx.strokeStyle = `rgba(143,210,200,${(0.3 + 0.45 * f) * tw})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      // pin head
      ctx.beginPath();
      ctx.arc(tipx, tipy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(198,238,232,${(0.55 + 0.4 * f) * tw})`;
      ctx.shadowBlur = 5 * f;
      ctx.shadowColor = '#5FC7BA';
      ctx.fill();
      ctx.shadowBlur = 0;
    }
  }

  function renderTrace(ctx, now) {
    const hops = cur.hops;
    for (let s = 0; s < reached - 1; s++) strokeArc(ctx, hops[s].loc, hops[s + 1].loc, 1, 1.6, 'rgba(95,199,186,0.55)', 6);
    if (phase === 'travel' && reached < hops.length) strokeArc(ctx, hops[reached - 1].loc, hops[reached].loc, segT, 1.8, 'rgba(143,222,212,0.9)', 10);

    for (let i = pulses.length - 1; i >= 0; i--) {
      const pu = pulses[i]; const age = (now - pu.born) / pu.life;
      if (age >= 1) { pulses.splice(i, 1); continue; }
      if (!GLOBE.isFront(pu.loc[0], pu.loc[1])) continue;
      const p = GLOBE.project(pu.loc); if (!p) continue;
      ctx.beginPath(); ctx.arc(p[0], p[1], (4 + age * 26) * pu.w, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(143,222,212,${(1 - age) * 0.8})`; ctx.lineWidth = 1.4; ctx.stroke();
    }

    for (let i = 0; i < reached; i++) {
      const h = hops[i]; const active = i === reached - 1;
      dot(ctx, h.loc, active ? 3.4 : 2.2, active ? '#EAFBF7' : 'rgba(198,238,232,0.8)', active ? 14 : 6);
      if (active && GLOBE.isFront(h.loc[0], h.loc[1])) {
        const p = GLOBE.project(h.loc);
        if (p) { const pulse = 6 + Math.sin(now / 240) * 1.6; ctx.beginPath(); ctx.arc(p[0], p[1], pulse, 0, Math.PI * 2); ctx.strokeStyle = 'rgba(95,199,186,0.7)'; ctx.lineWidth = 1.2; ctx.stroke(); }
      }
    }

    if (phase === 'travel' && interp) {
      for (let k = 6; k >= 1; k--) {
        const tt = Math.max(0, segT - k * 0.018); const ll = interp(tt);
        if (!GLOBE.isFront(ll[0], ll[1])) continue;
        const p = GLOBE.project(ll); if (!p) continue;
        ctx.beginPath(); ctx.arc(p[0], p[1], 1.4 + (6 - k) * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(143,222,212,${0.1 * (7 - k)})`; ctx.fill();
      }
      const head = interp(segT); const hp = dot(ctx, head, 3.2, '#FFFFFF', 16);
      if (hp) { const next = hops[reached]; tag(ctx, hp, `${next.city}  ·  ${next.ms.toFixed(0)} ms`, true); }
    } else {
      const h = hops[reached - 1];
      if (GLOBE.isFront(h.loc[0], h.loc[1])) { const p = GLOBE.project(h.loc); if (p) tag(ctx, p, `${h.city}${h.ms != null ? '  ·  ' + h.ms.toFixed(0) + ' ms' : ''}`, true); }
    }
  }

  // ===================================================================
  //  HOOK + BOOT
  // ===================================================================
  function onDraw(ctx, now) {
    if (!overlayOn) return;
    if (!lastNow) lastNow = now;
    let dt = now - lastNow; lastNow = now;
    if (dt < 0) dt = 0; if (dt > 80) dt = 80;
    if (mode === 'network') { if (nodes.length) { updateNetwork(now, dt); renderNetwork(ctx, now); } }
    else if (cur) { updateTrace(now, dt); renderTrace(ctx, now); }
  }

  function boot() {
    GLOBE.onDraw(onDraw);
    applyOverlay();          // sets toggle + body class from persisted state, and starts the active mode when on
  }

  if (window.GLOBE) boot();
  else window.addEventListener('globe-ready', boot, { once: true });
})();
