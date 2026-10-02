# Lab and equipment

The TMS lab is room 00.57 on the ground floor of the PSI building (Tiensestraat 102, 3000 Leuven). You book it in Calira as **PSI 00.57 TMS Room** (see [First steps](tms-get-started.md#before-your-first-session)).

The stimulator and coil deliver the pulses. Brainsight neuronavigation shows where the coil sits on the participant's brain, and EMG records the muscle response used to set the intensity. Read the rules below before you touch anything.

## Handling the equipment

<div class="do-list" markdown>
<p class="do-list__heading">Do</p>

- Turn off the TMS machine and unplug it before changing cables or doing any maintenance/adjustments. Any changes should be confirmed via Matilda so that she is aware of these changes
- Always turn off the TMS machines before unplugging them from the wall
- At the end of the day, unplug the TMS machines.
- Ensure all neuronavigation equipment (including the I/O box) is turned off at the end of the day

</div>

<div class="dont-list" markdown>
<p class="do-list__heading">Don't</p>

- Never get the TMS coil wet.
- Do NOT touch the reflective balls on the coil or head tracker with bare fingers
- Be careful to not compress any cables

</div>

## Stimulator and coil

The stimulator is from the DuoMAG range made by Deymed. In that range, the MP models give monophasic single pulses, and two MP units linked as an MP-Dual give paired pulses through one coil, with 1 to 1000 ms between the pulses ([DuoMAG MP-Dual](https://deymed.com/duomag-mp-dual)). The XT models are biphasic and can also give repetitive TMS, which the lab does not use.

Coil: DUOMag 70BF Coil Figure of eight butterfly coil with 2 x 70mm windings. Suitable for focused, cortical stimulation. Available with reversed windings for simulating PA/AP comparison studies. Anderson connector for compatibility across the DuoMAG range

The 70BF has no active cooling ([DuoMAG safety and performance information](https://deymed.com/files/DM061-SPI-01EN%20DuoMAG%20Safety%20and%20performance%20information%202024-12-02%20EN.pdf)). It warms up during long blocks, and the stimulator raises an alarm when the inside of the coil passes 45 °C. When that happens, stop and let the coil cool in the air. The manufacturer forbids cooling it in a fridge, and forbids stimulating when the coil or its connector is not dry.

## Neuronavigation (Brainsight)

[Brainsight TMS](https://www.rogue-research.com/tms/brainsight-tms/) (Rogue Research) tracks the head and the coil with an infrared camera and shows, on the participant's MRI, where the coil points. You use it to aim at a target and to find the same spot again in a later session. The [Brainsight NIBS 2.5.12 user manual](https://www.rogue-research.com/wp-content/uploads/Brainsight-NIBS-2.5.12.pdf) is the full reference; page numbers below refer to it.

???+ deflist "Infrared camera (Polaris position sensor)"
    Tracks the reflective spheres on the trackers and the pointer. It needs a clear line of sight to every tool, and it is disturbed by infrared sources and reflections: direct sunlight, halogen lamps, mirrors and glass facing it. Only one tool of each type may be in view (pp. 11, 24, 49). After it is switched on, it needs 1 to 5 minutes to warm up before it tracks (p. xxix).

???+ deflist "Subject tracker (neuronavigation glasses)"
    The participant wears it on the head, so the camera can follow head movements. It is the reference for everything Brainsight shows.

???+ deflist "Coil tracker"
    Fixed on the coil. Each tracker has its own pattern of spheres, so the camera can tell the coil and the head apart (pp. 51 to 53).

???+ deflist "Pointer"
    A tracked stylus. You touch the landmarks on the participant's face with it to register the head to the MRI, and you run it over the scalp to check the registration (pp. 118 to 120).

???+ deflist "Reflective spheres"
    Sit on posts on every tracker and on the pointer. Do NOT touch the reflective balls on the coil or head tracker with bare fingers. If they get dirty, wipe them gently with an alcohol wipe, so as little of the coating comes off as possible, and let them dry before use (p. 113).

???+ deflist "I/O box"
    Receives the trigger (TTL) the stimulator sends with every pulse, and the analogue EMG signal. Brainsight uses the trigger to record the coil position and the EMG at the moment of each pulse. Brainsight does not fire the stimulator: triggers go from the stimulator to Brainsight only (pp. 21, 115, 117).

## EMG

Surface electrodes over a small hand muscle record the motor evoked potential (MEP) after a pulse over the motor cortex. If you record EMG through Brainsight, it is only acquired when a TTL trigger from the stimulator arrives, because the trigger synchronises the EMG with the pulse (p. 126). Brainsight then shows the MEP peak-to-peak amplitude and latency for every pulse.

## Start-up and shut-down

=== "Start-up"

    1. Check that the coil and its connector are dry, and that the coil cable is intact.
    2. Switch on the neuronavigation: the main switch of the isolation transformer (the I/O box light turns green), then the Polaris camera, then the computer (Brainsight manual, pp. 23 to 24, for current systems). Give the camera 1 to 5 minutes to warm up.
    3. Switch on the stimulator.
    4. Open your Brainsight project and calibrate the coil (see [Session procedure](tms-procedure.md#before-the-session)).

=== "Shut-down"

    1. Save the Brainsight project, quit Brainsight and shut down the computer.
    2. Always turn off the TMS machines before unplugging them from the wall.
    3. At the end of the day, unplug the TMS machines.
    4. Ensure all neuronavigation equipment (including the I/O box) is turned off at the end of the day.

## Troubleshooting

??? failure "Brainsight does not track the head, coil or pointer"
    - Just after start-up, the camera reports "Temperature Low" and does not track for 1 to 5 minutes. Wait.
    - Check the line of sight: nothing between the camera and the tools, no sunlight or halogen light into the camera, no mirror or glass facing it.
    - Only one tool of each type may be in view: put spare trackers away.
    - Clean dirty spheres as described above.

??? failure "The registration error is high"
    After registration, run the pointer over the scalp and read the error. Consistently below 3 mm is excellent; below 5 mm is often acceptable, particularly if it is below 3 mm near your target (p. 121). If it is higher, touch the landmarks again, gently and without pushing into the skin, or add refinement points.

??? failure "No MEPs appear in Brainsight"
    EMG is only recorded when a TTL trigger arrives (p. 126). Check the BNC cable from the stimulator's trigger output to *Trig In* on the I/O box, and that the trigger channel is enabled in the session's I/O settings. Also check that the right EMG amplifier model is selected in the Brainsight preferences; with the wrong one, amplitudes are wrong (pp. 44, 117).

??? failure "The coil temperature alarm goes off"
    Stop stimulating and let the coil cool in the air. Never cool it in a fridge, with ice or with liquids.

<!--
__TODO__: [Matilda] Which DuoMAG stimulator do we have? Paired pulses through one coil suggest an MP-Dual (two linked MP units, two mains cords), but that is a guess. The "exact TMS system" link in Key Resources points to the Brainsight manual. (Not asked yet.)
__TODO__: [Matilda] Your coil text says "reversed windings" and "Anderson connector"; neither appears in the Deymed documents (they list a separate 70BF-LQC-R and placebo 70BFP coils). Please check against the coil. (Not asked yet.)
__TODO__: [Matilda] EMG amplifier and software (Brainsight EMG pod or a separate system?), electrode placement. (Not asked yet.)
__TODO__: [Matilda] Start-up order: the steps above follow the Brainsight manual; is that how you do it, and where does the stimulator go in the order? Brainsight generation (Gen-1 or Gen-2)? (Not asked yet.)
__TODO__: [Matilda] The Brainsight manual (p. 24) says the I/O box and camera can stay on indefinitely; your protocol says to switch them off at the end of the day. The page keeps your rule. OK? (Not asked yet.)
__TODO__: [Matilda] The PSI floor plan boxes rooms 00.57 and 00.62: what is 00.62 used for? OK to publish the floor plan here? (Not asked yet.)
__TODO__: [Matilda] Picture of the TMS room (overview, with the participant chair and where the camera stands). (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the DuoMAG stimulator (front panel). (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the 70BF coil (top and side, with the current-direction arrow visible). (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the Polaris infrared camera. (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the subject tracker (neuronavigation glasses), on and off a head. (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the coil tracker mounted on the coil. (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the pointer. (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the reflective spheres (close-up). (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the coil calibration block. (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the I/O box (front and back, with the trigger cable from the stimulator). (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the EMG electrodes on the hand and the amplifier. (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the Brainsight screen during a session (targeting and bull's-eye view). (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
__TODO__: [Matilda] Picture of the whole set-up with a person seated, coil on the head. (Pictures asked by Andrea by e-mail, 2026-10-02; none in the shared folder yet.)
-->
