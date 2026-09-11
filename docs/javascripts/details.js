/*
  Collapsible definition lists: ??? deflist / ??? numlist.

  Collapsing hides content from deep links and from print. These two handlers
  give it back:
    - every entry gets a stable id derived from its term, so
      page.md#term-slug opens that entry;
    - everything expands before printing, so PDFs are complete.

  Material's instant navigation replaces the document without firing
  DOMContentLoaded again, so page setup must run inside document$.subscribe().
*/

function openDetailsFromHash() {
  if (!location.hash) return;
  const target = document.getElementById(decodeURIComponent(location.hash.slice(1)));
  if (!target) return;
  let d = target.closest("details");
  while (d) {
    d.open = true;
    d = d.parentElement && d.parentElement.closest("details");
  }
  target.scrollIntoView();
}

document$.subscribe(function () {
  document.querySelectorAll("details.deflist, details.numlist").forEach(function (d) {
    if (d.id) return;
    const summary = d.querySelector("summary");
    if (!summary) return;
    const base = summary.textContent.trim().toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-");
    /* Never reuse an id a heading or another entry already has: with
       duplicate ids a link only ever resolves to the first element. */
    let id = base;
    for (let n = 2; document.getElementById(id); n++) id = base + "-" + n;
    d.id = id;
  });
  openDetailsFromHash();
});

window.addEventListener("hashchange", openDetailsFromHash);
window.addEventListener("beforeprint", function () {
  document.querySelectorAll("details").forEach(function (d) { d.open = true; });
});
