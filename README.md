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
- If you plan on following the [Advanced Workflow](#how-to-contribute-advanced-workflow) (encouraged for more complex changes), also make sure that you have [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html), and git or GitHub Desktop installed.

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

#### Adding Images

1. **Upload Images:**
   - Navigate to the `assets/` folder in your forked repository.
   - Click on "Add file" > "Upload files".
   - Select the image files from your computer and upload them to the `assets/` folder.
   - Add a commit message describing the image upload.
   - Select "Commit directly to the `main` branch" in your fork and click "Commit changes".

2. **Get the Link for Uploaded Images:**
   - Go to the `assets/` folder in your forked repository.
   - Click on the uploaded image file.
   - Click on the "Download" button to open the image in a new tab.
   - Copy the URL from the address bar.

3. **Add Images in Markdown:**
   - To add an image in your Markdown file, use the following syntax:
     ```markdown
     ![Alt text](URL)
     ```
   - Replace `Alt text` with a description of the image and `URL` with the link you copied.

## How to Contribute - Easy Workflow

This is the suggested workflow for smaller changes to the Wiki. The easiest way to update the Wiki is to create or edit the Markdown files in a separate branch, and open a Pull Request (PR) to merge the changes into the main branch. This workflow does not require any knowledge of git, and can be performed end-to-end in your browser. Here’s how to do it:

!!! question "How should I organize my PR?"
    A [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) (or PR) "*is a proposal to merge a set of changes from one branch into another*". Ideally, a PR should include all the commits **for a specific feature** or bugfix from end-to-end. Avoid making PRs that contain multiple unrelated changes. For instance, if you are working on a feature that requires modifications across multiple files, ensure all those changes are included in the same PR. Conversely, avoid combining changes for different features (e.g., adding unrelated updates to the fMRI workflow and the getting started section) in a single PR. Each PR should represent a cohesive unit of work.

### Step 1: Make your changes 

  a. **To edit an existing page:**
    - Navigate to the [`HOPLAB-LBP/hoplab-wiki`](https://github.com/HOPLAB-LBP/hoplab-wiki) repository.
    - Click on the file you want to edit (usually, in `docs/`).
    - Click on the pencil icon (✏️) at the top right to edit the file.
  
  b. **To create a new page:**
    - Navigate to the `mkdocs.yml` file.
    - Click on the pencil icon (✏️) at the top right to edit the file.
    - Add the new page (e.g., `docs/new-page.md`) to the `nav` section and commit (follow the steps in the section 2 below).
    - In the `docs` folder, click on "Add file" > "Create new file".
    - Enter a name for your file in the `docs` directory (the same you used before, e.g., `docs/new-page.md`).
       
You can then add/edit your content in Markdown format (see [Editing the Wiki](#editing-the-wiki) for more info), and click on "Preview" next to the "Edit" tab to see how your changes will look like. Once you are happy with the Preview of your changes, you can commit them to a temporary branch (see below).

### Step 2: Commit changes to a temporary branch

- Click on "Commit changes" after any necessary adjustments.
- In the pop-up window, and add a commit message and description for your changes.
- Select "Create a new branch for this commit and start a pull request".
- Choose an informative name for the new branch (usually, "yourusername-tag", e.g., "costantinoai-fmri").
- Click on "Propose changes".

### Step 3: Submit a PR with your proposed changes 

- In the "Open a pull request page", add an informative title and a description of the changes in the PR.
- In the right panel, make sure to assign an admin (as of July 2024, [@costantinoai](https://github.com/costantinoai)) to review your changes.
- Click on "Create pull request" to submit your changes.

These steps above will create a new branch in the repository, that will be visible in the [branches list](https://github.com/HOPLAB-LBP/hoplab-wiki/branches), and a new PR visible in the [PRs list](https://github.com/HOPLAB-LBP/hoplab-wiki/pulls). Once the PR is approved by at least one reviewer and merged into the main branch, the newly created branch will be automatically deleted.
         
!!! tip
    If you want to make additional changes related to an already opened PR (e.g., you need to change info in two separate files, or make additional adjustments), you do not need to open a new PR. Just go in the main page of the branch your created (you can find the branch in the [branches list](https://github.com/HOPLAB-LBP/hoplab-wiki/branches)) and **keep editing your files in this branch**. Every new commit you make in this branch will have the option to "Commit directly to the <name-of-new-branch> branch" or "Create a new branch for this commit and start a pull request". Make sure you select the first option to include your new commits to the original PR. Importantly, if you plan to add several commits to a PR this way, make sure you assign a reviewer **only after your last commit** to avoid merging PRs halfway in the process.
   

## How to Contribute - Advanced Workflow

The preferred way to contribute if you need to make significant/multiple changes, but it requires some familiarity with git, Python, and Conda environments. With this workflow, you will make and preview all the edits locally (on your computer). This allows for more control and flexibility, as it lets you see your changes in a live session. 

!!! question "How should I organize my PR?"
    A [Pull Request](https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/about-pull-requests) (or PR) "*is a proposal to merge a set of changes from one branch into another*". Ideally, a PR should include all the commits **for a specific feature** or bugfix from end-to-end. Avoid making PRs that contain multiple unrelated changes. For instance, if you are working on a feature that requires modifications across multiple files, ensure all those changes are included in the same PR. Conversely, avoid combining changes for different features (e.g., adding unrelated updates to the fMRI workflow and the getting started section) in a single PR. Each PR should represent a cohesive unit of work.

Here's a step-by-step guide that includes forking and cloning the repository, making and testing changes locally, and then submitting those changes for review through a pull request.

### Step 1: Forking the Repository and Cloning Your Fork

#### Using the Command Line Interface (CLI)

1. **Navigate to the Original Repository:**
   - Open your web browser and go to the GitHub page for the `hoplab-wiki` repository located under the `HOPLAB-LBP` organization.

2. **Fork the Repository:**
   - Click the "Fork" button at the top right corner of the repository page. This will create a copy of the repository under your GitHub account.

3. **Clone Your Fork:**
   - Click the "Code" button on your forked repository page and copy the URL.
   - Open your terminal (Command Prompt on Windows, Terminal on macOS and Linux) and navigate to the directory where you want to store the project, then type:
     ```bash
     git clone https://github.com/your-username/hoplab-wiki.git
     ```
   - Change into the directory of the cloned repository:
     ```bash
     cd hoplab-wiki
     ```

#### Using GitHub Desktop

1. **Navigate to the Original Repository:**
   - Open your web browser and go to the GitHub page for the `hoplab-wiki` repository located under the `HOPLAB-LBP` organization.

2. **Fork the Repository:**
   - Click the "Fork" button at the top right corner of the repository page. This will create a copy of the repository under your GitHub account.

3. **Open GitHub Desktop:**
   - If you do not have GitHub Desktop installed, download and install it from [GitHub Desktop's official website](https://desktop.github.com/).

4. **Clone Your Fork Using GitHub Desktop:**
   - Open GitHub Desktop.
   - In the top menu, click on `File > Clone Repository`.
   - In the "URL" tab, paste the URL of your forked repository from your GitHub account into the "Repository URL" field.
   - Choose the local path where you want to store the repository on your computer.
   - Click "Clone".

### Step 2: Setting Up Your Local Environment

1. **Install Conda:**
   - If you don't have Conda installed, download and install it from [Conda's official website](https://docs.conda.io/en/latest/miniconda.html).

2. **Create and Activate a Conda Environment:**
   - To create a new environment specifically for this project, type:
     ```bash
     conda create --name hoplab-wiki python=3.9
     ```
   - Activate the newly created environment by typing:
     ```bash
     conda activate hoplab-wiki
     ```

3. **Install Necessary Packages:**
   - With the Conda environment activated, install the required packages:
     ```bash
     pip install mkdocs mkdocs-material
     ```

### Step 3: Making Changes

1. **Edit Documentation:**
   - You can now make changes to your local clone of the documentation. Use a text editor or an IDE to open and edit the Markdown files in the repository.
   - If changes are extensive, consider splitting them into smaller, manageable commits that focus on specific pages or sections for clarity and ease of review.

### Step 4: Testing Your Changes Locally

1. **Serve the Documentation Locally:**
   - While in your project directory and with the Conda environment activated, launch the local server by typing:
     ```bash
     mkdocs serve
     ```
   - Open a web browser and navigate to `http://127.0.0.1:8000/`. This allows you to see your changes as they would appear on the live site.
   - Keep this server running as you make changes; refresh your browser to update the preview.

### Step 5: Closing the Local Server

1. **Stop the Server:**
   - When you are done previewing and editing and you are done with the changes, go back to the terminal where your server is running and press `Ctrl+C` to stop the server.

### Step 6: Committing Your Changes

#### Using the Command Line Interface (CLI)

1. **Stage and Commit Your Changes:**
   - From your terminal, add all modified files to your commit:
     ```bash
     git add .
     ```
   - Commit the changes, including a clear message about what was modified and why:
     ```bash
     git commit -m "Detailed description of changes"
     ```
   - Push your commits to the forked repository on GitHub:
     ```bash
     git push origin main
     ```

#### Using GitHub Desktop

1. **Stage and Commit Your Changes:**
   - In GitHub Desktop, you should see the list of changed files in the left sidebar.
   - Review the changes by clicking on each file.
   - Once you are ready to commit, write a summary of the changes in the "Summary" field at the bottom left.
   - Add a more detailed description in the "Description" field if necessary.
   - Click the "Commit to main" button.
   - In GitHub Desktop, click on the `Push origin` button at the top to push your commits to GitHub.
   
### Step 7: Creating a Pull Request

1. **Initiate a Pull Request:**
   - Navigate to your forked repository on GitHub.
   - Click on the "Pull requests" tab.
   - Click on "New pull request".
   - Choose the original repository's `main` branch as the base, and your fork's `main` branch as the compare.
   - Fill out the form to describe the changes.
   - In the right panel, make sure to assign an admin (as of July 2024, [@costantinoai](https://github.com/costantinoai)) to review your changes.
   - Click on "Create pull request" to submit your changes.   

!!! note Automatic Deployment with GitHub Actions
    This repository is set up to use GitHub Actions for automatic deployment. This means that every time changes are merged into the `main` branch, the documentation will automatically be built and deployed to GitHub Pages. You do not need to manually run the `mkdocs gh-deploy` command each time you make changes. Simply push your changes to the `main` branch, and GitHub Actions will handle the deployment. 

### Reviewing and Accepting Pull Requests (for Admins)

1. Go to the `hoplab-wiki` repository on GitHub.
2. Click on the "Pull requests" tab.
3. Review the pull request:
   
   - Check the changes.
   - Add comments if necessary.
   
4. If the changes are satisfactory, approve the changes and click "Merge pull request". This will delete the temporary branch. Alternatively, suggest edits to the contributor.

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
