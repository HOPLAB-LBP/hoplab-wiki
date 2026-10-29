#!/usr/bin/env bash
# Test suite for scripts/fix_links.py
# Run from the repo root: bash tests/test_fix_links.sh

set -euo pipefail

SCRIPT="$(pwd)/scripts/fix_links.py"
PASS=0
FAIL=0
WORK=$(mktemp -d)
trap 'rm -rf "$WORK"' EXIT

pass() { echo "  PASS: $1"; PASS=$((PASS + 1)); }
fail() { echo "  FAIL: $1"; FAIL=$((FAIL + 1)); }

# A small wiki: two sections, an image, README as the source of contribute.md.
mkdir -p "$WORK/docs/guide" "$WORK/docs/research/tms" "$WORK/docs/assets"
cat > "$WORK/README.md" <<'EOF'
# Quick start

## Easy workflow
EOF
cp "$WORK/README.md" "$WORK/docs/contribute.md"
cat > "$WORK/docs/guide/admins.md" <<'EOF'
# Admins

## Review and merge a pull request

## Notes

## Notes

## Custom {#custom-id}
EOF
printf '# Safety\n' > "$WORK/docs/research/tms/tms-safety.md"
printf '# Other safety\n' > "$WORK/docs/guide/other-safety.md"
printf 'png' > "$WORK/docs/assets/pic.png"
cat > "$WORK/docs/guide/page.md" <<'EOF'
# Page

## Formatting

A [absolute](/guide/admins.md) link.
A [moved](tms-safety.md) page.
A [typo](adminss.md) page.
An [anchor typo](admins.md#review-and-merge-a-pull-requets) link.
A [second heading](admins.md#notes_1) link.
An [explicit id](admins.md#custom-id) link.
An [own anchor](#formating) typo.
An ![absolute image](/assets/pic.png).
A [nowhere](no-such-page-at-all.md) link.
A [web](https://example.org/x.md) link.
A [mail](mailto:someone@example.org) link.
A [quick start](../contribute.md#easy-workflow) link.
Inline `[code](/guide/admins.md)` stays.

```markdown
[fenced](/guide/admins.md)
```
EOF
cp "$WORK/docs/guide/page.md" "$WORK/page.orig"

echo "Running fix_links tests..."
cd "$WORK"

# 1. The dry run lists the fixes and changes nothing.
OUT=$(python3 "$SCRIPT" docs/)
if cmp -s docs/guide/page.md page.orig && grep -q "6 link(s) to fix." <<<"$OUT"; then
  pass "dry run lists 6 fixes and changes nothing"
else
  fail "dry run"; echo "$OUT"
fi

# 2. --fix applies exactly the expected changes.
python3 "$SCRIPT" --fix docs/ > /dev/null
check() {
  if grep -qF -- "$2" docs/guide/page.md; then pass "$1"; else fail "$1 (missing: $2)"; fi
}
check "absolute link made relative" "[absolute](admins.md)"
check "moved page found by file name" "[moved](../research/tms/tms-safety.md)"
check "file name typo fixed" "[typo](admins.md)"
check "anchor typo fixed" "admins.md#review-and-merge-a-pull-request)"
check "duplicate heading anchor kept" "admins.md#notes_1)"
check "explicit heading id kept" "admins.md#custom-id)"
check "own anchor typo fixed" "[own anchor](#formatting)"
check "absolute image made relative" "![absolute image](../assets/pic.png)"
check "no candidate: left as is" "[nowhere](no-such-page-at-all.md)"
check "web link left as is" "[web](https://example.org/x.md)"
check "mail link left as is" "[mail](mailto:someone@example.org)"
check "contribute.md anchor read from README" "[quick start](../contribute.md#easy-workflow)"
check "inline code left as is" '`[code](/guide/admins.md)`'
check "fenced code left as is" "[fenced](/guide/admins.md)"

# 3. Two equally close anchors: no guess.
printf '# Twins\n\n## Data one\n\n## Data two\n' > docs/guide/twins.md
printf '# T\n\n[x](twins.md#data-thre)\n' > docs/guide/twin-link.md
python3 "$SCRIPT" --fix docs/guide/twin-link.md > /dev/null
check2() { if grep -qF -- "$2" "$3"; then pass "$1"; else fail "$1"; fi; }
check2 "ambiguous anchor left as is" "[x](twins.md#data-thre)" docs/guide/twin-link.md

# 4. A second run finds nothing more.
if grep -q "^0 link(s) to fix." <<<"$(python3 "$SCRIPT" docs/)"; then
  pass "second run finds nothing"
else
  fail "second run"
fi

echo ""
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ]
