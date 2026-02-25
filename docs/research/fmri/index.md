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

## Brain Atlases and Templates

Standard brain atlases are essential for defining ROIs, reporting results, and comparing across studies. Below are commonly used resources:

### Atlas repositories

| Resource | Description | Link |
|----------|-------------|------|
| **TemplateFlow** | Centralised repository of brain templates and atlases in standardised spaces (MNI, fsaverage, etc.). Used by fMRIPrep. | [templateflow.org](https://www.templateflow.org/) |
| **OSF Atlas Collection** | Curated collection of brain atlases and parcellations hosted on OSF. | [osf.io/4mw3a](https://osf.io/4mw3a/) |
| **neuromaps** | Python toolbox for mapping, transforming, and comparing brain annotations across MNI, fsaverage, and other coordinate systems. | [neuromaps docs](https://netneurolab.github.io/neuromaps/) |

### Commonly used atlases in the lab

| Atlas | Type | Description |
|-------|------|-------------|
| **Glasser (HCP-MMP1)** | Multi-modal parcellation | 360-region cortical parcellation from the Human Connectome Project. Based on architecture, function, connectivity, and topography. |
| **Schaefer** | Functional parcellation | Data-driven parcellations available in 100–1000 region versions. Aligned to the Yeo 7/17 network parcellation. |
| **Harvard-Oxford** | Probabilistic anatomical | Probabilistic atlas based on manual segmentation. Available in cortical and subcortical versions. Distributed with FSL. |

!!! tip "Which atlas to choose?"
    The choice of atlas depends on your research question. For ROI-based analyses, **Glasser** and **Schaefer** provide finer-grained and more functionally meaningful parcellations. For reporting peak coordinates and comparing with older literature, **Harvard-Oxford** remains a common choice. See the [ROIs page](analysis/fmri-rois.md) for how to create and use ROIs from these atlases.

## Python Tools for fMRI

While the lab's primary analysis pipeline uses MATLAB and SPM, Python offers powerful complementary tools. Python-specific examples are included in the relevant analysis pages:

- **GLM and results visualisation**: [nilearn](https://nilearn.github.io/) for running GLMs and plotting brain maps — see the [GLM page](analysis/fmri-glm.md)
- **ROI extraction**: nilearn's maskers for extracting signal from ROIs — see the [ROIs page](analysis/fmri-rois.md)
- **File handling**: [nibabel](https://nipy.org/nibabel/) for loading, manipulating, and saving NIfTI files
- **Surface plots**: nilearn surface plotting (with plotly engine) for interactive and publication-quality visualisations — see the [GLM page](analysis/fmri-glm.md)
- **Cross-space transformations**: [neuromaps](https://netneurolab.github.io/neuromaps/) for converting between MNI and fsaverage spaces

---

<!--
__TODO__: [Klara] Add practical scanning info to the procedure page or a new sub-page: correct screen and projector positioning for visual experiments at MR8, and document that card access to the MR suite is valid for 1 year and needs annual renewal.
__TODO__: [Klara] Add a page or section on retinotopic mapping: what it is, when it is needed, the protocol used in the lab, and links to analysis tools (e.g., pRF mapping with mrVista or neuropythy).
-->
