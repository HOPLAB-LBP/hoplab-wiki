# Preparing an EEG task

This page describes the steps necessary to prepare your EEG experiment. Follow these steps if you have a behavioural paradigm ready that you need to adapt to EEG testing. You might be in a situation where you have a task script ready from a previous experiment. Here are the aspects of the task, described in this page, that you will need to pay special attention to when bringing your task to the EEG:

- **Experiment configuration**: structuring your experiment code so that machine settings, trigger mappings, and experiment parameters are cleanly separated and stored in JSON files.
- **Sending triggers**: in order to analyse your EEG data, it's crucial to know *when* your events happened relative to when your EEG data was recorded. To keep track of this timing, we send triggers from the stimulus computer to the EEG computer.
- **Using the photocell**: to ensure that the timing of our triggers is accurate with regards to what actually shows on the screen, we use a photo sensitive diode (aka a *photocell*), taped to the screen, that can detect changes in screen luminance with high temporal precision. Since this photocell is taped to the bottom left of the screen (to avoid obstructing the participant's view), we add a small square to the bottom left of our screen that changes luminance at the same time as we send a trigger.
- **Timing**: in most tasks you will need to follow some timing rules to ensure your brain signal is clean and interpretable.

Note that an EEG task template implementing these best practices is planned but not yet available. Once created, it will be hosted under the [HOPLAB-LBP GitHub organisation](https://github.com/HOPLAB-LBP).

---

## Experiment configuration

A well-structured EEG experiment separates **what varies between machines** (display properties, serial port, OS paths) from **what defines the experiment** (trigger codes, timing, stimuli). We recommend storing both in JSON configuration files — this makes your code portable, DRY, and easy to share.

### Machine configuration

Store machine-specific settings in a JSON file per machine. This way, the same experiment code runs on the lab PC and your laptop without any changes — you just switch the config file.

```json title="config/machines/eeg-pc.json"
{
    "machine_id": "eeg-pc",
    "display": {
        "model": "BenQ ZOWIE XL2411",
        "resolution_x": 1920,
        "resolution_y": 1080,
        "size_x_mm": 531,
        "size_y_mm": 299,
        "distance_mm": 630,
        "refresh_rate_hz": 60,
        "input_lag_ms": 4.0
    },
    "serial": {
        "port": "/dev/ttyUSB0",
        "baudrate": 115200
    },
    "eeg": {
        "sample_rate": 1024
    }
}
```

Load and apply the configuration in your experiment script:

```python
import json

def load_machine_config(machine_id, config_dir='config/machines'):
    """Load machine-specific configuration from JSON."""
    config_path = f"{config_dir}/{machine_id}.json"
    with open(config_path) as f:
        return json.load(f)

# Auto-detect machine or specify via command-line argument
config = load_machine_config('eeg-pc')
```

!!! tip "Auto-detect the machine"
    You can use `socket.gethostname()` to detect which machine you are on and automatically load the correct config file. Map known hostnames to config file names in a simple dictionary.

### Trigger mapping

Store your EEG trigger scheme in a single JSON file. This serves as the **single source of truth** for what each trigger code means — no magic numbers scattered across your code.

```json title="config/triggers/trigger_mapping.json"
{
    "fixation_onset": 80,
    "stimulus_onset": 81,
    "fixation_post_stim": 82,
    "response_valid_base": 100,
    "response_invalid": 110,
    "block_start_base": 120,
    "block_end_base": 130,
    "run_start_base": 140,
    "run_end_base": 150,

    "_trigger_ranges": {
        "1-79":    "Stimulus triggers (from trial list)",
        "80-89":   "Task phase triggers (fixation, stimulus, cue, etc.)",
        "100-112": "Response triggers",
        "120-159": "Block and run markers"
    }
}
```

We recommend a **structured range scheme**: reserve different numeric ranges for different event types. This makes it easy to filter events during analysis (e.g., "all stimulus triggers are codes 1–79") and avoids collisions when you add new events.

In your task code, reference triggers by **semantic name**, never by hardcoded number:

```python
import json

with open('config/triggers/trigger_mapping.json') as f:
    TRIGGERS = json.load(f)

# Use named triggers in your experiment code
trigger_code = TRIGGERS['stimulus_onset']  # 81, not a magic number
```

---

## Sending triggers

In order to be able to map psychophysical events from your task to the EEG data, you will need to send triggers from the task computer to the EEG computer. These triggers will then appear in a separate channels alongside your other EEG channels, allowing you to know precisely when e.g. an image was shown with respect to your brain signal.

Triggers are sent via a serial port connection. To use it, you will need to link to the serial port within your script. In Python, this can be done using the `serial` package. The following code snippet shows how to open a connection to the serial port:

```python
import serial

try:
    serialport = serial.Serial("/dev/ttyUSB0", baudrate=115200)
    serialport.reset_input_buffer()   # Clear any stale data
    serialport.reset_output_buffer()
except serial.SerialException as e:
    print(f"Serial port not available: {e}")
    serialport = None
    # In EEG mode, abort the experiment if the serial port fails
```

Once your serialport object is defined, you can call it to send triggers using the `write` method. The following code snippet shows how to send a trigger:

```python
import struct

def send_trigger(code, serial_port):
    """Send a single trigger byte to the EEG system."""
    if serial_port is not None:
        serial_port.write(struct.pack('>B', code))

trigger = 56  # example trigger value between 0 and 255
send_trigger(trigger, serialport)
```

These triggers will be sent in 8-bit format, meaning that you can send **integer values between 0 and 255**. A good practice here is to define beforehand a mapping of event to trigger stored in an external `.json` file (see [trigger mapping](#trigger-mapping) above).

!!! info "Trigger validation at startup"
    Before starting the experiment, validate that all trigger codes referenced in your task are within the 0–255 range and that all named triggers exist in your trigger mapping JSON. Catching these errors before the first trial saves you from discovering problems halfway through a session.

!!! info "Trigger reset"
    The BioSemi USB Trigger Interface automatically resets the trigger line to 0 after approximately 8 ms. If you are using other hardware, you may need to manually send a 0 trigger after a short delay (~10 ms) to reset the line.

---

## Using the photocell

Triggers sent from the task computer are just like any other input from that computer: they take time to travel to their destination. Just like images are not shown the exact moment they are called to be shown, triggers are not received the exact moment they are sent. This delay between trigger sending and trigger receiving is **variable**, and can be substantial under some conditions. That's why we use a photocell to measure the exact moment when something changes on the screen.

The photocell records with high temporal precision changes in luminance on the bottom left of the screen where it is taped. We use it to record the exact moment that images are being presented, by adding a small square to the bottom left of the screen that changes luminance at the same time as we show images. By making sure the stimuli (or any other visual event) and the square change on the same frame, we can use the photocell signal to know exactly when something changed on the screen. The result of this are recorded in the EEG data on the `Erg1` channel.

### Recommended photocell strategy

Rather than toggling the rectangle only on stimulus onset, we recommend using **stable alternating states** that encode the boundaries between all task phases. The principle is:

- **One state (e.g., black)** for **task-relevant events** — stimuli, masks, or any visual event you care about for analysis. This is the "ON" state.
- **The opposite state (e.g., white)** for **everything else** — fixation, inter-stimulus interval, jitter, instruction screens. This is the "OFF" state.

By reserving one photocell state for your analysis-relevant events, every transition in the photodiode signal tells you when something important started or ended. The signal encodes both the **onset** and **duration** of each event: you know not only *when* the stimulus appeared (transition to black) but also *how long* it was on screen (duration of the black state).

The figure below illustrates this for a task with multiple trial phases. Notice how the photocell state alternates at every event boundary, with the "Base" (black) state consistently used for task-relevant phases (stimulus, blank) and the "Switch" (white) state for non-critical phases (fixation, inter-trial interval):

<figure markdown="span">
  ![photocell_design_example](../../assets/eeg-task-fig1.png)
  <figcaption>Photocell state logic. The rectangle alternates between two states at every event boundary. The "Base" state (black) is reserved for task-relevant events; the "Switch" state (white) for non-critical phases.</figcaption>
</figure>

The following snippet creates PsychoPy rectangles for both states:

```python
from psychopy import visual

# Both rectangles at the same position: bottom-left corner of the screen
diode_black = visual.Rect(
    win=win, width=0.02, height=0.02,
    pos=(-0.8, -0.45), anchor='center',
    lineColor='black', fillColor='black'
)
diode_white = visual.Rect(
    win=win, width=0.02, height=0.02,
    pos=(-0.8, -0.45), anchor='center',
    lineColor='white', fillColor='white'
)
```

!!! tip "Photodiode as ground truth"
    The photodiode signal is the **ground truth** for when your stimulus actually appeared on screen. The digital trigger tells you *what* happened (which condition), but the photodiode tells you *when* it happened — because it directly measures the screen flip, bypassing all software and OS delays. During analysis, use photodiode onsets as your event times for epoching, and use the digital triggers as a cross-check. See the [Quality control](analysis/eeg-quality-control.md) page for how to measure and validate photodiode delays.

---

## Timing best practices

### Inter-trial interval and jitter

When preparing your task for EEG, you will need pay extra attention to the trial timing, in particular to the **inter-trial interval** (ITI) and **jitter**. Having a decent ITI is important to allow the brain response to return to baseline. The jitter duration should also align with the design of your experiment—for example, to accommodate late ERP components such as the P300 or N400. A minimum inter-trial interval (ITI) of around 0.9 s provides sufficient time for these late components to resolve. Additionally, adding some jitter in the inter-trial interval is important to prevent participants from developing strong expectations about the upcoming stimulus. As a rule of thumb, think of having a jitter varying between 0.7 and 1.5 s.

### Work in frames, not milliseconds

For frame-accurate timing, convert all durations to **frame counts** at the start of your experiment, based on the measured refresh rate. This avoids subtle rounding errors that accumulate over trials:

```python
# Measure the actual refresh rate (more reliable than assuming 60 Hz)
refresh_rate = win.getActualFrameRate(nIdentical=50, nWarmUpFrames=100)
if refresh_rate is None:
    refresh_rate = 60.0  # Fallback

# Convert durations to frames
stimulus_frames = round(stimulus_duration_s * refresh_rate)
fixation_frames = round(fixation_duration_s * refresh_rate)
```

!!! warning "Rounding matters"
    At non-standard refresh rates, rounding can introduce small but cumulative timing errors. For example, at 75 Hz: 2.5 s → 188 frames → 188/75 = 2.507 s (not 2.500 s). Using frame-quantized durations means your expected onset matches the actual onset.

### Same-trial timing compensation

If a trial starts slightly late (e.g., due to a brief processing delay), compensate by reducing the jitter duration of the **same trial** rather than letting the error accumulate to the next trial. This ensures each trial ends on schedule regardless of small onset delays.

### System warmup and GPU stabilisation

Before the first trial of each run, perform a warmup to stabilise the GPU rendering pipeline:

1. **Pre-upload textures**: draw every stimulus once (hidden behind a full-screen rectangle) to move textures from CPU RAM to GPU VRAM
2. **VSync stabilisation**: flip the screen for ~2 seconds with the fixation cross to fill driver queues
3. **Garbage collection**: call `gc.collect()` to free setup objects and prevent GC pauses during trials
4. **Clear keyboard buffer**: discard any stale key events from the warmup period

### Avoid disk I/O during trials

File writes (logging to disk, saving screenshots) can cause unpredictable delays of 10–100 ms. Instead:

- **Buffer events in memory** during the trial loop (e.g., append to a list)
- **Write to disk** only between blocks or at the end of each run

### Disable garbage collection during trials

Python's garbage collector can pause execution for 10–100 ms, which shows up as dropped frames. Disable it during timing-critical trial loops and re-enable it between blocks:

```python
import gc

gc.disable()  # Before the trial loop
# ... run trials ...
gc.enable()   # Between blocks or at end of run
gc.collect()
```

---

## PsychoPy-specific

PsychoPy has built-in functionality to nicely control for the timing of events. In particular, the `win.callOnFlip()` function allows you to build up a series of command that you would like to execute exactly when the next frame is being presented, which is very handy for sending triggers and logging events. Below is a code snippet showing how to use this function to (1) send a trigger, (2) draw a rectangle, and (3) log an event at the exact moment a stimulus is being presented:

```python
# Prepare stimulus
stimulus = visual.ImageStim(...)

# Look up the trigger code from the JSON mapping
trigger = TRIGGERS['stimulus_onset']  # e.g., 81

# Draw stimulus and photodiode rectangle
stimulus.draw()
diode_black.draw()  # Black = stimulus is on screen

# Queue trigger send and event log for the exact moment the frame is presented
win.callOnFlip(send_trigger, trigger, serialport)
win.callOnFlip(log_event, 'stimulus_presented')  # assuming you have a log_event function

# Flip the window to present the frame
win.flip()
```

---

## Running your experiment

### Debug and development modes

Build debug/quick modes into your experiment for development:

- **Windowed mode**: run in a small window instead of fullscreen, for testing on your laptop
- **No-EEG mode**: skip serial port initialisation, so you can run the task without the EEG equipment
- **Quick mode**: reduce the number of trials per block for rapid smoke-testing, while keeping real timing

### Pre-flight system checks

Before starting a real EEG recording session, verify that the system is configured for optimal timing:

- **Lowlatency kernel**: recommended for Linux to reduce OS jitter
- **CPU governor**: set to `performance` mode (not `powersave`)
- **Serial port**: detected and accessible (`ls /dev/ttyUSB*`)
- **VSync**: engaged (PsychoPy's `getActualFrameRate()` returns a stable value close to 60 Hz)

### BIDS-compatible event logging

Your experiment should produce event log files that are **directly usable as BIDS `*_events.tsv`** without any transformation. This is a key design goal: the BIDS conversion script should only need to **copy** the events file into the BIDS directory — not parse, reformat, or enrich it.

#### Required columns

The [BIDS events specification](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html) requires `onset` and `duration`. Beyond that, include every column that your analysis pipeline will need. A well-designed events file makes downstream analysis trivial — you can filter, group, and label directly from the events.tsv without merging external files.

| Column | Required | Description |
|--------|----------|-------------|
| `onset` | **yes** | Time of the event in seconds, relative to the **start of the run** (not the experiment). Resets to 0 at each run start. |
| `duration` | **yes** | Duration of the event in seconds. Use `0` for instantaneous events (triggers, button presses). Use `n/a` if unknown. |
| `trial_type` | recommended | Condition label — the primary variable you will analyse (e.g., `check`, `no_check`, `fixation`, `response`). |
| `trigger_id` | recommended | The trigger code sent to the EEG system (integer 0–255). Matches the trigger mapping JSON. |
| `response` | if applicable | Participant's response key or label. Use `n/a` for non-response events. |
| `response_time` | if applicable | Reaction time in seconds. Use `n/a` if no response. |
| `stim_file` | if applicable | Path to the stimulus file, relative to the `stimuli/` folder. |
| `block` | recommended | Block number (1-indexed). |
| `trial` | recommended | Trial number within the block. |
| *your columns* | as needed | Any additional experimental variables (e.g., `check_status`, `strategy_id`, `visual_pair`). |

!!! warning "Onset timing: per-run, not per-experiment"
    BIDS expects `onset` to be relative to the start of each **run**, not the start of the whole experiment. If your experiment has multiple runs in a single recording, reset the onset clock at each run start. This is critical — mismatched time references will cause epoching errors.

#### File naming and format

Save one events file per run as a **tab-separated** `.tsv`:

```
<timestamp>_sub-<ID>_run-<NN>_task-<taskname>_events.tsv
```

For example: `2026-02-14-16-13_sub-03_run-01_task-chess_1back_events.tsv`

- **Tab-separated**, not comma-separated.
- Use `n/a` (not empty cells, `NaN`, or `None`) for missing values — this is the BIDS convention.
- Include a header row with column names.
- Include **all events**: stimuli, fixations, responses, block/run markers. The more complete the log, the more flexibility you have during analysis.

#### Why this matters

If your task produces BIDS-ready events files, the BIDS conversion script only needs to copy them into the right location — no parsing, merging, or reformatting. This eliminates a common source of bugs (mismatched columns, wrong onset references, lost metadata) and means your raw behavioural logs are already your analysis-ready event files.

See [Organise your EEG data](analysis/eeg-bids-conversion.md) for how these files are placed into the BIDS structure during conversion.

<!--
__TODO__: [Andrea,Tim] Create a PsychoPy EEG task template that implements trigger
sending (via serial port), photocell rectangle logic, and timing best practices
(ITI, jitter, callOnFlip) as described on this page. Host the template repo under
HOPLAB-LBP and link it in the intro paragraph above.

__TODO__: [Andrea,Tim] Define the definitive events.tsv column schema for the lab's
task framework. The goal is that the task produces files that are directly BIDS-compliant
(correct onset reference, correct column names, n/a for missing values, tab-separated)
so the BIDS conversion script only copies them without transformation. Document the
agreed schema here and update the BIDS conversion script accordingly.

__TODO__: [Andrea,Tim] Decide the reference point for `response_time`: relative to
stimulus onset (i.e. pure reaction time), relative to start of the response window,
relative to run start, or something else? Document the convention and enforce it in
the task framework so all experiments are consistent.
-->
