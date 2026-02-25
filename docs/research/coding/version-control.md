# Version control with Git and GitHub

Version control is crucial for collaborative coding and tracking changes in your projects. This page covers how to set up and use Git and GitHub, including practical tips for effective collaboration.

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

## 3. Using GitHub

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

## 4. Workflow tips for effective collaboration

1. **Always pull before making changes**:
    - Before starting any work, ensure your local repository is up-to-date with the latest changes:

       ```bash
       git pull origin main
       ```

    - This prevents merge conflicts and keeps your local version in sync with the remote repository.

2. **Typical workflow**:
    - **Fetch updates**:

       ```bash
       git fetch
       ```

    - **Pull latest changes**:

       ```bash
       git pull origin main
       ```

    - **Make edits**: Modify files as needed.
    - **Stage changes**:

       ```bash
       git add .
       ```

    - **Commit changes** with a clear message:

       ```bash
       git commit -m "Describe the changes made"
       ```

    - **Push to remote**:

       ```bash
       git push origin main
       ```

3. **Commit often, but meaningfully**:
    - Frequent commits help track your progress, but ensure each commit is meaningful and descriptive.

---

## Common Git issues

??? failure "Merge conflict"
    **Issue**: This occurs when changes are made in the same part of a file in both the local and remote versions.

    **Solution**:
    - Resolve the conflict manually in the affected file.
    - Stage the resolved file:
       ```
       git add <file>
       ```
    - Commit the resolution:
       ```
       git commit -m "Resolved merge conflict in <file>"
       ```

??? failure "Detached HEAD"
    **Issue**: Happens when you are not on a branch but on a specific commit.

    **Solution**:
    - Switch back to your branch:
       ```
       git checkout main
       ```

??? failure "Push rejected"
    **Issue**: Your push was rejected because the remote has changes that you don't have locally.

    **Solution**:
    - Pull the latest changes, resolve any conflicts, and try pushing again:
       ```
       git pull origin main
       git push origin main
       ```

??? failure "Failed to push some refs"
    **Issue**: Occurs when there are changes on the remote that need to be merged before pushing.

    **Solution**:
    - Run:
       ```
       git pull --rebase origin main
       ```
    - This replays your changes on top of the pulled changes and then allows you to push again.

??? failure "Changes not staged for commit"
    **Issue**: Files were modified but not added to the staging area.

    **Solution**:
    - Add the changes to the staging area:
       ```
       git add <file>
       ```
    - Or add all changes:
       ```
       git add .
       ```

??? failure "File deleted locally, but not in remote"
    **Issue**: A file was deleted locally but still exists in the remote repository.

    **Solution**:
    - To stage the deletion:
       ```
       git rm <file>
       ```
    - Commit and push the change:
       ```
       git commit -m "Deleted <file>"
       git push origin main
       ```

??? failure "Authentication failed"
    **Issue**: This happens if your credentials are incorrect or have expired.

    **Solution**:
    - Update your Git credentials:
       ```
       git config --global credential.helper store
       ```
    - Re-run the `git push` command, and enter your credentials when prompted.

??? failure "Branch not found"
    **Issue**: Occurs when you try to checkout a branch that doesn't exist locally or remotely.

    **Solution**:
    - Create the branch:
       ```
       git checkout -b branch-name
       ```
    - Or fetch all remote branches:
       ```
       git fetch --all
       ```

??? failure "Untracked files"
    **Issue**: New files are created locally but not yet added to Git.

    **Solution**:
    - Stage the files:
       ```
       git add <file>
       ```
    - To ignore certain files, add them to `.gitignore`.

??? failure "File size too large"
    **Issue**: Git prevents files larger than 100MB from being pushed.

    **Solution**:
    - Use [Git Large File Storage (LFS)](https://git-lfs.github.com/) to manage large files:
       ```
       git lfs install
       git lfs track "<file-pattern>"
       git add <large-file>
       git commit -m "Add large file using Git LFS"
       git push origin main
       ```
    - Alternatively, remove the large file and add it to `.gitignore`:
       ```
       git rm --cached <large-file>
       echo "<large-file>" >> .gitignore
       git commit -m "Remove large file and update .gitignore"
       git push origin main
       ```

??? failure "Repository size exceeds limit"
    **Issue**: GitHub imposes a repository size limit, typically 1GB for free accounts.

    **Solution**:
    - Clean up your repository by removing large files from history using `git filter-branch` or tools like [BFG Repo-Cleaner](https://rtyley.github.io/bfg-repo-cleaner/):
       ```
       bfg --delete-files <large-file>
       git reflog expire --expire=now --all && git gc --prune=now --aggressive
       git push --force
       ```
    - If large files are essential, consider hosting them elsewhere (e.g., cloud storage) and linking to them.

??? failure "Packfile too large"
    **Issue**: This error can occur when trying to push a repository with a large packfile.

    **Solution**:
    - Reduce the size of the packfile:
       ```
       git gc --aggressive --prune=now
       ```
    - If the repository is still too large, consider splitting it into smaller repositories.

??? failure "History contains large files"
    **Issue**: Even if a large file has been deleted, it may still be present in the repository history.

    **Solution**:
    - Remove the file from history with:
       ```
       git filter-branch --tree-filter 'rm -f <large-file>' HEAD
       git push origin --force
       ```
    - Note: Use `git filter-branch` carefully as it rewrites history.

---

By following these practices, you can ensure smoother collaboration and minimize common issues when working with Git and GitHub.
