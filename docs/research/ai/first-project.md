# Your first project

Start with a task small enough that you can check the answer yourself. This example builds a Python prototype that reads **synthetic** reaction times, computes a mean for each participant and condition, and plots the paired observations. The same sequence works for an experiment prototype or a different analysis: replace the inputs, outputs and checks with your own.

Follow the [lab guidelines](lab-guidelines.md) before starting. Agree the use with your supervisor, use an approved licence, and work in a code-only environment that cannot reach participant data or unpublished material. For students, use this example to practise something you already understand; agree what you may delegate.

## 1. Open an empty project

Create a folder called `rt-prototype`, open it in your editor, and copy the [project rules template](resources.md#for-a-project) into it as `AGENTS.md`. Fill in its environment and project details. Use the [agent settings](resources.md#agent-settings), keep approval enabled, and start Claude Code or Codex in that folder. The [environment and editor](../coding/environment-setup.md) and [version control](../coding/version-control.md) pages cover the prerequisites.

Give the agent this first prompt:

```text
Read AGENTS.md and summarise the constraints before doing anything else.
This folder is a learning prototype with synthetic data only.
Check what is already here. Propose the smallest Python project layout
for a script, tests, a configuration file and generated results.
Use AGENTS.md as the only project rules file.
Do not create files, install packages or run setup commands yet.
List the commands you would use and wait for my approval.
```

For this example, a sufficient layout is:

```text
rt-prototype/
├── AGENTS.md
├── README.md
├── environment.yml
├── .gitignore
├── config/project.toml
├── src/analyse.py
├── src/style.py
├── tests/test_analyse.py
├── tests/data/rt.csv
├── tasks/01_prototype.md
└── results/
```

The configuration holds input and output paths; `style.py` holds figure settings. `tests/data/` contains invented examples only. Keep a short task list with the agreed scope and the commands that demonstrate each finished step. Ignore the local environment and generated results in Git. Use the [project-setup skill](skills.md#project-setup) if you want to repeat this setup in future projects.

Read the proposed commands, correct the layout if needed, then approve setup. Review the files it creates before proceeding. Do not approve a command you cannot explain.

## 2. Specify the first working version

Give the agent a concrete task rather than asking it to build an analysis project:

```text
Plan a first working version. Do not implement it yet.

Input: a CSV with columns participant, condition and rt_ms.
The conditions are fast and slow. All rows are synthetic.
For each participant and condition, compute the mean reaction time.
For each participant, compute slow minus fast, in milliseconds.
Then compute the mean of those participant differences, with equal
weight per participant. Do not average all trials together.

Output: results/means.csv, results/differences.csv and a paired plot
in PDF and PNG. Print the mean difference to the terminal.
Read paths from config/project.toml and style from src/style.py.
Provide one command that runs everything from the project root.

Reject empty input, missing columns, non-finite or non-positive times,
unknown conditions and participants missing either condition.
Repeated rows are valid repeated trials; do not silently remove them.
No outlier removal, statistical tests, modelling or web interface.
Write the plan in tasks/01_prototype.md and wait for my approval.
```

Check that the plan matches your question. In particular, a participant with more trials must not get more weight in the final average. Approve the plan only after you have settled these choices.

## 3. Give it an answer you can check

This tiny fixture has three invented participants, two conditions and two trials per condition:

```csv
participant,condition,rt_ms
sim01,fast,390
sim01,fast,410
sim01,slow,410
sim01,slow,430
sim02,fast,440
sim02,fast,460
sim02,slow,460
sim02,slow,480
sim03,fast,490
sim03,fast,510
sim03,slow,510
sim03,slow,530
```

The fast means are 400, 450 and 500 ms; the slow means are 420, 470 and 520 ms. Each paired difference is 20 ms, so their mean is 20 ms. These are arithmetic checks on invented values, not research findings.

Paste the CSV above with this prompt:

```text
Save the CSV I supplied as tests/data/rt.csv. Before implementation,
write tests for the participant means and the mean paired difference
of 20 ms. Add a zero-effect fixture with identical condition means.
Test unequal trial counts so the final mean still weights participants
equally. Test the invalid inputs in the approved specification.
Call the functions the real command will use; do not copy the analysis
into tests or mock it. Run the tests and show why they fail while the
implementation is absent. Do not edit their expected answers later
without explaining the change and asking me.
```

Read the tests. A missing implementation is expected at this stage; a syntax error or a test that never reaches the analysis is not useful evidence. For a noisy simulation, choose a justified tolerance before looking at the output; the [known-answer-test skill](resources.md#skills) helps with this.

## 4. Implement and run the prototype

```text
Implement the approved version only, keeping the tests unchanged.
Use established packages already approved for this environment.
Run the tests, then run the actual command on tests/data/rt.csv.
Show the command, exit status, printed difference and output paths.
Check the saved CSV values against the expected answers and render
the plot. Report what failed or what you could not verify.
Do not commit or push yet.
```

Run the documented command yourself. Open both exported figures and check labels, units, paired lines and the values against the CSV. A passing test suite alone does not show that the documented command, configuration and saved files work together. The [figure example](skills.md#manuscript-figures) provides a reusable style and a multi-panel layout when you need one.

## 5. Review before adding anything

```text
Review the current files against tasks/01_prototype.md and AGENTS.md.
Use review-ai-code. Report findings with file and line; edit nothing.
Check especially participant weighting, missing conditions, tests that
bypass the computation, and any unrequested analysis choices.
Distinguish what you ran from what you only read.
```

Read the diff yourself too. Ask for a specific fix for each accepted finding, then rerun the tests and the actual command. Keep a local commit once the version works and you have reviewed it; publishing remains a separate decision.

## 6. Add one feature at a time

For example, extend the prototype with a reproducible synthetic-data generator:

```text
Propose one extension: generate synthetic reaction times for a chosen
number of invented participants, with a configurable condition effect
and random seed. Keep the current analysis unchanged. Mark generated
files as synthetic. Test reproducibility with the same seed and recovery
of the planted effect using a tolerance justified before the run.
Keep the hand-calculated fixture as an independent check.
Show the plan and wait for my approval before editing.
```

Avoid a general request to make the project better. Name the change, check the resulting diff, rerun the working route and update the task list. If you start a fresh session, use:

```text
Read AGENTS.md, tasks/01_prototype.md and the current files.
Summarise what is complete, the evidence recorded, and what remains.
Do not treat a checked box as proof: verify the relevant outputs.
Propose the next small step and wait for my approval.
```

## Before real data

This finishes a prototype. Have a colleague review the code before using it for research, settle the real analysis choices, and run it on participant data yourself in the appropriate environment. Do not move those data into the agent's workspace. Record how AI helped using the [disclosure templates](resources.md#templates-for-disclosure).
