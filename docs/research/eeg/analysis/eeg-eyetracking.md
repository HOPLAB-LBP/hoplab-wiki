# Concurrent EEG and eye-tracking

This page covers the integration of the SR Research EyeLink eye-tracker with the BioSemi EEG system. It addresses the full workflow: hardware synchronisation, recording procedure, data conversion to BIDS, data exploration, and combined analysis.

!!! tip "BIDS specification"
    Eye-tracking is now officially part of the BIDS standard (v1.11.0, released February 2026, formerly BEP 020). Concurrent EEG + eye-tracking data lives in the same `eeg/` directory. See the [BIDS eye-tracking specification](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/physiological-and-other-continuous-recordings.html) for the full details.

---

## Hardware setup and synchronisation

The setup involves three devices:

1. **Display PC** — runs the experiment (PsychoPy), sends triggers to both EEG and eye-tracker.
2. **EyeLink Host PC** — controls the eye-tracker, connected to the Display PC via Ethernet.
3. **BioSemi ActiveTwo** — records EEG, receives triggers via parallel port or USB Trigger Interface.

### Synchronisation strategy

The Display PC sends **the same event codes simultaneously** to both systems:

- **BioSemi**: TTL triggers via parallel port (DB25→DB37 adapter) or [USB Trigger Interface](https://www.biosemi.com/faq/USB%20Trigger%20interface%20cable.htm) (serial at 115200 baud).
- **EyeLink**: Timestamped messages via Ethernet using `pylink.sendMessage()`.

These shared codes become temporal anchors for offline alignment.

<!-- __PLACEHOLDER__: Document the exact hardware connections in the PSI 00.52 EEG lab: which trigger interface is used (parallel port or USB Trigger Interface), cable routing between Display PC, EyeLink Host PC, and BioSemi, and the EyeLink model installed. -->

---

## Controlling the eye-tracker with PsychoPy

We recommend using **SR Research's `pylink`** directly in PsychoPy Coder scripts. It provides full control over calibration, recording, messaging, and data transfer.

!!! info "Why pylink?"
    PsychoPy's ioHub and PyGaze offer higher-level wrappers, but pylink gives full access to EyeLink features and is the best-documented option (see [*Eye-Tracking with Python and Pylink*](https://link.springer.com/book/10.1007/978-3-030-82635-2) by Zhiguo Wang, with [example scripts on GitHub](https://github.com/zhiguo-eyelab/Pylink_book)). PsychoPy already bundles pylink.

### Basic experiment skeleton

```python
import pylink
from psychopy import visual, core, event

# --- Connect to the EyeLink Host PC ---
el = pylink.EyeLink("100.1.1.1")

# Open an EDF data file on the Host PC (8-char max filename)
el.openDataFile("exp01.edf")

# Configure the tracker
el.sendCommand("sample_rate 1000")
el.sendCommand("recording_parse_type = GAZE")
el.sendCommand("file_sample_data = LEFT,RIGHT,GAZE,GAZERES,AREA,HREF,PUPIL,STATUS,INPUT")
el.sendCommand("file_event_data = GAZE,GAZERES,AREA,HREF,VELOCITY,STATUS")

# --- Set up PsychoPy ---
win = visual.Window([1920, 1080], fullscr=True, units='pix')

# --- Calibration ---
# Use the PsychoPy-based calibration graphics
from pylink import EyeLinkCoreGraphicsPsychoPy
genv = EyeLinkCoreGraphicsPsychoPy(el, win)
pylink.openGraphicsEx(genv)
el.doTrackerSetup()

# --- Trial loop ---
for trial in range(n_trials):
    # Drift check before each trial (or block)
    el.doDriftCorrect(int(win.size[0] / 2), int(win.size[1] / 2), 1, 1)

    # Start recording (100 ms buffer before stimulus)
    el.startRecording(1, 1, 1, 1)
    pylink.msecDelay(100)

    # Mark trial start
    el.sendMessage(f"TRIALID {trial}")

    # Present stimulus and send triggers to BOTH systems
    stimulus.draw()
    win.flip()
    el.sendMessage(f"STIMULUS_ONSET {condition_code}")
    # Simultaneously send TTL to BioSemi:
    # parallel_port.setData(condition_code)

    # ... collect response ...

    el.sendMessage(f"RESPONSE {response_key} RT {rt}")
    el.sendMessage("TRIAL_RESULT 0")
    el.stopRecording()

# --- Transfer the EDF file ---
el.closeDataFile()
el.receiveDataFile("exp01.edf", "data/exp01.edf")
el.close()
```

### Key practices

- **Send messages liberally**: every trial event (stimulus onset, response, condition code) should be logged via `sendMessage()`. These messages are your synchronisation anchors.
- **Start recording 100 ms before stimulus**: avoids losing initial samples.
- **Send backdrop images** to the Host PC for real-time gaze monitoring:

    ```python
    # After drawing your stimulus, send it to the Host PC display
    el.bitmapBackdrop(width, height, pixels, 0, 0, width, height, 0, 0,
                       pylink.BX_MAXCONTRAST)
    ```

- **Use `TRIALID` and `TRIAL_RESULT` messages**: EyeLink Data Viewer uses these to parse trials automatically.

---

## Data exploration and quality checks

### EyeLink Data Viewer (quick visual inspection)

SR Research's [Data Viewer](https://www.sr-research.com/products/eyelink-data-viewer/) is the fastest way to check recording quality:

- Gaze overlaid on stimuli, trial-by-trial navigation
- Fixation/saccade reports exported to CSV
- Calibration quality visualisation

### Programmatic inspection with eyelinkio

[eyelinkio](https://github.com/scott-huberty/eyelinkio) reads `.edf` files directly (no `.asc` conversion needed) into pandas DataFrames or MNE Raw objects:

```python
from eyelinkio import read_edf

edf = read_edf("data/exp01.edf")
dfs = edf.to_pandas()

# dfs is a dict: 'samples', 'fixations', 'saccades', 'blinks', 'messages'
print(dfs['samples'].describe())  # Check gaze ranges, missing data
print(f"Fixations: {len(dfs['fixations'])}")
print(f"Saccades:  {len(dfs['saccades'])}")
print(f"Blinks:    {len(dfs['blinks'])}")
```

### MNE-Python (for combined EEG + eye-tracking)

MNE reads EyeLink `.asc` files (convert from `.edf` using SR Research's `edf2asc` tool, included in the EyeLink Developers Kit):

```python
import mne

raw_et = mne.io.read_raw_eyelink("data/exp01.asc")
raw_et.plot()  # Interactive scrolling plot of gaze channels
```

---

## Fixation and saccade detection

### Online (real-time) parsing

The EyeLink performs real-time event detection during recording using a velocity-and-acceleration threshold algorithm:

- **Default thresholds** (Cognitive/Normal mode): velocity 30 deg/s, acceleration 8,000 deg/s^2
- Detected events (fixations, saccades, blinks) are written to the `.edf` file automatically
- These are sufficient for most cognitive experiments

### Offline re-parsing

For more control or different algorithms, re-parse raw samples after recording:

| Tool | Algorithm | Best for |
|------|-----------|----------|
| [**REMoDNaV**](https://github.com/psychoinformatics-de/remodnav) | Adaptive velocity-based; detects smooth pursuit and PSOs | Natural/free viewing |
| [**pymovements**](https://github.com/aeye-lab/pymovements) | I-VT + Engbert & Kliegl microsaccade algorithm | Reading research, microsaccade detection |
| **EyeLink Data Viewer** | SR Research algorithm with adjustable thresholds | Quick GUI-based re-parsing |

---

## BIDS conversion

Eye-tracking data is stored as **physiological recordings** in BIDS — not in a separate directory. For concurrent EEG + eye-tracking, both live in `sub-XX/eeg/`.

### BIDS structure for concurrent EEG + eye-tracking

```
sub-01/
  eeg/
    sub-01_task-main_eeg.bdf
    sub-01_task-main_eeg.json
    sub-01_task-main_events.tsv
    sub-01_task-main_events.json
    sub-01_task-main_recording-eye1_physio.tsv.gz
    sub-01_task-main_recording-eye1_physio.json
    sub-01_task-main_recording-eye1_physioevents.tsv.gz
    sub-01_task-main_recording-eye1_physioevents.json
```

Key BIDS requirements:

- **Data format**: `_physio.tsv.gz` (compressed TSV with columns: `timestamp`, `x_coordinate`, `y_coordinate`, `pupil_size`) + JSON sidecar
- **Events format**: `_physioevents.tsv.gz` for saccades, fixations, blinks, and device messages
- **`recording-<label>`** is required: use `eye1` (left), `eye2` (right), `eye3` (cyclopean)
- **Required metadata** in JSON sidecar: `PhysioType: "eyetrack"`, `RecordedEye`, `SampleCoordinateSystem`, `SamplingFrequency`, `StartTime`
- **Screen info** required in `_events.json`: `StimulusPresentation.ScreenDistance`, `ScreenOrigin`, `ScreenResolution`, `ScreenSize`

### Conversion with eye2bids

[eye2bids](https://github.com/bids-standard/eye2bids) is the official BIDS tool for converting EyeLink `.edf` files:

```bash
pip install eye2bids  # or clone from GitHub

eye2bids --input_file data/exp01.edf --metadata_file metadata.yml
```

The metadata YAML file provides the required BIDS fields (screen size, distance, etc.) that cannot be extracted from the `.edf` file.

!!! info "MNE-BIDS support"
    MNE-BIDS eye-tracking support is in active development ([PR #1512](https://github.com/mne-tools/mne-bids/pull/1512)) but not yet merged. For now, use `eye2bids` for conversion.

---

## Aligning eye-tracking with EEG

### Using MNE's realign_raw

MNE provides `mne.preprocessing.realign_raw()` to align two recordings using shared event timestamps. This corrects for clock drift between the EyeLink and BioSemi systems:

```python
import mne
import numpy as np

# Load both recordings
raw_eeg = mne.io.read_raw_bdf("sub-01_task-main.bdf", preload=True)
raw_et = mne.io.read_raw_eyelink("sub-01_task-main.asc")

# Extract shared event times from both recordings
# These are the timestamps of the SAME events (e.g., stimulus onsets)
# in each system's own clock

# EEG events (from BioSemi Status channel)
events_eeg = mne.find_events(raw_eeg, stim_channel='Status')
eeg_event_times = events_eeg[:, 0] / raw_eeg.info['sfreq']  # in seconds

# Eye-tracking events (from EyeLink messages)
annot = raw_et.annotations
et_event_times = annot[annot.description == 'STIMULUS_ONSET'].onset  # in seconds

# Align the eye-tracking recording to the EEG clock
mne.preprocessing.realign_raw(raw_et, raw_eeg, et_event_times, eeg_event_times)

# Merge into a single Raw object
raw_et.add_channels([raw_eeg])

# Now you can epoch both modalities together
```

### Blink interpolation

MNE provides built-in blink interpolation for eye-tracking channels:

```python
mne.preprocessing.eyetracking.interpolate_blinks(raw_et, buffer=(0.05, 0.1))
```

---

## Eye-tracker-informed EEG artifact correction

When you have concurrent eye-tracking data, you can use the gaze signal (which is **electrically independent** from the EEG) to improve artifact correction.

### ICA with eye-tracking reference

Use gaze coordinates to objectively identify ocular ICA components:

```python
from mne.preprocessing import ICA

# Fit ICA on EEG channels
ica = ICA(n_components=25, method='infomax',
          fit_params=dict(extended=True), random_state=42)
ica.fit(raw_eeg, picks='eeg')

# Use the eye-tracking gaze channels to find ocular components
# Correlate IC time courses with gaze X/Y position
eog_indices = []
for ch in ['xpos_right', 'ypos_right']:  # Eye-tracking channel names
    indices, scores = ica.find_bads_eog(raw_et, ch_name=ch)
    eog_indices.extend(indices)

ica.exclude = list(set(eog_indices))
raw_clean = ica.apply(raw_eeg.copy())
```

!!! tip "OPTICAT method"
    For the most thorough artifact correction, consider the [OPTICAT approach](https://github.com/olafdimigen/opticat) (Dimigen, 2020). It trains ICA on aggressively high-pass filtered data with overweighted saccadic spike potential segments, using gaze coordinates as an electrically independent reference. The [EYE-EEG toolbox](https://www.eyetracking-eeg.org/) (MATLAB/EEGLAB) implements this comprehensively.

### Trial exclusion based on gaze

Use eye-tracker gaze position to exclude trials where the participant broke fixation:

```python
import numpy as np

# Check fixation during a critical window (e.g., 0 to 500 ms post-stimulus)
fix_radius = 2.0  # degrees of visual angle

for epoch_idx in range(len(epochs)):
    gaze_x = epochs[epoch_idx].get_data(picks='xpos_right').squeeze()
    gaze_y = epochs[epoch_idx].get_data(picks='ypos_right').squeeze()

    # Convert to degrees from fixation centre
    # (requires screen geometry — distance, resolution, size)
    deviation = np.sqrt(gaze_x**2 + gaze_y**2)

    if np.any(deviation > fix_radius):
        epochs.drop(epoch_idx, reason='fixation break')
```

---

## Recommended tools summary

| Tool | Purpose | Install |
|------|---------|---------|
| [**pylink**](https://pypi.org/project/sr-research-pylink/) | Control EyeLink during experiments | `pip install sr-research-pylink` (+ EyeLink Developers Kit) |
| [**eyelinkio**](https://github.com/scott-huberty/eyelinkio) | Read .edf files into Python (no .asc conversion) | `pip install eyelinkio` |
| [**mne**](https://mne.tools/stable/) | Combined EEG + eye-tracking analysis, alignment | `pip install mne` |
| [**eye2bids**](https://github.com/bids-standard/eye2bids) | Convert EyeLink .edf to BIDS format | Clone from GitHub |
| [**REMoDNaV**](https://github.com/psychoinformatics-de/remodnav) | Offline event detection (free viewing) | `pip install remodnav` |
| **EyeLink Data Viewer** | Quick visual inspection (commercial) | From SR Research |

---

## References

- BIDS eye-tracking specification (v1.11.0): [bids-specification.readthedocs.io](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/physiological-and-other-continuous-recordings.html)
- Dimigen, O. (2020). Optimizing the ICA-based removal of ocular EEG artifacts from free viewing experiments. *NeuroImage*, 207, 116117. [DOI](https://doi.org/10.1016/j.neuroimage.2019.116117)
- Dimigen, O., et al. (2011). Coregistration of eye movements and EEG in natural reading. *Journal of Experimental Psychology: General*, 140(4), 552–572.
- Plöchl, M., et al. (2012). Combining EEG and eye tracking: identification, characterization, and correction of eye movement artifacts. *Frontiers in Human Neuroscience*, 6, 278.
- Wang, Z. (2021). *Eye-Tracking with Python and Pylink*. Springer. [Book](https://link.springer.com/book/10.1007/978-3-030-82635-2)
- [MNE-Python eye-tracking tutorial](https://mne.tools/stable/auto_tutorials/preprocessing/90_eyetracking_data.html)
- [MNE-Python importing eye-tracking data](https://mne.tools/stable/auto_tutorials/io/70_reading_eyetracking_data.html)
- [EYE-EEG toolbox](https://www.eyetracking-eeg.org/) (MATLAB/EEGLAB)
- [Example BIDS eye-tracking datasets on OpenNeuro](https://openneuro.org/datasets/ds004158)
