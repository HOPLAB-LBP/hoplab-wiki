# EEG Analysis Overview

This section provides a step-by-step guide for analysing EEG data collected with our BioSemi system. The workflow covers everything from environment setup to statistical testing, using **Python and MNE-Python** as the primary tooling.

If you are new to EEG analysis, we recommend following the steps in order. Each page builds on the previous one.

!!! tip "MATLAB users"
    Our lab is transitioning to Python/MNE as the primary analysis platform. If you prefer MATLAB, a companion page covers the [EEGLAB and CoSMoMVPA workflow](eeg-matlab.md). However, the conceptual explanations and rationale are covered in the Python pages below.

---

## Analysis steps overview

<div class="grid cards" markdown="1">

- :material-rocket: **[Set up your environment](eeg-setup-env.md)**
  Install MNE-Python and the recommended packages for EEG analysis.

- :material-check-all: **[Quality control](eeg-quality-control.md)**
  Verify trigger codes, stimulus timing, and electrode quality before preprocessing.

- :material-chart-timeline-variant: **[Preprocessing](eeg-preprocessing.md)**
  Filter, re-reference, remove artifacts with ICA, epoch, and baseline-correct your data.

- :material-brain: **[Multivariate analysis](eeg-multivariate.md)**
  Time-resolved decoding, representational similarity analysis, and the Representational Dynamics approach.

- :material-chart-bar: **[Statistical testing](eeg-statistics.md)**
  Cluster-based permutation tests and multiple comparison correction.

- :material-code-tags: **[EEG analysis in MATLAB](eeg-matlab.md)**
  Companion guide for EEGLAB and CoSMoMVPA users.

- :material-format-list-checks: **[Complete workflow example](eeg-workflow.md)**
  An end-to-end example tying all the steps together.

</div>

---

### Additional resources

- **[MNE-Python documentation](https://mne.tools/stable/)**
  Comprehensive reference and tutorials for EEG/MEG analysis in Python.

- **[MNE-BIDS](https://mne.tools/mne-bids/stable/index.html)**
  Tools for converting EEG data to the BIDS standard.

- **[EEGLAB documentation](https://eeglab.org/)**
  Reference for the MATLAB-based EEG analysis toolbox.

- **[CoSMoMVPA documentation](https://www.cosmomvpa.org/documentation.html)**
  Multivariate pattern analysis toolbox for MATLAB (used in the MATLAB companion page).
