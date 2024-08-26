# Convert your fMRI data into BIDS format

**TODO:** [TIM] add info about BIDS format and how-to

**TODO:** [TIM] add figures. It would definitely be nice to show a full tree of an example repostitory, and how it changes at each step of the way.

**TODO:** [ANDREA] we need to add a step + script on how to anonymize even the filenames **at the hospital!** this is an important action point also highlighted in a recent email by  Hans. filenames of dicom/nift files must not have info (e.g., sub names) when they leave the hospital (i.e., when they are moved into hard  drives). Link the script I have to change these files. (we should do the same for DICOM/nifti headers and JSON if they carry any similar info).

**NOTE:** [ANDREA] I have scripts to do some of the points below. For instance, the events files can and should (to avoid errors) be created from the mat files directly, the json files can be generated automatically, the nii files can be moved automatically.. etc. we should encourage people in using the scripts we already have to minimize issues in this first step


## BIDS standards

To organize our fMRI dataset, we follow the [BIDS](https://bids-specification.readthedocs.io/en/stable/introduction.html) Specification.

If you are not familiar with the BIDS Specification, the [BIDS Starter Kit](https://bids-standard.github.io/bids-starter-kit/index.html) provides all the information needed to get started, along with [example BIDS datasets](https://bids-standard.github.io/bids-starter-kit/dataset_examples.html), [Talks and Slides](https://bids-standard.github.io/bids-starter-kit/talks.html), and most importantly [Tutorials](https://bids-standard.github.io/bids-starter-kit/tutorials/tutorials.html).

It is crucial that you get familiar with BIDS folders/files naming convention and structure. Most, if not all, the tools we are going to use in the next steps are [BIDS Apps](https://bids-apps.neuroimaging.io/apps/), and they rely on data organized following the BIDS Specification. Following this structure will make it easier to use these tools, share your code and data, and communicate with other scientists.

The BIDS Specification provides guidelines on how to organize all your data formats, including [(f/d)MRI](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/magnetic-resonance-imaging-data.html), [EEG](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/electroencephalography.html), [eye-tracking](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/physiological-and-other-continuous-recordings.html), [Task events](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html) associated with Neuro-Imaging recordings or [not](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/behavioral-experiments.html), and [Derivatives](https://bids-specification.readthedocs.io/en/stable/derivatives/imaging.html) (e.g., pre-processed files, Regions Of Interest mask files, GLM files, etc.).

At any moment, you can check your dataset for BIDS compliance. To do so, you can use the [BIDS dataset validator](https://bids-standard.github.io/bids-validator/). 

## BIDS Conversion Overview

After scanning participants, you'll obtain data from two primary sources:

1. The scanner: Functional and structural outputs (`.nii` files), alongside potential `dicom` files
2. The stimulus presentation computer: Behavioural outputs (mainly `log` files and `.mat` files) and potentially eye-tracking data

Your first step is to organize these files in a `sourcedata` folder. Follow the structure outlined in [How to store raw data](../fmri-general.md#how-to-store-raw-data). Once your data is properly arranged, you can proceed to convert it to BIDS format.

Here's a high-level overview of the steps involved in arranging your data in a BIDS-compatible way. While this provides a general understanding, most of these steps should be performed using the code provided in each sub-section to minimize errors.

1. Create `events.tsv` files (more info on required and optional columns can be found [here](https://bids-specification.readthedocs.io/en/stable/modality-specific-files/task-events.html)):

    - Make one file per functional run
    - Add them to the `./BIDS/sub-xx/func` folder
    - *Optional:* Create an `events.json` sidecar file to describe extra columns in event files

    Example:

    ```
    └─ sub-01/
    └─ func/
      ├─ sub-01_task-stopsignal_events.tsv 
      └─ sub-01_task-stopsignal_events.json 
    ```

2. Rename functional `nifti` files:

    - Follow BIDS naming format: `sub-<label>_task-<label>_run-<label>_bold.nii`
    - Add them to the `./BIDS/sub-xx/func` folder

3. Rename structural `nifti` files:

    - Follow BIDS naming format: `sub-<label>_T1W.nii`
    - Add them to the `./BIDS/sub-xx/func` folder

4. *Optional:* Process `dicom` files (if you got DICOM files from the scanner):

    - Anonymize bold `dicom` files for your first participant using `anonymize_dicm`
    - Convert anonymized `dicom` files using `dicm2nii` to get `.json` sidecar files for your anatomical or function scans.
   
    !!! info "JSON files"
        Each `nii` file **must** have a sidecar JSON file. However, if your fMRI protocol did not change, all the important JSON fields are going to be the same across different scanning sessions, and therefore JSON files can be re-used across subjects. This will save you some time, since getting DICOM files from the scanner can be quite time-consuming.

5. Update `.json` sidecar files:

    - Complete the `PhaseEncodingDirection` and `SliceTiming` fields (see [Missing fields in JSON files](../fmri-general.md#missing-fields-in-json-files) for more information)
    - Duplicate and rename sidecar files to accompany each `bold.nii` file

6. Create essential [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson):

    - `dataset_description.json`
    - `participants.tsv` and `participants.json`
    - `task-<taskname>_bold.json`

7. Set up additional components:

    - Create a `derivatives` folder for future outputs
    - *Optional*: Include a `.bidsignore` file if needed

8. Validate your BIDS structure:

    - Use the [BIDS validator](https://bids-standard.github.io/bids-validator/)

By following these steps systematically, you'll ensure your data is properly organized in BIDS format, facilitating easier analysis and collaboration.

## Step-by-step instructions

Here we provide more detailed instructions to perform each of the steps mentioned above. 

!!! warning "Folder Structure"
    All the steps and scripts below assume a specific folder structure and file naming convention. They **will not work** otherwise. Ensure you strictly follow the instructions in the [How to store raw data](../fmri-general.md#how-to-store-raw-data) page.

    **TODO:** [ANDREA] in the how to store raw data page, create a folders tree that includes all the relevant folders and subfolder. The current tree is not complete.

### Creating Event Files

Event files are crucial for analyzing fMRI data. They contain information about the timing and nature of stimuli or tasks during the scan. To create your event files manually:

1. Navigate to your `sourcedata/sub-xx/bh/` folder.
2. Locate the behavioral output files (`.mat` or `.log`) for each run.
3. Create a corresponding `events.tsv` file for each run in the `BIDS/sub-xx/func/` folder.

Each `events.tsv` file should contain at least three columns: `onset`, `duration`, and `trial_type`. Additional columns can be included as needed for your specific analysis.

**TODO:** [ANDREA] Add script for automatically converting behavioral data to BIDS-compliant event files.

**TODO:** [TIM] Include information about event files. Mention how they should ideally be created directly by the behavioural task script. Add a link to the [task template](https://github.com/TimManiquet/fMRI-task-template) to show how that can be done.

**TODO:** [TIM] Add information about making an `events.json` file and the advantages of it.

**TODO:** [TIM] Add information about using event files to make contrasts in the SPM step. Having a 'condition' + column for instance might be quite useful.

**TODO:** [TIM] Give information about which columns will be useful to include in such files, why, and at what + future step they will become important.

### Converting DICOM files (Optional)

If you have DICOM files from the scanner:

1. Navigate to your `sourcedata/sub-xx/dicom/` folder.
2. Use the `anonymize_dicm` script to anonymize the DICOM files.
3. Use the `dicm2nii` script to convert the anonymized DICOM files to NIfTI.

**TODO:** [ANDREA] Add scripts for automating DICOM anonymization and conversion.

**TODO:** [TIM] Give information on how to use the anonymization and dicom to nifti scripts, and what the results should be like. Give links to the scripts.

### Creating JSON Sidecar Files

1. Locate the JSON sidecar files in `sourcedata/sub-xx/dicom_converted/`.
2. Open each JSON file and update the `PhaseEncodingDirection` and `SliceTiming` fields.
3. Copy the updated JSON files to accompany each NIfTI file in the BIDS folder.

Each `nii` file must have a corresponding JSON sidecar file. If your fMRI protocol didn't change, you can reuse JSON files across subjects.

**TODO:** [ANDREA] Add script for automatically updating and copying JSON sidecar files.

**TODO:** [TIM] Explain how to get the two missing fields and why it's important. Link to the fmri-general section about it.

**TODO:** [TIM] Explain how to duplicate and rename the sidecar file.

**TODO:** [ANDREA] fill this out with more in depth info about the JSON etc.

### Renaming and Moving NIfTI Files

1. Navigate to your `sourcedata/sub-xx/dicom_converted/` folder.
2. Identify the functional and structural NIfTI files.
3. Rename the files following BIDS conventions:
    - Functional: `sub-<label>_task-<label>_run-<label>_bold.nii`
    - Structural: `sub-<label>_T1w.nii`
4. Move the renamed files to their respective folders in `BIDS/sub-xx/`:
    - Functional files go to `BIDS/sub-xx/func/`
    - Structural files go to `BIDS/sub-xx/anat/`

**TODO:** [ANDREA] is dicom converted and nii the same folder? from which folder should we get the final nifti files to move? this folder needs to be consistent across different workflows (e.g., dicom conversion or just nifti files)

**TODO:** [TIM] Give instructions on how to rename files, both functional and structural, including what happens in case of several scan sessions and the added `ses` label.

??? tip "Rename and move automatically"
    Here is a MATLAB script that can do this automatically (change the input and output folders, run names and subjects numbers according to your needs):

    ```octave title="nii2BIDS.m" linenums="1"
    % MATLAB script to convert fMRI data to BIDS format.
    %
    % This script processes a range of subject data stored in a given directory 
    % structure and organizes them into the BIDS (Brain Imaging Data Structure) format.
    % It uses a predefined mapping to rename functional data runs and then copies 
    % the files to the appropriate BIDS directories, creating them if they don't exist.
    % The script also matches JSON sidecar files from a specified directory to their 
    % respective NIfTI images. The NIfTI files and JSON sidecar files are named according 
    % to the BIDS naming convention.
    %
    % Input:
    % - Raw NIfTI files and JSON files of the subjects.
    % 
    % Output:
    % - Organized NIfTI files and associated JSON files in BIDS structure.
    %
    % Author: Andrea Costantino
    % Created: January 7, 2021

    clear all; % Clear all the variables from the workspace.
    clc; % Clear the command window.

    % Define the base directories
    baseInputDir = "/data/projects/chess/data/sourcedata";
    outdir = "/data/projects/chess/data/BIDS";
    jsonDir = "data/project/chess/code/misc";
    dirs = {'anat', 'func'}; % Define the BIDS modality directories.

    % Define the mappings between run names and task names
    runNameToTaskName = containers.Map({'Functional', 'Localizer1', 'Localizer2'}, {'exp', 'loc1', 'loc2'});

    % Define the start and end subjects
    startSub = 41;
    endSub = 44;

    % Handle the case for a single subject or a range of subjects.
    if startSub == endSub
        subjects = {sprintf('sub-%02d', startSub)};
    else
        subjects = arrayfun(@(x) sprintf('sub-%02d', x), startSub:endSub, 'UniformOutput', false);
    end

    % Loop through each subject to organize their data.
    for subIndex = 1:numel(subjects)
        subID = subjects{subIndex};
        
        fprintf('Processing %s...\n', subID); % Print status to command window.

        % Define paths for current subject's raw NIfTI data.
        % Check if directory is 'nifti' or 'nii' and define the path
        if exist(fullfile(baseInputDir, subID, 'nifti'), 'dir')
            dirname = fullfile(baseInputDir, subID, 'nifti');
        elseif exist(fullfile(baseInputDir, subID, 'nii'), 'dir')
            dirname = fullfile(baseInputDir, subID, 'nii');
        else
            error('Neither nifti nor nii directory exists for %s', subID);
        end

        dirPaths = containers.Map();

        % Create BIDS directories for current subject if they don't exist.
        for i = 1:length(dirs)
            dirPath = fullfile(outdir, subID, dirs{i});
            dirPaths(dirs{i}) = dirPath;

            if ~exist(dirPath, 'dir')
                mkdir(dirPath); 
                fprintf('Created %s folder for %s successfully!\n', dirs{i}, subID);
            else
                fprintf('%s folder for %s already exists!\n', dirs{i}, subID);
            end
        end

        % Extract BIDS directory paths for anatomical and functional data.
        anatDir = dirPaths('anat');
        funcDir = dirPaths('func');

        % List all NIfTI and NIfTI.GZ files of the current subject.
        fileList = [dir(fullfile(dirname, '*.nii')); dir(fullfile(dirname, '*.nii.gz'))];

        % Process each NIfTI file to copy and rename it according to BIDS.
        for i = 1:length(fileList)
            currentFilename = fileList(i).name;
            fprintf('Processing file: %s\n', currentFilename);

            % Check if the file is compressed (.nii.gz)
            if contains(currentFilename, '.nii.gz')
                % Decompress the .nii.gz file to the output directory
                decompressedFile = gunzip(fullfile(fileList(i).folder, currentFilename), dirPaths('func'));
                currentFilename = decompressedFile{1}; % Update currentFilename to the decompressed filename
            end

            if contains(currentFilename, '3DTFE')
                % Anatomical data processing
                newAnatFilename = fullfile(anatDir, [subID, '_T1w.nii']);
                if contains(currentFilename, '.gz')
                    movefile(currentFilename, newAnatFilename);
                else
                    copyfile(fullfile(fileList(i).folder, currentFilename), newAnatFilename);
                end
                
                % Look for the corresponding JSON sidecar file.
                jsonFiles = dir(fullfile(jsonDir, 'sub-xx_T1w.json'));
                if length(jsonFiles) > 1
                    error('Multiple JSON files found for T1w data. Please ensure only one correct JSON exists.');
                elseif isempty(jsonFiles)
                    fprintf('Warning: JSON file for %s T1w not found.\n', subID);
                else
                    copyfile(fullfile(jsonFiles(1).folder, jsonFiles(1).name), fullfile(anatDir, [subID, '_T1w.json']));
                end
            else
                % Functional data processing
                splitStr = split(currentFilename, '_');
                runName = splitStr{end-3};
                runNumber = str2double(regexp(splitStr{end-2}, '\d+', 'match'));
                taskName = runNameToTaskName(runName);

                newFileName = sprintf('%s_task-%s_run-%d_bold', subID, taskName, runNumber);
                newFuncFilename = fullfile(funcDir, [newFileName, '.nii']);
                if contains(currentFilename, '.gz')
                    movefile(currentFilename, newFuncFilename);
                else
                    copyfile(fullfile(fileList(i).folder, currentFilename), newFuncFilename);
                end

                % Look for the corresponding JSON sidecar file.
                jsonFiles = dir(fullfile(jsonDir, sprintf('sub-xx_task-%s_run-x_bold.json', taskName)));
                if length(jsonFiles) > 1
                    error('Multiple JSON files found for %s, task %s, run %d. Please ensure only one correct JSON exists.', subID, taskName, runNumber);
                elseif isempty(jsonFiles)
                    fprintf('Warning: JSON file for %s task %s run %d not found.\n', subID, taskName, runNumber);
                else
                    copyfile(fullfile(jsonFiles(1).folder, jsonFiles(1).name), fullfile(funcDir, [newFileName, '.json']));
                end 
            end
        end

        fprintf('Finished processing %s.\n\n', subID); % Print status to command window.
    end
    ```

### Creating Essential BIDS Files

1. Create the following [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson) files in your `BIDS/` root folder:
    - `dataset_description.json`
    - `participants.tsv`
    - `participants.json`
    - `task-<taskname>_bold.json`

2. Fill in the required information for each file according to the BIDS specification.

!!! tip "Modality agnostic templates"
    In the [modality agnostic BIDS files](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#dataset_descriptionjson) page, you can find templates and examples.

### Setting Up Additional Components

1. Create a `derivatives/` folder in your `BIDS/` directory.
2. If needed, create a `.bidsignore` file in your `BIDS/` root folder to exclude any non-BIDS compliant files.

!!! question "Why should I use a .bidsignore file?"
    A `.bidsignore' file is useful to communicate to the BIDS validator which files should not be indexed, because they are not part of the standard BIDS structure. More information can be found [here](https://neuroimaging-core-docs.readthedocs.io/en/latest/pages/bids-validator.html#creating-a-bidsignore).
    

### Validating Your BIDS Structure

1. Use the online [BIDS Validator](https://bids-standard.github.io/bids-validator/) to check your BIDS structure.
2. Upload your entire `BIDS/` folder and review any errors or warnings.
3. Make necessary corrections based on the validator's output.

By following these detailed steps, you'll ensure your data is properly organized in BIDS format, facilitating easier analysis and collaboration.
