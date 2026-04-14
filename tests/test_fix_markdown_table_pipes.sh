#!/usr/bin/env bash
# Test suite for scripts/fix_markdown_table_pipes.py
# Run from the repo root: bash tests/test_fix_markdown_table_pipes.sh

set -euo pipefail

SCRIPT="scripts/fix_markdown_table_pipes.py"
FIXTURES="tests/fixtures"
PASS=0
FAIL=0
LOGDIR=$(mktemp -d)
TMPDIR=""
EMPTYDIR=""

cleanup() {
  [ -n "$EMPTYDIR" ] && rm -rf "$EMPTYDIR"
  [ -n "$TMPDIR" ] && rm -rf "$TMPDIR"
  rm -rf "$LOGDIR"
}

trap cleanup EXIT

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

run_cmd() {
  local output_file
  output_file=$(mktemp "$LOGDIR/test-output.XXXXXX")
  if "$@" >"$output_file" 2>&1; then
    return 0
  else
    cat "$output_file"
    return 1
  fi
}

assert_files_equal() {
  local name="$1"
  local expected="$2"
  local actual="$3"
  local diff_output
  diff_output=$(mktemp "$LOGDIR/diff-output.XXXXXX")
  if diff -u "$expected" "$actual" >"$diff_output" 2>&1; then
    pass "$name"
  else
    fail "$name"
    cat "$diff_output"
  fi
}

echo "Running fix_markdown_table_pipes.py tests..."
echo

TMPDIR=$(mktemp -d)
cp "$FIXTURES/markdown_table_pipe_autofix_bad.md" "$TMPDIR/bad.md"
cp "$FIXTURES/markdown_table_pipe_autofix_expected.md" "$TMPDIR/expected.md"
cp "$FIXTURES/markdown_table_pipe_autofix_expected.md" "$TMPDIR/clean.md"

if run_cmd python3 "$SCRIPT" "$TMPDIR/bad.md"; then
  assert_files_equal "fixes missing trailing pipes in normal and indented tables" "$TMPDIR/expected.md" "$TMPDIR/bad.md"
else
  fail "fixes missing trailing pipes in normal and indented tables"
fi

if run_cmd python3 "$SCRIPT" "$TMPDIR/bad.md"; then
  assert_files_equal "is idempotent on already-fixed tables" "$TMPDIR/expected.md" "$TMPDIR/bad.md"
else
  fail "is idempotent on already-fixed tables"
fi

if run_cmd npx -y markdownlint-cli2 --config .markdownlint-cli2.yaml "$TMPDIR/bad.md"; then
  pass "fixed output passes markdownlint"
else
  fail "fixed output passes markdownlint"
fi

if run_cmd python3 "$SCRIPT" "$TMPDIR/clean.md"; then
  assert_files_equal "does not modify already-clean files" "$FIXTURES/markdown_table_pipe_autofix_expected.md" "$TMPDIR/clean.md"
else
  fail "does not modify already-clean files"
fi

EMPTYDIR=$(mktemp -d)
if run_cmd python3 "$SCRIPT" "$EMPTYDIR"; then
  pass "empty directories are handled cleanly"
else
  fail "empty directories are handled cleanly"
fi

printf '| A | B\r\n| --- | ---\r\n| 1 | 2\r\n' > "$TMPDIR/crlf.md"
if run_cmd python3 "$SCRIPT" "$TMPDIR/crlf.md" && run_cmd python3 - "$TMPDIR/crlf.md" <<'PY'
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

echo
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
