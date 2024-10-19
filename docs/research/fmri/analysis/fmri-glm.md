# General Linear Model in SPM

You should land on this page after having collected your fMRI data, [converted it to BIDS](./fmri-bids-conversion.md) and [preprocessed it](./fmri-prepocessing-qa.md). Your goal now is to model the BOLD activity with a Generalised Linear Model (GLM), in order to obtain the beta values on which to apply further analyses.

In this section, we will use the [Statistical Parametric Mapping](https://www.fil.ion.ucl.ac.uk/spm/) (SPM) package to construct the GLM. Here’s an overview of the steps:

1. **Data Preparation**: Get your files ready for SPM.
2. **Design Matrix Setup**: Define the model for your analysis.
3. **Model Estimation & Results**: Estimate your model and analyze contrasts.

---

## Step 1: Data Preparation

Before running the GLM, we need to make sure the data is compatible with SPM. There are two steps that need to be taken to bring your `.nii` files from fMRIPrep output to SPM input:

1. **gunzipping** (de-compressing `.nii.gz` files, which SPM can't handle natively)
2. **smoothing** (mostly for localizer runs).

The sugested way of proceeding is to create a `derivatives/pre-SPM` folder where to store a `gunzipped` output folder and a `smoothed` output folder.

### Decompressing NIfTI Files

SPM cannot process `.nii.gz` files directly, so we first need to decompress them:

1. Create a directory for pre-processed files:

   ```bash
   mkdir derivatives/pre-SPM
   ```

2. Decompress the files using `gunzip` in the terminal:

   ```bash
   gunzip path/to/your/files/*.nii.gz
   ```

   - Store the decompressed files in a subdirectory called `gunzipped` inside `derivatives/pre-SPM`.

!!! tip "Decompress with a right-click!"
    Most Operating Systems will let you decompress the `nii.gz` files directly from the File Explorer. Right click on the files you want to decompress, and extract them like you would do with a compressed folder.

### Smoothing Functional Data

Smoothing is required to increase signal-to-noise ratio, especially for localizer runs. Follow these steps:

1. Launch the SPM GUI with the command:

   ```matlab
   spm fmri
   ```

2. In the GUI, click on `Smooth`.
3. Select the decompressed `.nii` files.
4. Set the **FWHM** (Full Width at Half Maximum) to `[4 4 4]` or `[6 6 6]` for moderate smoothing.
5. Save the smoothed output in `derivatives/pre-SPM/smoothed`.

!!! tip "Automated Preprocessing"
    You can integrate the decompression and smoothing steps into a script to streamline your workflow, avoiding manual steps (see the [Analysis Workflow](fmri-andrea-workflow.md) for an example).

---

## Step 2: Design Matrix Setup

To run a GLM, you need to create a design matrix that links the timing of experimental conditions to the observed BOLD response. The design matrix is specified in SPM’s `Specify 1st level` interface. While this can be done manually for simpler designs, for complex designs with many conditions, it’s more efficient to use externally generated **onset time** and **confounds** files.

### Creating Onset Files

For complex designs, you should create one onset file per run per subject, containing information about event *types*, *onsets*, and *durations*. The `eventsBIDS2SPM` function can help convert BIDS-formatted event files into the onset files that SPM requires.

1. Use the `eventsBIDS2SPM` function to convert event files.
2. Store the onset files in the following structure:
    - `BIDS/sub-xx/func/sub-xx_run-x_eventsspm.mat`.

    ```bash
    BIDS/
    ├── sub-01/
    │   └── func/
    │       ├── sub-01_run-1_eventsspm.mat
    │       └── sub-01_run-2_eventsspm.mat
    ```

??? example "eventsBIDS2SPM"
    ```matlab
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

### Creating Confounds Files

Head motion and other confound regressors from fMRIPrep need to be formatted to be compatible with SPM. The `fMRIprepConfounds2SPM` function can convert these files into the format required by SPM.

1. Use the `fMRIprepConfounds2SPM` function to convert confounds from fMRIPrep.
2. Store the confounds files in the BIDS structure with SPM-compatible names:
    - `BIDS/sub-xx/func/sub-xx_run-x_confoundsspm.mat`.

??? example "fMRIprepConfounds2SPM"
    ```matlab
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
    ```

!!! note "BIDS-Compliant Naming"
    Ensure the files are saved with names that include:

    - `sub-xx`: subject identifier.
    - `run-x`: run identifier.
    - `confoundsspm` or `eventsspm` for confounds and timings, respectively.

### Using the Functions in a Script

Both `eventsBIDS2SPM` and `fMRIprepConfounds2SPM` are MATLAB functions that can be integrated into scripts for batch processing in SPM. This allows you to automate the import of timing and confounds data or save them into SPM-compatible files for later use.

=== "Directly Load Data into SPM"

    You can use these functions within a MATLAB script to load onset times and confounds directly into an SPM batch job. This is useful when you want to process multiple subjects and runs in one go:

    ```matlab
    % Example script to use eventsBIDS2SPM and fMRIprepConfounds2SPM in batch jobs
    subject_id = 'sub-01';
    run_id = 'run-01';

    % Paths to the BIDS event and confound files
    tsv_file = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_events.tsv']);
    json_file = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_desc-confounds_timeseries.json']);
    confound_tsv = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_desc-confounds_timeseries.tsv']);

    % Convert event files to SPM-compatible format
    onset_data = eventsBIDS2SPM(tsv_file);

    % Convert confound files to SPM-compatible format with a chosen pipeline
    pipeline = {'HMP-6', 'GS-1'}; % Example: 6 head motion parameters + 1 global signal
    confound_data = fMRIprepConfounds2SPM(json_file, confound_tsv, pipeline);

    % Pass the resulting onset and confound data directly into SPM batch processing
    matlabbatch{1}.spm.stats.fmri_spec.sess.multi = {onset_data};
    matlabbatch{1}.spm.stats.fmri_spec.sess.multi_reg = {confound_data};

    % Run the SPM batch
    spm_jobman('run', matlabbatch);
    ```

    This script converts the timing and confounds information, then immediately feeds them into an SPM batch, making it suitable for automated batch jobs over multiple runs or subject.

=== "Save SPM-Compatible Files"

    If you want to save the converted files for later use, you can use the functions to write them into files with BIDS-compliant names. This is helpful if you need to inspect the files or share them with collaborators before running the GLM analysis:

    ```matlab
    % Example script to convert and save files in SPM-compatible format
    subject_id = 'sub-01';
    run_id = 'run-01';

    % Paths to the BIDS event and confound files
    tsv_file = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_events.tsv']);
    json_file = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_desc-confounds_timeseries.json']);
    confound_tsv = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_desc-confounds_timeseries.tsv']);

    % Specify output paths
    onset_save_path = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_desc-events.mat']);
    confound_save_path = fullfile('BIDS', subject_id, 'func', [subject_id '_' run_id '_desc-confoundsspm.mat']);

    % Convert and save onset data
    onset_data = eventsBIDS2SPM(tsv_file);
    save(onset_save_path, 'onset_data');

    % Convert and save confound data with a chosen pipeline
    pipeline = {'HMP-6', 'GS-1'}; % Example: 6 head motion parameters + 1 global signal
    confound_data = fMRIprepConfounds2SPM(json_file, confound_tsv, pipeline);
    save(confound_save_path, 'confound_data');

    % Now the onset and confound files can be loaded into SPM as needed.
    ```

    This script allows you to convert the timing and confound data and save them to files with clear, BIDS-compliant names. These files can later be imported into SPM using the GUI or through further scripting.

!!! tip "Automating Batch Processing"
    By integrating these functions into a script, you can automate the entire process of setting up the design matrix for multiple subjects and runs. This approach is particularly useful for large datasets, allowing you to focus on refining the analysis rather than manual data preparation.

### Specifying the 1st-Level Model in SPM

Once you have your onset times and confound regressors files ready, you can set up the design matrix:

1. **Open SPM**: Launch the SPM GUI with `spm fmri`
2. **Specify 1st-Level**: Go to `Specify 1st Level` in the SPM menu.
3. **Set Parameters**:
    - **Units for design**: Set to `seconds`.
    - **Interscan interval (TR)**: Use your fMRI acquisition’s TR value.
    - **Microtime resolution**: This should be the number of slices acquired per TR (e.g., `64` for a 64-slice scan).
4. **Input Onset Files**:
    - Use the *multiple conditions* option to input onset time files (e.g., `sub-01_run-01_eventsspm.mat`).
5. **Include Confound Regressors**:
    - Select the confound regressors from the confound files (e.g., `sub-01_run-01_confoundsspm.mat`).

### Reviewing the Design Matrix

After specifying the design matrix:

1. **Click `Review`**: This will open a visualization of the design matrix.
2. **Check for the following**:
    - Clear separation between conditions.
    - Proper alignment of conditions with the expected timing.
    - Inclusion of nuisance regressors (e.g., head motion).

!!! tip "What to Look For"
    - **Boxcar Patterns**: Ensure that the regressors follow the expected patterns based on your design.
    - **Orthogonality**: Verify that the conditions are not overly correlated, as this can impact the model’s stability.

!!! note "Saving the Design Matrix"
    To save the design matrix visualization for documentation:
    - Right-click on the matrix plot and select `Save as Image`.
    - Store the image in your documentation folder.

---

## Step 3: Model Estimation & Results

With your design matrix ready, you can estimate the model and define contrasts to test your hypotheses. This step will produce the beta values and residuals necessary for further analysis.

### Estimating the Model

1. **Review the Design Matrix**: Before estimation, ensure the design matrix looks correct by clicking `Review`.
2. **Estimate the Model**: Select `Estimate` in the GUI and choose the `SPM.mat` file.
    - Set `write residuals` to `yes` to save residual images.
    - Click `Run` to initiate the model estimation.

    - This process will generate beta images (one per regressor) and residual variance estimates.

!!! tip "Why Save Residuals?"
    Saving residuals can help diagnose issues with model fit by checking for any systematic patterns in the residual images.

### Defining and Evaluating Contrasts

Contrasts allow you to test specific hypotheses about the brain's response to different conditions, such as comparing activations between different task conditions or testing against a baseline.

1. **Define New Contrasts**:
    - Go to `Results` > `Define New Contrast`.
    - Enter a name for the contrast (e.g., `Condition1 > Condition2`).
    - Specify the weights for each condition based on the order of the regressors (e.g., `[1 -1]`).

2. **Evaluate the Contrasts**:
    - After defining contrasts, set the desired threshold (e.g., `p < 0.001`) and click `Run` to see the results.
    - Review the statistical maps for significant clusters or activations.

!!! example "Example Contrast"
    For a comparison between two conditions (e.g., `Faces` vs. `Objects`), use:
    ```
    [1 -1]
    ```
    This weights `Faces` positively and `Objects` negatively, highlighting brain regions more active during the `Faces` condition.

---

### Verifying the Order of Regressors

It’s crucial to confirm the order of regressors in the design matrix before specifying contrasts to ensure that your weights align correctly with the conditions. Here’s how to verify this using both the SPM GUI and by inspecting the `SPM.mat` file directly.

=== "Option 1: Checking Regressor Order Using the SPM GUI"

    1. **Review the Design Matrix**:
    
        - Open SPM and select `Review` > `SPM.mat`.
        - This opens the design matrix in a new window.
        - In the design matrix window, each column represents a different regressor (condition or nuisance variable).

    2. **Interpret the Design Matrix**:
    
        - Hover over each column to see the name and description of the regressor.
        - Typically, the first set of columns corresponds to your experimental conditions (e.g., `Faces`, `Objects`), followed by any nuisance regressors (e.g., motion parameters).
        - Make a note of the order so that you can set your contrast weights accurately.

    !!! tip "Use the Design Matrix Visualization"
        The design matrix visualization provides a graphical representation of each regressor. Patterns in the design matrix (e.g., boxcar shapes for task conditions) can help you verify the expected structure.

=== "Option 2: Inspecting the `SPM.mat` File Directly"

    1. **Load the `SPM.mat` File in MATLAB**:
    
        In the MATLAB command window, navigate to the folder containing your `SPM.mat` file:
         ```matlab
         cd('/path/to/your/SPM_results_folder');
         load('SPM.mat');
         ```
        This loads the `SPM` structure into your workspace.

    2. **Explore the Regressors**:
    
        To see the names of the regressors, type:
         ```matlab
         SPM.xX.name
         ```
        This command will display a list of the regressor names in the order they appear in the design matrix.

    3. **Interpret the Output**:
    
        The output will look something like this:
         ```
         'Sn(1) condition1*bf(1)'
         'Sn(1) condition2*bf(1)'
         'Sn(1) condition3*bf(1)'
         'Sn(1) motion_x'
         'Sn(1) motion_y'
         ```
        Each string corresponds to a regressor:
        
          - `Sn(1)`: Refers to session 1 (the run number).
          - `condition1*bf(1)`: Represents a condition convolved with the basis function (e.g., `Faces`).
          - `motion_x`, `motion_y`, etc.: These are motion parameters as nuisance regressors.

    4. **Align the Contrast Weights**:
    
        Based on this order, you can now set your contrast weights correctly. For instance, if `condition1` is the first regressor and `condition2` is the second, a contrast comparing them would be:
         ```
         [1 -1 0 0 0 ...]
         ```

    !!! example "Checking Regressors in a Script"
        If you are scripting the process, you can automate this check by including:
        ```matlab
        % Load the design matrix and display regressor names
        load('SPM.mat');
        disp(SPM.xX.name);
        ```
        This will print the regressor names directly in the MATLAB command window, helping you confirm the correct order before specifying your contrasts.

!!! question "Why Checking Regressor Order Matters?"

    - **Ensures Correct Contrast Specification**: Mismatched contrasts can lead to incorrect interpretations of your data, as they might test unintended comparisons.
    - **Simplifies Troubleshooting**: If the results look unexpected, double-checking the regressor order is one of the first steps to identify potential issues in the GLM setup.
    - **Consistency Across Sessions**: If you’re analyzing multiple runs or sessions, verifying regressor order ensures consistency across sessions, which is crucial for second-level analyses.

### Visualizing and Saving Results

1. **Viewing Results**: Use the SPM results viewer to explore significant clusters.
2. **Save the Statistical Maps**:
    - Save thresholded activation maps as `.nii` files using the `Save` button in the results window.
3. **Generate Figures**:
    - Use the `Render` or `Surface` options to create visual summaries of your findings.
    - Save these figures for inclusion in reports or presentations.

!!! tip "Exporting Images"
    To include figures in publications or reports:
    - Use `Export` in SPM to save figures as high-resolution images.
    - For 3D brain renderings, adjust the orientation and threshold for a clear presentation.

---

Continue to the next guide for instructions on setting up Regions of Interest (ROIs) to extract and analyze data from specific brain regions:
[--> Regions of Interest](fmri-rois.md)

---

- **[TODO]:** Add example directories showing how files are organized before and after preprocessing.
- **[TODO]:** Include screenshots or illustrations for key steps (e.g., setting up the design matrix in SPM).
- **[PLACEHOLDER]:** Add a screenshot of the SPM results interface to illustrate how to set thresholds.
- **[TODO]:** Include instructions on visualizing and saving the design matrix in SPM for documentation.
