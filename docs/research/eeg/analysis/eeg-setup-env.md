# Setting up your EEG analysis environment

This page covers the EEG-specific tools and folder structure you need for our analysis workflow. It assumes you already have a working Python/Conda setup.

!!! tip "General coding setup"
    For general guidance on installing Conda, setting up environments, configuring Spyder, and using Git, see [Environment & editor setup](../../../research/coding/environment-setup.md). This page only covers what is specific to EEG analysis.

!!! info "MATLAB users"
    If you plan to use MATLAB with EEGLAB and CoSMoMVPA, see the [EEG analysis in MATLAB](eeg-matlab.md) page for setup instructions. The Python workflow described here is the lab's primary recommended approach.

---

## Suggested system specifications

!!! info "Suggested System Specifications"
    - **Operating System:** Windows 10/11, macOS 10.14+, or Linux (Ubuntu 20.04+)
    - **RAM:** 16 GB (32 GB+ recommended for high-density recordings)
    - **Storage:** 50 GB+ free space (SSD preferred; raw BioSemi files can be large)
    - **CPU:** Multi-core processor (4+ cores recommended for ICA)

---

## Create your Conda environment

Create a dedicated environment for your EEG project. Do not install packages into your base environment.

```bash
conda create -n eeg_env python=3.11
conda activate eeg_env
```

### Install core packages

Install the main packages for EEG analysis:

```bash
pip install mne mne-bids autoreject
pip install scikit-learn rsatoolbox
pip install matplotlib pandas numpy scipy
pip install eyelinkio          # for reading EyeLink .edf files (if using eye-tracking)
pip install sr-research-pylink # for controlling EyeLink during experiments (if using eye-tracking)
pip install jupyter            # optional, for notebook-based workflows
```

| Package | Purpose |
|---------|---------|
| [**mne**](https://mne.tools/stable/) | Core EEG analysis: loading data, filtering, ICA, epoching, statistics |
| [**mne-bids**](https://mne.tools/mne-bids/) | Convert and organise EEG data in BIDS format |
| [**autoreject**](https://autoreject.github.io/stable/) | Automated epoch rejection and channel interpolation |
| [**scikit-learn**](https://scikit-learn.org/) | Machine learning for decoding analyses |
| [**rsatoolbox**](https://rsatoolbox.readthedocs.io/) | Representational similarity analysis |
| **matplotlib, pandas, numpy, scipy** | General scientific computing and plotting |
| [**eyelinkio**](https://github.com/scott-huberty/eyelinkio) | Read EyeLink .edf files into Python (for eye-tracking setups) |
| [**sr-research-pylink**](https://pypi.org/project/sr-research-pylink/) | Control EyeLink eye-tracker during experiments |

!!! info "Eye-tracking packages"
    The `eyelinkio` and `sr-research-pylink` packages are only needed if you are running concurrent EEG + eye-tracking experiments. `sr-research-pylink` also requires the [EyeLink Developers Kit](https://www.sr-research.com/support-options/learning-resources/) to be installed on the Display PC. See the [EEG and eye-tracking](eeg-eyetracking.md) page for the full setup.

!!! warning "Environment isolation"
    It is **crucial** to create a new Conda environment for each project. Installing packages into the base environment leads to dependency conflicts that can be very difficult to resolve. See the [general environment guide](../../../research/coding/environment-setup.md#setting-up-a-conda-environment) for details.

### Verify your installation

After installing, verify that MNE is correctly set up:

```python
import mne
print(mne.__version__)
mne.sys_info()
```

This prints your MNE version and system information, which is useful for troubleshooting and reproducibility.

---

## EEG project folder structure

Our lab uses a BIDS-inspired folder structure for EEG projects. [BIDS](https://bids-specification.readthedocs.io/en/stable/) (Brain Imaging Data Structure) is a community standard for organising neuroimaging data, and its [EEG extension](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html) specifies how to structure EEG datasets.

```bash
Project_Name/
├── sourcedata/                # Raw, unmodified data
│   └── sub-xx/
│       ├── eeg/               # Raw .bdf files from BioSemi
│       └── bh/                # Behavioural log files
├── BIDS/                      # BIDS-formatted dataset
│   ├── sub-xx/
│   │   └── eeg/               # Converted EEG files (.set, .fdt or .edf)
│   ├── participants.tsv       # Participant demographics
│   ├── dataset_description.json
│   └── derivatives/
│       ├── preprocessing/     # Preprocessed data (filtered, ICA-cleaned, epoched)
│       ├── decoding/          # Decoding results
│       └── rsa/               # RSA results
├── code/
│   ├── preprocessing/         # Preprocessing scripts
│   ├── analysis/              # Analysis scripts
│   └── utils/                 # Shared utility functions
├── results/                   # Figures, tables, statistical outputs
└── environment.yml            # Conda environment specification
```

!!! tip "Create the folder structure"
    ```bash
    mkdir -p Project_Name/{sourcedata/sub-xx/{eeg,bh},BIDS/{sub-xx/eeg,derivatives/{preprocessing,decoding,rsa}},code/{preprocessing,analysis,utils},results}
    ```

!!! tip "Export your environment"
    Always export your Conda environment for reproducibility:
    ```bash
    conda env export > environment.yml
    ```
    This allows collaborators to recreate your exact environment with `conda env create -f environment.yml`.

---

## Converting data to BIDS

We recommend converting your raw BioSemi `.bdf` files to BIDS format using [MNE-BIDS](https://mne.tools/mne-bids/). This standardises your dataset and makes it compatible with community tools.

A basic conversion looks like this:

```python
import mne
from mne_bids import write_raw_bids, BIDSPath

# Load raw BioSemi data
raw = mne.io.read_raw_bdf('sourcedata/sub-01/eeg/sub-01_task-main.bdf', preload=False)

# Define the BIDS path
bids_path = BIDSPath(
    subject='01',
    task='main',
    datatype='eeg',
    root='BIDS'
)

# Write to BIDS format
write_raw_bids(raw, bids_path, overwrite=True)
```

For a complete guide on BIDS-EEG, see the [MNE-BIDS documentation](https://mne.tools/mne-bids/stable/auto_examples/index.html).

---

Now you are ready to move on to **quality control** of your raw data. See the next guide: [:octicons-arrow-right-24: Quality control](eeg-quality-control.md)
