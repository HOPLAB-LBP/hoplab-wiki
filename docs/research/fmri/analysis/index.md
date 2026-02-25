# fMRI Analysis Overview

This section of the wiki provides a comprehensive guide for analyzing fMRI data. Follow the steps below to ensure smooth data processing, from environment setup to advanced multi-variate pattern analysis (MVPA).

---

## Analysis steps overview

<div class="grid cards" markdown="1">

- :material-information: **[General Information](fmri-general.md)** <span class="chip chip--green">Complete</span>
  Overview of the pipeline, including key terminology and data structure. Start here to get a sense of the entire workflow.

- :material-rocket: **[Setting Up the Environment](fmri-setup-env.md)** <span class="chip chip--green">Complete</span>
  Install essential tools and software like Docker, fMRIPrep, and SPM to prepare your analysis environment.

- :material-database: **[Converting Data to BIDS](fmri-bids-conversion.md)** <span class="chip chip--green">Complete</span>
  Organize your raw data in the BIDS format for compatibility with neuroimaging tools. Includes step-by-step instructions for converting and validating your dataset.

- :material-chart-timeline-variant: **[Preprocessing & QA](fmri-prepocessing-qa.md)** <span class="chip chip--green">Complete</span>
  Perform quality control and preprocess your data using tools like fMRIPrep and MRIQC to ensure it's ready for statistical analysis.

- :material-calculator: **[First-Level Analysis](fmri-glm.md)** <span class="chip chip--green">Complete</span>
  Model brain activity using the General Linear Model (GLM) in SPM. Set up contrasts and extract statistical values.

- :material-brain: **[Regions of Interest (ROIs)](fmri-rois.md)** <span class="chip chip--green">Complete</span>
  Create and analyze regions of interest for targeted brain analysis. ROIs are crucial for advanced analyses like MVPA.

- :material-brain: **[Multi-Variate Pattern Analysis (MVPA)](fmri-mvpa.md)** <span class="chip chip--green">Complete</span>
  Decode complex neural patterns using machine learning methods like SVM. Analyze brain activity across different conditions.

- :material-format-list-checks: **[Complete Workflow Example](fmri-andrea-workflow.md)** <span class="chip chip--blue">In progress</span>
  An end-to-end guide that ties everything together, providing an example of a full fMRI analysis pipeline.

</div>

---

## Analysis Pipeline

``` mermaid
graph TD
    A[0. General Information] --> B[1. Set up Environment]
    B --> C[2. BIDS Conversion]
    C --> D[3. Preprocessing & QA]
    D --> E[4. First-level GLM]
    E --> F[5. Regions of Interest]
    F --> G[6. Multivariate Analysis]

    click A "fmri-general/"
    click B "fmri-setup-env/"
    click C "fmri-bids-conversion/"
    click D "fmri-prepocessing-qa/"
    click E "fmri-glm/"
    click F "fmri-rois/"
    click G "fmri-mvpa/"
```

---

### Additional Resources

- **[BIDS Starter Kit](https://bids-standard.github.io/bids-starter-kit/)**  
  Learn more about the BIDS format and how to structure your datasets.

- **[SPM Documentation](https://www.fil.ion.ucl.ac.uk/spm/doc/)**  
  Dive into SPM resources to get the most out of your GLM analyses.

- **[CoSMoMVPA Documentation](http://www.cosmomvpa.org/documentation.html)**  
  Explore multi-variate pattern analysis techniques with CoSMoMVPA.
