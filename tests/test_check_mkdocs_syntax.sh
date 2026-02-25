#!/usr/bin/env bash
# Test suite for scripts/check_mkdocs_syntax.py
# Run from the repo root: bash tests/test_check_mkdocs_syntax.sh

set -euo pipefail

SCRIPT="scripts/check_mkdocs_syntax.py"
FIXTURES="tests/fixtures"
PASS=0
FAIL=0

run_test() {
  local name="$1"
  local expected_exit="$2"
  shift 2
  local actual_exit=0
  "$@" > /dev/null 2>&1 || actual_exit=$?
  if [ "$actual_exit" -eq "$expected_exit" ]; then
    echo "  PASS: $name"
    PASS=$((PASS + 1))
  else
    echo "  FAIL: $name (expected exit $expected_exit, got $actual_exit)"
    FAIL=$((FAIL + 1))
  fi
}

echo "Running check_mkdocs_syntax.py tests..."
echo

# ── Good fixtures should pass (exit 0) ──
echo "Good fixtures (should pass):"
run_test "valid syntax" 0 python3 "$SCRIPT" "$FIXTURES/mkdocs_syntax_good.md"

# ── Bad fixtures should fail (exit 1) ──
echo "Bad fixtures (should fail):"
run_test "missing blank lines, bad indent" 1 python3 "$SCRIPT" "$FIXTURES/mkdocs_syntax_bad.md"
run_test "curly quotes" 1 python3 "$SCRIPT" "$FIXTURES/mkdocs_syntax_bad_quotes.md"

# ── Fix mode on bad fixtures ──
echo "Fix mode:"
TMPDIR=$(mktemp -d)
cp "$FIXTURES/mkdocs_syntax_bad.md" "$TMPDIR/fixable.md"
cp "$FIXTURES/mkdocs_syntax_bad_quotes.md" "$TMPDIR/fixable_quotes.md"

# Fix mode should still exit 1 (manual issues remain in bad.md)
run_test "fix mode with manual issues remaining" 1 python3 "$SCRIPT" --fix "$TMPDIR/fixable.md"
# Fix mode on curly quotes should exit 0 (all issues are auto-fixable)
run_test "fix mode on curly quotes (all fixable)" 0 python3 "$SCRIPT" --fix "$TMPDIR/fixable_quotes.md"
# Re-running on fixed curly quotes should pass
run_test "re-check fixed curly quotes" 0 python3 "$SCRIPT" "$TMPDIR/fixable_quotes.md"

# ── Fix mode should not modify clean files ──
cp "$FIXTURES/mkdocs_syntax_good.md" "$TMPDIR/clean.md"
python3 "$SCRIPT" --fix "$TMPDIR/clean.md" > /dev/null 2>&1
if diff -q "$FIXTURES/mkdocs_syntax_good.md" "$TMPDIR/clean.md" > /dev/null 2>&1; then
  echo "  PASS: fix mode does not modify clean files"
  PASS=$((PASS + 1))
else
  echo "  FAIL: fix mode modified a clean file"
  FAIL=$((FAIL + 1))
fi

# ── Empty/nonexistent paths ──
echo "Edge cases:"
EMPTYDIR=$(mktemp -d)
run_test "no .md files in empty dir" 0 python3 "$SCRIPT" "$EMPTYDIR"
rm -rf "$EMPTYDIR"

rm -rf "$TMPDIR"

# ── Summary ──
echo
echo "Results: $PASS passed, $FAIL failed"
[ "$FAIL" -eq 0 ] && exit 0 || exit 1
