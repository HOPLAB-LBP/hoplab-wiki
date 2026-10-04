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
      widthMm: 698.4,
      heightMm: 392.9,
      resX: 1920,
      resY: 1080,
      distanceMm: 1850,
      note: "Active area from the BOLDscreen 32 UHD user guide; viewing distance as used in lab experiments.",
    },
  };

  const DEG = Math.PI / 180;
  const SVG_NS = "http://www.w3.org/2000/svg";
  /* Set-up fields, grouped: [label, unit, [[key, accessible name], ...]] */
  const GROUPS = [
    ["Screen size (width × height)", "mm", [["widthMm", "Screen width in mm"], ["heightMm", "Screen height in mm"]]],
    ["Resolution (width × height)", "px", [["resX", "Horizontal resolution in pixels"], ["resY", "Vertical resolution in pixels"]]],
    ["Viewing distance", "mm", [["distanceMm", "Viewing distance in mm"]]],
  ];
  const RINGS = [5, 10, 15, 20, 25, 30];
  /* Result table: [group, [[key, label, swatch], ...]]. Every row shows
     degrees, mm and pixels. */
  const TABLE = [
    ["Stimulus", [
      ["size", "Size (θ, s)"],
      ["centre", "Centre (e)", "centre"],
      ["near", "Nearest point", "near"],
      ["far", "Farthest corner", "far"],
    ]],
    ["At the screen centre", [
      ["oneDeg", "One degree"],
      ["onePx", "One pixel"],
    ]],
    ["Whole screen", [
      ["width", "Width"],
      ["height", "Height"],
    ]],
  ];

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

  /* Distances on the screen (mm) from the screen centre to the stimulus,
     drawn as a square from xl to xr (mm) on the horizontal midline:
     nearest point (0 if the square covers the centre), angular centre and
     farthest corner. */
  function radial(e, t, d) {
    const xl = d * Math.tan((e - t / 2) * DEG);
    const xr = d * Math.tan((e + t / 2) * DEG);
    const half = (xr - xl) / 2;
    const far = Math.max(Math.abs(xl), Math.abs(xr));
    return {
      near: xl <= 0 && xr >= 0 ? 0 : Math.min(Math.abs(xl), Math.abs(xr)),
      centre: Math.abs(d * Math.tan(e * DEG)),
      far: Math.hypot(far, half),
      farX: far,
      farY: half,
    };
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

    const setupFields = GROUPS.map(function (g, i) {
      const inputs = g[2].map(function (f) {
        return '<input id="' + id(f[0]) + '" data-key="' + f[0] + '" aria-label="' + f[1] +
          '" type="text" inputmode="decimal" autocomplete="off">';
      }).join('<span class="va-field__times" aria-hidden="true">×</span>');
      return (
        '<div class="va-field" role="group" aria-labelledby="' + id("g" + i) + '">' +
          '<span class="va-field__label" id="' + id("g" + i) + '">' + g[0] + "</span>" +
          '<span class="va-field__box">' + inputs +
            '<span class="va-field__unit">' + g[1] + "</span>" +
          "</span>" +
        "</div>"
      );
    }).join("");

    const table =
      '<table class="va-table">' +
        '<thead><tr><td></td><th scope="col">degrees</th><th scope="col">mm</th><th scope="col">px</th></tr></thead>' +
        TABLE.map(function (g) {
          return "<tbody>" +
            '<tr class="va-table__group"><th scope="rowgroup" colspan="4">' + g[0] + "</th></tr>" +
            g[1].map(function (row) {
              const swatch = row[2] ? '<span class="va-table__swatch va-table__swatch--' + row[2] + '"></span>' : "";
              return '<tr><th scope="row">' + swatch + row[1] + "</th>" +
                '<td data-out="' + row[0] + 'Deg"></td><td data-out="' + row[0] + 'Mm"></td><td data-out="' + row[0] + 'Px"></td></tr>';
            }).join("") +
            "</tbody>";
        }).join("") +
      "</table>" +
      '<p class="va-table__note">All distances are from the screen centre. Centre: negative values are left of it. Nearest point and farthest corner: straight-line distances.</p>';

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
          '<span class="va-field__label">Stimulus centre, horizontal distance from the screen centre</span>' +
          '<span class="va-field__box">' +
            '<input id="' + id("ecc") + '" data-ecc type="text" inputmode="decimal" autocomplete="off" value="0">' +
            '<span class="va-field__unit">degrees</span>' +
          "</span>" +
        "</label>" +
        '<div class="va-views">' +
          '<figure class="va-view">' +
            '<svg class="va-front" role="img"></svg>' +
            "<figcaption>" +
              "<p>Top: the screen as the participant sees it, to scale, with rings every 5° around the fixation point. " +
              "The coloured circles pass through the nearest point, the centre and the farthest corner of the stimulus " +
              "(values in the table). Bottom: the same set-up seen from above (distance not to scale).</p>" +
              '<p class="va-symbols">' +
                "<span><i>θ</i> stimulus size, in degrees</span>" +
                "<span><i>s</i> stimulus size on the screen</span>" +
                "<span><i>e</i> distance of the stimulus centre from the screen centre, in degrees</span>" +
                "<span><i>d</i> viewing distance, from the eye to the screen</span>" +
              "</p>" +
              "<p>Drag the square to move the stimulus and the round handle to resize it.</p>" +
            "</figcaption>" +
          "</figure>" +
          '<div class="va-side">' +
            table +
            '<p class="va-calc__warn" data-out="warn" hidden></p>' +
          "</div>" +
        "</div>" +
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
    let last = null; /* last drawing arguments, to redraw on resize */
    const figure = root.querySelector(".va-view");

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

    /* The drawing, at the figure's real width (1 SVG unit = 1 CSS pixel, so
       text keeps its size). Top: front view of the screen to scale, with
       rings of equal eccentricity, the fixation point and the stimulus
       (draggable). Bottom: the same set-up seen from above, on the same
       horizontal scale (distance compressed), joined to the front view by
       projection lines at the stimulus edges. */
    function text(parent, cls, x, y, anchor, value) {
      const t = el("text", { class: cls, x: fmt(x, 1), y: fmt(y, 1), "text-anchor": anchor }, parent);
      t.textContent = value;
      return t;
    }

    /* An eye, centred where the rays meet */
    function drawEye(x, y) {
      el("path", { class: "va-plan__eye", d: "M " + (x - 10) + " " + y + " Q " + x + " " + (y - 9) + " " + (x + 10) + " " + y +
        " Q " + x + " " + (y + 9) + " " + (x - 10) + " " + y + " Z" }, front);
      el("circle", { class: "va-plan__pupil", cx: x, cy: y, r: 2.6 }, front);
    }

    function drawFront(s, e, deg, mm) {
      last = [s, e, deg, mm];
      while (front.firstChild) front.removeChild(front.firstChild);
      geom = null;
      const d = s.distanceMm;
      if (!(s.widthMm > 0 && s.heightMm > 0 && d > 0)) return;

      const W = Math.round(Math.min(Math.max(figure.clientWidth || 420, 240), 640));
      const m = 12;                                   /* outer margin */
      const x0 = m;
      const sw = W - 2 * m;                           /* screen width in the drawing */
      const k = sw / s.widthMm;                       /* drawing px per mm */
      const sh = s.heightMm * k;
      const y0 = 6;
      const cx = x0 + sw / 2;
      const cy = y0 + sh / 2;
      const yS = y0 + sh + 34;                        /* screen line in the view from above */
      const P = Math.round(Math.min(Math.max(sw * 0.3, 96), 140)); /* drawn distance */
      const yE = yS + P;                              /* eye */
      const H = Math.round(yE + 12);

      front.setAttribute("viewBox", "0 0 " + W + " " + H);
      front.setAttribute("width", W);
      front.setAttribute("height", H);
      front.setAttribute("aria-label",
        "Front view of the screen and view from above, with the stimulus " + fmt(deg, 2) +
        " degrees wide, centred " + fmt(e, 2) + " degrees from the screen centre");

      const clipId = "va-clip-" + uid;
      const clip = el("clipPath", { id: clipId }, el("defs", {}, front));
      el("rect", { x: x0, y: y0, width: sw, height: sh, rx: 3 }, clip);

      /* Front view */
      el("rect", { class: "va-front__screen", x: x0, y: y0, width: sw, height: sh, rx: 3 }, front);
      const grid = el("g", { "clip-path": "url(#" + clipId + ")" }, front);
      el("line", { class: "va-front__axis", x1: x0, y1: cy, x2: x0 + sw, y2: cy }, grid);
      el("line", { class: "va-front__axis", x1: cx, y1: y0, x2: cx, y2: y0 + sh }, grid);
      RINGS.forEach(function (r) {
        const rad = d * Math.tan(r * DEG) * k;
        el("circle", { class: "va-front__ring", cx: cx, cy: cy, r: rad }, grid);
        if (cx - rad > x0 + 12) text(grid, "va-front__ringlabel", cx - rad, cy - 6, "middle", r + "°");
      });
      el("circle", { class: "va-front__fix", cx: cx, cy: cy, r: 2.5 }, front);

      /* View from above: screen edge-on, eye, centre line, distance */
      const xRight = e < 0;                           /* labels go on the side away from the stimulus */
      el("line", { class: "va-plan__axis", x1: cx, y1: yS, x2: cx, y2: yE }, front);
      el("line", { class: "va-plan__screen", x1: x0, y1: yS, x2: x0 + sw, y2: yS }, front);
      const xd = xRight ? x0 + sw - 4 : x0 + 4;
      el("line", { class: "va-plan__dim", x1: xd, y1: yS + 6, x2: xd, y2: yE }, front);
      el("line", { class: "va-plan__dim", x1: xd - 4, y1: yS + 6, x2: xd + 4, y2: yS + 6 }, front);
      el("line", { class: "va-plan__dim", x1: xd - 4, y1: yE, x2: xd + 4, y2: yE }, front);
      text(front, "va-plan__label", xd + (xRight ? -8 : 8), (yS + yE) / 2 + 4, xRight ? "end" : "start",
        "d = " + fmt(d, 0) + " mm");

      if (!(deg > 0) || !Number.isFinite(mm)) {
        drawEye(cx, yE);
        return;
      }
      const xl = cx + d * Math.tan((e - deg / 2) * DEG) * k;
      const xr = cx + d * Math.tan((e + deg / 2) * DEG) * k;
      const xc = cx + d * Math.tan(e * DEG) * k;
      const side = xr - xl;

      /* Projection lines from the front view down to the screen line */
      el("line", { class: "va-proj", x1: xl, y1: y0 + sh, x2: xl, y2: yS }, front);
      el("line", { class: "va-proj", x1: xr, y1: y0 + sh, x2: xr, y2: yS }, front);

      /* Rays, stimulus, angle at the eye */
      el("line", { class: "va-plan__ray", x1: cx, y1: yE, x2: xl, y2: yS }, front);
      el("line", { class: "va-plan__ray", x1: cx, y1: yE, x2: xr, y2: yS }, front);
      el("line", { class: "va-plan__stim", x1: xl, y1: yS, x2: Math.max(xr, xl + 1), y2: yS }, front);
      const ra = Math.min(36, P * 0.4);
      const pt = function (x) {
        const len = Math.hypot(x - cx, yS - yE);
        return [cx + (x - cx) / len * ra, yE + (yS - yE) / len * ra];
      };
      const p1 = pt(xl);
      const p2 = pt(xr);
      el("path", { class: "va-plan__arc", d: "M " + fmt(p1[0], 2) + " " + fmt(p1[1], 2) +
        " A " + ra + " " + ra + " 0 0 1 " + fmt(p2[0], 2) + " " + fmt(p2[1], 2) }, front);
      drawEye(cx, yE);
      text(front, "va-plan__label va-plan__label--accent", cx + (xRight ? 14 : -14), yE - 4,
        xRight ? "start" : "end", "θ = " + fmt(deg, 2) + "°");
      /* s goes beside the stimulus, on the outer side, clear of the rays */
      const sOut = xr >= cx ? xr + 90 <= W - 2 : !(xl - 90 >= 2);
      const rayAt = function (x) { return x + (cx - x) * 20 / P; };  /* ray position at the label */
      text(front, "va-plan__label", sOut ? Math.max(xr, rayAt(xr)) + 6 : Math.min(xl, rayAt(xl)) - 6, yS + 17,
        sOut ? "start" : "end", "s = " + fmt(mm, 1) + " mm");

      /* Stimulus in the front view, with circles through its nearest point,
         centre and farthest corner */
      const stim = el("g", { "clip-path": "url(#" + clipId + ")" }, front);
      const r = radial(e, deg, d);
      [["near", r.near], ["far", r.far], ["centre", r.centre]].forEach(function (c) {
        if (c[1] * k > 0.5) el("circle", { class: "va-front__reach va-front__reach--" + c[0], cx: cx, cy: cy, r: c[1] * k }, stim);
      });
      el("line", { class: "va-front__ecc", x1: cx, y1: cy, x2: xc, y2: cy }, stim);
      const box = el("rect", {
        class: "va-front__stim", x: xl, y: cy - side / 2, width: Math.max(side, 1), height: Math.max(side, 1),
        tabindex: "0", role: "slider", "aria-label": "Stimulus position (arrow keys move it; with Shift, up and down change its size)",
        "aria-valuenow": fmt(e, 2), "aria-valuetext": fmt(e, 2) + " degrees from the centre",
      }, stim);
      el("circle", { class: "va-front__centre", cx: xc, cy: cy, r: 2 }, stim);
      if (Math.abs(xc - cx) > 48) {
        text(front, "va-front__label", (cx + xc) / 2 + (xc > cx ? -side / 4 : side / 4), cy + 17, "middle",
          "e = " + fmt(e, 1) + "°");
      }
      const handle = el("g", { class: "va-front__handle" }, front);
      el("circle", { class: "va-front__hit", cx: xr, cy: cy, r: 14 }, handle);
      el("circle", { class: "va-front__knob", cx: xr, cy: cy, r: 6 }, handle);

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

      /* Table: degrees, mm and pixels for each row */
      const ppd = 2 * d * Math.tan(0.5 * DEG) / pitchX;
      const posMm = d * Math.tan(e * DEG);
      const r = Number.isFinite(mm) && deg > 0 ? radial(e, deg, d) : null;
      const pitchR = Number.isFinite(pitchY) ? pitchY : pitchX;
      const atanDeg = function (x) { return Math.atan(x / d) / DEG; };
      const row = function (key, vDeg, vMm, vPx, digits) {
        const dg = digits || [2, 1, 1];
        out[key + "Deg"].textContent = fmt(vDeg, dg[0]);
        out[key + "Mm"].textContent = fmt(vMm, dg[1]);
        out[key + "Px"].textContent = fmt(vPx, dg[2]);
      };
      row("size", deg, mm, mm / pitchX);
      row("centre", e, posMm, posMm / pitchX);
      row("near", r ? atanDeg(r.near) : NaN, r ? r.near : NaN, r ? r.near / pitchX : NaN);
      row("far", r ? atanDeg(r.far) : NaN, r ? r.far : NaN, r ? Math.hypot(r.farX / pitchX, r.farY / pitchR) : NaN);
      row("oneDeg", 1, 2 * d * Math.tan(0.5 * DEG), ppd);
      row("onePx", 2 * Math.atan(pitchX / (2 * d)) / DEG, pitchX, 1, [4, 3, 0]);
      row("width", 2 * Math.atan(s.widthMm / (2 * d)) / DEG, s.widthMm, s.resX, [2, 1, 0]);
      row("height", 2 * Math.atan(s.heightMm / (2 * d)) / DEG, s.heightMm, s.resY, [2, 1, 0]);

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
      if (geom.handle.contains(evt.target)) drag = "size";
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

    /* Redraw at the new width when the figure is resized. */
    if (window.ResizeObserver) {
      let width = 0;
      new ResizeObserver(function () {
        if (figure.clientWidth === width) return;
        width = figure.clientWidth;
        if (last) drawFront.apply(null, last);
      }).observe(figure);
    }

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
