#!/usr/bin/env python3
"""Lint markdown files for MkDocs Material syntax issues.

Catches problems that cause silent rendering failures — tabs not rendering,
admonition content falling outside its container, code blocks breaking — none
of which are detected by mkdocs build --strict or markdownlint.

Usage:
    python scripts/check_mkdocs_syntax.py docs/           # check mode (exit 1 on issues)
    python scripts/check_mkdocs_syntax.py --fix docs/      # auto-fix what we can
    python scripts/check_mkdocs_syntax.py file1.md file2.md  # check specific files
"""

from __future__ import annotations

import argparse
import re
import sys
from pathlib import Path

# Smart/curly DOUBLE quotes that break === and !!! syntax delimiters.
# We only care about double quotes — smart single quotes (apostrophes like
# \u2019 in "doesn't") are harmless inside title text and should NOT be flagged.
SMART_DOUBLE_QUOTES = {
    "\u201c": '"',  # left double quotation mark
    "\u201d": '"',  # right double quotation mark
    "\u201e": '"',  # double low-9 quotation mark
    "\u201f": '"',  # double high-reversed-9 quotation mark
}

SMART_DOUBLE_QUOTE_PATTERN = re.compile(
    "|".join(re.escape(c) for c in SMART_DOUBLE_QUOTES)
)

# Patterns
TAB_HEADER = re.compile(r"^(\s*)===\s+.")  # === "Tab Title" at any indent
ADMONITION_HEADER = re.compile(r"^(\s*)(!{3}|\?{3}\+?)\s+\w+")  # !!! note or ??? note
FENCE_OPEN = re.compile(r"^(\s*)(`{3,}|~{3,})")  # opening code fence
HTML_COMMENT_OPEN = re.compile(r"<!--")
HTML_COMMENT_CLOSE = re.compile(r"-->")


class Issue:
    def __init__(self, filepath: str, line: int, message: str, fixable: bool = False):
        self.filepath = filepath
        self.line = line
        self.message = message
        self.fixable = fixable

    def __str__(self):
        tag = " [auto-fixable]" if self.fixable else ""
        return f"{self.filepath}:{self.line}: {self.message}{tag}"


def _reindent_block(lines: list[str], start: int, base_indent: str, delta: int) -> None:
    """Re-indent a content block by adding *delta* spaces to each line.

    Walks forward from *start* until hitting a line at or below *base_indent*
    level (the indent of the ``===`` or ``!!!`` header). Blank lines are
    left untouched; non-blank lines get *delta* spaces prepended.

    The first content line may itself be under-indented to the same column as
    the header. In that case it still belongs to the block and must be fixed
    before the usual block-boundary rule applies. While walking the block, we
    also track fenced code blocks so we do not accidentally treat structure-like
    lines inside code as new block boundaries.
    """
    base_len = len(base_indent)
    pad = " " * delta
    j = start
    seen_content = False
    in_fence = False
    fence_marker = ""
    fence_min_len = 0
    while j < len(lines):
        ln = lines[j]
        stripped = ln.lstrip()

        # Blank lines belong to the block — skip without modifying
        if not ln.strip():
            j += 1
            continue

        cur_indent = len(ln) - len(stripped)
        fence_match = FENCE_OPEN.match(ln)

        if in_fence:
            lines[j] = pad + ln
            if (
                fence_match
                and stripped.startswith(fence_marker * fence_min_len)
                and len(stripped.rstrip()) <= fence_min_len + 1
            ):
                in_fence = False
            seen_content = True
            j += 1
            continue

        # Once we've already seen block content, a line at the base indent
        # level (or less) means the block ended. The first content line may
        # still belong to the block even if it is under-indented.
        if seen_content and cur_indent <= base_len:
            break
        if cur_indent < base_len:
            break

        lines[j] = pad + ln
        seen_content = True
        if fence_match:
            fence_marker = fence_match.group(2)[0]
            fence_min_len = len(fence_match.group(2))
            in_fence = True
        j += 1


def check_file(filepath: Path, fix: bool = False) -> list[Issue]:
    """Check a single markdown file for MkDocs Material syntax issues."""
    try:
        text = filepath.read_text(encoding="utf-8")
    except (OSError, UnicodeDecodeError):
        return []

    lines = text.split("\n")
    issues: list[Issue] = []
    modified = False
    rel = str(filepath)

    # Track code fence state to skip content inside fences
    in_fence = False
    fence_indent = 0
    fence_marker = ""

    # Track HTML comment state to skip === and !!! inside <!-- -->
    in_html_comment = False

    i = 0
    while i < len(lines):
        line = lines[i]

        # ── Track HTML comments ───────────────────────────────
        if not in_fence:
            if in_html_comment:
                if HTML_COMMENT_CLOSE.search(line):
                    in_html_comment = False
                i += 1
                continue
            # Check for comment open (that doesn't close on the same line)
            if HTML_COMMENT_OPEN.search(line):
                if not HTML_COMMENT_CLOSE.search(
                    line[line.index("<!--") + 4:]
                ):
                    in_html_comment = True
                    i += 1
                    continue

        # ── Track fenced code blocks ──────────────────────────
        fence_match = FENCE_OPEN.match(line)
        if fence_match and not in_fence:
            in_fence = True
            fence_indent = len(fence_match.group(1))
            fence_marker = fence_match.group(2)[0]  # ` or ~
            fence_min_len = len(fence_match.group(2))

            # Check 6: code block content at column 0 inside indented fences
            if fence_indent > 0:
                # Look ahead at content lines until closing fence
                j = i + 1
                has_col0_content = False
                while j < len(lines):
                    cl = lines[j]
                    # Check for closing fence
                    stripped = cl.lstrip()
                    if stripped.startswith(fence_marker * fence_min_len) and len(stripped.rstrip()) <= fence_min_len + 1:
                        break
                    # Check if non-empty content line starts at column 0
                    if cl.strip() and not cl.startswith(" "):
                        has_col0_content = True
                        issues.append(Issue(
                            rel, j + 1,
                            f"code block content at column 0 inside indented fence (fence is at col {fence_indent})",
                            fixable=True,
                        ))
                    j += 1

                # Auto-fix: indent all content lines to match fence indent
                if fix and has_col0_content:
                    indent_str = " " * fence_indent
                    j = i + 1
                    while j < len(lines):
                        cl = lines[j]
                        stripped = cl.lstrip()
                        if stripped.startswith(fence_marker * fence_min_len) and len(stripped.rstrip()) <= fence_min_len + 1:
                            break
                        if cl.strip() and not cl.startswith(" " * fence_indent):
                            lines[j] = indent_str + cl
                            modified = True
                        j += 1

            i += 1
            continue

        if in_fence:
            # Check for closing fence
            stripped = line.lstrip()
            if stripped.startswith(fence_marker * 3) and not stripped.lstrip(fence_marker).strip():
                in_fence = False
            i += 1
            continue

        # ── Check 1 & 2: Tab headers ─────────────────────────
        tab_match = TAB_HEADER.match(line)
        if tab_match:
            indent = tab_match.group(1)
            expected_content_indent = indent + "    "  # 4 more spaces

            # Check 1: curly quotes in tab title
            if SMART_DOUBLE_QUOTE_PATTERN.search(line):
                issues.append(Issue(
                    rel, i + 1,
                    "curly/smart quotes in tab title (use straight quotes)",
                    fixable=True,
                ))
                if fix:
                    lines[i] = SMART_DOUBLE_QUOTE_PATTERN.sub(
                        lambda m: SMART_DOUBLE_QUOTES[m.group()], line
                    )
                    modified = True

            # Check 2: missing blank line after tab header
            if i + 1 < len(lines) and lines[i + 1].strip():
                # Next line is not blank — it should be
                issues.append(Issue(
                    rel, i + 1,
                    "missing blank line after tab header (=== ...)",
                    fixable=True,
                ))
                if fix:
                    lines.insert(i + 1, "")
                    modified = True
                    # Skip the inserted line
                    i += 1

            # Check 4: tab content indentation
            # Find the first non-blank content line after the header
            j = i + 1
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip():
                content_line = lines[j]
                if not content_line.startswith(expected_content_indent):
                    actual_indent = len(content_line) - len(content_line.lstrip())
                    expected_len = len(expected_content_indent)
                    if actual_indent < expected_len and content_line.strip():
                        delta = expected_len - actual_indent
                        issues.append(Issue(
                            rel, j + 1,
                            f"tab content indented {actual_indent} space{'s' if actual_indent != 1 else ''}, expected {expected_len}",
                            fixable=True,
                        ))
                        if fix:
                            _reindent_block(lines, j, indent, delta)
                            modified = True

            i += 1
            continue

        # ── Check 3 & 5: Admonition headers ──────────────────
        adm_match = ADMONITION_HEADER.match(line)
        if adm_match:
            indent = adm_match.group(1)
            expected_content_indent = indent + "    "  # 4 more spaces

            # Check 3: curly quotes in admonition title
            if SMART_DOUBLE_QUOTE_PATTERN.search(line):
                issues.append(Issue(
                    rel, i + 1,
                    "curly/smart quotes in admonition title (use straight quotes)",
                    fixable=True,
                ))
                if fix:
                    lines[i] = SMART_DOUBLE_QUOTE_PATTERN.sub(
                        lambda m: SMART_DOUBLE_QUOTES[m.group()], line
                    )
                    modified = True

            # Check 5: admonition content indentation
            # Content should be on the very next line (no blank line required)
            # but must be indented 4 spaces
            j = i + 1
            # Skip blank lines
            while j < len(lines) and not lines[j].strip():
                j += 1
            if j < len(lines) and lines[j].strip():
                content_line = lines[j]
                actual_indent = len(content_line) - len(content_line.lstrip())
                expected_len = len(expected_content_indent)
                # Only flag if content is clearly under-indented and not another
                # block element (another admonition, tab, heading, or hr)
                if (actual_indent < expected_len
                        and content_line.strip()
                        and not TAB_HEADER.match(content_line)
                        and not ADMONITION_HEADER.match(content_line)
                        and not content_line.strip().startswith("#")
                        and not content_line.strip().startswith("---")):
                    delta = expected_len - actual_indent
                    issues.append(Issue(
                        rel, j + 1,
                        f"admonition content indented {actual_indent} space{'s' if actual_indent != 1 else ''}, expected {expected_len}",
                        fixable=True,
                    ))
                    if fix:
                        _reindent_block(lines, j, indent, delta)
                        modified = True

        i += 1

    if fix and modified:
        filepath.write_text("\n".join(lines), encoding="utf-8")

    return issues


def collect_files(paths: list[str]) -> list[Path]:
    """Expand directories to .md files, pass through individual files."""
    result = []
    for p in paths:
        path = Path(p)
        if path.is_dir():
            result.extend(sorted(path.rglob("*.md")))
        elif path.is_file() and path.suffix == ".md":
            result.append(path)
    return result


def main():
    parser = argparse.ArgumentParser(
        description="Check MkDocs Material markdown syntax for common issues"
    )
    parser.add_argument(
        "paths",
        nargs="+",
        help="Files or directories to check",
    )
    parser.add_argument(
        "--fix",
        action="store_true",
        help="Auto-fix issues where possible (curly quotes, missing blank lines, indentation)",
    )
    args = parser.parse_args()

    files = collect_files(args.paths)
    if not files:
        print("No markdown files found.")
        return 0

    all_issues: list[Issue] = []
    for f in files:
        all_issues.extend(check_file(f, fix=args.fix))

    if args.fix:
        fixed = sum(1 for i in all_issues if i.fixable)
        remaining = sum(1 for i in all_issues if not i.fixable)
        if fixed:
            print(f"Fixed {fixed} issue(s).")
        if remaining:
            print(f"{remaining} issue(s) require manual attention:")
            for issue in all_issues:
                if not issue.fixable:
                    print(f"  {issue}")
            return 1
        if not fixed:
            print("No issues found.")
        return 0

    if all_issues:
        for issue in all_issues:
            print(issue)
        fixable = sum(1 for i in all_issues if i.fixable)
        manual = len(all_issues) - fixable
        print(f"\n{len(all_issues)} issue(s) found ({fixable} auto-fixable, {manual} manual).")
        return 1

    print("No issues found.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
