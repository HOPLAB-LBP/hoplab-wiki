# Regions of Interest (ROIs)

When conducting fMRI analyses, we often focus on specific brain regions based on theoretical or empirical questions. These **Regions of Interest (ROIs)** are defined areas in the brain that we hypothesize to be relevant to a particular cognitive function or task.

By restricting the analysis to ROIs, researchers can improve **statistical power**, focus on **hypothesized brain areas**, and extract data for **multivariate pattern analyses** (MVPA).

## Commonly Used ROI Types

The following types of ROIs are commonly used in fMRI research:

1. **Anatomical ROIs**: These are based on anatomical landmarks, often derived from standard brain atlases.
2. **Functional ROIs**: Defined based on brain activation patterns observed in functional localizer tasks.
3. **Spherical ROIs**: Spheres around specific MNI coordinates, offering a quick, automated way to generate ROIs.

### Example: Creating Spherical ROIs with the GUI

<!--
__TODO__: Add a step-by-step walkthrough for creating spherical ROIs using the MarsBaR GUI in SPM. Include screenshots of the key dialogs (ROI definition, coordinate entry, radius selection, saving).
-->

### Example: Creating Spherical ROIs with a Script

Below is an example MATLAB script designed to creare bilateral ROIs. This script leverages **MarsBaR** and **SPM** to generate spherical ROIs around given MNI coordinates. The ROIs are saved as NIfTI files, which can be further used in analyses such as **multivariate decoding**.

??? example "Script for Creating Spherical ROIs in MATLAB"
    ```matlab title="makeROISpheres.m" linenums="1"
    % MATLAB Script for Generating Spherical ROIs
    % ================================================
    % This script creates spherical ROIs with specified MNI coordinates, radii, and a reference image.
    % Dependencies: MarsBaR, SPM, hop_roi_sphere function.
    %
    % Author: Andrea Costantino
    % Date: October 2024

    % Define output paths and options
    outRoot = './chess-expertise-2025/results/test';
    opt = struct();
    opt.space = 'MNI152NLin2009cAsym_res-2'; % Coordinate space
    opt.dir.output = fullfile(outRoot, 'rois'); % Output directory for ROIs

    % Define the reference image path (any BOLD or beta image for this subject)
    m.referencePath = './BIDS/derivatives/fmriprep/sub-01/func/sub-01_task-exp_run-2_space-MNI152NLin2009cAsym_res-2_desc-preproc_bold.nii.gz';

    % Define ROI parameters
    m.radii = [5, 10]; % Radii for the spherical ROIs in mm
    m.roisToCreate = struct(...
        'area', {'FFA', 'LOC', 'PPA', 'TPJ', 'PCC1', ...
                 'CoS_PPA1', 'pMTL_OTJ', 'OTJ', 'pMTG', 'SMG1', ...
                 'CoS_PPA2', 'RSC_PCC', 'SMG2', 'pMTG_OTJ', 'Caudatus'}, ...
        'coordsL', {[-38, -58, -14], [-44, -77, -12], [-30, -50, -10], [-56, -47, 33], [2, -30, 34], ...
                    [33, 39, 12], [-47, -69, 8], [-47, -69, 8], [-60, -54, -3], [-60, -36, 36], ...
                    [-32, -43, -11], [-10, -75, 16], [-63, -31, 33], [-35, -80, 25], [-15, 13, 11]}, ...
        'coordsR', {[40, -55, -12], [44, -78, -13], [30, -54, -12], [56, -47, 33], [], ...
                    [30, 42, 9], [48, -69, 15], [55, -69, 14], [58, -52, 1], [63, -27, 42], ...
                    [18, -52, 5], [38, -36, -13], [], [51, -69, 16], [11, 18, 10]} ...
    );

    % Display ROI parameters for verification
    fprintf('Preparing to create ROIs with the following parameters:\n');
    for i = 1:length(m.roisToCreate)
        currROI = m.roisToCreate(i);
        fprintf('  ROI: %s\n', currROI.area);
        fprintf('    MNI coordinates (left): [%s]\n', num2str(currROI.coordsL));
        fprintf('    MNI coordinates (right): [%s]\n', num2str(currROI.coordsR));
    end

    % Generate the ROIs
    hop_roi_sphere(opt, m);

    %% Helper function to create and save spherical ROIs
    function hop_roi_sphere(opt, m)
        % Generates spherical ROIs and saves them as NIfTI files.
        % Parameters:
        %   opt - Contains output directory and coordinate space information.
        %   m - Contains reference image path, radii, and ROI coordinates.

        for radius = m.radii
            fprintf('\nCreating ROIs with radius: %d mm\n', radius);
            
            % Set output folder for current radius
            outputFolder = fullfile(opt.dir.output, sprintf('radius_%dmm', radius));
            if ~exist(outputFolder, 'dir'), mkdir(outputFolder); end

            % Load reference space using SPM functions
            refSPM = spm_vol(m.referencePath);
            referenceSpace = mars_space(refSPM);

            % Iterate through each ROI definition
            for i = 1:length(m.roisToCreate)
                currROI = m.roisToCreate(i);
                fprintf('\nProcessing ROI: %s\n', currROI.area);

                % Left hemisphere ROI
                if ~isempty(currROI.coordsL)
                    create_and_save_roi(currROI.coordsL, 'L', currROI.area, radius, opt, referenceSpace, outputFolder);
                end

                % Right hemisphere ROI
                if ~isempty(currROI.coordsR)
                    create_and_save_roi(currROI.coordsR, 'R', currROI.area, radius, opt, referenceSpace, outputFolder);
                end

                % Bilateral ROI
                if ~isempty(currROI.coordsL) && ~isempty(currROI.coordsR)
                    create_and_save_roi_bilateral(currROI.coordsL, currROI.coordsR, currROI.area, radius, opt, referenceSpace, outputFolder);
                end
            end
        end
    end

    function create_and_save_roi(coords, hemi, area, radius, opt, referenceSpace, outputFolder)
        % Creates and saves a sphere ROI for given coordinates.
        % Parameters:
        %   coords - MNI coordinates for the ROI center.
        %   hemi - 'L' or 'R' indicating hemisphere.
        %   area - Label for the ROI.
        %   radius - Sphere radius in mm.
        %   opt - Options struct with output and space information.
        %   referenceSpace - MarsBaR space object for the brain reference.
        %   outputFolder - Directory to save the NIfTI file.

        roiLabel = sprintf('hemi-%s_label-%s', hemi, area);
        fprintf('  Creating %s ROI with radius %d mm\n', roiLabel, radius);

        % Create sphere ROI with MarsBaR
        sphereROI = maroi_sphere(struct('centre', coords, 'radius', radius, 'label', roiLabel, 'reference', referenceSpace));

        % Save ROI as NIfTI file
        filename = fullfile(outputFolder, sprintf('hemi-%s_space-%s_radius-%dmm_label-%s.nii', hemi, opt.space, radius, area));
        save_as_image(sphereROI, filename);
        fprintf('  Saved ROI: %s\n', filename);
    end

    function create_and_save_roi_bilateral(coordsL, coordsR, area, radius, opt, referenceSpace, outputFolder)
        % Creates and saves a bilateral ROI by combining left and right coordinates.
        % Parameters are identical to create_and_save_roi, but it combines two sets of coordinates.

        fprintf('  Creating bilateral ROI with radius %d mm for area %s\n', radius, area);

        % Create left and right hemisphere ROIs
        leftROI = maroi_sphere(struct('centre', coordsL, 'radius', radius, 'label', sprintf('hemi-L_label-%s', area)));
        rightROI = maroi_sphere(struct('centre', coordsR, 'radius', radius, 'label', sprintf('hemi-R_label-%s', area)));

        % Resample and combine hemispheres
        resampledLeftROI = maroi_matrix(leftROI, referenceSpace);
        resampledRightROI = maroi_matrix(rightROI, referenceSpace);
        combinedData = (struct(resampledLeftROI).dat > 0.5) | (struct(resampledRightROI).dat > 0.5);
        bilateralROI = maroi_matrix(struct('dat', combinedData, 'mat', referenceSpace.mat, 'label', sprintf('hemi-B_label-%s', area)));

        % Save as bilateral NIfTI file
        filename = fullfile(outputFolder, sprintf('hemi-B_space-%s_radius-%dmm_label-%s.nii', opt.space, radius, area));
        save_as_image(bilateralROI, filename);
        fprintf('  Saved bilateral ROI: %s\n', filename);
    end
    ```

This script will output a folder as follow:
    ```bash
    rois
    └── radius_5mm
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-Caudatus.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-CoS_PPA1.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-CoS_PPA2.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-FFA.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-LOC.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-OTJ.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTG.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTG_OTJ.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTL_OTJ.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-PPA.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-RSC_PCC.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-SMG1.nii
        ├── hemi-B_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-TPJ.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-Caudatus.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-CoS_PPA1.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-CoS_PPA2.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-FFA.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-LOC.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-OTJ.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-PCC1.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTG.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTG_OTJ.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTL_OTJ.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-PPA.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-RSC_PCC.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-SMG1.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-SMG2.nii
        ├── hemi-L_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-TPJ.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-Caudatus.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-CoS_PPA1.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-CoS_PPA2.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-FFA.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-LOC.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-OTJ.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTG.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTG_OTJ.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-pMTL_OTJ.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-PPA.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-RSC_PCC.nii
        ├── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-SMG1.nii
        └── hemi-R_space-MNI152NLin2009cAsym_res-2_radius-5mm_label-TPJ.nii
    ```

With right (`hemi-R`), left (`hemi-L`) and bilateral (`hemi-B`) masks.

The size of the ROIs is defined in millimeters, and is a list of **radii** such as `m.radii = [5, 10];` (see line 19 of the `makeROISpheres.m` script).

!!! warning
    The bilateral masks will be generated automatically only when both R and L coordinates are provided for a given ROI. If only R or L coordinates are provided, only the R or L mask will be saved.

---

### HCP Glasser Parcellation (HCP-MMP1.0)

The [Glasser2016 parcellation](https://figshare.com/articles/dataset/HCP-MMP1_0_projected_on_fsaverage/3498446) (HCP-MMP1.0) provides a comprehensive cortical atlas with **180 ROIs per hemisphere**, based on the Human Connectome Project Multi-Modal Parcellation. This parcellation is particularly useful for whole-brain ROI-based analyses such as MVPA, where you want to systematically decode information across all cortical regions.

#### Using the Glasser atlas in MNI space

If you are running your analyses in a common volumetric space (e.g., MNI) — which is the most common approach — you can use a ready-made **MNI volumetric version** of the Glasser atlas provided by AFNI:

- **Atlas file**: [`MNI_Glasser_HCP_v1.0.nii.gz`](https://afni.nimh.nih.gov/pub/dist/atlases/MNI_HCP/MNI_Glasser_HCP_2021_v1.0a/MNI_Glasser_HCP_v1.0.nii.gz)
- **Documentation and additional files**: [MNI_HCP atlas folder](https://afni.nimh.nih.gov/pub/dist/atlases/MNI_HCP/MNI_Glasser_HCP_2021_v1.0a/)

This atlas can be used directly with your MNI-space beta images (e.g., from fMRIPrep with `MNI152NLin2009cAsym` output space) without any further projection or transformation steps.

#### Projecting the Glasser atlas to subject space

If you need higher-fidelity, **subject-specific** ROIs — for instance, when running analyses in native subject space — you can project the Glasser parcellation from `fsaverage` to each individual subject. This involves converting annotation files to labels and mapping them through FreeSurfer's surface registration. The result is a set of volumetric ROIs in each subject's T1 space that respect individual cortical folding patterns.

??? tip "Automating Glasser projection with HPC-to-subject.sh"
    If you are using the Glasser parcellation across many subjects, you can automate the projection from `fsaverage` to subject space using a shell script (e.g., `HPC-to-subject.sh`). This script typically:

    1. Converts Glasser annotation files (`.annot`) to individual label files.
    2. Maps each label from `fsaverage` to the subject's native surface using FreeSurfer's `mri_label2vol` or similar tools.
    3. Transforms the resulting ROIs into the volumetric spaces used by your analysis (e.g., T1w, MNI).

    See the top of the script file for usage notes. An example implementation can be found in the [chess-expertise-2025 repository](https://github.com/costantinoai/chess-expertise-2025).

---

## Intersecting ROI Masks with GLM Results

In our lab, we apply an additional refinement step to **Region of Interest (ROI)** masks to precisely target the most relevant brain voxels. This involves intersecting the mask (e.g., a spherical or anatomical ROI) with the **significant activation** of a specific contrast. This approach is particularly beneficial for analyses like **multivariate pattern analysis (MVPA)**, where targeted voxel selection is crucial for decoding tasks.

For instance, suppose we want to perform an MVPA to determine if we can distinguish between *Female* and *Male* faces in the **Fusiform Face Area (FFA)**. Here’s how we might set up the analysis:

1. **Create an Initial ROI Mask**:
    - First, we create a NIfTI file with values of 1 in the FFA region and 0 elsewhere. This mask can be created either anatomically (using an atlas) or by defining a spherical mask centered on FFA coordinates.
  
2. **Run a First-Level Analysis to Identify Activation in the ROI**:
    - In **SPM**, perform a First-Level analysis to obtain significant activation for a relevant contrast, such as *Faces vs. Objects*. This will produce a **t-map** that indicates the t values of all voxels for the given contrast.

    !!! question "What contrasts should I use?"
        - If we use a **localizer run** (i.e., a run where participants are shown categories for functional localization), then we can set up contrasts based on well-established literature. For example, for the FFA, the *Faces > Objects* contrast is commonly used; for LOC, *Objects > Scrambled* is typical.
        - If we use the **experimental task run** (i.e., when participants perform the main task), we generally choose contrasts that reflect overall activity in the region. For example, we might use an *All > Rest* contrast where all experimental conditions are positive and rest blocks are negative, capturing the regions most active during the task overall.

3. **Threshold the Activation Map**  
    - Apply a statistical threshold to the t-map, setting a significance level (e.g., p < .001) to identify the voxels significantly active for the contrast of interest.

4. **Intersect Masked and Activated Voxels**  
    - Generate a new ROI that includes only the voxels both significantly active in the contrast and within the initial mask (e.g., sphere or anatomical region).

5. **Extract beta values from selected voxels**  
    - We use the generated ROI to filter voxels in the beta images (the `beta_00*.nii` images in the SPM GLM output folder) for further MVPA.

This approach has two key benefits:

1. **Selective Targeting of Relevant Voxels**: It ensures that the ROI captures only the voxels relevant for the cognitive function of interest, maximizing information and minimizing potential noise from uninformative voxels.
2. **Feature Reduction**: Reducing the number of features (voxels) helps improve the classifier's performance by mitigating the **Curse of Dimensionality** (see this [article on dimensionality reduction](https://www.datacamp.com/blog/curse-of-dimensionality-machine-learning) for more info).

### Example: Generating Refined ROIs by Intersecting Masks with Activation Maps

The following MATLAB script refines ROIs by intersecting an initial mask (e.g., anatomical or spherical) with a subject-specific activation map from an SPM contrast. This approach is particularly valuable for targeted analyses, such as **multivariate pattern analysis (MVPA)**.

#### Script Workflow

1. **Thresholding**: Applies a statistical threshold to the contrast map, identifying only voxels with significant activation.
2. **Intersection**: Intersects these significant voxels with the ROI mask to focus on relevant areas within the predefined region.
3. **Voxel Count Check**: Ensures the resulting ROI contains a minimum number of significant voxels (default: 25). If the voxel count is too low, the significance threshold is incrementally relaxed until the minimum count is met.
4. **Saving Results**: Exports the final ROI in both NIfTI (`.nii`) and MATLAB (`.mat`) formats, making it ready for further analysis.

!!! tip "Finding Contrast Names in SPM"
    To find the exact names of contrasts in an SPM model, load the SPM.mat file and check `SPM.xCon.name`. This allows you to confirm the contrast names required for the `contrastName` field in `roisStruct`.
  
??? example "Script to Create ROIs from an Image Mask and Statistical Activation Map"
    ```matlab title="intersectROIandGLM.m" linenums="1"
    % MATLAB Script for Creating ROI Files from Activation Maps and Image Masks
    % =========================================================================
    % This script generates an ROI from an existing ROI mask and an activation contrast map.
    %
    % Dependencies: Requires MarsBaR and SPM to be installed.
    %
    % Author: Andrea Costantino
    % Date: 7 July 2023

    clc;
    clear;
    
    %% Set Parameters
    % Define paths for data directories, GLM results, MarsBaR, and ROI storage.
    derivativesDir = '/data/projects/chess/data/BIDS/derivatives';
    GLMroot = fullfile(derivativesDir, 'SPM/GLM/');
    marsabPath = fullfile(derivativesDir, 'marsbar');
    roisRoot = fullfile(marsabPath, 'rois-noloc');
    outRoot = fullfile(marsabPath, 'rois+loc');
    
    %% Define ROI Details

    % Example ROIs: Specify ROI name, path to the image file, task, and contrast name.
    roisStruct(1).roiName = 'FFA';
    roisStruct(1).roiImgPath = fullfile(roisRoot, 'radius_10/ROI-FFA_radius-10_space-MNI_resampled-to-sub_binary.nii');
    roisStruct(1).taskName = 'exp';
    roisStruct(1).contrastName = 'All > Rest';
    roisStruct(1).outFolder = 'radius_10+exp';

    % LOC - Objects > Scrambled
    roisStruct(2).roiName = 'LOC';
    roisStruct(2).roiImgPath = fullfile(roisRoot,'radius_10/ROI-LOC_radius-10_space-MNI_resampled-to-sub_binary.nii');
    roisStruct(2).taskName = 'loc';
    roisStruct(2).contrastName = 'Objects > Scrambled';
    roisStruct(2).outFolder = 'radius_10+loc';

    % Define here more ROIs if needed
    
    %% Select Subjects
    % Define which subjects to process. Use '*' for all subjects.
    selectedSubjectsList = '*';
    subPaths = findSubjectsFolders(GLMroot, selectedSubjectsList);
    
    %% Initialize MarsBaR and SPM
    % Start the MarsBaR toolbox and set SPM defaults for fMRI.
    marsbar('on');
    spm('defaults', 'fmri');
    
    %% Process Each Subject
    for subRow = 1:length(subPaths)
        % Subject name and preparation
        subName = subPaths(subRow).name;
        fprintf('\n###### Processing %s ######\n', subName);
        
        for roiNum = 1:length(roisStruct)
            % Output directory setup
            outDir = createOutputDir(outRoot, roisStruct(roiNum).outFolder, subName);
            
            % Ensure subject has the specified task, or skip this ROI
            subPath = fullfile(subPaths(subRow).folder, subPaths(subRow).name);
            subHasTask = checkSubjectHasTask(subPath, roisStruct(roiNum).taskName, subName);
            if ~subHasTask
                continue;
            end
            
            % Load ROI image data
            [roiImg, roiStruct] = loadROIImageData(roisStruct(roiNum).roiImgPath);
            
            % Load SPM model for the subject and task
            GLMdir = fullfile(GLMroot, subName, roisStruct(roiNum).taskName);
            [model, loadSuccess] = loadSPMModel(GLMdir, subName, roisStruct(roiNum).taskName);
            if ~loadSuccess
                continue;
            end
            
            % Load and threshold the contrast map (p < 0.001)
            [tConImg, tStruct] = loadTContrastImage(model, roisStruct(roiNum).contrastName, GLMdir);
            [thresholdedImage, finalPThresh] = calculateAndApplyThreshold(tConImg, model);
            
            % Check alignment between ROI and contrast map
            assert(isequal(roiStruct.mat, tStruct.mat), 'Affine matrices do not match.');
            assert(isequal(roiStruct.dim, tStruct.dim), 'Image dimensions do not match.');
            
            % Intersect thresholded T map and ROI mask
            finalRoi = createIntersectedROI(thresholdedImage, roiImg, tStruct, roisStruct(roiNum).roiName, roisStruct(roiNum).contrastName);
            
            % Save final ROI to file
            saveROI(finalRoi, roisStruct(roiNum).roiImgPath, finalPThresh, roisStruct(roiNum).taskName, roisStruct(roiNum).contrastName, outDir);
        end
        
        % Save a copy of the script for replicability
        saveScriptForReplicability(outDir);
    end
    
    %% Helper functions
    function saveScriptForReplicability(outDir)
        % Copies the currently running script to the specified output directory for replicability.
        %
        % This function identifies the full path of the currently executing script and copies it
        % to the given output directory. This process aids in ensuring that analyses can be
        % replicated or reviewed in the future with the exact code version used.
        %
        % Parameters:
        %   outDir: The directory where the script should be copied for future reference.
        %
        % Example usage:
        %   saveScriptForReplicability('/path/to/output/dir');

        fprintf('Saving current script for replicability...\n');
        
        % Get the full path of the currently executing script
        fileNameAndLocation = mfilename('fullpath');
        
        % Extract the directory, file name, and extension of the current script
        [path, filename, ~] = fileparts(fileNameAndLocation);
        
        % Construct the output file name and location
        outputFileNameAndLocation = fullfile(outDir, strcat(filename, '.m'));
        
        % Define the current script's file path
        currentfile = strcat(fileNameAndLocation, '.m');
        
        % Copy the script file to the output directory
        try
            copyfile(currentfile, outputFileNameAndLocation);
            fprintf('Script copied to output folder: %s\n', outputFileNameAndLocation);
        catch ME
            warning('Failed to copy script to output folder: %s', ME.message);
        end
    end

    function saveROI(finalRoi, roiImgPath, pThresh, taskName, contrastName, outDir)
        % Saves the ROI to the specified output directory in both NIfTI and .mat formats.
        %
        % This function constructs the output file name using the base ROI name, task name,
        % a simplified contrast name, and the p-value threshold used. It saves the ROI object
        % as an image and as a MATLAB file, logging each step.
        %
        % Parameters:
        %   finalRoi: The ROI object to be saved.
        %   roiImgPath: The file path of the original ROI, used to extract the base file name.
        %   pThresh: The p-value threshold used, for inclusion in the file name.
        %   taskName: The name of the task associated with the ROI.
        %   contrastName: The original contrast name, to be simplified for file naming.
        %   outDir: The directory where the ROI files should be saved.
        %
        % Example usage:
        %   saveROI(finalRoi, '/path/to/original/roi.nii', 0.001, 'task1', 'Contrast 1', '/path/to/output/dir');

        fprintf('STEP: Saving ROI...\n');
        
        % Extract the base file name of the original ROI for use in the output file names
        [~, roiFileName, ~] = fileparts(roiImgPath);

        % Simplify the contrast name for use in the file name
        contrastNameSimple = simplifyContrastName(contrastName);

        % Prepare the p-value string for inclusion in the file name
        pThreshStringSplit = split(string(pThresh), '.');
        pThreshString = pThreshStringSplit(2); % Extracting decimal part for file naming

        % Construct the output file name
        outFileName = strcat(roiFileName, '_task-', taskName, '_contrast-', contrastNameSimple, '_p', pThreshString);

        % Define full paths for the NIfTI and .mat files
        niiFilePath = char(fullfile(outDir, strcat(outFileName, '.nii')));
        matFilePath = char(fullfile(outDir, strcat(outFileName, '.mat')));

        % Save the ROI as an image file
        try
            save_as_image(finalRoi, niiFilePath);
            fprintf('ROI image saved to: %s\n', niiFilePath);
        catch ME
            warning('Failed to save ROI image: %s', ME.message);
        end

        % Save the ROI as a MATLAB .mat file
        try
            saveroi(finalRoi, matFilePath);
            fprintf('ROI MATLAB file saved to: %s\n', matFilePath);
        catch ME
            warning('Failed to save ROI MATLAB file: %s', ME.message);
        end
    end

    function finalRoi = createIntersectedROI(thresholdedImage, roiImg, tStruct, roiName, contrastName)
        % Creates a new ROI object from the intersection of a thresholded T image and an ROI image.
        %
        % This function performs a logical AND operation between a binary thresholded T image
        % and a binary ROI image, marking voxels included in both images. It then creates a new
        % ROI object with a label derived from the ROI name and a simplified contrast name.
        %
        % Parameters:
        %   thresholdedImage: Binary image where voxels above a certain threshold are marked as 1.
        %   roiImg: The ROI image data.
        %   tStruct: The structure returned by spm_vol, containing the T image's affine matrix.
        %   roiName: The name of the ROI.
        %   contrastName: The name of the contrast used for thresholding.
        %
        % Returns:
        %   finalRoi: The newly created ROI object.
        %
        % Example usage:
        %   finalRoi = createIntersectedROI(thresholdedTImg, roiImgData, tImageStruct, 'ROI_Name', 'Contrast_Name');

        fprintf('STEP: Intersecting thresholded T image with ROI...\n');
        
        % Perform intersection by applying a logical AND operation
        intersectedImage = thresholdedImage & (roiImg > 0.5);
        
        % Optionally, count the number of voxels in the intersection for reporting or further analysis
        numIntersectedVoxels = sum(intersectedImage(:));
        fprintf('Number of intersected voxels: %d\n', numIntersectedVoxels);

        fprintf('STEP: Creating new ROI from intersected data...\n');
        
        % Simplify the contrast name for labeling the ROI
        contrastNameSimple = simplifyContrastName(contrastName);
        
        % Create the new ROI object with specified parameters
        finalRoi = maroi_matrix(struct('dat', intersectedImage, 'mat', tStruct.mat, 'label', strcat([roiName, ' ', contrastNameSimple]), 'binarize', 1, 'roithresh', 1e-10));
        
        fprintf('DONE: New ROI created successfully.\n');
    end

    function contrastNameSimple = simplifyContrastName(contrastName)
        % Simplifies the contrast name by removing non-alphabetic characters and parentheses.
        %
        % Parameters:
        %   contrastName: The original contrast name as a string.
        %
        % Returns:
        %   contrastNameSimple: The simplified contrast name, with only lowercase alphabetic characters.
        %
        % Example usage:
        %   contrastNameSimple = simplifyContrastName('Contrast 1 (Session 1)');
        
        contrastNameSimple = regexprep(lower(contrastName), '[^a-z]+|\([^)]*\)', '');
    end

    function hasTask = checkSubjectHasTask(subPath, taskName, subName)
        % Checks if the specified subject directory contains files related to the specified task.
        %
        % Parameters:
        %   subPath: The full path to the subject's directory.
        %   taskName: The name of the task to check for.
        %   subName: The name of the subject being checked.
        %
        % Returns:
        %   hasTask: A boolean indicating whether the task is present for the subject.
        %
        % Example usage:
        %   hasTask = checkSubjectHasTask('/path/to/subject/directory', 'task_name', 'subject_name');
        %
        % This function searches the subject's directory for files containing the task name,
        % and provides a warning if the task is not found, suggesting the iteration should be skipped.

        fprintf('Checking for task %s in subject %s directory...\n', taskName, subName);
        
        % Construct the full path and list files
        files = dir(subPath);
        fileNames = {files.name};
        
        % Check for the presence of the task name in any file names
        hasTask = any(contains(fileNames, taskName));
        
        if ~hasTask
            % If the task is not found, issue a warning
            warning('Task %s not found for %s in %s. Skipping...', taskName, subName, subPath);
        else
            fprintf('Task %s found for subject %s.\n', taskName, subName);
        end
    end

    function [tConImg, tStruct] = loadTContrastImage(model, contrastName, GLMdir)
        % Loads T contrast image voxel data for a given contrast name and GLM directory.
        %
        % Parameters:
        %   model: The loaded SPM model object for the current subject and task.
        %   contrastName: The name of the contrast to load.
        %   GLMdir: Directory containing the GLM results for the subject.
        %
        % Returns:
        %   tConImg: The voxel data of the T contrast image.
        %   tStruct: The structure of the T contrast image.
        %
        % Example usage:
        %   [tConImg, tStruct] = loadTContrastImage(model, 'contrastName', '/path/to/GLMdir');
        %
        % This function first attempts to find the specified contrast within the model.
        % If not found, it appends ' - All Sessions' to the name and retries.
        % It then checks for the existence of the T contrast image file and loads its voxel data.

        try
            fprintf('Attempting to load T contrast image for contrast: %s\n', contrastName);
            
            % Attempt to find the specified contrast by name
            t_con = get_contrast_by_name(model, contrastName);
            if isempty(t_con)
                % If not found, try appending ' - All Sessions' and search again
                fprintf('Contrast %s not found, trying with " - All Sessions" suffix.\n', contrastName);
                contrastName = strcat(contrastName, ' - All Sessions');
                t_con = get_contrast_by_name(model, contrastName);
                if isempty(t_con)
                    error('ContrastNotFound', 'Cannot find the contrast %s in the design; has it been estimated?', contrastName);
                end
            end

            % Construct the full path to the T contrast image file
            tConFname = fullfile(GLMdir, t_con.Vspm.fname);

            % Verify the existence of the T contrast image file
            if ~exist(tConFname, 'file')
                error('FileNotFound', 'Cannot find T image %s; has it been estimated?', tConFname);
            else
                fprintf('T contrast image found: %s\n', tConFname);
            end

            % Load the voxel data from the T contrast image
            fprintf('Loading voxel data from T contrast image...\n');
            tStruct = spm_vol(tConFname);
            tConImg = spm_read_vols(tStruct);
            fprintf('Voxel data loaded successfully.\n');

        catch ME
            switch ME.identifier
                case 'ContrastNotFound'
                    fprintf('Error: %s\n', ME.message);
                case 'FileNotFound'
                    fprintf('Error: %s\n', ME.message);
                otherwise
                    fprintf('An unexpected error occurred: %s\n', ME.message);
            end
            tConImg = []; % Return empty in case of error
            tConFname = '';
        end
    end

    function [model, loadSuccess] = loadSPMModel(GLMdir, subName, taskName)
        % Attempts to load the SPM model for a given subject and task.
        %
        % Parameters:
        %   GLMdir: The directory containing the GLM results for the subject.
        %   subName: The name of the current subject being processed.
        %   taskName: The name of the task for which the model is being loaded.
        %
        % Returns:
        %   model: The loaded SPM model object, or empty if loading failed.
        %   loadSuccess: A boolean indicating whether the model was successfully loaded.
        %
        % Example usage:
        %   [model, loadSuccess] = loadSPMModel('/path/to/GLMdir', 'subject1', 'task1');
        %
        % This function tries to load the SPM.mat file and handles any errors that occur,
        % logging appropriate messages and returning a status indicator.

        fprintf('Attempting to load SPM model for subject %s, task %s...\n', subName, taskName);
        model = []; % Initialize model as empty
        loadSuccess = false; % Initialize success status as false

        try
            % Construct the path to the SPM.mat file
            spmPath = fullfile(GLMdir, 'SPM.mat');

            % Attempt to load the SPM model
            model = mardo(spmPath);
            
            % If successful, set the success status to true
            loadSuccess = true;
            fprintf('SPM model loaded successfully.\n');

        catch ME
            % Handle errors that occur during model loading
            fprintf('WARNING: Error loading SPM model for %s, task %s: %s\n', subName, taskName, ME.message);
            fprintf('Skipping to the next iteration.\n');
            % No need to set model or loadSuccess as they are already initialized to their failure states
        end

        % Return the model (empty if failed) and the success status
        return;
    end

    function [roiImg, roiStruct] = loadROIImageData(roiImgPath)
        % Loads the ROI image and its voxel data from a specified path.
        %
        % Parameters:
        %   roiImgPath: The file path to the ROI image.
        %
        % Returns:
        %   roiImg: The voxel data of the ROI image.
        %   roiStruct: The structure returned by spm_vol, containing image volume information.
        %
        % Example usage:
        %   [roiImg, roiStruct] = loadROIImageData('/path/to/roi/image.nii');
        %
        % This function logs the process of loading ROI data, loads the ROI image,
        % and reads its voxel data, ensuring to handle any errors gracefully.

        fprintf('Loading ROI data from: %s\n', roiImgPath);
        
        try
            % Load the ROI image structure
            roiStruct = spm_vol(roiImgPath);
            
            % Read the voxel data from the ROI image
            roiImg = spm_read_vols(roiStruct);
            
            fprintf('ROI data successfully loaded.\n');
        catch ME
            error('Failed to load ROI data: %s', ME.message);
        end
    end

    function outDir = createOutputDir(outRoot, outFolder, subName)
        % Creates an output directory for a given subject and ROI if it doesn't already exist.
        %
        % Parameters:
        %   outRoot: The root directory under which all outputs are saved.
        %   outFolder: The folder name specific to the ROI or processing step.
        %   subName: The name of the subject being processed.
        %
        % Example usage:
        %   createOutputDir('/path/to/output/root', 'roi_specific_folder', 'subject_name');
        %
        % This function constructs the output directory path, checks if it exists,
        % and creates it if not, with logging at each step for clarity.

        % Construct the full path to the output directory
        outDir = fullfile(outRoot, outFolder, subName);
        
        % Check if the output directory already exists
        if ~exist(outDir, 'dir')
            fprintf('Creating output folder: %s\n', outDir);
            % Attempt to create the directory
            [mkdirSuccess, msg, msgID] = mkdir(outDir);
            if mkdirSuccess
                fprintf('Output folder created successfully: %s\n', outDir);
            else
                error('Failed to create output folder: %s\nMessage ID: %s\n%s', outDir, msgID, msg);
            end
        else
            fprintf('Output folder already exists: %s. No action needed.\n', outDir);
        end
    end

    function [thresholdedImage, finalPThresh] = calculateAndApplyThreshold(tConImg, model, initialPThresh, adjustmentPThreshs, minVoxels)
        % Calculates and applies a threshold to T images based on uncorrected p-values,
        % adjusting the threshold if necessary to meet a minimum voxel count.
        %
        % Parameters:
        %   tConImg: The voxel data of the T contrast image.
        %   model: The loaded SPM model object for obtaining error degrees of freedom.
        %   initialPThresh (optional): The initial p-value threshold. Default is 0.001.
        %   adjustmentPThreshs (optional): Array of p-value thresholds to try if initial thresholding is insufficient. Default is [0.01, 0.05].
        %   minVoxels (optional): Minimum number of voxels required after thresholding. Default is 25.
        %
        % Returns:
        %   thresholdedImage: The T image after applying the final threshold.
        %   finalPThresh: The final p-value threshold used.
        
        % Set default values if not provided
        if nargin < 3 || isempty(initialPThresh)
            initialPThresh = 0.001;
        end
        if nargin < 4 || isempty(adjustmentPThreshs)
            adjustmentPThreshs = [0.01, 0.05];
        end
        if nargin < 5 || isempty(minVoxels)
            minVoxels = 25;
        end
        
        erdf = error_df(model);
        finalPThresh = initialPThresh;
        i = 1; % Start with the first adjustment threshold if needed
        
        % Initially apply threshold
        [thresholdedImage, numCells] = applyThreshold(tConImg, finalPThresh, erdf);
        
        % Adjust threshold if necessary
        while numCells < minVoxels && i <= length(adjustmentPThreshs)
            finalPThresh = adjustmentPThreshs(i);
            [thresholdedImage, numCells] = applyThreshold(tConImg, finalPThresh, erdf);
            i = i + 1; % Move to the next threshold for adjustment
        end
        
        if numCells < minVoxels
            warning('Final voxel count below %d even after adjusting thresholds. Final count: %d', minVoxels, numCells);
        else
            fprintf('Thresholding complete. Final p-value threshold: %f, Voxel count: %d\n', finalPThresh, numCells);
        end
    end

    function [thresholdedImage, numCells] = applyThreshold(tConImg, pThresh, erdf)
        % Helper function to apply threshold and count voxels
        tThresh = spm_invTcdf(1-pThresh, erdf); % Calculate T threshold
        thresholdedImage = tConImg > tThresh; % Apply threshold
        numCells = sum(thresholdedImage(:)); % Count voxels above threshold
    end

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
    % note:
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
        % No further action required as we've already selected all 'sub-*' folders.

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

This code generates a new folder containing **subject-specific ROIs**. While previous spherical or anatomical masks were likely generic—created in a standard space (e.g., MNI) and therefore applicable to any subject within that space — these new ROIs are specific for each subject, since they are created by intersecting the generic mask with the subject's unique pattern of activation from the GLM t-map.

---

Now that you have your beta images (from the GLM) and your ROIs, you have everything you need to run your multi-variate analysis. [--> MVPA](fmri-mvpa.md)

---

<https://neuroimaging-core-docs.readthedocs.io/en/latest/pages/atlases.html#id4>
<https://neurosynth.org/>
<https://openneuro.org/>

<!--
__TODO__: Link resources on how to do this using the MarsBaR GUI. Also consider expanding this section with references to other commonly used atlases (e.g., AAL, Schaefer, Brodmann) and functional atlas databases (e.g., NeuroSynth, Neuroquery) for defining ROIs beyond the Glasser parcellation.
-->
