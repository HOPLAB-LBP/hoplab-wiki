# General Notes

You should land on this page after collecting your fMRI data and [converting it to BIDS](./fmri-bids-conversion.md). Here, you’ll find all the general information and FAQs about fMRI protocols.

!!! tip "Data Storage Suggestion"
    Bring a **dedicated hard drive** to the hospital for storing the output data. This will ensure that you have a reliable medium to transfer and secure the raw data from the scanner.

!!! info "Where your data come from"
    MR11 (Siemens) sends DICOMs to XNAT (see [Getting your data](../fmri-procedure.md#getting-your-data-xnat)). The 7T is a GE scanner (see [Flanders 7T](../fmri-7t.md)). Notes for older Philips datasets are on the [MR8 archive page](../fmri-mr8.md).

---

## Quick Links to Resources

These resources provide essential information and tutorials that can be consulted before or during your journey into SPM and fMRI analysis:

- [SPM Online Documentation - fMRI Tutorials](https://www.fil.ion.ucl.ac.uk/spm/docs/tutorials/fmri/): A very nice set of tutorials for functional MRI analysis using Statistical Parametric Mapping (SPM).
- [fMRI Prep and Analysis with Andrew Jahn](https://www.youtube.com/@AndrewJahn): A ( _The_) YouTube channel offering tutorials on fMRI preprocessing and analysis, covering various aspects of neuroimaging.
- [SPM Programming Introduction](https://en.wikibooks.org/wiki/SPM/Programming_intro): An introduction to programming with SPM.
- [SPM Manual](https://www.fil.ion.ucl.ac.uk/spm/doc/manual.pdf): The official SPM manual, providing in-depth information on all aspects of SPM, from installation to advanced analysis techniques.
- [Introduction to SPM by Karl Friston](https://www.fil.ion.ucl.ac.uk/spm/doc/intro/): A brief guide to statistical parametric mapping, adapted from K. Friston’s 2003 introductory notes.

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

## Handling NaNs in JSON Files

NaN values in JSON files can cause errors during the MRIQC workflow. To address NaN values, see the discussions in [this post](https://groups.google.com/g/mriqc-users/c/0v170KRJoKk), [this GitHub issue](https://github.com/nipreps/mriqc/issues/1089), and [this NeuroStars thread](https://neurostars.org/t/node-error-on-mriqc-wf-dwimriqc-computeiqms-datasink/29188).

---

Next Step --> [Set-up your environment](fmri-setup-env.md)

<!--
__TODO__: [Andrea] Add Siemens (MR11, XA61 DICOM from XNAT) and GE (7T) notes for BIDS conversion: which fields dcm2niix fills (SliceTiming, PhaseEncodingDirection, TotalReadoutTime), and where to find sequence parameters on the Siemens console.
-->
