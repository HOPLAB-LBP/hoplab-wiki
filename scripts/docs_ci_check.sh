#!/usr/bin/env bash
set -euo pipefail

# Runs MkDocs build in strict mode and fails with clear messages
# when common documentation problems are detected.

LOG_FILE="/tmp/mkdocs_build.log"

echo "[docs-ci] mkdocs build --strict …"
mkdocs build --strict | tee "$LOG_FILE"

fail=false

# 1) Files not included in nav
if grep -Fq 'The following pages exist in the docs directory, but are not included in the "nav" configuration' "$LOG_FILE"; then
  echo "\n[ERROR] Some docs exist but are missing from 'nav' in mkdocs.yml." >&2
  echo "        Add them to 'nav' or intentionally exclude them (and silence this check if desired)." >&2
  # Print the block with the missing files
  awk '/The following pages exist in the docs directory, but are not included in the "nav" configuration:/{flag=1;print;next}/^(INFO|WARNING|ERROR|DEBUG)/{flag=0}flag' "$LOG_FILE" >&2 || true
  fail=true
fi

# 2) Placeholder links (e.g., PLACEHOLDER)
if grep -Fq "contains an unrecognized relative link 'PLACEHOLDER'" "$LOG_FILE"; then
  echo "\n[ERROR] Found placeholder links (text 'PLACEHOLDER') left in docs." >&2
  echo "        Replace with a valid relative link or remove the placeholder." >&2
  grep -Fn "contains an unrecognized relative link 'PLACEHOLDER'" "$LOG_FILE" >&2 || true
  fail=true
fi

# 3) Missing anchors (links to non-existent headings)
if grep -Fq "contains a link" "$LOG_FILE" && grep -Fq "but there is no such anchor on this page" "$LOG_FILE"; then
  echo "\n[ERROR] Found links to missing anchors (section headings)." >&2
  echo "        Update the link or add the corresponding heading/anchor." >&2
  grep -F "but there is no such anchor on this page" -n "$LOG_FILE" >&2 || true
  fail=true
fi

if [ "$fail" = true ]; then
  echo "\n[docs-ci] Failing due to problems above." >&2
  exit 1
fi

echo "[docs-ci] No blocking issues detected."
