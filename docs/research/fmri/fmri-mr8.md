# MR8 (decommissioned)

!!! warning "Historical page"
    MR8, the Philips 3T research scanner at UZ Leuven Gasthuisberg, was decommissioned in May 2026 and replaced by **MR11** (Siemens Cima.X 3T) in June 2026. Do **not** use this page to plan or run new scans: see [First steps](fmri-get-started.md), the [MR11 equipment](fmri-equipment.md) and the [MR11 scanning procedure](fmri-procedure.md).

    This page only keeps what you may still need to analyse or reproduce studies that were run at MR8.

The full MR8 instructions that used to be on this wiki (equipment, projector, scanning and export procedure) are in the [git history](https://github.com/HOPLAB-LBP/hoplab-wiki/commits/main/docs/research/fmri/fmri-procedure.md) of the repository.

---

## The MR8 set-up in short

Useful when you reuse an MR8 experiment script or report the methods of an MR8 study:

| Item | MR8 |
|------|-----|
| Scanner | Philips 3T with a 32-channel head coil |
| Display | NEC projector onto a screen at the back of the bore, viewed via a mirror on the head coil |
| Projector filter (default) | 3NB, 1.34% light transmission |
| Screen width and viewing distance | 340 mm and 630 mm (used in lab experiments) |
| Scanner trigger | key `5` (through the 2-button box); `T` when relayed through the 4-button "diamond" box |
| Button boxes | 2-button boxes, the 4-button "diamond" box, and the 5-button "Nata" box (whose button `5` had to be told apart from the trigger `5`) |
| Stimulus PC software | MATLAB 2011b and 2015a with Psychtoolbox |
| Eye tracker | EyeLink 1000 long range |

!!! tip "Porting an MR8 script to MR11"
    At MR11 the trigger arrives as `t` and the buttons as letters, and the screen geometry is different. Update the trigger key, response keys, screen size and viewing distance in your script (see [Trigger box and buttons](fmri-equipment.md#trigger-box-and-buttons) and [In-room screen](fmri-equipment.md#in-room-screen)). The exam cards of the lab studies that were still running were transferred to MR11 in May 2026.

---

## Working with MR8 data

MR8 was a Philips scanner. Its DICOMs lack some fields that BIDS tools expect, and data were exported by hand at the console (DICOM, NIfTI or PAR/REC). The notes below explain how we handled this.

### How to Get Images from the Scanner

For optimal BIDS conversion of fMRI data, it is recommended to initially collect **DICOM files** (not NIfTI or PAR/REC) at the scanner. Although this adds an extra conversion step, it ensures accurate conversion into BIDS format. Follow these steps:

1. **Initial DICOM Collection**:
    - Collect DICOM files for each modality (e.g., T1 and BOLD) for one subject.
    - Convert these DICOM files to NIfTI format using `dcm2nii`, which will generate JSON sidecar files. Refer to the [BIDS conversion guide](analysis/fmri-bids-conversion.md) for more details on the conversion process.

2. **Template Creation**:
    - Rename the JSON files for T1 and BOLD images to `sub-xx_T1w.json` and `sub-xx_task-exp_run-x_bold.json`.
    - Move the JSON files into the `misc/` folder.

3. **Subsequent Data Collection**:
    - After creating the template JSON files, collect future data directly in NIfTI format to save time. The `script01_nifti-to-BIDS.m` script will use the JSON templates to populate the BIDS folders, as long as the fMRI sequence remains unchanged. If the sequence changes, generate new templates from the DICOM files.

---

### Missing Fields in JSON Files

Despite these steps, some BIDS fields in the sidecar JSON files may remain empty due to limitations of the Philips scanner. The most relevant fields that may be left empty are `SliceTiming` and [`PhaseEncodingDirection`](https://github.com/xiangruili/dicm2nii/issues/49).

- **SliceTiming**:
  - This field is required by fMRIPrep during slice timing correction.
  - Populate it using the [`get_philips_MB_slicetiming.py` script](../../assets/code/get_philips_MB_slicetiming.py), assuming you have access to a DICOM file and know the multiband factor (default is 2, as used in our lab).

    !!! warning
        The script assumes an interleaved, foot-to-head acquisition and will not work for other acquisition types.

- **PhaseEncodingDirection**:
  - This BIDS tag helps tools undistort images.
  - Philips DICOM headers specify the phase encoding axis (e.g., A-P or L-R) but not the polarity (A --> P or P --> A).
  - Check the scanner settings or consult with Ron to determine whether the polarity is A --> P or P --> A, and update the `?` in the JSON file with `j` (P --> A) or `j-` (A --> P).
  - More info [here](https://community.mrtrix.org/t/phase-encoding-direction-from-philips-achieva/3578/6) and [here](https://neurostars.org/t/determining-phase-encoding-direction-and-total-read-out-time-from-philips-scans/25402/4)

For more details on Philips DICOM conversion, refer to the following resources:

- [Philips DICOM Missing Information - dcm2niix](https://github.com/rordenlab/dcm2niix/tree/master/Philips#missing-information)
- [PARREC Conversion - dcm2niix](https://github.com/rordenlab/dcm2niix/tree/master/PARREC)

---

### Where to Find Additional Info on the fMRI Sequence

Additional information on the fMRI sequence can be found directly at the scanner. Here’s a step-by-step guide:

1. **Start the Examination**:
    - Go to **Patients** -> **New Examination** -> **RIS**.
    - Select your subject and fill out the required fields:
        - **Weight:** Enter the subject's weight.
        - **Implants:** Specify if the subject has any implants.
        - **Pregnant:** Indicate if the subject is pregnant.

2. **Load the Scanning Sequence**:
    - Drag and drop your scanning sequence from the bottom panel to the left panel.

3. **Select a Run**:
    - Click on either a functional or anatomical run from the available list.

4. **Expand the Tabs**:
    - Click on the `>>` symbol in the bottom panel, below the sagittal, coronal, and horizontal views, to expand additional tabs.

5. **Access Geometry Settings**:
    - Navigate to the **Geometry** tab to access important scan parameters:
        - **MB factor**: Indicates the number of slices recorded simultaneously, used for slice timing correction.
        - **Slices**: Total number of horizontal slices.
        - **Fold-over direction**: Required for correcting the phase encoding direction in the BIDS field.
        - **Slice scan order**: Typically Foot to Head (FH), used for slice timing correction.

6. **Check Additional Fields**:
    - Visit the **Coils** tab for details about the head coils used during the scan.
    - In the **Contrast** tab, note the following fields:
        - **TE (Echo Time)**: Usually a single echo of 30 ms by default.
        - **TR (Repetition Time)**: Typically set to 2000 ms by default.
