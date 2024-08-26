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
