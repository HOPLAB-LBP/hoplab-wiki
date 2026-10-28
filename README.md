# Contribute to the Hoplab wiki

Welcome to the Hoplab Wiki repository. This Wiki is a work in progress and an ongoing effort to migrate all the Hoplab knowledge and procedures into a more user-friendly format. This process is currently managed by [@costantinoai](https://github.com/costantinoai) and [@kschevenels](https://github.com/kschevenels). For any questions, feel free to [ping me](mailto:andreaivan.costantino@kuleuven.be).

This guide will help you set up, update, and maintain the Wiki both locally and online. Follow the instructions if you want to make changes to the wiki.

!!! tip "Suggest or make quick changes"
    For most cases, if you want to suggest some changes you can do so by opening a new Issue. If you want to make quick changes to any page, you can do so by clicking on the pencil icon (✏️) at the top right of the page to begin editing the file.

## Table of contents

1. [Getting started](#getting-started)
2. [How to contribute](#how-to-contribute)
    - [Easy workflow (quick changes)](#easy-workflow-for-quick-changes)
    - [Advanced workflow (extensive changes)](docs/contribute/advanced-workflow.md)
3. [Automated PR checks](#automated-pr-checks)
4. [Editing the wiki](#editing-the-wiki)
    - [Adding a new page](#adding-a-new-page)
    - [Creating child pages](#creating-child-pages)
    - [Adding tags](#adding-todo-note-and-placeholder-tags)
    - [Common formatting syntax](#common-formatting-syntax)
    - [Formatting toolkit](docs/contribute/formatting-toolkit.md)
    - [Linking and referencing](#linking-and-referencing)
5. [For admins: reviewing, merging and the build](docs/contribute/admins.md)
6. [Troubleshooting](#troubleshooting)

## Getting started

Before you begin, ensure you have the following:

- A GitHub account (click [here](https://github.com/signup) to sign up).
- Be part of the [`HOPLAB-LBP`](https://github.com/orgs/HOPLAB-LBP/people) organization (contact [Andrea](mailto:andreaivan.costantino@kuleuven.be) if you need to be added).
- If you plan on following the [Advanced workflow](docs/contribute/advanced-workflow.md) (encouraged for more complex changes), also make sure that you have [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html), and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) or [GitHub Desktop](https://desktop.github.com/) (strongly encouraged) installed. If you are new to Git, branches, and pull requests, see the [Version control](https://hoplab-lbp.github.io/hoplab-wiki/research/coding/version-control.html) page for a full introduction.

## How to contribute

We offer two workflows for contributing to the Hoplab Wiki: an Easy Workflow for quick changes to single files, and an Advanced Workflow for more extensive changes to multiple files.

### Easy workflow (for quick changes)

Everything happens in your web browser. GitHub puts your change on a new branch and opens a pull request (PR) for it; we review it and publish it. You never need to create a branch yourself.

#### Edit a page

1. On the wiki page, click the pencil :material-file-edit-outline: at the top right, next to the page title. GitHub opens the page source.
2. Make your changes. The "Preview" tab shows how they will look (see [Editing the wiki](#editing-the-wiki) for the syntax).
3. Click **Commit changes...** and write one line saying what you changed. GitHub has already selected **Create a new branch for this commit and start a pull request**, since nobody can commit to `main` directly.
4. Click **Propose changes**, then **Create pull request**.

GitHub then asks [@costantinoai](https://github.com/costantinoai) to review, the [automated checks](#automated-pr-checks) run, and the change goes live once the PR is merged. We may push small fixes to your PR before merging it.

??? tip "Change more in the same PR"
    Open your PR, go to the **Files changed** tab, click **...** on a file and choose **Edit file**. Commits made there go to the same PR. To edit a file that is not in the PR yet, pick your branch in the branch menu of the [repository](https://github.com/HOPLAB-LBP/hoplab-wiki) (it starts with your user name, e.g. `yourname-patch-1`), open the file and edit it there. When you commit, choose **Commit directly to the `yourname-patch-1` branch**.

    If you are not done yet, say so in the PR (or click **Convert to draft**), so we do not merge it halfway.

??? tip "Add a new page"
    1. Open the folder where the page belongs on [GitHub](https://github.com/HOPLAB-LBP/hoplab-wiki/tree/main/docs), click **Add file** > **Create new file**, and type the file name (for example `my-new-page.md`).
    2. Write the content and commit as above (new branch, **Propose changes**, **Create pull request**).
    3. Add a line for the page to the `nav` section of `mkdocs.yml` on the same branch (see [Adding a new page](#adding-a-new-page)); the build check fails for a page that is not in the menu. Not sure where it goes? Put it next to similar pages and say so in the PR; we can move it.

??? info "Not part of the HOPLAB-LBP organisation?"
    GitHub offers to fork the repository (make your own copy of it). Follow its steps and leave **Allow edits by maintainers** ticked on the PR, so we can fix small things for you.

For larger changes that you edit and preview on your own computer, follow the [Advanced workflow](docs/contribute/advanced-workflow.md).

## Automated PR checks

When you open or update a Pull Request, automated checks run to catch common issues early. A bot will post a comment on your PR summarizing the results — if anything fails, the comment explains exactly what went wrong and how to fix it. You can also view the full report in the job summary by clicking "Details" next to any check.

**Auto-fixed for you** (no action needed for PRs from branches in this repo). The bot pushes the fixes to your branch as a new commit and says so in its comment; if you work on your computer, pull before you continue.

- Trailing whitespace and extra blank lines in Markdown files
- Hard tabs converted to spaces
- Trailing whitespace in YAML files
- Curly/smart quotes in content tab (`=== "..."`) and admonition (`!!! type "..."`) titles
- Missing blank lines after content tab headers (`=== "Title"`)

!!! note "Fork PRs"
    If your PR comes from a fork, auto-fixes cannot be pushed automatically (GitHub restricts write access on fork PRs). The check report tells you what needs fixing by hand, or we fix it for you if **Allow edits by maintainers** is ticked.

**Checked and reported** (you fix these if flagged):

| Check | What it does |
|-------|--------------|
| **Spell check** | Catches typos. If it flags a valid word (e.g., a name or technical term), add it to `_typos.toml`. |
| **Markdown lint** | Checks formatting consistency (heading style, bare URLs, etc.). |
| **Link check** | Verifies all links are reachable. |
| **YAML lint** | Validates syntax in `mkdocs.yml` and workflow files. |
| **MkDocs build** | Builds the full site to ensure no broken references or config errors. |
| **MkDocs syntax** | Catches MkDocs Material-specific issues (under-indented tab/admonition content, code blocks at wrong indent level) that cause silent rendering failures. |

!!! tip "Need help with a failing check?"
    The bot comment on your PR will explain the issue and how to fix it. If you're still unsure, ping @costantinoai in the PR comments.

## Editing the wiki

We welcome contributions from all members. All the content of the wiki is written in Markdown files located in the `docs` directory. You can edit these files in your browser (if you follow the [Easy workflow](#easy-workflow-for-quick-changes)) or locally using any text editor or IDE (e.g., VSCode, Sublime Text) if you follow the [Advanced workflow](docs/contribute/advanced-workflow.md).

### Adding a new page

1. Create a new Markdown file in the `docs` directory (e.g., `docs/new-page.md`).
2. Add the new page to the `nav` section of `mkdocs.yml`:
```yaml
nav:
  - Home: index.md
  - Guide: guide.md
  - New Page: new-page.md
```

### Creating child pages

To create a child page, place the Markdown file in a subdirectory and update the `nav` section in `mkdocs.yml` accordingly:

1. Create a new subdirectory in the `docs` directory (e.g., `docs/subdir`).
2. Create a new Markdown file in the subdirectory (e.g., `docs/subdir/child-page.md`).
3. Update the `nav` section in `mkdocs.yml`:
```yaml
nav:
  - Home: index.md
  - Guide: guide.md
  - Subdir:
      - Child Page: subdir/child-page.md
```

### Adding `TODO`, `NOTE`, and `PLACEHOLDER` tags

We track documentation tasks using **tags** inside Markdown files. A [GitHub Action](https://github.com/HOPLAB-LBP/hoplab-wiki/actions/workflows/manage-docs-tags.yml) automatically scans for these tags and creates one [Issue](https://github.com/HOPLAB-LBP/hoplab-wiki/issues?q=is%3Aissue+label%3Adoc-tags) per file to track them.

#### How to add a tag

Write the tag as a **standalone bullet point** with the keyword in ALL CAPS, followed by a colon. It is a good practice to include your name in square brackets:

```markdown
- TODO: [Andrea] Fix hyperlinks to the fMRI section
- PLACEHOLDER: [Klara] Add info about the new ethics procedure
- NOTE: [Tim] The scanner booking system changed in 2025
```

Tags can be placed anywhere in the file, but we prefer grouping them **at the bottom**. The three recognized keywords are:

- `TODO` — something that needs to be done
- `PLACEHOLDER` — content that needs to be written
- `NOTE` — an important remark or reminder

!!! warning "Tags must be ALL CAPS"
    Only `TODO`, `PLACEHOLDER`, and `NOTE` in uppercase are detected. `Todo`, `note`, or `placeholder` will be ignored.

#### How to resolve a tag

**Delete the tag line** from the source file and commit. On the next push to `main`, the workflow will automatically remove the task from the Issue. If all tasks in a file are resolved, the Issue is closed automatically.

#### Adding tasks via issue comments

You can also add tasks by commenting on an existing doc-tags Issue. Write a tag line in your comment (e.g., `TODO: check the references`) and the workflow will detect it, add it to the task list, and reply with instructions on how to resolve it.

To resolve a comment-added task, react with 🚀 on the comment that created the task. The workflow will pick this up on the next run and remove the task.

#### How the issues look

Each tracking Issue has a title like `Tags in docs/get-started/index.md [5 open]` showing the number of open tasks. The Issue body lists each task with a clickable source label:

- **(file)** — links to the source file in edit mode, so you can delete the tag directly
- **(comment)** — links to the original comment where the task was added

!!! tip "Do not edit the Issue body directly"
    The Issue body is auto-managed by the workflow. Any manual edits will be overwritten on the next run. To change tasks, edit the source file or use comment reactions.

### Common formatting syntax

Here are some common Markdown elements:

- **Headers:** `# Header 1`, `## Header 2`, `### Header 3`, etc.
- **Bold text:** `**bold text**`
- **Italic text:** `*italic text*`
- **Links:** `[link text](URL)`
- **Lists:**
    - Unordered list: `- Item 1`
    - Ordered list: `1. Item 1`
- **Images:** `![Alt text](path/to/image.png)` (see [this section](#adding-and-linking-images) for instructions on how to link images.)

For more advanced formatting options, refer to the [MkDocs Material Reference Guide](https://squidfunk.github.io/mkdocs-material/reference/).

The wiki's own building blocks (list styles, steps, boxes, tabs, cards, buttons, image options) are in the [Formatting toolkit](docs/contribute/formatting-toolkit.md), each with a snippet and what it looks like.

### Linking and referencing

When creating or editing content, you may want to reference or link to other sections within the wiki, external resources, or images. Here's how to do it:

#### Internal links (within the wiki)

Use relative paths for internal links. The general format is:

```markdown
[Link Text](path/to/file.md)
```

Examples:

1. Linking to a page in the same directory:
   ```markdown
   [Getting Started](getting-started.md)
   ```

2. Linking to a page in a subdirectory:
   ```markdown
   [fMRI Analysis](research/fmri/fmri-analysis.md)
   ```

3. Linking to a specific section on another page:
   ```markdown
   [Ethics Guidelines](research/ethics/index.md#ethical-guidelines)
   ```

4. Linking to a parent directory:
   ```markdown
   [Back to Research](../index.md)
   ```

#### External links (outside the wiki)

For external links, use the full URL:

```markdown
[Hoplab Website](https://www.hoplab.be/)
```

#### Adding and linking images

When adding images to the Wiki:

1. Store all images in the `docs/assets` folder.
2. Use descriptive, lowercase names for images, separating words with hyphens (e.g., `fmri-analysis-workflow.png`).
3. Use relative links to reference images. The path depends on the location of your Markdown file:

    - If your Markdown file is in the main `docs` folder:
     ```markdown
     ![fMRI Analysis Workflow](../assets/fmri-analysis-workflow.png)
     ```

    - If your file is in a subdirectory of `docs` (e.g., `docs/research/`):
     ```markdown
     ![fMRI Analysis Workflow](../../assets/fmri-analysis-workflow.png)
     ```

    - If your file is in a sub-subdirectory (e.g., `docs/research/fmri/`):
     ```markdown
     ![fMRI Analysis Workflow](../../../assets/fmri-analysis-workflow.png)
     ```

4. Always include descriptive alt text for accessibility:
   ```markdown
   ![Diagram showing steps of fMRI analysis](../assets/fmri-analysis-workflow.png)
   ```

5. Optionally, specify image dimensions using HTML:
   ```html
   <img src="../assets/fmri-analysis-workflow.png" alt="fMRI Analysis Workflow" width="500">
   ```

#### Best practices for linking

1. Use descriptive link text that gives users an idea of where the link will take them.
2. Check your links after creating them to ensure they work correctly.
3. For external links, consider opening them in a new tab:
   ```markdown
   [Hoplab Website](https://www.hoplab.be/){target="_blank"}
   ```
4. When linking to specific sections within long documents, use anchor links to improve user experience.
5. For images, **always use relative links** and store images in the `docs/assets` folder to maintain a self-contained Wiki.

## Troubleshooting

### Permission denied or authentication issues

If you encounter issues with pushing to the repository, you may need to use a personal access token. Follow these steps:

1. Create a fine-grained personal access token [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token).
2. Use this token for authentication when pushing to the repository. More information on how to do so can be found on [this issue](https://github.com/shiftkey/desktop/issues/217#issuecomment-934660228). Please, first get a fine-grained Personal Access Token as described in the link above, and then follow the instructions in the "Manually temporary resolving this issue for a single git repository" section.

### Additional help

For further assistance, refer to the following resources:

- [MkDocs Documentation](https://www.mkdocs.org/)
- [MkDocs Material Theme](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

Or [ping](mailto:andreaivan.costantino@kuleuven.be) me.

Thank you for contributing to the Hoplab Wiki!
