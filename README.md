# Hoplab Wiki

Welcome to the Hoplab Wiki repository. This Wiki is a work in progress and an ongoing effort to migrate all the Hoplab knowledge and procedures into a more user-friendly format. This process is currently managed by [@costantinoai](https://github.com/costantinoai). For any questions, feel free to [ping me](mailto:andreaivan.costantino@kuleuven.be).

This guide will help you set up, update, and maintain the Wiki both locally and online. Follow the instructions if you want to make changes to the wiki.

1. [Getting Started](#getting-started)
2. [Editing the Wiki](#editing-the-wiki)
3. [How to Contribute - Easy Workflow](#how-to-contribute---easy-workflow)
4. [How to Contribute - Advanced Workflow](#how-to-contribute---advanced-workflow)
5. [Reviewing and Accepting Pull Requests (for Admins)](#reviewing-and-accepting-pull-requests-for-admins)
6. [Troubleshooting](#troubleshooting)

## Getting Started

Before you begin, ensure you have the following:

- A GitHub account
- Write access to the `hoplab-wiki` repository in the `HOPLAB-LBP` organization
- If you plan on following the [Advanced Workflow](#how-to-contribute-advanced-workflow) (encouraged), also make sure that you have [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html) installed

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

For more information on Markdown formatting, refer to the Markdown Guide for [basic](https://www.markdownguide.org/basic-syntax/) and more [advanced](https://www.markdownguide.org/extended-syntax/) syntax.

## How to Contribute - Easy Workflow

The easiest ~~but less preferred~~ way to update the Wiki is to create or edit the Markdown files in the repository directly in your browser. Here’s how to do it:

1. Navigate to the `hoplab-wiki` repository on GitHub.
2. Go to the `docs` folder.
3. To **edit** an existing file:

	- Click on the file you want to edit.
	- Click on the pencil icon (✏️) at the top right to edit the file.
	- Make your changes (see [Editing the Wiki](#editing-the-wiki) for more info) and scroll down to the "Commit changes" section.
	- Add a commit message describing your changes.
	- Select "Commit directly to the `main` branch" and click "Commit changes".
     
4. To **create** a new file:

	- Click on "Add file" > "Create new file".
	- Enter a name for your file in the `docs` directory (e.g., `docs/new-page.md`).
	- Add your content in Markdown format (see [Editing the Wiki](#editing-the-wiki) for more info).
	- Scroll down to the "Commit changes" section.
	- Add a commit message describing your new file.
	- Select "Commit directly to the `main` branch" and click "Commit new file".
	- Navigate to the `mkdocs.yml` file.
	- Click on the pencil icon (✏️) at the top right to edit the file.
	- Add the new page to the `nav` section.
	- Commit your changes directly to the `main` branch.

While this method is straightforward, direct changes to the `main` branch are discouraged as it bypasses the review process.

## How to Contribute - Advanced Workflow

NOTE: although all the info above is correct, some actions in this workflow can have disruptive or unwanted consequences. Until we fix this, avoid this workflow if you are not familiar with git.

~~The preferred way to contribute, but~~ it requires some familiarity wit git and Python. Here's a step-by-step guide that includes forking the repository, making and testing changes locally, and then submitting those changes for review through a pull request. 

### Step 1: Forking the Repository

1. **Visit the Original Repository:**
   - Open your web browser and go to the GitHub page for the `hoplab-wiki` repository located under the `HOPLAB-LBP` organization.
   - This repository contains all the files and documentation you will need to work with.

2. **Fork the Repository:**
   - Click the "Fork" button located at the top right corner of the repository page. This action will create a copy of the repository in your own GitHub account, allowing you to make changes without affecting the original codebase.

### Step 2: Setting Up Your Local Environment

1. **Create and Activate a Conda Environment:**
   - Open your terminal (Command Prompt on Windows, Terminal on macOS and Linux).
   - To create a new environment specifically for this project, type:
     ```
     conda create --name hoplab-wiki python=3.9
     ```
   - Activate the newly created environment by typing:
     ```
     conda activate hoplab-wiki
     ```
   - Install necessary packages to work with MkDocs and the Material theme:
     ```
     pip install mkdocs mkdocs-material
     ```

### Step 3: Cloning Your Fork Locally

1. **Clone the Forked Repository:**
   - Ensure your terminal or command prompt is open.
   - Decide on a directory where you want to store the project, then navigate there:
     ```
     cd path/to/your/directory
     ```
   - Clone your fork using the URL from your repository on GitHub:
     ```
     git clone https://github.com/your-username/hoplab-wiki.git
     ```
   - Change into the directory of the cloned repository:
     ```
     cd hoplab-wiki
     ```

### Step 4: Making Changes

 1. **Edit Documentation:**
   - You can now make changes to the documentation. Use a text editor or an IDE to open and edit the Markdown files in the repository.
   - If changes are extensive, consider splitting them into smaller, manageable commits that focus on specific pages or sections for clarity and ease of review.

### Step 5: Testing Your Changes Locally

1. **Serve the Documentation Locally:**
   - While in your project directory and with the Conda environment activated, launch the local server by typing:
     ```
     mkdocs serve
     ```
   - Open a web browser and navigate to `http://127.0.0.1:8000/`. This allows you to see your changes as they would appear on the live site.
   - Keep this server running as you make changes; refresh your browser to update the preview.

### Step 6: Committing Your Changes

1. **Stage and Commit Your Changes:**
   - From your terminal, add all modified files to your commit:
     ```
     git add .
     ```
   - Commit the changes, including a clear message about what was modified and why:
     ```
     git commit -m "Detailed description of changes"
     ```
   - Push your commits to GitHub:
     ```
     git push origin main
     ```

### Step 7: Creating a Pull Request

After pushing your changes to GitHub, create a pull request to ensure that all changes are reviewed before being merged into the main codebase.
1. **Initiate a Pull Request:**
   - Go to your GitHub account and navigate to your fork of the `hoplab-wiki`.
   - Select "Pull requests" and then click "New pull request".
   - Choose the original repository as the base, and your repository branch as the compare.
   - Fill out the form to describe the changes made and then submit the pull request for review.
   - 

!!! note Automatic Deployment with GitHub Actions
    This repository is set up to use GitHub Actions for automatic deployment. This means that every time changes are pushed to the `main` branch, the documentation will automatically be built and deployed to GitHub Pages. You do not need to manually run the `mkdocs gh-deploy` command each time you make changes. Simply push your changes to the `main` branch, and GitHub Actions will handle the deployment.
    
### Step 8: Closing the Local Server

 1. **Stop the Server:**
   - When you are done previewing and editing, go back to the terminal where your server is running and press `Ctrl+C` to stop the server.

### Reviewing and Accepting Pull Requests (for Admins)

1. Go to the `hoplab-wiki` repository on GitHub.
2. Click on the "Pull requests" tab.
3. Review the pull request:
   
   - Check the changes.
   - Add comments if necessary.
   
4. If the changes are satisfactory, click "Merge pull request".
5. Delete the branch after merging if it's no longer needed.

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
