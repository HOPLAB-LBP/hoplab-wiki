# Convert your fMRI data into BIDS format

**TODO:**  add info about BIDS format and how-to

**TODO:**  get feedback on the whole thing, and fill in the sections below

**TODO:**  add figures. _It would definitely be nice to show a full tree of an example repostitory, and how it changes at each step of the way._

**NOTE:** [ANDREA] I have scripts to do some of the points below. For instance, the events files can and should (to avoid errors) be created from the mat files directly, the json files can be generated automatically, the nii files can be moved automatically.. etc. we should encourage people in using the scripts we already have to minimize issues in this first step


_Tim's suggestion edits below_

After scanning participants, you will get data from the scanner and from the stimulus presentation computer, containing behavioural outputs (mainly `log` files and `.mat` files), functional and structural outputs (`.nii` files), alongside potential `dicom` and other files (e.g. eye tracking data). Your first step will be to sort out these files and arrange them in a `sourcedata` folder (follow the structure in [How to store raw data](../fmri-general.md#how-to-store-raw-data)).

Once your data is arranged in this way, you can proceed to convert it to BIDS format. Here is an overview of the steps to take to ensure your data is arranged in a BIDS-compatible way:

1.  Make one `events.tsv` file per functional run and add them to the `func` folder.
2.  _Optional: make an `events.json` sidecar file to describe potential extra columns in the event files._
3.  Rename your functional `nifti` files to fit with a BIDS naming format `sub-<label>_task-<label>_run-<label>_bold.nii`.
4.  Rename your structural `nifti` files to fit with a BIDS naming format `sub-<label>_T1W.nii`.
5.  Anonymise the bold `dicom` files that you collected for your first participat by running `anonymize_dicm`.
6.  Convert the anonymized `dicom` files using `dicm2nii`, in order to get the `.json` sidecar file that will serve as a sidecar for the next step.
7.  Complete, in the the resulting sidecar file, the `PhaseEncodingDirection` and `SliceTiming` fields (see [Missing fields in JSON files](../fmri-general.md#missing-fields-in-json-files) for more information).
8.  Duplicate and rename the aforementioned sidecar `.json` file to have one per run to accompany each `bold.nii` file.
9.  Create a `dataset_description.json` file.
10. Create a `participants.tsv` and a `participants.json` files.
11. Create a `task-<taskname>_bold.json` file.
12. Create a `derivatives` folder, where future outputs will be placed.
13. _Optional: include a `.gitignore` file if needed, to exclude potential working files from the BIDS validator._
14. **If all the step above are complete, test your folder with the [BIDS validator](https://bids-standard.github.io/bids-validator/)**.



## Event files

Include information about event files. Mention how they should ideally be created directly by the behavioural task script. Add a link to the [task template](https://github.com/TimManiquet/fMRI-task-template) to show how that can be done.

Add information about making an `events.json` file and the advantages of it.

## Renaming `.nii` files

Give instructions on how to rename files, both functional and structural, including what happens in case of several scan sessions and the added `ses` label.

## Processing your DICOM files

Give information on how to use the anonymization and dicom to nifti scripts, and what the results should be like. Give links to the scripts.

### Completing the converted DICOM sidecar file

Explain how to get the two missing fields and why it's important. Link to the fmri-general section about it.

### Using the converted DICOM sidecar file

Explain how to duplicate and rename the sidecar file.

## Extra files to create

Give information on the files created in steps 9-13.
