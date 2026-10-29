#!/usr/bin/env bash
set -euo pipefail

# Runs MkDocs build in strict mode and fails with clear messages
# when documentation problems are detected. Any WARNING from MkDocs
# is considered a failure in PRs.
#
# Builds with mkdocs-ci.yml: mkdocs.yml plus the git-based page footer
# (last update and contributors), the same configuration the deploy uses.

# A private log per run: a fixed path can be shared or unwritable, and a log
# that was never written would make every check below pass.
LOG_FILE=$(mktemp "${TMPDIR:-/tmp}/mkdocs_build.XXXXXX")
trap 'rm -f "$LOG_FILE"' EXIT

echo "[docs-ci] mkdocs build --strict -f mkdocs-ci.yml …"
set +e
mkdocs build --strict -f mkdocs-ci.yml 2>&1 | tee "$LOG_FILE"
statuses=("${PIPESTATUS[@]}")
set -e
build_status=${statuses[0]}
if [ "${statuses[1]}" -ne 0 ] || [ ! -s "$LOG_FILE" ]; then
  echo "[docs-ci] Could not write or read the build log ($LOG_FILE); failing so nothing passes unchecked." >&2
  exit 1
fi

fail=false

has_pattern() {
  grep -Eq "$1" "$LOG_FILE"
}

print_matching_lines() {
  grep -En "$1" "$LOG_FILE" >&2 || true
}

# 0) Any WARNING lines from MkDocs should fail the check
if grep -Eq '^WARNING -' "$LOG_FILE"; then
  echo "[ERROR] MkDocs emitted WARNINGs; treat as failure for PRs." >&2
  echo "-------- Warnings --------" >&2
  grep -En '^WARNING -.*' "$LOG_FILE" >&2 || true
  echo "--------------------------" >&2
  fail=true
fi

# 1) Files not included in nav
if grep -Fq 'The following pages exist in the docs directory, but are not included in the "nav" configuration' "$LOG_FILE"; then
  echo "[ERROR] Some docs exist but are missing from 'nav' in mkdocs.yml." >&2
  echo "        Add them to 'nav' or intentionally exclude them (and silence this check if desired)." >&2
  # Print the block with the missing files
  awk '/The following pages exist in the docs directory, but are not included in the "nav" configuration:/{flag=1;print;next}/^(INFO|WARNING|ERROR|DEBUG)/{flag=0}flag' "$LOG_FILE" >&2 || true
  fail=true
fi

# 2) Unrecognized relative links (general)
if has_pattern "contains an unrecognized relative link|contains a link '.*', but the target ('.*' )?is not found among documentation files|target not found"; then
  echo "[ERROR] Found broken documentation links." >&2
  echo "        MkDocs could not resolve one or more linked pages from the source file." >&2
  echo "        Fix the path (page or image) so it resolves from the page being built, or use the published-site URL." >&2
  if has_pattern "Doc( file)? '(docs/)?contribute\\.md'"; then
    echo "        Note: docs/contribute.md is synced from README.md, so fix README.md instead." >&2
    echo "        In README.md, link to wiki pages with repo-root paths like 'docs/contribute/admins.md': prepare_docs.sh drops the 'docs/' prefix in the copy." >&2
  fi
  print_matching_lines "contains an unrecognized relative link|contains a link '.*', but the target ('.*' )?is not found among documentation files|target not found"
  fail=true
fi

# 3) Missing anchors (links to non-existent headings)
if has_pattern "but there is no such anchor on this page|does not contain an anchor"; then
  echo "[ERROR] Found links to missing anchors (section headings)." >&2
  echo "        Update the '#anchor' fragment to match the rendered heading slug, or add the missing heading." >&2
  if has_pattern "Doc( file)? '(docs/)?contribute\\.md'"; then
    echo "        Note: if the warning points at docs/contribute.md, edit README.md because contribute.md is generated from it." >&2
  fi
  print_matching_lines "but there is no such anchor on this page|does not contain an anchor"
  fail=true
fi

if [ $build_status -ne 0 ] || [ "$fail" = true ]; then
  echo "[docs-ci] Failing due to problems above (build_status=$build_status)." >&2
  exit 1
fi

echo "[docs-ci] No blocking issues detected."
