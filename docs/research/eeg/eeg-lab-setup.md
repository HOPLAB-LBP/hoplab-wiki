# EEG lab setup

This page documents the hardware configuration and practical setup of the EEG lab in room PSI 00.52. It covers the default equipment configuration, PsychoPy settings for EEG experiments, EOG electrode placement, and common troubleshooting steps.

For the data acquisition procedure (cap setup, electrode gel, ActiView), see the [data acquisition guide](eeg-acquisition.md). For general guidance on trigger sending and photocell use in PsychoPy, see [Creating EEG tasks](eeg-task.md).

---

## Default hardware configuration

The EEG lab in PSI 00.52 uses the following equipment:

| Component | Details |
|-----------|---------|
| **EEG system** | BioSemi ActiveTwo, 128-channel (Hoplab) + 64-channel (Desenderlab) |
| **Sampling rate** | 1024 Hz |
| **Reference** | CMS/DRL (Common Mode Sense / Driven Right Leg) — re-referenced offline |
| **Monitor** | BenQ ZOWIE XL2411 (gaming monitor) |
| **Resolution** | 1920 × 1080 px |
| **Refresh rate** | 60 Hz |
| **Panel size** | 531 × 299 mm |
| **Input lag** | 4 ms |
| **Response time** | 1 ms (GTG) |
| **Viewing distance** | 630 mm (from participant's eyes to screen centre) |
| **Trigger interface** | BioSemi USB Trigger Interface (serial, single-byte protocol) |
| **Serial port** | `/dev/ttyUSB0` (Linux), 115200 baud, 8N1 |
| **Trigger range** | Integer values 0–255 (8-bit) |
| **Photodiode** | Taped to the bottom-left corner of the monitor; connected to channel `Erg1` |

!!! info "Photocell placement"
    The photodiode is positioned at the bottom-left corner of the screen to avoid obstructing the participant's view. It detects luminance changes on a small rectangle drawn at that location by the experiment script. The photodiode signal is recorded on the `Erg1` channel and provides ground-truth timing for stimulus onsets. See the [Creating EEG tasks](eeg-task.md#using-the-photocell) page for how to implement this in your experiment.

<!-- __PLACEHOLDER__: [Andrea] Verify and add: A/D box and battery placement in the room, response box model and button mapping, cable routing between rooms, and any other peripheral equipment. -->

---

## PsychoPy settings for EEG

When running EEG experiments in the lab, use the following PsychoPy window and monitor configuration:

### Monitor object

Configure a PsychoPy `Monitor` object to match the lab display:

```python
from psychopy import monitors

mon = monitors.Monitor('BenQ_EEG_Lab')
mon.setWidth(53.1)          # Screen width in cm
mon.setDistance(63.0)        # Viewing distance in cm
mon.setSizePix([1920, 1080])
```

### Window settings

```python
from psychopy import visual

win = visual.Window(
    monitor=mon,
    size=[1920, 1080],
    fullscr=True,            # Always fullscreen for EEG experiments
    waitBlanking=True,        # Wait for VSync — critical for timing
    screen=0,
    units='height',
    color=[-1, -1, -1],       # Black background (adjust as needed)
)
win.recordFrameIntervals = True  # Track dropped frames
```

!!! warning "Always use fullscreen and VSync"
    Running in fullscreen with `waitBlanking=True` is essential for frame-accurate timing. Without VSync, `win.flip()` returns immediately rather than waiting for the monitor's vertical blank, which makes trigger timing unpredictable.

### Serial port for triggers

```python
import serial

try:
    serialport = serial.Serial("/dev/ttyUSB0", baudrate=115200)
    serialport.reset_input_buffer()
    serialport.reset_output_buffer()
except serial.SerialException as e:
    print(f"Serial port not available: {e}")
    serialport = None  # Handle gracefully or abort if in EEG mode
```

### System warmup

Before the first trial, stabilise the GPU rendering pipeline to avoid initial frame drops:

```python
import gc

# 1. Pre-upload textures: draw each stimulus once (hidden behind a full-screen rect)
#    This moves textures from CPU RAM to GPU VRAM before timing-critical code
for stim in all_stimuli:
    stim.draw()
    cover_rect.draw()  # Covers the stimulus so participant doesn't see it
    win.flip()

# 2. VSync stabilisation: flip for ~2 seconds to fill driver queues
from psychopy import core
warmup_clock = core.Clock()
while warmup_clock.getTime() < 2.0:
    fixation_cross.draw()
    win.flip()

# 3. Force garbage collection before trials begin
gc.collect()
```

!!! tip "Store machine settings in JSON"
    We recommend storing machine-specific settings (monitor model, dimensions, viewing distance, serial port path) in a JSON configuration file rather than hardcoding them. This allows the same experiment code to run on different machines (e.g., the lab PC and your laptop) by simply switching the config file. See the [Creating EEG tasks](eeg-task.md#experiment-configuration) page for details.

---

## EOG electrode placement

<!-- __PLACEHOLDER__: [Andrea] Document the standard EOG electrode placement used in the lab. Include: which ExG channels are used for horizontal and vertical EOG, exact placement positions (e.g., outer canthi for HEOG, above/below eye for VEOG), and whether bipolar or monopolar recording is used. Include a diagram or photo if possible. -->

!!! info "Contributions needed"
    This section needs input from lab members with hands-on experience. Items to cover: ExG channel assignments (which EXG channels are HEOG and VEOG), electrode placement positions, monopolar vs. bipolar configuration, and skin preparation for external electrodes. If you can contribute, please edit this page on the `improve/eeg-section-development` branch (see [PR #332](https://github.com/HOPLAB-LBP/hoplab-wiki/pull/332)).

---

## Troubleshooting

### Triggers not registering

| Symptom | Likely cause | Solution |
|---------|-------------|----------|
| No triggers appear in ActiView | Serial port not connected | Check that the BioSemi USB Trigger Interface is plugged in. Run `ls /dev/ttyUSB*` to verify the port is detected. |
| `serial.SerialException` in Python | Wrong port or no permissions | Verify the port path (`/dev/ttyUSB0`). Ensure your user is in the `dialout` group: `sudo usermod -a -G dialout $USER` (requires logout/login). |
| Triggers appear but with wrong codes | Bitmask issue | BioSemi Status channel uses bitmask encoding. When reading events in MNE, use `mask=0x00FF, mask_type='and'` to extract the 8-bit trigger code. |
| Duplicate or repeated triggers | No trigger reset | BioSemi's USB interface auto-resets after ~8 ms, so this is usually not needed. If using other hardware, send a 0 trigger after a ~10 ms delay. |

### Timing and display issues

| Symptom | Likely cause | Solution |
|---------|-------------|----------|
| Many dropped frames | Desktop compositor running | Use the i3 window manager session (no compositor) for EEG experiments. Disable any desktop effects. |
| Inconsistent frame timing | VSync not engaged | Ensure `waitBlanking=True` in PsychoPy. Check GPU drivers and persistence mode (`nvidia-smi -pm 1`). |
| Timing drift across trials | Not working in frames | Convert all durations to frame counts at the start of the experiment. See [timing best practices](eeg-task.md#timing-best-practices). |
| First few trials have timing issues | GPU not warmed up | Use the warmup procedure above before the first trial. |

### System configuration

| Symptom | Likely cause | Solution |
|---------|-------------|----------|
| Inconsistent timing across sessions | CPU frequency scaling | Set the CPU governor to `performance` mode: `sudo cpufreq-set -g performance`. |
| Unexpected pauses during trials | Python garbage collection | Disable the garbage collector during timing-critical trial loops. Re-enable between blocks. |
| ActiView not detecting A/D box | USB connection or battery | Check that the A/D box battery is charged and the fibre-optic cable is connected. Restart ActiView. |

<!-- __TODO__: [Andrea] Add any additional troubleshooting items encountered in the EEG lab. Include eye-tracker specific issues once the EyeLink is fully integrated. -->
