# Hoplab Wiki 

Welcome to the Hoplab Wiki repository. This Wiki is a work in progress and an ongoing effort to migrate all the Hoplab knowledge and procedures into a more user-friendly format. This process is currently managed by [@costantinoai](https://github.com/costantinoai) and [@kschevenels](https://github.com/kschevenels). For any questions, feel free to [ping me](mailto:andreaivan.costantino@kuleuven.be). 

This guide will help you set up, update, and maintain the Wiki both locally and online. Follow the instructions if you want to make changes to the wiki.

1. [Getting Started](#getting-started)
2. [Editing the Wiki](#editing-the-wiki)
3. [How to Contribute - Easy Workflow](#how-to-contribute---easy-workflow)
4. [How to Contribute - Advanced Workflow](#how-to-contribute---advanced-workflow)
5. [Reviewing and Accepting Pull Requests (for Admins)](#reviewing-and-accepting-pull-requests-for-admins)
6. [Troubleshooting](#troubleshooting)

## Getting Started

Before you begin, ensure you have the following:

- A GitHub account.
- Be part of the `HOPLAB-LBP` organization.
- If you plan on following the [Advanced Workflow](#how-to-contribute-advanced-workflow) (encouraged for more complex changes), also make sure that you have [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html), and [git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git) or [GitHub Desktop](https://desktop.github.com/download/) (strongly encouraged) installed.

## Editing the Wiki

We welcome contributions from all members. All the content of the wiki is written in Markdown files located in the `docs` directory. You can edit these files in your browser (if you follow the [Easy Workflow](#how-to-contribute-easy-workflow) or locally using any text editor or IDE (e.g., VSCode, Sublime Text) if you follow the [Advanced Workflow](#how-to-contribute-advanced-workflow). 

### Adding a New Page

1. Create a new Markdown file in the `docs` directory (e.g., `docs/new-page.md`).
2. Add the new page to the `nav` section of `mkdocs.yml`:   
```yaml
nav:
  - Home: index.md
  - Guide: guide.md
  - New Page: new-page.md
```

### Creating Child Pages

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

### Common formatting syntax

- Use Markdown format to create or edit the files. Here are some common Markdown elements:
  - **Headers:** `# Header 1`, `## Header 2`, `### Header 3`, etc.
  - **Bold text:** `**bold text**`
  - **Italic text:** `*italic text*`
  - **Links:** `[link text](URL)`
  - **Lists:** 
    - Unordered list: `- Item 1`
    - Ordered list: `1. Item 1`
  - **Images:** `![Alt text](URL)`

For more information on Markdown formatting, refer to the [MkDocs Reference Guide](https://squidfunk.github.io/mkdocs-material/reference/) for more complex formatting syntax.

## How to Contribute - Easy Workflow

??? tip "Edit directly from this page!"
    Existing pages can be edited directly through the Wiki! If you need to edit or add information to any page, look for the paper and pencil symbol :material-file-edit-outline: at the top-right of the page, next to the page title. This will make you edit the page and open a PR either by creating a new branch on the main repo (if you are part of the Hoplab organization on GitHub) or by forking your own copy of the repo (if you are an external contributor). Make sure to [submit a PR](#step-3-submit-a-pr-with-your-proposed-changes) after your changes are made.
    
This is the suggested workflow for smaller changes to the Wiki. The easiest way to update the Wiki is to create or edit the Markdown files in a separate branch, and open a Pull Request (PR) to merge the changes into the main branch. This workflow does not require any knowledge of git, and can be performed end-to-end in your browser. Here’s how to do it:

### Step 1: Make your changes 

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
       
You can then add/edit your content in Markdown format (see [Editing the Wiki](#editing-the-wiki) for more info), and click on "Preview" next to the "Edit" tab to see how your changes will look like. Once you are happy with the Preview of your changes, you can commit them to a temporary branch (see below).

### Step 2: Commit changes to a temporary branch

1. Click on "Commit changes" after any necessary adjustments.
2. In the pop-up window, and add a commit message and description for your changes.
3. Select "Create a new branch for this commit and start a pull request".
4. Click on "Propose changes".

### Step 3: Submit a PR with your proposed changes 

1. In the "Open a pull request page", add an informative title and a description of the changes in the PR.
2. In the right panel, make sure to assign an admin (as of July 2024, [@costantinoai](https://github.com/costantinoai)) to review your changes.
3. Click on "Create pull request" to submit your changes.

??? tip "Add multiple commits to a single PR"
    If you want to make additional changes related to an already opened PR (e.g., you need to change info in two separate files, or make additional adjustments), you do not need to open a new PR. Just go in the main page of the branch your created (you can find the branch in the [branches list](https://github.com/HOPLAB-LBP/hoplab-wiki/branches)) and **keep editing your files in this branch**. Every new commit you make in this branch will have the option to "Commit directly to the <name-of-new-branch> branch" or "Create a new branch for this commit and start a pull request". Make sure you select the first option to include your new commits to the original PR. Importantly, if you plan to add several commits to a PR this way, make sure you assign a reviewer **only after your last commit** to avoid merging PRs halfway in the process, or you can create a draft PR until unti all your changes are included.
   
These steps above will create a new branch in the repository, that will be visible in the [branches list](https://github.com/HOPLAB-LBP/hoplab-wiki/branches), and a new PR visible in the [PRs list](https://github.com/HOPLAB-LBP/hoplab-wiki/pulls). Once the PR is approved by at least one reviewer and merged into the main branch, the newly created branch will be automatically deleted and the changes will go live.
         
## How to Contribute - Advanced Workflow

The preferred way to contribute if you need to make significant/multiple changes, but it requires some familiarity with git, Python, and Conda environments. With this workflow, you will make and preview all the edits locally (on your computer). This allows for more control and flexibility, as it lets you see your changes in a live session. 

!!! question "How should I organize my PR?"
    A [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) (or PR) "*is a proposal to merge a set of changes from one branch into another*". Ideally, a PR should include all the commits **for a specific feature** or bugfix from end-to-end. Avoid making PRs that contain multiple unrelated changes. For instance, if you are working on a feature that requires modifications across multiple files, ensure all those changes are included in the same PR. Conversely, avoid combining changes for different features (e.g., adding unrelated updates to the fMRI workflow and the getting started section) in a single PR. Each PR should represent a cohesive unit of work.

Here's a step-by-step guide that includes forking and cloning the repository, making and testing changes locally, and then submitting those changes for review through a pull request.

### Step 1: Forking the Repository and Cloning Your Fork

=== "Using the CLI"

    1.  **Navigate to the Original Repository:**
    
        1.  Open your web browser and go to the GitHub page for the `hoplab-wiki` repository located under the `HOPLAB-LBP` organization.
    
    2. **Fork the Repository:**
    
        1. Click the "Fork" button at the top right corner of the repository page. This will create a copy of the repository under your GitHub account.
    
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

        1. Open your web browser and go to the GitHub page for the `hoplab-wiki` repository located under the `HOPLAB-LBP` organization.
        2. **Fork the Repository:**
        3. Click the "Fork" button at the top right corner of the repository page. This will create a copy of the repository under your GitHub account.

    2. **Open GitHub Desktop:**

        1. If you do not have GitHub Desktop installed, download and install it from [GitHub Desktop's official website](https://desktop.github.com/).

    3. **Clone Your Fork Using GitHub Desktop:**

        1. Open GitHub Desktop.
        2. In the top menu, click on `File > Clone Repository`.
        3. In the "URL" tab, paste the URL of your forked repository from your GitHub account into the "Repository URL" field.
        4. Choose the local path where you want to store the repository on your computer.
        5. Click "Clone".

### Step 2: Setting Up Your Local Environment

1. **Install Conda:**

    1. If you don't have Conda installed, download and install it from [Conda's official website](https://docs.conda.io/en/latest/miniconda.html).

2. **Create and Activate a Conda Environment:**

    1. To create a new environment specifically for this project, type:
     ```bash
     conda create --name hoplab-wiki python=3.9
     ```
    2. Activate the newly created environment by typing:
     ```bash
     conda activate hoplab-wiki
     ```

3. **Install Necessary Packages:**

    1. With the Conda environment activated, install the required packages:
     ```bash
     pip install mkdocs mkdocs-material mkdocs-task-collector mkdocs-git-revision-date-localized-plugin
     ```

### Step 3: Making Changes

1. **Edit Documentation:**

    1. You can now make changes to your local clone of the documentation. Use a text editor or an IDE to open and edit the Markdown files in the repository.
    2. If changes are extensive, consider splitting them into smaller, manageable commits that focus on specific pages or sections for clarity and ease of review.

### Step 4: Testing Your Changes Locally

1. **Serve the Documentation Locally:**
    
    1. While in your project directory and with the Conda environment activated, launch the local server by typing:
     ```bash
     mkdocs serve
     ```
    2. Open a web browser and navigate to `http://127.0.0.1:8000/`. This allows you to see your changes as they would appear on the live site.
    3. Keep this server running as you make changes; refresh your browser to update the preview.

### Step 5: Closing the Local Server

1. **Stop the Server:**

    1. When you are done previewing and editing and you are done with the changes, go back to the terminal where your server is running and press `Ctrl+C` to stop the server.

### Step 6: Committing Your Changes

=== "Using the CLI"
    
    1. **Stage and Commit Your Changes:**
   
        1. From your terminal, add all modified files to your commit:
         ```bash
         git add .
         ```
        2. Commit the changes, including a clear message about what was modified and why:
         ```bash
         git commit -m "Detailed description of changes"
         ```
        3. Push your commits to the forked repository on GitHub:
         ```bash
         git push origin main
         ```

=== "Using GitHub Desktop"

    1. **Stage and Commit Your Changes:**
       
        1. In GitHub Desktop, you should see the list of changed files in the left sidebar.
        2. Review the changes by clicking on each file.
        3. Once you are ready to commit, write a summary of the changes in the "Summary" field at the bottom left.
        4. Add a more detailed description in the "Description" field if necessary.
        5. Click the "Commit to main" button.
        6. In GitHub Desktop, click on the `Push origin` button at the top to push your commits to GitHub.
   
### Step 7: Creating a Pull Request

1. **Initiate a Pull Request:**

    1. Navigate to your forked repository on GitHub.
    2. Click on the "Pull requests" tab.
    3. Click on "New pull request".
    4. Choose the original repository's `main` branch as the base, and your fork's `main` branch as the compare.
    5. Fill out the form to describe the changes.
    6. In the right panel, make sure to assign an admin (as of July 2024, [@costantinoai](https://github.com/costantinoai)) to review your changes.
    7. Click on "Create pull request" to submit your changes.   

!!! note "Automatic Deployment with GitHub Actions"
    This repository is set up to use GitHub Actions for automatic deployment. This means that every time changes are merged into the `main` branch, the documentation will automatically be built and deployed to GitHub Pages. You do not need to manually run the `mkdocs gh-deploy` command each time you make changes. Simply push your changes to the `main` branch, and GitHub Actions will handle the deployment. 

### Reviewing and Accepting Pull Requests (for Admins)

1. Go to the `hoplab-wiki` repository on GitHub.
2. Click on the "Pull requests" tab.
3. Review the pull request (Approve changes or suggest edits)
4. When the changes are satisfactory, approve the changes and click "Merge pull request". This will delete the temporary branch.

## Troubleshooting

### Permission Denied or Authentication Issues

If you encounter issues with pushing to the repository, you may need to use a personal access token. Follow these steps:

1. Create a fine-grained personal access token [here](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens#creating-a-fine-grained-personal-access-token).
2. Use this token for authentication when pushing to the repository. More information on how to do so can be found on [this issue](https://github.com/shiftkey/desktop/issues/217#issuecomment-934660228). Please, first get a fine-grained Personal Access Token as described in the link above, and then follow the instructions in the "Manually temporary resolving this issue for a single git repository" section.

### Additional Help

For further assistance, refer to the following resources:

- [MkDocs Documentation](https://www.mkdocs.org/)
- [MkDocs Material Theme](https://squidfunk.github.io/mkdocs-material/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)

Or [ping](mailto:andreaivan.costantino@kuleuven.be) me.

Thank you for contributing to the Hoplab Wiki!

**TODO:** : add to the readme how to reference/link other sections, both locally and remotely (e.g., `[link](path/file.md)`)
**TODO:** : explain how to hide navigation tab for pages with no children
**TODO:** : make more explicit that you can edit pages just by clicking the icon in the wiki
**TODO:** : make tree of the hoplab Gdrive and put it in teams
**TODO:** : build empty pages with TODO for urgent info missing
**TODO:** : build indexes (landing pages for parent sections, e.g., the "Getting started" page) + explain [how to](https://squidfunk.github.io/mkdocs-material/setup/setting-up-navigation/#section-index-pages)
**TODO:** : add more information about **coding practices**!! and how to properly create a conda environment, set up a project on Spyder, and sync with GH for version control and collaboration. We need to come up with a solid workflow and explanations on how to organize folders/scripts correctly.
