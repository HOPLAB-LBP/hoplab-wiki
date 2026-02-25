# Test fixtures: BROKEN MkDocs Material syntax
# All patterns below should be flagged by check_mkdocs_syntax.py.
# Expected issues are noted in comments above each section.

## 1. Missing blank line after tab header [auto-fixable]

=== "No Blank Line"
    Content right after header.

=== "Also No Blank"
    - List right after header

## 2. Bad admonition content indent [manual]

!!! note
 Only 1 space indent — content falls outside admonition.

## 3. Code at column 0 in indented fence [manual]

=== "Code Tab"

    ```bash
code at column 0
    more code properly indented
    ```

## 4. Tab content under-indented [manual]

=== "Shallow"

  Only 2 spaces, should be 4.

## 5. Admonition inside tab with wrong indent [manual]

=== "Bad Nested"

    !!! note
    Content at 4 spaces, but should be 8 (4 for tab + 4 for admonition).
