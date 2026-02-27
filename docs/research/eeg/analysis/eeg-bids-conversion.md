# Organise your EEG data

To organise our EEG data, we follow the [BIDS](https://bids-specification.readthedocs.io/en/stable/introduction.html) (Brain Imaging Data Structure) specification — the same standard used for our [fMRI data](../../fmri/analysis/fmri-bids-conversion.md). BIDS ensures that your dataset is self-describing, machine-readable, and compatible with the growing ecosystem of BIDS-aware analysis tools.

If you are new to BIDS, start with the [BIDS Starter Kit](https://bids-standard.github.io/bids-starter-kit/index.html). The [EEG-specific section](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html) of the specification describes exactly which files and metadata are required.

!!! tip "Why bother with BIDS?"
    A consistent folder structure is not just good practice — it is a **requirement** for our analysis scripts and QC tools to work. Every script in our pipeline expects data at specific paths with specific names. Deviating from this structure means scripts will fail and you will spend time debugging paths instead of analysing data.

---

## Project folder structure

After collecting your data, organise your project folder as follows. This structure is enforced across all EEG projects in the lab.

```
myproject/
├── code/                              # Analysis scripts
│   ├── data/                          # Experiment configuration files
│   │   └── trigger_mapping.json       # Trigger codes (machine-readable)
│   └── results/                       # Script outputs (auto-generated)
│       └── YYYYMMDD_HHMMSS_scriptname/
├── sourcedata/                        # Raw, unprocessed data (NEVER modify)
│   └── sub-<ID>/
│       ├── eeg/                       # EEG recording files
│       ├── bh/                        # Behavioural logs from the task
│       └── et/                        # Eye-tracking data (if collected)
├── stimuli/                           # Stimulus files used in the experiment
├── BIDS/                              # BIDS-formatted output
│   ├── dataset_description.json
│   ├── participants.tsv
│   ├── participants.json
│   ├── sub-<ID>/
│   │   └── eeg/
│   └── derivatives/                   # All processed data lives here
│       ├── quality_control/
│       ├── preprocessing/
│       └── mvpa/
```

!!! warning "Never modify sourcedata"
    The `sourcedata/` folder is your archive of raw, untouched recordings. All processing outputs go into `BIDS/` or `BIDS/derivatives/`. This separation ensures you can always re-run the pipeline from scratch.

---

## Step 1: Create the sourcedata structure

<pre><code>
myproject/
└── <b>sourcedata/</b>
    └── <b>sub-01/</b>
        ├── <b>eeg/</b>
        ├── <b>bh/</b>
        └── <b>et/</b>
</code></pre>

For each participant, create a `sub-<ID>` folder inside `sourcedata/` with three subfolders:

| Folder | Contents |
|--------|----------|
| `eeg/` | EEG recording files (`.bdf` for BioSemi) |
| `bh/`  | Behavioural logs: `*_events.tsv` (trial-level), `*_log.tsv` (frame-level), `session.log` |
| `et/`  | Eye-tracking data (`.edf`, `.asc`, or `.tsv`) — leave empty if not collected |

Create these folders from the terminal:

```bash
cd /path/to/myproject/sourcedata
mkdir -p sub-01/eeg sub-01/bh sub-01/et
```

---

## Step 2: Name and place your raw files

<pre><code>
myproject/
└── sourcedata/
    └── sub-01/
        ├── eeg/
        │   └── <b>sub-01_task-chess1back_eeg.bdf</b>
        ├── bh/
        │   ├── <b>2026-02-14-16-13_sub-01_run-01_task-chess_1back_events.tsv</b>
        │   ├── <b>2026-02-14-16-13_sub-01_run-01_task-chess_1back_log.tsv</b>
        │   ├── <b>...</b>
        │   └── <b>sub-01_task-chess_1back_session.log</b>
        └── et/
</code></pre>

### EEG files

Name your BDF files following BIDS conventions:

```
sub-<ID>_task-<tasklabel>_eeg.bdf
```

For example: `sub-01_task-chess1back_eeg.bdf`

!!! info "One file or multiple?"
    In our lab, we typically record the entire session as a **single continuous BDF file** — all runs are concatenated. The BIDS conversion script splits this file into individual runs using the run-start triggers embedded in the recording. If you save separate BDF files per run during acquisition, name them as `sub-<ID>_task-<tasklabel>_run-<NN>_eeg.bdf`.

### Behavioural logs

Behavioural logs are produced by your experiment script. Our task framework generates files named:

```
YYYY-MM-DD-HH-MM_sub-<ID>_run-<NN>_task-<taskname>_events.tsv
YYYY-MM-DD-HH-MM_sub-<ID>_run-<NN>_task-<taskname>_log.tsv
sub-<ID>_task-<taskname>_session.log
```

- **`*_events.tsv`**: trial-level event log (onset, duration, trial_type, trigger codes, responses). This is the primary file for BIDS conversion.
- **`*_log.tsv`**: frame-level timing log (useful for debugging timing issues but not used in BIDS).
- **`session.log`**: session-wide log (experiment start/stop, errors).

Place all of these in `bh/` without renaming.

### Eye-tracking data

If you collected eye-tracking data concurrently with EEG, place the raw files in `et/`. See the [EEG and eye-tracking](eeg-eyetracking.md) page for details.

---

## Step 3: Set up the code folder

<pre><code>
myproject/
├── <b>code/</b>
│   ├── <b>data/</b>
│   │   └── <b>trigger_mapping.json</b>
│   ├── <b>results/</b>
│   ├── <b>00_bids_conversion.py</b>
│   ├── <b>01_quality_control.py</b>
│   ├── <b>02_preprocessing.py</b>
│   └── <b>03_mvpa_analysis.py</b>
└── sourcedata/
</code></pre>

Place your analysis scripts in `code/`. The `code/data/` subfolder holds experiment configuration files — most importantly the **trigger mapping**.

### Trigger mapping

The trigger mapping JSON file is the single source of truth for what each EEG trigger code means. It is produced by your task framework and should be copied into `code/data/` at the start of your analysis. All analysis scripts load this file to interpret trigger codes, so you never hardcode trigger values in your analysis code.

The mapping uses a structured range scheme:

| Range | Purpose |
|-------|---------|
| 1–79 | Stimulus triggers (from the trial list) |
| 80–89 | Task phase triggers (fixation, cue, response window, etc.) |
| 90–99 | Framework events (instruction screens, breaks, pre/post run fixations) |
| 100–112 | Response triggers (keypresses) |
| 120–129 | Block start markers (`120 + block_number`) |
| 130–139 | Block end markers (`130 + block_number`) |
| 140–149 | Run start markers (`140 + run_number`) |
| 150–159 | Run end markers (`150 + run_number`) |

See [Creating EEG tasks — Trigger mapping](../eeg-task.md#trigger-mapping) for details on how to define and use trigger codes in your experiment.

### Results directory

Every time you run a script, it automatically creates a timestamped subfolder in `code/results/`:

```
code/results/20260227_143052_01_quality_control/
├── 01_quality_control.py     # Copy of the script that produced these results
├── 01_quality_control.log    # Full log output
├── trigger_inventory.png     # Output plots and data
└── ...
```

This ensures full **reproducibility**: you always know which version of the script produced which results.

---

## Step 4: BIDS conversion

<pre><code>
myproject/
├── <b>BIDS/</b>
│   ├── <b>dataset_description.json</b>
│   ├── <b>participants.tsv</b>
│   ├── <b>participants.json</b>
│   ├── <b>sub-01/</b>
│   │   └── <b>eeg/</b>
│   │       ├── <b>sub-01_task-chess1back_run-01_eeg.bdf</b>
│   │       ├── <b>sub-01_task-chess1back_run-01_eeg.json</b>
│   │       ├── <b>sub-01_task-chess1back_run-01_channels.tsv</b>
│   │       ├── <b>sub-01_task-chess1back_run-01_events.tsv</b>
│   │       ├── <b>sub-01_task-chess1back_run-01_electrodes.tsv</b>
│   │       ├── <b>sub-01_task-chess1back_run-01_coordsystem.json</b>
│   │       └── <b>...</b>
│   └── <b>derivatives/</b>
├── code/
├── sourcedata/
└── stimuli/
</code></pre>

Run the BIDS conversion script:

```bash
cd /path/to/myproject
python code/00_bids_conversion.py
```

This script uses [mne-bids](https://mne.tools/mne-bids/) to:

1. **Preflight checks** — validate that all expected files and folders are in place before doing any heavy work
2. **Load** the raw BDF file from `sourcedata/sub-<ID>/eeg/`
3. **Set channel types** (EEG, EOG, misc, stim) and apply the BioSemi 128 montage
4. **Split** the continuous recording into individual runs using the run-start triggers from the trigger mapping
5. **Anonymise and write** each run to BIDS format using `write_raw_bids()`, which automatically generates the required sidecar files (see [below](#what-mne-bids-generates))
6. **Copy events.tsv** from the behavioural logs into the BIDS structure. The experiment task should produce [BIDS-ready events files](../eeg-task.md#bids-compatible-event-logging) that can be copied directly without transformation
7. **Create dataset-level files**: `dataset_description.json`, `participants.tsv` (additive — re-running for new subjects does not erase existing entries)

### What mne-bids generates

`write_raw_bids()` automatically generates all the sidecar files required by the BIDS specification. You do not create these manually — they are derived from the information in the MNE `Raw` object (channel types, montage, recording parameters).

#### Per-run files

For each run, the following files are created in `BIDS/sub-<ID>/eeg/`:

| File | What it contains | Where the data comes from |
|------|-----------------|--------------------------|
| `*_eeg.eeg` | Binary EEG data for this run | Converted from BDF to [BrainVision](https://www.brainproducts.com/support-resources/brainvision-core-data-format-1-0/) format |
| `*_eeg.vhdr` | BrainVision header — links to the `.eeg` and `.vmrk` files, lists channels and their properties | Generated by mne-bids during format conversion |
| `*_eeg.vmrk` | BrainVision marker file — trigger markers embedded in the recording | Generated by mne-bids during format conversion |
| `*_eeg.json` | Recording metadata: task name, sampling rate, channel counts, power line frequency, recording duration | From `raw.info` — we set `line_freq`, channel types, etc. in the script |
| `*_channels.tsv` | Per-channel table: name, type (EEG/EOG/misc/stim), units, hardware filter cutoffs, **status** (good/bad), status description | From `raw.info` — the `status` column is where you [mark bad channels](#marking-bad-channels) |
| `*_events.tsv` | Event onsets, durations, trial types, and all behavioural columns (condition, response, stimulus file, etc.) | The script overwrites the auto-generated version with the enriched behavioural data from your experiment logs |

!!! info "Why BrainVision format?"
    BIDS supports multiple EEG formats, but [BrainVision](https://bids-specification.readthedocs.io/en/stable/appendices/eeg-formats.html) (`.vhdr`/`.eeg`/`.vmrk`) is the recommended choice for maximum compatibility. The original BDF is preserved in `sourcedata/` — the BIDS copy is a lossless conversion. The three-file structure separates concerns: header (metadata), data (binary), and markers (events).

#### Per-subject files (shared across runs)

| File | What it contains | Where the data comes from |
|------|-----------------|--------------------------|
| `*_electrodes.tsv` | 3D electrode positions (x, y, z in metres) for every EEG channel | From the **standard BioSemi 128 montage** template applied with `raw.set_montage("biosemi128")` — these are template positions, not individually digitised |
| `*_coordsystem.json` | Defines the coordinate system used for electrode positions (CapTrak/RAS: X from left to right ear, Y through nasion, Z through vertex) | From the montage — required by BIDS so downstream tools can interpret the coordinates |

!!! note "Template vs. digitised electrode positions"
    The electrode positions come from MNE's built-in `biosemi128` montage, which uses standard template coordinates. These are accurate enough for topographic plots, source localisation, and interpolation. If you digitise individual electrode positions (e.g. with a Polhemus system), you would replace these with the subject-specific coordinates.

#### Dataset-level files

These live at the root of `BIDS/` and describe the dataset as a whole:

| File | What it contains |
|------|-----------------|
| `dataset_description.json` | Dataset name, BIDS version, authors — required by the BIDS validator |
| `participants.tsv` | One row per subject with demographics (age, sex, handedness). The script merges new subjects additively, so re-running for one subject does not erase others |
| `participants.json` | Column descriptions for `participants.tsv` (auto-generated) |

### Anonymisation

**All BIDS data must be anonymised.** The BDF files contain the recording date and potentially other identifying information. mne-bids handles this during conversion — pass the `anonymize` parameter to `write_raw_bids()`:

```python
from mne_bids import write_raw_bids

write_raw_bids(
    raw,
    bids_path,
    anonymize=dict(daysback=1000),  # Shift recording date 1000 days into the past
    overwrite=True,
)
```

This removes subject-identifying information (participant name, handedness, etc.) from the BDF headers and shifts the measurement date. The `daysback` value should be large enough that the real recording date cannot be guessed, but consistent across subjects in the same study so that relative timing is preserved.

If you already have a BIDS-formatted dataset that needs anonymisation after the fact, use:

```python
from mne_bids import anonymize_dataset

anonymize_dataset(bids_root_path='/path/to/BIDS')
```

!!! warning "Anonymisation is mandatory"
    Our lab's [data management guidelines](../../rdm/current.md) require that all shared and stored data be pseudonymised. The BIDS conversion script should always include the `anonymize` parameter. Never store identifiable recording dates in the BIDS directory.

### Validate your BIDS dataset

After conversion, always validate:

1. **Online validator**: upload your `BIDS/` folder to the [BIDS Validator](https://bids-standard.github.io/bids-validator/)
2. **Command-line**: `bids-validator /path/to/BIDS/`

Fix any errors before proceeding to analysis.

### Inspect and mark bad channels interactively

After conversion, mne-bids provides a convenient way to visually inspect the raw data and interactively mark problematic channels as bad. From your terminal, run:

```bash
mne-bids inspect --bids_root /path/to/BIDS
```

This opens an interactive browser where you can scroll through the data, click on channels to mark them as bad, and the changes are saved directly to the BIDS `*_channels.tsv` files. This is the recommended way to identify bad channels after conversion — it bridges the gap between automated QC (which runs in the next step) and manual visual inspection.

See the [mne-bids documentation](https://mne.tools/mne-bids/stable/generated/mne_bids.inspect_dataset.html) for more options.

!!! tip "When to use `mne-bids inspect` vs. the QC script"
    Use `mne-bids inspect` for a quick visual pass immediately after conversion — you can catch obvious problems (dead channels, gross artifacts) in a few minutes. Then run the full QC script (`01_quality_control.py`) for systematic, quantitative checks (photodiode delays, trigger counts, channel statistics). Both are complementary.

---

## Step 5: Derivatives structure

All processed data goes into `BIDS/derivatives/`, organised by processing stage:

```
BIDS/derivatives/
├── quality_control/          # Output from 01_quality_control.py
│   └── sub-01/
│       ├── trigger_inventory.png
│       ├── channel_variance.png
│       ├── photodiode_delays.png
│       └── sub-01_qc_summary.txt
├── preprocessing/            # Output from 02_preprocessing.py
│   └── sub-01/
│       └── eeg/
│           ├── sub-01_task-chess_1back-epo.fif
│           ├── sub-01_ica-components-0.png
│           └── sub-01_autoreject-log.png
└── mvpa/                     # Output from 03_mvpa_analysis.py
    ├── sub-01/
    │   ├── sub-01_decoding_scores.npy
    │   ├── sub-01_tgm_scores.npy
    │   └── sub-01_rsa_timecourse.npy
    └── group/
        ├── group_decoding_timecourse.png
        └── group_decoding_scores.npy
```

---

## Marking bad channels

Bad channels (dead, noisy, or bridged electrodes) must be identified and documented **before preprocessing** — they affect average referencing, ICA, and all downstream analyses. All bad channel information should be recorded in the BIDS `*_channels.tsv` file.

### When to mark bad channels

1. **During acquisition**: if you notice persistently noisy or flat channels in ActiView during the recording, write them down in your session notes.
2. **After BIDS conversion (interactive)**: use `mne-bids inspect` (see [above](#inspect-and-mark-bad-channels-interactively)) for a quick visual pass.
3. **During quality control**: the QC script (`01_quality_control.py`) computes channel-level statistics (variance, correlation, PSD) that help you identify problematic channels. Review these and mark any bad channels before preprocessing.

### BIDS `*_channels.tsv` format

Each run's `*_channels.tsv` has a `status` column. Set it to `bad` for any channels that should be excluded, and document the reason in `status_description`:

```
name    type    units   status      status_description
A1      EEG     µV      good
A2      EEG     µV      bad         noisy - poor contact during recording
A3      EEG     µV      good
B5      EEG     µV      bad         bridged with B6
...
```

### How to mark bad channels programmatically

Use [`mne_bids.mark_channels()`](https://mne.tools/mne-bids/stable/generated/mne_bids.mark_channels.html) to write bad channel information directly into the BIDS dataset:

```python
from mne_bids import mark_channels, BIDSPath

bids_path = BIDSPath(subject="01", task="chess1back", run="1",
                     datatype="eeg", root="/path/to/BIDS")

# Mark channels identified during acquisition notes or QC
mark_channels(bids_path=bids_path, ch_names=["A2", "B5"], status="bad")
```

This updates the `status` column in `*_channels.tsv`. The function is additive by default — previously marked channels are preserved.

In MNE-Python, bad channels are stored in `raw.info['bads']` and are automatically respected by downstream operations:

```python
raw.info['bads'] = ['A2', 'B5', 'D7']

# These channels will be:
# - Excluded from average reference computation
# - Excluded from ICA fitting
# - Interpolated before epoching (if desired)
```

!!! tip "Keep a record"
    Always document *why* a channel was marked bad (e.g., "flat — no signal", "bridged with B6", "excessive 50 Hz noise"). This helps when reviewing preprocessing decisions later and is required for good scientific practice. The `status_description` column in `*_channels.tsv` is the right place for this.

### Interpolating bad channels

Bad channels can be interpolated (reconstructed from neighbouring channels) using MNE:

```python
# Interpolate bad channels using spherical spline interpolation
raw.interpolate_bads(reset_bads=True)
```

Whether to interpolate before or after ICA depends on the number of bad channels:

- **Few bad channels (1–3)**: interpolate *after* ICA, so they don't influence the decomposition
- **Many bad channels (4+)**: interpolate *before* ICA, so the average reference is not distorted

<!--
__NOTE__: We are evaluating automatic bad channel detection tools (PyPREP NoisyChannels,
MNE compute_bridged_electrodes, PyLossless) for potential integration into this pipeline.
Feedback from Simen and Tim on their experience with these tools would be very welcome.
See tasks/eeg-section-development.md for details on the tools under evaluation.

__TODO__: [Andrea] Confirm the interpolation strategy with the lab (before vs. after ICA,
threshold for "few" vs. "many" bad channels). Document the agreed approach.
-->

---

## References

- [BIDS Specification — EEG](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html)
- [BIDS Starter Kit](https://bids-standard.github.io/bids-starter-kit/index.html)
- [mne-bids documentation](https://mne.tools/mne-bids/stable/index.html)
- [BIDS Validator](https://bids-standard.github.io/bids-validator/)
- [BIDS EEG examples](https://bids-standard.github.io/bids-starter-kit/dataset_examples.html)

---

For the next step, run quality control on your raw data: [:octicons-arrow-right-24: Quality control](eeg-quality-control.md)
