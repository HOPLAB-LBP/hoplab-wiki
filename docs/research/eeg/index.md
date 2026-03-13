# EEG (Electroencephalography)

We have access to two EEG devices that fall under the NeuroSPACE consortium:

1. The first one is a mobile EEG system, currently used mostly by the [Neuropsychology Lab](https://www.neuropsychologylab.be/) (PI: [Céline Gillebert](https://www.kuleuven.be/wieiswie/en/person/00049589)).

2. The second EEG apparatus is a high-resolution EEG system by BioSemi, used primarily by the [Hoplab](https://www.hoplab.be/) and the [Desenderlab](https://desenderlab.com/), and it is located in room PSI 00.52. The most frequently used system in Hoplab is a 128-channel system, but Desenderlab also uses a 64-channel system. The EEG lab can be booked through the Calira system (see [the page on administrative procedures](../../get-started/admin-procedures.md#reserve-equipment-or-a-room-for-testing)), where you can find it as "BioSemi EEG Lab 00.52".

Information in this section is mostly relevant for the high-resolution EEG systems, but some information may also be applicable to the mobile EEG system.

If you are just starting out, it might be worthwhile to check out the NeuroSPACE presentation on **"How to get started with an EEG study"**. You can find the slides and all related files in [this Teams folder](https://kuleuven.sharepoint.com/:f:/r/sites/T0005824/Shared%20Documents/General/NeuroSPACE%20meetings/2025-11-10?csf=1&web=1&e=keKzTe) (*access required*).

In Hoplab, we typically set up experiments for multivariate EEG ("Representational Dynamics"). Our standard analysis pipeline is described most in detail in *[Leys et al.](https://jov.arvojournals.org/article.aspx?articleid=2811037)* (2025, JoV) and *[Chen et al.](https://direct.mit.edu/imag/article/doi/10.1162/imag_a_00006/116700/The-representational-dynamics-of-the-animal)* (2023, Imaging Neuroscience). The latter is accompanied by an [OSF archive](https://osf.io/d5egu/) that contains the analysis code to do multivariate analysis with Matlab and the [CosmoMVPA](https://www.cosmomvpa.org/) toolbox.

<div class="grid cards" markdown>

- :octicons-gear-24:{ .lg .middle } __Lab setup__

    ---

    Hardware configuration, PsychoPy settings, EOG placement, and troubleshooting for the EEG lab.

    [:octicons-arrow-right-24: Lab setup](eeg-lab-setup.md)

- :octicons-rocket-24:{ .lg .middle } __Data acquisition__

    ---

    Step-by-step guide for setting up the EEG cap, electrodes, and recording software.

    [:octicons-arrow-right-24: Get started](eeg-acquisition.md)

- :simple-github:{ .lg .middle } __Creating EEG tasks__

    ---

    How to make your behavioural task EEG-compatible: sending triggers, using a photocell, and timing best practices.

    [:octicons-arrow-right-24: Start scripting](eeg-task.md)

- :octicons-tools-24:{ .lg .middle } __Data analysis__

    ---

    Preprocessing, quality control, and multivariate analysis workflows for EEG data.

    [:octicons-arrow-right-24: Start analyzing](analysis/index.md)

</div>

<!--
=== EEG Section TODOs ===

__TODO__: [Task page] Create and link a PsychoPy EEG task template implementing triggers,
photocell, and timing best practices.
-->
