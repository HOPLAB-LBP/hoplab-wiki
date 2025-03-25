# Convert your fMRI data into BIDS format

**TODO:** [TIM] add figures. It would definitely be nice to show a full tree of an example repostitory, and how it changes at each step of the way.

**TODO:** [ANDREA] this page is unnecessary complex. I think we should make it simpler by giving the standard steps from DICOM to BIDS, which is in iny case safer than the nift + json editing.

## BIDS standards

To organize our fMRI dataset, we follow the [BIDS](https://bids-specification.readthedocs.io/en/stable/introduction.html) Specification.

If you are not familiar with the BIDS Specification, the [BIDS Starter Kit](https://bids-standard.github.io/bids-starter-kit/index.html) provides all the information needed to get started, along with [example BIDS datasets](https://bids-standard.github.io/bids-starter-kit/dataset_examples.html), [Talks and Slides](https://bids-standard.github.io/bids-starter-kit/talks.html), and most importantly [Tutorials](https://bids-standard.github.io/bids-starter-kit/tutorials/tutorials.html).

It is crucial that you get familiar with BIDS folders/files naming convention and structure. Most, if not all, the tools we are going to use in the next steps are [BIDS Apps](https://bids-apps.neuroimaging.io/apps/), and they rely on data organized following the BIDS Specification. Following this structure will make it easier to use these tools, share your code and data, and communicate with other scientists.

The BIDS Specification provides guidelines on how to organize all your data formats, including [(f/d)MRI](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/magnetic-resonance-imaging-data.html), [EEG](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html), [eye-tracking](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/physiological-and-other-continuous-recordings.html), [Task events](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html) associated with Neuro-Imaging recordings or [not](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/behavioral-experiments.html), and [Derivatives](https://bids-specification.readthedocs.io/en/stable/derivatives/imaging.html) (e.g., pre-processed files, Regions Of Interest mask files, GLM files, etc.).

At any moment, you can check your dataset for BIDS compliance. To do so, you can use the [BIDS dataset validator](https://bids-standard.github.io/bids-validator/).

## BIDS Conversion Overview

Here's a high-level overview of the steps involved in arranging your data in a BIDS-compatible way. While this provides a general understanding, most of these steps should be performed using the code provided in each sub-section to minimize errors. After scanning participants, you'll obtain data from two primary sources:

1. The scanner: **functional** and **structural** outputs (`.nii` files), alongside potential `dicom` files
2. The stimulus presentation computer: **behavioural** outputs (mainly `log` files and `.mat` files) and potentially eye-tracking data

As you turn your raw data into a BIDS-compatible format, your project directory will change considerably. The folder trees below show you how each steps will affect your working directory, with changing folders and file in **bold** for each step.

=== "Step1"

    <pre><code>
    <b>myproject</b>
    └── <b>sourcedata</b>
    </code></pre>


=== "Step 2"
    
    <pre><code>
    myproject
    └── sourcedata
        └── <b>sub-01</b>
            ├── <b>bh</b>
            ├── <b>dicom</b>
            └── <b>nifti</b>
    </code></pre>

=== "Step 3"

    <pre><code>
    myproject
    └── sourcedata
        └── sub-01
            ├── bh
            │   ├── <b>yyyy-mm-dd-sub-01_run-01_task-taskname_log.tsv</b>
            │   ├── <b>yyyy-mm-dd-sub-01_run-01_task-taskname.mat</b>
            │   ├── ...
            │   ├── <b>yyyy-mm-dd-sub-01_run-xx_task-taskname_log.tsv</b>
            │   └── <b>yyyy-mm-dd-sub-01_run-xx_task-taskname.mat</b>
            ├── dicom
            │   ├── <b>IM_0001</b>
            │   ├── <b>IM_0005</b>
            │   ├── <b>PS_0002</b>
            │   ├── <b>PS_0006</b>
            │   ├── <b>XX_0003</b>
            │   ├── <b>XX_0004</b>
            │   └── <b>XX_0007</b>
            └── nifti
                ├── <b>run-01.nii</b>
                ├── ...
                ├── <b>run-xx.nii</b>
                └── <b>sub-01_struct.nii</b>
    </code></pre>

=== "Step 4"

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
            ├── <b>dicom_converted</b>
            │   ├── <b>dcmHeaders.mat</b>
            │   ├── <b>sub-01_run-01.json</b>
            │   ├── <b>sub-01_run-01.nii.gz</b>
            │   ├── <b>sub-01_struct.json</b>
            │   └── <b>sub-01_struct.nii.gz</b>
            └── nifti
    </code></pre>

=== "Step 5"

    <pre><code>
    myproject
    ├── <b>BIDS</b>
    │   └── <b>sub-01</b>
    │       ├── <b>anat</b>
    │       │   └── <b>sub-01_T1w.nii</b>
    │       └── <b>func</b>
    │           ├── <b>sub-01_task-taskname_run-01_bold.nii</b>
    │           ├── ...
    │           └── <b>sub-01_task-taskname_run-xx_bold.nii</b>
    └── sourcedata
        └── sub-01
            ├── bh
            ├── dicom
            ├── dicom_anon
            ├── dicom_converted
            └── nifti
    </code></pre>

=== "Step 6"

    <pre><code>
    myproject
    ├── BIDS
    │   └── sub-01
    │       ├── anat
    │       └── func
    │           ├── <b>sub-01_task-taskname_run-01_bold.json</b>
    │           ├── sub-01_task-taskname_run-01_bold.nii
    │           ├── ...
    │           ├── <b>sub-01_task-taskname_run-xx_bold.json</b>
    │           └── sub-01_task-taskname_run-xx_bold.nii
    └── sourcedata
        └── sub-01
            ├── bh
            ├── dicom
            ├── dicom_anon
            ├── dicom_converted
            └── nifti
    </code></pre>

=== "Step 7"

    <pre><code>
    myproject
    ├── BIDS
    │   └── sub-01
    │       ├── anat
    │       └── func
    │           ├── sub-01_task-taskname_run-01_bold.json
    │           ├── sub-01_task-taskname_run-01_bold.nii
    │           ├── <b>sub-01_task-taskname_run-01_events.tsv</b>
    │           ├── ...
    │           ├── sub-01_task-taskname_run-xx_bold.json
    │           ├── sub-01_task-taskname_run-xx_bold.nii
    │           └── <b>sub-01_task-taskname_run-xx_events.tsv</b>
    ├── code
    └── sourcedata
        └── sub-01
            ├── bh
            ├── dicom
            ├── dicom_anon
            ├── dicom_converted
            └── nifti
    </code></pre>

=== "Step 8"

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
            ├── dicom_converted
            └── nifti
    </code></pre>

=== "Step 9"

    <pre><code>
    myproject
    ├── BIDS
    │   ├── <b>.bidsignore</b>
    │   ├── dataset_description.json
    │   ├── <b>derivatives</b>
    │   ├── events.json
    │   ├── participants.json
    │   ├── participants.tsv
    │   ├── sub-01
    │   │   ├── anat
    │   │   └── func
    │   └── task-taskname_bold.json
    └── sourcedata
        └── sub-01
            ├── bh
            ├── dicom
            ├── dicom_anon
            ├── dicom_converted
            └── nifti
    </code></pre>


1. Your first step is to organize your files in a `sourcedata` folder. Follow the structure outlined in [How to store raw data](./fmri-general.md#how-to-store-raw-data): have one main project folder (e.g. `myproject`), and a `sourcedata` folder in it.

2. Create the relevant sub-folders within the `sourcedata` folder: for each participant you collected data from, create a `sub-xx` folder (e.g. `sub-01`). Within the folder of each participant, create a `bh` (behaviour) and `nifti` (i.e. nifti, the format of the files collected from the scanner) folder. Also create a `dicom` folder if you collected dicom files for your participant.

3. Place the files you collected in this `sourcedata` structure: data collected from your experimental task goes into `bh` (e.g. `.mat` files and log files if you used the [fMRI task template](https://github.com/HOPLAB-LBP/fMRI-task-template)), data collected from the scanner itself goes in `nifti` or in `dicom` based on its format.

4. If you collected them, proceed to **anonymise** and **convert** your DICOM files. Create a `dicom_anon` and a `dicom_converted` folder. See below for more details on [how to anonimise and convert your dicom files](./fmri-bids-conversion.md#converting-dicom-files-optional).

5. Create a `BIDS` folder in your main project directory, alongside the `sourcedata` folder. For each participant, create a sub folder (e.g. `BIDS/sub-01`). In the BIDS folder of each participant, place a `func` folder for functional files and a `anat` folder for anatomical files. Copy-paste your functional `.nii` files from `sourcedata` to their corresponding `func` folder, renaming them if necessary to follow BIDS format (e.g. `sub-01_task-taskname_run-01_bold.nii`), and similarly copy-paste your structural `.nii` files to the `anat` folder, renaming them if necessary (e.g. `sub-01_T1w.nii`). See below for more details on [how to rename and move nifti files](./fmri-bids-conversion.md#renaming-and-moving-nifti-files).

6. Create `.json` sidecar files for each functional run `.nii` file, using the output from the dicom conversion step. If your scanner sequence was the same, your can re-use the same sidecar files across participants (see [Creating JSON Sidecar Files](./fmri-bids-conversion.md#creating-json-sidecar-files) below).

7. Create one `events.tsv` file for each function run `.nii` file, using the output from your experimental task. If you used the [fMRI task template](https://github.com/HOPLAB-LBP/fMRI-task-template)), output log files can be used to create event files quite easily. More info on events files can be found [here](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html):

8.  Create essential [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson):

    - `dataset_description.json`
    - `events.json`
    - `participants.tsv` and `participants.json`
    - `task-<taskname>_bold.json`

9. Set up additional components:

    - Create a `derivatives` folder for future outputs (e.g. `fmriprep` output)
    - *Optional*: Include a `.bidsignore` file if needed

By following these steps systematically, you'll ensure your data is properly organized in BIDS format, facilitating easier analysis and collaboration. Make sure all the steps have been followed successfully by validating your BIDS folder. To do so, use the **[BIDS validator](https://bids-standard.github.io/bids-validator/)**.


## Step-by-step instructions

Here we provide more detailed instructions to perform each of the steps mentioned above.

!!! warning "Folder Structure"
    All the steps and scripts below assume a specific folder structure and file naming convention. They **will not work** otherwise. Ensure you strictly follow the instructions in the [How to store raw data](./fmri-general.md#how-to-store-raw-data) page.

    **TODO:** [ANDREA] in the how to store raw data page, create a folders tree that includes all the relevant folders and subfolder. The current tree is not complete.
    
### Anonymize raw scanner data

#### Expected project structure

You need to make sure your DICOM / nifti file names **do not contain** subject identificative information, such as the subject's name. This is particularly relevant for our pipeline, because that's exactly what our scanner does. At the hospital, it is best to manually name your files when exporting them. You can also use [this small utility tool](../../../assets/code/anon_nii_filename.py), which renames files within a BIDS-like directory structure, specifically targeting files containing `_WIP_` in their names.

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

If you have collected DICOM files from the scanner, you need to 1. **anonymise**, and 2. **convert** them so that you can use them properly. There are several tools available that can take care of this. The [dicm2nii](https://github.com/xiangruili/dicm2nii/tree/master) GitHub repository is one such example. To use it, clone the repository, open MatLab, and follow these steps:

1. Navigate to your `sourcedata` folder.
2. Add the cloned `dicm2nii` folder to your path.
3. Use the `anonymize_dicm` script to anonymize the DICOM files. The command will look something like this:
```MatLab
anonymize_dicm('sub-xx/dicom', 'sub-xx/dicom_anon', 'sub-xx')
```
4. Use the `dicm2nii` script to convert the anonymized DICOM files to NIfTI.
```MatLab
dicm2nii('sub-xx/dicom_anon', 'sub-xx/dicom_converted', 'nii.gz')
```

These commands will have populated the `dicom_anon` and `dicom_converted` folders (see the folder trees in [BIDS Conversion Overview](./fmri-bids-conversion.md#bids-conversion-overview) for an example). The content of the latter can in turn be used to create json side car files (see [Creating JSON Sidecar Files](./fmri-bids-conversion.md#creating-json-sidecar-files)).

**TODO:** [ANDREA] add info about 1) example dcm2nii call, 2) why dcm2nii rather than dcm2nii**x**, 3) add additional info on DICOM (no enhanced, missing values, etc.). see also [this](https://github.com/rordenlab/dcm2niix/tree/3e02980597669ed8a9db073e824b4f74cccb597a/Philips) where Chris Rorden explains some practical issues with Phillips DICOMS, particularly the section on missing info (which we should probably link somewhere), and [this thread](https://www.nitrc.org/forum/forum.php?thread_id=15186&forum_id=4703), which explains issues with the enhanced DICOMs.

**TODO:** [TIM] Give information on how to use the anonymization and DICOM to nifti scripts, and what the results should be like. Give links to the scripts.

### Creating JSON Sidecar Files

Each `nii` file **must** have a sidecar JSON file. However, if your fMRI protocol did not change, all the important JSON fields are going to be the same across different scanning sessions, and therefore JSON files can be re-used across subjects. This will save you some time, since getting DICOM files from the scanner can be quite time-consuming.

- **If you collected DICOM files** for your participant, make sure you [anonymised and converted your DICOM files](./fmri-bids-conversion.md#converting-dicom-files-optional) and go through the following steps:

    1. Locate the JSON sidecar files in `sourcedata/sub-xx/dicom_converted/`.
    2. Open each JSON file and Complete the `PhaseEncodingDirection` and `SliceTiming` fields (see [Missing fields in JSON files](./fmri-general.md#missing-fields-in-json-files) for more information).
    3. Copy-paste the updated JSON files to accompany each NIfTI file in the `BIDS/sub-xx/func` folder: each run should have its accompanying `sub-xx_task-taskname_run-xx_bold.json` sidecar file.

- **If you did not collect DICOM files** for your participant, but collected DICOM files for a previous participant _and_ your fMRI protocol did not change in the meantime:
  
    1. Copy-paste all `.json` sidecar files from the `BIDS/sub-xx/func` folder of the participant you have DICOM files for, to the `BIDS/sub-xx/func` folder of new participant you only collect nifti files for. Rename each file with the correct `sub` value, ensuring there is one `.json` file per participant, per run, with the correct name.

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
