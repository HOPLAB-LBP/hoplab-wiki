# Introduction to SPM Scripting with `matlabbatch`

You should land on this page after having collected your fMRI data, [converted it to BIDS](./fmri-bids-conversion.md) and [preprocessed it](./fmri-prepocessing-qa.md). Your goal now is to model the BOLD activity with a Generalised Linear Model (GLM), in order to obtain the beta values on which to apply further analyses. Here, we do so using SPM (Statistical Parametric Mapping), and by **scripting** the steps taken by SPM. While the SPM GUI makes analysis accessible, scripting with `matlabbatch` in MATLAB provides a reproducible, automated workflow. This guide introduces you to SPM scripting, from using the GUI to generate code snippets to creating a full multi-step `matlabbatch` job for SPM.

You should start here if you are familiar with SPM and what it does. If you feel like the analysis steps are still unclear to you, take some time to learn them by using the GUI first. Check out [First-level analysis - GUI](./fmri-glm.md).

---

## 1. Start with the SPM GUI

SPM's GUI is a valuable resource for beginners. It allows you to set analysis parameters interactively and generate corresponding MATLAB code. This method helps you learn which settings are required for each analysis step and understand how they translate into code.

### **Steps in the GUI**

1. **Open SPM** by typing `spm fmri` in the MATLAB command window, then click `Batch`
2. **Navigate through each analysis step** you want to script. For example, start with `fMRI Model Specification` under the `SPM` --> `Stats` menu.
3. **Set parameters** such as:
    - Timing (e.g., Repetition Time, microtime resolution).
    - Session information (e.g., scans, conditions, and high-pass filter).
4. **See the code** by clicking on `View` --> `Show .m code`.

    This should show something like this:

    ```matlab
    matlabbatch{1}.spm.stats.fmri_spec.dir = '<UNDEFINED>';
    matlabbatch{1}.spm.stats.fmri_spec.timing.units = '<UNDEFINED>';
    matlabbatch{1}.spm.stats.fmri_spec.timing.RT = '<UNDEFINED>';
    matlabbatch{1}.spm.stats.fmri_spec.timing.fmri_t = 16;
    matlabbatch{1}.spm.stats.fmri_spec.timing.fmri_t0 = 8;
    matlabbatch{1}.spm.stats.fmri_spec.sess = struct('scans', {}, 'cond', {}, 'multi', {}, 'regress', {}, 'multi_reg', {}, 'hpf', {});
    matlabbatch{1}.spm.stats.fmri_spec.fact = struct('name', {}, 'levels', {});
    matlabbatch{1}.spm.stats.fmri_spec.bases.hrf.derivs = [0 0];
    matlabbatch{1}.spm.stats.fmri_spec.volt = 1;
    matlabbatch{1}.spm.stats.fmri_spec.global = 'None';
    matlabbatch{1}.spm.stats.fmri_spec.mthresh = 0.8;
    matlabbatch{1}.spm.stats.fmri_spec.mask = {''};
    matlabbatch{1}.spm.stats.fmri_spec.cvi = 'AR(1)';
    ```

!!! tip
    To use this feature to learn scripting, save several batches with different parameters. Open the generated code to see how each parameter is defined in `matlabbatch`.

Here’s an example of how to use the GUI to extract the respective code, here using **fMRI Model Specification** and **Estimation**.

1. **Model Specification**:
    - Go to **SPM > Stats > fMRI Model Specification**.
    - Set timing parameters (e.g., TR, microtime resolution).
    - Add conditions and high-pass filter settings.
    - Save the batch via **File > Save Batch and Script**.
    - Open the generated script and review settings like:

        ```matlab
        matlabbatch{1}.spm.stats.fmri_spec.dir = {'/path/to/output'};
        matlabbatch{1}.spm.stats.fmri_spec.timing.RT = 2;  % Repetition Time in seconds
        ```

2. **Model Estimation**:
    - In the GUI, go to **Stats > Model Estimation**.
    - Select your `SPM.mat` file and save the settings.
    - Observe that model estimation is added as `matlabbatch{2}` in the saved script:

        ```matlab
        matlabbatch{2}.spm.stats.fmri_est.spmmat = {'/path/to/SPM.mat'};
        matlabbatch{2}.spm.stats.fmri_est.method.Classical = 1; % Classical estimation
        ```

## 2. Understand the Basics of `matlabbatch` Jobs

The `matlabbatch` structure in SPM is a versatile container for storing all settings and steps for your analysis. Each field in `matlabbatch` corresponds to a parameter in the SPM GUI.

### **Key Concepts of `matlabbatch` Jobs**

- **Jobs and Batches**: In SPM scripting, "job" refers to a specific processing step (e.g., model specification or estimation), while "batch" is a collection of jobs executed sequentially.
- **Fields and Indexing**: Each field in `matlabbatch` corresponds to a specific setting. For example, `matlabbatch{1}.spm.stats.fmri_spec.timing.RT` sets the repetition time (TR).
- **Sessions**: Sessions in `matlabbatch` typically refer to fMRI runs and are indexed using `sess(runIdx)` for each run in an analysis.
  
!!! info "SPM Batch Workflow"
    In SPM scripting, all parameters are set first in `matlabbatch`, then executed together in a single command:

    ```matlab  linenums="1"
    spm_jobman('run', matlabbatch);
    ```

## 3. Assembling `matlabbatch` Jobs in MATLAB

With the basics covered, let’s construct a full `matlabbatch` job in MATLAB. This example demonstrates setting up a simple fMRI model specification, estimation, and contrast definition.

=== "Code Block: Full `matlabbatch` Example"

    ```matlab  linenums="1"
    % Define output directory and timing parameters
    matlabbatch{1}.spm.stats.fmri_spec.dir = {'/path/to/output'};
    matlabbatch{1}.spm.stats.fmri_spec.timing.RT = 2;
    matlabbatch{1}.spm.stats.fmri_spec.timing.fmri_t = 16;
    matlabbatch{1}.spm.stats.fmri_spec.timing.fmri_t0 = 8;

    % Define sessions (runs) and scans
    matlabbatch{1}.spm.stats.fmri_spec.sess(1).scans = {'/path/to/run1.nii'};
    matlabbatch{1}.spm.stats.fmri_spec.sess(1).cond(1).name = 'Condition A';
    matlabbatch{1}.spm.stats.fmri_spec.sess(1).cond(1).onset = [10, 20, 30];
    matlabbatch{1}.spm.stats.fmri_spec.sess(1).cond(1).duration = [5, 5, 5];

    % Model estimation
    matlabbatch{2}.spm.stats.fmri_est.spmmat = {'/path/to/output/SPM.mat'};
    matlabbatch{2}.spm.stats.fmri_est.method.Classical = 1;

    % Contrast specification
    matlabbatch{3}.spm.stats.con.spmmat = {'/path/to/output/SPM.mat'};
    matlabbatch{3}.spm.stats.con.consess{1}.tcon.name = 'Condition A > Baseline';
    matlabbatch{3}.spm.stats.con.consess{1}.tcon.weights = 1;
    matlabbatch{3}.spm.stats.con.consess{1}.tcon.sessrep = 'none';
    ```

    Each block in `matlabbatch` represents one step in the analysis, identical to configuring them in the GUI.

!!! important
    This code will run all steps sequentially when you call `spm_jobman('run', matlabbatch);`. In this example:
    - `matlabbatch{1}` specifies the model.
    - `matlabbatch{2}` estimates the model.
    - `matlabbatch{3}` defines the contrasts.

---

## 4. Executing the Job in MATLAB

With all steps defined in `matlabbatch`, execute the entire analysis workflow:

```matlab  linenums="1"
spm('defaults', 'fmri');
spm_jobman('initcfg');
spm_jobman('run', matlabbatch);
```

- `spm('defaults', 'fmri');`: Initializes SPM with fMRI defaults.
- `spm_jobman('initcfg');`: Prepares the job manager for execution.
- `spm_jobman('run', matlabbatch);`: Executes all defined steps in sequence, producing output in the specified directory.

---

## 5. Organizing Code in Functions

Using functions in MATLAB effectively improves code readability, reduces redundancy, and simplifies maintenance.

Here’s a breakdown of best practices for managing functions in MATLAB, including where to place them and how to add their directory to the MATLAB path.

### Where to Place Functions

=== "**Reusable Functions**"
    If a function is intended for use across multiple scripts, it's best to save it as a separate `.m` file in a designated folder (e.g., `scripts/functions`). This keeps your code organized and ensures that changes to the function are applied consistently across all scripts.

    To make sure MATLAB can locate your function, add the functions folder to the MATLAB path. This can be done in two ways:

    1. **Command Line**: Run the following command in the MATLAB command window:

        ```matlab
        addpath('/path/to/scripts/functions');
        ```

    2. **Using the MATLAB GUI**:
        - Go to **Home > Set Path**.
        - Click **Add Folder…** and navigate to the folder containing your functions.
        - Click **Save** to add this path permanently or **Close** to add it temporarily for the session.

    By adding the folder to your path, the function is accessible across all scripts, ensuring consistency and reducing redundancy.

=== "**Script-Specific Functions**"
    If a function is specifically tailored for a single script and not intended for reuse, include it at the end of that script. This keeps the function accessible only within the script, reducing dependencies on external files.

    Here’s an example of including a function at the end of a script.

    ```matlab
    % Main part of the script
    myVar = setup_variable(10, 5);

    % Function definition at the end of the script
    function result = setup_variable(a, b)
        % This function takes two numbers and multiplies them
        result = a * b;
    end
    ```

### Example: Creating a Reusable Function

If `setup_variable` is a function you’ll use frequently, save it as a separate `.m` file in your `functions` directory. The function file `setup_variable.m` might look like this:

```matlab
function result = setup_variable(a, b)
    % This function takes two numbers and multiplies them
    result = a * b;
end
```

Then, in your main script, you can call the function after adding the functions folder to the path. For example:

```matlab
addpath('/path/to/functions');
myVar = setup_variable(10, 5);
```

---

## 6. Full code example

Once you have a general understanding of using the SPM GUI and `matlabbatch` scripting, you’re ready to try more advanced scripting techniques. This final section provides a complete example script that integrates everything covered so far. Specifically, the script below:

- Sets up essential parameters and paths for analyzing fMRI data,
- Loads event and confound files for each run,
- Specifies, estimates, and applies contrasts for a General Linear Model (GLM) in SPM,
- Saves the final model and a copy of the script for reproducibility.

Below, you’ll find the main script, `performGLMAutoContrast.m`, which performs all these steps, and all required functions to execute the script. Most of the  functions are completely stand-alone, and can be used in your own projects (e.g., `smoothNiftiFile`, `gunzipNiftiFile`, `fMRIprepConfounds2SPM`, `eventsBIDS2SPM`).

These functions can either be saved as standalone `.m` files in a `functions` folder (e.g., `setup_model_specification.m`) or simply copy-pasted at the end of the script for direct use. If you choose to save functions as standalone files, make sure the filename exactly matches the function name (e.g., `setup_model_specification.m` for a function called `setup_model_specification`). This ensures MATLAB can locate and run the function correctly.

??? example "performGLMAutoContrast.m"
    ```matlab  linenums="1"
    % GLM Analysis Script for fMRI Data using SPM
    %
    % This script performs a General Linear Model (GLM) analysis on fMRI data that has been preprocessed using fMRIprep and
    % is organized in BIDS format. It is designed to run in MATLAB using SPM, specifically for researchers who may be
    % unfamiliar with SPM scripting but have fMRI data analysis needs. The script follows standard steps for GLM setup,
    % specification, estimation, and contrast definition, which are essential in understanding task-related brain activity.
    %
    % Overview of What This Script Does:
    % - Sets up paths and parameters.
    % - Loads event and confound data for each run and prepares it for GLM analysis.
    % - Specifies the GLM parameters, including timing, high-pass filter, and basis function.
    % - Runs model specification and estimation to fit the GLM to the fMRI data.
    % - Defines contrasts to test specific hypotheses.
    % - Saves the final model and a copy of this script for future reference.
    %
    % Steps in this Script:
    % 1. **Set Parameters**: Define paths to data, fMRI timing parameters, selected tasks, contrasts, and subjects.
    % 2. **Load Events and Confounds**: Each run`s event (trial timing) and confound (noise regressors) data are loaded
    %    from BIDS-compliant TSV and JSON files produced by fMRIprep. This prepares each run for GLM analysis.
    % 3. **SPM Model Specification**: Sets up a structure (called`matlabbatch`) that stores all necessary parameters
    %    for defining the GLM model. Each parameter here mirrors options in the SPM GUI.
    % 4. **Run Model Specification and Estimation**: Once all parameters are set in`matlabbatch`, we run batches 1
    %    and 2. Batch 1 specifies the model, and batch 2 estimates the model using the data and settings we’ve defined.
    % 5. **Check SPM.mat File**: Verifies the existence of the SPM.mat file after running the model, confirming the
    %    model specification and estimation steps were successful.
    % 6. **Define and Run Contrasts**: Sets up contrasts based on hypotheses about brain activity, applies them, and
    %    stores results. This is done in batch 3.
    % 7. **Save Script**: Saves a copy of this script in the output folder for reproducibility and future reference.

    % Working with matlabbatch and SPM Batches:
    % - `matlabbatch` is a structure used by SPM to store each step of an analysis, organized as separate fields for 
    %   each processing stage (e.g., model specification, model estimation, contrast definition). Each entry in 
    %   `matlabbatch` corresponds to a batch operation you could run manually in the SPM GUI. SPM’s batch system is 
    %   powerful because it allows us to set parameters programmatically in a way that is identical to the GUI.
    % - **Setting Parameters**: Each field in `matlabbatch` represents a setting or action, matching options in the 
    %   SPM GUI. For example, in this script, `matlabbatch{1}.spm.stats.fmri_spec.timing.RT` corresponds to setting 
    %   the Repetition Time (RT) in the SPM GUI.
    % - **Retrieving GUI Code**: To see the code for any parameter set in the SPM GUI, configure the GUI settings and 
    %   then select **File > Save Batch and Script**. SPM will generate MATLAB code that mirrors the GUI settings, 
    %   which you can use to understand how `matlabbatch` fields align with GUI options.
    %
    % Understanding SPM Batches and Sessions:
    % - In SPM, **sessions** represent individual runs in a study. Each run (session) is specified separately within 
    %   `matlabbatch`, which enables you to specify different conditions or timing settings per run if necessary.
    % - We use indexing within `matlabbatch` to indicate which session or contrast we’re defining. For instance, 
    %   `matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).scans` refers to the scans (images) in session `runIdx`.
    %
    % How SPM Executes Batches:
    % - SPM uses a deferred execution approach: parameters are specified first by configuring `matlabbatch`, and 
    %   then `spm_jobman('run', matlabbatch)` initiates all specified processing steps in sequence, similar to 
    %   clicking "Run" in the GUI. In this script, we define `matlabbatch` elements in sequence (batches 1 to 3) 
    %   and run them together in one command to automate the workflow.
    %
    % Assumptions about Input Data:
    % - Data must be preprocessed using fMRIprep and follow the BIDS format.
    % - Event files (in TSV format) must adhere to BIDS specifications.
    % - Confound files (in JSON and TSV formats) must adhere to fMRIprep output standards.
    %
    % Requirements:
    % - SPM12 (or a compatible version) must be installed and added to the MATLAB path.
    %
    % This script automates the process typically done in the SPM GUI.

    % Parameters:
    % - selectedSubjectsList: List of subject IDs to include in the analysis. Can be a list of integers or '*' to include all subjects.
    % - selectedRuns: List of run numbers to include in the analysis. Can be a list of integers or '*' to include all runs.
    % - selectedTasks: Structure array with information about the task(s) to analyze.
    %     Each task must have the following fields:
    %     - name: String. The name of the task.
    %     - contrasts: Cell array of strings. The name(s) of the contrast(s).
    %     - weights: Cell array of structs. The weights for the contrast(s).
    %     - smoothBool: Boolean. Whether to smooth the data before the GLM.
    %
    % Example of defining tasks, weights, and contrasts:
    % selectedTasks(1).name = 'loc';
    % selectedTasks(1).contrasts = {'Faces > Objects', 'Objects > Scrambled', 'Scenes > Objects'};
    % selectedTasks(1).weights(1) = struct('Faces', 1, 'Objects', -1, 'Scrambled', 0, 'Scenes', 0);
    % selectedTasks(1).weights(2) = struct('Faces', 0, 'Objects', 1, 'Scrambled', -1, 'Scenes', 0);
    % selectedTasks(1).weights(3) = struct('Faces', 0, 'Objects', -1, 'Scrambled', 0, 'Scenes', 1);
    % selectedTasks(1).smoothBool = true;
    %
    % Paths:
    % - fmriprepRoot: Path to the root folder of the fMRIprep output.
    % - BIDSRoot: Path to the root folder of the BIDS dataset.
    % - outRoot: Path to the output root folder for the analysis results.
    %
    % Preprocessing Options (uses fMRIprep confounds table):
    % - pipeline: Denoising pipeline strategy for SPM confound regression.
    %     It should be a cell array of strings specifying the strategies to use.
    %     Possible strategies:
    %         HMP - Head motion parameters (6,12,24)
    %         GS - Brain mask global signal (1,2,4)
    %         CSF_WM - CSF and WM masks global signal (2,4,8)
    %         aCompCor - aCompCor (10,50)
    %         MotionOutlier - motion outliers FD > 0.5, DVARS > 1.5, non-steady volumes
    %         Cosine - Discrete cosine-basis regressors (low frequencies) -> HPF
    %         FD - Raw framewise displacement
    %         Null - Returns a blank data frame
    %
    % Example:
    % pipeline = {'HMP-6','GS-1','FD'};
    % This selects the 6 head motion parameters, the global signal, and the raw Framewise Displacement value.
    %
    % Author: Andrea Ivan Costantino
    % Date: 5 July 2023

    % This section of the script defines parameters and settings necessary for a GLM analysis in SPM, using fMRI data
    % preprocessed with fMRIPrep. We first set up the required paths, select specific subjects, tasks, and contrasts, 
    % and define analysis parameters like repetition time and timing information. The final block iterates through 
    % subjects and tasks, setting up each run of the GLM and checking for the existence of the required data before
    % beginning the analysis. This setup ensures a consistent pipeline for different subjects and tasks.

    clc
    clear

    %% PARAMETERS

    % Define the space of the images ('T1w' or 'MNI'); in this case, we use MNI space at 2mm resolution.
    niftiSpace = 'MNI152NLin2009cAsym_res-2';

    % Define the root directory for the BIDS dataset (where the data is stored).
    BIDSRoot = '/data/projects/chess/data/BIDS';

    % Define paths relative to the BIDS root:
    fmriprepRoot = fullfile(BIDSRoot, 'derivatives', 'fmriprep'); % Path to fMRIprep output data.
    outRoot = fullfile(BIDSRoot, 'derivatives', 'fmriprep-SPM-TEST', niftiSpace); % Directory for storing analysis results.
    tempDir = fullfile(BIDSRoot, 'derivatives', 'fmriprep-preSPM'); % Temporary storage for intermediate files.

    % Define fMRI timing parameters.
    RT = 2;           % Repetition time (TR) in seconds, the time between consecutive volume acquisitions.
    fmri_t = 60;      % Microtime resolution (number of slices).
    fmri_t0 = fmri_t / 2;     % Microtime onset (reference slice for alignment).

    % Define the subjects and runs to include in the analysis.
    selectedSubjectsList = [1,2,3]; % List of subject IDs to include (or use '*' for all subjects).
    selectedRuns = '*'; % Runs to include, with '*' indicating all available runs.

    % Define tasks with contrasts and associated weights for GLM analysis.
    % Each task contains fields: name, contrasts, weights, and smoothBool.
    % Task 1: Localizer Task
    selectedTasks(1).name = 'loc'; % Name of task as used in BIDS.
    selectedTasks(1).contrasts = {'Faces > Objects', 'Objects > Scrambled', 'Scenes > Objects'}; % Contrasts of interest.
    selectedTasks(1).weights(1) = struct('Faces', 1, 'Objects', -1, 'Scrambled', 0, 'Scenes', 0); % Weights for contrast 1.
    selectedTasks(1).weights(2) = struct('Faces', 0, 'Objects', 1, 'Scrambled', -1, 'Scenes', 0); % Weights for contrast 2.
    selectedTasks(1).weights(3) = struct('Faces', 0, 'Objects', -1, 'Scrambled', 0, 'Scenes', 1); % Weights for contrast 3.
    selectedTasks(1).smoothBool = true; % Apply smoothing before GLM for this task.

    % Task 2: Experimental Task
    selectedTasks(2).name = 'exp';
    selectedTasks(2).contrasts = {'Check > No-Check'};
    selectedTasks(2).weights(1) = struct('check', 1, 'nocheck', -1); % Weights for contrast 1.
    selectedTasks(2).smoothBool = false; % Do not apply smoothing for this task.

    % Specify confound regressors to include in the GLM.
    pipeline = {'HMP-6','GS-1','FD'}; % Use head motion parameters, global signal, and framewise displacement.

    % Find folders for each subject based on the selected subjects list.
    sub_paths = findSubjectsFolders(fmriprepRoot, selectedSubjectsList);

    %% RUN THE GLM FOR EACH SUBJECT AND TASK

    % Loop through each subject in the list.
    for sub_path_idx = 1:length(sub_paths)

        % Loop through each defined task for analysis.
        for selected_task_idx = 1:length(selectedTasks)

            % Clear previous configurations in matlabbatch to avoid conflicts.
            clearvars matlabbatch

            %% SUBJECT AND TASK INFO

            % Get the current task details (name, contrasts, smoothing preference).
            selectedTask = selectedTasks(selected_task_idx).name; % Task name.
            contrasts = selectedTasks(selected_task_idx).contrasts; % Task contrasts.
            smoothBool = selectedTasks(selected_task_idx).smoothBool; % Boolean: smooth images before GLM?

            % Extract the subject ID from the folder name (formatted as 'sub-01').
            subPath = sub_paths(sub_path_idx);
            subName = subPath.name; % e.g., 'sub-01'
            sub_id = strsplit(subName,'-'); % Splits 'sub-01' into {'sub', '01'}
            selectedSub = str2double(sub_id{2}); % Extracts and converts the subject ID to a number.

            % Define the output path for storing GLM results for this subject and task.
            outPath = fullfile(outRoot, 'GLM', subName, selectedTask);

            % Define paths to the functional data for this subject.
            funcPathSub = fullfile(fmriprepRoot, subName, 'func'); % Functional data path.
            bidsPathSub = fullfile(BIDSRoot, subName, 'func'); % BIDS formatted path.

            % Check if the specified task exists in the subject’s data.
            files = dir(funcPathSub); % List files in the functional data directory.
            fileNames = {files.name}; % Extract file names.
            containsTask = any(contains(fileNames, ['task-', selectedTask])); % Check for the task in file names.

            % If the task is missing for this subject, skip to the next iteration.
            if ~containsTask
                warning(['Task ', selectedTask, ' not found for ' subName ' in ' funcPathSub '. Skipping...']);
                continue;
            end

            % Print a status update showing the subject and task being processed.
            fprintf('############################### \n# STEP: running %s - %s #\n############################### \n', subName, selectedTask);

            % This first section finds and loads the event and confound files for each run, based on selections specified earlier. 
            % We retrieve and organize the event data (which includes onset times and durations) and confound data 
            % (like motion parameters or physiological noise) for each run of a task. These inputs are essential for setting up the 
            % GLM model, as they provide information needed for modeling the BOLD signal in relation to task events and controlling 
            % for noise.

            %% FIND AND LOAD EVENTS AND CONFOUNDS FROM FMRIPREP FOLDER

            % Retrieve event and confound files for selected runs.
            if ismember('*', selectedRuns)
                % If '*' is specified, include all available runs for this subject and task.
                eventsTsvFiles = dir(fullfile(bidsPathSub, strcat(subName, '_task-', selectedTask, '_run-*_events.tsv')));
                json_confounds_files = dir(fullfile(funcPathSub, strcat(subName, '_task-', selectedTask, '_run-*_desc-confounds_timeseries.json')));
                tsv_confounds_files = dir(fullfile(funcPathSub, strcat(subName, '_task-', selectedTask, '_run-*_desc-confounds_timeseries.tsv')));
            else
                % Include only the specific runs listed in `selectedRuns`.
                eventsTsvFiles = arrayfun(@(x) dir(fullfile(bidsPathSub, strcat(subName, '_task-', selectedTask, '_run-', sprintf('%02d', x), '_events.tsv'))), selectedRuns, 'UniformOutput', true);
                json_confounds_files = arrayfun(@(x) dir(fullfile(funcPathSub, strcat(subName, '_task-', selectedTask, '_run-', sprintf('%02d', x), '_desc-confounds_timeseries.json'))), selectedRuns, 'UniformOutput', true);
                tsv_confounds_files = arrayfun(@(x) dir(fullfile(funcPathSub, strcat(subName, '_task-', selectedTask, '_run-', sprintf('%02d', x), '_desc-confounds_timeseries.tsv'))), selectedRuns, 'UniformOutput', true);
            end

            % Sort the retrieved files alphabetically by name for consistent ordering.
            eventsTsvFiles = table2struct(sortrows(struct2table(eventsTsvFiles), 'name'));
            json_confounds_files = table2struct(sortrows(struct2table(json_confounds_files), 'name'));
            tsv_confounds_files = table2struct(sortrows(struct2table(tsv_confounds_files), 'name'));

            % Ensure the number of event and confound files matches across all run files.
            assert(numel(eventsTsvFiles) == numel(json_confounds_files) && numel(json_confounds_files) == numel(tsv_confounds_files), ...
                'Mismatch in number of TSV events, TSV confounds, and JSON confounds files in %s', funcPathSub)


            % This second section sets non-run-specific SPM model parameters, defining the core structure of the GLM model. 
            % Here we specify settings such as the repetition time, microtime resolution, basis functions, and whether global 
            % normalization should be applied. These parameters remain consistent across different runs and subjects, creating 
            % a standardized foundation for the GLM analysis.

            %% SPM MODEL PARAMETERS (NON RUN DEPENDENT)

            % Define non-run-specific parameters for the GLM in SPM.
            matlabbatch{1}.spm.stats.fmri_spec.dir = cellstr(outPath); % Directory where SPM output will be saved.
            matlabbatch{1}.spm.stats.fmri_spec.timing.units = 'secs'; % Units for event timing (set to seconds).
            matlabbatch{1}.spm.stats.fmri_spec.timing.RT = RT; % Repetition time (TR) defines time between successive scans.
            matlabbatch{1}.spm.stats.fmri_spec.timing.fmri_t = fmri_t; % Microtime resolution - number of time bins within one TR.
            matlabbatch{1}.spm.stats.fmri_spec.timing.fmri_t0 = fmri_t0; % Microtime onset - reference slice for alignment.
            matlabbatch{1}.spm.stats.fmri_spec.fact = struct('name', {}, 'levels', {}); % No factorial design applied here.
            matlabbatch{1}.spm.stats.fmri_spec.bases.hrf.derivs = [0 0]; % Canonical HRF without derivatives (time/dispersion).
            matlabbatch{1}.spm.stats.fmri_spec.volt = 1; % Volterra interactions disabled (linear model).
            matlabbatch{1}.spm.stats.fmri_spec.global = 'None'; % No global normalization applied.
            matlabbatch{1}.spm.stats.fmri_spec.mthresh = 0.8; % Masking threshold excludes voxels below 80% of mean signal.
            matlabbatch{1}.spm.stats.fmri_spec.mask = {''}; % No explicit mask specified.
            matlabbatch{1}.spm.stats.fmri_spec.cvi = 'AR(1)'; % AR(1) autocorrelation correction for temporal dependencies.

            % Set up parameters for estimating the GLM in the second stage.
            matlabbatch{2}.spm.stats.fmri_est.spmmat(1) = cfg_dep('fMRI model specification: SPM.mat File', ...
                substruct('.','val', '{}',{1}, '.','val', '{}',{1}, '.','val', '{}',{1}), substruct('.','spmmat'));
            matlabbatch{2}.spm.stats.fmri_est.write_residuals = 0; % Do not save residuals.
            matlabbatch{2}.spm.stats.fmri_est.method.Classical = 1; % Use classical estimation method (ReML).

            % This section iterates over each run of the task for the current subject, setting up the required SPM parameters 
            % for each run. We load event and confound data, identify the correct NIfTI files, apply smoothing if required, 
            % and configure session-specific settings in the SPM model specification. Each step is verified to ensure data 
            % integrity, and any issues with missing or multiple files are flagged for user review.

            %% SPM RUN SETTINGS (E.G., EVENTS, CONFOUNDS, IMAGES)

            % Loop over each run of the task.
            for runIdx = 1:numel(eventsTsvFiles)

                % Load event information into a structure compatible with SPM.
                events_struct = eventsBIDS2SPM(fullfile(eventsTsvFiles(runIdx).folder, eventsTsvFiles(runIdx).name));
                selectedRun = findRunSubstring(eventsTsvFiles(runIdx).name); % Identify the current run (e.g., 'run-01').

                fprintf('## STEP: TASK %s - %s\n', selectedTask, selectedRun)

                % Select the corresponding confound files for the current run.
                jsonRows = filterRowsBySubstring(json_confounds_files, selectedRun);
                confoundsRows = filterRowsBySubstring(tsv_confounds_files, selectedRun);

                % Check for a single JSON confounds file, and flag errors if multiple or none are found.
                if length(jsonRows) ~= 1
                    error('More than one JSON file found for the specified run. Please check the dataset.');
                elseif isempty(jsonRows)
                    error('No JSON file found for the specified run. Please check the dataset.');
                else
                    jsonRow = jsonRows{1, :};
                end

                % Check for a single TSV confounds file, and handle errors similarly.
                if length(confoundsRows) ~= 1
                    error('More than one TSV confounds file found for the specified run. Please check the dataset.');
                elseif isempty(confoundsRows)
                    error('No TSV confounds file found for the specified run. Please check the dataset.');
                else
                    confoundsRow = confoundsRows{1, :};
                end

                % Extract confound data based on the specified pipeline, loading it into an array.
                confounds_array = fMRIprepConfounds2SPM(fullfile(jsonRow.folder, jsonRow.name),...
                    fullfile(confoundsRow.folder, confoundsRow.name), pipeline);

                % Define the pattern to locate the NIfTI file and check for its existence.
                filePattern = strcat(subName, '_task-', selectedTask, '_', selectedRun, '_space-', niftiSpace, '_desc-preproc_bold');
                niiFileStruct = dir(fullfile(fmriprepRoot, subName, 'func', strcat(filePattern, '.nii')));

                % Handle cases with missing or multiple NIfTI files.
                if size(niiFileStruct, 1) > 1
                    error('Multiple NIFTI files found for %s.', selectedRun)
                elseif isempty(niiFileStruct)
                    % If no NIfTI files are found, check for compressed (.nii.gz) files and decompress if necessary.
                    niiGzFilePattern = fullfile(funcPathSub, strcat(filePattern, '.nii.gz'));
                    niiGzFileStruct = dir(niiGzFilePattern);

                    if isempty(niiGzFileStruct)
                        warning('No NIFTI file found for run %s. SKIPPING!', selectedRun)
                        continue
                    elseif size(niiGzFileStruct, 1) > 1
                        error('Multiple NIFTI.GZ files found for this run.')
                    else
                        % Decompress the .nii.gz file if found.
                        niiGzFileString = fullfile(niiGzFileStruct.folder, niiGzFileStruct.name);
                        gunzippedNii = gunzipNiftiFile(niiGzFileString, fullfile(tempDir, 'gunzipped', subName));
                        niiFileStruct = dir(gunzippedNii{1});
                    end
                end

                % Get the full path of the (possibly decompressed) NIfTI file.
                niiFileString = fullfile(niiFileStruct.folder, niiFileStruct.name);

                % Smooth the NIfTI file if smoothing is enabled for this task.
                if smoothBool
                    niiFileString = smoothNiftiFile(niiFileString, fullfile(tempDir, 'smoothed', subName));
                else
                    fprintf('SMOOTH: smoothBool set to false for this task. Skipping...\n')
                end

                % Specify functional images in SPM model specification for the current run.
                niiFileCell = {niiFileString};
                matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).scans = spm_select('expand', niiFileCell); % Expanded list of images.

                % Set high-pass filter (HPF) to a value higher than the run duration to avoid filtering.
                matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).hpf = (matlabbatch{1}.spm.stats.fmri_spec.timing.RT * ...
                    size(matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).scans, 1)) + 100;

                % Add conditions (events) to the model for the current run.
                for cond_id = 1:length(events_struct.names)
                    matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).cond(cond_id).name = events_struct.names{cond_id};
                    matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).cond(cond_id).onset = events_struct.onsets{cond_id};
                    matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).cond(cond_id).duration = events_struct.durations{cond_id};
                end

                % Add confound regressors to the model for the current run.
                for reg_id = 1:size(confounds_array, 2)
                    matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).regress(reg_id).name = confounds_array.Properties.VariableNames{reg_id};
                    matlabbatch{1}.spm.stats.fmri_spec.sess(runIdx).regress(reg_id).val = confounds_array{:, reg_id};
                end
            end


            % This final section initializes the SPM defaults, executes the GLM model specification and estimation,
            % verifies that the model ran successfully by checking for the SPM.mat file, and then defines and
            % applies contrasts. Finally, the script is copied to the output folder for replicability. Each step
            % is verified with status messages, providing clear feedback for the user.

            %% RUN BATCHES 1 AND 2

            % Initialize SPM defaults for fMRI analysis.
            spm('defaults','fmri'); % Load SPM defaults for fMRI.
            spm_jobman('initcfg');  % Initialize the SPM job configuration.

            % Execute the model specification (batch 1) and model estimation (batch 2).
            fprintf('GLM: Running GLM for: %s - TASK:  %s\n', subName, selectedTask)
            spm_jobman('run', matlabbatch(1:2));
            fprintf('GLM: DONE!\n')

            %% FIND SPM.mat

            % After running the GLM, check for the existence of the SPM.mat file in the output path.
            % The SPM.mat file is essential for contrast specification.
            spmMatPath = fullfile(outPath, 'SPM.mat');
            if ~exist(spmMatPath, 'file')
                error('SPM.mat file not found in the specified output directory.');
            end


            %% Save Boxcar plot and design matrix of estimated model
            SPMstruct = load(spmMatPath);

            plotBoxcarAndHRFResponses(SPMstruct, outPath)
            saveSPMDesignMatrix(SPMstruct, outPath)

            %% RUN BATCH 3 (CONTRASTS)

            % Define the path to the SPM.mat file in the batch structure for contrast estimation.
            matlabbatch{3}.spm.stats.con.spmmat(1) = {spmMatPath};

            % Loop through each contrast defined for the current task.
            for k = 1:length(contrasts)
                % Adjust contrast weights to fit the current design matrix structure.
                weights = adjust_contrasts(spmMatPath, selectedTasks(selected_task_idx).weights(k));

                % Define each contrast and its properties in the SPM batch structure.
                matlabbatch{3}.spm.stats.con.consess{k}.tcon.weights = weights; % Contrast weights.
                matlabbatch{3}.spm.stats.con.consess{k}.tcon.name = contrasts{k}; % Name of the contrast.
                matlabbatch{3}.spm.stats.con.consess{k}.tcon.sessrep = 'none'; % No session-specific replication.
            end

    % Execute the contrast batch (batch 3).
    fprintf('Setting contrasts...\n');
    spm_jobman('run', matlabbatch(3));
    fprintf('DONE!\n');

    %% Save Contrast Plots
    % Thresholds for statistical analysis
    thresholds = {
        0.001, ...
        0.01, ...
        0.05 ...
        };

    % Iterate over contrasts to generate plots
    for constrastIdx = 1:length(selectedTasks(taskIndex).contrasts)

        % Iterate over thresholds to generate plots
        for thresholdIndex = 1:length(thresholds)

            % Generate and Save Contrast Overlay Images

            % Set crosshair coordinates (modify if needed)
            crossCoords = [40, -52, -18]; % FFA. Change as needed.

            % Set the index of the contrast to display (modify if needed)
            spmContrastIndex = constrastIdx;

            % Call the function to generate and save contrast overlay images
            generateContrastOverlayImages(spmMatPath, outPath, fmriprepRoot, subjectName, pipelineStr, thresholds{thresholdIndex}, spmContrastIndex, crossCoords);

        end
    end
    end
    %% SAVE SCRIPT

    % Save a copy of this script in the output directory for documentation and replicability.
    FileNameAndLocation = [mfilename('fullpath')]; % Get full path to this script.
    script_outdir = fullfile(outPath,'spmGLMautoContrast.m'); % Set destination path for script copy.
    currentfile = strcat(FileNameAndLocation, '.m'); % Get filename with extension.
    copyfile(currentfile, script_outdir); % Copy script to output directory.
    end
    ```

??? example "generateContrastOverlayImages.m"
    ```matlab linenums="1"
    function generateContrastOverlayImages(spmMatPath, outputPath, fmriprepRoot, subjectName, pipelineStr, thresholdValue, spmContrastIndex, crossCoords)
    % GENERATECONTRASTOVERLAYIMAGES Generates and saves contrast overlay images for specified thresholds
    %
    % This function loads the SPM.mat file, sets up the xSPM structure for the specified contrast,
    % and generates overlay images on the anatomical image. The overlay images are saved to the output directory.
    %
    % Inputs:
    %   spmMatPath        - String, path to the SPM.mat file
    %   outputPath        - String, output directory where images will be saved
    %   fmriprepRoot      - String, root directory of fmriprep outputs
    %   subjectName       - String, subject identifier (e.g., 'sub-01')
    %   pipelineStr       - String, representation of the denoising pipeline
    %   thresholdValue         - Numeric threshold to use for generating images
    %   spmContrastIndex  - Integer, index of the contrast in SPM.xCon to use (default is 1)
    %   crossCoords       - Vector [x, y, z], coordinates to set the crosshair (default is [40, -52, -18])
    %
    % Outputs:
    %   None (overlay images are saved to the output directory)
    %
    % Usage:
    %   generateContrastOverlayImages(spmMatPath, outputPath, fmriprepRoot, subjectName, pipelineStr, thresholds);
    %
    % Notes:
    %   - The function assumes that SPM and SPM12 toolboxes are properly set up.
    %   - The function handles any errors during the generation of xSPM and provides informative messages.
    %
    % Example:
    %   generateContrastOverlayImages('/path/to/SPM.mat', '/output/dir', '/fmriprep/root', 'sub-01', 'GS-1_HMP-6', {0.001, 0.01}, 1, [40, -52, -18]);

    if nargin < 8
        crossCoords = [40, -52, -18]; % Default crosshair coordinates
    end
    if nargin < 7
        spmContrastIndex = 1; % Default contrast index
    end

    % Load SPM.mat to access contrast data
    fprintf('Loading SPM.mat from %s to process contrasts...\n', spmMatPath);
    load(spmMatPath, 'SPM');

    % Verify the contrast index is valid
    if spmContrastIndex > numel(SPM.xCon)
        error('Invalid contrast index. Ensure the index is within the range of defined contrasts.');
    end

    % Get the contrast name from SPM.xCon
    contrastNameSPM = SPM.xCon(spmContrastIndex).name;

    % Iterate over thresholds to generate and save images
    % Prepare xSPM structure for results
    contrastName = sprintf('%s_%s_%g_%s', subjectName, pipelineStr, thresholdValue, contrastNameSPM);
    xSPM = struct();
    xSPM.swd = outputPath; % Directory where SPM.mat is saved
    xSPM.title = contrastName;
    xSPM.Ic = spmContrastIndex; % Contrast index
    xSPM.Im = []; % Mask (empty means no mask)
    xSPM.pm = []; % P-value masking
    xSPM.Ex = []; % Mask exclusion
    xSPM.u = thresholdValue; % Threshold (uncorrected p-value)
    xSPM.k = 0; % Extent threshold (number of voxels)
    xSPM.STAT = 'T'; % Use T-statistics
    xSPM.thresDesc = 'none'; % No threshold description

    % Generate results without GUI
    [SPM, xSPM] = spm_getSPM(xSPM);

    xSPM.thresDesc = 'none'; % No threshold description

    % Display results
    [hReg, xSPM] = spm_results_ui('setup', xSPM);

    % Set crosshair coordinates
    spm_results_ui('SetCoords', crossCoords);

    % Overlay activations on anatomical image
    sectionImgPath = fullfile(fmriprepRoot, subjectName, 'anat', [subjectName, '_space-MNI152NLin2009cAsym_res-2_desc-preproc_T1w.nii']);
    if exist(sectionImgPath, 'file')
        fprintf('Overlaying activations for threshold %g...\n', thresholdValue);
        spm_sections(xSPM, hReg, sectionImgPath);

        % Save the overlay image
        overlayImgPath = fullfile(outputPath, sprintf('%s.png', contrastName));
        spm_figure('GetWin', 'Graphics');
        print('-dpng', overlayImgPath);
        fprintf('Overlay saved as %s\n', overlayImgPath);
    else
        warning('Anatomical image not found at %s. Skipping overlay.', sectionImgPath);
    end

    % Close graphics window
    spm_figure('Close', 'Graphics');
    end
    ```

??? example "plotBoxcarAndHRFResponses.m"
    ```matlab  linenums="1"
    function plotBoxcarAndHRFResponses(SPMstruct, outDir)
    % plotBoxcarAndHRFResponses Visualize boxcar functions and convolved HRF responses per condition and session.
    %
    % This function generates a comprehensive visualization of the boxcar functions
    % and their corresponding convolved hemodynamic response functions (HRFs) for
    % each condition across all sessions, as defined in the SPM.mat structure.
    %
    % Usage:
    %   plotBoxcarAndHRFResponses(SPM);
    %   plotBoxcarAndHRFResponses(SPM, outDir);
    %
    % Inputs:
    %   - SPM: A struct loaded from an SPM.mat file containing experimental design
    %          and statistical model parameters.
    %   - outDir: (Optional) A string specifying the directory to save the plot. If
    %             provided, the plot is saved as a PNG file in the specified directory.
    %
    % Output:
    %   - A figure is displayed with subplots representing each condition (row)
    %     and session (column). Each subplot contains the boxcar function and the
    %     convolved HRF for the corresponding condition and session.
    %
    % Example:
    %   % Load the SPM.mat file
    %   load('SPM.mat');
    %
    %   % Call the function to visualize
    %   plotBoxcarAndHRFResponses(SPM);
    %
    %   % Save the plot to a directory
    %   plotBoxcarAndHRFResponses(SPM, 'output_directory/');
    %
    % Notes:
    %   - This function assumes that the SPM structure contains the following:
    %     *SPM.Sess: Session-specific condition information.
    %* SPM.xY.RT: Repetition time (TR) in seconds.
    %     *SPM.nscan: Number of scans per session.
    %* SPM.xX.X: Design matrix containing the convolved regressors.
    %     * SPM.xX.name: Names of the columns in the design matrix.
    %   - Ensure that the SPM.mat file corresponds to your specific fMRI data analysis.
    %

    % Get the number of sessions
    SPM = SPMstruct.SPM;
    num_sessions = length(SPM.Sess);

    % Get the repetition time (TR)
    TR = SPM.xY.RT;

    % Get the number of scans per session
    nscans = SPM.nscan;

    % Calculate the cumulative number of scans to determine session boundaries
    session_boundaries = [0 cumsum(nscans)];

    % Determine the maximum number of conditions across all sessions
    max_num_conditions = max(arrayfun(@(x) length(x.U), SPM.Sess));

    % Create a new figure for plotting
    figure;

    % Adjust the figure size for better visibility
    set(gcf, 'Position', [100, 100, 1400, 800]);

    % Initialize subplot index
    subplot_idx = 1;

    % Define line styles and colors for boxcar and convolved HRF
    boxcar_line_style = '-';
    boxcar_line_color = [0, 0.4470, 0.7410]; % MATLAB default blue
    boxcar_line_width = 1.5;

    hrf_line_style = '-';
    hrf_line_color = [0.8500, 0.3250, 0.0980]; % MATLAB default red
    hrf_line_width = 1.5;

    % Loop over each condition (regressor)
    for cond_idx = 1:max_num_conditions
        % Loop over each session
        for sess_idx = 1:num_sessions
            % Create a subplot for the current condition and session
            subplot(max_num_conditions, num_sessions, subplot_idx);

            % Check if the current session has the current condition
            if length(SPM.Sess(sess_idx).U) >= cond_idx
                % Extract the condition structure
                U = SPM.Sess(sess_idx).U(cond_idx);

                % Get the condition name
                condition_name = U.name{1};

                % Get the onsets and durations of the events
                onsets = U.ons;
                durations = U.dur;

                % Get the number of scans (time points) in the current session
                num_scans = nscans(sess_idx);

                % Create the time vector for the current session
                time_vector = (0:num_scans - 1) * TR;

                % Initialize the boxcar function for the current session
                boxcar = zeros(1, num_scans);

                % Build the boxcar function based on onsets and durations
                for i = 1:length(onsets)
                    onset_idx = floor(onsets(i) / TR) + 1;
                    offset_idx = ceil((onsets(i) + durations(i)) / TR);
                    onset_idx = max(onset_idx, 1);
                    offset_idx = min(offset_idx, num_scans);
                    boxcar(onset_idx:offset_idx) = 1;
                end

                % Find the rows corresponding to the current session in the design matrix
                session_row_start = session_boundaries(sess_idx) + 1;
                session_row_end = session_boundaries(sess_idx + 1);
                session_rows = session_row_start:session_row_end;

                % Find the columns in the design matrix corresponding to the current condition
                prefix = sprintf('Sn(%d) %s', sess_idx, condition_name);
                column_indices = find(strncmp(SPM.xX.name, prefix, length(prefix)));

                % Extract the convolved regressor(s) for the current condition and session
                convolved_regressor = sum(SPM.xX.X(session_rows, column_indices), 2);

                % Plot the boxcar function
                plot(time_vector, boxcar, 'LineStyle', boxcar_line_style, 'Color', boxcar_line_color, 'LineWidth', boxcar_line_width);
                hold on;

                % Plot the convolved HRF response
                plot(time_vector, convolved_regressor, 'LineStyle', hrf_line_style, 'Color', hrf_line_color, 'LineWidth', hrf_line_width);
                hold off;

                % Improve the appearance of the plot
                grid on;
                xlim([0, max(time_vector)]);
                ylim_min = min(min(boxcar), min(convolved_regressor)) - 0.1;
                ylim_max = max(max(boxcar), max(convolved_regressor)) + 0.1;
                ylim([ylim_min, ylim_max]);
                set(gca, 'FontSize', 8);

                % Add condition names as y-labels on the first column
                if sess_idx == 1
                    ylabel(condition_name, 'FontSize', 10, 'Interpreter', 'none');
                else
                    set(gca, 'YTick', []);
                    set(gca, 'YTickLabel', []);
                end

                % Add x-labels on the bottom row
                if cond_idx == max_num_conditions
                    xlabel('Time (s)', 'FontSize', 10);
                else
                    set(gca, 'XTick', []);
                    set(gca, 'XTickLabel', []);
                end

                % Add session titles on the first row
                if cond_idx == 1
                    title(sprintf('Session %d', sess_idx), 'FontSize', 12);
                end
            else
                % If the condition is not present in the session
                axis off;
                text(0.5, 0.5, 'Not Present', 'HorizontalAlignment', 'center', 'FontSize', 12);

                % Add condition names as y-labels on the first column
                if sess_idx == 1
                    ylabel(['Condition: ' num2str(cond_idx)], 'FontSize', 10, 'Interpreter', 'none');
                end

                % Add session titles on the first row
                if cond_idx == 1
                    title(sprintf('Session %d', sess_idx), 'FontSize', 12);
                end
            end

            % Increment the subplot index
            subplot_idx = subplot_idx + 1;
        end
    end

    % Add an overall title for the figure
    sgtitle('Boxcar and Convolved HRF Responses per Condition and Session', 'FontSize', 16);

    % Save the plot as PNG if outDir is specified
    if nargin > 1 && ~isempty(outDir)
        if ~isfolder(outDir)
            mkdir(outDir); % Create the directory if it doesn't exist
        end
        % Create a file name based on the current date and time
        timestamp = datestr(now, 'yyyy-mm-dd_HH-MM-SS');
        file_name = fullfile(outDir, ['BoxcarHRFResponses_' timestamp '.png']);
        saveas(gcf, file_name);
        fprintf('Figure saved to: %s\n', file_name);
    end
    close(gcf);

    end
    ```

??? example "saveSPMDesignMatrix.m"
    ```matlab  linenums="1"
    function saveSPMDesignMatrix(SPMstruct, outDir)
    % saveSPMDesignMatrix Visualize and optionally save the design matrix from SPM.
    %
    % This function uses SPM's internal `spm_DesRep` function to display the design
    % matrix and optionally saves the resulting figure as a PNG file.
    %
    % Usage:
    %   saveSPMDesignMatrix(SPMstruct);
    %   saveSPMDesignMatrix(SPMstruct, outDir);
    %
    % Inputs:
    %   - SPMstruct: A struct loaded from an SPM.mat file containing experimental
    %                design and statistical model parameters.
    %   - outDir: (Optional) A string specifying the directory to save the figure.
    %             If provided, the design matrix is saved as a PNG file in the specified
    %             directory.
    %
    % Output:
    %   - A figure is displayed showing the design matrix as produced by SPM.
    %   - If `outDir` is provided, the design matrix is saved as a PNG file in the
    %     specified directory.
    %
    % Example:
    %   % Load the SPM.mat file
    %   load('SPM.mat');
    %
    %   % Display the design matrix
    %   saveSPMDesignMatrix(SPMstruct);
    %
    %   % Save the design matrix to a directory
    %   saveSPMDesignMatrix(SPMstruct, 'output_directory/');
    %
    % Notes:
    %   - Ensure that the SPM.mat file corresponds to your specific fMRI data analysis.
    %   - This function depends on the SPM toolbox being properly set up and initialized.
    %

    SPM = SPMstruct.SPM;

    % Check if the design matrix exists
    if ~isfield(SPM, 'xX') || ~isfield(SPM.xX, 'X') || isempty(SPM.xX.X)
        error('The SPM structure does not contain a valid design matrix.');
    end

    % Use SPM's spm_DesRep function to display the design matrix
    spm_DesRep('DesMtx', SPM.xX);

    % Get the current figure handle (SPM's design matrix figure)
    figHandle = gcf;

    % Save the figure as a PNG if outDir is specified
    if nargin > 1 && ~isempty(outDir)
        if ~isfolder(outDir)
            mkdir(outDir); % Create the directory if it doesn't exist
        end
        % Create a file name based on the current date and time
        timestamp = datestr(now, 'yyyy-mm-dd_HH-MM-SS');
        file_name = fullfile(outDir, ['SPMDesignMatrix_' timestamp '.png']);
        saveas(figHandle, file_name);
        fprintf('Design matrix saved to: %s\n', file_name);
    end

    % Close the figure after saving
    close(figHandle);

    end
    ```

??? example "findRunSubstring.m"
    ```matlab  linenums="1"
    function runSubstring = findRunSubstring(inputStr)
    %FINDRUNSUBSTRING Extracts a 'run-xx' substring from a given string
    %   This function takes an input string and searches for a substring that
    %   matches the pattern 'run-xx', where 'xx' can be any one or two digit number.
    %   If such a substring is found, it is returned; otherwise, an empty string
    %   is returned.

    % Regular expression to match 'run-' followed by one or two digits
    pattern = 'run-\d{1,2}';

    % Search for the pattern in the input string
    matches = regexp(inputStr, pattern, 'match');

    % Check if any match was found
    if ~isempty(matches)
        % If a match was found, return the first match
        runSubstring = matches{1};
    else
        % If no match was found, return an empty string
        runSubstring = '';
    end
    end
    ```

??? example "filterRowsBySubstring.m"
    ```matlab  linenums="1"
    function filteredRows = filterRowsBySubstring(data, substring)
    %FILTERROWSBYSUBSTRING Filters rows based on a substring in the first column
    %   This function takes a cell array 'data' and a 'substring' as inputs,
    %   and returns a new cell array 'filteredRows' containing only the rows
    %   from 'data' where the first column includes the specified 'substring'.

    % Initialize an empty cell array to store the filtered rows
    filteredRows = {};

    % Iterate through each row in the data
    for rowIndex = 1:size(data, 1)
        % Fetch the first column of the current row
        currentEntry = data(rowIndex).name;
        
        % Check if the first column contains the specified substring
        if contains(currentEntry, ['_' substring '_'])
            % If it does, add the current row to the filteredRows array
            filteredRows = [filteredRows; data(rowIndex, :)];
        end
    end
    end
    ```

??? example "adjust_contrasts.m"
    ```matlab  linenums="1"
    function weight_vector = adjust_contrasts(spmMatPath, contrastWeights)
    % ADJUST_CONTRASTS Adjust contrast weights according to the design matrix in SPM.
    %
    % DESCRIPTION:
    % This function adjusts the specified contrast weights according to the design
    % matrix in SPM, and provides a visual representation of the weights applied to
    % the design matrix.
    %
    % INPUTS:
    % spmMatPath: String
    %   - Path to the SPM.mat file.
    %     Example: '/path/to/SPM.mat'
    %
    % contrastWeights: Struct
    %   - Specifies the weight of each condition in the contrast.
    %     For wildcard specification, use '*WILDCARD*'. E.g., 'condition_WILDCARD_': weight
    %     Example: struct('condition1', 1, 'condition2_WILDCARD_', -1)
    %
    % OUTPUTS:
    % weight_vector: Numeric Vector
    %   - A vector of weights for each regressor.
    %     Example: [0, 1, -1, 0, ...]
    %
    % The function also generates a visual representation of the design matrix with
    % the specified contrast weights.

    % Load the SPM.mat
    load(spmMatPath);
    % Extracting regressor names from the SPM structure
    regressor_names = SPM.xX.name;

    % Generate weight vector based on SPMs design matrix and specified weights for the single contrast
    weight_vector = generate_weight_vector_from_spm(contrastWeights, regressor_names);

    % % Plotting for visual verification
    % figure;
    % 
    % % Display the design matrix
    % imagesc(SPM.xX.X);  % Display the design matrix
    % colormap('gray');   % Set base colormap to gray for design matrix
    % hold on;
    % 
    % % Create a color overlay based on the weights
    % for i = 1:length(weight_vector)
    %     x = [i-0.5, i+0.5, i+0.5, i-0.5];
    %     y = [0.5, 0.5, length(SPM.xX.X) + 0.5, length(SPM.xX.X) + 0.5];
    %     if weight_vector(i) > 0
    %         % Green for positive weights
    %         color = [0, weight_vector(i), 0];  % Green intensity based on weight value
    %         patch(x, y, color, 'EdgeColor', 'none', 'FaceAlpha', 0.3);  % Reduced transparency
    %     elseif weight_vector(i) < 0
    %         % Red for negative weights
    %         color = [abs(weight_vector(i)), 0, 0];  % Red intensity based on absolute weight value
    %         patch(x, y, color, 'EdgeColor', 'none', 'FaceAlpha', 0.3);  % Reduced transparency
    %     end
    % end
    % 
    % % Annotate with regressor names
    % xticks(1:length(regressor_names));
    % xticklabels('');  % Initially empty, to be replaced by colored text objects
    % xtickangle(45);  % Angle the text so it doesnt overlap
    % set(gca, 'TickLabelInterpreter', 'none');  % Ensure special characters in regressor names display correctly
    % 
    % % Color code the regressor names using text objects
    % for i = 1:length(regressor_names)
    %     if weight_vector(i) > 0
    %         textColor = [0, 0.6, 0];
    %     elseif weight_vector(i) < 0
    %         textColor = [0.6, 0, 0];
    %     else
    %         textColor = [0, 0, 0];
    %     end
    %     text(i, length(SPM.xX.X) + 5, regressor_names{i}, 'Color', textColor, 'Rotation', 45, 'Interpreter', 'none', 'HorizontalAlignment', 'right', 'VerticalAlignment', 'bottom');
    % end
    % 
    % title('Design Matrix with Contrast Weights');
    % xlabel('');
    % ylabel('Scans');
    % 
    % % Add legends
    % legend({'Positive Weights', 'Negative Weights'}, 'Location', 'northoutside');
    % 
    % % Optional: Add a dual color colorbar to represent positive and negative weight intensities
    % colorbar('Ticks', [-1, 0, 1], 'TickLabels', {'-Max Weight', '0', '+Max Weight'}, 'Direction', 'reverse');
    % 
    % hold off;
    end
    ```

??? example "generate_weight_vector_from_spm.m"
    ```matlab  linenums="1"
    function weight_vector = generate_weight_vector_from_spm(contrastWeights, regressor_names)
    % GENERATE_WEIGHT_VECTOR_FROM_SPM Generates a weight vector from the SPM design matrix.
    %
    % This function constructs a weight vector based on the design matrix in SPM
    % and the user-specified contrast weights. Its equipped to handle wildcard matches
    % in condition names for flexibility in defining contrasts.
    %
    % USAGE:
    %   weight_vector = generate_weight_vector_from_spm(contrastWeights, regressor_names)
    %
    % INPUTS:
    %   contrastWeights : struct
    %       A struct specifying the weight of each condition in the contrast.
    %       Fields of the struct are condition names and the associated values are the contrast weights.
    %       Use '*WILDCARD*' in the condition name to denote a wildcard match.
    %       Example:
    %           contrastWeights = struct('Faces', 1, 'Objects_WILDCARD_', -1);
    %
    %   regressor_names : cell array of strings
    %       Names of the regressors extracted from the SPM.mat structure.
    %       Typically includes task conditions and confound regressors.
    %       Example:
    %           {'Sn(1) Faces*bf(1)', 'Sn(1) Objects*bf(1)', 'Sn(1) trans_x', ...}
    %
    % OUTPUTS:
    %   weight_vector : numeric vector
    %       A vector of weights for each regressor in the order they appear in the regressor_names.
    %       Example:
    %           [1, -1, 0, ...]
    %
    % Notes:
    %   This function assumes that task-related regressors in the SPM design matrix end with "*bf(1)".
    %   Confound regressors (e.g., motion parameters) do not have this suffix.

    % Initialize a weight vector of zeros
    weight_vector = zeros(1, length(regressor_names));

    % Extract field names from the contrastWeights structure
    fields = fieldnames(contrastWeights);

    % Iterate over the field names to match with regressor names
    for i = 1:length(fields)
        field = fields{i};

        % If the field contains a wildcard, handle it
        if contains(field, '_WILDCARD_')
            % Convert the wildcard pattern to a regular expression pattern
            pattern = ['Sn\(\d{1,2}\) ' strrep(field, '_WILDCARD_', '.*')];
            
            % Find indices of matching regressors using the regular expression pattern
            idx = find(~cellfun('isempty', regexp(regressor_names, pattern)));

            % Assign the weight from contrastWeights to the matching regressors
            weight_vector(idx) = contrastWeights.(field);
        else
            % No need to extract the condition name, just append *bf(1) to match the SPM regressor pattern
            pattern = ['Sn\(\d{1,2}\) ' field];

            idx = find(~cellfun('isempty', regexp(regressor_names, pattern)));

            % Assign the weight from contrastWeights to the regressor
            if ~isempty(idx)
                weight_vector(idx) = contrastWeights.(field);
            end
        end
    end
    end
    ```

??? example "eventsBIDS2SPM.m"
    ```matlab  linenums="1"
    function new_df = eventsBIDS2SPM(tsv_file)
        % eventsBIDS2SPM - Convert BIDS event files to SPM format
        % This function reads a BIDS event file and converts it to the format required by SPM.
        % It extracts the unique trial types and their onsets and durations and stores them in a
        % Matlab structure.
        %
        % Author: Andrea Costantino
        % Date: 23/1/2023
        %
        % Usage:
        %   mat_dict = eventsBIDS2SPM(tsv_file, run_id)
        %
        % Inputs:
        %   tsv_file - string, path to the tsv file containing the events
        %
        % Outputs:
        %   mat_dict - struct, a Matlab structure containing the events in the format
        %              required by SPM. The structure contains three fields:
        %                - 'names': cell array of string, the names of the trial types
        %                - 'onsets': cell array of double, onset times of the trials
        %                - 'durations': cell array of double, duration of the trials
        %
        % This function reads a BIDS event file and converts it to the format required by SPM.
        % It extracts the unique trial types and their onsets and durations and stores them in a
        % Matlab structure

        % read the tsv file
        df = readtable(tsv_file,'FileType','text');
        % Select unique trial type name
        unique_names = unique(df.trial_type);
        % Make new table in a form that SPM can read
        new_df = table('Size',[length(unique_names),3],'VariableTypes',{'cellstr', 'cellstr', 'cellstr'},'VariableNames',{'names', 'onsets', 'durations'});
        % For each trial type (i.e., condition)
        for k = 1:length(unique_names)
            % Select rows belonging to that condition
            filtered = df(strcmp(df.trial_type,unique_names{k}),:);
            % Copy trial name, onset and duration to the new table
            new_df.names(k) = unique(filtered.trial_type);
            new_df.onsets(k) = {filtered.onset};
            new_df.durations(k) = {filtered.duration};
        end
        new_df = sortrows(new_df, 'names');
    end
    ```

??? example "findSubjectsFolders.m"
    ```matlab  linenums="1"
    function [filteredFolderStructure] = findSubjectsFolders(fmriprepRoot, selectedSubjectsList, excludedSubjectsList)
    % FINDSUBJECTSFOLDERS Locate subject folders based on a list or wildcard.
    %
    % USAGE:
    % sub_paths = findSubjectsFolders(fmriprepRoot, selectedSubjectsList)
    %
    % INPUTS:
    % fmriprepRoot          - The root directory where 'sub-*' folders are located.
    %
    % selectedSubjectsList  - Can be one of two things:
    %                         1) A list of integers, each representing a subject ID.
    %                            For example, [7,9] would search for folders 'sub-07'
    %                            and 'sub-09' respectively.
    %                         2) A single character string '*'. In this case, the function
    %                            will return all folders starting with 'sub-*'.
    %
    % OUTPUTS:
    % sub_paths             - A structure array corresponding to the found directories.
    %                         Each structure has fields: 'name', 'folder', 'date',
    %                         'bytes', 'isdir', and 'datenum'.
    %
    % EXAMPLES:
    % 1) To fetch directories for specific subjects:
    %    sub_paths = findSubjectsFolders('/path/to/fmriprepRoot', [7,9]);
    %
    % 2) To fetch all directories starting with 'sub-*':
    %    sub_paths = findSubjectsFolders('/path/to/fmriprepRoot', '*');
    %
    % Notes:
    % If a subject ID from the list does not match any directory, a warning is issued.

    % Start by fetching all directories with the 'sub-*' pattern.
    sub_paths = dir(fullfile(fmriprepRoot, 'sub-*'));
    sub_paths = sub_paths([sub_paths.isdir]); % Keep only directories.

    % Check the type of selectedSubjectsList
    if isnumeric(selectedSubjectsList(1))
        % Case 1: selectedSubjectsList is a list of integers.

        % Convert each integer in the list to a string of the form 'sub-XX'.
        subIDs = cellfun(@(x) sprintf('sub-%02d', x), num2cell(selectedSubjectsList), 'UniformOutput', false);

        % Filter the sub_paths to keep only those directories matching the subIDs.
        sub_paths = sub_paths(ismember({sub_paths.name}, subIDs));

        % Check and throw warnings for any missing subID.
        foundSubIDs = {sub_paths.name};
        for i = 1:length(subIDs)
            if ~ismember(subIDs{i}, foundSubIDs)
                warning(['The subID ', subIDs{i}, ' was not found in sub_paths.name.']);
            end
        end

    elseif ischar(selectedSubjectsList) && strcmp(selectedSubjectsList, '*')
        % Case 2: selectedSubjectsList is '*'. 
        % No further action required as we have already selected all 'sub-*' folders.

    else
        % Invalid input.
        error('Invalid format for selectedSubjects. It should be either "*" or a list of integers.');
    end

    % Only process exclusion if the excludedSubjectsList is provided.
    if nargin == 3
        % Create a list of excluded folder names
        excludedNames = cellfun(@(x) sprintf('sub-%02d', x), num2cell(excludedSubjectsList), 'UniformOutput', false);

        % Logical array of folders to exclude
        excludeMask = arrayfun(@(x) ismember(x.name, excludedNames), sub_paths);

        % Filtered structure
        filteredFolderStructure = sub_paths(~excludeMask);
    else
        % If no excludedSubjectsList is provided, just return the sub_paths.
        filteredFolderStructure = sub_paths;
    end
    end
    ```

??? example "fMRIprepConfounds2SPM.m"
    ```matlab  linenums="1"
    function confounds = fMRIprepConfounds2SPM(json_path, tsv_path, pipeline)
    % fMRIprepConfounds2SPM - Extracts and formats fMRI confounds for SPM analysis
    %
    % This function processes confound data from fMRIprep outputs, suitable for
    % Statistical Parametric Mapping (SPM) analysis. It reads a JSON file with
    % confound descriptions and a TSV file with confound values, then selects and
    % formats the required confounds based on the specified denoising pipeline.
    %
    % Usage:
    %   confounds = fMRIprepConfounds2SPM(json_path, tsv_path, pipeline)
    %
    % Inputs:
    %   json_path (string): Full path to the JSON file. This file contains metadata
    %                       about the confounds, such as their names and properties.
    %
    %   tsv_path (string):  Full path to the TSV file. This file holds the actual
    %                       confound values in a tabular format for each fMRI run.
    %
    %   pipeline (cell array of strings): Specifies the denoising strategies to be
    %                                     applied. Each element is a string in the
    %                                     format 'strategy-number'. For example,
    %                                     'HMP-6' indicates using 6 head motion
    %                                     parameters. Valid strategies include:
    %             'HMP': Head Motion Parameters, options: 6, 12, 24
    %             'GS': Global Signal, options: 1, 2, 4
    %             'CSF_WM': CSF and White Matter signals, options: 2, 4, 8
    %             'aCompCor': CompCor, options: 10, 50
    %             'MotionOutlier': Motion Outliers, options: FD > 0.5, DVARS > 1.5
    %             'Cosine': Discrete Cosine Transform based regressors for HPF
    %             'FD': Framewise Displacement, a raw non-binary value
    %             'Null': Returns an empty table if no confounds are to be applied
    %
    % Outputs:
    %   confounds (table): A table containing the selected confounds, formatted for
    %                      use in SPM. Each column represents a different confound,
    %                      and each row corresponds to a time point in the fMRI data.
    %
    % Author: Andrea Costantino
    % Date: 23/1/2023
    %
    % Example:
    %   confounds = fMRIprepConfounds2SPM('path/to/json', 'path/to/tsv', {'HMP-6', 'GS-4'});
    %
    % This example would extract and format 6 head motion parameters and the global
    % signal (with raw, derivative, and squared derivative) for SPM analysis.

    % Read the TSV file containing the confound values
    tsv_run = readtable(tsv_path, 'FileType', 'text');

    % Open and read the JSON file, then parse it into a MATLAB structure
    fid = fopen(json_path); 
    raw = fread(fid, inf); 
    str = char(raw'); 
    fclose(fid); 
    json_run = jsondecode(str);

    % Initialize an empty cell array to store the keys of the selected confounds
    selected_keys = {};

    % If 'Null' is found in the pipeline, return an empty table and exit the function
    if any(strcmp(pipeline, 'Null'))
        disp('"Null" found in the pipeline. Returning an empty table.')
        return;
    else
        % Process each specified strategy in the pipeline

        % Head Motion Parameters (HMP)
        if any(contains(pipeline, 'HMP'))
            % Extract and validate the specified number of head motion parameters
            idx = find(contains(pipeline, 'HMP'));
            conf_num_str = pipeline(idx(1)); 
            conf_num_str_split = strsplit(conf_num_str{1}, '-');
            conf_num = str2double(conf_num_str_split(2));
            if ~any([6, 12, 24] == conf_num)
                error('HMP must be 6, 12, or 24.');
            else
                % Add the appropriate head motion parameters to selected_keys
                hmp_id = floor(conf_num / 6);
                if hmp_id > 0
                    selected_keys = [selected_keys, {'rot_x', 'rot_y', 'rot_z', 'trans_x', 'trans_y', 'trans_z'}];
                end
                if hmp_id > 1
                    selected_keys = [selected_keys, {'rot_x_derivative1', 'rot_y_derivative1', 'rot_z_derivative1', 'trans_x_derivative1', 'trans_y_derivative1', 'trans_z_derivative1'}];
                end
                if hmp_id > 2
                    selected_keys = [selected_keys, {'rot_x_power2', 'rot_y_power2', 'rot_z_power2', 'trans_x_power2', 'trans_y_power2', 'trans_z_power2', 'rot_x_derivative1_power2', 'rot_y_derivative1_power2', 'rot_z_derivative1_power2', 'trans_x_derivative1_power2', 'trans_y_derivative1_power2', 'trans_z_derivative1_power2'}];
                end
            end
        end

        % Global Signal (GS)
        if any(contains(pipeline, 'GS'))
            % Extract and validate the specified level of global signal processing
            idx = find(contains(pipeline, 'GS'));
            conf_num_str = pipeline(idx(1)); 
            conf_num_str_split = strsplit(conf_num_str{1}, '-');
            conf_num = str2double(conf_num_str_split(2));
            if ~any([1, 2, 4] == conf_num)
                error('GS must be 1, 2, or 4.');
            else
                % Add the global signal parameters to selected_keys based on the specified level
                gs_id = conf_num;
                if gs_id > 0
                    selected_keys = [selected_keys, {'global_signal'}];
                end
                if gs_id > 1
                    selected_keys = [selected_keys, {'global_signal_derivative1'}];
                end
                if gs_id > 2
                    selected_keys = [selected_keys, {'global_signal_derivative1_power2', 'global_signal_power2'}];
                end
            end
        end

        % CSF and WM masks global signal (CSF_WM)
        if any(contains(pipeline, 'CSF_WM'))
            % Extract and validate the specified level of CSF/WM signal processing
            idx = find(contains(pipeline, 'CSF_WM'));
            conf_num_str = pipeline(idx(1)); 
            conf_num_str_split = strsplit(conf_num_str{1}, '-');
            conf_num = str2double(conf_num_str_split(2));
            if ~any([2, 4, 8] == conf_num)
                error('CSF_WM must be 2, 4, or 8.');
            else
                % Add the CSF and WM parameters to selected_keys based on the specified level
                phys_id = floor(conf_num / 2);
                if phys_id > 0
                    selected_keys = [selected_keys, {'white_matter', 'csf'}];
                end
                if phys_id > 1
                    selected_keys = [selected_keys, {'white_matter_derivative1', 'csf_derivative1'}];
                end
                if phys_id > 2
                    selected_keys = [selected_keys, {'white_matter_derivative1_power2', 'csf_derivative1_power2', 'white_matter_power2', 'csf_power2'}];
                end
            end
        end

        % aCompCor
        if any(contains(pipeline, 'aCompCor'))
            % Extract and format aCompCor confounds based on the specified number
            csf_50_dict = json_run(ismember({json_run.Mask}, 'CSF') & ismember({json_run.Method}, 'aCompCor') & ~contains({json_run.key}, 'dropped'));
            wm_50_dict = json_run(ismember({json_run.Mask}, 'WM') & ismember({json_run.Method}, 'aCompCor') & ~contains({json_run.key}, 'dropped'));
            idx = find(contains(pipeline, 'aCompCor'));
            conf_num_str = pipeline{idx(1)}; 
            conf_num_str_split = strsplit(conf_num_str{1}, '-');
            conf_num = str2double(conf_num_str_split(2));
            if ~any([10, 50] == conf_num)
                error('aCompCor must be 10 or 50.');
            else
                % Select the appropriate aCompCor components and add them to selected_keys
                if conf_num == 10
                    csf = sort(cell2mat(csf_50_dict.keys()));
                    csf_10 = csf(1:5);
                    wm = sort(cell2mat(wm_50_dict.keys()));
                    wm_10 = wm(1:5);
                    selected_keys = [selected_keys, csf_10, wm_10];
                elseif conf_num == 50
                    csf_50 = cell2mat(csf_50_dict.keys());
                    wm_50 = cell2mat(wm_50_dict.keys());
                    selected_keys = [selected_keys, csf_50, wm_50];
                end
            end
        end

        % Cosine
        if any(contains(pipeline, 'Cosine'))
            % Extract cosine-based regressors for high-pass filtering
            cosine_keys = tsv_run.Properties.VariableNames(contains(tsv_run.Properties.VariableNames, 'cosine'));
            selected_keys = [selected_keys, cosine_keys];
        end

        % MotionOutlier
        if any(contains(pipeline, 'MotionOutlier'))
            % Process motion outliers, either using pre-computed values or calculating them
            motion_outlier_keys = tsv_run.Properties.VariableNames(find(contains(tsv_run.Properties.VariableNames, {'non_steady_state_outlier', 'motion_outlier'})));
            selected_keys = [selected_keys, motion_outlier_keys];
        end

        % Framewise Displacement (FD)
        if any(contains(pipeline, 'FD'))
            % Add raw framewise displacement values to selected_keys
            % If the first row is 'n/a', replace it with 0
            fd_values = tsv_run.framewise_displacement;
            if isnan(fd_values(1))
                fd_values(1) = 0;
            end
            tsv_run.framewise_displacement = fd_values;
            selected_keys = [selected_keys, {'framewise_displacement'}];
        end

        % Retrieve the selected confounds and convert them into a table
        confounds_table = tsv_run(:, ismember(tsv_run.Properties.VariableNames, selected_keys));
        confounds = fillmissing(confounds_table, 'constant', 0);
    end
    end
    ```

??? example "gunzipNiftiFile.m"
    ```matlab  linenums="1"
    function gunzippedNii = gunzipNiftiFile(niiGzFile, outPath)
        % gunzipNiftiFile - Decompress (gunzip) .nii.gz file and save it into a
        % './BIDS/derivatives/pre-SPM/gunzipped/sub-xx' folder in the derivatives directory of a BIDS dataset
        %
        % Author: Andrea Costantino
        % Date: 3/2/2023
        %
        % Usage:  
        %   outPath = gunzipNiftiFile(niiGzFile, outPath)
        %
        % Inputs:
        %    niiGzFile - String indicating the path to the input .nii file.
        %    outPath - String indicating the root output directory.
        %
        % Outputs:
        %    gunzippedNii - String indicating the new directory of the output file.
        %

        % Extract subject and task from nii file name
        [~, niiGzName, niiGzExt] = fileparts(niiGzFile); % isolate the name of the nii.gz file
        nameSplits = split(niiGzName, "_"); % split the nii file name into segments
        selectedSub = nameSplits{1}; % subject is the first segment

        % Infer the output path if not provided
        if nargin < 2
            % get the BIDS root folder path
            splitPath = strsplit(niiGzFile, '/'); % split the string into folders
            idx = find(contains(splitPath, 'BIDS')); % find the index of the split that includes 'BIDS'
            bidsPath = strjoin(splitPath(1:idx), '/'); % create the full folder path
            outPath = fullfile(bidsPath, 'derivatives', 'pre-SPM', 'gunzipped', selectedSub); % build the output path
        end

        % Check if the output folder already exists
        if exist(outPath, 'dir') == 7
            fprintf('GUNZIP: Output directory already exists: %s.\n', outPath);
        else
            mkdir(outPath); % create the output directory
            fprintf('GUNZIP: Created output directory: %s.\n', outPath);
        end

        % Check if the output file already exists
        newFilePath = fullfile(outPath, niiGzName);

        if exist(newFilePath, 'file') == 2
            fprintf('GUNZIP: Gunzipped file already exists: %s\n', newFilePath);
            gunzippedNii = {newFilePath};
        else
            % gunzip them
            fprintf('GUNZIP: decompressing file %s ...\n', [niiGzName, niiGzExt])
            gunzippedNii = gunzip(niiGzFile, outPath);
            fprintf('GUNZIP: Created gunzipped file: %s\n', newFilePath);

            % Save a copy of this function in the output folder
            if exist(fullfile(outPath, 'smoothNiftiFile.m'), 'file') ~= 2
                copyfile([mfilename('fullpath'), '.m'], fullfile(outPath, 'gunzipNiftiFile.m'));
            end
        end
    end
    ```

??? example "smoothNiftiFile.m"
    ```matlab  linenums="1"
    function newFilePath = smoothNiftiFile(niiFile, outPath)
        % smoothNiftiFile - Smooth a .nii file and save it into a
        % './BIDS/derivatives/pre-SPM/smoothed/sub-xx' folder in the derivatives directory of a BIDS dataset
        %
        % Author: Andrea Costantino
        % Date: 3/2/2023
        %
        % Usage:  
        %   outRoot = smoothNiftiFile(niiFile, outPath)
        %
        % Inputs:
        %    niiFile - String indicating the path to the input .nii file.
        %    outRoot - String indicating the output directory.
        %
        % Outputs:
        %    newFilePath - String indicating the new directory of the output file.
        %

        % Extract subject and task from nii file name
        [niiFolder, niiName, niiExt] = fileparts(niiFile); % isolate the name of the nii file
        subAndTask = split(niiName, "_"); % split the nii file name into segments
        selectedSub = subAndTask{1}; % subject is the first segment

        % Infer the output path if not provided
        if nargin < 2
            % get the BIDS root folder path
            splitPath = strsplit(niiFile, '/'); % split the string into folders
            idx = find(contains(splitPath, 'BIDS')); % find the index of the split that includes 'BIDS'
            bidsPath = strjoin(splitPath(1:idx), '/'); % create the full folder path
            outPath = fullfile(bidsPath, 'derivatives', 'pre-SPM', 'smoothed', selectedSub); % build the output path
        end

        % Check if the output folder already exists
        if exist(outPath, 'dir') == 7
            fprintf('SMOOTH: Output directory %s already exists.\n', outPath);
        else
            mkdir(outPath); % create the output directory
            fprintf('SMOOTH: Created output directory %s.\n', outPath);
        end

        % Check if the output file already exists
        smoothFileName = strcat('smooth_', [niiName, niiExt]);
        newFilePath = fullfile(outPath, strrep(smoothFileName, niiExt, ['_smooth', niiExt]));

        if exist(newFilePath, 'file') == 2
            fprintf('SMOOTH: Smoothed file already exists: %s\n', newFilePath);
        else
            % Setup and run SPM smoothing job
            matlabbatch{1}.spm.spatial.smooth.data = {niiFile};
            matlabbatch{1}.spm.spatial.smooth.fwhm = [6 6 6];
            matlabbatch{1}.spm.spatial.smooth.dtype = 0;
            matlabbatch{1}.spm.spatial.smooth.im = 0;
            matlabbatch{1}.spm.spatial.smooth.prefix = 'smooth_';
        
            % Initialize SPM
            spm_jobman('initcfg');
            spm('defaults','fmri');

            % Run batch job and suppress the SPM output
            fprintf('SMOOTH: smoothing file %s ...\n', [niiName, niiExt])
            evalc('spm_jobman(''run'', matlabbatch);');
            
            % Move file to correct folder
            movefile(fullfile(niiFolder, smoothFileName), newFilePath);
            fprintf('SMOOTH: Created smoothed file: %s\n', newFilePath);

            % Save a copy of this function in the output folder
            if exist(fullfile(outPath, 'smoothNiftiFile.m'), 'file') ~= 2
                copyfile([mfilename('fullpath'), '.m'], fullfile(outPath, 'smoothNiftiFile.m'));
            end
        end
    end
    ```

---

Continue to the next guide for instructions on setting up Regions of Interest (ROIs) to extract and analyze data from specific brain regions:
[--> Regions of Interest](fmri-rois.md)


