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
if grep -Fq "contains an unrecognized relative link" "$LOG_FILE"; then
  echo "\n[ERROR] Found unrecognized relative links in docs." >&2
  echo "        Fix or remove these links before merging." >&2
  grep -Fn "contains an unrecognized relative link" "$LOG_FILE" >&2 || true
  fail=true
fi

# 3) Missing anchors (links to non-existent headings)
if grep -Fq "but there is no such anchor on this page" "$LOG_FILE"; then
  echo "\n[ERROR] Found links to missing anchors (section headings)." >&2
  echo "        Update the link or add the corresponding heading/anchor." >&2
  grep -Fn "but there is no such anchor on this page" "$LOG_FILE" >&2 || true
  fail=true
fi

if [ $build_status -ne 0 ] || [ "$fail" = true ]; then
  echo "\n[docs-ci] Failing due to problems above (build_status=$build_status)." >&2
  exit 1
fi

echo "[docs-ci] No blocking issues detected."
