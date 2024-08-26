# 

- **TODO:**  get some feedback on this page.
- **TODO:**  add some illustrations.
- **TODO:**  add some example directories to show how things evolve before and after these steps. One might get lost in which file is supposed to go where.
- **TODO:**  fill in this page, the current content is limited and just suggestions.


You should land on this page after having collected your fMRI data, [converted it to BIDS](./fmri-bids-conversion.md) and [preprocessed it](./fmri-prepocessing-qa.md). Your goal now is to model the BOLD activity with a Generalised Linear Model (GLM), in order to obtain the beta values on which to apply further analyses.

To this end, we use the [Statistical Parametric Mapping](https://www.fil.ion.ucl.ac.uk/spm/) (SPM) package. Here are the steps you will take in this section:

1. Install SPM.
2. ...
3. 

_Here, make a general recommendation about proceeding with this step: it might be best for beginners to go through the SPM GUI step by step, trying to understand what every step is doing, rather than adapt scripts straight away._

_The idea might be to (1) learn about SPM in general, with sources like Hans' HBI course, Andy's brain blog, etc., (2) play around with the GUI and run the steps for one subject, (3) get into batch processing and save scripts from SPM, and finally (4) work at the script level, amending what SPM saved and merging nicely with other utility scripts._

## Installing SPM

_General instructions on how to install_.

For mac users, potential installation issues can be tackled with the [instructions for mac](https://en.wikibooks.org/wiki/SPM/Installation_on_64bit_Mac_OS_(Intel)) on the SPM wiki. Make sure **Xcode** is installed on your computer before installing SPM. 

## Pre-SPM steps

Before running the GLM, we need to take steps to make our files ready. There are two steps that need to be taken to bring your `.nii` files from fMRIPrep output to SPM input: **gunzipping** and **smoothing**. The sugested way of proceeding is to create a `derivatives/pre-SPM` folder where to store a `gunzipped` output folder and a `smoothed` output folder.

#### Gunzipping your files

You will first need to decompress your fMRIPrep output using the _gunzip_ decompression algorithm. _Link to the gunzipping function_.

#### Smoothing your files

Smoothing is a pre-processing step that fMRIPrep does not take care of. We hence need to begin by smoothing our brain data. You can do this within SPM. Begin by opening the SPM GUI by running `spm fmri` in the command window of MatLab, and clicking `Smooth`.

**TODO:**_Give more instructions on how to run the smoothing function, including which parameters to use_.

## Creating a design matrix

The first step to running a GLM is to have a design matrix, which SPM will use to estimate the weights of the model. This design matrix is created in the GUI by specifying a 1st-level model. Although a simple experimental design with few conditions can easily be entered in the `Specify 1st level` interface of SPM, more complex design with many conditions are not adapted to this approach. If you have such a design, the best option is to externally create MatLab **onset time** files. These files contain information about event *types*, *onsets*, and *durations*. You should create one onset file per run per subject. The creation of this file is just one step away from your event files, and the conversion can be done using the `eventsBIDS2SPM.m` utility script.

**TODO:**_Mention where the onset time files should be stored, with an example directory_.

**TODO:**_Link to a utility script converting event files to onset files._

You will also need to use your **head motion regressors** files, which should have been created by fMRIPrep. _These can be converted into SPM compatible format with the `fMRIprepConfounds2SPM.m` utility script_.

**TODO:**_Link to a utility script converting confound files to SPM files._

Once you have your onset times and head motion regressor files ready, open the `Specify 1st level` interface in SPM, and fill in the fields. You can enter your onset files using _multiple conditions_, and you head motion regressors using _..._. 




<!-- 
	SMOOTHING THE LOCALISER FILES
1.	Select the files which contain _space-MNI152NLin2009cAsym*_desc-preproc_bold.nii and save them in another folder called funcneeded
2.	gunzip the files using gunzip(‘*.gz’) in Matlab for this folder
3.	select localiser 1 files (2 as we had 2 runs) and then select ALL frames
4.	click on smooth and put as settings fwhm = [4 4 4] and smooth.prefix = smooth_
5.	save batch and run

	MODEL LOC 1 (follow same steps for loc2)
General note: remember to specify model, review model, estimate , results

•	Make a directory in matlab by going to console and writing mkdir ‘nameofdir’
•	Units for design = seconds
•	Interscan interval = 2
•	Mcirotime resolution = 60 microtime onset = 30
•	use the localiser 1 run 1 events.tsv file and filter the timings and durations for each condition and save as a txt file containing 2 columns with no headings 	(onset, duration)
	when using these files, go to the matlab terminal and use the following command e.g. for faces: FacesRun1 = importdata('Faces_run1.txt');
	FacesRun1(:,1) You will need to copy and paste these timings in the onset section of the corresponding condition tab under your fMRI model specification

•	You will also need to add in multiple regressor file for each run (which are the nuisance regressors). Use the sub-00_task-loc1_run-1_desc-confounds_timeseries files for each run and task. So make 	a new txt file for each run and task with the following regressor columns: global signal (first column), trans x, trans y, trans z, rot x, rot y, rot z and the non_steady columns. We 	also want to 	use the framewise displacement info. Therefore in the timeseries file add another column after framewise displacement and add excel function if ( = IF (select the square of the framewise 		displacement column) >0.5 , 1, 0). When copying this column make sure that it is copying the values and not the function so use: paste special – as values

•	After having specified and reviewed the model, you estimate the model (click on estimate -> select the SPM.mat folder and change write residuals to yes and run. 
•	Click on results -> select the SPM file and then make your contrasts of interest. Click on define new contrasts, give it a name and write the contrast you are interested in using 1, -1 and 0
•	Apply masking: none, set threshold at 0.001 and look at results 


EXPERIMENTAL TASK (not "by hand" but via scripts)

•	In test - analysis - func (on GITHUB) open the SPM_GLM_exp_checkmateLo.m file. Change the fMRIPrepPath to the acyl fMRIPrepPath and change OutRoot to an output folder of your choice. 
•	Run the script. It will be creating the SPM.mat file and the beta files for each stimulus i.e. chess position (+ a beta file for each nuisance regressor) for each experimental run. These will be 	located in your selected output folder - GLM - sub-XX - exp
•	Open the MVPAMAYscript in test - analysis - CosmoMVPA (GitHub) and change DataDir to folder in which your SPM.mat file you just created is located in. If working on Mac, make sure you add a / to 	the end of location
•	Select your ROI directory, i.e. the location where you have stored your created ROIs masks. 	
•	IN ROIs, select which ROIs you want to include in analysis
•	Under subjects fill in which sub numbers you are including in analysis
•	As output you will obtain three excel files. The first depicts a matrix on how well lda can classify between checkmate and non-checkmate on average per fold for each pairwise condition. It also 	provides some additional information like  amount of voxels included in the analysis (data_size) and also how well the classifier was at distinguishing between checkmate and non-checkmate stimuli.
	The second Excel document depicts a matrix which shows the average distance between each pairwise compared conditions, using the ldc function which calculates the cross-validated distance along 	the linear discriminant (this is equivalent to the cross-validated mahalanobis distance.) The third excel file is the same but with the value rescaled to be between 0 and 1. 
•	The script also permits you to make a heat map of the matrices.  -->