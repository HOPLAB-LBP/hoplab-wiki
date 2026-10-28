# Advanced workflow (for extensive changes)

The preferred way to contribute if you need to make **significant/multiple changes**, but it requires some familiarity with git, Python, and Conda environments. If you are not a Wiki maintainer, this workflow is probably overkill.

With this workflow, you will make and preview all the edits locally (on your computer). This allows for more control and flexibility, as it lets you see your changes in a live session.

!!! tip "Unfamiliar with branches and pull requests?"
    This workflow relies on creating branches and opening pull requests. If these concepts are new to you, read the [Working with branches](https://hoplab-lbp.github.io/hoplab-wiki/research/coding/version-control.html#4-working-with-branches) and [Pull requests](https://hoplab-lbp.github.io/hoplab-wiki/research/coding/version-control.html#5-pull-requests) sections first.

!!! question "How should I organize my PR?"
    A [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) (or PR) "*is a proposal to merge a set of changes from one branch into another*". Ideally, a PR should include all the commits **for a specific feature** or bugfix from end-to-end. Avoid making PRs that contain multiple unrelated changes. For instance, if you are working on a feature that requires modifications across multiple files, ensure all those changes are included in the same PR. Conversely, avoid combining changes for different features (e.g., adding unrelated updates to the fMRI workflow and the getting started section) in a single PR. Each PR should represent a cohesive unit of work.

Each change lives on its own branch in the `HOPLAB-LBP/hoplab-wiki` repository, and reaches `main` through a pull request. Nobody can push to `main` directly. You clone the repository once; after that, every change follows steps 3 to 7.

## Step 1: Clone the repository (once)

=== "Using GitHub Desktop"

    1. In GitHub Desktop, click `File > Clone Repository`.
    2. In the "GitHub.com" tab, pick `HOPLAB-LBP/hoplab-wiki` (or paste `https://github.com/HOPLAB-LBP/hoplab-wiki` in the "URL" tab).
    3. Choose where to store it on your computer and click "Clone".

=== "Using the CLI"

    ```bash
    git clone https://github.com/HOPLAB-LBP/hoplab-wiki.git
    cd hoplab-wiki
    ```

??? info "Not part of the HOPLAB-LBP organisation?"
    You cannot push branches to the lab repository. Fork it on GitHub (the "Fork" button), clone your fork instead, and follow the same steps: work on a new branch (never on your fork's `main`), push it to your fork, and open the pull request against `HOPLAB-LBP/hoplab-wiki` `main`. Leave **Allow edits by maintainers** ticked so we can fix small things for you.

??? failure "Did you clone a fork in the past?"
    Older versions of this page told everyone to fork. If your copy points to `your-username/hoplab-wiki`, clone the lab repository as above and work there; you can delete the old fork on GitHub (Settings, at the bottom of the page). GitHub Desktop shows a fork when it asks "How are you planning to use this fork?".

## Step 2: Setting up your local environment

1. **Install Conda:**

    If you don't have Conda installed, download and install it from [Conda's official website](https://docs.conda.io/en/latest/miniconda.html).

2. **Create and activate a Conda environment:**

    ```bash
    conda create --name hoplab-wiki python=3.9
    conda activate hoplab-wiki
    ```

3. **Install necessary packages:**

    ```bash
    pip install -r requirements.txt
    ```

!!! tip "After pulling new changes"
    Run `pip install -r requirements.txt` again whenever `requirements.txt` has changed. If a new plugin is missing, `mkdocs serve` stops with an error such as `The "glightbox" plugin is not installed`.

## Step 3: Start a branch for your change

Start from an up-to-date `main` and give the branch a short name that says what it is for, such as `eeg-filter-section`.

=== "Using GitHub Desktop"

    1. With `main` as the current branch, click "Fetch origin" (then "Pull origin" if it appears).
    2. Click "Current Branch" > "New Branch", type the name and click "Create Branch".

=== "Using the CLI"

    ```bash
    git switch main
    git pull
    git switch -c eeg-filter-section
    ```

Then edit the Markdown files in a text editor or IDE. Keep one topic per branch; for an unrelated change, start another branch from `main`.

## Step 4: Testing your changes locally

1. **Serve the documentation locally:**
   1. While in your project directory and with the Conda environment activated, launch the local server by typing:
      ```bash
      mkdocs serve
      ```
   2. Open a web browser and navigate to `http://127.0.0.1:8000/`. This allows you to see your changes as they would appear on the live site.
   3. Keep this server running as you make changes; refresh your browser to update the preview.

!!! note "What the local preview leaves out"
    `mkdocs serve` shows every page without the line at the bottom with the last update and the contributors, because that line needs git. To see it as well, run `mkdocs serve -f mkdocs-ci.yml` (git must be installed). The Contribute page is a copy of `README.md`; refresh it with `bash scripts/prepare_docs.sh`.

## Step 5: Closing the local server

1. **Stop the server:**
    When you are done previewing and editing and you are done with the changes, go back to the terminal where your server is running and press `Ctrl+C` to stop the server.

## Step 6: Commit and push your branch

=== "Using GitHub Desktop"

    1. Check the changed files in the left sidebar and write a summary at the bottom left.
    2. Click "Commit to eeg-filter-section" (your branch name, never `main`).
    3. Click "Publish branch" (later pushes: "Push origin").

    If you are still on `main`, GitHub Desktop warns you before committing. Click "switch branches", create your branch, and your changes move with you.

=== "Using the CLI"

    ```bash
    git add docs/path/to/page.md
    git commit -m "Add the filter section to the EEG preprocessing page"
    git push -u origin eeg-filter-section
    ```

    Later pushes on the same branch are just `git push`.

??? failure "Push declined, or you committed on `main` by mistake"
    `main` only accepts changes through pull requests, so a push to it fails with "push declined due to repository rule violations". Move your commits to a branch and push that instead:

    ```bash
    git switch -c eeg-filter-section
    git push -u origin eeg-filter-section
    ```

    Your local `main` still has the commits that GitHub's `main` does not. Once your pull request is open, reset it with `git switch main && git reset --hard origin/main`. In GitHub Desktop, run these lines from "Repository" > "Open in Terminal" (or "Open in Command Prompt"), or ask us.

## Step 7: Open a pull request

=== "Using GitHub Desktop"

    Click "Preview Pull Request", then "Create Pull Request". GitHub opens in your browser with your branch already selected; add a title and a short description and click "Create pull request".

=== "Using the CLI"

    Open the link that `git push` printed, or the yellow "Compare & pull request" banner on the [repository page](https://github.com/HOPLAB-LBP/hoplab-wiki), add a title and a short description and click "Create pull request".

[@costantinoai](https://github.com/costantinoai) is asked to review automatically, and the [automated checks](../contribute.md#automated-pr-checks) run and post a report on the pull request. Not finished yet? Use the arrow next to the button to create a draft pull request instead, and click "Ready for review" when you are done.

To change the pull request, commit and push to the same branch again; we may push small fixes to it too, so pull before you continue (GitHub Desktop: "Fetch origin" > "Pull origin"; CLI: `git pull`).

## Step 8: After the merge

We squash-merge the pull request: your branch becomes one commit on `main`, the branch is deleted on GitHub, and the site updates a few minutes later. Switch back to `main`, pull, and delete your local branch (GitHub Desktop: "Branch" > "Delete..."; CLI: `git switch main && git pull && git branch -D eeg-filter-section`). Start the next change from step 3.
