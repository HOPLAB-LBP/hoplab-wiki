# fMRI workflow example

This page is a work in progress and is based on my (Andrea) fMRI pipeline. This information may change once we agree on shared practices.

The code to reproduce these analyses can be found [here](https://github.com/costantinoai/chess-expertise-2024).

For information on how to set up the working environment, install, and configure the packages mentioned in this document, refer to [Set-up your fMRI environment](./fmri-setup-env.md) and [Coding practices](../../coding/index.md)

---

## From Raw Data to BIDS

### Collecting Raw Data

!!! note
    It is essential to ensure that no personal identifiers are present in any of the files that leave the hospital. Use my script for anonymizing filenames and data.

**At the hospital:**

- Take fMRI scans from the hospital computer. Specify which buttons to select in the GUI.
- Anonymize the filenames using my script to ensure subject privacy.
- Extract behavioral (bh) and eye-tracking (et) data from the output folders on the experiment PC.
- Copy all files into a `sourcedata/` folder organized with subfolders: `bh`, `nifti`, and `et`.

---

### Converting fMRI Data to BIDS

#### Step 1: Preparing for the First Subject

!!! info
    This step should only be performed for the first subject in your dataset. It can be skipped if anatomical and functional JSON templates are already available in `code/misc/`. See [this guide](./fmri-general.md#how-to-get-images-from-the-scanner) for more info on the template files.

1. **Convert DICOM to BIDS (NIfTI):**

    1. **Prerequisites:**
        - `dcm2nii`
        - Raw data should be organized as: `/sourcedata/sub-<xx>/dicom`
        - MATLAB

    2. Download `dicm2nii` from [dicm2nii](https://github.com/xiangruili/dicm2nii), unzip, and add to the MATLAB path.

    3. Open MATLAB and type `anonymize_dicm` in the console. Select the folder where the files are and the output folder: `/sourcedata/sub-<xx>/dicom_Anon`.

    4. Run `dicm2nii` in MATLAB. Select the DICOM folder and result folder (e.g., `dicom_converted`). Untick the compress box and ensure to save the JSON file.

    The output folder structure should be as follows:

    ```bash
    dicom_converted
    ├── sub-01
    │   ├── anat
    │   │   ├── sub-01_T1w.json
    │   │   └── sub-01_T1w.nii.gz
    │   ├── func
    │   │   ├── sub-01_task-exp_run-1_bold.json
    │   │   └── sub-01_task-exp_run-1_bold.nii.gz
    │   └── dcmHeaders.mat
    └── participants.tsv
    ```

    - Copy the `sub-01` folder from `dicom_converted` into the BIDS folder.

2. **Validate the BIDS Directory:**

    - Use the [BIDS Validator](https://bids-standard.github.io/bids-validator/) to check for any errors.

---

#### Step 2: Processing Subsequent Subjects

If the raw data is organized in a `sourcedata/sub-xx` folder, and JSON templates are already created:

- Anonymize/deface the images.
- Run `script01` to move and rename the raw files into the BIDS folder, creating a `sub-xx` folder for each subject.

---

### Converting Behavioral Data to BIDS

- Run `script02` to convert behavioral `.mat` data into `events.tsv` files following the BIDS specification. This will parse the trial data from the `.mat` file and create new `.tsv` files for each subject and run.

The fMRI task script should output two files per run:

1. `<timestamp>_log_<subID>-<run>-<buttonMapping>_<taskName>.tsv` : This is the human-readable log file produced by the task. Here is an extract from the file:

    | EVENT_TYPE | EVENT_NAME | DATETIME                | EXP_ONSET | ACTUAL_ONSET | DELTA      | EVENT_ID |
    |------------|------------|-------------------------|-----------|--------------|------------|----------|
    | START      | -          | 2024-05-03 10:49:43.099 | -         | 0            | -          | -        |
    | FLIP       | Instr      | 2024-05-03 10:50:11.399 | -         | 28.300201    | -          | -        |
    | RESP       | KeyPress   | 2024-05-03 10:50:34.160 | -         | 51.063114    | -          | 51       |
    | FLIP       | TgrWait    | 2024-05-03 10:50:34.216 | -         | 51.117046    | -          | -        |
    | PULSE      | Trigger    | 2024-05-03 10:50:40.000 | -         | 56.904357    | -          | 53       |

2. `<timestamp>_log_<subID>_<run>_<taskName>.mat`: This MATLAB file contains all the parameters to reproduce the experimental run, and stores input parameters and results.

Ensure that each resulting TSV file has at least three columns: `onset`, `duration`, and `trial_type`.

If the behavioural data is stored in a sourcedata/sub-xx/bh/ folder consistent to the one described [above](./fmri-general.md#how-to-store-raw-data), you can run the script02_behavioural-to-BIDS.m script, after editing the parameters at the top of the script. This script iterates through subject-specific directories targeting behavioral .mat files, then processes and exports trial-related info into BIDS-compliant TSV event files in the BIDS folder provided as parameters.

---

### Converting Eye-Tracking Data to BIDS

**Pre-requisite:** Install the EyeLink Developers Kit/API to convert EDF files into ASC files. Refer to the official setup guide:

- [EyeLink Developers Kit/API](https://www.sr-research.com/support/thread-13.html)

1. Run the eye-tracking (ET) conversion script to convert the data to ASC in BIDS format.

    !!! warning
        BEP020 has not been approved yet. Consider whether event messages should be included in the BIDS structure.

---

## Pre-processing fMRI Data in BIDS Format

### Quality Control with MRIQC

Use [MRIQC](https://mriqc.readthedocs.io/en/latest/) to perform quality control checks on your fMRI data:

```sh linenums="1" title="mriqc_batch.sh"
#!/bin/bash
for i in {0..40}; do
    if [ $i -eq 0 ] || [ $i -eq 5 ] || [ $i -eq 14 ] || [ $i -eq 31 ]; then
        continue
    fi
    subID=$(printf "sub-%02d" $i)
    echo "Processing $subID"
    docker run -it --rm \
        -v /data/BIDS:/data:ro \
        -v /data/BIDS/derivatives/mriqc:/out \
        -v /temp_mriqc:/scratch \
        nipreps/mriqc:latest /data /out participant \
        --participant-label ${subID} \
        --nprocs 16 --mem-gb 40 --float32 \
        --work-dir /scratch \
        --verbose-reports --resource-monitor -vv
    sleep 0.5
done

echo "Running group analysis"
docker run -it --rm \
    -v /data/BIDS:/data:ro \
    -v /data/BIDS/derivatives/mriqc:/out \
    -v /temp_mriqc:/scratch \
    nipreps/mriqc:latest /data /out group \
    --nprocs 16 --mem-gb 40 --float32 \
    --work-dir /scratch \
    --verbose-reports --resource-monitor -vv

sleep 0.5

echo "Running classifier"
docker run \
    -v /temp_mriqc:/scratch \
    -v /data/BIDS/derivatives/mriqc:/resdir \
    -w /scratch --entrypoint=mriqc_clf poldracklab/mriqc:latest \
    --load-classifier -X /resdir/group_T1w.tsv
```

!!! warning
    JSON files may include `NaN` values that are incompatible with MRIQC. Use `./utils/sanitize_json.py` to fix this issue before running MRIQC.

---

### Minimal Preprocessing with fMRIprep

With your BIDS data organized, the next step is preprocessing using [fMRIprep](https://fmriprep.org/en/stable/):

- Install Docker (and WSL if on Windows) and configure it for use with fMRIprep.
- Install `fmriprep-docker` with `pip install fmriprep-docker`.
- Ensure Docker has access to the folders you will be using (e.g., BIDS folder, temporary work directory).

To run `fmriprep` for a single subject, use the following command:

```sh
fmriprep-docker /data/projects/chess/data/BIDS /data/projects/chess/data/BIDS/derivatives/fmriprep participant \
    --work-dir //data/projects/chess/data/temp_fmriprep --mem-mb 10000 --n-cpus 16 \
    --output-spaces MNI152NLin2009cAsym:res-2 anat fsnative \
    --fs-license-file /data/projects/chess/misc/.license \
    --bold2t1w-dof 9 --task exp --dummy-scans 0 \
    --fs-subjects-dir /data/projects/chess/data/BIDS/derivatives/fastsurfer \
    --notrack --participant-label 41
```

??? tip "Use CIFTI output for surface data"
    If you plan to run analysis on **surface data**, consider using **CIFTI output images** from fMRIPrep. While this approach hasn't been directly tested here, CIFTI outputs can provide several advantages:

    - **Surface analysis in SPM** (see [this](https://neurostars.org/t/analyzing-func-gii-files-with-spm12/852/2) conversation on Neurostars).
    - **CIFTI images** include cortical BOLD time series projected onto the surface using templates like the **Glasser2016 parcellation** (which is also used for MVPA).
    - This method allows for direct analysis of surface data in formats like `.gii`, which can be compatible with **SPM** for further analysis.
    - Using CIFTI outputs could simplify the process of obtaining **surface-based parcellations** and make the data more directly usable in subject space, potentially eliminating the need for complex and time-consuming transformations.
    - It may also provide a **more accurate representation of cortical activity** by avoiding interpolation errors that can occur when mapping from volume to surface space.

    If you decide to explore this option, make sure to include the cifti falg in `--output-spaces` when running `fmriprep-docker`. This setup will produce CIFTI files (`.dtseries.nii`) along with standard volumetric outputs, giving you flexibility in how you proceed with your analysis.

??? warning "Allocating resources to fMRIprep"
    **Running fMRIPrep is resource and time intensive**, especially with high-resolution data. Here are some practical tips to optimize the process:

    - **Time Estimate**: Processing a single subject can take between **4-8 hours** depending on your system's specifications (e.g., CPU, RAM). Plan accordingly if you have many subjects.
    - **Optimize Resource Allocation**: Adjust the `--n-cpus` and `--mem-mb` arguments to make the best use of your available hardware:
        - **n-cpus**: Allocate about 70-80% of your CPU cores to avoid system slowdowns (e.g., `--n-cpus 12` on a 16-core system).
        - **mem-mb**: Use around **80-90% of your total RAM**, leaving some free for the operating system (e.g., `--mem-mb 32000` on a 40 GB system).

    - **Monitor Resource Usage**: While running fMRIPrep, open a system monitor like **Task Manager** (Windows), **Activity Monitor** (Mac), or **htop** (Linux) to observe CPU and memory usage:
        - Aim for **high CPU usage** (close to maximum) and **RAM usage** that is slightly below your system’s capacity.
        - If memory usage exceeds available RAM, the process might crash due to **Out of Memory (OOM)** errors or cause **disk space issues** if using a `--work-dir` that fills up.

    - **Adjust Settings if Necessary**: If you encounter OOM errors or the process is slower than expected:
        - **Lower `--mem-mb`**: Decrease memory allocation incrementally (e.g., by 2-4 GB at a time).
        - **Reduce `--n-cpus`**: Using fewer cores can help balance the load and prevent crashes.
        - **Use a dedicated `--work-dir`**: Specify a work directory on a **high-speed SSD** or similar to reduce I/O bottlenecks and ensure there's enough disk space for temporary files.
    
If the run finishes successfully (check the last line of your terminal output), you should have a new `BIDS/derivatives/fmriprep/sub-xx` folder. See [here](https://fmriprep.org/en/stable/outputs.html) for a complete list of outputs generated by fMRIPrep. Make sure that inside your `anat` and `func` folders you have all the scans (anatomical and functional for all runs) in the specified spaces. Since we specified `fsnative` as a space and did not use the `--no-recon-all` flag, fMRIPrep will also produce surface data in `BIDS/derivatives/fastsurfer/sub-xx`.

---

### Interpreting fMRIPrep Visual Reports

Check the `sub-xx.html` report to ensure everything ran smoothly. Pay particular attention to:

- **Registrations**: Verify the alignment between functional and anatomical images.
- **Framewise Displacement (FD) Values**: Look for runs with unusually high FD values, as these may indicate motion artifacts or poor data quality.

For more details, refer to the general guidelines outlined [here](fmri-prepocessing-qa.md#interpreting-fmriprep-and-mriqc-reports), and to the following links:

- [fMRIPrep Output Confounds](https://fmriprep.org/en/stable/outputs.html#confounds)
- [Video on Reviewing fMRIPrep Outputs](https://www.youtube.com/watch?v=fQHEKSzFKDc&list=PLIQIswOrUH6_szyxn9Fy-2cxd3vjlklde&index=3)

---

## Processing Eye-Tracking Data with `bidsmreye`

To process eye-tracking data using `bidsmreye`, run the following Docker command:

```sh
docker run -it --rm \
    -v /data/projects/chess/data/BIDS/derivatives/fmriprep:/data \
    -v /data/projects/chess/temp_bidsmreye:/out \
    cpplab/bidsmreye:0.5.0 \
    /data /out participant all \
    --space T1w \
    --reset_database \
    --verbose
```

!!! note
    In my experience, `bidsmreye` worked only when using the `T1w` fMRIPrep output space.

---

## First-Level Analysis – General Linear Model (GLM)

After preprocessing, proceed to the first-level analysis with the GLM. Running the GLM and setting contrasts is straightforward using `script03`. Make sure to adjust the following parameters:

- **Paths**:
  - `fmriprepRoot`: Path to the fMRIPrep folder.
  - `BIDSRoot`: Path to your BIDS folder.
  - `outRoot`: Path to save GLM results (ideally in the derivatives folder, in a `fmriprep-spm` folder).
  - `tempDir`: Directory for temporary files, such as uncompressed or smoothed files.

- **Subject Selection**:

    Leave a new line before listing subjects.

  - `selectedSubjectsList`: A list of integers like `[41, 42, 43, 44]` or use `'*'` to analyze all subjects.
  - `selectedRuns`: List of runs to analyze.

- **Contrasts Setup**:

    ```matlab
    selectedTasks(1).name = 'exp';  % The name of the task. Must match the task name in your BIDS filenames.
    selectedTasks(1).contrasts = {'Check > No-Check'};  % Name of the contrast.
    selectedTasks(1).weights(1) = struct('C_WILDCARD___WILDCARD_', 1, 'NC_WILDCARD___WILDCARD_', -1);  % Weights for each regressor.
    selectedTasks(1).smoothBool = false;  % Whether to smooth images before GLM. Useful for localizers.
    ```

If everything is configured correctly, the script will generate new `sub-xx` folders in your output directory. These folders will contain subdirectories for each analysis task, with `beta_000x.nii` files for each regressor (including confounds and conditions).

---

### Verifying the Design Matrix

It is advisable to verify that the design matrix is set up correctly:

1. Open the SPM GUI by typing `spm fmri` in the MATLAB Command Window.
2. Click on **Results** and select the `SPM.mat` file located in your `BIDS/fmriprep-spm/{space}/sub-xx/{task_name}/` directory.
3. This will open the SPM Contrast Manager, showing the design matrix and assigned contrasts. Ensure the following:
    - No overlapping or unusually long conditions.
    - The correct number of runs.
    - Confound regressors are positioned at the end of each run.
    - Contrast weights are assigned correctly.

4. Select your contrast and click **Done**.
5. In the next window, set the following options:
    - **Apply masking**: None
    - **P-value adjustment**: None
    - **Threshold**: `0.001`
    - **Extent threshold**: `0`

This will display the results of the contrast (thresholded t-map) on the top right, along with a list of significantly active clusters in the bottom right panel.

---

### Visualizing Activations

To visualize activations on a volume or surface:

1. Click **Display** -> **overlays...** in the SPM GUI.
2. Select **sections** for volume plotting or **render** for surface plotting.
3. Choose the subject's anatomical image from `BIDS/derivatives/fmriprep/sub-xx/anat`.
    - For volume plots, select the `.nii` file corresponding to the same space as your GLM (usually MNI).
    - For surface plots, select the pial or inflated brain image.

!!! warning
    SPM cannot read `.nii.gz` files directly, so you must decompress them into `.nii` files. This can be done with any decompression tool by right-clicking on the file in your file explorer. Once decompressed, use the SPM GUI to select the `.nii` file.

---

## Generating and Organizing Regions of Interest (ROIs)

### ROIs from Functional Localizers

To run MVPA, you need Regions of Interest (ROIs) to select your voxels. You can obtain ROIs through:

- **Functional Localizers**: Perform a localizer task in the scanner, then run a GLM on the preprocessed and smoothed data. For example, `Faces > Objects` to identify the **FFA**.
- **Pre-defined Anatomical Masks**: Use anatomical masks in the same space as your subjects (e.g., MNI). Ensure the mask resolution matches the resolution of your data (e.g., resample/reslice if necessary using tools like **ANTs**, **SPM**, or Python libraries like **nilearn** or **nibabel**).

---

### HCP Glasser Parcellation

In my pipeline, I use the [Glasser2016 parcellation projected on `fsaverage`](https://figshare.com/articles/dataset/HCP-MMP1_0_projected_on_fsaverage/3498446), which includes 180 ROIs per hemisphere. This process involves converting Glasser parcellation annotation files to labels and mapping them from `fsaverage` to the subject's T1 and MNI spaces. Use the `HPC-to-subject.sh` script for automation (see the top of the script file for usage notes).

---

## Multi-Variate Pattern Analysis (MVPA)

### Running Decoding with SVM

After organizing your ROIs, proceed with the MVPA analysis:

- Use `script04` to perform independent cross-validated SVM classification on each subject and ROI.
- The script outputs decoding accuracy for each ROI of the HCP parcellation.

The results are saved in a `BIDS/derivatives/mvpa` folder organized according to the BIDS structure. Each subject's folder will contain a `.tsv` file with the decoding accuracy results.

---

### Plotting and Reporting

The Glasser parcellation includes parcels at three levels, with each higher level grouping several ROIs into a single ROI. In my pipeline, the analysis is performed at the lowest level (180 parcels per hemisphere), then averaged across ROIs within a larger ROI using `script06`.

- The script computes the significance of each decoding accuracy against chance.
- It generates plots of significant accuracies on an inflated brain for each grouping level.

For example:

![Decoding Example](https://raw.githubusercontent.com/HOPLAB-LBP/hoplab-wiki/main/docs/assets/combined_brain_grid.png)

---

**TODO:** Add links to folder structure and/or data.
**TODO:** Add information about defacing/anonymizing raw data (including filenames) using my script.
**TODO:** Improve and add details for the parameters required in the `script02_behavioural-to-BIDS.m`.
**TODO:** Wrap NIfTI and behavioral data to BIDS conversion into a single script that accepts input arguments.
**TODO:** Provide more details on how behavioral files are saved and on the BIDS structure.
**TODO:** Include references to other commonly used atlases for ROI generation.
**TODO:** Explain how to save and run the `mriqc` commands.
**TODO:** Refine the phrasing and add more info on the parameters for GLM and contrasts setup.
**TODO:** Possibly include screenshots for better clarity (e.g., code sections).
