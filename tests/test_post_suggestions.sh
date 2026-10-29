#!/usr/bin/env bash
# Test suite for scripts/post_suggestions.py (no network: --patches and --dry-run)
# Run from the repo root: bash tests/test_post_suggestions.sh

set -euo pipefail

SCRIPTS="$(pwd)/scripts"
PASS=0
FAIL=0
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

mkdir -p "$WORK/head/docs" "$WORK/fixed/docs"
# Head: edits on lines 3, 5 and 7, three blank lines where one belongs, a tab
# title without its blank line, and an untouched line outside the PR's diff.
printf '%s\n' "# Page" "" "teh first" "" "second   " "" "third	x" "" "" "" "next" "" '=== "Tab"' "    body" "" "outside" \
  > "$WORK/head/docs/page.md"
printf '%s\n' "# Page" "" "the first" "" "second" "" "third x" "" "next" "" '=== "Tab"' "" "    body" "" "outside fixed" \
  > "$WORK/fixed/docs/page.md"
# The PR's diff covers lines 3-14 only (line 16, "outside", is not in it).
python3 - "$WORK" <<'PY'
import json, sys
lines = [f"+{x}" for x in open(f"{sys.argv[1]}/head/docs/page.md").read().splitlines()[2:14]]
json.dump([{"filename": "docs/page.md", "patch": "@@ -2,0 +3,12 @@\n" + "\n".join(lines)}],
          open(f"{sys.argv[1]}/files.json", "w"))
PY

echo "Running post_suggestions tests..."
OUT=$(python3 "$SCRIPTS/post_suggestions.py" --head "$WORK/head" --fixed "$WORK/fixed" \
  --patches "$WORK/files.json" --dry-run)
expect() {
  if grep -qx -- "$2" <<<"$OUT"; then pass "$1"; else fail "$1 (missing: $2)"; fi
}
expect "spelling on its own line" "docs/page.md:3-3"
expect "trailing spaces on their own line" "docs/page.md:5-5"
expect "tab on its own line" "docs/page.md:7-7"
expect "extra blank lines deleted on their own" "docs/page.md:9-10"
expect "inserted blank line joins the tab title" "docs/page.md:13-13"
if grep -q "docs/page.md:16" <<<"$OUT"; then fail "line outside the PR diff skipped"; else pass "line outside the PR diff skipped"; fi
expect "count" "5 suggestion(s) (dry run)."

# Applying all suggestions gives the fixed file (except the line outside the diff);
# each one alone changes only its own lines.
python3 - "$WORK" "$SCRIPTS" <<'PY' && pass "batch result and single suggestions" || fail "batch result and single suggestions"
import json, sys
from pathlib import Path
sys.path.insert(0, sys.argv[2])
import post_suggestions as P
w = Path(sys.argv[1])
sug = P.build(w / "head", w / "fixed", json.load(open(w / "files.json")))
head = (w / "head/docs/page.md").read_text().splitlines()
fixed = (w / "fixed/docs/page.md").read_text().splitlines()
lines = list(head)
for s in sorted(sug, key=lambda s: -s["start_line"]):
    lines[s["start_line"] - 1:s["line"]] = s["new"]
assert lines[:-1] == fixed[:-1] and lines[-1] == "outside", lines
for s in sug:
    one = list(head)
    one[s["start_line"] - 1:s["line"]] = s["new"]
    assert one[:s["start_line"] - 1] == head[:s["start_line"] - 1]
    assert one[len(one) - (len(head) - s["line"]):] == head[s["line"]:]
PY

# Nothing fixed: nothing posted.
mkdir -p "$WORK/empty"
if grep -q "Nothing to suggest." <<<"$(python3 "$SCRIPTS/post_suggestions.py" --head "$WORK/head" --fixed "$WORK/empty" --patches "$WORK/files.json" --dry-run)"; then
  pass "no fixes, no suggestions"
else
  fail "no fixes, no suggestions"
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
