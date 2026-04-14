#!/usr/bin/env bash
set -euo pipefail

# Keep docs/contribute.md generated from README.md for CI/build/deploy without
# relying on workflow push-back commits.
cp README.md docs/contribute.md
