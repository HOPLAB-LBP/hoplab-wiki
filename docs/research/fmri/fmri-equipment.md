# MR11 equipment reference

This page describes the equipment you use around **MR11**, the Siemens MAGNETOM Cima.X 3T research scanner at UZ Leuven Gasthuisberg. For the step-by-step session, see the [Scanning procedure](fmri-procedure.md). For the 7T in Brussels, see [Flanders 7T](fmri-7t.md).

The radiology wiki ([wiki.kulradiology.be](https://wiki.kulradiology.be), section *Peripheral Equipment › MR11 - Cima.X 3T*) has the manuals and photos of each device. This page keeps what you need to program and run an experiment.

---

## The MR11 suite

- **Scanner**: Siemens MAGNETOM Cima.X 3T, in use since 11 June 2026 (software XA61, service pack 4 since 25 August 2026).
- **Head coils**: 64-channel (default) and 20-channel head coils.
- **Location**: *Beeldvorming 2, Gele straat, Poort 2, niveau 0, MR11* (UZ Leuven Gasthuisberg).
- **Rooms**: the console room (scanner console, stimulus PC, trigger box, audio system and screen control box), the magnet room, the technical room, preparation rooms 1 and 2 (participant instructions and preparation; the XNAT download PC is in preparation room 1), a waiting room and a storage room.

!!! danger "The magnetic field reaches outside the magnet room"
    The 5 Gauss line extends into the technical room, and the hallway door of the magnet room is only about 2.7 m from the magnet centre. Bring no equipment into the MRI department without approval of the MRI Safety Officer (see [First steps](fmri-get-started.md#attend-the-mr-safety-course)).

---

## Stimulus PC

The hospital stimulus PC stands in the console room. It is the standard computer for presenting stimuli at MR11.

??? deflist "Login"
    Login details are in the [contact and passwords document](https://kuleuven.sharepoint.com/:w:/r/sites/T0005824-Hoplab/_layouts/15/Doc.aspx?sourcedoc=%7B5F0ACBA0-431D-45EE-BB84-4DAF31531222%7D&file=Contact%20information%2C%20usernames%20and%20passwords.docx&action=default&mobileredirect=true) in the Hoplab Teams folder and on the radiology wiki (*Stimulus PC* page). Do not copy them anywhere public.

    !!! tip "Password not accepted?"
        If the password is not accepted, check for a **qwerty-azerty** keyboard mismatch. Press `alt+shift` and ensure **EN** is selected on the login screen.

??? deflist "Software"
    **PsychoPy v2026.1.3** is installed (radiology wiki, August 2026). Pin this version in your experiment (PsychoPy *useVersion*) or check that your script runs on it during your test session.

??? deflist "Displays"
    The PC has two displays:

    - **Display 1** = the in-room screen (what the participant sees);
    - **Display 2** = the local monitor in the console room.

    The displays can be set to *extend* or *duplicate* in Windows settings. In both modes, the participant screen is **screen 1**. In PsychoPy Builder, set it under *Experiment settings › Screen*.

??? deflist "House rules"
    - Do **not** use the stimulus PC for data transfer, e-mail or web browsing.
    - Do **not** install software yourself. Ask Ron Peeters.
    - At the end of your session, close all software but **leave the PC on**.
    - Take your log files with you at the end of the session (see [After scanning](fmri-procedure.md#after-scanning)).

!!! note "A lab stimulus laptop is planned"
    The lab plans to buy its own stimulus-presentation laptop, so that we can maintain the software ourselves and test experiments on the same machine before going to the scanner. It is **not available yet**: until it is, use the hospital stimulus PC. A laptop can be connected to the in-room screen and the trigger box (see [Connecting a laptop](#connecting-a-laptop)), but any laptop brought into the MRI department needs prior approval of the MRI Safety Officer.

---

## Trigger box and buttons

MR11 uses a **Current Designs** fibre-optic response system (fORP). The interface box in the console room receives the scanner trigger and the button presses and sends them to the stimulus PC as keyboard presses over USB.

### Mode

The box has several output modes, selected with the knob. Check the mode at the start of every session by pressing the knob.

- **Default: mode 002, `HID NAR BYGRT`**. The box acts as a USB keyboard; keys stay pressed until the button is released ("no auto-release"). This mode works best with the stimulus PC and PsychoPy.
- If you find the box in another mode, set it back to 002 and leave it in 002 at the end of your session.

LEDs on the box show each trigger and button press, which helps when you check the set-up.

### Key codes (mode 002)

| Input | Key sent |
|-------|----------|
| Scanner trigger (one per pulse) | `t` |
| First button pad: blue, yellow, green, red | `b`, `y`, `g`, `r` |
| Second button pad | `d`, `n`, `w`, `e` (from a lab experiment; which colour sends which key, and which pad is left or right, to be confirmed) |

The radiology wiki gives the trigger as the letter "T" and the buttons as "B for blue, Y for yellow, etc.". Your script receives them as ordinary key presses (PsychoPy and Psychtoolbox report lowercase key names such as `t`). Check the exact names with your own script during your test session.

!!! warning "Test the trigger with your own script before scanning participants"
    The trigger set-up at MR11 had problems in summer 2026:

    - The fibre-optic trigger cable failed in early July 2026 and was replaced. Only one of the two installed cables works, and it is fragile: **do not touch or move it**.
    - After the repair, one study received many more pulses than expected: (number of slices × 10) + 1 pulses, e.g. 641 pulses for 64 slices, instead of one pulse per volume. Scripts that counted pulses started late, with delays that grew from about 2 to 10 seconds over runs.

    Until this is documented by the radiology team, write your script to **start the task on the first trigger** and to **log every trigger with its timestamp** during the run. Then you can check after the session how many pulses arrived per volume and realign the timing if needed. In your phantom session, confirm how many triggers arrive per volume with your own sequence.

??? failure "No triggers or button presses arrive"
    1. Look at the LEDs on the interface box: if they light up, the box receives the signal and the problem is on the PC side (wrong window in focus, script not listening to the right keyboard). If they stay dark, the problem is on the scanner or cable side.
    2. Check that the box is in mode 002.
    3. Restart your script, then PsychoPy.
    4. Do not touch the fibre-optic cables. If the trigger still does not arrive, call the MR technician (40526) or contact Ron Peeters.
    5. **Last resort**: when the trigger cable failed in July 2026, the radiology team advised starting the task by hand: press `t` on the keyboard at a known moment of the run (e.g., when the console shows the remaining scan time you planned for). Write down for each run when you pressed it. You can estimate the delay afterwards from the time between the end of the task and the end of the scan, and correct your event timings or drop the first volume.

---

## In-room screen

The participant sees the stimuli on a **Cambridge Research Systems BOLDscreen 32 UHD**, an MR-compatible LCD screen at the back of the scanner, viewed through the mirror on the head coil. Its control box is in the console room.

| Property | Value |
|----------|-------|
| Default input | Stimulus PC |
| Default setting | L/R flip **ON** (corrects the mirror image) |
| Native resolution | 3840 × 2160 at 60 Hz; other input resolutions are rescaled by the screen (manufacturer specification) |
| Resolution used in lab experiments | 1920 × 1080 |
| Screen width | 700 mm (used in lab experiments) |
| Screen height | 395 mm (lab notes, to be confirmed) |
| Eye-to-screen distance | 1850 mm (used in lab experiments, to be confirmed) |

!!! warning "Visual angles"
    Compute visual angles from the values above only after they are confirmed. If your study depends on exact visual angles, measure the screen and the viewing distance yourself during your test session and report the values you used in your paper.

- **End of session**: switch the screen off. The last user of the day puts the cover on the screen in the magnet room (the cover lies on its base).

### Connecting a laptop

You may present stimuli from a laptop instead of the stimulus PC, **after approval of the MRI Safety Officer** (Ron Peeters). Steps used by lab members so far:

1. Connect the HDMI cable provided at the screen's control box to the laptop, and select input **HDMI-2** on the control box (press the input button).
2. Unplug the trigger box USB cable from the front of the stimulus PC tower and plug it into the laptop. The laptop then receives both the scanner trigger and the button presses as key presses.
3. At the end of the session, plug the USB cable back into the stimulus PC and switch the screen input back to the stimulus PC.

!!! tip "Display set-up"
    Use one mirrored screen: in Windows choose *Duplicate*, with the laptop screen and the in-room screen both at 1920 × 1080, 60 Hz. Do not use an extended desktop. Before scanning, check that the Psychtoolbox synchronisation tests or the PsychoPy frame-timing checks pass without warnings. If they do not, switch the laptop's own screen off and present on the in-room screen only.

---

## Audio system

There are two headphone options:

- **Siemens headphones** (large headset). You talk to the participant through the white Siemens intercom, which plays in the room and in this headset. To also play sound from the stimulus PC, plug in the small audio cable.
- **Dedicated research headphone system**: the blue box under the stimulus PC, with its own blue microphone. It uses **smaller ear shells that fit inside the 64-channel head coil** (the Siemens headset is too large for most participants in that coil). Use this system with the 64-channel coil.

To play sound (stimuli or music) through the dedicated system:

1. Start the sound on the stimulus PC.
2. Turn on the sound system (on/off button at the top left of the back, labelled *A*).
3. Press the round volume knob (*B*) and choose:
    - **fMRI-VOL** to set the volume for the participant;
    - **fMRI-MONVOL** to set the monitoring volume in the console room.
4. Switch the audio system off at the end of the session.

Participants always wear earplugs as well. Participants who refuse hearing protection cannot be scanned.

??? failure "The participant cannot hear the sound or you"
    1. Check that the audio system is switched on (button *A* at the back) and that **fMRI-VOL** is not set too low.
    2. With the Siemens headset, check that the small audio cable is plugged in, otherwise only the intercom is heard.
    3. For the intercom, press the button to talk and release it to listen, with the volume at maximum.
    4. If it still does not work, call the MR technician (40526).

---

## Scanner table and coils

- Cover the cushions with paper towels. Do not put cushions or equipment on the floor; put them on a shelf.
- The **64-channel coil** sits on the table about 10 cm from the edge, plugged in at the top of the table. The bottom part must be slotted into the table.
- The **panic button** ("communication button" when you explain it to participants) is plugged in at the bottom left of the table.
- After clinical use, the table may be set up differently: check the set-up before your participant arrives.

---

## Eye tracker

An EyeLink eye tracker (EyeLink 1000 long range) is planned to be installed at MR11, but is not available yet. If your study needs eye tracking, contact Ron Peeters to confirm whether and when it can be used.

---

<!--
__TODO__: [Andrea] Is there a console-room monitor that shows what the BOLDscreen shows (e.g., on the hub's Clone output), and is that image L/R flipped? Add it to "Connecting a laptop". (Asked Ron and Stefan by e-mail, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] Which display resolution should laptops and the stimulus PC send? The BOLDscreen panel is 3840 x 2160 at 60 Hz and rescales other inputs, while lab experiments use 1920 x 1080, which matters for visual angles. Can the BOLDscreen run at a lower native resolution, or should we move to 4K? Update "In-room screen". (Asked Ron and Stefan by e-mail, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] Which input does the dedicated headphone system (blue box) take from the computer? Add it to "Audio system" and "Connecting a laptop". (Asked Ron and Stefan by e-mail, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] When will the EyeLink be installed at MR11, and how does it connect (network or other port on the stimulus computer)? Update "Eye tracker". (Asked Ron and Stefan by e-mail, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] How is a new laptop approved by the MRI Safety Officer before first use, and is there anything else to consider when choosing it? Add it to "Connecting a laptop". (Asked Ron and Stefan by e-mail, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] How many trigger pulses arrive per volume now, and how many arrive before the run starts (while the script waits for the trigger)? Update the trigger warning; consider a short PsychoPy and Psychtoolbox snippet that waits for the first trigger and logs all triggers. (Asked Emma, Floor and Simen by e-mail, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] Confirm the BOLDscreen screen height (395 mm) and the eye-to-screen distance (1850 mm, from Simen's experiment settings; the original note said 185 mm), then remove the "to be confirmed" labels. (Not asked yet.)
__TODO__: [Andrea] Confirm the second button pad codes (d, n, w, e in Simen's experiment settings) in mode 002: which colour sends which key, and which pad is for the left hand. The radiology wiki only documents B/Y/G/R and T. (Not asked yet.)
__TODO__: [Andrea] Confirm with Ron that moving the trigger box USB cable from the stimulus PC to a laptop for each session is fine. (Not asked yet.)
__TODO__: [Andrea] Check whether MATLAB and Psychtoolbox are installed on the MR11 stimulus PC (the radiology wiki only lists PsychoPy) and add the versions. (Not asked yet.)
__TODO__: [Andrea] Check which other equipment is available at MR11: MR-compatible (yellow) headphones, extra button boxes. (Not asked yet.)
__TODO__: [Andrea] Find out what is kept in the MR11 storage room and where its key is (it was missing in September 2026), and add it to "The MR11 suite". (Not asked yet.)
__TODO__: [Andrea] Get a copy of Ron's booklet on the new MRI system (asked on 2 July 2026) and check this page against it. (Not asked yet.)
__TODO__: [Andrea] Ask the radiology team whether we may publish photos of the MR11 console room, trigger box and in-room screen on this wiki, then add them. (Not asked yet.)
__TODO__: [Andrea] Lab stimulus laptop (status 1 October 2026: purchase proposed, not approved or ordered; maintainer, storage and booking not decided). When it is bought and approved, add a section on how to book it, its software (planned: Windows 11, MATLAB + Psychtoolbox and PsychoPy Standalone), how to connect it (HDMI-2 on the BOLDscreen box, fORP USB in mode 002, Windows Duplicate) and how to check it (Psychtoolbox sync tests and PsychoPy frame checks without warnings), and update the note in "Stimulus PC".
-->
