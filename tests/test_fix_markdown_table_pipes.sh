#!/usr/bin/env bash
# Test suite for scripts/fix_markdown_table_pipes.py
# Run from the repo root: bash tests/test_fix_markdown_table_pipes.sh

set -euo pipefail

SCRIPT="scripts/fix_markdown_table_pipes.py"
FIXTURES="tests/fixtures"
PASS=0
FAIL=0

pass() {
  local name="$1"
  echo "  PASS: $name"
  PASS=$((PASS + 1))
}

fail() {
  local name="$1"
  echo "  FAIL: $name"
  FAIL=$((FAIL + 1))
}

echo "Running fix_markdown_table_pipes.py tests..."
echo

TMPDIR=$(mktemp -d)
cp "$FIXTURES/markdown_table_pipe_autofix_bad.md" "$TMPDIR/bad.md"
cp "$FIXTURES/markdown_table_pipe_autofix_expected.md" "$TMPDIR/expected.md"
cp "$FIXTURES/markdown_table_pipe_autofix_expected.md" "$TMPDIR/clean.md"

python3 "$SCRIPT" "$TMPDIR/bad.md" > /dev/null 2>&1
if diff -u "$TMPDIR/expected.md" "$TMPDIR/bad.md" > /dev/null 2>&1; then
  pass "fixes missing trailing pipes in normal and indented tables"
else
  fail "fixes missing trailing pipes in normal and indented tables"
fi

python3 "$SCRIPT" "$TMPDIR/bad.md" > /dev/null 2>&1
if diff -u "$TMPDIR/expected.md" "$TMPDIR/bad.md" > /dev/null 2>&1; then
  pass "is idempotent on already-fixed tables"
else
  fail "is idempotent on already-fixed tables"
fi

if npx -y markdownlint-cli2 --config .markdownlint-cli2.yaml "$TMPDIR/bad.md" > /dev/null 2>&1; then
  pass "fixed output passes markdownlint"
else
  fail "fixed output passes markdownlint"
fi

python3 "$SCRIPT" "$TMPDIR/clean.md" > /dev/null 2>&1
if diff -u "$FIXTURES/markdown_table_pipe_autofix_expected.md" "$TMPDIR/clean.md" > /dev/null 2>&1; then
  pass "does not modify already-clean files"
else
  fail "does not modify already-clean files"
fi

EMPTYDIR=$(mktemp -d)
if python3 "$SCRIPT" "$EMPTYDIR" > /dev/null 2>&1; then
  pass "empty directories are handled cleanly"
else
  fail "empty directories are handled cleanly"
fi

printf '| A | B\r\n| --- | ---\r\n| 1 | 2\r\n' > "$TMPDIR/crlf.md"
python3 "$SCRIPT" "$TMPDIR/crlf.md" > /dev/null 2>&1
if python3 - "$TMPDIR/crlf.md" <<'PY' > /dev/null 2>&1
from pathlib import Path
import sys

data = Path(sys.argv[1]).read_bytes()
if b"\r\n" not in data:
    raise SystemExit(1)
if b"\n" in data.replace(b"\r\n", b""):
    raise SystemExit(1)
if b"| 1 | 2 |\r\n" not in data:
    raise SystemExit(1)
PY
then
  pass "preserves CRLF line endings when fixing table rows"
else
  fail "preserves CRLF line endings when fixing table rows"
fi

rm -rf "$EMPTYDIR" "$TMPDIR"

echo
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
