# Hoplab Wiki

Welcome to the Hoplab Wiki repository. This Wiki is a work in progress and an ongoing effort to migrate all the Hoplab knowledge and procedures into a more user-friendly format. This process is currently managed by [@costantino_ai](https://github.com/costantinoai). For any questions, feel free to [ping me](mailto:andreaivan.costantino@kuleuven.be).

This guide will help you set up, update, and maintain the Wiki both locally and online. Follow the instructions if you want to make changes to the wiki.

## Table of Contents
{toc}

## Getting Started

Before you begin, ensure you have the following:
- A GitHub account
- Write access to the `hoplab-wiki` repository in the `HOPLAB-LBP` organization
- [Conda](https://docs.conda.io/projects/conda/en/latest/user-guide/install/index.html) or [Miniconda](https://docs.conda.io/en/latest/miniconda.html) installed

## Setting Up Your Local Environment

### Installing Dependencies

First, create a conda environment and install the necessary dependencies within this environment.

```sh
conda create --name hoplab-wiki python=3.9
conda activate hoplab-wiki
pip install mkdocs mkdocs-material
```

### Cloning the Repository

You can use GitHub Desktop for an easier experience, or Git from the command line.

#### Using GitHub Desktop
1. Open GitHub Desktop.
2. Click "File" > "Clone Repository".
3. Select the `hoplab-wiki` repository from the `HOPLAB-LBP` organization.
4. Choose a local path and click "Clone".

#### Using Git
1. Open your terminal (Command Prompt on Windows, Terminal on macOS and Linux).
2. Navigate to the directory where you want to clone the repository:
   ```sh
   cd path/to/your/directory
   ```
3. Clone the repository:
   ```sh
   git clone https://github.com/HOPLAB-LBP/hoplab-wiki.git
   ```
4. Navigate to the repository directory:
   ```sh
   cd hoplab-wiki
   ```

## Editing the Wiki

All the content of the wiki is written in Markdown files located in the `docs` directory. You can edit these files using any text editor or IDE (e.g., VSCode, Sublime Text).

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

## Building and Serving Locally

To preview your changes locally, you need to build and serve the documentation.

1. Open your terminal (Command Prompt on Windows, Terminal on macOS and Linux).
2. Navigate to the `hoplab-wiki` directory:
   ```sh
   cd path/to/your/hoplab-wiki
   ```
3. Activate your conda environment:
   ```sh
   conda activate hoplab-wiki
   ```
4. Serve the documentation locally:
   ```sh
   mkdocs serve
   ```
5. Open your browser and navigate to http://127.0.0.1:8000/.

## Deploying to GitHub Pages

To deploy your changes to GitHub Pages:

1. Commit your changes in GitHub Desktop or via Git:
   ```sh
   git add .
   git commit -m "Describe your changes"
   ```
2. Push your changes:
   ```sh
   git push origin main
   ```

### Automatic Deployment with GitHub Actions

This repository is set up to use GitHub Actions for automatic deployment. This means that every time changes are pushed to the `main` branch, the documentation will automatically be built and deployed to GitHub Pages.

#### What This Means for You

- You do not need to manually run the `mkdocs gh-deploy` command each time you make changes.
- Simply push your changes to the `main` branch, and GitHub Actions will handle the deployment.

## Contributing

We welcome contributions from all members.

### Easy Way (Discouraged)

The easiest but less preferred way to update the Wiki is to create a Markdown file locally (if you want to create a new page) or edit the Markdown files in the repository directly in your browser. Here’s how to do it:

1. Navigate to the `hoplab-wiki` repository on GitHub.
2. Go to the `docs` folder.
3. To edit an existing file:
   - Click on the file you want to edit.
   - Click on the pencil icon (✏️) at the top right to edit the file.
   - Make your changes and scroll down to the "Commit changes" section.
   - Add a commit message describing your changes.
   - Select "Commit directly to the `main` branch" and click "Commit changes".
4. To create a new file:
   - Click on "Add file" > "Create new file".
   - Enter a name for your file in the `docs` directory (e.g., `docs/new-page.md`).
   - Add your content in Markdown format.
   - Scroll down to the "Commit changes" section.
   - Add a commit message describing your new file.
   - Select "Commit directly to the `main` branch" and click "Commit new file".
5. Update the `mkdocs.yml` file:
   - Navigate to the `mkdocs.yml` file.
   - Click on the pencil icon (✏️) at the top right to edit the file.
   - Add the new page to the `nav` section.
   - Commit your changes directly to the `main` branch.

While this method is straightforward, direct changes to the `main` branch are discouraged as it bypasses the review process.

### Hard Way (Encouraged)

The preferred way to contribute is to clone the repository locally, make your changes, and create a pull request. This ensures that all changes are reviewed before being merged into the main codebase. Here’s how to do it using both GitHub Desktop and Git.

#### Using GitHub Desktop

1. Open GitHub Desktop.
2. Click "File" > "Clone Repository".
3. Select the `hoplab-wiki` repository from the `HOPLAB-LBP` organization and click "Clone".
4. Create a new branch:
   - Click "Branch" > "New Branch".
   - Enter a branch name (e.g., `your-branch-name`) and click "Create Branch".
5. Make your changes in the `docs` folder and update the `mkdocs.yml` file accordingly.
6. Commit your changes:
   - In GitHub Desktop, you should see your changes listed.
   - Enter a commit message describing your changes.
   - Click "Commit to your-branch-name".
7. Push your branch to GitHub:
   - Click "Push origin".
8. Create a pull request:
   - Go to the `hoplab-wiki` repository on GitHub.
   - Click on "Compare & pull request".
   - Add a description of your changes and submit the pull request.

#### Using Git

1. Open your terminal (Command Prompt on Windows, Terminal on macOS and Linux).
2. Navigate to the directory where you want to clone the repository:
   ```sh
   cd path/to/your/directory
   ```
3. Clone the repository:
   ```sh
   git clone https://github.com/HOPLAB-LBP/hoplab-wiki.git
   ```
4. Navigate to the repository directory:
   ```sh
   cd hoplab-wiki
   ```
5. Create a new branch for your changes:
   ```sh
   git checkout -b your-branch-name
   ```
6. Make your changes in the `docs` folder and update the `mkdocs.yml` file accordingly.
7. Stage your changes:
   ```sh
   git add .
   ```
8. Commit your changes:
   ```sh
   git commit -m "Describe your changes"
   ```
9. Push your branch to GitHub:
   ```sh
   git push origin your-branch-name
   ```
10. Create a pull request:
    - Go to the `hoplab-wiki` repository on GitHub.
    - Click on "Compare & pull request".
    - Add a description of your changes and submit the pull request.

### Reviewing and Accepting Pull Requests

1. Go to the `hoplab-wiki` repository on GitHub.
2. Click on the "Pull requests" tab.
3. Review the pull request:
   - Check the changes.
   - Add comments if necessary.
4. If the changes are satisfactory, click "Merge pull request".
5. Delete the branch after merging if it's no longer needed.

By following these steps, we ensure that all changes are properly reviewed and maintain the integrity of the `main` branch. Thank you for contributing to the Hoplab Wiki!

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
