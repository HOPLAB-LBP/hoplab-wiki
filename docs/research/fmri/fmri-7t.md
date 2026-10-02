# Flanders 7T (Brussels)

**Flanders 7T** (also called *FIN2U* or *Fin2U*) is an ultra-high-field research MRI centre near Brussels, shared by the Flemish universities and university hospitals (Antwerp, Brussels, Ghent, Hasselt and Leuven). The scanner is a **GE HealthCare 7T** MRI system, in research use since early 2026. KU Leuven's contact person is Prof. Stefan Sunaert.

This page explains how a 7T study differs from a study at MR11. Everything that is not specific to the 7T (ethics, safety course, participant handling, analysis) works as described in [First steps](fmri-get-started.md) and the [MR11 scanning procedure](fmri-procedure.md).

!!! tip "For detailed information, go to the radiology wiki"
    The 7T team documents the scanner in the *Flanders-7T* space of the radiology wiki: the logbook of every scan day, scan protocols, GE sequence settings and data export. Check it first for anything this page does not cover.

    [:octicons-link-external-16: Open the radiology wiki (Flanders 7T)](https://wiki.kulradiology.be/s/fin2u7t){ .md-button }

    You need an account: ask Rodrigo Trevisan Massera ([rodrigo.trevisanmassera@kuleuven.be](mailto:rodrigo.trevisanmassera@kuleuven.be)).

!!! warning "Work in progress"
    The 7T centre and its documentation are new. Several sections below are **provisional**: they say what we know now and whom to ask. If you learn something new, please update this page.

---

## Key differences from MR11

| | MR11 (3T, Leuven) | Flanders 7T (Brussels) |
|---|---|---|
| Who operates the scanner | You, after training | An **MRI technician** of the 7T centre |
| Vendor | Siemens | GE HealthCare |
| Booking | Online planning agenda | Through Stefan Sunaert (provisional, see below) |
| KU Leuven scan days | Any free slot | **Wednesdays** (so far) |
| Data | Automatic to RADXNAT | DICOM export at the scanner or via the research PACS |
| Stimulus set-up | Documented (see [MR11 equipment](fmri-equipment.md)) | Not documented yet |

---

## Where and who

- **Location**: Research Park Zellik, Z.1 Researchpark 160, Zellik (west of Brussels).
- **KU Leuven contact**: Prof. Stefan Sunaert ([stefan.sunaert@kuleuven.be](mailto:stefan.sunaert@kuleuven.be)), head of KU Leuven Radiology. Contact him for access, scan time, protocols and stimulus set-up.
- **Centre management**: Hubert Raeymaekers, consulting manager of Flanders 7T ([hubert.raeymaekers@uzbrussel.be](mailto:hubert.raeymaekers@uzbrussel.be)).
- **Scanner operation**: MRI technicians of UZ Brussel run the scanner during the sessions.
- **Documentation**: the radiology wiki has a separate *Flanders-7T* space ([wiki.kulradiology.be](https://wiki.kulradiology.be), same account as for MR11). It holds a logbook of all scan days, scan protocols, data export instructions and notes on GE sequences.

---

## Before you start

### Ethics and safety

- The lab's umbrella application S70813 does **not** cover 7T scanning. Your EC approval must explicitly cover scanning at **7T** and at the Brussels site: discuss this with Klara before you submit or amend your application.
- The 7T has stricter safety rules than 3T. An implant or object that is safe at 3T is not necessarily safe at 7T. Ask the 7T team which screening form to use for your participants.
- Ask Stefan Sunaert which safety course and access steps you need to attend 7T sessions.
- **Glasses**: participants cannot wear their own glasses in the scanner. Ask the 7T team whether MRI-compatible glasses are available, or ask participants to wear contact lenses.

!!! note "Tell participants what they may feel at 7T"
    At 7T, participants more often notice short-lived effects of the strong magnetic field: **dizziness or vertigo** (mostly while the table moves in or out, or when they move their head), a **metallic taste**, **light flashes**, and sometimes nausea. These effects are harmless and stop when the participant leaves the field. Mention them in the information letter and consent form, and explain them before the session.

    To reduce them:

    - ask the technician to move the table slowly into and out of the bore;
    - ask the participant to keep their head still and their eyes closed while the table moves;
    - pad the head well, and keep head movements to a minimum during the session;
    - after the session, let the participant sit up slowly and rest for a few minutes before standing up and walking or driving.

### Booking (provisional)

There is no public online booking agenda for the 7T. So far, KU Leuven sessions take place on **Wednesdays**. To get scan time, contact **Stefan Sunaert** with your study, the number of participants and the session duration you need.

### Protocol

Protocols are set up with the 7T team. They are named with a fixed scheme, for example `cbps_ASLVolunteer_260217`:

- 1st letter = status: `c` current, `l` library, `w` work in progress, `z` archived, `t` template;
- 2nd letter = institute: `a` Antwerp, `b` Brussels, `g` Ghent, `h` Hasselt, `l` Leuven;
- next 2 letters = initials of the **PI** (not of the PhD student);
- then the study name and the date (`yymmdd`).

What the 7T team learned so far about **fMRI** (from the 7T logbook, February to July 2026):

- Gradient-echo EPI has been run at 1.1 mm isotropic (TR = 2.5 s), and at 0.8 × 0.8 × 1.2 mm.
- A **high-order shim** (HOS) is run before the functional runs.
- A short scan with **reversed phase encoding** (*pepolar*) and/or a **B0 map** is acquired for distortion correction (e.g., in fMRIPrep). 3D geometry correction should be on in the fMRI sequence.
- **Dummy volumes are not discarded automatically**: in a July 2026 retinotopy test the first 4 volumes had to be removed by hand. Check this for your own sequence.

---

## Stimulus presentation (provisional)

The stimulus set-up at the 7T (screen, trigger, response buttons, audio) is **not documented yet**. What we know:

- In May 2026, the 7T team tested the scanner trigger through a Cambridge Research Systems (CRS) device; it was not always reliable, and tasks may have started 2 to 4 volumes later than planned.
- It is not yet known whether you present stimuli on a 7T centre computer or on your own laptop, which keys the trigger and buttons send, and what screen size and viewing distance to use.

Ask **Stefan Sunaert** for the current set-up well before your first session, and plan a test session to check timing, trigger and buttons with your own script. As at MR11, write your script to start on the first trigger and log every trigger with its timestamp.

!!! note "Lab stimulus laptop"
    The lab plans to buy its own stimulus-presentation laptop, which could also be used at the 7T. It is not available yet, and it is not yet known whether the 7T centre accepts external laptops.

---

## On the scan day (provisional)

The MRI technician runs the scanner. You are responsible for your participant and your experiment:

1. Send the participant clear directions to the centre in advance. Participants travel to the centre themselves: the participant compensation already covers their transport.
2. Bring the signed consent form and the participant's completed 7T safety screening form.
3. Explain the task and let the participant practise before they go in.
4. Set up and test your stimulus presentation, trigger and buttons before the participant goes in.
5. During the scan, run your experiment and keep a written log of each run (start times, problems, repeated runs).
6. After the session, check with the technician that all series were saved, and agree how you will receive the data.

Each scan day is also recorded in the logbook of the Flanders-7T space on the radiology wiki (subject code, scans, remarks).

---

## Getting your data

- GE stores the DICOMs of a session in a folder per exam (e.g., `e739/`) with one subfolder per series. A series is stored as many separate `.dcm` files: one fMRI run can be more than 10,000 files. GE does not export enhanced (4D) DICOM.
- The data are exported at the scanner console as a compressed archive (`.tgz`) to a USB drive, or provided from the research PACS, which sorts the same data into readable folders. Ask the technician or Stefan Sunaert which route applies to your study.
- For BIDS conversion, the 7T team has a preliminary **BIDScoin** map for the GE 7T data (`bidsmap_fin2u.yaml`). Ask Stefan Sunaert or Andrea for the current version.
- Then follow the lab's [RDM workflow](../rdm/SOPs.md) and the [analysis workflow](analysis/index.md).

<!--
__TODO__: [Andrea] 7T stimulus set-up: display (size, resolution, viewing distance), trigger box and trigger key, response buttons and key codes, audio system, and whether we can bring our own laptop. Fill in "Stimulus presentation" and remove "provisional". (Asked Ron and Stefan by e-mail, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] Ask whether the trigger issue with the CRS device (7T logbook, 2026-05-20: tasks started 2 to 4 volumes late) is solved. (Not asked yet.)
__TODO__: [Andrea] How 7T scan time is booked (calendar, request form, fixed KU Leuven Wednesdays?) and how it is invoiced. Replace the provisional booking section. (Not asked yet.)
__TODO__: [Andrea] Which safety course, screening forms and access steps KU Leuven researchers need for the 7T. (Not asked yet.)
__TODO__: [Andrea] Whether MRI-compatible glasses are available at the 7T. Update "Ethics and safety". (Not asked yet.)
__TODO__: [Andrea] Confirm the address of the 7T centre and add directions (parking, entrance) for participants. (Not asked yet.)
__TODO__: [Andrea] How 7T data reach KU Leuven researchers (USB export by the technician, research PACS, XNAT?), and where the current BIDScoin bidsmap is. Update "Getting your data" and store the bidsmap in the lab's Teams folder or a lab repository. (Not asked yet.)
__TODO__: [Andrea] Add the lab's 7T fMRI protocol (sequence, resolution, TR, dummies, distortion-correction scans) once the first lab study is set up.
-->
