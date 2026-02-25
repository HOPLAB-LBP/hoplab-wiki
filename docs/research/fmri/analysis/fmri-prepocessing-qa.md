# fMRI Preprocessing and Quality Assessment

You should land on this page after having collected your (f)MRI data and [converted it to BIDS](./fmri-bids-conversion.md).

## Preprocessing & Quality Assessment Overview

In this page, you will learn how to preprocess fMRI data using [fMRIPrep](https://fmriprep.org/en/stable/) and perform quality assessment with [MRIQC](https://mriqc.readthedocs.io/en/stable/). We will cover:

<div class="grid cards" markdown="1">

- :material-cogs: **[Running fMRIPrep](#preprocessing-with-fmriprep)**  
  Step-by-step guide to run fMRIPrep, including the required command structure, key options, and output directory organization.

- :material-chart-bell-curve: **[Performing Quality Control with MRIQC](#quality-assessment-with-mriqc)**  
  Use MRIQC to assess the quality of your MRI data. Identify potential artifacts and ensure data suitability for further analysis.

- :material-file-eye: **[Interpreting fMRIPrep Outputs](#fmriprep-html-report)**  
  Understand the content of the fMRIPrep HTML report, including motion parameters, anatomical alignment, and other key quality checks.

- :material-chart-bar: **[Reviewing MRIQC Reports](#mriqc-html-report)**  
  Learn how to interpret MRIQC's visual reports and quality metrics, such as SNR and temporal SNR, to evaluate the data's integrity.

- :material-alert: **[Troubleshooting Common Issues](#common-issues-with-fmriprep-and-mriqc)**  
  Find solutions to common challenges with fMRIPrep and MRIQC, including memory management and output interpretation.

- :material-playlist-check: **[Next Steps: GLM Analysis](./fmri-glm.md)**  
  Once your data is preprocessed and quality-checked, move on to first-level analysis with the General Linear Model.

</div>

- **[fMRIPrep Documentation](https://fmriprep.org/en/stable/)**  
  Get detailed insights into the preprocessing steps, output formats, and recommended practices.

- **[MRIQC Documentation](https://mriqc.readthedocs.io/en/stable/)**  
  Explore MRIQC's metrics and recommendations for improving MRI data quality.

- **[NeuroStars Community](https://neurostars.org/tags/fmriprep)**  
  A valuable resource for troubleshooting and community discussions related to fMRIPrep and MRIQC.

- **[YouTube: Reviewing fMRIPrep Outputs](https://www.youtube.com/watch?v=fQHEKSzFKDc)**

!!! tip
    Before proceeding, ensure that your fMRI data is converted into **BIDS format**. Refer to the [BIDS Conversion Guide](./fmri-bids-conversion.md) for more details.

---

## Preprocessing with fMRIPrep

### 1. Setting Up fMRIPrep

To use fMRIPrep, ensure that you have:

- **Docker** (or **Singularity** for HPC environments).
- Installed the `fmriprep-docker` wrapper for easier command-line usage:
  
  ```sh
  pip install fmriprep-docker
  ```

- A valid **FreeSurfer license** (`license.txt`) saved in a path accessible by fMRIPrep. This is needed for surface-based preprocessing.

!!! note "System Requirements"
    fMRIPrep is resource-intensive. For optimal performance, allocate:

    - At least **16 GB RAM** and **4 CPUs**.
    - A **high-speed SSD** for the working directory to improve I/O performance.

For detailed instructions, visit the [fMRIPrep Installation Guide](https://fmriprep.org/en/stable/installation.html).

---

### 2. Running fMRIPrep

Once your environment is ready, you can run fMRIPrep using the following command:

```sh
fmriprep-docker /path/to/BIDS /path/to/derivatives/fmriprep participant \
    --work-dir /path/to/temp_fmriprep \
    --fs-license-file /path/to/.license \
    --output-spaces MNI152NLin2009cAsym:res-2 anat fsnative \
    --participant-label <SUBJECT_ID> \
    --n-cpus 8 --mem-mb 16000 --notrack
```

Replace:

- `/path/to/BIDS` with the path to your BIDS directory.
- `/path/to/derivatives/fmriprep` with where you want to store fMRIPrep outputs.
- `<SUBJECT_ID>` with the ID of the subject being processed.

??? question "Why specify output spaces?"
    `--output-spaces` defines the spaces in which your data will be resampled. Common options include:

    - **MNI152NLin2009cAsym**: Standard volumetric template.
    - **anat**: Subject’s native T1w space.
    - **fsnative**: FreeSurfer’s subject-specific surface space.

??? tip "Use CIFTI output for surface data"
    If you plan to run analysis on **surface data**, consider using **CIFTI output images** from fMRIPrep. While this approach hasn’t been directly tested here, CIFTI outputs can provide several advantages:

    - **Surface analysis in SPM** (see [this](https://neurostars.org/t/analyzing-func-gii-files-with-spm12/852/2) conversation on Neurostars).
    - **CIFTI images** include cortical BOLD time series projected onto the surface using templates like the **Glasser2016 parcellation** (which is also used for MVPA).
    - This method allows for direct analysis of surface data in formats like `.gii`, which can be compatible with **SPM** for further analysis.
    - Using CIFTI outputs could simplify the process of obtaining **surface-based parcellations** and make the data more directly usable in subject space, potentially eliminating the need for complex and time-consuming transformations.
    - It may also provide a **more accurate representation of cortical activity** by avoiding interpolation errors that can occur when mapping from volume to surface space.

    If you decide to explore this option, make sure to include the cifti flag in `--output-spaces` when running `fmriprep-docker`. This setup will produce CIFTI files (`.dtseries.nii`) along with standard volumetric outputs, giving you flexibility in how you proceed with your analysis.

??? warning "Allocating resources to fMRIPrep"
    **Running fMRIPrep is resource and time intensive**, especially with high-resolution data. Here are some practical tips to optimize the process:

    - **Time Estimate**: Processing a single subject can take between **4-8 hours** depending on your system’s specifications (e.g., CPU, RAM). Plan accordingly if you have many subjects.
    - **Optimize Resource Allocation**: Adjust the `--n-cpus` and `--mem-mb` arguments to make the best use of your available hardware:
        - **n-cpus**: Allocate about 70-80% of your CPU cores to avoid system slowdowns (e.g., `--n-cpus 12` on a 16-core system).
        - **mem-mb**: Use around **80-90% of your total RAM**, leaving some free for the operating system (e.g., `--mem-mb 32000` on a 40 GB system).

    - **Monitor Resource Usage**: While running fMRIPrep, open a system monitor like **Task Manager** (Windows), **Activity Monitor** (Mac), or **htop** (Linux) to observe CPU and memory usage:
        - Aim for **high CPU usage** (close to maximum) and **RAM usage** that is slightly below your system’s capacity.
        - If memory usage exceeds available RAM, the process might crash due to **Out of Memory (OOM)** errors or cause **disk space issues** if using a `--work-dir` that fills up.

    - **Adjust Settings if Necessary**: If you encounter OOM errors or the process is slower than expected:
        - **Lower `--mem-mb`**: Decrease memory allocation incrementally (e.g., by 2-4 GB at a time).
        - **Reduce `--n-cpus`**: Using fewer cores can help balance the load and prevent crashes.
        - **Use a dedicated `--work-dir`**: Specify a work directory on a **high-speed SSD** or similar to reduce I/O bottlenecks and ensure there’s enough disk space for temporary files.

### 3. Output Structure and Files

After running fMRIPrep, the output will be in the `derivatives/fmriprep` folder. This includes:

- **Preprocessed anatomical images** (`T1w`, `T2w`).
- **Preprocessed functional images** (BOLD series).
- **Confounds**: `.tsv` files containing motion parameters and other potential noise regressors.
- **Reports**: `sub-xx.html` files with a summary of the preprocessing.

Refer to the [fMRIPrep Output Documentation](https://fmriprep.org/en/stable/outputs.html) for more information.

---

## Quality Assessment with MRIQC

### 1. Running MRIQC

MRIQC helps identify potential issues in your data by generating quality metrics. Run MRIQC using Docker with the following command:

```sh
docker run -it --rm \
    -v /path/to/BIDS:/data:ro \
    -v /path/to/derivatives/mriqc:/out \
    nipreps/mriqc:latest /data /out participant \
    --participant-label <SUBJECT_ID> --nprocs 8 --mem-gb 16 --verbose-reports
```

This command will analyze individual subjects and save the results in the specified output directory. Replace the paths as appropriate.

!!! tip "Running Group-Level Analysis"
    After processing individual subjects, you can run a group-level analysis to compare metrics across subjects:

    ```sh
    docker run -it --rm \
        -v /path/to/BIDS:/data:ro \
        -v /path/to/derivatives/mriqc:/out \
        nipreps/mriqc:latest /data /out group \
        --nprocs 8 --mem-gb 16 --verbose-reports
    ```

??? example "MRIQC batch script with subject exclusion, group analysis, and classifier"
    The following script runs MRIQC for multiple subjects (skipping excluded ones), then runs group-level analysis and the MRIQC classifier:

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

    Adapt the subject range, exclusion list, paths, and resource parameters (`--nprocs`, `--mem-gb`) to match your dataset and system.

    !!! warning
        JSON files may include `NaN` values that are incompatible with MRIQC. Use a sanitization script (e.g., `sanitize_json.py`) to fix this issue before running MRIQC.

### 2. Understanding MRIQC Outputs

MRIQC generates:

- **Visual reports** (`sub-xx.html`) for each subject.
- **CSV files** with quality metrics.
- **Group-level metrics** for overall dataset quality.

Refer to the [MRIQC Documentation](https://mriqc.readthedocs.io/en/stable/) for a detailed explanation of each metric.

---

## Processing Eye-Tracking Data with bidsmreye

[bidsmreye](https://bidsmreye.readthedocs.io/) is a tool that can extract eye-tracking information from the eye region of fMRI images using a deep learning model. It operates on fMRIPrep outputs and follows the BIDS convention.

To process eye-tracking data using `bidsmreye`, run the following Docker command:

```sh
docker run -it --rm \
    -v /path/to/BIDS/derivatives/fmriprep:/data \
    -v /path/to/temp_bidsmreye:/out \
    cpplab/bidsmreye:0.5.0 \
    /data /out participant all \
    --space T1w \
    --reset_database \
    --verbose
```

Replace the paths as appropriate for your dataset.

!!! note
    In practice, `bidsmreye` has been found to work reliably only when using the `T1w` fMRIPrep output space.

### Output structure

bidsmreye saves its outputs following the [BIDS derivatives](https://bids-specification.readthedocs.io/en/stable/derivatives/introduction.html) convention. After running the `all` (or `generalize` + `qc`) steps, you will find:

```
derivatives/bidsmreye/
├── dataset_description.json
├── group_eyetrack.tsv                         # group-level QC summary
└── sub-01/
    └── ses-01/
        └── func/
            ├── sub-01_ses-01_task-<task>_desc-<model>_eyetrack.tsv    # gaze time series
            ├── sub-01_ses-01_task-<task>_desc-<model>_eyetrack.json   # sidecar metadata + QC
            └── sub-01_ses-01_task-<task>_desc-<model>_eyetrack.html   # interactive QC plot
```

The `desc-<model>` entity identifies the pre-trained deepMReye model used (default: `1to6`).

### Gaze time series (TSV columns)

The per-run `_eyetrack.tsv` file contains one row per fMRI volume with the following columns:

| Column | Description |
|--------|-------------|
| `timestamp` | Time in seconds corresponding to each volume |
| `x_coordinate` | Predicted horizontal gaze position (degrees) |
| `y_coordinate` | Predicted vertical gaze position (degrees) |
| `displacement` | Framewise gaze displacement between consecutive volumes (degrees), computed as $\sqrt{\Delta x^2 + \Delta y^2}$ |
| `displacement_outliers` | Binary flag (`0`/`1`) marking displacement outliers (Carling's k method) |
| `x_outliers` | Binary flag for x-coordinate outliers |
| `y_outliers` | Binary flag for y-coordinate outliers |

The gaze coordinates are reported in degrees of visual angle relative to the screen center (`EnvironmentCoordinates: center`), and represent the `cyclopean` (i.e., combined binocular) eye estimate.

### Per-run sidecar JSON

The JSON sidecar for each run contains:

- **`SamplingFrequency`**: Sampling rate in Hz (inherited from the BOLD repetition time)
- **`NbDisplacementOutliers`**, **`NbXOutliers`**, **`NbYOutliers`**: Number of outlier timepoints detected for each metric
- **`XVar`**, **`YVar`**: Variance of x and y gaze position across the run

These metrics give a quick per-run summary of data quality and fixation stability.

### Group-level QC summary

The `group_eyetrack.tsv` file at the dataset root aggregates per-run QC metrics across all subjects:

| Column | Description |
|--------|-------------|
| `subject` | Subject label |
| `filename` | Per-run sidecar JSON filename |
| `NbDisplacementOutliers` | Number of displacement outlier volumes |
| `NbXOutliers` / `NbYOutliers` | Number of x / y outlier volumes |
| `XVar` / `YVar` | Gaze position variance for x / y |

Use this table to identify runs or subjects with unusually high gaze variance or many outlier timepoints, which may indicate poor fixation compliance or noisy data.

### Using bidsmreye outputs in downstream analyses

The gaze position and displacement columns can be used in two main ways:

1. **As confound regressors in your GLM**: Include `x_coordinate`, `y_coordinate`, and/or `displacement` as additional nuisance regressors alongside motion parameters. This helps remove variance related to systematic eye movements.

2. **For quality control and participant exclusion**: Use the outlier columns and the group summary to flag runs with excessive eye movement. For example, you might exclude runs where the number of displacement outliers exceeds a set threshold.

To load the gaze data in Python:

```python
import pandas as pd

gaze = pd.read_csv(
    "derivatives/bidsmreye/sub-01/ses-01/func/"
    "sub-01_ses-01_task-rest_desc-1to6_eyetrack.tsv",
    sep="\t",
)

# Extract columns for use as GLM confound regressors
confounds = gaze[["x_coordinate", "y_coordinate", "displacement"]]
```

!!! tip
    The interactive HTML report (`_eyetrack.html`) generated for each run provides a quick visual check of the gaze traces and outlier detection. Open it in your browser to inspect individual runs before proceeding with group analysis.

---

## Interpreting fMRIPrep and MRIQC Reports

### fMRIPrep HTML Report

After running fMRIPrep, the outputs will be stored in the `derivatives/fmriprep` directory, with each subject's data organized into subfolders like `sub-01`. These folders contain both the preprocessed functional and anatomical data, alongside JSON files with metadata.

 Each subject’s report (`sub-xx.html`) includes:

- **Registration Plots**: Check the alignment of functional and anatomical images.
- **Field Map Corrections**: Review the effect of susceptibility distortion corrections.
- **Motion Correction**: Look for high motion frames using **Framewise Displacement (FD)** plots.

??? note "What is Framewise Displacement (FD)?"
    FD is a measure of head movement between frames. High FD values indicate potential motion artifacts.

Let’s walk through the key components of the output and how to interpret the HTML summary reports.

#### 1. Output Directory Structure

Within each subject's directory (`sub-01`):

- **`anat/` folder**: Contains anatomical images, including normalized versions (e.g., `MNI152` template) and images in native space.
- **`func/` folder**: Contains functional data for each run, including:
  - **Confound Regressors** (`.tsv`): Time series of noise estimates like white matter and cerebrospinal fluid (CSF).
  - **Preprocessed Functional Images**: Aligned to templates like `MNI152`.
  - **Brain Masks**: Estimated masks for the brain, used in further analyses.

These files will be referenced in the HTML summary report, which provides an overview of the preprocessing steps and quality metrics.

#### 2. Opening the HTML Summary Report

To view the HTML report, navigate to `derivatives/fmriprep/sub-01/` and open `sub-01.html` by double-clicking it or using the terminal:

The report contains the following sections: **Summary**, **Anatomical**, **Functional**, **About**, **Methods**, and **Errors**. Use the tabs at the top of the report to navigate these sections.

#### 3. Understanding the Summary Section

The **Summary** tab includes:

- **Number of Structural and Functional Images**: Lists the number of anatomical and functional images processed.
- **Normalization Template**: Shows the template used for alignment (e.g., `MNI152NLin2009cAsym`).
- **FreeSurfer**: Indicates whether surface-based preprocessing was performed.

Make sure these details match the parameters specified in your fMRIPrep command.

#### 4. Anatomical Quality Checks

The **Anatomical** section provides:

- **Brain Mask Overlay**: Displays the brain mask (red outline), gray matter (magenta), and white matter boundaries (blue) overlaid on the anatomical image in sagittal, axial, and coronal views.

![Trigger box](../../../assets/fmriprep-report-brainmaskoverlay.png)

- **Normalization Check**: A GIF compares the subject’s anatomical image with the MNI template. Ensure that:

  - The outlines of the brain and internal structures (e.g., ventricles) align well.
  - Any misalignment could indicate poor normalization, which may need further inspection.
  
![Trigger box](../../../assets/fmriprep-report-normalization.png)

!!! tip
    **Hover over the GIF** to see the back-and-forth comparison between the subject's brain and the template. Look closely at the alignment of internal brain structures.

- **Surface Reconstruction** if you ran the `recon-all` routine in fMRIprep

![Trigger box](../../../assets/fmriprep-report-surfacerecon.png)

#### 5. Functional Quality Checks

In the **Functional** section, you’ll find:

- **Functional-to-Anatomical Alignment**: A GIF shows how well the preprocessed functional images align with the anatomical image.

!!! tip "Check for alignment"
    Check for alignment between internal structures like ventricles in the functional and anatomical images. Open the image in a new tab (Right Click on the image -> Open in a new tab) and hover to see the dynamic image.

![Trigger box](../../../assets/fmriprep-report-coreg.svg)

- **CompCor Masks**: Displays masks used for **Anatomical Component Correction (aCompCor)**:
  - **White Matter and CSF (Magenta)**: Masks used to extract noise components.
  - **High-Variance Voxels (Blue)**: Used for **Functional Component Correction (fCompCor)**.

!!! note "Assessing Alignment"
    Good alignment between functional and anatomical images is crucial for accurate analysis. Pay special attention to lighter fluid-filled regions in the functional image, which should correspond with dark CSF areas in the anatomical image.

#### 6. BOLD Summary and Carpet plot

The report includes **time series plots** for various confounds:

- **Global Signal (GS)**: Measures signal fluctuations across the entire brain.
- **CSF Signal (GSCSF)** and **White Matter Signal**: Represent fluctuations in specific tissue types.
- **Motion Metrics (DVARS, Framewise Displacement)**:
  - **DVARS**: Shows changes in BOLD signal intensity from one time point to the next.
  - **Framewise Displacement (FD)**: Tracks the amount of head movement between frames.
  - **Use DVARS and FD** to identify frames with high motion that could affect data quality.

!!! tip
    High motion values often correlate with changes in global signal. Consider including these regressors in your GLM to account for motion-related noise.

The **carpet plot** displays time series of BOLD signals across different brain regions:

- **Cortex** (blue), **Subcortex** (orange), **Gray Matter** (green), and **White Matter/CSF** (red).
- Look for **sudden changes across a column**, which may indicate motion artifacts affecting the entire brain at a particular time point.

![Trigger box](../../../assets/fmriprep-report-boldsummary.png)

#### 7. Correlation Matrix of Confound Regressors

The report also includes a **correlation matrix** showing relationships between confound regressors:

- High correlations between **CSF** and **motion regressors** may indicate that motion affects CSF signals.
- Use this matrix to decide which regressors to include in your GLM for better noise correction.

!!! note "High Correlations"
    High correlation values may suggest redundancy among some regressors. Consider removing or combining them to avoid overfitting when building your GLM.

![Trigger box](../../../assets/fmriprep-report-confoundscorr.png)

#### 8. Making Decisions for Further Analysis

After reviewing the report:

- **Identify Good Quality Runs**: Look for well-aligned images and minimal motion artifacts.
- **Decide on Regressors**: Choose confounds like **DVARS**, **FD**, and **CompCor** components to include in your GLM.

!!! question "What confound regressors should I use in my GLM?"
    A common choice is to include at least the 6 Head Motion parameters, and optionally FD and Global Signal ad nuisance regressors in your GLM.  

    See [this awesome NeuroStars conversation](https://neurostars.org/t/confounds-from-fmriprep-which-one-would-you-use-for-glm/326/45) with advice on choosing regressors and relevant resources.

For more details on interpreting fMRIPrep reports, see the [fMRIPrep Outputs Documentation](https://fmriprep.org/en/stable/outputs.html) and discussions on [NeuroStars](https://neurostars.org/tags/fmriprep).

---

### MRIQC HTML Report

The MRIQC report highlights:

- **Summary Image**: A visual overview of key metrics, including **signal-to-noise ratio (SNR)** and **temporal SNR (tSNR)**.
- **Detailed Metrics**: Click through different tabs to examine metrics like **Mean Framewise Displacement**, **EPI-to-T1w registration quality**, and **artifact presence**.

!!! info "Interpreting tSNR"
    Higher **temporal SNR (tSNR)** values indicate better data quality. Typical values range from 30-60 for fMRI. Low tSNR may suggest issues like excessive noise or scanner artifacts. Review the group-level metrics to identify subjects with unusually high motion or low tSNR.

For more information on understanding these metrics, check out the [MRIQC interpretation guide on NeuroStars](https://neurostars.org/t/how-to-interpret-mriqc-metrics/).

---

## Common Issues with fMRIPrep and MRIQC

??? failure "Memory Errors: Out of Memory (OOM) or Crash"
    - **Problem**: fMRIPrep crashes or terminates unexpectedly due to insufficient memory.
    - **Solution**: Reduce the `--mem-mb` parameter to allocate less memory or increase the swap space available on your system. This can help prevent OOM errors.
    - **Tip**: Monitor your memory usage during processing using tools like `htop` (Linux) or **Activity Monitor** (Mac). Aim to use around 80-90% of your available RAM without exceeding it.

??? failure "Docker File Permissions Error"
    - **Problem**: fMRIPrep cannot access input or output directories due to file permissions.
    - **Solution**: Ensure that Docker has read and write permissions to the directories being mounted. Adjust permissions using:
      ```sh
      chmod -R 755 /path/to/BIDS /path/to/derivatives
      ```
    - **Tip**: On Windows, ensure that **Shared Drives** are enabled in Docker Desktop settings.

??? failure "Missing Fields in JSON Files"
    - **Problem**: fMRIPrep fails due to missing `SliceTiming` or `PhaseEncodingDirection` fields in the JSON sidecar files.
    - **Solution**: Verify that all required metadata fields are present using the [BIDS Validator](https://bids-standard.github.io/bids-validator/). For guidance on JSON sidecar fields, see the [BIDS Specification](https://bids-specification.readthedocs.io/en/stable/).
    - **Tip**: If using custom acquisition parameters, manually edit JSON files to include the missing fields.

??? failure "RuntimeError: Fieldmap Issues"
    - **Problem**: fMRIPrep throws a `RuntimeError` related to fieldmaps, such as missing or improperly specified fieldmaps.
    - **Solution**: Ensure that fieldmaps are correctly specified in your BIDS dataset according to the [BIDS Fieldmap documentation](https://bids-specification.readthedocs.io/en/stable/06-derivatives/03-field-maps.html).
    - **Tip**: If your study does not require fieldmap correction, you can skip this step by specifying `--ignore fieldmaps` in your fMRIPrep command.

??? failure "MRIQC: NaN Values in JSON Files"
    - **Problem**: MRIQC fails when encountering `NaN` values in JSON metadata files.
    - **Solution**: Use a script like `sanitize_json.py` to replace `NaN` values with valid placeholders before running MRIQC.
    - **Tip**: Validate your JSON files before running MRIQC to avoid processing interruptions.

??? failure "Docker: Cannot Allocate Memory"
    - **Problem**: fMRIPrep crashes with the error `cannot allocate memory` when using Docker.
    - **Solution**: Restart the Docker service or allocate more memory and CPUs through the Docker Desktop settings under **Resources**.
    - **Tip**: Increase memory allocation gradually (e.g., 2-4 GB increments) until fMRIPrep runs smoothly.

??? failure "Slow Processing: fMRIPrep Takes Too Long"
    - **Problem**: fMRIPrep runs slowly, taking an excessively long time for each subject.
    - **Solution**: Use a **faster SSD** for the `--work-dir` to improve read/write speeds and reduce processing time. Also, ensure `--n-cpus` is set to the majority of available cores, but not all, to avoid system slowdowns.
    - **Tip**: Consider running fMRIPrep on a **high-performance computing (HPC)** cluster if available.

??? failure "Missing or Corrupted Output Files"
    - **Problem**: After running fMRIPrep or MRIQC, certain output files (e.g., `sub-xx.html` reports) are missing or corrupted.
    - **Solution**: Check for errors in the log files generated during the run. Often, disk space issues or interruptions during processing can cause missing files. Re-run the affected subjects with sufficient disk space.
    - **Tip**: Use a dedicated work directory and ensure it has at least **100 GB** of free space to accommodate intermediate files.

??? failure "MRIQC: No Group Report Generated"
    - **Problem**: Group-level analysis in MRIQC does not produce a report.
    - **Solution**: Ensure that MRIQC was run in **group mode** using the correct `group` argument. Check if all individual reports are present in the output directory before running the group-level command.
    - **Tip**: Verify that the `derivatives/mriqc` directory has read and write access for Docker.

??? failure "fMRIPrep output: empty surf files"
    - **Problem**: Some files in `freesurfer/sub-xx/surf` are empty (0 KB), namely:  
  
        - `*h.fsaverage.sphere.reg`
        - `*h.pial`
        - `*h.white.H`
        - `*h.white.K`

        These files are supposed to be symbolic links pointing to other outputs in the folder. A 0 KB size indicates that the link is broken. This often happens if preprocessing was done on Windows, since Windows does not fully preserve these link-type files.

        Even if the symbolic link is broken, the files to which the links originally pointed are likely still present in your `surf/` folder, so you **do not need to re-run** `recon-all` or `fmriprep`. 

    - **Solution**: If you need any of these files, you can either use the corresponding “original” file directly, or recreate the symbolic link (or a duplicate file) so external tools can see it under the expected filename. Below are the relevant file mappings:
  
        | Broken (link) file            | Original (target) file         |
        |-------------------------------|--------------------------------|
        | `*h.fsaverage.sphere.reg`     | `*h.sphere.reg`                |
        | `*h.pial`                     | `*h.pial.T1`                   |
        | `*h.white.K`                  | `*h.white.preaparc.K`          |
        | `*h.white.H`                  | `*h.white.preaparc.H`          |

        For instance, if you need `lh.pial` and it’s empty, you can create it by copying `lh.pial.T1` with the following command:

        ```bash
        cp lh.pial.T1 lh.pial
        ```

        To **fix these links automatically** across multiple subjects (on Windows, use the WSL terminal, **not** in the native PowerShell / Windows terminal)):
          
          1. Set your `FREESURFER_PATH` (the folder containing your pre-existing `recon-all` or output): 
            ```bash
            export FREESURFER_PATH=/BIDE/derivatives/freesurfer
            ```
          2. Copy and paste the script below into an empty file and save it as **`fix_surf_files.sh`**.  
          3. Open a terminal and navigate to the folder where you saved the file (e.g., `cd ~/Documents`).
          4. Make the script executable: `chmod +x fix_surf_files.sh`
          5. Run the script: `./fix_surf_files.sh`
        
        Here is the full script:

        ```{.bash linenums="1"}
        #!/bin/bash

        # ==============================================================================
        # Fix Broken Files in FreeSurfer Directories
        #
        # This script checks for specific broken or empty files in a FreeSurfer directory.
        # If a broken file is found, it creates a symbolic link to its corresponding
        # original file.
        #
        # Usage:
        #   ./fix_freesurfer_links.sh         # Process all subjects in $FREESURFER_PATH
        #   ./fix_freesurfer_links.sh sub-01  # Process only the given subject(s)
        #
        # Requirements:
        #   - The environment variable $FREESURFER_PATH must be set and point to the 
        #     directory containing the subject folders.
        #   - FreeSurfer outputs must exist for the fix to work.
        # ==============================================================================

        # Check if FREESURFER_PATH is set
        if [[ -z "$FREESURFER_PATH" ]]; then
            echo "❌ Error: FREESURFER_PATH is not set. Please export FREESURFER_PATH first."
            exit 1
        fi

        # If no subject is provided, process all subjects in the FreeSurfer directory
        if [[ $# -eq 0 ]]; then
            SUBJS=($(ls "$FREESURFER_PATH"))  # Get all subjects in the directory
        else
            SUBJS=("$@")  # Use provided subjects
        fi

        # Define file mappings: (broken file → target file)
        declare -A FILE_MAP=(
            ["lh.fsaverage.sphere.reg"]="lh.sphere.reg"
            ["rh.fsaverage.sphere.reg"]="rh.sphere.reg"
            ["lh.pial"]="lh.pial.T1"
            ["rh.pial"]="rh.pial.T1"
            ["lh.white.K"]="lh.white.preaparc.K"
            ["rh.white.K"]="rh.white.preaparc.K"
            ["lh.white.H"]="lh.white.preaparc.H"
            ["rh.white.H"]="rh.white.preaparc.H"
        )

        # Loop over subjects
        for SUBJ in "${SUBJS[@]}"; do
            SURF_PATH="${FREESURFER_PATH}/${SUBJ}/surf"

            # Check if the subject directory exists
            if [[ ! -d "$SURF_PATH" ]]; then
                echo "⚠️ Warning: Subject directory not found for $SUBJ. Skipping..."
                continue
            fi

            # Loop over each broken file type
            for BROKEN_FILE in "${!FILE_MAP[@]}"; do
                TARGET_FILE="${FILE_MAP[$BROKEN_FILE]}"
                BROKEN_PATH="${SURF_PATH}/${BROKEN_FILE}"
                TARGET_PATH="${SURF_PATH}/${TARGET_FILE}"

                # Check if the broken file exists and is empty
                if [[ -e "$BROKEN_PATH" && ! -s "$BROKEN_PATH" ]]; then
                    echo "🛠 Fixing $BROKEN_FILE for $SUBJ..."
                    
                    # Check if the corresponding target file exists before creating the link
                    if [[ -e "$TARGET_PATH" ]]; then
                        ln -sf "$TARGET_PATH" "$BROKEN_PATH"
                        echo "✔ Created symbolic link: $BROKEN_FILE → $TARGET_FILE"
                    else
                        echo "⚠️ Warning: $TARGET_FILE not found for $SUBJ. Cannot create link."
                    fi
                else
                    echo "✅ $BROKEN_FILE for $SUBJ is fine. No action needed."
                fi
            done

        done

        echo "✅ Done."

        ```
---

With these quality checks complete, you're ready to proceed to the **General Linear Model (GLM) analysis**. See the next guide for instructions on setting up your GLM. [--> Go to GLM](./fmri-glm.md)
