#!/usr/bin/env python3
"""Post the bot's fixes on a pull request as one-click review suggestions.

Input: two folders with the same relative paths, the pull request's head
and the files as the bot would fix them (only the changed ones). Each file is
compared line by line; lines that differ only in spaces or quotes are paired as
the same line, so every edit gets its own suggestion covering exactly the lines
it changes. Each suggestion can then be applied on its own, in any order.
Lines that are only added are attached to the line above them.

GitHub accepts suggestions only on lines that are part of the pull request's
diff; edits elsewhere are skipped. Suggestions already posted by an earlier
run are not posted again.

Usage:
  post_suggestions.py --head DIR --fixed DIR --repo OWNER/REPO --pr N --sha HEAD_SHA
  post_suggestions.py --head DIR --fixed DIR --patches files.json --dry-run
The token comes from GITHUB_TOKEN. Standard library only.
"""

from __future__ import annotations

import argparse
import difflib
import json
import os
import re
import sys
import urllib.request
from pathlib import Path

HUNK_RE = re.compile(r"^@@ -(\d+)(?:,(\d+))? \+(\d+)(?:,(\d+))? @@")
MARK = "<!-- bot-fix-suggestion -->"
MAX_COMMENTS = 50
QUOTES = str.maketrans({"\u201c": '"', "\u201d": '"', "\u2018": "'", "\u2019": "'"})


def key(line: str) -> str:
    """What a fix does not change: the words, not the spacing or the quotes."""
    return " ".join(line.translate(QUOTES).split())


def edits(head: list[str], fixed: list[str]) -> list[dict]:
    """Edits as {start, end, new}: head lines start..end (1-based) become `new`.

    A pure insertion has end = start - 1 (nothing replaced before line start).
    """
    out: list[dict] = []
    matcher = difflib.SequenceMatcher(None, [key(x) for x in head], [key(x) for x in fixed], autojunk=False)
    for tag, i1, i2, j1, j2 in matcher.get_opcodes():
        if tag == "equal":
            for i, j in zip(range(i1, i2), range(j1, j2)):
                if head[i] != fixed[j]:
                    out.append({"start": i + 1, "end": i + 1, "new": [fixed[j]]})
        elif tag == "replace" and i2 - i1 == j2 - j1:
            for i, j in zip(range(i1, i2), range(j1, j2)):
                out.append({"start": i + 1, "end": i + 1, "new": [fixed[j]]})
        else:
            out.append({"start": i1 + 1, "end": i2, "new": fixed[j1:j2]})
    return out


def to_suggestions(path: str, head: list[str], fixed: list[str]) -> list[dict]:
    """Suggestions {path, start_line, line, new}; insertions join the line above."""
    result: list[dict] = []
    for e in edits(head, fixed):
        if e["end"] < e["start"]:
            # Insertion before head line `start`: attach to the line above.
            above = e["start"] - 1
            if result and result[-1]["line"] == above:
                result[-1]["new"] = result[-1]["new"] + e["new"]
                continue
            if above >= 1:
                result.append({"path": path, "start_line": above, "line": above, "new": [head[above - 1]] + e["new"]})
            elif head:
                result.append({"path": path, "start_line": 1, "line": 1, "new": e["new"] + [head[0]]})
            continue
        result.append({"path": path, "start_line": e["start"], "line": e["end"], "new": e["new"]})
    for s in result:
        text = "\n".join(s["new"])
        s["body"] = f"{MARK}\nThe bot can fix this:\n\n```suggestion\n{text}{chr(10) if s['new'] else ''}```\n"
    return result


def commentable_lines(files: list[dict]) -> dict[str, set[int]]:
    """Head-side line numbers inside each file's diff hunks (where GitHub allows comments)."""
    lines: dict[str, set[int]] = {}
    for f in files:
        patch = f.get("patch") or ""
        allowed: set[int] = set()
        new_line = None
        for row in patch.splitlines():
            match = HUNK_RE.match(row)
            if match:
                new_line = int(match.group(3))
                continue
            if new_line is None or row.startswith("\\"):
                continue
            if row.startswith("-"):
                continue
            allowed.add(new_line)
            new_line += 1
        lines[f["filename"]] = allowed
    return lines


def build(head_dir: Path, fixed_dir: Path, files: list[dict]) -> list[dict]:
    allowed = commentable_lines(files)
    out = []
    root = fixed_dir.resolve()
    for fixed_file in sorted(p for p in fixed_dir.rglob("*") if p.is_file()):
        real = fixed_file.resolve()
        if root not in real.parents:
            continue
        rel = real.relative_to(root).as_posix()
        head_file = head_dir / rel
        if not head_file.is_file():
            continue
        head = head_file.read_text(encoding="utf-8", errors="replace").splitlines()
        fixed = real.read_text(encoding="utf-8", errors="replace").splitlines()
        for sug in to_suggestions(rel, head, fixed):
            span = set(range(sug["start_line"], sug["line"] + 1))
            if span <= allowed.get(rel, set()):
                out.append(sug)
    return out


def api(method: str, url: str, token: str, data: dict | None = None):
    req = urllib.request.Request(url, method=method, data=json.dumps(data).encode() if data else None)
    req.add_header("Authorization", f"Bearer {token}")
    req.add_header("Accept", "application/vnd.github+json")
    with urllib.request.urlopen(req, timeout=60) as resp:
        return json.loads(resp.read().decode() or "null")


def paged(url: str, token: str) -> list[dict]:
    items, page = [], 1
    while True:
        batch = api("GET", f"{url}{'&' if '?' in url else '?'}per_page=100&page={page}", token)
        items.extend(batch)
        if len(batch) < 100:
            return items
        page += 1


def main() -> int:
    parser = argparse.ArgumentParser(description="Post the bot's fixes as review suggestions.")
    parser.add_argument("--head", required=True, help="checkout of the PR head")
    parser.add_argument("--fixed", required=True, help="the fixed versions of the changed files")
    parser.add_argument("--repo")
    parser.add_argument("--pr", type=int)
    parser.add_argument("--sha")
    parser.add_argument("--patches", help="JSON list of PR files (instead of the API), for tests")
    parser.add_argument("--dry-run", action="store_true")
    args = parser.parse_args()

    fixed_dir = Path(args.fixed)
    if not fixed_dir.is_dir() or not any(p.is_file() for p in fixed_dir.rglob("*")):
        print("Nothing to suggest.")
        return 0

    token = os.environ.get("GITHUB_TOKEN", "")
    base = f"https://api.github.com/repos/{args.repo}" if args.repo else ""
    if args.patches:
        with open(args.patches, encoding="utf-8") as f:
            files = json.load(f)
    else:
        files = paged(f"{base}/pulls/{args.pr}/files", token)

    suggestions = build(Path(args.head), fixed_dir, files)
    if not args.dry_run and suggestions:
        # Skip what an earlier run already posted on the same lines.
        posted = {(c["path"], c.get("start_line") or c.get("line"), c.get("line"), c["body"])
                  for c in paged(f"{base}/pulls/{args.pr}/comments", token)
                  if c.get("user", {}).get("login") == "github-actions[bot]"}
        suggestions = [s for s in suggestions
                       if (s["path"], s["start_line"], s["line"], s["body"]) not in posted]
    suggestions = suggestions[:MAX_COMMENTS]

    for s in suggestions:
        print(f"{s['path']}:{s['start_line']}-{s['line']}")
    if args.dry_run or not suggestions:
        print(f"{len(suggestions)} suggestion(s){' (dry run)' if args.dry_run else ''}.")
        return 0

    comments = []
    for s in suggestions:
        c = {"path": s["path"], "line": s["line"], "side": "RIGHT", "body": s["body"]}
        if s["start_line"] != s["line"]:
            c.update(start_line=s["start_line"], start_side="RIGHT")
        comments.append(c)
    api("POST", f"{base}/pulls/{args.pr}/reviews", token,
        {"commit_id": args.sha, "event": "COMMENT", "comments": comments,
         "body": "The bot can fix some of the problems in the check report: apply a suggestion with "
                 "**Commit suggestion**, or several at once with **Add suggestion to batch**."})
    print(f"Posted {len(comments)} suggestion(s).")
    return 0


if __name__ == "__main__":
    sys.exit(main())
