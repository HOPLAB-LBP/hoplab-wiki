# Test fixtures: valid MkDocs Material syntax
# All patterns below should pass the check_mkdocs_syntax.py linter with 0 issues.

## Normal tabs with blank line after header

=== "Tab One"

    Content properly formatted.

=== "Tab Two"

    More content.

## Nested tab inside admonition

!!! example
    === "Nested Tab"

        Nested content here.

## Code block with URL (should NOT flag URL)

```bash
git clone https://github.com/example/repo.git
```

## Collapsible admonitions

???+ note "Expandable note"
    This is expanded by default.

??? warning "Collapsed warning"
    Hidden content.

## Tab with tilde fence inside

=== "Tilde Test"

    ~~~python
    print("hello")
    ~~~

## Setext heading (should NOT be mistaken for tab)

Some text
===

## Bullet points with code blocks inside tabs

=== "Python"

    - Install the package:
        ```bash
        pip install numpy
        ```
    - Verify:
        ```python
        import numpy as np
        print(np.__version__)
        ```

=== "R"

    - Install:
        ```r
        install.packages("tidyverse")
        ```

## Admonition inside a tab

=== "Setup"

    Follow these steps:

    !!! warning
        Make sure you have admin rights before proceeding.

    1. Download the file
    2. Run the installer

=== "Usage"

    !!! tip "Pro tip"
        Use keyboard shortcuts for speed.

## Nested admonitions (collapsible inside regular)

!!! note "Outer admonition"
    Some content here.

    ??? info "Click to expand"
        Hidden details inside outer admonition.

## Code block inside admonition inside tab

=== "Example"

    !!! example "Code sample"
        Here is the code:

        ```python
        def hello():
            print("world")
        ```

## Tab with only a code block

=== "Snippet"

    ```bash
    echo "hello world"
    ```

## Multiple paragraphs in admonition

!!! note
    First paragraph of the admonition.

    Second paragraph still inside.

    - A list item
    - Another item

## Collapsible with inline code in title

???+ tip "Use `conda activate` to switch"
    Content here.

## Smart apostrophes inside titles (allowed)

??? failure "Mirror doesn't fit in the bore"
    Check the washcloths.
