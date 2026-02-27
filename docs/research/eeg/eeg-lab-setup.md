# EEG lab setup

This page documents the hardware configuration and practical setup of the EEG lab in room PSI 00.52. It covers the default equipment configuration, PsychoPy settings for EEG experiments, EOG electrode placement, and common troubleshooting steps.

!!! warning "Page status"
    This page contains placeholder sections that need to be filled in by lab members with hands-on experience. If you can contribute, please edit this page on the `improve/eeg-section-development` branch (see the [PR #332](https://github.com/HOPLAB-LBP/hoplab-wiki/pull/332) for instructions).

---

## Default hardware configuration

<!-- __PLACEHOLDER__: Document the default hardware configuration of the EEG lab, including: BioSemi ActiveTwo system specs (128-channel + 64-channel), A/D box placement, photocell placement on the monitor, screen resolution and refresh rate, response box model and button mapping, and cable routing. -->

!!! info "Contributions needed"
    This section needs input from lab members. Items to cover: BioSemi ActiveTwo system specs (128-ch and 64-ch), A/D box and battery placement, monitor model/resolution/refresh rate, photocell placement, response box configuration, and cable routing.

For the data acquisition procedure (cap setup, electrode gel, ActiView), see the [data acquisition guide](eeg-acquisition.md).

---

## PsychoPy settings for EEG

<!-- __PLACEHOLDER__: Document the correct PsychoPy settings for running EEG experiments in the lab, including: monitor configuration (size, distance, refresh rate), timing delays specific to our setup, serial port configuration for triggers, and any known quirks or workarounds. -->

!!! info "Contributions needed"
    This section needs input from lab members. Items to cover: monitor calibration (size, viewing distance, refresh rate), known timing delays, serial port configuration (COM port, baud rate), PsychoPy window settings, and photocell verification procedure.

For general guidance on trigger sending and photocell use in PsychoPy, see [Creating EEG tasks](eeg-task.md).

---

## EOG electrode placement

<!-- __PLACEHOLDER__: Document the standard EOG electrode placement used in the lab. Include: which ExG channels are used for horizontal and vertical EOG, exact placement positions (e.g., outer canthi for HEOG, above/below eye for VEOG), and whether bipolar or monopolar recording is used. Include a diagram or photo if possible. -->

!!! info "Contributions needed"
    This section needs input from lab members. Items to cover: ExG channel assignments, electrode placement for HEOG and VEOG, monopolar vs. bipolar configuration, and skin preparation for external electrodes.

---

## Troubleshooting

<!-- __PLACEHOLDER__: Document common problems encountered in the EEG lab and their solutions. Include: triggers not registering (USB serial connection failures, wrong COM port, PsychoPy serial configuration), timing drift, noisy recordings, ActiView not detecting the A/D box, and any other issues lab members have encountered. -->

!!! info "Contributions needed"
    This section needs input from lab members. Known issues to document include: triggers not registering, USB serial connection failures, timing drift, ActiView not detecting the A/D box, and excessively noisy recordings. If you have encountered and solved any of these, please add your solutions here.
