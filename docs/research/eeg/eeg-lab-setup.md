# EEG lab setup

This page documents the hardware configuration and practical setup of the EEG lab in room PSI 00.52. It covers the default equipment configuration, PsychoPy settings for EEG experiments, EOG electrode placement, and common troubleshooting steps.

!!! warning "Page status"
    This page contains placeholder sections that need to be filled in by lab members with hands-on experience. If you can contribute, please edit this page on the `improve/eeg-section-development` branch (see the [PR #332](https://github.com/HOPLAB-LBP/hoplab-wiki/pull/332) for instructions).

---

## Default hardware configuration

<!--
__PLACEHOLDER__: Document the default hardware configuration of the EEG lab,
including: BioSemi ActiveTwo system specs (128-channel + 64-channel), A/D box
placement, photocell placement on the monitor, screen resolution and refresh rate,
response box model and button mapping, and cable routing.
-->

*This section needs to be filled in.*

Key items to document:

- BioSemi ActiveTwo system (128-channel and 64-channel setups)
- A/D box and battery placement
- Monitor model, resolution, and refresh rate
- Photocell placement on the screen
- Response box model and button configuration
- Default cable routing

For the data acquisition procedure (cap setup, electrode gel, ActiView), see the [data acquisition guide](eeg-acquisition.md).

---

## PsychoPy settings for EEG

<!--
__PLACEHOLDER__: Document the correct PsychoPy settings for running EEG experiments
in the lab, including: monitor configuration (size, distance, refresh rate),
timing delays specific to our setup, serial port configuration for triggers,
and any known quirks or workarounds.
-->

*This section needs to be filled in.*

Key items to document:

- Monitor calibration (size, viewing distance, refresh rate)
- Known timing delays between trigger send and stimulus onset
- Serial port configuration (COM port, baud rate)
- PsychoPy window settings (fullscreen, screen number, colour space)
- How to verify timing with the photocell

For general guidance on trigger sending and photocell use in PsychoPy, see [Creating EEG tasks](eeg-task.md).

---

## EOG electrode placement

<!--
__PLACEHOLDER__: Document the standard EOG electrode placement used in the lab.
Include: which ExG channels are used for horizontal and vertical EOG, exact
placement positions (e.g., outer canthi for HEOG, above/below eye for VEOG),
and whether bipolar or monopolar recording is used. Include a diagram or photo
if possible.
-->

*This section needs to be filled in.*

Key items to document:

- ExG channel assignments (which BioSemi ExG channels map to which EOG positions)
- Electrode placement for horizontal EOG (HEOG)
- Electrode placement for vertical EOG (VEOG)
- Monopolar vs. bipolar recording configuration
- Skin preparation for external electrodes

---

## Troubleshooting

<!--
__PLACEHOLDER__: Document common problems encountered in the EEG lab and their
solutions. Include: triggers not registering (USB serial connection failures,
wrong COM port, PsychoPy serial configuration), timing drift, noisy recordings,
ActiView not detecting the A/D box, and any other issues lab members have
encountered.
-->

*This section needs to be filled in.*

Common issues to document:

??? failure "Triggers not registering"
    *To be documented: typical causes (wrong COM port, serial cable disconnected, PsychoPy serial configuration) and solutions.*

??? failure "USB serial connection failures"
    *To be documented: driver issues, cable problems, port identification.*

??? failure "Timing drift or variable delays"
    *To be documented: refresh rate mismatch, dropped frames, photocell verification.*

??? failure "ActiView not detecting the A/D box"
    *To be documented: battery issues, USB connection, driver problems.*

??? failure "Excessively noisy recordings"
    *To be documented: grounding issues, cable interference, electrode gel problems.*
