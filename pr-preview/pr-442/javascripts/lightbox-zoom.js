/*
  Zoom bar for the image lightbox (mkdocs-glightbox).

  When an image is open, a bar under it holds a slider (50 to 400 %), − and +
  buttons, the current zoom and a reset button. The mouse wheel and the keys
  + − 0 zoom too. A zoomed image can be dragged (mouse or finger) to see its
  parts. The zoom resets when another image is shown or the lightbox closes.

  GLightbox adds .glightbox-container to <body> when it opens and removes it when
  it closes; the visible slide has the class "current". A MutationObserver follows
  both, so this works with Material's instant navigation and needs no access to
  the plugin's own GLightbox instance.
*/

(function () {
  const MIN = 0.5;
  const MAX = 4;
  const BASE = 1; /* 100 %: the size the lightbox opens the image at */
  const STEP = 0.25;

  let bar = null;    // the zoom bar of the open lightbox
  let view = null;   // { img, scale, x, y } for the image on screen
  let slideWatcher = null;

  function currentImage(container) {
    return container.querySelector(".gslide.current .gslide-image img");
  }

  /* Keep the zoomed image from being dragged out of sight */
  function clampPan() {
    const maxX = Math.max(0, (view.img.offsetWidth * (view.scale - 1)) / 2);
    const maxY = Math.max(0, (view.img.offsetHeight * (view.scale - 1)) / 2);
    view.x = Math.max(-maxX, Math.min(maxX, view.x));
    view.y = Math.max(-maxY, Math.min(maxY, view.y));
  }

  function render() {
    if (!view || !bar) return;
    view.img.style.transform =
      "translate(" + view.x + "px, " + view.y + "px) scale(" + view.scale + ")";
    view.img.classList.toggle("lb-zoomed", view.scale > 1);
    bar.range.value = view.scale;
    bar.value.textContent = Math.round(view.scale * 100) + " %";
    bar.out.disabled = view.scale <= MIN;
    bar.in.disabled = view.scale >= MAX;
    bar.reset.disabled = view.scale === BASE;
  }

  function setScale(scale) {
    if (!view) return;
    view.scale = Math.round(Math.max(MIN, Math.min(MAX, scale)) * 100) / 100;
    if (view.scale <= BASE) {
      view.x = 0;
      view.y = 0;
    }
    clampPan();
    render();
  }

  /* Follow the image on screen; a new image starts at 100 % */
  function track(container) {
    const img = currentImage(container);
    if (!img || (view && view.img === img)) return;
    if (view) {
      view.img.style.transform = "";
      view.img.classList.remove("lb-zoomed");
    }
    view = { img: img, scale: 1, x: 0, y: 0 };
    bindPan(img);
    render();
  }

  /* Drag to pan while zoomed. Stopping the events here keeps GLightbox from
     reading the drag as a swipe to the next image. */
  function bindPan(img) {
    if (img.dataset.lbPan) return;
    img.dataset.lbPan = "1";
    let start = null;
    img.addEventListener("pointerdown", function (e) {
      if (!view || view.img !== img || view.scale <= 1) return;
      e.preventDefault();
      e.stopPropagation();
      img.setPointerCapture(e.pointerId);
      img.classList.add("lb-panning");
      start = { px: e.clientX, py: e.clientY, x: view.x, y: view.y };
    });
    img.addEventListener("pointermove", function (e) {
      if (!start) return;
      e.stopPropagation();
      view.x = start.x + (e.clientX - start.px);
      view.y = start.y + (e.clientY - start.py);
      clampPan();
      render();
    });
    const end = function () {
      start = null;
      img.classList.remove("lb-panning");
    };
    img.addEventListener("pointerup", end);
    img.addEventListener("pointercancel", end);
    ["touchstart", "touchmove", "mousedown", "click"].forEach(function (type) {
      img.addEventListener(type, function (e) {
        if (view && view.img === img && view.scale > 1) e.stopPropagation();
      }, { passive: true });
    });
  }

  function button(label, title, onClick) {
    const b = document.createElement("button");
    b.type = "button";
    b.className = "lb-zoom__btn";
    b.textContent = label;
    b.title = title;
    b.setAttribute("aria-label", title);
    b.addEventListener("click", function (e) {
      e.stopPropagation();
      onClick();
    });
    return b;
  }

  function buildBar(container) {
    const el = document.createElement("div");
    el.className = "lb-zoom";
    el.setAttribute("role", "group");
    el.setAttribute("aria-label", "Zoom");

    const range = document.createElement("input");
    range.type = "range";
    range.className = "lb-zoom__range";
    range.min = MIN;
    range.max = MAX;
    range.step = 0.05;
    range.value = BASE;
    range.setAttribute("aria-label", "Zoom level");
    range.addEventListener("input", function () { setScale(parseFloat(range.value)); });

    const value = document.createElement("span");
    value.className = "lb-zoom__value";

    const out = button("−", "Zoom out", function () { setScale(view.scale - STEP); });
    const zin = button("+", "Zoom in", function () { setScale(view.scale + STEP); });
    const reset = button("↺", "Back to 100 %", function () { setScale(BASE); });

    el.append(out, range, zin, value, reset);
    /* Clicks on the bar must not reach the backdrop, which closes the lightbox */
    ["click", "pointerdown", "mousedown", "touchstart"].forEach(function (type) {
      el.addEventListener(type, function (e) { e.stopPropagation(); }, { passive: true });
    });
    container.appendChild(el);

    container.addEventListener("wheel", function (e) {
      if (!view || !e.target.closest(".gslide-media")) return;
      e.preventDefault();
      setScale(view.scale * (e.deltaY < 0 ? 1.12 : 1 / 1.12));
    }, { passive: false });

    bar = { el: el, range: range, value: value, out: out, in: zin, reset: reset };
  }

  function onKey(e) {
    if (!bar || !view || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === "+" || e.key === "=") setScale(view.scale + STEP);
    else if (e.key === "-" || e.key === "_") setScale(view.scale - STEP);
    else if (e.key === "0") setScale(BASE);
  }

  function open(container) {
    buildBar(container);
    track(container);
    slideWatcher = new MutationObserver(function () { track(container); });
    slideWatcher.observe(container, { subtree: true, attributes: true, attributeFilter: ["class"], childList: true });
    document.addEventListener("keydown", onKey);
  }

  function close() {
    if (slideWatcher) slideWatcher.disconnect();
    slideWatcher = null;
    bar = null;
    view = null;
    document.removeEventListener("keydown", onKey);
  }

  new MutationObserver(function (records) {
    records.forEach(function (r) {
      r.addedNodes.forEach(function (n) {
        if (n.classList && n.classList.contains("glightbox-container")) open(n);
      });
      r.removedNodes.forEach(function (n) {
        if (n.classList && n.classList.contains("glightbox-container")) close();
      });
    });
  }).observe(document.body, { childList: true });
})();
