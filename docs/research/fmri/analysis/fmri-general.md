# General Notes

You should land on this page after collecting your fMRI data and [converting it to BIDS](./fmri-bids-conversion.md). Here, you’ll find all the general information and FAQs about fMRI protocols.

!!! tip "Data Storage Suggestion"
    Bring a **dedicated hard drive** to the hospital for storing the output data. This will ensure that you have a reliable medium to transfer and secure the raw data from the scanner.

---

## How to Store Raw Data

To avoid errors during BIDS conversion, store the raw data (e.g., data collected from the scanner, behavioral measures, eye-tracking) with the following folder structure:

```bash
sourcedata
└── sub-41
    ├── bh
    │   ├── 20240503104938_log_41-1-2_exp.tsv
    │   ├── 20240503105558_41_1_exp.mat
    │   ├── 20240503105640_log_41-2-1_exp.tsv
    │   ├── 20240503110226_41_2_exp.mat
    │   ├── 20240503110241_log_41-3-2_exp.tsv
    │   ├── 20240503110825_41_3_exp.mat
    │   ├── 20240503110851_log_41-4-1_exp.tsv
    │   ├── 20240503111433_41_4_exp.mat
    │   ├── 20240503111450_log_41-5-2_exp.tsv
    │   └── 20240503112032_41_5_exp.mat
    └── nifti
        ├── sub-41_WIP_CS_3DTFE_8_1.nii
        ├── sub-41_WIP_Functional_run1_3_1.nii
        ├── sub-41_WIP_Functional_run2_4_1.nii
        ├── sub-41_WIP_Functional_run3_5_1.nii
        ├── sub-41_WIP_Functional_run4_6_1.nii
        └── sub-41_WIP_Functional_run5_7_1.nii
```

!!! tip "Folder Structure"
    Ensure each subject’s data is organized as shown above to minimize errors during BIDS conversion. Store all behavioral and NIfTI files under `sourcedata`.

---

## How to Get Images from the Scanner

For optimal BIDS conversion of fMRI data, it is recommended to initially collect **DICOM files** (not NIfTI or PAR/REC) at the scanner. Although this adds an extra conversion step, it ensures accurate conversion into BIDS format. Follow these steps:

1. **Initial DICOM Collection**:
    - Collect DICOM files for each modality (e.g., T1 and BOLD) for one subject.
    - Convert these DICOM files to NIfTI format using `dcm2nii`, which will generate JSON sidecar files. Refer to [this section](./fmri-andrea-workflow.md#converting-fmri-data-to-bids) for more details on the conversion process.

2. **Template Creation**:
    - Rename the JSON files for T1 and BOLD images to `sub-xx_T1w.json` and `sub-xx_task-exp_run-x_bold.json`.
    - Move the JSON files into the `misc/` folder.

3. **Subsequent Data Collection**:
    - After creating the template JSON files, collect future data directly in NIfTI format to save time. The `script01_nifti-to-BIDS.m` script will use the JSON templates to populate the BIDS folders, as long as the fMRI sequence remains unchanged. If the sequence changes, generate new templates from the DICOM files.

---

## Missing Fields in JSON Files

Despite these steps, some BIDS fields in the sidecar JSON files may remain empty due to limitations of the Philips scanner. The most relevant fields that may be left empty are `SliceTiming` and [`PhaseEncodingDirection`](https://github.com/xiangruili/dicm2nii/issues/49).

- **SliceTiming**:
  - This field is required by fMRIPrep during slice timing correction.
  - Populate it using the `get_philips_MB_slicetiming.py` script, assuming you have access to a DICOM file and know the multiband factor (default is 2, as used in our lab).
    !!! warning
        The script assumes an interleaved, foot-to-head acquisition and will not work for other acquisition types.

- **PhaseEncodingDirection**:
  - This BIDS tag helps tools undistort images.
  - Philips DICOM headers specify the phase encoding axis (e.g., A-P or L-R) but not the polarity (A->P or P->A).
  - Check the scanner settings or consult with Ron to determine whether the polarity is AP or PA, and update the `?` in the JSON file with `+` or `-`.

!!! info "Handling NaNs in JSON Files"
    NaN values in JSON files can cause errors during the MRIQC workflow. To address NaN values, see the discussions in [this post](https://groups.google.com/g/mriqc-users/c/0v170KRJoKk), [this GitHub issue](https://github.com/nipreps/mriqc/issues/1089), and [this NeuroStars thread](https://neurostars.org/t/node-error-on-mriqc-wf-dwimriqc-computeiqms-datasink/29188).

For more details on Philips DICOM conversion, refer to the following resources:

- [Philips DICOM Missing Information - dcm2niix](https://github.com/rordenlab/dcm2niix/tree/master/Philips#missing-information)
- [PARREC Conversion - dcm2niix](https://github.com/rordenlab/dcm2niix/tree/master/PARREC)

---

## Where to Find Additional Info on the fMRI Sequence

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

---

Next Step --> [Set-up your environment](fmri-setup-env.md)
