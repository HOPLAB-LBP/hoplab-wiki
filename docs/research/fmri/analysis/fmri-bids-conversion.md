# Convert your fMRI data into BIDS format

**TODO:** [TIM] add figures. It would definitely be nice to show a full tree of an example repostitory, and how it changes at each step of the way.

## BIDS standards

To organize our fMRI dataset, we follow the [BIDS](https://bids-specification.readthedocs.io/en/stable/introduction.html) Specification.

If you are not familiar with the BIDS Specification, the [BIDS Starter Kit](https://bids-standard.github.io/bids-starter-kit/index.html) provides all the information needed to get started, along with [example BIDS datasets](https://bids-standard.github.io/bids-starter-kit/dataset_examples.html), [Talks and Slides](https://bids-standard.github.io/bids-starter-kit/talks.html), and most importantly [Tutorials](https://bids-standard.github.io/bids-starter-kit/tutorials/tutorials.html).

It is crucial that you get familiar with BIDS folders/files naming convention and structure. Most, if not all, the tools we are going to use in the next steps are [BIDS Apps](https://bids-apps.neuroimaging.io/apps/), and they rely on data organized following the BIDS Specification. Following this structure will make it easier to use these tools, share your code and data, and communicate with other scientists.

The BIDS Specification provides guidelines on how to organize all your data formats, including [(f/d)MRI](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/magnetic-resonance-imaging-data.html), [EEG](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html), [eye-tracking](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/physiological-and-other-continuous-recordings.html), [Task events](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html) associated with Neuro-Imaging recordings or [not](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/behavioral-experiments.html), and [Derivatives](https://bids-specification.readthedocs.io/en/stable/derivatives/imaging.html) (e.g., pre-processed files, Regions Of Interest mask files, GLM files, etc.).

At any moment, you can check your dataset for BIDS compliance. To do so, you can use the [BIDS dataset validator](https://bids-standard.github.io/bids-validator/).

## BIDS Conversion Overview

After scanning participants, you'll obtain data from two primary sources:

1. The scanner: Functional and structural outputs (`.nii` files), alongside potential `dicom` files
2. The stimulus presentation computer: Behavioural outputs (mainly `log` files and `.mat` files) and potentially eye-tracking data

Your first step is to organize these files in a `sourcedata` folder. Follow the structure outlined in [How to store raw data](./fmri-general.md#how-to-store-raw-data). Once your data is properly arranged, you can proceed to anonymize it and convert it to BIDS format.

Here's a high-level overview of the steps involved in arranging your data in a BIDS-compatible way. While this provides a general understanding, most of these steps should be performed using the code provided in each sub-section to minimize errors.

0. First and foremost, make sure your DICOM / nifti file names **do not contain** subject identificative information, such as the subject's name. This is particularly relevant for our pipeline, because that's exactly what our scanner does. You can either manually rename your files, or run the small Python utility (available [here](../../../assets/code/anon_nii_filename.py)) in your terminal. More information on how to use it can be found in the docstring inside the script and in the relevant section below.

1. Create `events.tsv` files (more info on required and optional columns can be found [here](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html)):

    - Make one file per functional run
    - Add them to the `./BIDS/sub-xx/func` folder
    - *Optional:* Create an `events.json` sidecar file to describe extra columns in event files

    Example:

    ```bash
    └─ sub-01/
    └─ func/
      ├─ sub-01_task-exp_events.tsv 
      └─ sub-01_task-exp_events.json 
    ```

2. Rename functional `nifti` files:

    - Follow BIDS naming format: `sub-<label>_task-<label>_run-<label>_bold.nii`
    - Add them to the `./BIDS/sub-xx/func` folder

3. Rename structural `nifti` files:

    - Follow BIDS naming format: `sub-<label>_T1W.nii`
    - Add them to the `./BIDS/sub-xx/func` folder

4. *Optional:* Process `dicom` files (if you got DICOM files from the scanner):

    - Anonymize bold `dicom` files for your first participant using `anonymize_dicm`
    - Convert anonymized `dicom` files using `dicm2nii` to get `.json` sidecar files for your anatomical or function scans.

    !!! info "JSON files"
        Each `nii` file **must** have a sidecar JSON file. However, if your fMRI protocol did not change, all the important JSON fields are going to be the same across different scanning sessions, and therefore JSON files can be re-used across subjects. This will save you some time, since getting DICOM files from the scanner can be quite time-consuming.

5. Update `.json` sidecar files:

    - Complete the `PhaseEncodingDirection` and `SliceTiming` fields (see [Missing fields in JSON files](./fmri-general.md#missing-fields-in-json-files) for more information)
    - Duplicate and rename sidecar files to accompany each `bold.nii` file

6. Create essential [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson):

    - `dataset_description.json`
    - `participants.tsv` and `participants.json`
    - `task-<taskname>_bold.json`

7. Set up additional components:

    - Create a `derivatives` folder for future outputs
    - *Optional*: Include a `.bidsignore` file if needed

8. Validate your BIDS structure:

    - Use the [BIDS validator](https://bids-standard.github.io/bids-validator/)

By following these steps systematically, you'll ensure your data is properly organized in BIDS format, facilitating easier analysis and collaboration.

## Step-by-step instructions

Here we provide more detailed instructions to perform each of the steps mentioned above.

!!! warning "Folder Structure"
    All the steps and scripts below assume a specific folder structure and file naming convention. They **will not work** otherwise. Ensure you strictly follow the instructions in the [How to store raw data](./fmri-general.md#how-to-store-raw-data) page.

    **TODO:** [ANDREA] in the how to store raw data page, create a folders tree that includes all the relevant folders and subfolder. The current tree is not complete.
    
### Anonymize raw scanner data

#### Expected project structure

[This small utility tool](../../../assets/code/anon_nii_filename.py) renames files within a BIDS-like directory structure, specifically targeting files containing `_WIP_` in their names.

The script operates on the following project structure:

```bash
Project_Name/
├── sourcedata/
│   └── sub-xx/
│       ├── dicom/
│       ├── dicom_anon/
│       ├── bh/
│       ├── et/
│       └── nifti/
└── BIDS/
    ├── derivatives/
    └── sub-xx/
        ├── anat/
        └── func/
```

The script processes files within the 'sourcedata' directory.

Execute the script from the 'sourcedata' directory:

1. Open a terminal or command prompt.
2. Navigate to the project's root:

   ```bash
   cd /path/to/Project_Name
   ```

3. Change to the 'sourcedata' directory:

   ```bash
   cd sourcedata
   ```

#### Command-line Arguments

- `--level {group,participant}`: Process all subjects (`group`) or individual subjects (`participant`).
- `--confirm {True,False}`: Ask for confirmation before renaming (default: True).
- `--dry_run`: Preview changes without renaming.
- `--sub [SUB ...]`: Specify subject IDs to process.

#### Examples

1. Dry run for all subjects:

   ```bash
   python /path/to/anon_nii_filename.py --level group --dry_run
   ```

2. Rename files for subjects 01 and 02 with confirmation:

   ```bash
   python /path/to/anon_nii_filename.py --level participant --sub 01 02 --confirm True
   ```

3. Rename files for all subjects without confirmation:

   ```bash
   python /path/to/anon_nii_filename.py --level group --confirm False
   ```

Output filename:

```bash
sub-01/nifti/sub-01_WIP_T1w_20240101141322.nii
```

!!! warning "Caution"
    Always backup your data before running renaming operations.

#### How It Works

1. The script traverses the 'sourcedata' directory structure.
2. It identifies files containing '*WIP*' in their names.
3. New names are generated based on the subject ID and the part of the filename after '*WIP*'.
4. Depending on the options, it either renames the files or shows the proposed changes.

#### Important Notes

- Only files containing '*WIP*' are processed. Others are ignored.
- To process all files, modify the `rename_files_in_directory` function:

  ```python
  if '_WIP_' in file:
  ```

  to:

  ```python
  if True:  # Caution: processes all files
  ```

!!! caution "Modifying the Script"
    Processing all files may lead to unintended renaming. Always use `--dry_run` first and review proposed changes carefully.

#### Tips

- Use `--dry_run` to preview changes before actual renaming.
- Process subjects in smaller batches for large datasets.
- Regularly check BIDS specifications for naming convention compliance.

#### Troubleshooting

If issues occur:

1. Ensure you're in the 'sourcedata' directory.
2. Check permissions for renaming files in 'sourcedata'.
3. Verify all required Python dependencies are installed.
4. For unprocessed files, check if they contain '*WIP*'.

### Creating Event Files

Event files are crucial for analyzing fMRI data. They contain information about the timing and nature of stimuli or tasks during the scan. To create your event files manually:

1. Navigate to your `sourcedata/sub-xx/bh/` folder.
2. Locate the behavioral output files (`.mat` or `.log`) for each run.
3. Create a corresponding `events.tsv` file for each run in the `BIDS/sub-xx/func/` folder.

Each `events.tsv` file should contain at least three columns: `onset`, `duration`, and `trial_type`. Additional columns can be included as needed for your specific analysis.

**TODO:** [ANDREA] Add script for automatically converting behavioral data to BIDS-compliant event files.

**TODO:** [TIM] Include information about event files. Mention how they should ideally be created directly by the behavioural task script. Add a link to the [task template](https://github.com/TimManiquet/fMRI-task-template) to show how that can be done.

**TODO:** [TIM] Add information about making an `events.json` file and the advantages of it.

**TODO:** [TIM] Add information about using event files to make contrasts in the SPM step. Having a 'condition' + column for instance might be quite useful.

**TODO:** [TIM] Give information about which columns will be useful to include in such files, why, and at what + future step they will become important.

### Converting DICOM files (Optional)

If you have DICOM files from the scanner:

1. Navigate to your `sourcedata/sub-xx/dicom/` folder.
2. Use the `anonymize_dicm` script to anonymize the DICOM files.
3. Use the `dicm2nii` script to convert the anonymized DICOM files to NIfTI.

**TODO:** [TIM] Give information on how to use the anonymization and dicom to nifti scripts, and what the results should be like. Give links to the scripts.

### Creating JSON Sidecar Files

1. Locate the JSON sidecar files in `sourcedata/sub-xx/dicom_converted/`.
2. Open each JSON file and update the `PhaseEncodingDirection` and `SliceTiming` fields.
3. Copy the updated JSON files to accompany each NIfTI file in the BIDS folder.

Each `nii` file must have a corresponding JSON sidecar file. If your fMRI protocol didn't change, you can reuse JSON files across subjects.

**TODO:** [TIM] Explain how to get the two missing fields and why it's important. Link to the fmri-general section about it.

**TODO:** [TIM] Explain how to duplicate and rename the sidecar file.

**TODO:** [ANDREA] fill this out with more in depth info about the JSON etc.

### Renaming and Moving NIfTI Files

1. Navigate to your `sourcedata/sub-xx/dicom_converted/` folder.
2. Identify the functional and structural NIfTI files.
3. Rename the files following BIDS conventions:
    - Functional: `sub-<label>_task-<label>_run-<label>_bold.nii`
    - Structural: `sub-<label>_T1w.nii`
4. Move the renamed files to their respective folders in `BIDS/sub-xx/`:
    - Functional files go to `BIDS/sub-xx/func/`
    - Structural files go to `BIDS/sub-xx/anat/`

**TODO:** [ANDREA] is dicom converted and nii the same folder? from which folder should we get the final nifti files to move? this folder needs to be consistent across different workflows (e.g., dicom conversion or just nifti files)

**TODO:** [TIM] Give instructions on how to rename files, both functional and structural, including what happens in case of several scan sessions and the added `ses` label.

??? tip "Rename and move automatically"
    A MATLAB script that can do this automatically can be found [here](../../../assets/code/nii2BIDS.m). Remember to change the input and output folders, run names and subjects numbers at the top of the script according to your needs. The  script expects as input your nifti files, along with the JSON sidecar template files.

    **TODO:** [ANDREA] the script should first check whether the JSON files are already availabe in the folder and, if that's the case, it should choose these files over the  templates. Also, we need to add more info about these template files in this page!

### Creating Essential BIDS Files

1. Create the following [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson) files in your `BIDS/` root folder:
    - `dataset_description.json`
    - `participants.tsv`
    - `participants.json`
    - `task-<taskname>_bold.json`

2. Fill in the required information for each file according to the BIDS specification.

!!! tip "Modality agnostic templates"
    In the [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson) page, you can find templates and examples.

### Setting Up Additional Components

1. Create a `derivatives/` folder in your `BIDS/` directory.
2. If needed, create a `.bidsignore` file in your `BIDS/` root folder to exclude any non-BIDS compliant files.

??? question "Why should I use a .bidsignore file?"
    A `.bidsignore' file is useful to communicate to the BIDS validator which files should not be indexed, because they are not part of the standard BIDS structure. More information can be found [here](https://neuroimaging-core-docs.readthedocs.io/en/latest/pages/bids-validator.html#creating-a-bidsignore).

### Validating Your BIDS Structure

1. Use the online [BIDS Validator](https://bids-standard.github.io/bids-validator/) to check your BIDS structure.
2. Upload your entire `BIDS/` folder and review any errors or warnings.
3. Make necessary corrections based on the validator's output.

By following these detailed steps, you'll ensure your data is properly organized in BIDS format, facilitating easier analysis and collaboration.

---

Now that you have your data in BIDS format, we can proceed to data pre-processing and quality assessment. See the next guide for instructions. [--> Pre-processing and QA](fmri-prepocessing-qa.md)
