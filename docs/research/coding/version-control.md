# Version control with Git and GitHub

Version control is crucial for collaborative coding and tracking changes in your projects. This page covers how to set up and use Git and GitHub, including how to work with branches and pull requests for effective collaboration.

!!! tip "New to Git?"
    If you've never used Git before, start with the [Software Carpentry Git lesson](https://swcarpentry.github.io/git-novice/) or the beginner-friendly [GitHub guide](https://github.blog/developer-skills/github/beginners-guide-to-github-adding-code-to-your-repository/).

---

## 1. Install Git

=== "Windows"

    - Download the installer from the [Git website](https://git-scm.com/download/win).
    - Follow the installation wizard, using default options.

=== "Mac"

    - Install via Homebrew:
        ```
        brew install git
        ```
    - Alternatively, download the [Git installer](https://git-scm.com/download/mac).

=== "Ubuntu"

    ```
    sudo apt-get update
    sudo apt-get install git
    ```

## 2. Configure Git

Set up your Git identity using the following commands:

```bash
git config --global user.name "Your Name"
git config --global user.email "youremail@example.com"
```

## 3. Getting started with GitHub

=== "GitHub Desktop (GUI)"

    1. **Download** [GitHub Desktop](https://desktop.github.com/).
    2. **Sign in** with your GitHub account.
    3. **Clone a Repository**:
        - Go to `File > Clone Repository` and enter the repository URL.
    4. **Commit Changes**:
        - Make changes to files, then click `Commit` to save a snapshot of your changes.
    5. **Push to GitHub**:
        - After committing, click `Push` to sync changes with GitHub.

=== "Command Line (CLI)"

    1. **Clone a Repository**:
       ```
       git clone https://github.com/your-username/repo-name.git
       cd repo-name
       ```
    2. **Stage and Commit Changes**:
       ```
       git add .
       git commit -m "Initial commit"
       ```
    3. **Push Changes**:
       ```
       git push origin main
       ```

## 4. Working with branches

### Why use branches?

The `main` branch contains the stable, "official" version of a project. You should **never commit directly to `main`**. Instead, create a **branch** — an independent copy of the codebase where you can make changes without affecting anyone else's work. This way:

- You can experiment freely without breaking the main version.
- Multiple people can work on different features at the same time.
- Changes are reviewed before they are merged, catching mistakes early.

### Creating and switching branches

=== "GitHub Desktop"

    1. **Create a new branch**: Click the `Current Branch` dropdown at the top → click `New Branch` → give it a descriptive name (e.g., `fix/update-fmri-docs`) → click `Create Branch`.
    2. **Switch between branches**: Click the `Current Branch` dropdown and select the branch you want to work on. GitHub Desktop will update all the files on your computer to match that branch.
    3. **Publish the branch**: The first time you switch to a new branch, click `Publish branch` to push it to GitHub so others can see it.

=== "Command Line (CLI)"

    1. **Create and switch to a new branch**:
       ```bash
       git checkout -b fix/update-fmri-docs
       ```
    2. **Switch to an existing branch**:
       ```bash
       git checkout fix/update-fmri-docs
       ```
    3. **Push a new branch to GitHub**:
       ```bash
       git push -u origin fix/update-fmri-docs
       ```
    4. **List all branches** (local and remote):
       ```bash
       git branch -a
       ```

!!! tip "Branch naming"
    Use descriptive names that indicate what the branch is for. Common prefixes:

    - `fix/` — for bug fixes (e.g., `fix/broken-link-fmri`)
    - `feature/` or `feat/` — for new features (e.g., `feature/add-eeg-tutorial`)
    - `improve/` — for improvements (e.g., `improve/restructure-coding-page`)
    - `docs/` — for documentation changes (e.g., `docs/update-ethics-info`)

### Working on a branch

Once you are on your branch, the workflow is the same as usual — edit files, stage, commit, and push:

=== "GitHub Desktop"

    1. Make your edits to files as normal.
    2. In GitHub Desktop, you will see the changed files listed on the left.
    3. Write a commit message at the bottom-left and click `Commit to <branch-name>`.
    4. Click `Push origin` to send your commits to GitHub.

=== "Command Line (CLI)"

    ```bash
    # Make your edits, then:
    git add .
    git commit -m "Describe what you changed"
    git push origin fix/update-fmri-docs
    ```

### Keeping your branch up to date

If others have made changes to `main` while you were working on your branch, you should pull those changes into your branch to stay up to date and avoid conflicts later:

=== "GitHub Desktop"

    1. Switch to `main` (click `Current Branch` → select `main`).
    2. Click `Fetch origin` and then `Pull origin` to get the latest changes.
    3. Switch back to your branch.
    4. Go to `Branch > Update from main` (or `Branch > Merge into current branch` → select `main`). This brings the latest `main` changes into your branch.

=== "Command Line (CLI)"

    ```bash
    git checkout main
    git pull origin main
    git checkout fix/update-fmri-docs
    git merge main
    ```

### Collaborating on a branch

Multiple people can work on the same branch. To pick up a colleague's branch that already exists on GitHub:

=== "GitHub Desktop"

    1. Click `Fetch origin` to refresh the list of remote branches.
    2. Click `Current Branch` → you will see the remote branch listed. Click on it to check it out locally.
    3. You can now make edits, commit, and push to the same branch.

=== "Command Line (CLI)"

    ```bash
    git fetch origin
    git checkout fix/update-fmri-docs
    ```

Before starting work on a shared branch, always **pull first** to get your colleague's latest changes:

=== "GitHub Desktop"

    Click `Fetch origin`, then `Pull origin`.

=== "Command Line (CLI)"

    ```bash
    git pull origin fix/update-fmri-docs
    ```

## 5. Pull requests

### What is a pull request?

A **pull request** (PR) is a request to merge the changes from your branch into `main`. It is the standard way to propose changes in a collaborative project. A PR lets others:

- **See exactly what you changed** (added, modified, or deleted).
- **Review your work** — leave comments, suggest edits, or approve.
- **Discuss** any questions before the changes go live.

Once the PR is approved, the branch is merged into `main` and typically deleted.

### Opening a pull request

=== "GitHub Desktop"

    After pushing your branch, GitHub Desktop will show a banner: `Create Pull Request`. Click it, and it will open the PR form on GitHub in your browser.

=== "GitHub website"

    1. Go to the repository on GitHub.
    2. If you recently pushed a branch, you will see a yellow banner: `Compare & pull request`. Click it.
    3. Alternatively, go to the `Pull requests` tab → `New pull request` → select your branch.

=== "Command Line (CLI)"

    If you have the [GitHub CLI](https://cli.github.com/) installed:
    ```bash
    gh pr create --title "Brief description of changes" --body "More details here"
    ```

When filling in the PR form:

1. **Title**: Write a short, clear summary of what the PR does (e.g., "Update fMRI scanning procedure").
2. **Description**: Explain *what* you changed and *why*. If the PR resolves a GitHub Issue, write `Closes #123` in the description — this will automatically close the Issue when the PR is merged.
3. **Reviewer**: Assign a reviewer (someone who will check your work before it is merged).

### Resolving a GitHub Issue with a PR

GitHub Issues are used to track tasks, bugs, and suggestions. To resolve an issue:

1. Open the Issue on GitHub and read what needs to be done.
2. Create a branch (see [above](#creating-and-switching-branches)) with a name that references the issue (e.g., `fix/issue-42-broken-links`).
3. Make your changes on that branch and push them.
4. Open a PR and include `Closes #42` (or `Fixes #42`) in the PR description.
5. When the PR is merged, the Issue is automatically closed.

### Reviewing a pull request

If you are asked to review a PR:

1. Go to the `Pull requests` tab on GitHub and open the PR.
2. Click on the `Files changed` tab to see all modifications.
3. Leave comments on specific lines by clicking the `+` icon next to a line.
4. When done, click `Review changes` and choose:
    - **Approve** — if everything looks good.
    - **Request changes** — if something needs to be fixed before merging.

### After the PR is merged

Once a PR is approved and merged:

- The branch is typically deleted on GitHub (you can do this from the PR page).
- Switch back to `main` and pull the latest changes to get the merged updates locally:

=== "GitHub Desktop"

    1. Switch to `main` via the `Current Branch` dropdown.
    2. Click `Fetch origin` → `Pull origin`.
    3. You can delete the old branch locally: `Branch > Delete`.

=== "Command Line (CLI)"

    ```bash
    git checkout main
    git pull origin main
    git branch -d fix/update-fmri-docs
    ```

## 6. General tips

- **Pull before you start working** to avoid conflicts.
- **Commit often, but meaningfully** — each commit should represent a logical unit of work.
- **Never commit directly to `main`** — always use a branch and a PR.
- **Write clear commit messages** that explain *what* changed and *why*.
- **Keep PRs focused** — one PR per feature or fix. Avoid bundling unrelated changes.
