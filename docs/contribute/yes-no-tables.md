# Yes/no tables

Use a yes/no table when each row asks the same question of two or more options, and most answers are Yes or No. For a table of plain facts, use an ordinary [table](formatting-toolkit.md#tables).

## What it looks like

<div class="yn-table" markdown>

| What you want to enter | Copilot with KU Leuven login | Other AI tools |
|---|---|---|
| Public information: general questions, public web pages, code you have published | Yes | Yes |
| Unpublished research: data, results, plans, drafts of papers or grant applications, internal meeting notes | Yes | No |
| Personal data, including pseudonymised participant data | Yes | No |
| Health data and other special categories, such as brain MRI and screening forms | Only pseudonymised | No |
| Copyright-protected material, such as PDFs of papers and books | Yes | No |
| Data under a non-disclosure agreement, or with commercial potential | Yes | No |

</div>

## What you write

Write a normal Markdown table and put it inside `<div class="yn-table" markdown>`. Leave a blank line after the opening tag and before the closing one.

```markdown
<div class="yn-table" markdown>

| What you want to enter | Copilot with KU Leuven login | Other AI tools |
|---|---|---|
| Public information: general questions, public web pages, code you have published | Yes | Yes |
| Health data and other special categories, such as brain MRI and screening forms | Only pseudonymised | No |

</div>
```

## How cells are marked

The first column holds the row labels and stays as it is. In the other columns:

- a cell that says exactly `Yes` gets a green disc with a tick;
- a cell that says exactly `No` gets a red disc with a cross;
- any other text (`Only pseudonymised`, `Ask first`) gets an amber half-filled ring, for a conditional answer;
- an empty cell stays empty.

The word stays next to the icon, so the table still reads correctly without colour and with a screen reader. Keep conditional answers short: the detail belongs in the text under the table.
