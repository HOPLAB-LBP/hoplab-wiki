# Quick start

Anyone in the lab can correct a page of the wiki or write a new one. To change a page now, click the pencil :material-file-edit-outline: at its top right and follow the [easy workflow](#easy-workflow) below. [@costantinoai](https://github.com/costantinoai) and [@kschevenels](https://github.com/kschevenels) look after the wiki; for questions, [e-mail Andrea](mailto:andreaivan.costantino@kuleuven.be).

!!! tip "Only want to point out a problem?"
    [Open an issue](https://github.com/HOPLAB-LBP/hoplab-wiki/issues/new) and describe it. We will fix it.

## Before you start

You need a [GitHub account](https://github.com/signup) that is a member of the [HOPLAB-LBP](https://github.com/orgs/HOPLAB-LBP/people) organisation. [E-mail Andrea](mailto:andreaivan.costantino@kuleuven.be) to be added.

The wiki's source lives in the lab repository, [`HOPLAB-LBP/hoplab-wiki`](https://github.com/HOPLAB-LBP/hoplab-wiki) on GitHub. Every change reaches the live wiki through a pull request: you propose the change, one of the lab's reviewers approves it, and it goes live once it is merged. Nobody edits the published wiki directly. If pull requests are new to you, the [Version control](docs/research/coding/version-control.md) page explains them.

## Choose a workflow

<div class="grid cards" markdown>

- :material-web:{ .lg .middle } __Easy workflow__

    ---

    Fix or add text on a few pages, in your browser on GitHub. Nothing to install.

    [Follow the steps below](#easy-workflow)

- :material-laptop:{ .lg .middle } __Advanced workflow__

    ---

    Bigger changes, such as a new section or pages with images, on your computer with a live preview of the site. Needs GitHub Desktop or git, and Conda (set up once).

    [Advanced workflow](docs/contribute/advanced-workflow.md)

</div>

Both workflows use the same Markdown. [Writing pages](docs/contribute/writing-pages.md) has the basics (formatting, links, images, new pages, open tasks), and the [Formatting gallery](docs/contribute/formatting-gallery.md) has the wiki's building blocks.

## Easy workflow

Everything happens in your web browser. GitHub puts your change on a new branch and opens a pull request for it. You never need to create a branch yourself.

1. On the wiki page, click the pencil :material-file-edit-outline: at the top right, next to the page title. GitHub opens the page source.
2. Make your changes. The **Preview** tab shows how they will look (see [Writing pages](docs/contribute/writing-pages.md) for the syntax).
3. Click **Commit changes...** and write one line saying what you changed. GitHub has already selected **Create a new branch for this commit and start a pull request**, since nobody can commit to `main` directly.
4. Click **Propose changes**, then **Create pull request**.

Then see [what happens next](#after-you-open-a-pull-request).

??? tip "Change more in the same pull request"
    Open your pull request, go to the **Files changed** tab, click **...** on a file and choose **Edit file**. Commits made there go to the same pull request. To edit a file that is not in the pull request yet, pick your branch in the branch menu of the [lab repository](https://github.com/HOPLAB-LBP/hoplab-wiki) (it starts with your user name, e.g. `yourname-patch-1`), open the file and edit it there. When you commit, choose **Commit directly to the `yourname-patch-1` branch**.

    If you are not done yet, say so in the pull request (or click **Convert to draft**), so we do not merge it halfway.

??? tip "Add a new page"
    1. Open the folder where the page belongs on [GitHub](https://github.com/HOPLAB-LBP/hoplab-wiki/tree/main/docs), click **Add file** > **Create new file**, and type the file name (for example `my-new-page.md`).
    2. Write the content and commit as above (new branch, **Propose changes**, **Create pull request**).
    3. On the same branch, add the page to the menu in `mkdocs.yml` (see [Add a new page](docs/contribute/writing-pages.md#add-a-new-page)). The build check fails for a page that is not in the menu.

??? tip "Do you have your own fork of the wiki?"
    Start your edit from the pencil on the wiki page, or from the [lab repository](https://github.com/HOPLAB-LBP/hoplab-wiki), never from your fork. Then GitHub puts your branch in the lab repository, and the bot can suggest fixes for small formatting problems.

??? info "Not part of the HOPLAB-LBP organisation?"
    GitHub offers to fork the lab repository (make your own copy of it). Follow its steps and leave **Allow edits by maintainers** ticked on the pull request, so we can fix small things for you.

## After you open a pull request

1. **Look at the preview.** A few minutes later a bot comments on your pull request with a link to the wiki as it will look with your changes, and a link to each page you changed.
2. **Fix what the checks flag.** The same comment says what to fix. Where the bot knows the fix, it waits for you under **Files changed**: click **Commit suggestion** (or **Add suggestion to batch** for several, then commit once). Your pull request can be merged once the checks pass.
3. **Wait for the review.** A reviewer reads it, may ask for changes or make small ones, and merges it. The live wiki updates a few minutes later.

??? info "What the checks look at"
    | Check | What it does |
    |-------|--------------|
    | **Spell check** | Catches typos. If it flags a real word (a name or a technical term), add it to `_typos.toml`. |
    | **Markdown lint** | Checks that the formatting is consistent (heading style, bullets, spacing). |
    | **MkDocs build** | Builds the whole site and fails on broken links, missing pages or configuration errors. |
    | **MkDocs syntax** | Catches content that would quietly render wrong, such as tab or box content that is not indented enough. |
    | **YAML lint** | Checks the syntax of `mkdocs.yml` and the workflow files. |
    | **Link check** | Checks that links open. It only warns: some sites refuse automated checks, so open a flagged link in your browser before changing it. |

    The bot suggests a fix for spelling it is sure of, spacing and quotes, and links with one clear target. Anything else, the comment explains.

??? note "Does your pull request come from a fork?"
    Then the bot cannot suggest fixes or publish a preview (GitHub gives it no write access for forks). The comment tells you what to fix by hand, or we fix it for you if **Allow edits by maintainers** is ticked.

## Need help?

- Stuck on a failing check: ask [@costantinoai](https://github.com/costantinoai) in a comment on the pull request.
- A push from your computer fails: see [Troubleshooting](docs/contribute/advanced-workflow.md#troubleshooting) in the advanced workflow.
- Anything else: [e-mail Andrea](mailto:andreaivan.costantino@kuleuven.be).

Admins review and merge pull requests and keep the build working: see [For admins](docs/contribute/admins.md).

Thank you for contributing to the Hoplab wiki!
