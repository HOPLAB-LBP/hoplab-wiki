# For admins

Admins review and merge pull requests and keep the build working. Repository admins today: [@costantinoai](https://github.com/costantinoai), [@kschevenels](https://github.com/kschevenels) and [@opdebeeck](https://github.com/opdebeeck).

## Review and merge a pull request

1. Open the pull request from the [Pull requests](https://github.com/HOPLAB-LBP/hoplab-wiki/pulls) tab.
2. Wait until all checks pass, and read the bot comment with the check report.
3. Read the changes in **Files changed**. Ask for changes in a review, or push small fixes yourself (see [Edit a contributor's pull request](#edit-a-contributors-pull-request)).
4. Approve, then click **Squash and merge**.

The pull request becomes one commit on `main`. Its author is the person who opened the pull request; anyone else who committed is added as co-author. GitHub deletes the branch, and the merge starts the deploy: the live site updates a few minutes later. If you had the branch on your computer, delete it there with `git branch -D <branch>`.

??? info "Merging your own pull request"
    You cannot approve your own pull request. Ask another member of `reviewers` to approve it, or bypass the review as an admin: tick the bypass box under the merge button, or run `gh pr merge <number> --squash --admin`. Bypass only when all checks have passed.

## Edit a contributor's pull request

You can push fixes to a pull request before merging it.

- **Branch in this repository** (web editor `user-patch-N` branches, Advanced workflow): `gh pr checkout <number>`, edit, commit, `git push`. Or edit the files on GitHub, in the pull request's **Files changed** tab.
- **Fork**: the same works when the pull request has **Allow edits by maintainers** ticked (`gh pr view <number> --json maintainerCanModify`). Pushing there writes to the contributor's fork. If the box is not ticked, ask the contributor to tick it, or to move the change to a branch in this repository.

Tell the contributor to pull before they continue, since their copy no longer has your commits.

## The rules on `main`

One organisation ruleset, `default-branch`, covers the default branch of every HOPLAB-LBP repository, this wiki included, and every new repository from the moment it is created. Change it under the organisation's **Settings** > **Rulesets**.

- Changes reach the default branch only through a pull request, with one approval from a member of the `reviewers` team. The team is asked to review automatically, but only on repositories it has access to, and only while it stays visible.
- **New repository**: add the team right after creating it (**Settings** > **Collaborators and teams** > **Add teams** > `reviewers`, role **Write**). Without it, pull requests are blocked and nobody is asked to review them.
- Nobody can push to the default branch directly, admins included. Admins can bypass the review, but only when merging a pull request.
- A new push to the pull request dismisses earlier approvals.
- Force pushes and deleting the default branch are blocked.
- Squash merge is the only merge method.

## What runs where

| Workflow | When | What it does |
|---|---|---|
| PR checks | Every pull request that touches the docs, the snippets in `includes/`, the configuration, the scripts or the tests | Pushes safe auto-fixes (whitespace, quotes) to branches of this repository, then runs the spell check, Markdown and YAML lint, link check, MkDocs build and syntax check; tests the scripts and lints the workflows when those change. For branches of this repository it also publishes a preview of the site at `pr-preview/pr-<number>/` on `gh-pages` (no index, with a banner; linked in the report) and posts spelling fixes as review suggestions on changed lines. Fork and Dependabot pull requests get neither: their token is read-only |
| Remove PR preview | A pull request closes | Deletes its preview from `gh-pages` |
| Post PR check report | After each PR checks run | Posts the report as a comment on the pull request |
| Automation tests | Pushes to `main` that touch workflows, scripts, tests or check settings; also by hand | Tests the scripts and lints the workflows (pull requests get the same in PR checks) |
| Deploy to GitHub Pages | Every push to `main`; also by hand | Builds the site with `mkdocs-ci.yml` and publishes it on the `gh-pages` branch, leaving the previews in `pr-preview/` in place. When a deploy fails, it opens an issue labelled `deploy-failure` and assigned to @costantinoai; the next successful deploy closes it |
| Weekly link check | Mondays at 06:00 UTC; also by hand | Checks every link on the wiki and keeps one issue labelled `link-check` with the broken ones, assigned to @costantinoai; closes it when all links work again. Also deletes any preview left on `gh-pages` for a pull request that is no longer open |
| Dependabot (`.github/dependabot.yml`) | Once a month | Opens one pull request that updates all the actions the workflows use to their newest versions. Read the release notes of any new major version before you merge it |
| Manage Docs Tags and Issues | Every push to `main`, every day at 07:00 UTC, issue comments; also by hand | Keeps one issue per page with its `TODO`, `NOTE` and `PLACEHOLDER` tags |
| Autofix docs | Only by hand | Runs the auto-fixes on all of `main` and opens a pull request with them. Checks do not start on a pull request the bot opens: close and reopen it to run them |

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
- Use only options that older versions of the plugin know too: contributors with an older environment (Python 3.9) get older releases, and an unknown option fails the strict build.

## The Contribute pages

- `docs/contribute.md` (Quick start) is a copy of `README.md`, made by `scripts/prepare_docs.sh` before every build. Edit `README.md`, never `docs/contribute.md`.
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
