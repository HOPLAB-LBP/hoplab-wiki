# Functional MRI

This page is a work in progress and it is based on what I do in my fMRI pipeline. This info may change once we agree on shared practices.

- **TODO:** talk to Joan and Elahe to check on what they do, and standardize.
- **TODO:** Add info and links about fmri tasks, preprocessing, GLM, ROIs, MVPA/RSA.
- **TODO:** info on how to install main tools used for the fmri workflow for different OSs.
- **TODO:** info about instruments and procedures at the hospital.

A template folder structure, along with the code to reproduce these analyses, can be found at [PLACEHOLDER]

## General Notes

### How to store raw data

In order to avoid error while converting into BIDS format, the raw data (i.e., the data collected from the scanner, behavioural measure, eye-tracking) should be stored in a folder with the following structure:

```
sourcedata
└── sub-41
	├── bh
	│   ├── 20240503104938_log_41-1-2_exp.tsv
	│   ├── 20240503105558_41_1_exp.mat
	│   ├── 20240503105640_log_41-2-1_exp.tsv
	│   ├── 20240503110226_41_2_exp.mat
	│   ├── 20240503110241_log_41-3-2_exp.tsv
	│   ├── 20240503110825_41_3_exp.mat
	│   ├── 20240503110851_log_41-4-1_exp.tsv
	│   ├── 20240503111433_41_4_exp.mat
	│   ├── 20240503111450_log_41-5-2_exp.tsv
	│   └── 20240503112032_41_5_exp.mat
	└── nifti
	    ├── sub-41_WIP_CS_3DTFE_8_1.nii
	    ├── sub-41_WIP_Functional_run1_3_1.nii
	    ├── sub-41_WIP_Functional_run2_4_1.nii
	    ├── sub-41_WIP_Functional_run3_5_1.nii
	    ├── sub-41_WIP_Functional_run4_6_1.nii
	    └── sub-41_WIP_Functional_run5_7_1.nii
```

### How to get images from the scanner

For optimal BIDS conversion of fMRI data, it is recommended to initially collect DICOM files (not NIfTI or PAR/REC) at the scanner. Although this adds an extra conversion step and takes longer, it ensures proper conversion into BIDS format. Here is the recommended process:

1. **Initial DICOM Collection**:
    - Collect DICOM files for each modality (e.g., T1 and BOLD) for one subject.
    - Convert these DICOM files to NIfTI format using `dcm2nii`, which will generate JSON sidecar files (refer to [this section](#bids-conversion) for more info on the conversion process).

2. **Template Creation**:
    - Rename the JSON files for T1 and BOLD image to `sub-xx_T1w.json` and `sub-xx_task-exp_run-x_bold.json`
    - Move the JSON files into `misc/`.

3. **Subsequent Data Collection**:
    - After creating the template JSON files, collect future data in NIfTI format to save time. The `01_nifti-to-BIDS.m` script will use the JSON templates to populate the BIDS folders, provided that the fMRI sequence remained unchaged (in that case you need to generate new templates from the DICOM files).

### Missing fields in JSON files

Despite these steps, some BIDS fields in the sidecar JSON files may remain empty due to limitations of the Philips scanner, not the conversion tools. The most relevant fields that are left empty due to these limitations are `SliceTiming` and [`PhaseEncodingDirection`](https://github.com/xiangruili/dicm2nii/issues/49).

- **SliceTiming**:
    - This field is used by fMRIPrep during slice timing correction.
    - It can be populated using the `/utils/get_philips_MB_slicetiming.py` script, assuming you have access to a DICOM file and know the multiband factor (default is 2, as used in our lab).
    - **NOTE:** The script assumes an interleaved, foot-to-head acquisition, and will not work for other types of acquisitions.

- **PhaseEncodingDirection**:
    - This BIDS tag allows tools to undistort images.
    - While the Philips DICOM header distinguishes the phase encoding axis (e.g., anterior-posterior vs. left-right), it does not encode the polarity (A->P vs. P->A).
    - You will need to check at the scanner or consult with Ron whether the polarity is AP or PA, and correct the `?` in the JSON file to `+` or `-`.
 
- **TODO:** add info about NaNs in the JSON file (raw and fmriprep) and how to change them. NaNs will raise errors during the mriqc workflow. See [this](https://groups.google.com/g/mriqc-users/c/0v170KRJoKk), [this](https://github.com/nipreps/mriqc/issues/1089) and [this](https://neurostars.org/t/node-error-on-mriqc-wf-dwimriqc-computeiqms-datasink/29188). 

For more details on Philips DICOM conversion, refer to the following resources:

- [Philips DICOM Missing Information - dcm2niix](https://github.com/rordenlab/dcm2niix/tree/master/Philips#missing-information)
- [PARREC Conversion - dcm2niix](https://github.com/rordenlab/dcm2niix/tree/master/PARREC)

### Where to find additional info on the fMRI sequence

Additional information on the sequence can be found at the scanner by following these steps:
	
- **TODO:** document the correct steps to get info on the geometry etc. we need to start new examination, load our sequence, click on one run/T1, and go in the geometry tab. here we have info about polarity, direction etc.
	
### BIDS standards

- **TODO:** add info about the BIDS standard, and how we use it (from raw to BIDS + derivatives)
	
## Workflow

### Behavioral Data

- **TODO:** here Tim should describe name and format of the logfiles
- **TODO:** add ref to fMRI task repo

The fMRI task script should give two files per run as output (see the folder structure [here](#how-to-store-raw-data). Here is a description of the naming structure and file content:

1. `<timestamp>_log_<subID>-<run>-<buttonMapping>_<taskName>.tsv`: This is the human-readable log file produced by the task. Here is an extract from the file:

| EVENT_TYPE | EVENT_NAME | DATETIME                | EXP_ONSET | ACTUAL_ONSET | DELTA      | EVENT_ID |
|------------|------------|-------------------------|-----------|--------------|------------|----------|
| START      | -          | 2024-05-03 10:49:43.099 | -         | 0            | -          | -        |
| FLIP       | Instr      | 2024-05-03 10:50:11.399 | -         | 28.300201    | -          | -        |
| RESP       | KeyPress   | 2024-05-03 10:50:34.160 | -         | 51.063114    | -          | 51       |
| FLIP       | TgrWait    | 2024-05-03 10:50:34.216 | -         | 51.117046    | -          | -        |
| PULSE      | Trigger    | 2024-05-03 10:50:40.000 | -         | 56.904357    | -          | 53       |

2. `<timestamp>_log_<subID>_<run>_<taskName>.mat`: This MATLAB file contains all the parameters to reproduce the experimental run, and stores input parameters and results.

If the behavioural data is stored in a `sourcedata/sub-xx/bh/` folder consistent to the one described [above](#how-to-store-raw-data), you can run the `02_behavioural-to-BIDS.m` script, after editing the parameters at the top of the script. This script iterates through subject-specific directories targeting behavioral .mat files, then processes and exports trial-related info into BIDS-compliant TSV event files in the BIDS folder provided as parameters.

- **TODO:** above, we need to phrase better and add more info about what these parameters are, possibly with a screenshot of the code. Also, in the code make more clear where the parameters are.
- **TODO:** perhaps wrap nifti and bh 2 BIDS in a single script that takes some input arguments? 
- **TODO:** we need to add more info about how these files are saved, and more in general about the BIDS structure

Ensure that each resulting tsv file has at least three columns representing: `onset`, `duration`, `trial_type`.

### Eye-Tracking Data

**Pre-requisite:** To convert EDF files into more easy-to-read ASC files, you need to install the EyeLink Developers Kit / API. More info and how-to:

- [EyeLink Developers Kit / API](https://www.sr-research.com/support/thread-13.html)

1. Run the ET script to convert to ASC in BIDS format.

- **NOTE:** BEP020 has not been approved yet. Not sure if the events MSG should be included here or not.

### fMRI Data

#### BIDS conversion

!!! note Automatic Deployment with GitHub Actions
    This step should only be performed for the first subject in your dataset, and can be skipped if the anatomical and functional JSON templates are available in `code/misc/` (see [here](#how-to-get-images-from-the-scanner) for more info on the template files)

1. **Convert DICOM to BIDS (NIfTI):**
    - **Prerequisites:**
        - `dcm2nii`
        - Raw data should be organized as: `/sourcedata/sub-<xx>/dicom`
        - MATLAB

    1.1. Download `dicm2nii` from [dicm2nii](https://github.com/xiangruili/dicm2nii), unzip, and add to the MATLAB path.

    1.2. Open MATLAB and type `anonymize_dicm` in the console. Enter and it will ask you to select the folder where the files are and the folder in which you want to save it: `/sourcedata/sub-<xx>/dicom_Anon`.

    1.3. Run the `dicm2nii` MATLAB function from the unzipped file. Just write `dicm2nii` in the command window. A pop-up will appear: select DICOM folder (Dicom_Anon. files) and result folder (Dicom_Converted). Untick the compress box and make sure you select save JSON file. Start conversion. A pop-up appears: subject (only number of the subject, e.g., 01). Type: `func` (T2 scans) and `anat` (T1 scans). Under modality, we need `task-{name of the task}_run-{number of run}_bold`, e.g., `task-exp_run-2_bold`. Modality for anatomical scans is `T1W`. This pop-up will appear for each run of the fMRI sequence.

    At the end of this process, we have a new folder called `dicom_converted` structured as follows:
    ```
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

    Copy your `sub-01` folder from `dicom_converted` into the BIDS folder (make a new one if you don't have one).

    ****NOTE:**** The pop-up only appeared with the first participant and then does it automatically. This is quite annoying as it never gets the participant number right so you have to manually go in and change it. It also only worked when providing it with (enhanced) DICOM files.

2. **Validate the BIDS directory (and solve errors):**
    - [BIDS Validator](https://bids-standard.github.io/bids-validator/)

#### Quality check

link: [mriqc](https://mriqc.readthedocs.io/en/latest/)

- **TODO:** explain how to save and run this below

- **TODO:** explain that the one below may fail, in that case run the single commands separately

```sh
#!/bin/bash

## Iterate over subject numbers
for i in {0..40}; do
    ## Skip subject 0, 5, 14, 31
    if [ $i -eq 0 ] || [ $i -eq 5 ] || [ $i -eq 14 ] || [ $i -eq 31 ]; then
        continue
    fi

    ## Format subject number with leading zeros
    subID=$(printf "sub-%02d" $i)
    echo "Processing $subID"

    ## Docker command with dynamic subject ID using sudo
    docker run -it --rm \
    -v /data/BIDS:/data:ro \
    -v /data/BIDS/derivatives/mriqc:/out \
    -v /temp_mriqc:/scratch \
    nipreps/mriqc:latest /data /out participant \
    --participant-label ${subID} \
    --nprocs 16 --mem-gb 40 --float32 \
     --work-dir /scratch \
     --verbose-reports --resource-monitor -vv

    ## Wait or perform other actions between runs if needed
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

#### Surface Preprocessing

link: [FastSurfer](https://github.com/Deep-MI/FastSurfer)

FastSurfer offers a significantly faster alternative to traditional FreeSurfer processing, leveraging NVIDIA GPU acceleration if available. If a suitable GPU is not available, consider using fMRIprep for CPU-based processing, which will integrate FreeSurfer's recon-all but will take longer (approx. 15 hours).

##### Prerequisites
- **Docker Desktop:** Install Docker Desktop [here](https://docs.docker.com/desktop/install/ubuntu/).
- **NVIDIA Docker:** Necessary for GPU utilization, installable from [here](https://developer.nvidia.com/blog/nvidia-docker-gpu-server-application-deployment-made-easy/).
- **FreeSurfer License:** Download necessary licensing for FreeSurfer.
- **WSL (Windows Subsystem for Linux):** Required only for Windows users. Installation guidelines [here](https://docs.microsoft.com/en-us/windows/wsl/install).

##### Verifying GPU Accessibility via Docker
Run this in your terminal (for Windows, use WSL to execute the following command):
  ```
  sudo docker run --rm --gpus all nvidia/cuda:12.0.1-base-ubuntu20.04 nvidia-smi
  ```
!!! note
    Ensure that `cuda:12.0.1` and `ubuntu20.04` match your CUDA drivers and Ubuntu version, respectively. Check your CUDA version by running `nvidia-smi` in a Linux/WSL terminal.

The command should output a table showing CUDA version and GPU details. If no NVIDIA GPU is listed, troubleshoot the NVIDIA Docker installation.

##### Running FastSurfer
- Example Command for Andrea's Ubuntu Laptop:
  ```
  sudo docker run --gpus all \
  -v /media/costantino_ai/T7/fMRI_chess/data/BIDS:/data \
  -v /media/costantino_ai/T7/fMRI_chess/data/BIDS/derivatives/FastSurfer:/output \
  -v /media/costantino_ai/T7/fMRI_chess/misc:/fs_license \
  --rm --user $(id -u):$(id -g) deepmi/fastsurfer \
  --fs_license /fs_license/license.txt \
  --t1 /data/sub-00/anat/sub-00_T1w.nii \
  --sid sub-00 \
  --sd /output \
  --parallel
  ```

- Example Command for Windows LBP Computer:
  ```
  docker run --gpus all \
  -v /mnt/c/Andrea/data/BIDS_Laura:/data \
  -v /mnt/c/Andrea/data/BIDS_Laura/derivatives/fastsurfer:/output \
  -v /mnt/c/Andrea/data/scripts\ and\ codes:/fs_license \
  --rm --user $(id -u):$(id -g) deepmi/fastsurfer \
  --fs_license /fs_license/license.txt \
  --t1 /data/sub-00/anat/sub-00_T1w.nii \
  --sid sub-00 \
  --sd /output \
  --device cuda:0 \
  --parallel
  ```

- **Volumes Explanation:**
  - First `-v` specifies the path to your BIDS folder.
  - Second `-v` specifies where you want the outputs saved.
  - Third `-v` is the path where the FreeSurfer license is stored.

##### Notes on Path Formatting for Windows users
- The C-drive is accessible at `/mnt/c/`.
- Replace backslashes `\` with forward slashes `/` in paths.
- To handle spaces in directory paths, insert a backslash before each space, e.g., `/mnt/c/folder with space/` becomes `/mnt/c/folder\ with\ space/`.

- **FIXME:** There's an issue with Docker incorrectly selecting the Intel GPU instead of the NVIDIA GPU on the LBP machine. Verify GPU selection before processing the next subject.

#### Minimal preprocessing

link: [fMRIprep](https://fmriprep.org/en/stable/)

- **TODO:** explain how to install docker and fmriprep-docker

**NOTE:** the parameters `n-cpus` and `mem-mb` depend on the computer hardware, and may need some tuning to avoid out of memory errors. The memory assigned with `mem-mb` is not the total memory, but the memory per process. That means that the actual memory used can exceed by far that value. Set the `mem-mb` to at least 1/3 or 1/4 of you RAM memory.

Add info about the `work-dir` and how big one of these folder can get (to avoid SSD space errors)

Add info about running in parallel rather than multiple subjects in the same terminal

```sh
fmriprep-docker \
    /data/BIDS \
    /data/BIDS/derivatives/fmriprep \
    participant \
    --work-dir /chess/temp \ 
    --mem-mb 13000 \
    --n-cpus 16 \
    --resource-monitor \
    -vv \
    --output-spaces MNI152NLin2009cAsym:res-2 anat fsnative \
    --fs-license-file /misc/.license \
    --bold2t1w-dof 9 \
    --task exp \
    --dummy-scans 0 \
    --fs-subjects-dir /data/BIDS/derivatives/fastsurfer \
    --notrack \
    --participant-label 37 38 39 40
```

##### How to interpret fMRIprep visual reports

#### Running a GLM in SPM

- **TODO:** show code snippets perhaps? or just reference to the code

#### Regions of Interest

##### ROIs from localizers

##### HCP Glasser parcellation

##### Other parcels/atlases

#### MVPA/RSA

#### Plotting and reporting




