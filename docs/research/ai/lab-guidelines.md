# Lab guidelines

These are our own agreements. They build on the [KU Leuven rules](kuleuven-rules.md) and are stricter where our data or our training need it. If a guideline does not fit your project, talk to your supervisor.

---

??? numlist "Keep participant data out of AI tools"
    Our participant data are personal data that can rarely be fully anonymised, and brain MRI is special-category data under the GDPR (see the [RDM rules](../rdm/SOPs.md) and [fMRI anonymisation](../fmri/analysis/fmri-anonymization.md)). We therefore put no participant data into any AI tool, Copilot included, unless your supervisor agrees and the data are pseudonymised. Coding agents never see participant data: write and test the code on simulated or public data, and run it on the real data yourself.

??? numlist "Use coding agents only with your approval, in a folder without data"
    A coding agent sends the files it reads to its provider and can change anything in the folder it runs in. Following the KU Leuven rules on agentic AI and the ICTS [charter for AI-assisted coding](https://admin.kuleuven.be/icts/gen-ai/charter) (login):

    - start the agent in a project folder that holds code only: no participant data, no unpublished results, no passwords, tokens or `.env` files;
    - keep the setting in which the agent asks before it edits a file or runs a command, and never turn on a mode that skips approval (in Claude Code, `--dangerously-skip-permissions`);
    - never run an agent on a lab server or shared drive that holds data, and never give it your accounts or your browser;
    - agree with your supervisor before you use an agent on a project, since your code goes to the provider and KU Leuven requires a licence, not a free account.

??? numlist "Be able to explain everything you share"
    Code, figures, numbers and sentences that you show in a lab meeting, give to a colleague or publish are yours. You should be able to explain each of them and why it is there. If an AI made an analysis choice you cannot explain (a smoothing kernel, a statistical test, a threshold), find out why or take it out. "The AI wrote it" is not an answer.

??? numlist "Test AI-written analysis code before it touches real data"
    Run the code on simulated data where you know the right answer, like the data in our [DNN](../dnn/index.md) and [fMRI multivariate](../fmri/analysis/fmri-mvpa-python.md) tutorials, and keep that test with the code. Read every change the AI makes. Never accept a change that edits a test so that it passes, or that swaps the real computation for placeholder data. Before results from AI-assisted code go into a paper or thesis, have someone else in the lab look at the code.

??? numlist "Write your own science"
    The research question, the hypotheses, the interpretation and the arguments of a paper or thesis are yours. Draft the text yourself, then use AI for feedback on structure, for grammar and for final polishing. We do not put AI-generated paragraphs into papers or theses, and coding agents do not edit manuscript text. Unpublished drafts only go into Copilot with your KU Leuven login.

??? numlist "Check every reference yourself"
    Cite only papers you have found and read, at least the abstract, and check that each DOI leads to the paper you mean. Never let an AI add references from memory: AI tools invent sources, and they cite real papers that do not support the claim.

??? numlist "Be open about it in the lab"
    Tell your supervisor and co-authors how you used AI in a project, including the parts you do not fully understand yet. Say on your slides when AI produced an analysis or a figure, and mention AI-written code in the README. If you find an error in AI-assisted work, report it straight away so that it can be corrected.

??? numlist "Students: learn the skill before you delegate it"
    For master's and PhD students, the project is also training. Write your basic analysis code and your first drafts yourself, and use AI as a tutor or a reviewer. Agree with your supervisor at the start which uses are fine for your project. If you could not check an AI's answer on a topic, do not use AI for that topic.

## Where next?

<div class="grid cards" markdown>

- :material-shield-check-outline: **KU Leuven rules**

    ---

    The university rules these guidelines build on.

    [KU Leuven rules](kuleuven-rules.md)

</div>

<!--
__TODO__: [Andrea] Agree the lab guidelines with Hans and the lab (lab meeting) before the section goes live; points to settle are in local/ai-guidelines/lab-meeting-discussion.md. (Not asked yet.)
__TODO__: [Andrea] Ask researchintegrity@kuleuven.be whether coding agents (Claude Code, Codex) used with approval on code without data are allowed, and whether unpublished analysis code counts as confidential. (Not asked yet.)
__TODO__: [Andrea] Check whether the Faculty of Psychology and Educational Sciences has its own rules on AI in master's theses. (Not asked yet.)
__TODO__: [Andrea] Decide whether the lab offers a shared licence for an AI tool, and which one. (Not asked yet.)
-->
