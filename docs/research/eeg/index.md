# EEG (Electroencephalography)

We have access to two EEG devices that fall under the NeuroSPACE consortium.

- The first one is a mobile EEG system, currently used mostly by the [Neuropsychology Lab](https://www.neuropsychologylab.be/) (PI: [Céline Gillebert](https://www.kuleuven.be/wieiswie/en/person/00049589)).

- The second EEG apparatus is a high-resolution EEG system, used primarily by the [Hoplab](https://www.hoplab.be/) and the [Desenderlab](https://desenderlab.com/). This is a 128-channel system of BioSemi. The 128-channel EEG is located in room PSI 00.52. It can be booked through the Calira system (see general Research pages), where you can find it as "BioSemi EEG Lab 00.52".

In Hoplab we typically set up experiments for multivariate EEG ("Representational Dynamics"). Our standard analysis pipeline is described most in detail in [Leys et al.](https://jov.arvojournals.org/article.aspx?articleid=2811037) (2025, JoV) and [Chen et al.](https://direct.mit.edu/imag/article/doi/10.1162/imag_a_00006/116700/The-representational-dynamics-of-the-animal) (2023, Imaging Neuroscience). The latter is accompanied by an [OSF archive](https://osf.io/d5egu/) that contains the analysis code to do multivariate analysis with the help of Matlab and the [CosmoMVPA](https://www.cosmomvpa.org/) toolbox.


<div class="grid cards" markdown>

- :octicons-rocket-24:{ .lg .middle } __Data acquisition__

    ---

    A comprehensive manal of all the practical aspects of collecting EEG data.

    [:octicons-arrow-right-24: Get started](eeg-acquisition.md)

- :octicons-checklist-24:{ .lg .middle } __Task scripting__

    ---

    Instructions on how to adapt your behavioural task to make it EEG-ready.

    [:octicons-arrow-right-24: Start scripting](eeg-task.md)

- :octicons-tools-24:{ .lg .middle } __Data Analysis__

    ---

    The step-by-step workflow we use to pre-process and analyze EEG data.

    [:octicons-arrow-right-24: Start analyzing](analysis/index.md)

- :simple-github:{ .lg .middle } __something else__

    ---

    Placeholder for another subpage: eye tracking? basic eeg lab setup?

    [:octicons-arrow-right-24: See the repo]([https://github.com/HOPLAB-LBP/fMRI-task-template](https://hoplab-lbp.github.io/hoplab-wiki/research/eeg/index.html))

</div>

<!--
__TODO__: Refer to Calira info elsewhere

__TODO__: Create subpages

__TODO__: Add information on the analysis (OSF page of Chen et al has no readme!)

__TODO__: Also describe details of pre-processing (no pre-processing script on OSF)

__TODO__: Add EEG default lab setup info (e.g. photocell setup, correct PsychoPy settings, response box configuration, screen resolution, EOG, timing delays, config file, triggers, eyetracking) along with common errors (e.g., triggers, USB connection error)

__TODO__: Add PsychoPy script template

__TODO__: Add Eyetracking info
-->
