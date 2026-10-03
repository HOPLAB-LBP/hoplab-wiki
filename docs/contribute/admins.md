# For admins

Admins review and merge pull requests and keep the build working. Repository admins today: [@costantinoai](https://github.com/costantinoai), [@kschevenels](https://github.com/kschevenels) and [@opdebeeck](https://github.com/opdebeeck).

## Reviewing and accepting pull requests

1. Go to the `hoplab-wiki` repository on GitHub.
2. Click on the "Pull requests" tab.
3. Review the pull request (Approve changes or suggest edits)
4. When the changes are satisfactory, approve the changes and click "Merge pull request". This will delete the temporary branch.

The rules on `main`:

- Changes reach `main` only through a pull request, with one approving review from a code owner. `.github/CODEOWNERS` makes @costantinoai the reviewer of every pull request.
- A new push to the pull request dismisses earlier approvals.
- Force pushes to `main` are blocked.

## Merging

- Wait until all checks pass, and read the bot comment with the check report.
- Use **Squash and merge**, so each pull request becomes one commit on `main`.
- You cannot approve your own pull request. Admins can bypass the review rule: tick the bypass box under the merge button, or run `gh pr merge <number> --squash --admin`. Do this only when all checks have passed.
- GitHub deletes the branch after the merge. Delete your local copy with `git branch -D <branch>`.
- The merge starts the deploy: the live site updates a few minutes later.

## What runs where

| Workflow | When | What it does |
|---|---|---|
| PR checks | Every pull request that touches the docs, the configuration, the scripts or the tests | Pushes safe auto-fixes (whitespace, quotes) to branches of this repository, then runs the spell check, Markdown and YAML lint, link check, MkDocs build and syntax check; tests the scripts and lints the workflows when those change |
| Post PR check report | After each PR checks run | Posts the report as a comment on the pull request |
| Automation tests | Pull requests and pushes to `main` that touch workflows, scripts, tests or check settings | Tests the scripts and lints the workflows |
| Deploy to GitHub Pages | Every push to `main`; also by hand | Builds the site with `mkdocs-ci.yml` and publishes it on the `gh-pages` branch |
| Manage Docs Tags and Issues | Every push to `main`, every day at 07:00 UTC, issue comments; also by hand | Keeps one issue per page with its `TODO`, `NOTE` and `PLACEHOLDER` tags |
| Autofix docs | Only by hand | Runs the auto-fixes on all of `main` and opens a pull request with them |

To run one by hand: **Actions** tab, pick the workflow, **Run workflow**.

## Two build configurations

- `mkdocs.yml` is what contributors use with `mkdocs serve`. It has no plugin that needs git.
- `mkdocs-ci.yml` starts with `INHERIT: mkdocs.yml` and adds the plugins that read the git history: the last update and the contributors at the bottom of each page. The PR build (`scripts/docs_ci_check.sh`) and the deploy use it.
- Its `plugins:` list replaces the one in `mkdocs.yml` instead of extending it. When you add or remove a plugin in `mkdocs.yml`, make the same change in `mkdocs-ci.yml`.
- To preview the site exactly as it is published: `bash scripts/prepare_docs.sh && mkdocs serve -f mkdocs-ci.yml`.

## Adding or upgrading a plugin

- Add it to `requirements.txt` with a version range, for example `mkdocs-glightbox>=0.5,<0.6`, so CI never jumps to a new major version on its own.
- A plugin that needs git, network access or system libraries while building goes in `mkdocs-ci.yml` only. Any other plugin goes in both files.
- A plugin in `mkdocs.yml` stops `mkdocs serve` for everyone who has not installed it. Say so in the pull request and tell the lab to run `pip install -r requirements.txt` once.
- Use only options that older versions of the plugin know too: contributors on Python 3.9 get older releases, and an unknown option fails the strict build.

## The Contribute pages

- `docs/contribute.md` is a copy of `README.md`, made by `scripts/prepare_docs.sh` before every build. Edit `README.md`, never `docs/contribute.md`.
- In `README.md`, link to wiki pages with paths from the repository root, such as `docs/contribute/admins.md`. They work on GitHub, and `prepare_docs.sh` turns them into wiki links in the copy.
- The other Contribute pages, such as this one, are normal wiki pages in `docs/contribute/`.

## Names under each page

- When a contributor shows up under a GitHub handle, or twice, add a line to `.mailmap`: their full name, their GitHub no-reply address (which gives the avatar) and the e-mail of their commits.
- Bots and AI agents are not listed as contributors. A new one goes under `ignore_authors` in `mkdocs-ci.yml`, with its commit e-mail in lower case.

## When a check flags something that is fine

| Flag | Fix |
|---|---|
| Spell check rejects a real word or name | Add it to `_typos.toml` |
| Link check fails on a site that blocks bots (login page, CAPTCHA, error 400) | Add a pattern to `exclude` in `.lychee.toml`, with a comment that says why |
| Markdown lint rejects an HTML element | Add it to `allowed_elements` under `MD033` in `.markdownlint-cli2.yaml` |
| The strict build warns about a shallow clone | Check out with `fetch-depth: 0`, as the two building workflows already do |
