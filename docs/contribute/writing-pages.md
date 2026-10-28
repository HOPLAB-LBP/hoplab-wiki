# Writing pages

Every page is a Markdown file in the `docs` folder of the lab repository. In the [easy workflow](../contribute.md#easy-workflow) you edit it on GitHub; in the [advanced workflow](advanced-workflow.md), in any text editor. This page has the Markdown you need most. The wiki's own building blocks (boxes, steps, tabs, cards, buttons, tables and more) are in the [Formatting gallery](formatting-gallery.md), each with the Markdown to copy.

## Formatting

- Headings: `## Heading`, `### Smaller heading` (the page title is the only `#` heading)
- Bold and italic: `**bold**`, `*italic*`
- Bullet list: `- Item`; numbered list: `1. Item`
- Link: `[link text](address)`; image: `![description](path/to/image.png)` (see [Links](#links) and [Images](#images))

For anything not here or in the gallery, see the [MkDocs Material reference](https://squidfunk.github.io/mkdocs-material/reference/).

## Links

Link to another wiki page with its path from the page you are editing, ending in `.md`. Say the page you edit is `docs/research/eeg/eeg-analysis.md`:

- A page in the same folder: `[Creating EEG tasks](eeg-task.md)`
- A page in a subfolder: `[EEG preprocessing](analysis/eeg-preprocessing.md)`
- A page in another folder: `[fMRI](../fmri/index.md)` (each `../` goes up one folder)
- A section of a page: `[Sending triggers](eeg-task.md#sending-triggers)`. To get the part after `#`, hover over the heading on the live wiki, click the link symbol next to it and copy the end of the address.
- A site outside the wiki: the full address, `[Hoplab website](https://www.hoplab.be/)`. To open it in a new tab, add `{target="_blank"}` right after it.

Make the link text say where the link goes ("the EEG preprocessing page", not "here"). The build check fails when a link points to a page or section that does not exist.

## Images

Put images in `docs/assets/`, in the folder of their section (for example `docs/assets/eeg/`). Name them in lowercase with hyphens between words, such as `photocell-setup.png`.

Link an image with its path from your page, like a page link, and describe it in the square brackets for readers who cannot see it:

| Your page is in | Write |
|---|---|
| `docs/` | `![The photocell taped to the screen](assets/eeg/photocell-setup.png)` |
| `docs/research/` | `![The photocell taped to the screen](../assets/eeg/photocell-setup.png)` |
| `docs/research/eeg/` | `![The photocell taped to the screen](../../assets/eeg/photocell-setup.png)` |

To set the width, add `{ width="500" }` after the image. Borders, captions and small icons are in the [Formatting gallery](formatting-gallery.md#images).

## Add a new page

1. Create a Markdown file in the folder where the page belongs, with a lowercase name and hyphens, for example `docs/research/eeg/eeg-montages.md`.
2. Add it to the `nav` section of `mkdocs.yml`, next to the pages it belongs with. Paths there start inside `docs/`:

    ```yaml
    - EEG:
      - research/eeg/index.md
      - Data acquisition: research/eeg/eeg-acquisition.md
      - EEG montages: research/eeg/eeg-montages.md
    ```

For a new group of pages, make a folder with an `index.md` (the overview page of the group) and nest the pages under a new heading in `nav`, as `EEG` above. A page that is not in `nav` makes the build check fail. Not sure where a page goes? Put it next to similar pages and say so in the pull request; we can move it.

## Open tasks and notes

Mark what still needs doing with a tag. A bot collects the tags of each page into one [GitHub issue](https://github.com/HOPLAB-LBP/hoplab-wiki/issues?q=is%3Aissue+label%3Adoc-tags), so open work is easy to find. There are three tags:

- `TODO`: something to do
- `PLACEHOLDER`: content still to write
- `NOTE`: a remark or reminder

Put them at the bottom of the page, inside a hidden comment so readers do not see them. Write each on its own line, starting with the tag in capitals and a colon, and add your name in square brackets:

```markdown
<!--
TODO: [Andrea] Fix the links to the fMRI section.
PLACEHOLDER: [Klara] Add the new ethics procedure.
NOTE: [Tim] The scanner booking system changed in 2025.
-->
```

Only capitals count: `Todo` or `note` are ignored. A tag outside a comment (for example `- TODO: ...` as a bullet) is collected too, but readers see it.

When a task is done, delete its line. The bot updates the issue on the next merge and closes it when the page has no tags left.

??? info "Add or close a task from the issue"
    Write a tag line in a comment on the page's issue (for example `TODO: check the references`). The bot adds it to the task list and replies with how to close it. To close it, react with 🚀 on the comment that created it; the bot removes the task on its next run.

??? info "What the issues look like"
    Each issue is titled with the number of open tasks and the page, such as `[5 open] Tags in docs/get-started/index.md`. It lists each task with a link: **(file)** opens the page source for editing, so you can delete the tag; **(comment)** opens the comment that added the task.

    Do not edit the issue text: the bot rewrites it on every run. Change the page or use the 🚀 reaction instead.
