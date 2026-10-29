#!/usr/bin/env python3
"""Find and fix links that break the MkDocs build, when the fix is clear.

The strict build fails on three kinds of link mistakes that a contributor can
fix in one click once someone names the right target:

- a link that starts with "/" (it points at the root of hoplab-lbp.github.io,
  not at the wiki), when the file exists under docs/;
- a link to a page that does not exist, when exactly one page has that file
  name (the page moved) or a very similar one (a typo);
- a link to a heading that does not exist, when exactly one heading on the
  target page has a very similar anchor.

Without --fix it only lists what it would change. With --fix it rewrites the
files; the PR workflow posts that difference as review suggestions. Nothing is
changed when there is no single good candidate: the build report then explains
the broken link as before.
"""

from __future__ import annotations

import argparse
import difflib
import os
import re
import sys
import unicodedata
from pathlib import Path

DOCS = Path("docs")
FENCE_RE = re.compile(r"^\s*([`~]{3,})")
# [text](target) and ![alt](target), with an optional "title"; the target has no spaces.
LINK_RE = re.compile(r"(!?\[[^\]\n]*\]\()([^)\s]+)((?:\s+\"[^\"\n]*\")?\))")
HEADING_RE = re.compile(r"^#{1,6}\s+(.+?)\s*#*\s*$")
EXPLICIT_ID_RE = re.compile(r"\{[^}]*#([\w-]+)[^}]*\}\s*$")
INLINE_CODE_RE = re.compile(r"`[^`\n]+`")
SCHEME_RE = re.compile(r"^[a-zA-Z][a-zA-Z0-9+.-]*:")
CLOSE = 0.8


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Fix links that break the MkDocs build.")
    parser.add_argument("--fix", action="store_true", help="rewrite the files")
    parser.add_argument("paths", nargs="+", help="Markdown files or directories under docs/")
    return parser.parse_args()


def slugify(value: str) -> str:
    """Python-Markdown's default toc slug, which this wiki uses for headings."""
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode("ascii")
    value = re.sub(r"[^\w\s-]", "", value).strip().lower()
    return re.sub(r"[-\s]+", "-", value)


def heading_text(raw: str) -> str:
    raw = EXPLICIT_ID_RE.sub("", raw)
    raw = re.sub(r"!?\[([^\]]*)\]\([^)]*\)", r"\1", raw)
    raw = re.sub(r"<[^>]+>", "", raw)
    return raw.replace("`", "").replace("*", "").replace("_", " ").strip()


def outside_fences(lines: list[str]):
    """Yield (index, line) for lines that are not inside fenced code."""
    fence = None
    for i, line in enumerate(lines):
        match = FENCE_RE.match(line)
        if match:
            marker = match.group(1)
            if fence is None:
                fence = marker
                continue
            if marker[0] == fence[0] and len(marker) >= len(fence):
                fence = None
                continue
        if fence is None:
            yield i, line


def anchors(page: Path, cache: dict[Path, set[str]]) -> set[str]:
    # docs/contribute.md is generated from README.md at build time.
    if page.resolve() == (DOCS / "contribute.md").resolve() and Path("README.md").is_file():
        page = Path("README.md")
    if page not in cache:
        found: set[str] = set()
        counts: dict[str, int] = {}
        lines = page.read_text(encoding="utf-8", errors="replace").splitlines()
        for _, line in outside_fences(lines):
            explicit = EXPLICIT_ID_RE.search(line)
            if explicit:
                found.add(explicit.group(1))
            heading = HEADING_RE.match(line)
            if heading and not explicit:
                slug = slugify(heading_text(heading.group(1)))
                n = counts.get(slug, 0)
                counts[slug] = n + 1
                found.add(slug if n == 0 else f"{slug}_{n}")
        cache[page] = found
    return cache[page]


def unique_close(word: str, options: list[str]) -> str | None:
    matches = difflib.get_close_matches(word, options, n=2, cutoff=CLOSE)
    if len(matches) == 1:
        return matches[0]
    if len(matches) == 2:
        # Take the best only when it is clearly better than the next one.
        a, b = (difflib.SequenceMatcher(None, word, m).ratio() for m in matches)
        if a - b >= 0.1:
            return matches[0]
    return None


def relative(target: Path, page: Path) -> str:
    return Path(os.path.relpath(target, page.parent)).as_posix()


def fix_target(target: str, page: Path, all_files: list[Path], cache: dict[Path, set[str]]) -> str | None:
    if SCHEME_RE.match(target) or target.startswith("//"):
        return None
    path_part, sep, anchor = target.partition("#")
    path_part = path_part.split("?", 1)[0]

    # The file the link points at, or None when it is a link within the page.
    if not path_part:
        dest = page
        new_path = ""
    else:
        if path_part.startswith("/"):
            dest = (DOCS / path_part.lstrip("/")).resolve()
            new_path = relative(dest, page.resolve()) if dest.is_file() else None
            if new_path is None:
                return None
        else:
            dest = (page.parent / path_part).resolve()
            new_path = path_part
        if not dest.is_file():
            if path_part.startswith("/"):
                return None
            # Moved page: one file with the same name; typo: one very similar name.
            name = Path(path_part).name
            same = [f for f in all_files if f.name == name]
            if len(same) != 1:
                close = unique_close(name, sorted({f.name for f in all_files}))
                same = [f for f in all_files if f.name == close] if close else []
            if len(same) != 1:
                return None
            dest = same[0].resolve()
            new_path = relative(dest, page.resolve())

    new_anchor = anchor
    if sep and anchor and dest.suffix == ".md" and dest.is_file():
        known = anchors(dest, cache)
        if anchor not in known:
            close = unique_close(anchor, sorted(known))
            if close is None and new_path == path_part:
                return None
            new_anchor = close or anchor

    fixed = new_path + (f"#{new_anchor}" if sep else "")
    return fixed if fixed != target else None


def process(page: Path, all_files: list[Path], cache: dict[Path, set[str]], write: bool) -> int:
    lines = page.read_text(encoding="utf-8", errors="replace").splitlines(keepends=True)
    changes = 0
    for i, line in outside_fences(lines):
        code_spans = [m.span() for m in INLINE_CODE_RE.finditer(line)]

        def replace(match: re.Match) -> str:
            nonlocal changes
            if any(a <= match.start() < b for a, b in code_spans):
                return match.group(0)
            new = fix_target(match.group(2), page, all_files, cache)
            if new is None:
                return match.group(0)
            changes += 1
            print(f"{page}:{i + 1}: link '{match.group(2)}' -> '{new}'")
            return match.group(1) + new + match.group(3)

        lines[i] = LINK_RE.sub(replace, line)
    if write and changes:
        page.write_text("".join(lines), encoding="utf-8")
    return changes


def main() -> int:
    args = parse_args()
    if not DOCS.is_dir():
        print("Run from the repository root (docs/ not found).", file=sys.stderr)
        return 2
    all_files = sorted(p for p in DOCS.rglob("*") if p.is_file())
    pages: list[Path] = []
    for raw in args.paths:
        path = Path(raw)
        if path.is_dir():
            pages.extend(sorted(path.rglob("*.md")))
        elif path.suffix == ".md":
            pages.append(path)
    # docs/contribute.md is generated from README.md; README uses repo-root links.
    pages = [p for p in pages if p.is_file() and DOCS in p.parents and p != DOCS / "contribute.md"]
    cache: dict[Path, set[str]] = {}
    total = sum(process(p, all_files, cache, args.fix) for p in pages)
    print(f"{total} link(s) {'fixed' if args.fix else 'to fix'}.")
    return 0


if __name__ == "__main__":
    sys.exit(main())
