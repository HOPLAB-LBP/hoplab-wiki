# Resources

Files, settings, skills and templates that help you follow the [KU Leuven rules](kuleuven-rules.md) and the [lab guidelines](lab-guidelines.md), and ten rules for writing code with AI. Copy what fits your project and adapt it.

For a worked sequence of prompts, start with [Your first project](first-project.md). For the skill review, project setup and multi-panel figure examples, see [Research skills](skills.md).

| Resource | What it does | Where it goes |
|---|---|---|
| [Project rules file](#for-a-project) | Tells an agent about the project, the data and how we work | `AGENTS.md` at the top of the repository |
| [Personal rules file](#for-yourself) | Your own rules for every project | See the tool-specific locations below |
| [Agent settings](#agent-settings) | Keep coding agents away from data and secrets, and keep your approval on | `.claude/settings.json` or `.codex/config.toml` |
| [Skills](#skills) | Review AI-written code, test an analysis on simulated data, protect a manuscript | `.claude/skills/` or `.agents/skills/` |
| [Reference checker](#check-your-references) | Checks that every DOI in a BibTeX file exists and matches its title | Run it on your `.bib` file |
| [Disclosure templates](#templates-for-disclosure) | Sentences for papers, theses, repositories and slides | Adapt and paste |

---

## Writing code with AI

Eric Bridgeford, Russ Poldrack and colleagues summed up what works in ten rules for AI-assisted coding in science ([Bridgeford et al., 2025](https://doi.org/10.48550/arXiv.2510.22254)), and Poldrack's book [Better Code, Better Science](https://bettercodebetterscience.github.io/bettercode/book-ai-coding-assistants.html) uses them as a checklist. Here are the ten rules, each with the practices from the book that go with it.

??? numlist "Gather domain knowledge before you implement"
    Know your data (shapes, formats, missing values), the standard packages of the field (nilearn, MNE, rsatoolbox, scikit-learn) and existing implementations you could follow. AI can help with this survey: ask it for the usual approaches and for references, then check them. Take most care outside your own expertise. Poldrack lost several days letting an agent build a GPU version of a permutation test that his hardware could not support, because he trusted the model on a question he could not judge himself.

??? numlist "Separate framing the problem from writing the code"
    Breaking the problem into steps, choosing the method and designing the analysis are your job. Turning a clear specification into code is where AI is strong. You can only guide and review code in a language you know, so learn one well before you lean on AI.

??? numlist "Choose how you work with the AI"
    A chat assistant suits design questions, debugging and learning. An assistant in your editor suits completion and small refactorings. An agent suits changes across many files and quick prototypes, but it drifts and needs watching. An agent that writes a whole codebase at once quickly leaves you a stranger to your own code; small steps that you review keep you close to it.

??? numlist "Think through a solution before you prompt"
    Write down the inputs, the expected outputs, the constraints and the edge cases, what success looks like and how the code fits into the rest of the project. This tells the AI what you want and gives you a yardstick for its output. For a larger project, write it as a short plan that also lists what the code does not need to do (this stops the agent from adding features), correct the plan by hand, and let the agent work through it as a task list.

??? numlist "Manage the context"
    The model works from what is in its context, and it works less well as the context fills up. Give it what it needs at the start, restate key constraints in long sessions, and clear or compact the context at natural breakpoints. Keep the project's rules in `AGENTS.md`, and its plan, task list and decisions in separate files linked from it. When the agent does something you do not want again, add a rule.

    Ready-made rules files for a project and for yourself are [below](#rules-files).

??? numlist "Write the tests first"
    Describe what the code must do as tests before you ask for the code, and check that they fail while the code does not exist yet. Then watch every test the AI writes or changes. Agents often edit a test until it passes, mock the very function they should test, or feed it placeholder data, so the test passes and proves nothing. Other weak tests to look for: assertions that pass whatever the result, tests that only check that something was returned, exact comparisons of floating-point numbers, and modules without any test. When you find a bug, add a test that catches it. For analysis code, the strongest test is simulated data with a known answer.

??? numlist "Let AI help you find what your tests miss"
    Ask the AI for edge cases: boundary values, wrong types, empty or extreme inputs, numerical stability. Ask it to review your tests for gaps, and to write the set-up that runs the tests automatically (pre-commit hooks, GitHub Actions).

??? numlist "Watch the agent, and restart when it is lost"
    Do not leave an agent working alone for long. Stop it when it changes things you did not ask for, ignores what you did ask, or creates new problems while fixing old ones. Agents rarely notice that they need a new strategy, so make a branch before a risky task and commit after each step that works; you can then always go back. After each finished task, review the diff, update the task notes, commit, clear the context and reload the rules files. When a conversation is full of failed attempts, start a new one, with what you learned written into the rules.

??? numlist "Review the code critically"
    Agents often claim success, or report that all tests pass, when they have not solved the problem. Run the tests yourself and read the code against the plan you wrote. Look for the habits of AI-written code: errors silenced by a bare `try/except`, needlessly complex classes, leftovers of an earlier version (in one of Poldrack's examples, an old hard-coded file name made a check pass that should have failed), and docstrings or function names that do not match what the code does. Treat a result that looks too good as a sign of a bug, add a control that should fail, and ask a fresh session to look for problems.

??? numlist "Improve the code one goal at a time"
    Do not ask an AI to "improve the code". Name one change ("move the input checks into a separate function"), run the tests after it, and revert it if it breaks something or does not help. To translate code, for example from MATLAB to Python, first save the outputs of the original on a small dataset, then test the translation against them, one function at a time.

---

## Rules files

Coding agents read a rules file at the start of every session. Keep two: one per project, with what the agent must know about that project, and one for yourself, with your rules for every project. When an agent does something you do not want again, add a line.

### For a project

Save it at the top of the repository as `AGENTS.md` and fill in the parts in angle brackets. Use this one project rules file for both agents. [Codex loads it at startup](https://learn.chatgpt.com/docs/agent-configuration/agents-md). [Claude Code supports it directly](https://code.claude.com/docs/en/memory#agentsmd) from version 2.1.277; use an up-to-date version and check that its Project instructions setting includes `AGENTS.md`.

At the start of a new project, ask the agent to read `AGENTS.md` and summarise its constraints before editing. In Claude Code, also use `/memory` to check that the file is listed. If it is missing, check the version, Project instructions setting and competing project instructions using the linked documentation.

[:material-download: Download AGENTS.md](../../assets/ai/agents-project.txt){ .md-button download="AGENTS.md" }

??? example "Show the file"
    ```markdown
    --8<-- "docs/assets/ai/agents-project.txt"
    ```

### For yourself

For Codex, save it as `~/.codex/AGENTS.md`. For Claude Code, save the same personal rules as `~/.claude/rules/personal.md`, a [user-level rules file](https://code.claude.com/docs/en/memory#user-level-rules). These are personal preferences; the shared project contract remains `AGENTS.md`.

[:material-download: Download the personal rules file](../../assets/ai/agents-personal.txt){ .md-button download="personal-rules.md" }

??? example "Show the file"
    ```markdown
    --8<-- "docs/assets/ai/agents-personal.txt"
    ```

---

## Agent settings

These settings put [lab guideline 2](lab-guidelines.md) into practice: the agent asks before it edits a file or runs a command, and it cannot read data folders or secrets.

=== "Claude Code"

    Save the file as `.claude/settings.json` in the repository and commit it, so that everyone who works on the project gets the same settings. It blocks reading the folders `data/`, `sourcedata/` and `derivatives/`, `.env` files and key files; keeps the default mode, in which Claude Code asks before it edits a file or runs a command; and switches off the mode that skips all approvals (`--dangerously-skip-permissions`). Adapt the folder names to your project.

    [:material-download: Download settings.json](../../assets/ai/claude-settings.json){ .md-button download="settings.json" }

    On macOS, Linux or WSL2 you can use the variant with Claude Code's sandbox, which also stops programs that the agent runs, such as a Python script, from reading those folders. The variant keeps asking before every command.

    [:material-download: Download settings.json with sandbox](../../assets/ai/claude-settings-sandbox.json){ .md-button download="settings.json" }

    ??? example "Show both files"
        ```json
        --8<-- "docs/assets/ai/claude-settings.json"
        ```

        ```json
        --8<-- "docs/assets/ai/claude-settings-sandbox.json"
        ```

=== "Codex"

    Save the file as `.codex/config.toml` in the repository. Codex asks before it runs commands outside its sandbox, may edit files only inside the project, and its commands have no internet access.

    [:material-download: Download config.toml](../../assets/ai/codex-config.toml){ .md-button download="config.toml" }

    ??? example "Show the file"
        ```toml
        --8<-- "docs/assets/ai/codex-config.toml"
        ```

!!! warning "What the settings do not do"
    We tested the files with Claude Code 2.1.296 and Codex 0.162.1 on Linux. Claude Code's rules stop its own file tools and commands such as `cat` from reading `data/`, but a Python script that the agent runs can still read the folder; only the sandbox variant stops that. Codex's sandbox blocks writing outside the project and network access, but its commands can read files anywhere on your computer. Settings make mistakes less likely. They do not replace the lab guideline: run the agent where it cannot reach participant data.

---

## Skills

A skill is a folder with a `SKILL.md` file: instructions that the agent loads when a task matches the skill's description, or when you call it by name (`/review-ai-code` in Claude Code). Claude Code and Codex use the same format. Put each skill in its own folder:

- Claude Code: `.claude/skills/<name>/SKILL.md` in the repository, or `~/.claude/skills/<name>/SKILL.md` for all your projects;
- Codex: `.agents/skills/<name>/SKILL.md` in the repository, or `~/.agents/skills/<name>/SKILL.md` for all your projects.

These locations follow the current [Claude Code](https://code.claude.com/docs/en/skills#choose-where-skills-load) and [Codex](https://learn.chatgpt.com/docs/build-skills#where-codex-loads-local-skills) documentation. You can use the same skill contents with both tools. Read the instructions and any scripts before installing; a skill does not enforce permissions. See [Research skills](skills.md) for a review of these downloads and ideas for your own.

We tested the three skills below with Claude Code on small examples with planted problems.

??? deflist "review-ai-code: review changes written with an AI agent"
    Goes through a diff the way a careful colleague would: tests first (edited or loosened tests, mocks, placeholder data), then the code (silenced errors, leftovers, hard-coded paths, analysis choices nobody asked for). It reports problems with file and line and fixes nothing unless you ask. In our test it flagged a loosened test tolerance and an error handler that returned zeros as blocking problems.

    [:material-download: Download SKILL.md](../../assets/ai/skills/review-ai-code/SKILL.txt){ .md-button download="SKILL.md" }

    ??? example "Show the file"
        ```markdown
        --8<-- "docs/assets/ai/skills/review-ai-code/SKILL.txt"
        ```

??? deflist "known-answer-test: test an analysis on simulated data first"
    Builds a small simulation in the format of your data, with a planted effect and a version without one, and checks that the real analysis code finds the first and stays at chance on the second. It reports the numbers and does not change the analysis to make a test pass. In our test on a small decoding function it recovered the planted effects, gave chance on noise, and showed that a class with a single trial produced a plausible accuracy without any warning.

    [:material-download: Download SKILL.md](../../assets/ai/skills/known-answer-test/SKILL.txt){ .md-button download="SKILL.md" }

    ??? example "Show the file"
        ```markdown
        --8<-- "docs/assets/ai/skills/known-answer-test/SKILL.txt"
        ```

??? deflist "manuscript-guard: keep agents out of the text of a paper"
    For repositories that hold a paper or thesis. The agent may work on code, figures, the build and curated bibliography entries, but never on sentences, headings, captions or citations; it reports what it thinks should change and leaves the change to you. It follows the rule and workflow that [Michael Frank](https://babieslearninglanguage.blogspot.com/2026/06/help-me-but-dont-touch-paper.html) describes. In our test it reported a typo in a LaTeX file with its line and did not touch the file.

    [:material-download: Download SKILL.md](../../assets/ai/skills/manuscript-guard/SKILL.txt){ .md-button download="SKILL.md" }

    ??? example "Show the file"
        ```markdown
        --8<-- "docs/assets/ai/skills/manuscript-guard/SKILL.txt"
        ```

Other labs share skills too. Michael Frank's [skill for R Markdown and Quarto manuscripts](https://gist.github.com/mcfrank/bb6bfed4c8294fdeb08b0f09442711c7) is the original of the manuscript guard, and the Matsen lab describes its set of agents and skills in [Bipartite](https://matsen.fredhutch.org/general/2026/06/06/bipartite.html).

---

## Check your references

AI tools invent references, and they attach real DOIs to the wrong papers. This script reads a BibTeX file and checks every DOI: does it exist, and does the title at the DOI match the title in your file? It needs only Python.

```python
import difflib
import json
import re
import sys
import urllib.error
import urllib.parse
import urllib.request

HEADERS = {"User-Agent": "hoplab-doi-check (mailto:your.name@kuleuven.be)"}  # (1)!


def fetch_json(url):
    request = urllib.request.Request(url, headers=HEADERS)
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            return json.load(response)
    except urllib.error.HTTPError as err:
        if err.code == 404:
            return None
        raise


def simplify(text):
    return re.sub(r"[^a-z0-9 ]", "", re.sub(r"[{}\\]", "", text).lower())


def check(doi, bib_title):
    quoted = urllib.parse.quote(doi)
    record = fetch_json(f"https://api.crossref.org/works/{quoted}")  # (2)!
    if record is None:
        handle = fetch_json(f"https://doi.org/api/handles/{quoted}")  # (3)!
        if handle is None or handle.get("responseCode") != 1:
            return "NOT FOUND", ""
        return "EXISTS, title not checked", ""
    found = (record["message"].get("title") or [""])[0]
    score = difflib.SequenceMatcher(None, simplify(bib_title), simplify(found)).ratio()
    return ("OK" if score > 0.9 else "TITLE MISMATCH"), found  # (4)!


bib = open(sys.argv[1], encoding="utf-8").read()
for entry in re.split(r"\n(?=@)", bib):
    key = re.search(r"@\w+\{([^,]+),", entry)
    if not key:
        continue
    doi = re.search(r"\bdoi\s*=\s*[{\"]([^}\"]+)", entry, re.I)
    title = re.search(r"\btitle\s*=\s*[{\"](.+?)[}\"],?\s*\n", entry, re.I | re.S)
    if not doi:
        print(f"{key[1]}: NO DOI")
        continue
    status, found = check(doi[1].strip(), title[1] if title else "")
    print(f"{key[1]}: {status} ({doi[1]})")
    if status == "TITLE MISMATCH":
        print(f"    title at the DOI: {found}")
```

1. Crossref asks scripts to say who is calling. Put your own address here.
2. Crossref holds the metadata of most journal articles.
3. DOIs from other registries, such as arXiv, Zenodo or OSF, are not in Crossref. For these the script only checks that the DOI exists.
4. Titles are compared after removing case, braces and punctuation. Check every mismatch by hand: a mismatch can also come from a subtitle or a typo in your file.

Save the script as `check_dois.py` and run it on your bibliography:

```bash
python check_dois.py references.bib
```

??? example "An example file and its output"
    With this `references.bib`:

    ```bibtex
    @article{messeri2024,
      title = {Artificial intelligence and illusions of understanding in scientific research},
      author = {Messeri, Lisa and Crockett, M. J.},
      journal = {Nature},
      year = {2024},
      doi = {10.1038/s41586-024-07146-0},
    }

    @article{roth2025,
      title = {Ten simple rules for reproducible neuroimaging},
      author = {Roth, Johannes and Duan, Yunyan and others},
      journal = {Communications Psychology},
      year = {2025},
      doi = {10.1038/s44271-025-00236-3},
    }

    @misc{bridgeford2025,
      title = {Ten simple rules for {AI}-assisted coding in science},
      author = {Bridgeford, Eric W. and others},
      year = {2025},
      doi = {10.48550/arXiv.2510.22254},
    }

    @article{invented2026,
      title = {A paper that does not exist},
      author = {Nobody, A.},
      year = {2026},
      doi = {10.1234/does-not-exist.2026},
    }

    @book{nodoi,
      title = {A book without a DOI},
      author = {Someone, B.},
      year = {2020},
    }
    ```

    the script prints:

    ```text
    --8<-- "docs/assets/ai/check-dois-output.txt"
    ```

A clean run does not mean the references are right. Read at least the abstract of every paper you cite, and check that it supports the sentence it is cited for.

---

## Templates for disclosure

KU Leuven asks you to state AI use whenever it produced new content, and to state code generation explicitly, with a reference to the tool (see [Say how you used it](kuleuven-rules.md#say-how-you-used-it)). Adapt these sentences; keep them specific.

??? deflist "Methods: code written with AI"
    ```text
    Parts of the analysis code were written with [tool and version] ([company], [year]) between [month year] and [month year]. [Name] reviewed all generated code and tested it on simulated data with known effects before it was run on the real data. The code and the tests are available at [repository link].
    ```

??? deflist "Methods: other uses that produced content"
    ```text
    We used [tool and version] ([company], [year]) on [date] to [task, for example: draft a first overview of studies on X / suggest edge cases for the analysis]. We checked every suggestion against the original sources and wrote the text ourselves.
    ```

??? deflist "Acknowledgements: language help only"
    ```text
    The authors used [tool] to improve the language of the manuscript. The authors wrote and checked all content.
    ```
    KU Leuven does not require a statement for language help on your own text, but some journals do.

??? deflist "README of a repository"
    ```text
    Parts of this code were written with [tool] between [month year] and [month year]. Every change was reviewed by [name] and is covered by the tests in tests/.
    ```

??? deflist "Slides"
    ```text
    Analysis code written with [tool], reviewed by [initials].
    ```
    Put it as a small note on every slide that shows a result or a figure that AI helped to make.

??? deflist "PhD thesis"
    The Doctoral School Humanities and Social Sciences gives a [template](https://www.kuleuven.be/genai/generative-ai-and-doctoral-thesis.pdf) with a statement that every thesis needs, whether or not you used AI.

---

## Other tips

??? tip "Choose the right tool"
    - For questions, explanations and feedback on anything unpublished, use Copilot with your KU Leuven login.
    - For changes across several files of a git repository (refactoring, tests, documentation, translating code), a coding agent works well.
    - Literature tools such as Elicit, Consensus, Scite and Connected Papers are a starting point. Complete the search in a database and read the papers yourself.
    - Use no AI at all when you could not check the answer, or when the task is the skill you are learning.

??? tip "Use AI as a critic"
    Ask for criticism rather than text: what is wrong with this design, this analysis plan, this paragraph? Ask it to explain a colleague's script before you change it, or to quiz you on a method you are learning. For unpublished work, do this in Copilot with your KU Leuven login.

??? tip "Watch for hidden instructions"
    Web pages, PDFs and e-mails can contain text written for an AI, such as "ignore your previous instructions and ...". An agent that reads such content may follow it. Be careful when an agent reads files or pages you did not write, and check what it wants to do next.

---

## Further reading

- Poldrack, [Better Code, Better Science](https://bettercodebetterscience.github.io/bettercode/book-ai-coding-assistants.html), chapter 5: an open book on research code, with a long chapter on coding with AI and agents.
- [Bridgeford et al., 2025](https://doi.org/10.48550/arXiv.2510.22254): ten simple rules for AI-assisted coding in science (preprint).
- [Roth et al., 2025](https://doi.org/10.1038/s44271-025-00236-3): ten principles for reliable research code in psychology and cognitive neuroscience, with a box on AI code assistants.
- Matsen, [Agentic coding for scientists](https://matsen.fredhutch.org/agentic.html): a blog series on working with coding agents in a research group.
- Schuck, [How, when and why to use agentic AI in our neuroscience labs](https://www.thetransmitter.org/artificial-intelligence/how-when-and-why-to-use-agentic-ai-in-our-neuroscience-labs/) (The Transmitter, 2026), and the [AI policy](https://schucklab.gitlab.io/ai-policy.html) of his lab.

## Where next?

<div class="grid cards" markdown>

- :material-shield-check-outline: **KU Leuven rules**

    ---

    Which tool for which data, and what you must disclose.

    [KU Leuven rules](kuleuven-rules.md)

- :material-account-group-outline: **Lab guidelines**

    ---

    What we agree on in the Hoplab.

    [Lab guidelines](lab-guidelines.md)

- :material-source-branch: **Version control**

    ---

    Git and GitHub, the safety net for any work with a coding agent.

    [Version control](../coding/version-control.md)

</div>
