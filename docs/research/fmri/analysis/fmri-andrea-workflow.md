# Functional MRI

This page is a work in progress and it is based on what I do in my fMRI pipeline. This info may change once we agree on shared practices.

The code to reproduce these analyses can be found [here](https://github.com/costantinoai/chess-expertise-2024).

- **TODO:**  add links to folder structure and/or data

## From raw data to BIDS

### Collect raw data
- **TODO:**  add info about defacing/anonymizing (also the filenames.. use my script). 

at the hospital:
  - take fmri scans from the hospital computer. in the gui, specify what buttons to select.
  - anonymize the fnames with the script i use. this is important to protect subjects privacy (no names should be in the files that leave the hospital)
  - take bh and et data from the output folders in the exp PC
  - copy all the files into a sourcedata/ folder in bh, nifti, et folders

### fMRI data to BIDS

#### For your first subject:
!!! info
    This step should only be performed for the first subject in your dataset, and can be skipped if the anatomical and functional JSON templates are available in `code/misc/` (see [here](fmri-general.md#how-to-get-images-from-the-scanner) for more info on the template files)

1. **Convert DICOM to BIDS (NIfTI):**
    - **Prerequisites:**
        - `dcm2nii`
        - Raw data should be organized as: `/sourcedata/sub-<xx>/dicom`
        - MATLAB

    1.1. Download `dicm2nii` from [dicm2nii](https://github.com/xiangruili/dicm2nii), unzip, and add to the MATLAB path.

    1.2. Open MATLAB and type `anonymize_dicm` in the console. Enter and it will ask you to select the folder where the files are and the folder in which you want to save it: `/sourcedata/sub-<xx>/dicom_Anon`.

- **TODO:** for simplicity, probably a good idea to check out and add to pipeline this https://github.com/PeerHerholz/BIDSonym

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

**NOTE:** The pop-up only appeared with the first participant and then does it automatically. This is quite annoying as it never gets the participant number right so you have to manually go in and change it. It also only worked when providing it with (enhanced) DICOM files.

3. **Validate the BIDS directory (and solve errors):**
    - [BIDS Validator](https://bids-standard.github.io/bids-validator/)
    
#### After your first subject:

This step assumes that your raw data is organized in a `sourcedata/sub-xx` folder, and that you already created the JSON templates in the `misc/` folder, as described in [here](fmri-general.md#how-to-store-raw-data). 

Now I have my source data folder. We need to.
  - anonymize/deface the images
  - run the script01 to move and rename the raw files into the main BIDS folder. This will create a sub-xx folder for each raw sub data

### Behavioral Data to BIDS

- **TODO:** here Tim should describe name and format of the logfiles
- **TODO:** add ref to fMRI task repo

Run the script02 to convert the behavioural mat data into events.tsv files following the BIDS specification. This will parse the trial data from the mat file, and create new tsv files into each sub-xx folder corresponding to each run. 

The fMRI task script should give two files per run as output (see the folder structure [here](fmri-general.md#how-to-store-raw-data). Here is a description of the naming structure and file content:

1. `<timestamp>_log_<subID>-<run>-<buttonMapping>_<taskName>.tsv`: This is the human-readable log file produced by the task. Here is an extract from the file:

| EVENT_TYPE | EVENT_NAME | DATETIME                | EXP_ONSET | ACTUAL_ONSET | DELTA      | EVENT_ID |
|------------|------------|-------------------------|-----------|--------------|------------|----------|
| START      | -          | 2024-05-03 10:49:43.099 | -         | 0            | -          | -        |
| FLIP       | Instr      | 2024-05-03 10:50:11.399 | -         | 28.300201    | -          | -        |
| RESP       | KeyPress   | 2024-05-03 10:50:34.160 | -         | 51.063114    | -          | 51       |
| FLIP       | TgrWait    | 2024-05-03 10:50:34.216 | -         | 51.117046    | -          | -        |
| PULSE      | Trigger    | 2024-05-03 10:50:40.000 | -         | 56.904357    | -          | 53       |

2. `<timestamp>_log_<subID>_<run>_<taskName>.mat`: This MATLAB file contains all the parameters to reproduce the experimental run, and stores input parameters and results.

If the behavioural data is stored in a `sourcedata/sub-xx/bh/` folder consistent to the one described [above](fmri-general.md#how-to-store-raw-data), you can run the `script02_behavioural-to-BIDS.m` script, after editing the parameters at the top of the script. This script iterates through subject-specific directories targeting behavioral .mat files, then processes and exports trial-related info into BIDS-compliant TSV event files in the BIDS folder provided as parameters.

- **TODO:** above, we need to phrase better and add more info about what these parameters are, possibly with a screenshot of the code. Also, in the code make more clear where the parameters are.
- **TODO:** perhaps wrap nifti and bh 2 BIDS in a single script that takes some input arguments? 
- **TODO:** we need to add more info about how these files are saved, and more in general about the BIDS structure

Ensure that each resulting tsv file has at least three columns representing: `onset`, `duration`, `trial_type`.

### Eye-Tracking Data to BIDS

**Pre-requisite:** To convert EDF files into more easy-to-read ASC files, you need to install the EyeLink Developers Kit / API. More info and how-to:

- [EyeLink Developers Kit / API](https://www.sr-research.com/support/thread-13.html)

1. Run the ET script to convert to ASC in BIDS format.

- **NOTE:** BEP020 has not been approved yet. Not sure if the events MSG should be included here or not.

https://github.com/s-ccs/pyedfread

## fMRI BIDS pre-processing

### Quality check

link: [mriqc](https://mriqc.readthedocs.io/en/latest/)

- **TODO:** explain how to save and run this below

- **TODO:** explain that the one below may fail, in that case run the single commands separately

```sh linenums="1" title="mriqc_batch.sh"
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
!!! warning
    In some cases, the JSON files corresponding to each nifti file can include `NaN` values, which are not compatible with JSON encoders and will raise an error when running mriqc. A quick (and dirty) solution would be to sanitize all the JSON files before running mriqc. I made a small utility script that can help with that. See `./utils/sanitize_json.py`.

### Minimal preprocessing with fMRIprep

link: [fMRIprep](https://fmriprep.org/en/stable/)

Now we have our base (raw) data organized in a BIDS folder. this is our starting point for any other analysis. What now?
The main steps we need to follow are: fmriprep, GLM. rois. mvpa

For fmriprep: (fmriprep, docker, fmripre-docker)
  - install docker (and WSL if on windows). Assign resources (RAM, disk, cpus) reasonably (< 80% of your system capacity).
  - install fmriprep-docker. this is as easy as `pip install fmriprep-docker`.
  - share with docker the folders you are going to use. these are you BIDS folder, and a `temp_fmriprep` folder.
  - run fmripre-docker. Below you can see my terminal call to pre-process sub-41. The arguments I use (and a lot more that I don't use) are explained [here](https://fmriprep.org/en/stable/usage.html). Make sure you are familiar with these.
    
```sh
fmriprep-docker /data/projects/chess/data/BIDS /data/projects/chess/data/BIDS/derivatives/fmriprep participant --work-dir //data/projects/chess/data/temp_fmriprep --mem-mb 10000 --n-cpus 16 --output-spaces MNI152NLin2009cAsym:res-2 anat fsnative --fs-license-file /data/projects/chess/misc/.license --bold2t1w-dof 9 --task exp --dummy-scans 0 --fs-subjects-dir /data/projects/chess/data/BIDS/derivatives/fastsurfer --notrack --participant-label 41
```
    
!!! note
    if you want to run analysis on surface data, you may want to consider getting CIFTI output images from fmriprep. I did not test this, but it should produce cortical BOLD series projected from the Glasser2016 template (the same parcellation I use for MVPA). In theory, SPM should be able to analyze .gii surface data, and bt getting the CIFTI outputs you should already have the parcellation projected to subject space for subsequent analyses. Or at least it should give a Glasser parcellation on subject/MNI space that is directly usable for MVPA, therefore skipping the quite time-sonsuming and complicate step to produce the HPC ROIs (see below)
    
!!! warning
    this call is very resource and time intensive. It will take several hours (4-8, depending on your PC specs) at full capacity to preprocess a single subject. If you need to process many subjects, you may want to play with the ncpus and mem-mb parameters to be sure that you are using all the available resources. A good test of this is to open the task manager on windows, and check the CPU and RAM usage during a run. Ideally, we want the CPU to be always at max speed, and the RAM to be 10 GB below the maximum. If the RAM needed by the process is higher than the RAM available, you will get Out of Memory errors, or No more space on disk errors if you did not specify a work-dir folder. If this happens, lower the mem-mb and n-cpus until tyou find the right spot.
    
If the run finishes successfully (check the last line of your terminal output), you should have a new `BIDS/derivatives/fmriprep/sub-xx` folder (see [here](https://fmriprep.org/en/stable/outputs.html) for a complete list of outputs generated by fmriprep). make sure that inside you `anat` and `func` folders you have all the scans (anatomical, functional all runs) in the spaces you specified. Since we specified fsnative as space and we did not use the no-recon-all flag, fmriprep will also produce surface data in `BIDS/derivatives/fastsurfer/sub-xx`.
  
#### How to interpret fMRIprep visual reports
  
Check the sub-xx.hmtl report to make sure everything run smoothly. Specifically, check the registrations, and look for particularly high FD values in the functional runs -- they may be indicative of poor data. See [this page](https://fmriprep.org/en/stable/outputs.html#confounds) for a description of the confounds and [this video](https://www.youtube.com/watch?v=fQHEKSzFKDc&list=PLIQIswOrUH6_szyxn9Fy-2cxd3vjlklde&index=3) for more information on what to look for.

## First-level analysis -- GLM 

Once we are done with preprocessing, it's time for GLM. Running the GLM and setting the contrasts is as easy as running script03. Remember to double-check the parameters at the top of the file. Specifically, you will need to adjust:
  - read/write folder, including the fmriprep folder in `fmriprepRoot`, your BIDS folder in `BIDSRoot`, the folder you want to save your GLM results to (it should ideally be in the derivatives folder, in a `fmriprep-spm` folder) in `outRoot`, and a directory to store your temporary files (e.g., uncompressed, since SPM can't read compressed gz files, and/or smoothed files) in `tempDir`.
  - the list of subjects you want to analyze in `selectedSubjectsList`. It must be list of integers like `selectedSubjectsList = [41,42,43,44];` or `selectedSubjectsList = '*';` to perform the analysis on all subjects.
  - the list of runs you want to analyze in `selectedRuns`.
  - The contrasts you want to set to get the corresponding t-maps. Here is an example for my task:
  ```
  selectedTasks(1).name = 'exp'; % The name of the task to analyze. Must correspond to the task in your BIDS filenames
  selectedTasks(1).contrasts = {'Check > No-Check'}; % The name of the contrast
  selectedTasks(1).weights(1) = struct('C_WILDCARD___WILDCARD_', 1, 'NC_WILDCARD___WILDCARD_', -1); % The weights assigned to each regressor. See function adjust_contrasts.m for more information on how to set this correctly.
  selectedTasks(1).smoothBool = false; % Whether to smooth the images before GLM. Useful for localizers.
  ```

If everything was set correctly, this script should run smoothly and produce new `sub-xx` folders in your output folder. You can check whether the subject folder contains a sub-folder for each analyses task, along with `beta_000x.nii` files for each regressor (i.e., each confound and condition * number of runs).

At this stage, it is strongly advisable to check whether the design matrix was correctly specified. To do so, you can open the SPM GUI by typing `spm fmri` in your Matlab Command Window, then click on 'Results' and select the SPM.mat file inside your bets images directory in `BIDS/fmriprep-spm/{space}/sub-xx/{task_name}/`. This will open the SPM Contrast Manager, that will show the design matrix and assigned contrasts. Make sure the matrix looks reasonable (no overlapping or extremely long conditions, correct number of runs, confound regressors at the end of each run, etc.), and that the contrast weights were assigned correctly. 

Now, select your contrast and click 'Done'. In the next window, select apply masking -> None, p value adjustment -> None -> 0.001, threshold -> 0. And voila'! You will see the results of the contrast -- that is, your thresholded t map for this subject -- on the top right, along with a list of significantly active cluster on the bottom right panel.

If you want, you can visualize these activations on a volume of your subject (or on the surface if you have performed recon-all). To do so you can click on 'Display' -> 'overlays...' and select 'sections' if you want to plot on the volume, or `render` if you want to plot on surface. This will open a new windows, where you need to select the subject anatomical image. This image will be in the `BIDS/derivatives/fmriprep/sub-xx/anat` folder. If you plot on sections, you need to select the nii file corresponding to the same space your GLM was performed on (usually MNI). If you plot on surface, select the pial or inflated brain.

!!! warning
    As I mentioned above, SPM cannot import nii.gz files directly, so you will need to decompress the anatomical image into a .nii. This can be done very easily with any decompressing tool by right-clicking the file in your file explorer. Once the file is decompressed, select it with the SPM GUI.

Once we double-checked the results of the GLM, and we are sure we are happy with it, we'll need generate our ROI masks and perform the multi-variate analysis (MVPA and RSA). This will be done in [cosmomvpa](https://cosmomvpa.org/documentation.html). 

## Generate and organize your Regions of Interest masks

##### ROIs from localizers
To run the MVPA you will need some Regions of Interest (ROIs) to select your voxels. One way to do this, is to perform a functional localizer task in the scanner, and run a GLM on the pre-processed and smoothed data for that task to select only voxels active in a given condition (e.g., Faces > Objects to get FFA). Another way could be using pre-defined anatomical masks, mapped in the same space as your subjects (usually, MNI). If you use an anatomical mask, make sure it is in the same space as your subjects, and it has the same resolution. If the resolution of your data (usually, 2*2*2) is different from the resolution of your parcel (1*1*1), you will need to resample/reslice the anatomical mask to match the resolution of your data. Thic can be done in ANTs, SPM, or many python libraries (e.g., nilearn/nibabel).

##### HCP Glasser parcellation
In my pipeline, I use the [Glasser2016 parcellation projected on fsaverage](https://figshare.com/articles/dataset/HCP-MMP1_0_projected_on_fsaverage/3498446), comprising 180 ROIs per hemisphere. This part is a bit tricky to understand for new-comers because is full of jargon and uses tools that are not very user-friendly. In a nutshell, the Glasser parcellation (aka HCP-MMP1 parcellation) annotation files that you can find on that website are converted to labels, and mapped from the fsaverage to the subject's T1 and MNI volume spaces. This can be done automatically using the `HPC-to-subject.sh` script (see top of the file for more information and usage notes).

##### Other parcels/atlases
**TODO:** link a few other atlases

## Multi-variate analysis

### Run decoding SVM
Once we produced and organized our ROIs, it's time for MVPA. Again, running the MVPA analysis is as easy as running a script. In my pipeline, script04 runs independent cross-validated SVM classification analysis on each subject and ROI, and returns the decoding accuracy for each roi of the HPC parcellation.

The script produces a `BIDS/derivatives/mvpa` folder organized in a BIDS structure, with folders for each subject including a tsv file with the decoding accuracy results. 

### Plotting and reporting
The Glasser parcellation has percels at three levels, where each higher level groups several ROIs into a single ROI. In my pipeline, I run the analysis at the lowest level (180 parcels per hemisphere), and average the results of the ROIs within a bigger ROI to get the average accuracy of the bigger ROI. This can be done with the script06. This script prepares the average accuracies at each level by averaging the accuracies at the lowest level, compute the significance against chance for each decoding accuracy, and plots the significant accuracies on an inflated brain for each grouping level. For instance:

![Decoding Example](https://raw.githubusercontent.com/HOPLAB-LBP/hoplab-wiki/main/docs/assets/combined_brain_grid.png)






