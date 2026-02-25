# Convert your fMRI data into BIDS format

To organize our fMRI dataset, we follow the [BIDS](https://bids-specification.readthedocs.io/en/stable/introduction.html) Specification.

If you are not familiar with the BIDS Specification, the [BIDS Starter Kit](https://bids-standard.github.io/bids-starter-kit/index.html) provides all the information needed to get started, along with [example BIDS datasets](https://bids-standard.github.io/bids-starter-kit/dataset_examples.html), [Talks and Slides](https://bids-standard.github.io/bids-starter-kit/talks.html), and most importantly [Tutorials](https://bids-standard.github.io/bids-starter-kit/tutorials/tutorials.html).

It is crucial that you get familiar with BIDS folders/files naming convention and structure. Most, if not all, the tools we are going to use in the next steps are [BIDS Apps](https://bids-apps.neuroimaging.io/apps/), and they rely on data organized following the BIDS Specification. Following this structure will make it easier to use these tools, share your code and data, and communicate with other scientists.

The BIDS Specification provides guidelines on how to organize all your data formats, including [(f/d)MRI](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/magnetic-resonance-imaging-data.html), [EEG](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html), [eye-tracking](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/physiological-and-other-continuous-recordings.html), [Task events](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html) associated with Neuro-Imaging recordings or [not](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/behavioral-experiments.html), and [Derivatives](https://bids-specification.readthedocs.io/en/stable/derivatives/imaging.html) (e.g., pre-processed files, Regions Of Interest mask files, GLM files, etc.).

At any moment, you can check your dataset for BIDS compliance. To do so, you can use the [BIDS dataset validator](https://bids-standard.github.io/bids-validator/).

## Table of Contents

- [Convert your fMRI data into BIDS format](#convert-your-fmri-data-into-bids-format)
  - [Table of Contents](#table-of-contents)
  - [BIDS Conversion Overview](#bids-conversion-overview)
    - [1. Create the raw data directory](#1-create-the-raw-data-directory)
    - [2. Create the subject's directory](#2-create-the-subjects-directory)
    - [3. Organize your source files](#3-organize-your-source-files)
    - [4. Convert DICOM files](#4-convert-dicom-files)
    - [5. Create the BIDS directory](#5-create-the-bids-directory)
    - [6. Organise the BIDS directory](#6-organise-the-bids-directory)
    - [7. Create JSON sidecar files](#7-create-json-sidecar-files)
    - [8. Create event files](#8-create-event-files)
    - [9. Create additional BIDS files](#9-create-additional-bids-files)
    - [10. Validating Your BIDS Structure](#10-validating-your-bids-structure)

## BIDS Conversion Overview

Here's a high-level overview of the steps involved in arranging your data in a BIDS-compatible way. While this provides a general understanding, most of these steps should be performed using the code provided in each sub-section to minimize errors. After scanning participants, you'll obtain data from two primary sources:

1. The scanner: **functional** and **structural** outputs (`DICOM` files).
2. The stimulus presentation computer: **behavioural** outputs (mainly `log` files and `mat` files) and potentially eye-tracking data (`edf` files or `tsv` files).

As you turn your raw data into a BIDS-compatible format, your project directory will change considerably. The folder trees below show you how each steps will affect your working directory, with changing folders and file in **bold** for each step.

---

### 1. Create the raw data directory

<pre><code>
<b>myproject</b>
└── <b>sourcedata</b>
</code></pre>

Your first step is to organize your files in a `sourcedata` folder. Follow the structure outlined in [How to store raw data](./fmri-general.md#how-to-store-raw-data): have one main project folder (e.g. `myproject`), and a `sourcedata` folder in it.

---

### 2. Create the subject's directory

<pre><code>
myproject
└── sourcedata
    └── <b>sub-01</b>
        ├── <b>bh</b>
        ├── <b>dicom</b>
        ├── <b>eye</b>
        ├── <b>dicom_anon</b>
        └── <b>nifti</b>
</code></pre>

Create the relevant sub-folders within the `sourcedata` folder: for each participant you collected data from, create a `sub-xx` folder (e.g. `sub-01`). Within the folder of each participant, create a `bh` (behaviour), `eye` (i.e. eye-tracking data), `dicom` (i.e. dicom files collected from the scanner), `dicom_anon` (i.e. anonymized dicom files collected from the scanner), and `nifti` (i.e. nifti, the format of the files after the DICOM conversion).

To create these folders, open your terminal (or PowerShell if you are on Windows) and type:

```base
cd /path/to/myproject/sourcedata
mkdir sub-01
mkdir sub-01/bh
mkdir sub-01/eye
mkdir sub-01/dicom
mkdir sub-01/dicom_anon
mkdir sub-01/nifti
```

---

### 3. Organize your source files

<pre><code>
myproject
└── sourcedata
    └── sub-01
        ├── bh
        │   ├── <b>yyyy-mm-dd-sub-01_run-01_task-{taskname}_log.tsv</b>
        │   ├── <b>yyyy-mm-dd-sub-01_run-01_task-{taskname}.mat</b>
        │   ├── ...
        │   ├── <b>yyyy-mm-dd-sub-01_run-{runnumber}_task-{taskname}_log.tsv</b>
        │   └── <b>yyyy-mm-dd-sub-01_run-{runnumber}_task-{taskname}.mat</b>
        ├── dicom
        │   ├── <b>IM_0001</b>
        │   ├── <b>IM_0005</b>
        │   ├── <b>PS_0002</b>
        │   ├── <b>PS_0006</b>
        │   ├── <b>XX_0003</b>
        │   ├── <b>XX_0004</b>
        │   └── <b>XX_0007</b>
        ├── dicom_anon
        ├── nifti
        └── eye

</code></pre>

Place the files you collected in this `sourcedata` structure: data collected from your experimental task goes into `bh` (e.g. `.mat` files and log files if you used the [fMRI task template](https://github.com/HOPLAB-LBP/fMRI-task-template)), data collected from the scanner itself (DICOM) goes in `dicom`, eye-tracking data (generally, EDF or csv files) goes in `eye`.

---

### 4. Convert DICOM files

<pre><code>
myproject
└── sourcedata
    └── sub-01
        ├── bh
        ├── dicom
        ├── <b>dicom_anon</b>
        │   ├── <b>IM_0001</b>
        │   ├── <b>IM_0005</b>
        │   ├── <b>PS_0002</b>
        │   ├── <b>PS_0006</b>
        │   ├── <b>XX_0003</b>
        │   ├── <b>XX_0004</b>
        │   └── <b>XX_0007</b>
        ├── <b>nifti</b>
        │   ├── <b>dcmHeaders.mat</b>
        │   ├── <b>sub-01_run-01.json</b>
        │   ├── <b>sub-01_run-01.nii.gz</b>
        │   ├── <b>sub-01_struct.json</b>
        │   └── <b>sub-01_struct.nii.gz</b>
        ├── dicom_anon
        ├── nifti
        └── eye
</code></pre>

If you have collected DICOM files from the scanner, you need to **anonymise** and **convert** them so that you can use them properly. There are several tools available that can help with this. One recommended option is [`dicm2nii`](https://github.com/xiangruili/dicm2nii), a lightweight and flexible toolbox for handling DICOM-to-NIfTI conversion.

!!! question "Why `dicm2nii` and not `dcm2niix`?"
    Although [`dcm2niix`](https://github.com/rordenlab/dcm2niix) is widely used and robust, especially for modern enhanced DICOMs and vendor-specific edge cases (like Philips), `dicm2nii` is often suggested.

    For data acquired with Philips scanners, or if your DICOMs have missing metadata (e.g., `PhaseEncodingDirection`), see [this Rorden Lab guide](https://github.com/rordenlab/dcm2niix/tree/3e02980597669ed8a9db073e824b4f74cccb597a/Philips) and this [NITRC forum thread](https://www.nitrc.org/forum/forum.php?thread_id=15186&forum_id=4703) See also [Missing fields in JSON files](./fmri-general.md#missing-fields-in-json-files) for more information.

To convert your data:

1. Navigate to your sourcedata folder

    ```bash
    cd /path/to/myproject/sourcedata
    ```

2. [Clone the repository](https://github.com/xiangruili/dicm2nii) from GitHub:

    ```bash
    git clone https://github.com/xiangruili/dicm2nii.git
    ```

3. Add the `dicm2nii` folder to your MATLAB path:
    In **MATLAB**, run:

    ```matlab
    addpath('/path/to/dicm2nii')  % Adjust this to the actual folder path
    ```

    !!! tip
        You can also use `uigetdir` to interactively select the folder:

    ```matlab
    addpath(uigetdir)
    ```

4. Anonymize your DICOM files

    Use the `anonymize_dicm` function. This removes identifying fields and creates a safe copy for conversion:

    ```matlab
    anonymize_dicm('sub-01/dicom', 'sub-01/dicom_anon', 'sub-01')
    ```

    - First argument = path to **raw DICOM** folder
    - Second argument = path to output **anonymized DICOM** folder
    - Third argument = subject ID string used in metadata fields (optional but recommended)

    This will create `dicom_anon` and log any changes made.

5. Convert anonymized DICOMs to NIfTI

    Now convert the anonymized files:

    ```matlab
    dicm2nii('sub-01/dicom_anon', 'sub-01/nifti', 'nii.gz')
    ```

    - First argument = path to anonymized DICOMs
    - Second argument = output directory
    - Third argument = output format (`nii`, `nii.gz`)

    This will:

    - Generate one `.nii.gz` file per series
    - Produce accompanying `.json` metadata files
    - Create a `dcmHeaders.mat` with all parsed metadata

---

### 5. Create the BIDS directory

<pre><code>
myproject
├── <b>BIDS</b>
│   └── <b>sub-01</b>
│       ├── <b>anat</b>
│       │   └── <b>sub-01_T1w.nii</b>
│       └── <b>func</b>
│           ├── <b>sub-01_task-{taskname}_run-01_bold.nii</b>
│           ├── ...
│           └── <b>sub-01_task-{taskname}_run-{runnumber}_bold.nii</b>
└── sourcedata
    └── sub-01
        ├── bh
        ├── dicom
        ├── dicom_anon
        └── nifti
</code></pre>

Create a `BIDS` folder in your main project directory, alongside the `sourcedata` folder. For each participant, create a sub folder (e.g. `BIDS/sub-01`). In the BIDS folder of each participant, place a `func` folder for functional files and a `anat` folder for anatomical files. Copy-paste your functional `.nii` files from `sourcedata` to their corresponding `func` folder, renaming them if necessary to follow BIDS format (e.g. `sub-01_task-{taskname}_run-01_bold.nii`), and similarly copy-paste your structural `.nii` files to the `anat` folder, renaming them if necessary (e.g. `sub-01_T1w.nii`).

---

### 6. Organise the BIDS directory

<pre><code>
myproject
├── BIDS
│   └── sub-01
│       ├── anat
│       │   └── <b>sub-01_T1w.nii</b>
│       └── func
│           ├── <b>sub-01_task-{taskname}_run-01_bold.nii</b>
│           ├── ...
│           └── <b>sub-01_task-{taskname}_run-{runnumber}_bold.nii</b>
└── sourcedata
    └── sub-01
        ├── bh
        ├── dicom
        ├── dicom_anon
        └── nifti
</code></pre>

1. Navigate to your `sourcedata/sub-xx/nifti/` folder.
2. Identify the functional and structural NIfTI files.
3. Rename the files following BIDS conventions:
    - Functional: `sub-<label>_task-<label>_run-<label>_bold.nii`
    - Structural: `sub-<label>_T1w.nii`
4. Move the renamed files to their respective folders in `BIDS/sub-xx/`:
    - Functional files go to `BIDS/sub-xx/func/`
    - Structural files go to `BIDS/sub-xx/anat/`

---

### 7. Create JSON sidecar files

<pre><code>
myproject
├── BIDS
│   └── sub-01
│       ├── anat
│       │   ├──sub-01_T1w.nii
│       │   └── <b>sub-01_T1w.json</b>
│       └── func
│           ├── <b>sub-01_task-{taskname}_run-01_bold.json</b>
│           ├── sub-01_task-{taskname}_run-01_bold.nii
│           ├── ...
│           ├── <b>sub-01_task-{taskname}_run-{runnumber}_bold.json</b>
│           └── sub-01_task-{taskname}_run-{runnumber}_bold.nii
└── sourcedata
    └── sub-01
        ├── bh
        ├── dicom
        ├── dicom_anon
        └── nifti
</code></pre>

Create `.json` sidecar files for each functional run `.nii` file, using the output from the dicom conversion step.

Each `nii` file **must** have a sidecar JSON file. Make sure you [anonymised and converted your DICOM files](./fmri-bids-conversion.md#4-convert-dicom-files) and go through the following steps:

  1. Locate the JSON sidecar files in `sourcedata/sub-xx/nifti/`.
  2. Open each JSON file and Complete the `PhaseEncodingDirection` and `SliceTiming` fields (see [Missing fields in JSON files](./fmri-general.md#missing-fields-in-json-files) for more information).
  3. Copy-paste the updated JSON files to accompany each NIfTI file in the `BIDS/sub-xx/func` folder: each run should have its accompanying `sub-xx_task-{taskname}_run-{runnumber}_bold.json` sidecar file.

---

### 8. Create event files

<pre><code>
myproject
├── BIDS
│   └── sub-01
│       ├── anat
│       │   ├──sub-01_T1w.nii
│       │   └── <b>sub-01_T1w.json</b>
│       └── func
│           ├── sub-01_task-{taskname}_run-01_bold.json
│           ├── sub-01_task-{taskname}_run-01_bold.nii
│           ├── <b>sub-01_task-{taskname}_run-01_events.tsv</b>
│           ├── ...
│           ├── sub-01_task-{taskname}_run-{runnumber}_bold.json
│           ├── sub-01_task-{taskname}_run-{runnumber}_bold.nii
│           └── <b>sub-01_task-{taskname}_run-{runnumber}_events.tsv</b>
├── code
└── sourcedata
    └── sub-01
        ├── bh
        ├── dicom
        ├── dicom_anon
        ├── eye
        └── nifti
</code></pre>

Create one `events.tsv` file for each function run `.nii` file, using the output from your experimental task. If you used the [fMRI task template](https://github.com/HOPLAB-LBP/fMRI-task-template)), output log files can be used to create event files quite easily. More info on events files can be found [here](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html).

Event files are crucial for analyzing fMRI data. They contain information about the timing and nature of stimuli or tasks during the scan. To create your event files manually:

1. Navigate to your `sourcedata/sub-xx/bh/` folder.
2. Locate the behavioral output files (`.mat` or `.log`) for each run.
3. Create a corresponding `events.tsv` file for each run in the `BIDS/sub-xx/func/` folder.

Each `events.tsv` file **must** contain at least three columns: `onset`, `duration`, and `trial_type`, and **can** include additional as needed for your specific analysis. It also **must** contain one row per trial (stimulus) in your experiment.

If you use the [fMRI task template](https://github.com/TimManiquet/fMRI-task-template), the log files you get as output contain all the information needed to build event files in a few steps. Below is a quick overview of the steps to take to make event files from log files. Note that it might not apply perfectly to all cases, and that other approaches can be more practical to you. It can be a good idea to create your own utility script to create event files from your behavioural results.

To **create event files from log files**, here is what you need to do (see the example below for an example transformation):

- Create the `onset` column from the onset values in the log files: in the latter, onset times (usually stored in a column called `ACTUAL_ONSET`) are aligned to the start of the run. In BIDS event files, events need to be aligned to the start of the scanning. To obtain correct onset values, one can simply shift the onset of each line from a log file so that the onset `0.0` corresponds to the first TR trigger.
- Create the `duration` column from the `onset` values. Log files typically don't record the exact duration of events, as that would put some extra calculation load onto MatLab (which struggles enough already as it is). A good approach is to calculate these post-hoc from the onset values, by simply taking the difference in between successive event onsets.
- Create the `trial_type` column with the condition names. Fill this column by extracting the information that is relevant for your experimental design. In the example below, we extract the condition names `face` and `building` from the `EVENT_ID` column, as these are the conditions we're interested in.
- Add or keep any extra column you might need. In the example below, we keep the `event_id` columns as it might still be useful later on in the pipeline. Note that you should make a reference to these extra column in your `events.json` file.

For example, this is what a log file looks like:

```
EVENT_TYPE  EVENT_NAME  DATETIME                EXP_ONSET     ACTUAL_ONSET  DELTA     EVENT_ID
START       -           yyyy-mm-dd-hh-mm-ss  -               0.000000  -         -
FLIP        Instr       yyyy-mm-dd-hh-mm-ss  -               0.099950  -         -
RESP        KeyPress    yyyy-mm-dd-hh-mm-ss  -               7.663277  -         7
FLIP        TgrWait     yyyy-mm-dd-hh-mm-ss  -               7.697805  -         -
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              12.483778  -         5
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              24.452093  -         5
FLIP        Pre-fix     yyyy-mm-dd-hh-mm-ss  -              24.462263  -         -
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              26.452395  -         5
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              28.452362  -         5
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              30.451807  -         5
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              32.451339  -         5
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              34.451376  -         5
FLIP        Stim        yyyy-mm-dd-hh-mm-ss  34.462263      34.474302  0.012039  building_image.png
RESP        KeyPress    yyyy-mm-dd-hh-mm-ss  -              35.566808  -         9
FLIP        Fix         yyyy-mm-dd-hh-mm-ss  -              34.521628  -         -
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              36.451615  -         5
FLIP        Stim        yyyy-mm-dd-hh-mm-ss  37.462263      37.524439  0.062177  face_image.png
FLIP        Fix         yyyy-mm-dd-hh-mm-ss  -              37.572648  -         -
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              38.453535  -         5
RESP        KeyPress    yyyy-mm-dd-hh-mm-ss  -              38.806193  -         1
PULSE       Trigger     yyyy-mm-dd-hh-mm-ss  -              40.451415  -         5
...
```

This is what the corresponding event file should look like:

```
onset           duration        trial_type     event_id
10.022209       0.0473259       building       building_image.png
13.072346       0.0482089       face           face_image.png
```

---

### 9. Create additional BIDS files

<pre><code>
myproject
├── BIDS
│   ├── <b>dataset_description.json</b>
│   ├── <b>events.json</b>
│   ├── <b>participants.json</b>
│   ├── <b>participants.tsv</b>
│   ├── sub-01
│   │   ├── anat
│   │   └── func
│   └── <b>task-taskname_bold.json</b>
└── sourcedata
    └── sub-01
        ├── bh
        ├── dicom
        ├── dicom_anon
        ├── eye
        └── nifti
</code></pre>

1. Create the following [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson) files in your `BIDS/` folder:
    - `dataset_description.json`
    - `participants.tsv`
    - `participants.json`
    - `task-<taskname>_bold.json`

2. Fill in the required information for each file according to the BIDS specification.

And set up additional components:

1. Create a `derivatives/` folder in your `BIDS/` directory.
1. If needed, create a `.bidsignore` file in your `BIDS/` root folder to exclude any non-BIDS compliant files.

??? question "Why should I use a .bidsignore file?"
    A `.bidsignore' file is useful to communicate to the BIDS validator which files should not be indexed, because they are not part of the standard BIDS structure. More information can be found [here](https://neuroimaging-core-docs.readthedocs.io/en/latest/pages/bids-validator.html#creating-a-bidsignore).

---

### 10. Validating Your BIDS Structure

By following these steps systematically, you'll ensure your data is properly organized in BIDS format, facilitating easier analysis and collaboration.

Make sure all the steps have been followed successfully by validating your BIDS folder. To do so, use the **[BIDS validator](https://bids-standard.github.io/bids-validator/)**.

1. Use the online [BIDS Validator](https://bids-standard.github.io/bids-validator/) to check your BIDS structure.
2. Upload your entire `BIDS/` folder and review any errors or warnings.
3. Make necessary corrections based on the validator's output.

By following these detailed steps, you'll ensure your data is properly organized in BIDS format, facilitating easier analysis and collaboration.

---

!!! info "Next steps: Data storage"
    Once your data is in BIDS format, make sure to follow the lab's [data management guidelines](../../rdm/current.md) for storing and backing up your dataset. See the [ManGO guide](../../rdm/mango_active.md) for uploading your data to the lab's active research data storage.

Now that you have your data in BIDS format, we can proceed to data pre-processing and quality assessment. See the next guide for instructions. [--> Pre-processing and QA](fmri-prepocessing-qa.md)
