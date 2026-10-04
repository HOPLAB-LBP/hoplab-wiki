<!-- Shared text for the visual angle sections (fMRI equipment and EEG task pages).
Each page pulls a section with --8<-- "includes/visual-angles.md:<name>" and keeps
its own set-up step (viewing distance) and numbers. -->

<!-- --8<-- [start:check-screen] -->
1. **Screen size.** Show a full-screen image with a thin border from your script. Measure the width and height of the image on the screen.
<!-- --8<-- [end:check-screen] -->

<!-- --8<-- [start:check-script] -->
3. **Resolution.** Log the resolution your script actually gets, not only the one it asks for (Psychtoolbox and PsychoPy both report the size of the window in pixels).
4. **Convert sizes.** A stimulus of θ degrees, centred on the screen, is 2 × viewing distance × tan(θ ÷ 2) wide on the screen; divide by the pixel size (screen width ÷ horizontal resolution) to get pixels. Use this exact formula, or the calculator below, for every size. Multiplying by a fixed number of pixels per degree is only close for small stimuli near the centre of the screen. Scale the whole stimulus with one size and never stretch it: for a non-square image, convert one side and derive the other from the image's aspect ratio in pixels.
5. **Cross-check on the screen.** Show a test stimulus that your script sizes at a known visual angle (for example a 10° square). Measure it on the screen and compute its angle as 2 × arctan(size ÷ (2 × viewing distance)). It should match the intended angle. If it does not, go back over steps 1 to 4.
6. **Write it down.** Note the measured width, height, distance and resolution, with the date, in your lab notes and in the methods of your paper.
<!-- --8<-- [end:check-script] -->

<!-- --8<-- [start:calculator] -->
Use the calculator to convert between degrees, millimetres and pixels. It is filled in with the values above; change any field for your own set-up.
<!-- --8<-- [end:calculator] -->

<!-- --8<-- [start:psychopy] -->
If you use PsychoPy, enter the measured width, distance and resolution in its monitor settings. Its `deg` units give every degree the same number of pixels, the approximation of step 4, so stimuli of more than a few degrees come out slightly smaller, and positions slightly closer to the centre, than the exact formula gives. The gap grows with size and with distance from the centre.
<!-- --8<-- [end:psychopy] -->
