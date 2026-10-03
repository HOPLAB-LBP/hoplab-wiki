# Advanced workflow (for extensive changes)

The preferred way to contribute if you need to make **significant/multiple changes**, but it requires some familiarity with git, Python, and Conda environments. If you are not a Wiki maintainer, this workflow is probably overkill.

With this workflow, you will make and preview all the edits locally (on your computer). This allows for more control and flexibility, as it lets you see your changes in a live session.

!!! tip "Unfamiliar with branches and pull requests?"
    This workflow relies on creating branches and opening pull requests. If these concepts are new to you, read the [Working with branches](https://hoplab-lbp.github.io/hoplab-wiki/research/coding/version-control.html#4-working-with-branches) and [Pull requests](https://hoplab-lbp.github.io/hoplab-wiki/research/coding/version-control.html#5-pull-requests) sections first.

!!! question "How should I organize my PR?"
    A [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) (or PR) "*is a proposal to merge a set of changes from one branch into another*". Ideally, a PR should include all the commits **for a specific feature** or bugfix from end-to-end. Avoid making PRs that contain multiple unrelated changes. For instance, if you are working on a feature that requires modifications across multiple files, ensure all those changes are included in the same PR. Conversely, avoid combining changes for different features (e.g., adding unrelated updates to the fMRI workflow and the getting started section) in a single PR. Each PR should represent a cohesive unit of work.

Here's a step-by-step guide that includes forking and cloning the repository, making and testing changes locally, and then submitting those changes for review through a pull request.

## Step 1: Forking the repository and cloning your fork

=== "Using the CLI"

    1. **Navigate to the original repository:**

        Open your web browser and go to the GitHub page for the `hoplab-wiki` repository located under the `HOPLAB-LBP` organization.

    2. **Fork the repository:**

        Click the "Fork" button at the top right corner of the repository page. This will create a copy of the repository under your GitHub account.

    3. **Clone Your Fork:**
        1. Click the "Code" button on your forked repository page and copy the URL.
        2. Open your terminal (Command Prompt on Windows, Terminal on macOS and Linux) and navigate to the directory where you want to store the project, then type:
           ```bash
           git clone https://github.com/your-username/hoplab-wiki.git
           ```
        3. Change into the directory of the cloned repository:
           ```bash
           cd hoplab-wiki
           ```

=== "Using GitHub Desktop"

    1. **Navigate to the Original Repository:**

        Open your web browser and go to the GitHub page for the `hoplab-wiki` repository located under the `HOPLAB-LBP` organization.

    2. **Fork the Repository:**

        Click the "Fork" button at the top right corner of the repository page. This will create a copy of the repository under your GitHub account.

    3. **Open GitHub Desktop:**

        If you do not have GitHub Desktop installed, download and install it from [GitHub Desktop's official website](https://desktop.github.com/).

    3. **Clone your fork using GitHub Desktop:**
        1. Open GitHub Desktop.
        2. In the top menu, click on `File > Clone Repository`.
        3. In the "URL" tab, paste the URL of your forked repository from your GitHub account into the "Repository URL" field.
        4. Choose the local path where you want to store the repository on your computer.
        5. Click "Clone".

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

## Step 3: Making changes

1. **Edit documentation:**
     You can now make changes to your local clone of the documentation. Use a text editor or an IDE to open and edit the Markdown files in the repository. If changes are extensive, consider splitting them into smaller, manageable commits that focus on specific pages or sections for clarity and ease of review.

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

## Step 6: Committing your changes

=== "Using the CLI"

    1. **Stage and commit your changes:**
        1. From your terminal, add all modified files to your commit:
          ```bash
          git add .
          ```
        2. Commit the changes, including a clear message about what was modified and why:
          ```bash
          git commit -m "Detailed description of changes"
          ```
    2. Push your commits to the forked repository on GitHub:
          ```bash
          git push origin main
          ```

=== "Using GitHub Desktop"

    1. **Stage and commit your changes:**
        1. In GitHub Desktop, you should see the list of changed files in the left sidebar.
        2. Review the changes by clicking on each file.
        3. Once you are ready to commit, write a summary of the changes in the "Summary" field at the bottom left.
        4. Add a more detailed description in the "Description" field if necessary.
        5. Click the "Commit to main" button.

    2. **Push your changes:**
        1. In GitHub Desktop, click on the `Push origin` button at the top to push your commits to GitHub.

## Step 7: Creating a pull request

1. Navigate to your forked repository on GitHub.
2. Click on the "Pull requests" tab.
3. Click on "New pull request".
4. Choose the original repository's `main` branch as the base, and your fork's `main` branch as the compare.
5. Fill out the form to describe the changes.
6. In the right panel, make sure to assign an admin (as of July 2024, [@costantinoai](https://github.com/costantinoai)) to review your changes.
7. Click on "Create pull request" to submit your changes.

!!! note "Automatic Deployment with GitHub Actions"
    This repository is set up to use GitHub Actions for automatic deployment. This means that every time changes are merged into the `main` branch, the documentation will automatically be built and deployed to GitHub Pages. You do not need to manually run the `mkdocs gh-deploy` command each time you make changes. Simply push your changes to the `main` branch, and GitHub Actions will handle the deployment.
