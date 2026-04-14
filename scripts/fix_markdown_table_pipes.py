#!/usr/bin/env python3
"""Auto-fix missing trailing pipes in Markdown tables.

markdownlint-cli2 detects MD055 "leading_and_trailing" table-pipe issues, but
it does not currently auto-fix the "missing trailing pipe" case reliably. This
script closes that gap for the repo's autofix workflows.
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

FENCE_RE = re.compile(r"^\s*([`~]{3,})")
SEPARATOR_CELL_RE = re.compile(r":?-{3,}:?")


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(
        description="Fix missing trailing pipes in Markdown tables."
    )
    parser.add_argument("paths", nargs="+", help="Markdown files or directories to fix")
    return parser.parse_args()


def iter_markdown_files(paths: list[str]) -> list[Path]:
    files: list[Path] = []
    for raw_path in paths:
        path = Path(raw_path)
        if path.is_dir():
            files.extend(sorted(candidate for candidate in path.rglob("*.md") if candidate.is_file()))
        elif path.is_file() and path.suffix.lower() == ".md":
            files.append(path)
    return files


def is_header_candidate(line: str) -> bool:
    stripped = line.strip()
    return stripped.startswith("|") and any(char.strip() for char in stripped[1:])


def is_separator_row(line: str) -> bool:
    stripped = line.strip()
    if not stripped.startswith("|"):
        return False

    body = stripped[1:]
    if body.endswith("|"):
        body = body[:-1]

    cells = [cell.strip() for cell in body.split("|")]
    if not cells or any(not cell for cell in cells):
        return False

    return all(SEPARATOR_CELL_RE.fullmatch(cell) for cell in cells)


def is_table_body_row(line: str) -> bool:
    stripped = line.strip()
    return stripped.startswith("|") and stripped != "|"


def ensure_trailing_pipe(line: str) -> str:
    newline = "\n" if line.endswith("\n") else ""
    content = line[:-1] if newline else line
    content = content.rstrip()
    if content.endswith("|"):
        return line
    return f"{content} |{newline}"


def fix_table_pipes(text: str) -> tuple[str, bool]:
    lines = text.splitlines(keepends=True)
    output = list(lines)
    changed = False

    in_fence = False
    fence_marker = ""
    i = 0
    while i < len(lines):
        line = lines[i]
        fence_match = FENCE_RE.match(line)
        if fence_match:
            marker = fence_match.group(1)
            if not in_fence:
                in_fence = True
                fence_marker = marker[0] * len(marker)
            elif marker[0] == fence_marker[0] and len(marker) >= len(fence_marker):
                in_fence = False
                fence_marker = ""
            i += 1
            continue

        if in_fence:
            i += 1
            continue

        if i + 1 >= len(lines):
            i += 1
            continue

        if not is_header_candidate(line) or not is_separator_row(lines[i + 1]):
            i += 1
            continue

        block_end = i + 2
        while block_end < len(lines) and is_table_body_row(lines[block_end]):
            block_end += 1

        for row_index in range(i, block_end):
            fixed_line = ensure_trailing_pipe(output[row_index])
            if fixed_line != output[row_index]:
                output[row_index] = fixed_line
                changed = True

        i = block_end

    return ("".join(output), changed)


def fix_file(path: Path) -> bool:
    original = path.read_text(encoding="utf-8")
    fixed, changed = fix_table_pipes(original)
    if changed:
        path.write_text(fixed, encoding="utf-8")
    return changed


def main() -> int:
    args = parse_args()
    markdown_files = iter_markdown_files(args.paths)
    changed_files = [path for path in markdown_files if fix_file(path)]

    for path in changed_files:
        print(f"Fixed trailing table pipes: {path}")

    if not markdown_files:
        print("No Markdown files found.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
