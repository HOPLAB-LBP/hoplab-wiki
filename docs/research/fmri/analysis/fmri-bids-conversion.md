# Convert your fMRI data into BIDS format

- **TODO:**  add info about BIDS format and how-to


_Tim's suggestion edits_

After scanning participants, you will get data from the scanner and from the stimulus presentation computer, containing behavioural outputs (mainly `log` files and `.mat` files), functional and structural outputs, along potential `dicom` and other files (e.g. eye tracking data). Your first step will be to sort out these files and arrange them in a `sourcedata` folder (follow the structure in [How to store raw data](../fmri-general.md#how-to-store-raw-data)).

Once your data is arranged in this way, you can proceed to convert it to BIDS format.

_Here are the steps I would mention then:_

 - make one `events.tsv` file per functional run (if not already present) and add them to the `func` folder
 - optional: make an events.json sidecar file to describe potential extra columns in the event files
 - rename `nifti` files to fit with a BIDS naming format `sub-<label>_task-<label>_run-<label>_bold.nii`
 - anonymise the bold dicom files that you collected for your first participat by running `anonymize_dicm`
 - convert the anonymized dicom files using `dicm2nii`, in order to get the `.json` sidecar file that will serve as a sidecar for the next step
 - complete, in the the resulting sidecar file, the `PhaseEncodingDirection` and `SliceTiming` fields (see [Missing fields in JSON files](../fmri-general.md#missing-fields-in-json-files) for more information)
 - duplicate and rename the aforementioned sidecar `.json` file to have one per run to accompany each `bold.nii` file
 - include a `.gitignore` file if needed, to exclude potential working files from the BIDS validator
 - create a `dataset_description.json` file
 - create a `participants.tsv` and a `participants.json` files
 - create a `task-<taskname>_bold.json` file
 - create a `derivatives` folder, where future outputs will be placed
 - test your folder with the [BIDS validator](https://bids-standard.github.io/bids-validator/)

_It would definitely be nice to show a full tree of an example repostitory, and how it changes at each step of the way._

<!-- 
```
.
├── sub-41
│   ├── <your behaviour files>
│   ├── <log_file>.tsv
│   ├── <task_file>.mat
│   ├── ...
│   ├── <your potential DICOM files>
│   ├── IM_0001
│   ├── PS_0002
│   ├── XX_0003
│   ├── XX_0004
│   ├── ...
│   ├── <your functional nifti files>
│   ├── <subject>_Functional_run1.nii
│   ├── <subject>_Functional_run2.nii
│   ├── ...
│   ├── <your structural nifti files>
│   ├── <subject>_.nii

├── VAN_HOVE^LAURA_WIP_Functional_run6_9_1.nii
├── VAN_HOVE^LAURA_WIP_Functional_run7_10_1.nii
├── VAN_HOVE^LAURA_WIP_Functional_run8_11_1.nii
└── VAN_HOVE^LAURA_WIP_Functional_run9_12_1.nii
``` -->