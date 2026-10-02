# Session procedure

How a TMS session runs in the lab, from preparing the neuronavigation to shutting down. The Brainsight steps follow the [Brainsight NIBS 2.5.12 user manual](https://www.rogue-research.com/wp-content/uploads/Brainsight-NIBS-2.5.12.pdf) (page numbers below refer to it).

!!! warning "Run your first sessions with Matilda"
    The lab's own choices (motor threshold method, intensities, typical session length) are still being added to this page. Until then, run your first sessions together with Matilda.

<div class="steps-list" markdown>

1. [Before the session](#before-the-session): book the room, build the Brainsight project, calibrate the coil.
2. [Arrival and screening](#arrival-and-screening): consent, safety screening, earplugs.
3. [Neuronavigation](#neuronavigation): register the participant's head to the MRI.
4. [EMG and motor threshold](#emg-and-motor-threshold): find the hotspot and the threshold.
5. [Running the experiment](#running-the-experiment): stimulate, keep the coil on target, watch the participant.
6. [After the session](#after-the-session): save and export, debrief, clean, shut down.

</div>

## Before the session

- [ ] Book **PSI 00.57 TMS Room** in Calira (see [First steps](tms-get-started.md#before-your-first-session)).
- [ ] Build the Brainsight project: load the participant's anatomical MRI (DICOM, NIfTI and other formats; all DICOM files in one folder), reconstruct the skin and the brain surface, mark the landmarks and define your targets (pp. 46, 62, 83 to 103).
- [ ] Calibrate the coil tracker in *Window > Tool Calibrations*: place the coil's centre on the calibration block and wait for the countdown. Any error here becomes a systematic error in every session, so take your time (pp. 54 to 57).
- [ ] Have the screening form, the consent form and earplugs ready.

!!! tip "No MRI of the participant?"
    Use the MNI head template that comes with Brainsight. Expect about 10 mm accuracy instead of about 3 mm with the participant's own MRI. That is fine when the target comes from a functional response (for example the motor hotspot) rather than from the anatomy (p. 65).

## Arrival and screening

<div class="do-list" markdown>
<p class="do-list__heading">Always</p>

- Always complete the safety screening before doing any form of brain stimulation (on anyone, not just participants).
- Always verbally confirm the safety screening criteria with the participant
- If unsure of anything (especially medications) contact Matilda: [matilda.gordon@kuleuven.be](mailto:matilda.gordon@kuleuven.be)

</div>

!!! danger "You cannot conduct TMS on someone"
    --8<-- "includes/tms-exclusions.md"

Consent must be taken by someone listed on the study's ethics protocol ([Rossi et al., 2021](https://doi.org/10.1016/j.clinph.2020.10.003), section 9.3).

!!! warning "Hearing protection"
    Give the participant well-fitted earplugs, and wear them yourself. Each pulse makes a loud click close to the ear. The safety guidelines recommend hearing protection for participants and make it mandatory for operators ([Rossi et al., 2021](https://doi.org/10.1016/j.clinph.2020.10.003), pp. 285 and 294). Anyone who reports hearing loss, ringing in the ears or a feeling of fullness afterwards should be referred for a hearing check.

## Neuronavigation

<div class="steps-list" markdown>

1. Put the subject tracker (the neuronavigation glasses) on the participant, and check in Brainsight that the camera sees the subject tracker, the coil tracker and the pointer.
2. Register the head: touch each landmark gently with the pointer and record it. The manual recommends the bridge of the nose, the tip of the nose and the notch above the tragus of each ear; not the tragus itself, which earplugs can push out of place (pp. 93 to 96, 118 to 120).
3. Check the registration by running the pointer over the scalp. An error consistently below 3 mm is excellent; below 5 mm is often acceptable, particularly if it is below 3 mm near your target (p. 121). If it is higher, redo the landmarks.
4. In the targeting view, bring the coil close to the target in 3D, check its angle, then aim with the bull's-eye view (pp. 125 to 130).

</div>

## EMG and motor threshold

Place surface EMG electrodes over a small hand muscle on the side opposite the motor cortex you stimulate. A suprathreshold pulse over the motor cortex gives a motor evoked potential (MEP) in that muscle about 20 ms later ([Edwards et al., 2024](https://link.springer.com/book/10.1007/978-3-031-62304-2), chapter 3).

<div class="steps-list" markdown>

1. **Find the hotspot.** Move the coil over the hand area of the motor cortex to find the optimal site for evoking MEPs, the hotspot. In Brainsight, you can turn that position into a target, so you can return to it (p. 103).
2. **Measure the motor threshold.** The motor threshold is the lowest stimulator intensity that can evoke an MEP with a given coil and stimulator ([Edwards et al., 2024](https://link.springer.com/book/10.1007/978-3-031-62304-2), chapter 3). It is measured with the muscle at rest (resting motor threshold) or slightly contracted (active motor threshold).

</div>

!!! info "Reading the MEP in Brainsight"
    Brainsight shows the MEP for every pulse. Set the MEP window with the two green lines, and it calculates the peak-to-peak amplitude and latency (p. 128). EMG is only recorded when the stimulator's trigger reaches the I/O box (p. 126).

## Running the experiment

<div class="do-list" markdown>
<p class="do-list__heading">During stimulation</p>

- Keep the coil on target with the bull's-eye view. Brainsight records the coil position at every pulse, from the stimulator's trigger (p. 117).
- Watch the participant throughout. TMS should not hurt: if the participant reports intense, sharp or acute pain during stimulation, stop the session. For fainting, headache or a possible seizure, follow the [safety and emergency procedures](tms-safety.md#if-something-goes-wrong).
- Keep an eye on the coil temperature during long blocks (see [Lab and equipment](tms-equipment.md#stimulator-and-coil)).

</div>

## After the session

<div class="steps-list" markdown>

1. Save the project (*File > Save Project*) and export what you need from *Sessions > Review*. Samples are exported as tab-delimited text with the coil position, targeting errors and, with EMG, the MEP amplitude, latency and raw trace (pp. 187 to 192). Store the data following the lab's [RDM guidelines](../rdm/index.md).
2. Debrief the participant. A mild headache towards the end of the session or a few hours later is normal and usually passes with a common painkiller such as paracetamol (see [Headache](tms-safety.md#headache)).
3. Clean the reflective spheres if needed with an alcohol wipe and let them dry (p. 113).

</div>

!!! note "If you are the last user of the day"
    Follow the [shut-down steps](tms-equipment.md#start-up-and-shut-down): turn off the TMS machines before unplugging them, unplug them, and turn off all neuronavigation equipment, including the I/O box.

<!--
__TODO__: [Matilda] Lab-specific steps: motor threshold method and criterion, intensity rules, which muscle and electrode montage, coil orientation, typical session length. (Not asked yet.)
__TODO__: [Matilda] Earplugs: your protocol does not mention hearing protection; this page adds it from Rossi et al. (2021). Do we have earplugs in the lab? (Not asked yet.)
__TODO__: [Matilda] Which data are saved (Brainsight, EMG, task) and where? (Not asked yet.)
__TODO__: [Matilda] Is there a coil cleaning routine between participants (Deymed allows alcohol, no chlorine products)? (Not asked yet.)
-->
