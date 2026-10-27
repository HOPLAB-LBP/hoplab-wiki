# Eye tracking during fMRI

The lab records eye movements during fMRI with an EyeLink 1000 long range. The steps below were written at MR8; MR11 uses the same eye tracker and eye-tracking computer. This page walks you through a session on the EyeLink: what to switch on, which screen of the eye-tracking software to open, and which key or button to press, from positioning the participant to recording each run. Everything else in the session works as in the [MR11 scanning procedure](fmri-procedure.md).

!!! warning "Written for MR8: check the room details at MR11"
    MR8 was decommissioned in 2026. The EyeLink and the eye-tracking computer moved to MR11 unchanged, but the room is different (where the camera stands, where it is powered, which mirror and marks are used). Plan a pilot with Ron Peeters before your first participant, and note what is different. The open points are listed under [To check at MR11](#to-check-at-mr11).

!!! abstract "On this page"
    - **You need**: an approved fMRI study that records eye movements, and a task script that controls the EyeLink.
    - **You get**: the participant positioned for tracking, a calibrated and validated tracker, and one EDF file per run.
    - **Skip this page** if you only need gaze estimated from the fMRI images themselves: see [bidsmreye](analysis/fmri-prepocessing-qa.md#processing-eye-tracking-data-with-bidsmreye).

---

## The equipment

- **EyeLink 1000 long range** system, including the camera and infrared light source
- **ET box** to convert analog input from the EL-1000 to digital.
- **ET PC** to run the Eyelink software and control recordings and settings.
- Power for the ET system is located in the back room.

Two computers are involved. The **ET PC** (SR Research calls it the Host PC) runs the EyeLink software: this is where you see the camera image, set thresholds and start calibrations. The **stimulus PC** (the Display PC) shows the task, the calibration targets and, during set-up, a copy of the camera image. Most keys on this page are pressed on the ET PC keyboard.

??? info "The screens of the EyeLink software"
    The EyeLink software on the ET PC is organised in screens, each with its own buttons and keyboard shortcuts. You will use these ([EyeLink 1000 User Manual 1.5.2][el-manual], section 2.3):

    | Screen | What you do there | Open it with |
    |---|---|---|
    | Camera Setup | See the camera image, select the eye, set thresholds | `ENTER` from the Offline screen |
    | Set Options | Calibration type, target order and pacing | **Set Options** button |
    | Calibrate | Map pupil position to screen position | `C` (or **Calibrate**) |
    | Validate | Measure the gaze error of that calibration | `V` (or **Validate**) |
    | Output / Record | Open or close the EDF file, start recording | `O` (or **Output**), then `O` or `ENTER` |

    `ESC` takes you back one step; pressed twice during a calibration, it returns to Camera Setup.

---

## Run a session

???+ steps "Switch on the eye tracker"
    In the **scanner area**:

    - Connect the eyetracker plug to the **power supply** (marked with a white tag: "eyetracking").
    - Ensure the screen is aligned with the **EYE** line.
    - Check if the eyetracker setup is aligned with the floor marks.

    On the **ET PC** in the control room, boot the **Eyelink** software (the default option in the Windows Boot Manager). If Eyelink doesn't start, press `t` followed by **Enter** to launch it manually.

    On the **stimulus PC**, open **track2popup** to view the eye on the screen and adjust the sharpness.

    <!--
    __TODO__: [Roos] Photo: the eye-tracker power plug with its tag, and the floor marks, at MR11. (Shot list, 2026-10-27.)
    __TODO__: [Roos] Screenshot: the ET PC after start-up (Offline screen). (Shot list, 2026-10-27.)
    -->

???+ steps "Position the participant"
    1. Use the **square mirror** with front reflection.
    2. Position the participant's head as high as possible in the coil (to reduce shadows on the face).
    3. Support the participant's neck with **washcloths** to tilt the head back for better eye visibility.

    Ask participants to remove false eyelashes before the session: they often disturb tracking ([Nau, 2025][nau]). Glasses can reflect the infrared light and hide the pupil, and not every participant with glasses can be tracked (manual, section 3.3).

    <!--
    __TODO__: [Roos] Photo: participant in the head coil with the mirror in place, seen from the camera side, at MR11 (no face visible). (Shot list, 2026-10-27.)
    -->

???+ steps "Find the eye in Camera Setup"
    1. On the ET PC, press `ENTER` to open **Camera Setup**. Press `ENTER` again to send the camera image to the stimulus PC (manual, section 3.13).
    2. Look at the large camera view (the global view). If the image is upside down, press the flip button to the right of it; the button to its left rotates the image by 90° (manual, section 3.2.7.1).
    3. Adjust the camera position by holding a finger in front of it to check where it's pointing. The eye you track should sit in the centre of the global view, ideally with the other eye out of the image, so the tracker cannot switch eyes.
    4. Double-click the pupil in the global view. The eye appears in the small zoomed view, with a green box and a cross on the pupil once it is detected.
    5. Select the zoomed view with the left or right arrow key and turn the focusing ring on the lens until the eye is sharp. At best focus, the turquoise circle of the corneal reflection is smallest (manual, section 3.2.7.1). In the scanner, a slightly blurred image can track more stably, because it smooths out the noise of the MRI environment; do not overdo it ([Nau, 2025][nau]).

    <!--
    __TODO__: [Roos] Screenshot: Camera Setup screen with the eye found (global and zoomed view), at MR11. (Shot list, 2026-10-27.)
    -->

???+ steps "Set the pupil and corneal reflection thresholds"
    Both the **pupil** and the **corneal reflection (CR)** must be well detected. The tracking mode stays on pupil-CR (manual, section 3.4).

    1. Press `A` (**Auto Threshold**). The pupil should turn solid blue, and a turquoise circle (the corneal reflection) should appear next to it. If large areas turn blue, the participant probably blinked: press `A` again.
    2. Fine-tune the **pupil threshold** with the up and down arrow keys for the clearest possible image, and the **CR threshold** with `+` and `-`. Set both by hand after the automatic setting: raising the CR threshold a little above the automatic value often helps ([Nau, 2025][nau]).
    3. Ask the participant to look at the corners and edges of the screen while you watch the image. A threshold set too low makes the blue area smaller than the pupil and the data noisy; one set too high lets shadows in the eye corners capture the pupil (manual, section 3.3). Red "No Pupil" or "No CR" messages under the camera image mean the eye was lost at that position.
    4. Check the values under the image. After adjustment, the pupil threshold should be between 75 and 110 and the CR threshold should not exceed 230. A low pupil threshold calls for more infrared light, high thresholds for less (manual, section 3.3).

    Keep the stimulus screen at the luminance of your task while you do this, because pupil size follows luminance ([Nau, 2025][nau]).

    <!--
    __TODO__: [Roos] Screenshot: zoomed camera view with good pupil (blue) and CR (turquoise) thresholds, and the threshold values, at MR11. (Shot list, 2026-10-27.)
    -->

???+ steps "Calibrate"
    1. Before starting **Smartbrain**, ensure the participant is in the optimal head position for calibration.
    2. Check the settings once under **Set Options**: calibration type 9-point grid (HV9), random target order, auto-trigger pacing 1000 ms (manual, section 3.7). Return with **Previous Screen**.
    3. Press `C` to start calibration, and guide the participant to focus on the dots: ask them to look at the white spot in the middle of each target and to keep their head still.
    4. When the word "stable" appears, press `SPACEBAR` 9 times for each point. In the manual, `ENTER` or `SPACEBAR` accepts the first fixation, and the other targets are then collected automatically; `M` switches to manual mode, where each point needs a key press, and `A` switches back. `Backspace` takes back the last point (manual, section 3.7).
    5. Watch the crosses on the ET PC: for a 9-point calibration they should form three horizontal and three vertical lines. The result is graded **GOOD** (green) or **FAILED** (red). Press `ENTER` (or **Accept**) to accept it, or `ESC` to start again.

    <!--
    __TODO__: [Roos] Screenshot: Calibrate screen after a GOOD calibration (grid of crosses), at MR11. (Shot list, 2026-10-27.)
    -->

???+ steps "Validate"
    1. Press `V` to start validation, guiding the participant to focus on the dots. Accept the first fixation with `ENTER` when the gaze cursor is stable near the target; the rest run as in the calibration.
    2. Each point shows its error in degrees, and the bottom of the screen shows the average and worst error. Each eye is graded **GOOD** (green), **FAIR** (grey: improve the calibration) or **POOR** (red: too inaccurate to use) (manual, section 3.8).
    3. If successful, press **ACCEPT**. If validation fails, recalibrate if needed. One bad point usually means the participant looked away: press `ESC` and `V` to validate again. A regular pattern (for example, all left points too low) means a calibration or camera problem: press `ESC` and calibrate again.

    <!--
    __TODO__: [Roos] Screenshot: Validate screen with the errors per point and the grade, at MR11. (Shot list, 2026-10-27.)
    -->

???+ steps "Record each run"
    - Open a new file before each functional run and press **RECORD** at the start of the run.
    - Stop recording by pressing **CLOSE FILE** at the end of the run.

    On the ET PC, `O` (or **Output**) opens the screen where EDF files are opened and closed; `O` or `ENTER` again starts recording (manual, section 3.10).

    During the run, keep an eye on the ET PC. You can still make small adjustments after the run has started; in the worst case, restart the run ([Nau, 2025][nau]).

    <!--
    __TODO__: [Roos] Screenshot: Output/Record screen during a run, at MR11. (Shot list, 2026-10-27.)
    -->

!!! tip "Controlling EyeLink"
    It is advisable to control the calibration, validation, recordings and data collection from the script you use for your fMRI task.

---

## Good practice in the scanner

These tips come from [Eye tracking in neuroimaging: tips & tricks][nau] by Matthias Nau (April 2025), written for the EyeLink in MRI and MEG. They assume you have read the manual.

??? deflist "Change the illuminator angle"
    When calibration is poor, the infrared illuminator is often the problem, not the camera. With a long-range set-up, changing the angle of the illuminator towards the participant can help a lot.

??? deflist "Try other illuminator power levels"
    Too much infrared light causes diffuse reflections, for example on the head coil, that confuse the tracker. Too little drowns the eye in noise. Try several levels.

??? deflist "Cover reflections with tape"
    Unwanted reflections, for example from the head coil, can be blocked with duct tape.

??? deflist "Never touch the mirror"
    The reflective foil of an eye-tracking mirror has no glass over it, and fingers damage it.

??? deflist "Try a lower sampling rate"
    500 Hz or lower seems to make tracking more stable in some cases.

??? deflist "Check for drift between runs"
    The head can sink slowly during a session (for example, as neck muscles relax). Check drift more often than in the lab, for example about every 10 minutes; a check takes about 5 seconds. With the long-range mount, the manual also describes true drift correction and online drift correction during a run (section 3.11).

??? deflist "Give the eyes breaks"
    Fatigue is a main cause of poor data. Let participants rest their eyes every few minutes, especially in fixation tasks.

??? deflist "Switch off infrared motion tracking"
    Some prospective motion-correction systems use infrared light at a wavelength close to the EyeLink's and cause large artefacts. Switch them off if the scanner has one.

---

## After the session

Copy the EDF files with the rest of your data, and store them as described in [BIDS conversion](analysis/fmri-bids-conversion.md#11-converting-eye-tracking-data-to-bids).

The recording starts a few seconds before the scan, so the first sample of an EDF file is not scanner time 0. Time 0 is the `TRIGGER_RECEIVED` message, which the task script writes into the EDF when the first trigger arrives. Time eye data, messages and the task log from that message.

<!--
__TODO__: [Andrea] Link align_eye_to_trigger.py (eyelink-task-template) here once the repo is public: it drops the pre-scan part and makes TRIGGER_RECEIVED time 0. (Repo local only, 2026-10-27.)
__TODO__: [Andrea] Add the tested MATLAB (Psychtoolbox) and Python (PsychoPy) snippets from the eyelink-task-template repo as a section "Control the EyeLink from your task script": connect, open the EDF, camera set-up and calibration, recording around the trigger, messages, stop, close and receive the file. (Code parked, 2026-10-27.)
-->

---

## Troubleshooting

??? failure "CalPopUp2 Issues"
    If **CalPopUp2** does not start properly (errors or failure to create a new file), restarting the **stimulus PC** should solve the issue.

??? failure "Tracking Issues"
    If the eye is not being tracked during camera setup:

    - Ask the participant to adjust the mirror for better light.
    - Add **washcloths** under their neck to tilt the head back for a clearer view.

??? failure "The calibration stops at one target"
    Sequencing halts when the pupil is lost or noisy at that target position. Adjust the threshold, then press `ESC` to restart the calibration; press it twice to return to Camera Setup (manual, section 3.7).

??? failure "The eye is lost when the participant looks to the side"
    The pupil leaves the green box or a corner shadow captures it ("No Pupil" under the camera image). Lower the pupil threshold, check the focus, and look again with the participant looking at the corners (manual, sections 3.3 and 3.9).

---

## To check at MR11

Nothing below has been confirmed at MR11 yet. Check each point at the scanner during a pilot.

- Where the camera, the infrared light source and the eye-tracking computer stand in MR11, and where the eye tracker is powered.
- Which mirror to use, and whether the head coil leaves the eyes visible to the camera.
- Whether the in-room screen has an alignment mark and the floor has marks for the camera, as at MR8.
- Whether **track2popup** and **CalPopUp2** exist on the MR11 stimulus PC.
- Whether all calibration targets are visible inside the bore, or the calibration area must be made smaller.
- How the illuminator power is changed with the long-range mount (the manual lists the power button, key `I`, for the desktop and remote mounts only).
- Whether the scanner uses infrared motion tracking that must be switched off.

[el-manual]: https://natmeg.se/onewebmedia/EL1000_UserManual_1.52.pdf
[nau]: https://matthiasnau.com/eye_tracking.html

<!--
__TODO__: [Andrea] Step "Set the pupil and corneal reflection thresholds" used to say "corneal reflex (CT)" (MR8 text); EyeLink calls it the corneal reflection (CR), now used on the page. Confirm. (Not asked yet.)
__TODO__: [Andrea] Step "Calibrate" says "press SPACEBAR 9 times for each point" (MR8 text): the manual has one key press for the first point and automatic pacing after it, or one press per point in manual mode. Check the intended wording. (Not asked yet.)
__TODO__: [Andrea] Step "Calibrate" mentions "Smartbrain": say what it is, or remove it. (Not asked yet.)
__TODO__: [Andrea] Confirm the lab may reuse Matthias Nau's tips (the old eye-tracking index said permission was received; by whom, when?). (Not asked yet.)
__TODO__: [Roos] Pilot at MR11 with Ron Peeters: report what differs from the MR8 steps and the list under "To check at MR11", and take the screenshots and photos listed in the hidden notes. (Pilot done before 2026-10-26; report not received yet.)
-->
