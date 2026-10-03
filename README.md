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

This workflow is ideal for making small, quick changes to a single file. It can be done entirely through your web browser and doesn't require any local setup.

??? tip "Edit directly from this page!"
    Existing pages can be edited directly through the Wiki! If you need to edit or add information to any page, look for the paper and pencil symbol :material-file-edit-outline: at the top-right of the page, next to the page title. This will let you edit the page and open a PR either by creating a new branch on the main repo (if you are part of the Hoplab organization on GitHub) or by forking your own copy of the repo (if you are an external contributor). Make sure to [submit a PR](#step-3-submit-a-pr-with-your-proposed-changes) after your changes are made.

#### Step 1: Make your changes

1. **To edit an existing page:**

    1. Navigate to the [`HOPLAB-LBP/hoplab-wiki`](https://github.com/HOPLAB-LBP/hoplab-wiki) repository.
    2. Click on the file you want to edit (usually, in `docs/`).
    3. Click on the pencil icon (✏️) at the top right to edit the file.

2. **To create a new page:**

    1. Navigate to the `mkdocs.yml` file.
    2. Click on the pencil icon (✏️) at the top right to edit the file.
    3. Add the new page (e.g., `docs/new-page.md`) to the `nav` section and commit (follow the steps in the section 2 below).
    4. In the `docs` folder, click on "Add file" > "Create new file".
    5. Enter a name for your file in the `docs` directory (the same you used before, e.g., `docs/new-page.md`).

You can then add/edit your content in Markdown format (see [Editing the wiki](#editing-the-wiki) for more info), and click on "Preview" next to the "Edit" tab to see how your changes will look like.

#### Step 2: Commit changes to a temporary branch

1. Click on "Commit changes" after any necessary adjustments.
2. In the pop-up window, add a commit message and description for your changes.
3. Select "Create a new branch for this commit and start a pull request".
4. Click on "Propose changes".

#### Step 3: Submit a PR with your proposed changes

1. In the "Open a pull request page", add an informative title and a description of the changes in the PR.
2. In the right panel, make sure to assign an admin (as of July 2024, [@costantinoai](https://github.com/costantinoai)) to review your changes.
3. Click on "Create pull request" to submit your changes.

??? tip "Add multiple commits to a single PR"
    If you want to make additional changes related to an already opened PR (e.g., you need to change info in two separate files, or make additional adjustments), you do not need to open a new PR. Just go to the main page of the branch you created (you can find the branch in the [branches list](https://github.com/HOPLAB-LBP/hoplab-wiki/branches)) and **keep editing your files in this branch**. Every new commit you make in this branch will have the option to "Commit directly to the `<name-of-new-branch>` branch" or "Create a new branch for this commit and start a pull request". Make sure you select the first option to include your new commits to the original PR. Importantly, if you plan to add several commits to a PR this way, make sure you assign a reviewer **only after your last commit** to avoid merging PRs halfway in the process, or you can create a draft PR until all your changes are included.

These steps above will create a new branch in the repository, that will be visible in the [branches list](https://github.com/HOPLAB-LBP/hoplab-wiki/branches), and a new PR visible in the [PRs list](https://github.com/HOPLAB-LBP/hoplab-wiki/pulls). Once the PR is approved by at least one reviewer and merged into the main branch, the newly created branch will be automatically deleted and the changes will go live.

For larger changes that you edit and preview on your own computer, follow the [Advanced workflow](docs/contribute/advanced-workflow.md).

## Automated PR checks

When you open or update a Pull Request, automated checks run to catch common issues early. A bot will post a comment on your PR summarizing the results — if anything fails, the comment explains exactly what went wrong and how to fix it. You can also view the full report in the job summary by clicking "Details" next to any check.

**Auto-fixed for you** (no action needed for PRs from branches in this repo):

- Trailing whitespace and extra blank lines in Markdown files
- Hard tabs converted to spaces
- Trailing whitespace in YAML files
- Curly/smart quotes in content tab (`=== "..."`) and admonition (`!!! type "..."`) titles
- Missing blank lines after content tab headers (`=== "Title"`)

!!! note "Fork PRs"
    If your PR comes from a fork, auto-fixes cannot be pushed automatically (GitHub restricts write access on fork PRs). The check report will tell you exactly what needs manual fixing. The bot comment and all other checks work normally for fork PRs.

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
