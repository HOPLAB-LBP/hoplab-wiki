# Multi-session training studies on Pavlovia

Some studies require participants to come back many times over days or weeks, for example, perceptual **training** studies. This page explains how to run such a study on Pavlovia using jsPsych, and how to add the two things a multi-session study needs that a one-shot online experiment does not:

1. **Cross-session progress tracking**: so a returning participant resumes exactly where they left off.
2. **Automated email reminders**: so participants are prompted to return at the right intervals.

This page assumes you are already comfortable building a basic jsPsych experiment and putting it on Pavlovia. If not, read [Online Experiments (jsPsych)](pavlovia-jspsych.md) first. The parts that are usually **new** to people — Google Apps Script and the tracking sheet — are explained step by step, with every click spelled out.

A complete working implementation (a face-training study) is available as a reference here: [face-training-experiment](https://github.com/LauraSoen/face-training-experiment){target="_blank"}.

---

## Why a normal jsPsych experiment is not enough

A standard Pavlovia experiment is **stateless**: every time it runs, it starts from the beginning. It saves a data file at the end, but it does not *read* anything back at the start. For a multi-session study this is a problem, because session 5 needs to know what happened in sessions 1–4 (which training block the participant reached, how they have been improving, and so on).

So you need somewhere to **store a small amount of progress per participant** that the experiment can both *write to* at the end of a session and *read from* at the start of the next one. The trial-by-trial data still goes to Pavlovia as usual — this extra store is only for the lightweight "where is this participant up to" information.

The simplest, free way to do this is a **Google Sheet** that your experiment talks to through a small piece of code called a **Google Apps Script web app**. You do not need a server or a database.

!!! note "Mental model"
    Think of it as three pieces that talk to each other:

    - **The experiment** (jsPsych on Pavlovia) — runs the task.
    - **The Google Sheet** — remembers each participant's progress.
    - **The Apps Script** — the messenger that lets the experiment read from and write to the Sheet, and that sends reminder emails.

---

## How the pieces fit together

```
PARTICIPANT'S BROWSER (Pavlovia)
   |
   |  1. Session starts -> experiment asks the Sheet:
   |     "What block is participant P01 on?"
   |        GET .../exec?id=P01   ------------->  GOOGLE SHEET (state tab)
   |                                              <--- returns block, group, history
   |
   |  2. Experiment runs the trials for that block
   |
   |  3. Session ends -> experiment tells the Sheet what happened:
   |        POST .../exec   ------------------->  GOOGLE SHEET (state + log tabs)
   |                                              writes threshold, RT, next block
   |
GOOGLE APPS SCRIPT (runs by itself, once a day)
   |
   |  4. Checks who is due for their next session and emails them
   |        sendReminders()  ----------------->  participant email addresses
   |                                              (read from the emails tab)
```

Everything in steps 1–3 happens automatically inside the experiment. Step 4 is a separate scheduled job you set up once.

---

## Part A — The Google Sheet (your progress store)

### Create the Sheet

1. Go to [sheets.google.com](https://sheets.google.com){target="_blank"} and create a new, blank spreadsheet.
2. Give it a clear name, e.g. *"MyStudy Progress"*.

That's all for now — you do **not** need to create the tabs or columns by hand. The Apps Script (set up in Part B) creates the `state` and `log` tabs automatically the first time the experiment writes to them. You only create the `emails` tab yourself (for reminders, see Part C).

### The tabs explained

Once running, your Sheet will contain these tabs:

#### `state` tab — one row per participant (the live progress)

This is the heart of the tracking. Each participant has exactly **one** row, which gets **updated** (not duplicated) after every session.

| Column | Name | What it holds | Example |
|--------|------|---------------|---------|
| A | `id` | Participant ID (stored as text) | `P01` |
| B | `current_block_index` | Which block they are on (0 = first block) | `2` |
| C | `group_index` | Which rotation group is next (if you rotate stimuli) | `1` |
| D | `block_history` | A JSON record of every session's result, per block | `{"B1 ...":[{"sessionThreshold":11.1,"sessionRT":1341}]}` |
| E | `updated` | Timestamp of the last completed session | `3-6-2026 18:48:13` |

!!! warning "One row per participant — watch for duplicates"
    The `state` tab must have a single row per participant. If you see two rows for the same ID, the resume logic will read the wrong one and progress appears to reset. This usually happens when the ID is stored inconsistently (e.g. the number `0` vs the text `"0"`). The fix is to **normalize the ID to text on both reading and writing**, and to use Apps Script's `LockService` so two writes can't both append at once. (The reference implementation does both.) Prefer text IDs like `P01`, `P02` over bare numbers to avoid this entirely.

#### `log` tab — one row per session (append-only history)

This never updates existing rows; it just appends. Use it for auditing and analysis.

| Column | Name | Example |
|--------|------|---------|
| A | `timestamp` | `3-6-2026 18:48:13` |
| B | `id` | `P01` |
| C | `completed_block_index` | `2` |
| D | `completed_block_name` | `B3 neutral / 20deg` |
| E | `session_threshold` | `11.4` |
| F | `session_rt` | `920` |
| G | `advance` | `FALSE` |
| H | `next_block_index` | `2` |
| I | `next_group_index` | `0` |
| J | `per_pair` | `[{"pair":"pair01","threshold":...}]` |

#### `emails` tab — you fill this in (for reminders)

You create this tab by hand. See Part C.

| Column | Name | What you put |
|--------|------|--------------|
| A | `id` | Participant ID (must match the IDs used in the experiment) |
| B | `email` | Their email address |
| C | `done` | Leave blank; put any text here when they finish the whole study |

#### `reminder_log` tab — created automatically

The reminder script creates and manages this to avoid emailing the same person twice in one cycle. You don't touch it.

---

## Part B — The Apps Script (the messenger)

Apps Script is just JavaScript that runs on Google's servers, attached to your Sheet. Follow these steps exactly.

### Step 1: Open the script editor

1. In your Google Sheet, click the **Extensions** menu -> **Apps Script**.
2. A new tab opens with a code editor and a file called `Code.gs` containing an empty `myFunction`.

!!! tip "Create the script FROM the sheet"
    Always open Apps Script via **Extensions -> Apps Script** from inside the Sheet. This "binds" the script to that specific Sheet, which is what lets the code find it automatically. If you instead create a standalone script from script.google.com, it won't be attached to any sheet and writes will silently fail.

### Step 2: Paste in the progress-tracking code

1. Delete the empty `myFunction` content.
2. Paste in the full progress-tracking script (in the reference repo this is `Code.gs`).
3. Click the **Save** icon.

This code defines two functions Google will call over the web: `doGet` (handles the "what block is this participant on?" request) and `doPost` (handles the "here's what happened this session" request).

### Step 3: Deploy it as a web app

This turns your script into something the experiment can reach over the internet.

1. Click the blue **Deploy** button (top right) -> **New deployment**.
2. Click the gear icon next to "Select type" -> choose **Web app**.
3. Fill in:
    - **Description:** anything, e.g. "progress store v1".
    - **Execute as:** **Me** (your account).
    - **Who has access:** **Anyone**.
4. Click **Deploy**.
5. The first time, Google asks you to **authorize**. Click through: choose your account -> "Advanced" -> "Go to (project name)" -> **Allow**. This is normal — you are granting your own script permission to edit your own sheet.
6. Copy the **Web app URL**. It ends in `/exec` and looks like:
   `https://script.google.com/macros/s/AKfy...long.../exec`

You will paste this URL into the experiment's config (Part D).

!!! warning "Keep the /exec URL private"
    This URL is an unauthenticated endpoint — anyone who has it can read and write your progress data. Do **not** commit it to a public GitHub repository. Keep it only in your local experiment config and in the copy uploaded to Pavlovia. Put a blank placeholder in any committed code. (See the [Version control](../../coding/version-control.md) page and the repo's privacy notes.)

### Step 4: Test the web app before touching the experiment

1. **Test reading:** paste your `/exec` URL into a browser with `?id=TEST01` added on the end:
   `https://script.google.com/macros/s/AKfy.../exec?id=TEST01`
   You should see a small block of JSON like `{"current_block_index":0,...}`. If you see a Google login or permission page instead, your deployment access isn't set to *Anyone* — redeploy.
2. This first read also confirms the script is alive and reachable.

!!! note "If you change the code later, you must re-deploy"
    Editing the code in the editor does **not** update the live web app. After any change, go to **Deploy -> Manage deployments -> edit (pencil) -> Version: New version -> Deploy**. This keeps the same `/exec` URL. (Creating a *new deployment* instead gives you a *new* URL, which you'd then have to update everywhere — avoid that.)

---

## Part C — Automated email reminders

Reminders are a second piece of Apps Script that runs on a schedule. It reads the `state` tab (to see when each person last did a session) and the `emails` tab (to know who to write to).

### Step 1: Add the reminder code

1. In the same Apps Script project, add the reminder script (in the reference repo this is `Reminders.gs`) — either paste it below the existing code or add a new script file (the **+** next to "Files").
2. At the top of it, fill in the configuration: your reply-to email address and the Pavlovia run URL participants should click.
3. Save.

### Step 2: Create the `emails` tab

In the Google Sheet, add a new tab named exactly **`emails`** (lowercase), with this header row and then one row per participant:

```
id      email                  done
P01     p01@example.com
P02     p02@example.com
```

Leave the `done` column blank. When a participant finishes the entire study, type anything (e.g. `x`) in their `done` cell — this triggers a one-time "thank you, you're finished" email and stops further reminders for them.

### Step 3: Decide the timing

The reminder logic typically distinguishes:

- **Eligible:** enough time has passed since their last session (e.g. >= 1 full day for an every-other-day schedule) -> send a "you can do your next session" email.
- **Nudge:** they became eligible but still haven't returned after a couple more days -> send a gentle reminder.
- **Complete:** you marked them `done` -> send a thank-you, then stop.

These thresholds are set in the script's configuration.

!!! note "Reminders are continuation-only"
    A participant only gets a row in the `state` tab **after** they finish their first session. So reminders prompt people to do their *next* session — they cannot invite someone to do session 1. Send the first invitation manually (or do session 1 in a lab visit).

### Step 4: Test without sending anything

In the Apps Script editor:

1. From the function dropdown (next to the Run button), select **`previewReminders`**.
2. Click **Run**. Authorize if prompted (this adds the "send email" permission).
3. Open **Execution log** (bottom of the screen). It prints who *would* be emailed — **nothing is actually sent**. Use this to check your `emails` tab and timing are right.

To make yourself a test case: give yourself a row in `emails` with an ID that exists in `state`, temporarily edit that participant's `updated` timestamp in the `state` tab to a few days ago, then run `previewReminders` — you should now see an eligible line.

### Step 5: Turn on the daily automation

1. Select **`installReminderTrigger`** in the function dropdown and click **Run** once. This schedules the reminder check to run automatically every day (e.g. ~09:00).
2. Confirm it worked: click the **Triggers** icon (alarm clock) in the left sidebar — you should see one daily time-driven trigger.

!!! tip "Set the timezone"
    The daily run fires at the chosen hour in the **project's** timezone. Check it under **File -> Project Settings** (gear icon) and set it to your local zone (e.g. Europe/Brussels), otherwise "09:00" may be the middle of the night.

You only run `installReminderTrigger` **once**. From then on it runs by itself. An empty `state` tab is fine — the daily job simply does nothing until participants exist, then starts emailing each one as they become eligible.

!!! warning "Reminders are NOT deployed"
    Unlike the progress-tracking web app, the reminder script is not "deployed". It runs on the time trigger you create in this step. Do not look for it under Deploy — look under the Triggers panel.

---

## Part D — Connecting the experiment

Inside your jsPsych experiment, you need code that calls the web app at the start and end of each session. In the reference implementation this lives in `experiment.js`, and the only thing you set per study is the URL, in `config.js`:

```javascript
PROGRESS_URL: "https://script.google.com/macros/s/AKfy.../exec",
```

The flow inside the experiment is:

1. **Ask for the participant ID** at the start (a simple text-entry screen). This ID is the key to everything — it's how the Sheet looks them up. Tell participants their exact ID and to enter it the same way every time.
2. **GET** their progress and load the right block.
3. **Run** the session.
4. **POST** the session result at the end, and show a confirmation (e.g. a "progress saved" message) so you and the participant can see the save succeeded.

!!! tip "Show a save confirmation"
    Have the final screen display whether the save to the Sheet succeeded (e.g. a green "saved" / red "not saved" line). This turns silent failures into something you notice immediately during piloting, instead of discovering an empty Sheet later.

---

## Part E — Putting it on Pavlovia

This follows the normal jsPsych-on-Pavlovia process (see [Online Experiments (jsPsych)](pavlovia-jspsych.md)), with two specifics for this setup:

- Include the **Pavlovia jsPsych plugin** file, placed in a folder named **`vendor/`**.
- Push your experiment files plus your `stimuli/` folder to the Pavlovia GitLab project, then switch to **Piloting** to test.

!!! warning "Do NOT name a folder `lib/`"
    Pavlovia automatically creates a symlink named `lib` for its own PsychoJS library. If your repository already contains a folder called `lib`, the experiment fails when you try to pilot, with an error like:
    `unable to link the PsychoJS library ... lib directory already exists [Errno 17]`
    Use `vendor/` (or any other name) for the plugin and update the `<script src="...">` in `index.html` accordingly. If you already hit this, rename the folder, delete the old `lib`, push, then toggle the experiment Inactive -> Piloting.

---

## Part F — Pilot before recruiting

Do a full dress rehearsal with a test ID before any real participant:

1. Temporarily shorten sessions (e.g. set the trials-per-block and convergence parameters to small values in `config.js`).
2. Run **three** sessions with the same test ID (e.g. `TEST01`).
3. In the `state` tab, confirm there is **one** row for `TEST01`, and that its `block_history` grows with each session (not duplicate rows).
4. Confirm the experiment greets the participant with the correct session number each time (1st, 2nd, 3rd...).
5. Confirm the "progress saved" confirmation appears at the end of each session.
6. Run `previewReminders` and confirm the right people would be emailed.
7. Restore your real session-length parameters before running participants.

---

## Troubleshooting

| Problem | Likely cause | Solution |
|---------|-------------|----------|
| Experiment always starts at the first block | `PROGRESS_URL` is blank, or the GET failed | Check `config.js`; open `.../exec?id=TEST01` in a browser — you should get JSON, not a login page |
| Google Sheet stays empty after a session | Web app deployed from a *standalone* script, or old version deployed | Create the script via **Extensions -> Apps Script** (bound to the sheet); re-deploy a **New version** |
| Two rows for the same participant in `state` | ID stored as number vs text; or concurrent writes | Normalize IDs to text on read/write; use `LockService`; prefer text IDs like `P01` |
| Edited the script but nothing changed | Live web app still runs the old code | **Deploy -> Manage deployments -> edit -> New version -> Deploy** |
| `unable to link the PsychoJS library ... [Errno 17]` | A folder named `lib/` in the repo | Rename it to `vendor/`, delete the old `lib/`, re-push, toggle Inactive -> Piloting |
| Reminder emails never arrive | Participant not yet eligible, or no `emails` row, or trigger not installed | Run `previewReminders` and read the log; check the `updated` timestamp and the `emails` tab; check the Triggers panel |
| Reminder sent to a test participant by accident | A test ID in `state` also has a real address in `emails` | Remove test rows from `state` (and `emails`) before going live |
| Save confirmation shows red / "not saved" | Cross-origin or deployment issue | Open the browser console (F12) during the session to read the actual error; re-deploy the web app |

---

## Related pages

- [Online Experiments (jsPsych)](pavlovia-jspsych.md)
- [Online Experiments (PsychoPy)](pavlovia-psychopy.md)
- [Find participants](../bh-participants.md)
- [Version control](../../coding/version-control.md)

---




