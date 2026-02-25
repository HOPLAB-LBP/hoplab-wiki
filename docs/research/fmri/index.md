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

!!! tip "Data Management"
    Make sure to follow the lab's [Research Data Management guidelines](../rdm/index.md) throughout your project. See the [temporary RDM guidelines](../rdm/current.md) for current recommended practices on data storage and organization.

## Quick Links to Resources

Here are some helpful links to external resources for fMRI data analysis, tools, and tutorials:

- [SPM online documentation - fMRI tutorials](https://www.fil.ion.ucl.ac.uk/spm/docs/tutorials/fmri/)
- [fMRI Prep and Analysis with Andrew Jahn](https://www.youtube.com/@AndrewJahn)
- [Nilearn](https://nilearn.github.io/) for neuroimaging in Python
- [SPM Programming Introduction](https://en.wikibooks.org/wiki/SPM/Programming_intro)
- [SPM Scripts on GitHub](https://github.com/rordenlab/spmScripts?tab=readme-ov-file)

---

<!--
__TODO__: [ANDREA] it would be nice to add some info on how to perform analysis and plotting using nilearn and nibabel (also see [neuromaps](https://netneurolab.github.io/neuromaps/index.html) for converting between spaces and surf<->volume, and [surfplot](https://surfplot.readthedocs.io/en/latest/index.html#) for surface plotting from volume/surf), as they are overall more flexible than current tools we use (e.g., handle both volumes and surfaces, can be used easily to perform GLM and extract signal from ROIs, easy to import masks, etc.)
__TODO__: [ANDREA] add info on where to find atlases and standard templates (e.g., https://osf.io/4mw3a/  https://netneurolab.github.io/neuromaps/index.html)
__TODO__: [ANDREA] it would be nice to have some info on surface space signal extraction, analysis and plotting + what are common FreeSurfer output geometries (pial, inflated, etc.)
__TODO__: [Klara] Add info on correct screen & projector position for scanning, and that card access is valid for 1y (?)
__TODO__: [Klara] Add retinotopic mapping info
-->
