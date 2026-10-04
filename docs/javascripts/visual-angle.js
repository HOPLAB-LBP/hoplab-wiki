/*
  Visual angle calculator, used on the MR11 equipment page.

  On a page:

    <div class="va-calc" data-setup="mr11">
      <p>Fallback text shown without JavaScript.</p>
    </div>

  `data-setup` picks a set-up from SETUPS below, the one place where set-up
  values live. Any value can be overridden on the element with data-width-mm,
  data-height-mm, data-res-x, data-res-y, data-distance-mm, data-label and
  data-note.

  Geometry (flat screen, eye facing the screen centre, d = viewing distance):
  a stimulus whose edges sit at e - t/2 and e + t/2 degrees from the screen
  centre spans s = d (tan(e + t/2) - tan(e - t/2)) mm. Centred (e = 0) this is
  s = 2 d tan(t / 2) with inverse t = 2 atan(s / (2 d)); off centre the inverse
  is solved by bisection. Pixels use the horizontal pixel size
  (screen width / horizontal resolution). Sizes and positions are horizontal,
  along the horizontal line through the screen centre.

  Material's instant navigation does not fire DOMContentLoaded again, so the
  set-up runs inside document$.subscribe().
*/

(function () {
  "use strict";

  /* Set-ups. Keep these in step with the tables on the pages that cite them. */
  const SETUPS = {
    mr11: {
      label: "MR11 (BOLDscreen)",
      widthMm: 700,
      heightMm: 395,
      resX: 1920,
      resY: 1080,
      distanceMm: 1850,
      note: "The 395 mm height is from lab notes and not yet confirmed.",
    },
  };

  const DEG = Math.PI / 180;
  const SVG_NS = "http://www.w3.org/2000/svg";
  const FIELDS = [
    ["widthMm", "Screen width", "mm"],
    ["heightMm", "Screen height", "mm"],
    ["resX", "Horizontal resolution", "px"],
    ["resY", "Vertical resolution", "px"],
    ["distanceMm", "Viewing distance", "mm"],
  ];
  const RINGS = [5, 10, 15, 20, 25, 30];

  function num(value) {
    const n = parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }

  function fmt(n, digits) {
    return Number.isFinite(n) ? n.toFixed(digits) : "";
  }

  /* Size on screen (mm) of a stimulus of `t` degrees whose angular centre is
     `e` degrees from the screen centre, seen from `d` mm. */
  function degToMm(t, e, d) {
    if (!(t >= 0) || Math.abs(e) + t / 2 >= 90) return NaN;
    return d * (Math.tan((e + t / 2) * DEG) - Math.tan((e - t / 2) * DEG));
  }

  /* Inverse of degToMm. Centred: closed form. Off centre: bisection
     (degToMm grows monotonically with t). */
  function mmToDeg(mm, e, d) {
    if (!(mm >= 0) || !(d > 0)) return NaN;
    if (e === 0) return 2 * Math.atan(mm / (2 * d)) / DEG;
    let lo = 0;
    let hi = 2 * (90 - Math.abs(e)) - 1e-9;
    if (!(hi > 0) || degToMm(hi, e, d) < mm) return NaN;
    for (let i = 0; i < 200; i++) {
      const mid = (lo + hi) / 2;
      if (degToMm(mid, e, d) < mm) lo = mid; else hi = mid;
    }
    return (lo + hi) / 2;
  }

  function el(tag, attrs, parent) {
    const node = document.createElementNS(SVG_NS, tag);
    Object.keys(attrs || {}).forEach(function (k) { node.setAttribute(k, attrs[k]); });
    if (parent) parent.appendChild(node);
    return node;
  }

  function build(root, uid) {
    const ds = root.dataset;
    const base = SETUPS[ds.setup] || {};
    const preset = {
      label: ds.label || base.label || "Preset",
      note: ds.note !== undefined ? ds.note : (base.note || ""),
      widthMm: ds.widthMm || base.widthMm,
      heightMm: ds.heightMm || base.heightMm,
      resX: ds.resX || base.resX,
      resY: ds.resY || base.resY,
      distanceMm: ds.distanceMm || base.distanceMm,
    };
    const id = (name) => "va-" + uid + "-" + name;

    const setupFields = FIELDS.map(function (f) {
      return (
        '<label class="va-field" for="' + id(f[0]) + '">' +
          '<span class="va-field__label">' + f[1] + "</span>" +
          '<span class="va-field__box">' +
            '<input id="' + id(f[0]) + '" data-key="' + f[0] + '" type="text" inputmode="decimal" autocomplete="off">' +
            '<span class="va-field__unit">' + f[2] + "</span>" +
          "</span>" +
        "</label>"
      );
    }).join("");

    root.innerHTML =
      '<div class="va-calc__setup">' +
        '<div class="va-calc__head">' +
          '<label class="va-preset" for="' + id("preset") + '">' +
            '<span class="va-field__label">Set-up</span>' +
            '<select id="' + id("preset") + '">' +
              '<option value="preset"></option>' +
              '<option value="custom">Custom</option>' +
            "</select>" +
          "</label>" +
          '<p class="va-calc__note" hidden></p>' +
        "</div>" +
        '<div class="va-calc__fields">' + setupFields + "</div>" +
      "</div>" +
      '<div class="va-calc__convert">' +
        '<p class="va-calc__lead">Type a size in any of the three boxes, or drag the stimulus on the screen below.</p>' +
        '<div class="va-equation" role="group" aria-label="Stimulus size">' +
          '<label class="va-eq" for="' + id("deg") + '"><input id="' + id("deg") + '" data-conv="deg" type="text" inputmode="decimal" autocomplete="off"><span>degrees</span></label>' +
          '<span class="va-equation__sign" aria-hidden="true">=</span>' +
          '<label class="va-eq" for="' + id("mm") + '"><input id="' + id("mm") + '" data-conv="mm" type="text" inputmode="decimal" autocomplete="off"><span>mm on screen</span></label>' +
          '<span class="va-equation__sign" aria-hidden="true">=</span>' +
          '<label class="va-eq" for="' + id("px") + '"><input id="' + id("px") + '" data-conv="px" type="text" inputmode="decimal" autocomplete="off"><span>pixels</span></label>' +
        "</div>" +
        '<label class="va-ecc" for="' + id("ecc") + '">' +
          '<span class="va-field__label">Centre of the stimulus, from the screen centre</span>' +
          '<span class="va-field__box">' +
            '<input id="' + id("ecc") + '" data-ecc type="text" inputmode="decimal" autocomplete="off" value="0">' +
            '<span class="va-field__unit">° from centre</span>' +
          "</span>" +
        "</label>" +
        '<div class="va-views">' +
          '<figure class="va-view">' +
            '<svg class="va-front" role="img"></svg>' +
            '<figcaption>Screen as the participant sees it. Rings every 5°.</figcaption>' +
          "</figure>" +
          '<figure class="va-view">' +
            '<svg class="va-diagram" viewBox="0 0 320 132" role="img" aria-label="Side view: eye, viewing distance and stimulus size">' +
              '<line class="va-diagram__screen" x1="292" y1="10" x2="292" y2="122"/>' +
              '<line class="va-diagram__ray" x1="28" y1="66" x2="292" y2="34"/>' +
              '<line class="va-diagram__ray" x1="28" y1="66" x2="292" y2="98"/>' +
              '<line class="va-diagram__stim" x1="292" y1="34" x2="292" y2="98"/>' +
              '<path class="va-diagram__arc" d="M 87.6 58.8 A 60 60 0 0 1 87.6 73.2"/>' +
              '<circle class="va-diagram__eye" cx="22" cy="66" r="7"/>' +
              '<line class="va-diagram__dim" x1="28" y1="116" x2="292" y2="116"/>' +
              '<text class="va-diagram__label" x="176" y="69.5" text-anchor="middle">θ = <tspan data-out="theta"></tspan></text>' +
              '<text class="va-diagram__label" x="160" y="111" text-anchor="middle">d = <tspan data-out="d"></tspan></text>' +
              '<text class="va-diagram__label" x="284" y="70" text-anchor="end">s = <tspan data-out="s"></tspan></text>' +
            "</svg>" +
            "<figcaption>Side view, not to scale.</figcaption>" +
          "</figure>" +
        "</div>" +
        '<dl class="va-results" aria-live="polite">' +
          '<div><dt>Pixels per degree (at the centre)</dt><dd data-out="ppd"></dd></div>' +
          '<div><dt>Pixel size (width × height)</dt><dd data-out="pitch"></dd></div>' +
          '<div><dt>Stimulus centre on screen</dt><dd data-out="pos"></dd></div>' +
          '<div><dt>Whole screen (width × height)</dt><dd data-out="fov"></dd></div>' +
        "</dl>" +
        '<p class="va-calc__warn" data-out="warn" hidden></p>' +
      "</div>";

    const select = root.querySelector("select");
    select.options[0].textContent = preset.label;
    const note = root.querySelector(".va-calc__note");
    if (preset.note) { note.textContent = preset.note; note.hidden = false; }
    const setupInputs = root.querySelectorAll("[data-key]");
    const conv = {};
    root.querySelectorAll("[data-conv]").forEach(function (n) { conv[n.dataset.conv] = n; });
    const out = {};
    root.querySelectorAll("[data-out]").forEach(function (n) { out[n.dataset.out] = n; });
    const eccInput = root.querySelector("[data-ecc]");
    const front = root.querySelector(".va-front");
    let source = "deg";
    let geom = null; /* last drawn front-view geometry, for dragging */

    function loadPreset() {
      setupInputs.forEach(function (n) {
        const v = preset[n.dataset.key];
        n.value = v === undefined || v === null ? "" : v;
      });
    }

    function setup() {
      const s = {};
      setupInputs.forEach(function (n) { s[n.dataset.key] = num(n.value); });
      return s;
    }

    /* Front view: the screen to scale, rings of equal eccentricity, the
       fixation point, the stimulus (draggable) and its measures. */
    function drawFront(s, e, deg, mm) {
      while (front.firstChild) front.removeChild(front.firstChild);
      geom = null;
      const d = s.distanceMm;
      if (!(s.widthMm > 0 && s.heightMm > 0 && d > 0)) return;
      const W = 320;
      const pad = 14;
      const k = (W - 2 * pad) / s.widthMm;          /* svg units per mm */
      const H = s.heightMm * k + 2 * pad + 22;      /* room for labels below */
      const cx = W / 2;
      const cy = pad + s.heightMm * k / 2;
      front.setAttribute("viewBox", "0 0 " + W + " " + fmt(H, 1));
      front.setAttribute("aria-label",
        "Front view of the screen with the stimulus " + fmt(deg, 2) + " degrees wide, centred " +
        fmt(e, 2) + " degrees from the screen centre");

      const clipId = "va-clip-" + uid;
      const defs = el("defs", {}, front);
      const clip = el("clipPath", { id: clipId }, defs);
      el("rect", { x: pad, y: pad, width: s.widthMm * k, height: s.heightMm * k }, clip);

      el("rect", { class: "va-front__screen", x: pad, y: pad, width: s.widthMm * k, height: s.heightMm * k, rx: 2 }, front);
      const grid = el("g", { "clip-path": "url(#" + clipId + ")" }, front);
      el("line", { class: "va-front__axis", x1: pad, y1: cy, x2: W - pad, y2: cy }, grid);
      RINGS.forEach(function (r) {
        const rad = d * Math.tan(r * DEG) * k;
        el("circle", { class: "va-front__ring", cx: cx, cy: cy, r: rad }, grid);
        if (cx - rad > pad + 1) {
          const t = el("text", { class: "va-front__ringlabel", x: cx - rad + 2, y: cy - 3 }, grid);
          t.textContent = r + "°";
        }
      });
      el("circle", { class: "va-front__fix", cx: cx, cy: cy, r: 2.2 }, front);

      if (!(deg > 0) || !Number.isFinite(mm)) return;
      const xl = d * Math.tan((e - deg / 2) * DEG);
      const xr = d * Math.tan((e + deg / 2) * DEG);
      const xc = d * Math.tan(e * DEG);
      const side = (xr - xl) * k;
      const sx = cx + xl * k;
      const sy = cy - side / 2;

      const stim = el("g", { "clip-path": "url(#" + clipId + ")" }, front);
      el("line", { class: "va-front__ecc", x1: cx, y1: cy, x2: cx + xc * k, y2: cy }, stim);
      const box = el("rect", {
        class: "va-front__stim", x: sx, y: sy, width: Math.max(side, 0.5), height: Math.max(side, 0.5),
        tabindex: "0", role: "slider", "aria-label": "Stimulus position (arrow keys move it; with Shift, up and down change its size)",
        "aria-valuenow": fmt(e, 2), "aria-valuetext": fmt(e, 2) + " degrees from the centre",
      }, stim);
      el("circle", { class: "va-front__centre", cx: cx + xc * k, cy: cy, r: 1.6 }, stim);
      const handle = el("circle", { class: "va-front__handle", cx: sx + side, cy: cy, r: 4.5 }, front);

      /* Size dimension below the screen, ecc label above the line. */
      const dimY = pad + s.heightMm * k + 9;
      el("line", { class: "va-front__dim", x1: sx, y1: dimY, x2: sx + side, y2: dimY }, front);
      el("line", { class: "va-front__dim", x1: sx, y1: dimY - 3, x2: sx, y2: dimY + 3 }, front);
      el("line", { class: "va-front__dim", x1: sx + side, y1: dimY - 3, x2: sx + side, y2: dimY + 3 }, front);
      const sizeLabel = el("text", { class: "va-front__label", x: Math.min(Math.max(sx + side / 2, 40), W - 40), y: dimY + 12, "text-anchor": "middle" }, front);
      sizeLabel.textContent = "θ = " + fmt(deg, 2) + "° = " + fmt(mm, 1) + " mm";
      if (Math.abs(e) > 0.05) {
        const eccLabel = el("text", { class: "va-front__label", x: cx + xc * k / 2, y: cy - 5, "text-anchor": "middle" }, front);
        eccLabel.textContent = "e = " + fmt(e, 1) + "°";
      }

      geom = { k: k, cx: cx, d: d, box: box, handle: handle };
    }

    function update() {
      const s = setup();
      const pitchX = s.widthMm / s.resX;
      const pitchY = s.heightMm / s.resY;
      const d = s.distanceMm;
      const e = Number.isFinite(num(eccInput.value)) ? num(eccInput.value) : 0;

      let deg = num(conv.deg.value);
      let mm = num(conv.mm.value);
      let px = num(conv.px.value);
      if (source === "px") mm = px * pitchX;
      if (source === "deg") mm = degToMm(deg, e, d);
      else deg = mmToDeg(mm, e, d);
      if (source !== "px") px = mm / pitchX;

      if (source !== "deg") conv.deg.value = fmt(deg, 2);
      if (source !== "mm") conv.mm.value = fmt(mm, 1);
      if (source !== "px") conv.px.value = fmt(px, 1);

      const ppd = 2 * d * Math.tan(0.5 * DEG) / pitchX;
      const fovW = 2 * Math.atan(s.widthMm / (2 * d)) / DEG;
      const fovH = 2 * Math.atan(s.heightMm / (2 * d)) / DEG;
      const posMm = d * Math.tan(e * DEG);
      out.ppd.textContent = Number.isFinite(ppd) ? fmt(ppd, 1) + " px" : "";
      out.pitch.textContent = Number.isFinite(pitchX)
        ? fmt(pitchX, 3) + (Number.isFinite(pitchY) ? " × " + fmt(pitchY, 3) : "") + " mm"
        : "";
      out.pos.textContent = Number.isFinite(posMm) ? fmt(posMm, 1) + " mm, " + fmt(posMm / pitchX, 1) + " px" : "";
      out.fov.textContent = Number.isFinite(fovW)
        ? fmt(fovW, 1) + "°" + (Number.isFinite(fovH) ? " × " + fmt(fovH, 1) + "°" : "")
        : "";
      out.theta.textContent = Number.isFinite(deg) ? fmt(deg, 2) + "°" : "";
      out.d.textContent = Number.isFinite(d) ? fmt(d, 0) + " mm" : "";
      out.s.textContent = Number.isFinite(mm) ? fmt(mm, 1) + " mm" : "";

      const half = s.widthMm / 2;
      const outside = Number.isFinite(mm) &&
        (Math.abs(d * Math.tan((e + deg / 2) * DEG)) > half || Math.abs(d * Math.tan((e - deg / 2) * DEG)) > half);
      out.warn.hidden = !outside;
      out.warn.textContent = outside ? "Part of the stimulus falls outside the screen." : "";

      drawFront(s, e, deg, mm);
    }

    /* Dragging: the box moves the centre (eccentricity), the handle on its
       right edge changes the size; the size in degrees is kept while moving. */
    function svgX(evt) {
      const p = front.createSVGPoint();
      p.x = evt.clientX;
      p.y = evt.clientY;
      return p.matrixTransform(front.getScreenCTM().inverse()).x;
    }
    function setDeg(value) { conv.deg.value = fmt(Math.max(value, 0.01), 2); source = "deg"; }
    function setEcc(value) { eccInput.value = fmt(value, 2); }

    let drag = null;
    front.addEventListener("pointerdown", function (evt) {
      if (!geom) return;
      if (evt.target === geom.handle) drag = "size";
      else if (evt.target === geom.box) drag = "move";
      else return;
      evt.preventDefault();
      front.setPointerCapture(evt.pointerId);
      root.classList.add("va-calc--dragging");
    });
    front.addEventListener("pointermove", function (evt) {
      if (!drag || !geom) return;
      const xmm = (svgX(evt) - geom.cx) / geom.k;
      const a = Math.atan(xmm / geom.d) / DEG;
      if (drag === "move") {
        setEcc(a);
        source = "deg";
      } else {
        const e = num(eccInput.value) || 0;
        setDeg(2 * (a - e));
      }
      update();
    });
    function endDrag() {
      drag = null;
      root.classList.remove("va-calc--dragging");
    }
    front.addEventListener("pointerup", endDrag);
    front.addEventListener("pointercancel", endDrag);
    front.addEventListener("keydown", function (evt) {
      if (!geom || evt.target !== geom.box) return;
      const step = 0.1;
      const e = num(eccInput.value) || 0;
      const t = num(conv.deg.value) || 0;
      if (evt.key === "ArrowLeft" || evt.key === "ArrowRight") {
        setEcc(e + (evt.key === "ArrowRight" ? step : -step));
        source = "deg";
      } else if (evt.shiftKey && (evt.key === "ArrowUp" || evt.key === "ArrowDown")) {
        setDeg(t + (evt.key === "ArrowUp" ? step : -step));
      } else {
        return;
      }
      evt.preventDefault();
      update();
      root.querySelector(".va-front__stim").focus();
    });

    select.addEventListener("change", function () {
      if (select.value === "preset") loadPreset();
      update();
    });
    setupInputs.forEach(function (n) {
      n.addEventListener("input", function () {
        select.value = "custom";
        update();
      });
    });
    eccInput.addEventListener("input", update);
    Object.keys(conv).forEach(function (key) {
      conv[key].addEventListener("input", function () {
        source = key;
        update();
      });
    });

    loadPreset();
    conv.deg.value = "2";
    eccInput.value = "5";
    update();
  }

  document$.subscribe(function () {
    document.querySelectorAll(".va-calc").forEach(function (root, i) {
      if (root.dataset.vaReady) return;
      root.dataset.vaReady = "1";
      build(root, i);
    });
  });
})();
