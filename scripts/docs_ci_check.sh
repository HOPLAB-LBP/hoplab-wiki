#!/usr/bin/env bash
set -euo pipefail

# Runs MkDocs build in strict mode and fails with clear messages
# when documentation problems are detected. Any WARNING from MkDocs
# is considered a failure in PRs.

LOG_FILE="/tmp/mkdocs_build.log"

echo "[docs-ci] mkdocs build --strict …"
set +e
mkdocs build --strict 2>&1 | tee "$LOG_FILE"
build_status=${PIPESTATUS[0]}
set -e

fail=false

has_pattern() {
  grep -Eq "$1" "$LOG_FILE"
}

print_matching_lines() {
  grep -En "$1" "$LOG_FILE" >&2 || true
}

# 0) Any WARNING lines from MkDocs should fail the check
if grep -Eq '^WARNING -' "$LOG_FILE"; then
  echo "\n[ERROR] MkDocs emitted WARNINGs; treat as failure for PRs." >&2
  echo "-------- Warnings --------" >&2
  grep -En '^WARNING -.*' "$LOG_FILE" >&2 || true
  echo "--------------------------" >&2
  fail=true
fi

# 1) Files not included in nav
if grep -Fq 'The following pages exist in the docs directory, but are not included in the "nav" configuration' "$LOG_FILE"; then
  echo "\n[ERROR] Some docs exist but are missing from 'nav' in mkdocs.yml." >&2
  echo "        Add them to 'nav' or intentionally exclude them (and silence this check if desired)." >&2
  # Print the block with the missing files
  awk '/The following pages exist in the docs directory, but are not included in the "nav" configuration:/{flag=1;print;next}/^(INFO|WARNING|ERROR|DEBUG)/{flag=0}flag' "$LOG_FILE" >&2 || true
  fail=true
fi

# 2) Unrecognized relative links (general)
if has_pattern "contains an unrecognized relative link|contains a link '.*', but the target '.*' is not found among documentation files|target not found"; then
  echo "\n[ERROR] Found broken documentation links." >&2
  echo "        MkDocs could not resolve one or more linked pages from the source file." >&2
  echo "        Fix the path so it resolves from the page being built, or use the published-site URL." >&2
  if has_pattern "Doc( file)? 'docs/contribute\\.md'"; then
    echo "        Note: docs/contribute.md is synced from README.md, so fix README.md instead." >&2
    echo "        In that file, repo-root paths like 'docs/...' usually fail after sync; prefer a docs-relative path or the full site URL." >&2
  fi
  print_matching_lines "contains an unrecognized relative link|contains a link '.*', but the target '.*' is not found among documentation files|target not found"
  fail=true
fi

# 3) Missing anchors (links to non-existent headings)
if has_pattern "but there is no such anchor on this page|does not contain an anchor"; then
  echo "\n[ERROR] Found links to missing anchors (section headings)." >&2
  echo "        Update the '#anchor' fragment to match the rendered heading slug, or add the missing heading." >&2
  if has_pattern "Doc( file)? 'docs/contribute\\.md'"; then
    echo "        Note: if the warning points at docs/contribute.md, edit README.md because contribute.md is generated from it." >&2
  fi
  print_matching_lines "but there is no such anchor on this page|does not contain an anchor"
  fail=true
fi

if [ $build_status -ne 0 ] || [ "$fail" = true ]; then
  echo "\n[docs-ci] Failing due to problems above (build_status=$build_status)." >&2
  exit 1
fi

echo "[docs-ci] No blocking issues detected."
