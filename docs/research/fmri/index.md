# Functional MRI

Welcome to the landing page for all things related to functional MRI (fMRI) in our lab. Whether you're a new student, a researcher, or someone interested in learning more about fMRI, you'll find everything you need here—from getting started with your work environment to data analysis.

<div class="grid cards" markdown>

- :octicons-rocket-24:{ .lg .middle } __First steps__

    ---

    Everything you need to know before you start scanning, including MRI booking, invoicing, training and ethical approval.

    [:octicons-arrow-right-24: Get started](fmri-get-started.md)

- :octicons-checklist-24:{ .lg .middle } __Scanning Procedure__

    ---

    Detailed guidelines for preparing and conducting fMRI scans, including participants registration, equipment setup, and scan procedures.

    [:octicons-arrow-right-24: View procedures](fmri-procedure.md)

- :octicons-tools-24:{ .lg .middle } __Data Analysis__

    ---

    The step-by-step workflow we use to pre-process and analyze fMRI data.

    [:octicons-arrow-right-24: Start analyzing](analysis/index.md)

- :simple-github:{ .lg .middle } __fMRI Task__

    ---

    You need to code your fMRI task and you don't know where to start? Check out this fMRI task template from the Hoplab Github repositories.

    [:octicons-arrow-right-24: See the repo](https://github.com/HOPLAB-LBP/fMRI-task-template)

</div>

## Quick Links to Resources

Here are some helpful links to external resources for fMRI data analysis, tools, and tutorials:

- [SPM online documentation - fMRI tutorials](https://www.fil.ion.ucl.ac.uk/spm/docs/tutorials/fmri/)
- [fMRI Prep and Analysis with Andrew Jahn](https://www.youtube.com/@AndrewJahn)
- [Nilearn](https://nilearn.github.io/) for neuroimaging in Python
- [SPM Programming Introduction](https://en.wikibooks.org/wiki/SPM/Programming_intro)
- [SPM Scripts on GitHub](https://github.com/rordenlab/spmScripts?tab=readme-ov-file)

---

<!--
__TODO__: [ANDREA] Add a new page or section on Python-based fMRI analysis using nilearn and nibabel. Cover: (1) performing GLM with nilearn, (2) extracting signal from ROIs, (3) importing and using masks, (4) plotting results with nilearn and surfplot (https://surfplot.readthedocs.io/). Also mention neuromaps (https://netneurolab.github.io/neuromaps/) for converting between MNI/fsaverage spaces and surface-volume transformations.
__TODO__: [ANDREA] Add a "Resources" section listing where to find standard brain atlases and templates. Include: the TemplateFlow repository, the OSF atlas collection (https://osf.io/4mw3a/), neuromaps, and commonly used atlases in the lab (e.g., Glasser, Schaefer, Harvard-Oxford).
__TODO__: [ANDREA] Add documentation on surface-space analysis: (1) what FreeSurfer output geometries are (pial, white, inflated, sphere), (2) how to extract signal in surface space, (3) how to perform surface-based group analysis, and (4) how to create publication-quality surface plots.
__TODO__: [Klara] Add practical scanning info to the procedure page or a new sub-page: correct screen and projector positioning for visual experiments at MR8, and document that card access to the MR suite is valid for 1 year and needs annual renewal.
__TODO__: [Klara] Add a page or section on retinotopic mapping: what it is, when it is needed, the protocol used in the lab, and links to analysis tools (e.g., pRF mapping with mrVista or neuropythy).
-->
