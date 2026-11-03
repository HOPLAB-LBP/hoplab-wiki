/*
  Yes/no tables: <div class="yn-table" markdown> around a Markdown table.

  Every non-empty cell after the first column gets a marker span:
  exactly "Yes" -> .yn--yes, exactly "No" -> .yn--no, anything else -> .yn--maybe.
  Styles are in stylesheets/extra.css. Material's instant navigation does not
  fire DOMContentLoaded again, so this runs inside document$.subscribe().
*/

document$.subscribe(function () {
  document.querySelectorAll(".yn-table td:not(:first-child)").forEach(function (td) {
    const text = td.textContent.trim();
    if (!text || td.querySelector(".yn")) return;
    const pill = document.createElement("span");
    pill.className = "yn yn--" + (text === "Yes" ? "yes" : text === "No" ? "no" : "maybe");
    while (td.firstChild) pill.appendChild(td.firstChild);
    td.appendChild(pill);
  });
});
