# Advanced workflow

You work on a copy of the wiki on your computer and see every change in a live preview of the site before you open a pull request. Use it for bigger changes, such as a new section or pages with images. For a quick fix to one page, the [easy workflow](../contribute.md#easy-workflow) in your browser is faster.

!!! abstract "On this page"
    - **You need**: a GitHub account in the HOPLAB-LBP organisation, [GitHub Desktop](https://desktop.github.com/) (easiest) or [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git), and [Miniconda](https://docs.conda.io/en/latest/miniconda.html).
    - **You get**: the wiki on your computer with a live preview, and a pull request for each change.
    - **New to branches and pull requests?** Read [Working with branches](../research/coding/version-control.md#4-working-with-branches) and [Pull requests](../research/coding/version-control.md#5-pull-requests) first.

Each change lives on its own branch in the lab repository (`HOPLAB-LBP/hoplab-wiki`) and reaches `main` through a pull request. Nobody can push to `main` directly. Steps 1 and 2 are done once. Steps 3 to 6 are repeated for every change, and step 7 tidies up after the merge.

## 1. Clone the lab repository (once)

=== "Using GitHub Desktop"

    1. In GitHub Desktop, click **File** > **Clone Repository**.
    2. In the **GitHub.com** tab, pick `HOPLAB-LBP/hoplab-wiki` (or paste `https://github.com/HOPLAB-LBP/hoplab-wiki` in the **URL** tab).
    3. Choose where to store it on your computer and click **Clone**.

=== "Using the CLI"

    ```bash
    git clone https://github.com/HOPLAB-LBP/hoplab-wiki.git
    cd hoplab-wiki
    ```

??? info "Not part of the HOPLAB-LBP organisation?"
    You cannot push branches to the lab repository. Fork it on GitHub (the **Fork** button), clone your fork instead, and follow the same steps: work on a new branch (never on your fork's `main`), push it to your fork, and open the pull request against `main` of `HOPLAB-LBP/hoplab-wiki`. Leave **Allow edits by maintainers** ticked so we can fix small things for you.

??? failure "Did you clone a fork in the past?"
    Older versions of this page told everyone to fork, so your copy may still point to your own `your-username/hoplab-wiki`. Check where it points:

    - GitHub Desktop: **Repository** > **Repository settings** > **Remote**.
    - CLI: run `git remote -v`.

    If you see your own user name there, switch to the lab repository:

    - GitHub Desktop: clone the lab repository as in step 1, into a new folder. Copy any files you were still working on into it.
    - CLI: run the two lines below in your copy. Your branches and uncommitted changes stay as they are.

        ```bash
        git remote set-url origin https://github.com/HOPLAB-LBP/hoplab-wiki.git
        git fetch origin
        ```

    A pull request you already opened from your fork can stay open: we review and merge it as usual. Once nothing is open there, you can delete the fork on GitHub (the fork's **Settings**, at the bottom of the page).

## 2. Set up the environment (once)

The preview runs on Python packages, which you install in a Conda environment of their own.

1. Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html) if you do not have Conda yet.
2. Open a terminal in the repository folder. On Windows, use the **Anaconda Prompt** from the Start menu and go to the folder with `cd`. In GitHub Desktop on macOS or Linux, **Repository** > **Open in Terminal** does it for you.
3. Create the environment and install the packages:

    ```bash
    conda create --name hoplab-wiki python=3.11
    conda activate hoplab-wiki
    pip install -r requirements.txt
    ```

Next time, `conda activate hoplab-wiki` is all you need.

!!! tip "After pulling new changes"
    Run `pip install -r requirements.txt` again whenever `requirements.txt` has changed. If a new plugin is missing, `mkdocs serve` stops with an error such as `The "glightbox" plugin is not installed`.

## 3. Start a branch

Start from an up-to-date `main` and give the branch a short name that says what it is for, such as `eeg-filter-section`.

=== "Using GitHub Desktop"

    1. With `main` as the current branch, click **Fetch origin** (then **Pull origin** if it appears).
    2. Click **Current Branch** > **New Branch**, type the name and click **Create Branch**.

=== "Using the CLI"

    ```bash
    git switch main
    git pull
    git switch -c eeg-filter-section
    ```

Keep one topic per branch. For an unrelated change, start another branch from `main`.

??? question "How much goes in one pull request?"
    One topic, from start to end. Put in everything that topic needs, even when it touches several files, and leave out anything else. An update to the fMRI workflow and a fix to the getting-started section, for example, go in two pull requests.

## 4. Edit and preview

Edit the Markdown files in `docs/` with any text editor, for example [VS Code](https://code.visualstudio.com/). [Writing pages](writing-pages.md) has the Markdown you need most. To see the result, start the preview in the terminal, with the environment active and in the repository folder:

```bash
mkdocs serve
```

Open `http://127.0.0.1:8000/hoplab-wiki/` in your browser. The page reloads each time you save a file. Leave the preview running while you work, and stop it with ++ctrl+c++ in the terminal when you are done.

!!! note "What the local preview leaves out"
    `mkdocs serve` shows every page without the line at the bottom with the last update and the contributors, because that line needs git. To see it as well, run `mkdocs serve -f mkdocs-ci.yml` (git must be installed). The Contribute page is a copy of `README.md`; refresh it with `bash scripts/prepare_docs.sh`.

## 5. Commit and push

=== "Using GitHub Desktop"

    1. Check the changed files in the left sidebar and write a summary at the bottom left.
    2. Click **Commit to eeg-filter-section** (your branch name, never `main`).
    3. Click **Publish branch** (later pushes: **Push origin**).

    If you are still on `main`, GitHub Desktop warns you before committing. Click **switch branches**, create your branch, and your changes move with you.

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

    Your local `main` still has the commits that GitHub's `main` does not. Once your pull request is open, reset it with `git switch main && git reset --hard origin/main`. In GitHub Desktop, run these lines from **Repository** > **Open in Terminal** (or **Open in Command Prompt**), or ask us.

## 6. Open a pull request

=== "Using GitHub Desktop"

    Click **Preview Pull Request**, then **Create Pull Request**. GitHub opens in your browser with your branch already selected; add a title and a short description and click **Create pull request**.

=== "Using the CLI"

    Open the link that `git push` printed, or the yellow **Compare & pull request** banner on the [lab repository](https://github.com/HOPLAB-LBP/hoplab-wiki), add a title and a short description and click **Create pull request**.

The lab's reviewers (the `reviewers` team) are asked to review automatically, and the bot comments with the [check results and a preview](../contribute.md#after-you-open-a-pull-request). Not finished yet? Use the arrow next to the button to create a draft pull request instead, and click **Ready for review** when you are done.

To change the pull request, commit and push to the same branch again. Suggestions you commit on GitHub and small fixes we push are commits too, so pull before you continue (GitHub Desktop: **Fetch origin** > **Pull origin**; CLI: `git pull`).

## 7. After the merge

We squash-merge the pull request: your branch becomes one commit on `main`, the branch is deleted on GitHub, and the site updates a few minutes later. Switch back to `main`, pull, and delete your local branch (GitHub Desktop: **Branch** > **Delete...**; CLI: `git switch main && git pull && git branch -D eeg-filter-section`). Start the next change from [step 3](#3-start-a-branch).

## Troubleshooting

??? failure "Push declined due to repository rule violations"
    You committed on `main`, which only accepts changes through pull requests. Move your commits to a branch as described in [step 5](#5-commit-and-push), under "Push declined, or you committed on `main` by mistake".

??? failure "Permission denied, or GitHub asks for a password when you push"
    GitHub does not accept your account password for git. Sign in once in one of these ways:

    - GitHub Desktop: **File** > **Options** > **Accounts** (Windows) or **GitHub Desktop** > **Settings** > **Accounts** (macOS).
    - Command line: install [GitHub CLI](https://cli.github.com/), run `gh auth login`, choose HTTPS and answer yes when it asks to authenticate Git with your GitHub credentials.
    - GitHub Desktop on Linux: create a [fine-grained personal access token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token), then follow "Manually temporary resolving this issue for a single git repository" in [this issue](https://github.com/shiftkey/desktop/issues/217#issuecomment-934660228).

    If you still get "permission denied", check that you are a member of HOPLAB-LBP (see [Before you start](../contribute.md#before-you-start)).

More help: the [MkDocs documentation](https://www.mkdocs.org/), the [MkDocs Material documentation](https://squidfunk.github.io/mkdocs-material/), or [e-mail Andrea](mailto:andreaivan.costantino@kuleuven.be).
