/*
  Page footer: the last update in the reader's own time zone.

  The template (overrides/partials/source-file.html) prints the commit date and puts
  the exact commit time, with its UTC offset, in <time datetime="...">. Here it becomes
  date and time in the browser's time zone, e.g. "3 Oct 2026, 11:42 CEST".
  Without JavaScript the date from the build stays.

  Material's instant navigation swaps pages without a new DOMContentLoaded, so this
  runs inside document$.subscribe().
*/

document$.subscribe(function () {
  const format = new Intl.DateTimeFormat("en-GB", {
    day: "numeric", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit", timeZoneName: "short"
  });
  document.querySelectorAll("time.md-source-file__time[datetime]").forEach(function (el) {
    const when = new Date(el.getAttribute("datetime"));
    if (isNaN(when)) return;
    el.textContent = format.format(when);
    el.title = "Last updated, in your time zone";
  });
});
