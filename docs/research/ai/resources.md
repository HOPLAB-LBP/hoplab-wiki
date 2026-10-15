# Resources

Tools, rules and templates that help you follow the [KU Leuven rules](kuleuven-rules.md) and the [lab guidelines](lab-guidelines.md). For a worked sequence of prompts, start with [Your first project](first-project.md).

| Resource | What it does |
|---|---|
| [Hoplab project template](#project-template) | A ready project for working with coding agents: folder layout, rules for agents, settings, skills and tests |
| [Writing code with AI](#writing-code-with-ai) | Ten rules that work, with practices from Poldrack's book |
| [Reference checker](#check-your-references) | Checks that every DOI in a BibTeX file exists and matches its title |
| [Disclosure templates](#templates-for-disclosure) | Sentences for papers, theses, repositories and slides |

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

    The [project template](#project-template) comes with a rules file for agents, `AGENTS.md`.

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

## Project template

The [Hoplab project template](https://github.com/HOPLAB-LBP/hoplab-project-template) is where the lab keeps its rules, settings and skills for coding agents, in one place. Start a new analysis project from it (**Use this template** on GitHub) and you get:

- `AGENTS.md`: the rules every agent reads first, starting with the lab's golden rules (plan with your approval, every analysis step visible in the script, libraries first, no repeated code, traceable results, known-answer tests, a permanent decision log, no confidential material without asking);
- a layout with numbered analysis scripts that save their results with a record of the settings, code version and inputs, one script per figure in a shared journal style, and a doc page per step;
- settings for Claude Code and Codex (below);
- skills and two helper agents (below);
- tests, including known-answer tests on simulated data, and a small decoding and RSA example.

The template's README explains how to start, and which agents read which files.

### What the settings do

| Tool | With the template's settings | What they do not do |
|---|---|---|
| Claude Code | Asks before every file edit and every command; cannot be started in the mode that skips approvals; its own tools cannot read `data/`, `.env` or key files | A Python script the agent runs can still read `data/` |
| Codex | Commands run in a read-only sandbox, so every file edit and every command that writes asks you first, and you approve yourself rather than an automatic reviewer | Codex can read files anywhere on your computer; the settings load only after you trust the project folder |

Settings lower the risk. They do not replace the [lab guideline](lab-guidelines.md): keep participant data and other confidential material out of the agent's reach.

### Skills and helper agents

A skill is a short procedure that the agent loads when your request matches it. You do not call skills by name; ask in plain words.

| Ask, for example | Skill | What happens |
|---|---|---|
| "Add a permutation test to step 2" (any task with three or more steps) | `task-ledger` | The agent writes a plan in `tasks/`, waits for your OK, then ticks each step only with evidence |
| "Review my last commit" | `review-code` | A review of the change, with one line per golden rule |
| "Test this analysis before I run it on real data" | `known-answer-test` | The analysis runs on simulated data with and without a planted effect |
| "Is this decoding valid?" | `analysis-audit` | Leakage, cross-validation, transformations, significance tests, permutations, chance level, corrections |
| "Does the paper match the code?" | `paper-code-audit` | Methods text against code and settings, and every number against the results files |
| "Check my references" | `cite-check` | Every reference resolves to a real paper; each citation is checked against the claim |
| "Make figure 2 with panels for ..." | `manuscript-figures` | A multi-panel figure in the lab's style, from the saved results |
| "Clean up the code" | `repo-cleanup` | A separate cleanup agent reports duplicates, hidden steps and hand-written library functions, then fixes what you approve, with the results unchanged |
| "Is this result real?" | `skeptic` | A separate agent that has not seen how the result was made recomputes it and tries to break it |

Skills that read a manuscript, unpublished results or paper PDFs ask you first whether the material may be sent to the tool; under the KU Leuven rules the answer for unpublished work is no unless you use Copilot with your KU Leuven login.

Other labs share skills too. Michael Frank's [skill for R Markdown and Quarto manuscripts](https://gist.github.com/mcfrank/bb6bfed4c8294fdeb08b0f09442711c7) keeps agents out of manuscript text, and the Matsen lab describes its set of agents and skills in [Bipartite](https://matsen.fredhutch.org/general/2026/06/06/bipartite.html).

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
