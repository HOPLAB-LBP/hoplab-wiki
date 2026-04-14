# Tests for Repo Automation

This folder is for developer-facing regression tests.

It is not part of the published wiki, and it is not meant to be a general test
lab. The point of these files is narrower: when we fix a CI or automation bug,
we keep the smallest useful repro here so GitHub Actions can keep watching it.

## Which CI Does What

There are a few different workflow layers in this repo, and they do different
jobs:

`automation-tests.yml`

- this is the workflow that tests the automation itself
- it runs when workflow files, scripts, or test files change
- it is where the tracked regression tests in this folder get exercised
- if this workflow fails, it usually means we broke one of the repo support
  scripts or one of the tests around them

`pr-checks.yml`

- this is the main PR-facing docs QA workflow
- it runs the actual checks we care about on docs changes: typos,
  markdownlint, yamllint, link checking, MkDocs build checks, and the custom
  MkDocs syntax checks
- it also runs the safe autofix steps and posts the PR report
- if this workflow fails, it usually means the current branch content has a real
  docs or workflow problem

`autofix-docs.yml`

- this is manual-only
- it is not a test workflow
- it runs the safe fixers on `main`, creates a branch, and opens a PR if there
  is anything to fix

`gh-pages.yml`

- this builds and publishes the docs site
- it does not run the fixtures in this folder directly
- it still depends on the same scripts staying correct, which is one reason the
  tracked regression tests matter

## What The Tests Here Cover

`tests/test_check_mkdocs_syntax.sh`

- tests `scripts/check_mkdocs_syntax.py`
- checks that valid MkDocs Material syntax passes cleanly
- checks that broken syntax fails when it should
- checks that `--fix` repairs the cases we support
- protects the regression where nested admonitions and code fences were
  reindented incorrectly and broke `docs/research/coding/index.md`

`tests/test_fix_markdown_table_pipes.sh`

- tests `scripts/fix_markdown_table_pipes.py`
- checks the missing trailing `|` table-pipe case that `markdownlint-cli2`
  detects but does not reliably fix on its own
- checks normal tables and indented tables
- checks that fenced code blocks are left alone
- checks that the fixed file passes `markdownlint-cli2`

`tests/test-manage-docs-tags.js`

- it tests the docs-tag automation logic used for issue/task handling
- it covers parsing, normalization, deduplication, formatting, and real-world
  content patterns from the wiki

## Why These Tests Are Tracked

These tests belong in git because they are meant to protect workflow behavior
from regressing.

If a bug matters enough that we want GitHub Actions to catch it next time, the
test for that bug needs to live in the repository. If something is only useful
for manual investigation, it should stay out of the tracked test set.

That is why the split is:

- `tests/` for small, stable checks we want CI to run on PRs
- `local/` for broader local-only tooling and historical repro harnesses

The historical matrix we built for this branch lives in `local/` for exactly
that reason.

## Fixtures

`tests/fixtures/` holds the small Markdown repro files used by the shell tests.

Keep fixtures small and specific. Each one should answer a simple question like
"what exact bug are we protecting here?" without needing a lot of extra
context.

## Running Them Locally

From the repo root:

```bash
bash tests/test_check_mkdocs_syntax.sh
bash tests/test_fix_markdown_table_pipes.sh
node tests/test-manage-docs-tags.js
```

For full docs validation, the other useful local checks are:

```bash
bash scripts/prepare_docs.sh
bash scripts/docs_ci_check.sh
python3 scripts/check_mkdocs_syntax.py README.md docs/
mkdocs build --strict
```

## Rule Of Thumb

Add a tracked test here when:

- the behavior should be enforced by CI
- the repro can stay small and deterministic
- the failure would be annoying to rediscover by hand

Keep it out of `tests/` when:

- it is mostly exploratory
- it needs lots of setup
- it is a broad historical sweep rather than a tight regression check
