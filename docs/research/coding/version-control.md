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

By following these practices, you can ensure smoother collaboration and minimize common issues when working with Git and GitHub.
