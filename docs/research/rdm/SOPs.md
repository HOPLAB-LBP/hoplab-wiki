# How to manage your data at Hoplab

This workflow (or technically speaking, Standard Operating Procedures) is the product of a consultation process with the Book A Data Manager team in 2025-2026. They aim to provide guidelines for collecting, organizing, and analyzing research data across the modalities used in our studies.

## Data collection 

### 1. Ethical approval

Check whether the correct **ethical approval** is in place (see [this page](../ethics/index.md) for further information on the ethical procedure). 

- For behavioral and EEG studies, you need ethical approval from SMEC via the PRET platform;
- For fMRI studies and studies involving patients, you need to register your study at the CTC and Radiology department of UZ Leuven, become and authorized user of the MRI scanner and get ethical approval from EC Research UZ/KU Leuven (more detailed information [here](../fmri/fmri-get-started.md)).
- If your research is related to another study that has already been ethically approved, you can also file for an amendment to the existing approval. Note that for most studies in the NeuroSPACE project, ethical approval has already been obtained (fMRI: [S70813](https://kuleuven.sharepoint.com/:f:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/Ethical%20applications/EC%20onderzoek/S70813_Methusalem?csf=1&web=1&e=40KtDM/); EEG and behaviour: [G-2024-8685](https://kuleuven.sharepoint.com/:f:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/Ethical%20applications/SMEC/G-2024-8685_Methusalem/Latest%20documents?csf=1&web=1&e=Vc4LT7)).

    !!! warning "Important"
        Regularly update the number of participants you have tested (with a signed ICF) on each ethical application in the [ethics tracker](https://kuleuven.sharepoint.com/:x:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/Ethical%20applications/ethics_tracker.xlsx?d=w3176be826a5c428987db1b936bb8f422&csf=1&web=1&e=miRf4y). 

    !!! warning "Important"
        Make sure you are using the latest and correct (approved) recruitment materials, information letters, demographics questionnaires and informed consent forms (ICFs). Contact [Klara](https://www.kuleuven.be/wieiswie/nl/person/00116743) in case you are not sure which version you should use. 

### 2. Create project folder (SharePoint)

Create a **study-specific folder** on your personal SharePoint:

- Give it a sensible name, e.g. `2026-StudyAcronym-YourInitials`
- Required subfolders:
    - `confidential/`
    - `sourcedata/`
    - `BIDS/`
- Encrypt the `confidential/` folder ([how to encrypt](https://admin.kuleuven.be/icts/english/research/datamgmtpract/ape/encryption))
- Add a `README` in the root (see guidelines [here](./offboarding.md#non-research-project-files))

### 3. Set up your experiment

Follow the relevant instructions:

- Behavioural: [online or in-person setup](../behaviour/experimental-setup/index.md)  
- fMRI: [task template](https://github.com/HOPLAB-LBP/fMRI-task-template)  
- EEG: [task preparation instructions](../eeg/eeg-task.md)

### 4. Data acquisition

If applicable, **get acquainted with specific testing procedures** ([EEG](../eeg/eeg-acquisition.md)/[fMRI](../fmri/fmri-procedure.md)) and start collecting your data. For behavioural experiments, this can either be using one of the specified online platforms (Pavlovia, Meadows, Prolific, Microsoft Forms), directly from your PC or using paper questionnaires. 

### 5. Store raw data

5. **Save the experimental output** to the `sourcedata/` folder in your Sharepoint following the folder structure specified [here](../fmri/analysis/fmri-general.md#how-to-store-raw-data). 

    - For **paper questionnaires**: Digitize the (pseudonymized) data using either an OCR solution or manual transcription into spreadsheet software. Save the data in an open format. Note that in BIDS, `.tsv` is the preferred format for spreadsheets. Excel does not allow saving in `.tsv`; instead, you can export as `.txt` and change the file extension manually. You can also use this workaround to convert `.csv` files to `.tsv` files.
    - For data collected through an **online platform**: Export the data from the platform and save it in an open format (Pavlovia supports `.csv` and `.json`; Meadows supports `.csv`, `.json`, `.mat` and `.log`; Prolific supports `.csv`; Microsoft Forms only supports `.xlsx`). Make sure that the participant ID you use to store the research data is unique and thus different from the participant's SONA or Prolific ID. You can store the link between both in the `confidential` folder on your Sharepoint. 
    - In **EEG experiments**, raw EEG data are saved in the `.bdf` format (on the Windows PC) and associated behavioral data in `.csv` and `.log` formats (on the Linux PC). Move the data from both PCs using an SSD to your personal Sharepoint site. Ensure the output files are pseudonymized as far as possible without impacting research results before proceeding (e.g. through the [BESA Anonymizer](https://wiki.besa.de/index.php?title=BESA_Anonymizer) and using BIDS compliant subject IDs). 
    - In **fMRI experiments**, raw MRI data are automatically (temporarily) saved in the PACS system on the acquisition PC. To allow for optimal BIDS conversion of the data, export the data in DICOM format (more information [here](../fmri/analysis/fmri-general.md#how-to-get-images-from-the-scanner) and [here](../fmri/fmri-procedure.md#exporting-data)) using an SSD. Make sure to do the export **pseudonomously** by assigning a code name to the data (in BIDS format, e.g., `sub-01`), and to stick to a consisent DICOM layout across scans. Transfer the data from the SSD to your personal Sharepoint site.

### 6. Store signed consent forms 

Store **physically signed ICFs** properly in the designated secure location (i.e., a locked cupboard in your office). They must be stored for a retention period of at least 10 years (SMEC) or 25 years (EC). At the end of your study, you can bring them to the lab's physical data archive (ask [Klara](https://www.kuleuven.be/wieiswie/nl/person/00116743) in case you don't know where that is). 

### 7. Confidential data

**Confidential personal data** that is requested in the context of participant payment, communication of study results or at-home testing (name, phone number, email address, home address and/or bank account details) should be stored in the `confidential` folder on your Sharepoint. 

    !!! warning "Important"
        These are not part of the research data and need to be stored separately and encrypted to avoid reidentification of the participants ([how to encrypt](https://admin.kuleuven.be/icts/english/research/datamgmtpract/ape/encryption)). These data are to be deleted once they are no longer relevant (e.g., when the study is closed), unless participants explicitly agreed to store them longer for a specific purpose (discuss this with your PI before actually deleting them). 

## Data organisation

### 1. Convert to BIDS

Reorganize the raw data files in your `BIDS/` folder in accordance with the **BIDS metadata standard** ([behavioural data](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/behavioral-experiments.html); [EEG data](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html); [fMRI data](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/magnetic-resonance-imaging-data.html)). 

- Personal demographic information you collect (age, education level, handedness, etc.) is considered research data if you use them in your analysis, so they need to be stored pseudonymously as well. In BIDS, these can be described in a [participant file](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files/data-summary-files.html#participants-file) in the root directory of the dataset.
- Make sure to add all the [modality agnostic files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html) the BIDS format requires, such that your experiment and dataset is properly documented (see also the guidelines [here](./offboarding.md#research-data-in-bids)).
- For fMRI experiments, you can find a detailed in-lab example on how to do this for fMRI data [here](../fmri/analysis/fmri-bids-conversion.md). If possible (i.e., if it doesn't impact your research results), [deface your images](https://admin.kuleuven.be/privacy/en/studpers/pae/pseudonymisation#autotoc-item-autotoc-5) in this step to make the data more pseudonymous.  
- Note that you can include additional subdirectories within your `BIDS/` directory, such as a `stimuli/` directory [to store your stimulus files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files/events.html#stimuli-directory), or a `docs/` directory with supporting documents (e.g., test protocol, reports, presentations). The latter is not formally part of BIDS, but can be added to a to `.bidsignore` file to exclude from BIDS validation. You can also decide to keep this outside of the `BIDS` folder but save it in the Sharepoint project folder instead.
- Once you are ready, you can check whether your folder is BIDS compatible [here](https://github.com/bids-standard/bids-validator). 

### 2. Backup to ManGO

Push the data in your `sourcedata/` and `BIDS/` folders on Sharepoint to ManGO (central storage) **on a regular basis** during data collection (e.g., every week or after N participants). See [this page](/mango_active.md) for more information on how to do that.

    !!! warning "Important"
        Only pseudonymized data can be transferred to ManGO. Do not transfer your `confidential/` folder: this information should stay on Sharepoint only and should definitely not be in further back-ups or hard drives that you carry around. The `confidential/` folder might be deleted once it is no longer necessary to keep your pseudonymization key (to be discussed with your PI based on your ethics application).

    !!! Tip
        You don't have to delete anything from Sharepoint after the transfer (back-up), but if you need more space you can consider deleting intermediate steps that can be reproduced based on the raw data and essential scripts.

## Data preprocessing

### 1. Download data

Download the data from Sharepoint or ManGO to a local computer (e.g., your laptop, a more performant local computer or the [HPC infrastructure](../fmri/fmri-hpc.md)).

### 2. Preprocess data

Preprocess the data (see the guidelines for [setting up your fMRI analysis environment](../fmri/analysis/fmri-setup-env.md), [preprocessing of fMRI data](../fmri/analysis/fmri-prepocessing-qa.md) and [preprocessing of EEG data](../eeg/eeg-analysis.md)). 

### 3. Store preprocessing outputs

Organize and store all relevant preprocessing scripts and outputs in the appropriate `BIDS/` folders on your Sharepoint (preferably in open formats where feasible, with relevant metadata included).

- All outputs from preprocessing can be stored in a `derivatives/` folder in the main BIDS dataset root following [BIDS conventions](https://bids-specification.readthedocs.io/en/stable/derivatives/introduction.html).
- Create one subfolder per pipeline (e.g., `fmriprep/`, `first-level/`, `group-level/`, `mvpa-rsa/`, `mvpa-searchlight/`).
- Each subfolder must include a `dataset_description.json` file describing how the data were generated (e.g., software, version, pipeline). Optionally, include a `README` file for additional context or explanations.
- Any code used to generate the derivatives from the source data (e.g., the analysis scripts and pipelines), may be included in a `code/` subdirectory. Extra documentation (and relevant images) may be included in a `docs/` subdirectory. Logs from running the code or other commands may be stored in a `logs/` subdirectory.

### 4. Upload & clean up

Push the resulting data to ManGO using your preferred client and clear any data from your local device or the HPC environment. 

## Data analysis

### 1. Download data

Download the data from Sharepoint or ManGO to a local computer (e.g., your laptop, a more performant local computer or the [HPC infrastructure](../fmri/fmri-hpc.md)).

### 2. Perform analysis

- For **fMRI data**, perform first-level (subject) analysis and second-level (group) analysis (via the [SPM GUI](../fmri/analysis/fmri-glm.md]) or a [batch script](../fmri/analysis/fmri-glm-script.md)). If applicable, define subject-level or group-level ROIs (see [this page](../fmri/analysis/fmri-rois.md)), and perform multi-variate analysis (see [this page](../fmri/analysis/fmri-mvpa.md)). 
- For **EEG data**, you can find the analysis guidelines [here](../eeg/eeg-analysis.md). 
- For **purely behavioural data**, process them through your programming script (R, Matlab, Python).

### 3. Store analysis outputs

Organize and store all relevant analysis scripts and outputs in the appropriate `BIDS/` folders on your Sharepoint (preferably in open formats where feasible, with relevant metadata included).

- All outputs from preprocessing can be stored in a `derivatives/` folder in the main BIDS dataset root following [BIDS conventions](https://bids-specification.readthedocs.io/en/stable/derivatives/introduction.html).
- Create one subfolder per pipeline (e.g., `fmriprep/`, `first-level/`, `group-level/`, `mvpa-rsa/`, `mvpa-searchlight/`).
- Each subfolder must include a `dataset_description.json` file describing how the data were generated (e.g., software, version, pipeline). Optionally, include a `README` file for additional context or explanations.
- Any code used to generate the derivatives from the source data (e.g., the analysis scripts and pipelines), may be included in a `code/` subdirectory. Extra documentation (and relevant images) may be included in a `docs/` subdirectory. Logs from running the code or other commands may be stored in a `logs/` subdirectory.

### 4. Upload & clean up

Push the resulting data to ManGO using your preferred client and clear any data from your local device or the HPC environment. 