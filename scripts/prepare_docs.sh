#!/usr/bin/env bash
set -euo pipefail

# Keep docs/contribute.md generated from README.md for CI/build/deploy without
# relying on workflow push-back commits.
#
# README.md sits at the repository root and links to wiki pages with root paths
# (docs/contribute/admins.md), which work on GitHub. The copy sits inside docs/,
# so those links lose their docs/ prefix: ](docs/x.md) becomes ](x.md).
sed 's#](docs/#](#g' README.md > docs/contribute.md
