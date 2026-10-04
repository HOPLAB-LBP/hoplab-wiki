/*
  Visual angle calculator, a wiki primitive (documented in the Formatting
  toolkit, docs/contribute/formatting-toolkit.md). Used on the MR11
  equipment page and the EEG task page; the text around it is shared in
  includes/visual-angles.md.

  On a page:

    <div class="va-calc" data-setup="mr11">
      <p>Fallback text shown without JavaScript.</p>
    </div>

  `data-setup` picks a set-up from SETUPS below, the one place where set-up
  values live. Any value can be overridden on the element with data-width-mm,
  data-height-mm, data-res-x, data-res-y, data-distance-mm, data-label and
  data-note.

  Geometry. Flat screen, eye facing the screen centre at distance d. Screen
  coordinates in mm: x to the right, y up, origin at the screen centre. A
  screen point r mm from the centre is atan(r / d) from the line of sight.

  The stimulus is a square of side s = 2h, never stretched and never
  rotated. Its centre is e degrees from the screen centre in direction phi
  (counter-clockwise from the horizontal axis to the right):
      (cx, cy) = d tan(e) (cos phi, sin phi).
  Its size theta is the visual angle of its width: the horizontal segment
  from (cx - h, cy) to (cx + h, cy). That segment lies on the line y = cy,
  whose nearest point to the eye is (0, cy) at distance D = sqrt(d^2 + cy^2),
  so it spans
      theta = atan((cx + h) / D) - atan((cx - h) / D).
  Solving for h (Q = D^2 + cx^2, R = sqrt(D^2 + cx^2 sin^2 theta)):
      (Q - h^2) sin theta = 2 h D cos theta,
      h = Q sin theta / (R + D cos theta)   (theta < 90; see halfFor).
  Centred this is h = d tan(theta / 2). Checked against an independent
  numerical solution (3D ray angles, bisection) to 1e-13 mm. The height spans a slightly
  different angle off centre (same formula with x and y swapped), and so
  does the chord along the line from the screen centre; the table shows
  both. Pixels: x uses the horizontal pixel size (width / horizontal
  resolution), y the vertical one.

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
    eeg: {
      label: "EEG booth (BenQ XL2411)",
      widthMm: 531,
      heightMm: 299,
      resX: 1920,
      resY: 1080,
      distanceMm: 630,
      note: "Active area from the BenQ ZOWIE XL2411 specification; viewing distance as used in lab EEG experiments.",
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
      ["size", "Width (θ, s)"],
      ["height", "Height"],
      ["radial", "Along the line from the centre"],
    ]],
    ["Position", [
      ["centre", "Centre (e)", "centre"],
      ["cx", "Centre, x (right)"],
      ["cy", "Centre, y (up)"],
      ["near", "Nearest point", "near"],
      ["far", "Farthest corner", "far"],
    ]],
    ["At the screen centre", [
      ["oneDeg", "One degree"],
      ["onePx", "One pixel"],
    ]],
    ["Whole screen", [
      ["width", "Width"],
      ["height2", "Height"],
    ]],
  ];

  function num(value) {
    const n = parseFloat(String(value).replace(",", "."));
    return Number.isFinite(n) ? n : NaN;
  }

  function fmt(n, digits) {
    return Number.isFinite(n) ? n.toFixed(digits) : "";
  }

  /* Visual angle (degrees) of the segment from a - h to a + h on a screen
     line whose nearest point to the eye is at distance D. */
  function span(a, h, D) {
    return (Math.atan((a + h) / D) - Math.atan((a - h) / D)) / DEG;
  }

  /* Centre of the stimulus on the screen (mm). */
  function centreOf(e, phi, d) {
    const r = d * Math.tan(e * DEG);
    return [r * Math.cos(phi * DEG), r * Math.sin(phi * DEG)];
  }

  /* Half side h (mm) of a stimulus centred at (cx, cy) whose width spans
     theta degrees: the positive root of (Q - h^2) sin(theta) =
     2 h D cos(theta), written without tan so it stays stable near and
     above 90 degrees (R = sqrt(D^2 + cx^2 sin^2 theta)). */
  function halfFor(theta, cx, cy, d) {
    if (!(theta >= 0) || !(theta < 180)) return NaN;
    if (theta === 0) return 0;
    const D = Math.hypot(d, cy);
    const Q = D * D + cx * cx;
    if (theta === 90) return Math.sqrt(Q);
    const S = Math.sin(theta * DEG);
    const C = Math.cos(theta * DEG);
    const R = Math.sqrt(D * D + cx * cx * S * S);
    return theta < 90 ? Q * S / (R + D * C) : (R - D * C) / S;
  }

  /* Everything the table and the drawing need about a stimulus of half side
     h centred e degrees away in direction phi. */
  function describe(e, phi, h, d) {
    const c = centreOf(e, phi, d);
    const cx = c[0];
    const cy = c[1];
    const ux = Math.cos(phi * DEG);
    const uy = Math.sin(phi * DEG);
    const r = d * Math.tan(e * DEG);
    /* The line from the screen centre through the stimulus centre leaves
       the square k mm from its centre. */
    const k = h / Math.max(Math.abs(ux), Math.abs(uy));
    return {
      cx: cx, cy: cy, h: h, r: r, ux: ux, uy: uy, k: k,
      width: span(cx, h, Math.hypot(d, cy)),
      height: span(cy, h, Math.hypot(d, cx)),
      radial: span(r, k, d),
      nearX: Math.max(Math.abs(cx) - h, 0),
      nearY: Math.max(Math.abs(cy) - h, 0),
      farX: Math.abs(cx) + h,
      farY: Math.abs(cy) + h,
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
      '<p class="va-table__note">The stimulus is a square of side s, never stretched or rotated, centred e degrees from the screen centre in direction φ. ' +
      "θ is the angle its width spans at the eye; off centre, its height and the line from the centre span slightly different angles (rows above). " +
      "All distances are from the screen centre: x is positive to the right and y upwards (Psychtoolbox counts y downwards). " +
      "Nearest point and farthest corner: straight-line distances on the screen.</p>";

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
        '<div class="va-pos">' +
          '<label class="va-ecc" for="' + id("ecc") + '">' +
            '<span class="va-field__label">Stimulus centre: distance from the screen centre (e)</span>' +
            '<span class="va-field__box">' +
              '<input id="' + id("ecc") + '" data-pos="e" type="text" inputmode="decimal" autocomplete="off" value="0">' +
              '<span class="va-field__unit">degrees</span>' +
            "</span>" +
          "</label>" +
          '<label class="va-ecc" for="' + id("phi") + '">' +
            '<span class="va-field__label">Direction from the horizontal axis (φ), counter-clockwise</span>' +
            '<span class="va-field__box">' +
              '<input id="' + id("phi") + '" data-pos="phi" type="text" inputmode="decimal" autocomplete="off" value="0">' +
              '<span class="va-field__unit">degrees</span>' +
            "</span>" +
          "</label>" +
        "</div>" +
        '<div class="va-views">' +
          '<figure class="va-view">' +
            '<svg class="va-front" role="img"></svg>' +
            "<figcaption>" +
              "<p>Top: the screen as the participant sees it, to scale, with rings every 5° around the fixation point. " +
              "The coloured circles pass through the nearest point, the centre and the farthest corner of the stimulus " +
              "(values in the table). Bottom: seen from above, in the plane through the eye and the stimulus's horizontal " +
              "midline (distance not to scale).</p>" +
              '<p class="va-symbols">' +
                "<span><i>θ</i> stimulus size: the angle its width spans, in degrees</span>" +
                "<span><i>s</i> stimulus size on the screen</span>" +
                "<span><i>e</i> distance of the stimulus centre from the screen centre, in degrees</span>" +
                "<span><i>φ</i> direction of the stimulus centre, counter-clockwise from the horizontal axis to the right</span>" +
                "<span><i>d</i> viewing distance, from the eye to the screen centre</span>" +
                "<span><i>d′</i> distance from the eye to the stimulus's horizontal midline, √(d² + y²)</span>" +
              "</p>" +
              "<p>Drag the square to move the stimulus. It follows the horizontal, the vertical or the circle through its centre, " +
              "whichever is closest to the direction you start dragging in; hold Shift to stay on the circle. " +
              "Drag the round handle to resize it.</p>" +
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
    const posInput = {};
    root.querySelectorAll("[data-pos]").forEach(function (n) { posInput[n.dataset.pos] = n; });
    const front = root.querySelector(".va-front");
    const figure = root.querySelector(".va-view");
    let source = "deg";
    /* Position of the stimulus centre, kept unrounded (the boxes show it
       rounded). */
    const pos = { e: 0, phi: 0 };
    let geom = null;  /* last drawn geometry, for dragging */
    let last = null;  /* last drawing arguments, to redraw on resize */
    let drag = null;  /* current drag: {mode, track, start, c0, e0} */

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

    function setPos(e, phi) {
      pos.e = e;
      pos.phi = Math.abs(phi) > 180 ? phi - 360 * Math.round(phi / 360) : phi;
      posInput.e.value = fmt(pos.e, 2);
      posInput.phi.value = fmt(pos.phi, 2);
    }

    /* Move the centre to screen point (x, y) mm. */
    function setCentre(x, y, d) {
      const rr = Math.hypot(x, y);
      setPos(Math.atan(rr / d) / DEG, rr > 1e-9 ? Math.atan2(y, x) / DEG : pos.phi);
    }

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

    /* The drawing, at the figure's real width (1 SVG unit = 1 CSS pixel, so
       text keeps its size). Top: front view of the screen to scale, with
       rings of equal eccentricity, the fixation point and the stimulus
       (draggable). Bottom: seen from above in the plane through the eye and
       the stimulus's horizontal midline, on the same horizontal scale
       (distance compressed), joined to the front view by projection lines
       at the stimulus edges. */
    function drawFront(s, g, deg) {
      last = [s, g, deg];
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
      const X = function (xmm) { return cx + xmm * k; };
      const Y = function (ymm) { return cy - ymm * k; };
      const yS = y0 + sh + 34;                        /* screen line in the view from above */
      const P = Math.round(Math.min(Math.max(sw * 0.3, 96), 140)); /* drawn distance */
      const yE = yS + P;                              /* eye */
      const H = Math.round(yE + 12);

      front.setAttribute("viewBox", "0 0 " + W + " " + H);
      front.setAttribute("width", W);
      front.setAttribute("height", H);
      front.setAttribute("aria-label",
        "Front view of the screen and view from above, with the stimulus " + fmt(deg, 2) +
        " degrees wide, centred " + fmt(pos.e, 2) + " degrees from the screen centre in direction " +
        fmt(pos.phi, 2) + " degrees");

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
      const xRight = g ? g.cx < 0 : false;            /* labels go on the side away from the stimulus */
      const Dm = g ? Math.hypot(d, g.cy) : d;
      const onAxis = !g || Math.abs(g.cy) < 0.05;
      el("line", { class: "va-plan__axis", x1: cx, y1: yS, x2: cx, y2: yE }, front);
      el("line", { class: "va-plan__screen", x1: x0, y1: yS, x2: x0 + sw, y2: yS }, front);
      const xd = xRight ? x0 + sw - 4 : x0 + 4;
      el("line", { class: "va-plan__dim", x1: xd, y1: yS + 6, x2: xd, y2: yE }, front);
      el("line", { class: "va-plan__dim", x1: xd - 4, y1: yS + 6, x2: xd + 4, y2: yS + 6 }, front);
      el("line", { class: "va-plan__dim", x1: xd - 4, y1: yE, x2: xd + 4, y2: yE }, front);
      text(front, "va-plan__label", xd + (xRight ? -8 : 8), (yS + yE) / 2 + 4, xRight ? "end" : "start",
        (onAxis ? "d = " : "d′ = ") + fmt(Dm, 0) + " mm");

      if (!g || !(g.h > 0)) {
        drawEye(cx, yE);
        return;
      }
      const xl = X(g.cx - g.h);
      const xr = X(g.cx + g.h);
      const xc = X(g.cx);
      const yc = Y(g.cy);
      const side = xr - xl;

      /* Projection lines from the front view down to the screen line */
      const yBottom = Math.min(Y(g.cy - g.h), y0 + sh);
      el("line", { class: "va-proj", x1: xl, y1: yBottom, x2: xl, y2: yS }, front);
      el("line", { class: "va-proj", x1: xr, y1: yBottom, x2: xr, y2: yS }, front);

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
        sOut ? "start" : "end", "s = " + fmt(2 * g.h, 1) + " mm");

      /* Stimulus in the front view, with circles through its nearest point,
         centre and farthest corner, and the track of the current drag */
      const stim = el("g", { "clip-path": "url(#" + clipId + ")" }, front);
      [["near", Math.hypot(g.nearX, g.nearY)], ["far", Math.hypot(g.farX, g.farY)], ["centre", Math.abs(g.r)]].forEach(function (c) {
        if (c[1] * k > 0.5) el("circle", { class: "va-front__reach va-front__reach--" + c[0], cx: cx, cy: cy, r: c[1] * k }, stim);
      });
      if (drag && drag.track === "x") el("line", { class: "va-front__track", x1: x0, y1: yc, x2: x0 + sw, y2: yc }, stim);
      if (drag && drag.track === "y") el("line", { class: "va-front__track", x1: xc, y1: y0, x2: xc, y2: y0 + sh }, stim);
      if (drag && drag.track === "circle") el("circle", { class: "va-front__track", cx: cx, cy: cy, r: Math.abs(g.r) * k }, stim);
      el("line", { class: "va-front__ecc", x1: cx, y1: cy, x2: xc, y2: yc }, stim);
      /* An invisible grab area of at least 28 px, so a small stimulus can
         still be grabbed beside its resize handle. */
      const grabSide = Math.max(side, 28);
      const grab = el("rect", { class: "va-front__grab", x: xc - grabSide / 2, y: yc - grabSide / 2, width: grabSide, height: grabSide }, stim);
      const box = el("rect", {
        class: "va-front__stim", x: xl, y: yc - side / 2, width: Math.max(side, 1), height: Math.max(side, 1),
        tabindex: "0", role: "slider",
        "aria-label": "Stimulus position. Arrow keys move it horizontally and vertically; with Shift, left and right move it round the circle and up and down change its size",
        "aria-valuenow": fmt(pos.e, 2), "aria-valuetext": fmt(pos.e, 2) + " degrees from the centre, direction " + fmt(pos.phi, 2) + " degrees",
      }, stim);
      el("circle", { class: "va-front__centre", cx: xc, cy: yc, r: 2 }, stim);
      if (Math.hypot(xc - cx, yc - cy) > 48) {
        /* e label beside the dashed line, on its lower side */
        const len = Math.hypot(xc - cx, yc - cy);
        let nx = -(yc - cy) / len;
        let ny = (xc - cx) / len;
        if (ny < 0) { nx = -nx; ny = -ny; }
        const off = side / 4 + 10;
        text(front, "va-front__label", (cx + xc) / 2 + nx * off, (cy + yc) / 2 + ny * off + 4, "middle",
          "e = " + fmt(pos.e, 1) + "°");
      }
      /* Resize handle on the right edge; it scales with the stimulus so it
         never covers the whole grab area. */
      const handle = el("g", { class: "va-front__handle" }, front);
      el("circle", { class: "va-front__hit", cx: xr, cy: yc, r: Math.min(14, Math.max(5, side * 0.3)) }, handle);
      el("circle", { class: "va-front__knob", cx: xr, cy: yc, r: Math.min(6, Math.max(3.5, side * 0.2)) }, handle);

      geom = { k: k, cx: cx, cy: cy, d: d, box: box, grab: grab, handle: handle };
    }

    function update() {
      const s = setup();
      const pitchX = s.widthMm / s.resX;
      const pitchY = s.heightMm / s.resY;
      const d = s.distanceMm;
      const e = pos.e;
      const phi = pos.phi;
      const valid = d > 0 && Math.abs(e) < 90;
      const c = valid ? centreOf(e, phi, d) : [NaN, NaN];

      let deg = num(conv.deg.value);
      let mm = num(conv.mm.value);
      let px = num(conv.px.value);
      if (source === "px") mm = px * pitchX;
      if (source === "deg") {
        mm = 2 * halfFor(deg, c[0], c[1], d);
      } else {
        deg = mm >= 0 ? span(c[0], mm / 2, Math.hypot(d, c[1])) : NaN;
      }
      if (source !== "px") px = mm / pitchX;

      if (source !== "deg") conv.deg.value = fmt(deg, 2);
      if (source !== "mm") conv.mm.value = fmt(mm, 1);
      if (source !== "px") conv.px.value = fmt(px, 1);

      const g = valid && mm >= 0 ? describe(e, phi, mm / 2, d) : null;
      const pxOf = function (ax, ay) { return Math.hypot(ax / pitchX, ay / pitchY); };
      const atanDeg = function (x) { return Math.atan(x / d) / DEG; };
      const row = function (key, vDeg, vMm, vPx, digits) {
        const dg = digits || [2, 1, 1];
        out[key + "Deg"].textContent = fmt(vDeg, dg[0]);
        out[key + "Mm"].textContent = fmt(vMm, dg[1]);
        out[key + "Px"].textContent = fmt(vPx, dg[2]);
      };
      const N = NaN;
      row("size", deg, mm, mm / pitchX);
      row("height", g ? g.height : N, mm, mm / pitchY);
      row("radial", g ? g.radial : N, g ? 2 * g.k : N, g ? pxOf(2 * g.k * g.ux, 2 * g.k * g.uy) : N);
      row("centre", e, valid ? d * Math.tan(e * DEG) : N, valid ? Math.sign(e) * pxOf(c[0], c[1]) : N);
      row("cx", N, c[0], c[0] / pitchX);
      row("cy", N, c[1], c[1] / pitchY);
      row("near", g ? atanDeg(Math.hypot(g.nearX, g.nearY)) : N, g ? Math.hypot(g.nearX, g.nearY) : N, g ? pxOf(g.nearX, g.nearY) : N);
      row("far", g ? atanDeg(Math.hypot(g.farX, g.farY)) : N, g ? Math.hypot(g.farX, g.farY) : N, g ? pxOf(g.farX, g.farY) : N);
      row("oneDeg", 1, 2 * d * Math.tan(0.5 * DEG), 2 * d * Math.tan(0.5 * DEG) / pitchX);
      row("onePx", 2 * Math.atan(pitchX / (2 * d)) / DEG, pitchX, 1, [4, 3, 0]);
      row("width", 2 * Math.atan(s.widthMm / (2 * d)) / DEG, s.widthMm, s.resX, [2, 1, 0]);
      row("height2", 2 * Math.atan(s.heightMm / (2 * d)) / DEG, s.heightMm, s.resY, [2, 1, 0]);

      const outside = g !== null && (g.farX > s.widthMm / 2 || g.farY > s.heightMm / 2);
      out.warn.hidden = !outside;
      out.warn.textContent = outside ? "Part of the stimulus falls outside the screen. The table describes the whole square." : "";

      drawFront(s, g, deg);
    }

    /* Dragging. The box moves the centre along one of three tracks: the
       horizontal through the centre, the vertical through the centre, or
       the circle of constant e. The track is the one whose direction is
       closest to the first few pixels of the drag (Shift: the circle); on
       an axis the circle's tangent is the other axis, and the axis wins.
       The size in degrees is kept while moving. The round handle on the
       right edge changes the size. */
    function svgPoint(evt) {
      const p = front.createSVGPoint();
      p.x = evt.clientX;
      p.y = evt.clientY;
      const q = p.matrixTransform(front.getScreenCTM().inverse());
      return [(q.x - geom.cx) / geom.k, (geom.cy - q.y) / geom.k];  /* screen mm, y up */
    }
    function setDeg(value) { conv.deg.value = fmt(Math.max(value, 0.01), 2); source = "deg"; }

    front.addEventListener("pointerdown", function (evt) {
      if (!geom) return;
      let mode;
      if (geom.handle.contains(evt.target)) mode = "size";
      else if (evt.target === geom.box || evt.target === geom.grab) mode = "move";
      else return;
      evt.preventDefault();
      front.setPointerCapture(evt.pointerId);
      drag = { mode: mode, track: null, start: svgPoint(evt), c0: centreOf(pos.e, pos.phi, geom.d), e0: Math.abs(pos.e) };
      if (pos.e < 0) setPos(-pos.e, pos.phi + 180);  /* the same point, with e >= 0 */
      root.classList.add("va-calc--dragging");
    });
    front.addEventListener("pointermove", function (evt) {
      if (!drag || !geom) return;
      const p = svgPoint(evt);
      const d = geom.d;
      if (drag.mode === "size") {
        const c = centreOf(pos.e, pos.phi, d);
        setDeg(span(c[0], Math.abs(p[0] - c[0]), Math.hypot(d, c[1])));
        update();
        return;
      }
      if (!drag.track) {
        const vx = p[0] - drag.start[0];
        const vy = p[1] - drag.start[1];
        const len = Math.hypot(vx, vy);
        if (len * geom.k < 5) return;
        const rr = Math.hypot(drag.c0[0], drag.c0[1]);
        const canCircle = rr * geom.k > 2;
        if (evt.shiftKey && canCircle) {
          drag.track = "circle";
        } else {
          const scores = [["x", Math.abs(vx) / len], ["y", Math.abs(vy) / len]];
          if (canCircle) scores.push(["circle", Math.abs(-drag.c0[1] * vx + drag.c0[0] * vy) / (rr * len)]);
          drag.track = scores.reduce(function (a, b) { return b[1] > a[1] + 1e-9 ? b : a; })[0];
        }
      }
      if (drag.track === "x") setCentre(p[0], drag.c0[1], d);
      else if (drag.track === "y") setCentre(drag.c0[0], p[1], d);
      else setPos(drag.e0, Math.atan2(p[1], p[0]) / DEG);
      source = "deg";
      update();
    });
    function endDrag() {
      if (!drag) return;
      drag = null;
      root.classList.remove("va-calc--dragging");
      update();
    }
    front.addEventListener("pointerup", endDrag);
    front.addEventListener("pointercancel", endDrag);
    front.addEventListener("keydown", function (evt) {
      if (!geom || evt.target !== geom.box) return;
      const step = 0.1;
      const d = geom.d;
      const c = centreOf(pos.e, pos.phi, d);
      const t = num(conv.deg.value) || 0;
      const nudge = function (v, sign) { return d * Math.tan(Math.atan(v / d) + sign * step * DEG); };
      if (evt.shiftKey && (evt.key === "ArrowLeft" || evt.key === "ArrowRight")) {
        setPos(Math.abs(pos.e), (pos.e < 0 ? pos.phi + 180 : pos.phi) + (evt.key === "ArrowLeft" ? 1 : -1));
      } else if (evt.shiftKey && (evt.key === "ArrowUp" || evt.key === "ArrowDown")) {
        setDeg(t + (evt.key === "ArrowUp" ? step : -step));
      } else if (evt.key === "ArrowLeft" || evt.key === "ArrowRight") {
        setCentre(nudge(c[0], evt.key === "ArrowRight" ? 1 : -1), c[1], d);
      } else if (evt.key === "ArrowUp" || evt.key === "ArrowDown") {
        setCentre(c[0], nudge(c[1], evt.key === "ArrowUp" ? 1 : -1), d);
      } else {
        return;
      }
      source = "deg";
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
    Object.keys(posInput).forEach(function (key) {
      posInput[key].addEventListener("input", function () {
        const v = num(posInput[key].value);
        pos[key] = Number.isFinite(v) ? v : 0;
        source = "deg";
        update();
      });
    });
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
    setPos(5, 0);
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
