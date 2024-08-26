# Setting Up Your fMRI Analysis Environment

Welcome to the fMRI analysis environment setup guide. This walkthrough will help you install and configure all necessary tools for our fMRI analysis workflow across Windows, macOS, and Linux platforms.

## Table of Contents

1. [System Requirements](#system-requirements)
2. [Folder Structure](#folder-structure)
3. [Installing Core Tools](#installing-core-tools)
    - [Docker](#docker-desktop)
    - [dcm2niix](#dcm2niix)
    - [Python and Conda](#python-and-conda)
    - [MATLAB](#matlab)
    - [SPM](#spm)
4. [Installing Additional Tools](#installing-additional-tools)
    - [FreeSurfer](#freesurfer)
    - [ANTs](#ants)
    - [CoSMoMVPA](#cosmomvpa)
5. [Troubleshooting](#troubleshooting)

## System Requirements

!!! info "Suggested System Specifications"
    - **Operating System:** Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
    - **RAM:** 16GB (32GB+ recommended)
    - **Storage:** 200GB+ free space (SSD preferred)
    - **CPU:** Multi-core processor (4+ cores)
    - **GPU:** NVIDIA GPU with CUDA support (optional, but beneficial)

## Folder Structure

Our lab uses a specific folder structure for fMRI projects. Here's an overview:

```
Project_Name/
├── sourcedata/
│   └── sub-xx/
│       ├── dicom/
│       ├── dicom_anon/
│       ├── dicom_converted/
│       ├── bh/
│       └── et/
├── BIDS/
│   ├── derivatives/
│   │   ├── deepmreye/
│   │   ├── fastsurfer/
│   │   ├── fmriprep/
│   │   ├── fmriprep-spm/
│   │   ├── fmriprep-spm-cosmomvpa/
│   │   ├── mriqc/
│   │   └── rois/
│   └── sub-xx/
│       ├── anat/
│       └── func/
├── code/
│   ├── misc/
│   └── utils/
└── temp/
    ├── temp_fmriprep/
    ├── temp_spm/
    ├── temp_deepmreye/
    └── temp_mriqc/
```


- `sourcedata/`: Contains raw data for each subject
- `BIDS/`: Organized according to BIDS specification
- `derivatives/`: Stores processed data
- `code/`: Contains analysis scripts and utilities
- `temp/`: Temporary directories for various processing steps

!!! tip "Create the folder structure"

    To create this folder structure, you can use the following bash script:

    ``` bash linenums="1"
    #!/bin/bash

    # Create main project directory
    mkdir -p Project_Name

    # Create subdirectories
    cd Project_Name
    mkdir -p sourcedata
    mkdir -p BIDS/derivatives/{fastsurfer,fmriprep,fmriprep-spm,fmriprep-spm-cosmomvpa}
    mkdir -p code/{misc,utils}
    mkdir -p temp/{temp_fmriprep,temp_spm,temp_deepmreye,temp_mriqc}

    echo "Folder structure created successfully!"
    ```

    Save this script as `create_fmri_structure.sh` and run it using:

    ```bash
    bash create_fmri_structure.sh
    ```

## Installing Core Tools

### Docker Desktop

Docker is crucial for running containerized applications like fMRIPrep. Althoug Docker can be installed as a command-line tool, we strongly advise installing the GUI version (Docker Desktop).
    
For up-to-date installation info, please consult the Docker Desktop installation pages for [Mac](https://docs.docker.com/desktop/install/mac-install/), [Windows](https://docs.docker.com/desktop/install/windows-install/) or [Linux](https://docs.docker.com/desktop/install/linux-install/).

After installation, configure Docker resources:

1. Open Docker Desktop settings
2. Go to "Resources" section
3. Allocate resources:
    - CPUs: Set to total CPUs - 2 (e.g., if you have 8 cores, set to 6)
    - Memory: Set to 80% of total RAM (e.g., if you have 32GB, set to 25GB)
    - Disk image size: Set to a reasonable amount (e.g., 100GB)
4. In the "File sharing" or "Resources > File sharing" section, add your project folder (e.g., `~/fMRI_Projects`)

#### Installing Docker Tools

We use several tools via Docker for our fMRI analysis pipeline. Docker installations are strongly encouraged over "bare metal" setups for several reasons:

1. Docker containers come bundled with all necessary dependencies, ensuring compatibility across different systems.
2. They provide a consistent environment, reducing "it works on my machine" issues.
3. Docker simplifies the installation process and manages complex software interactions.

Many of these tools are [BIDS-apps](https://bids-apps.neuroimaging.io/apps/), which are container images designed to work with BIDS-formatted datasets. BIDS (Brain Imaging Data Structure) is a standard for organizing and describing neuroimaging datasets. BIDS Apps have consistent command-line arguments, making them easy to run and integrate into automated platforms.

!!! important
    Before running any BIDS-app, ensure your input folder is correctly structured according to BIDS standards. Validate your BIDS dataset using the [BIDS Validator](https://bids-standard.github.io/bids-validator/) to avoid potential issues.

For detailed installation and usage instructions, please refer to each tool's respective documentation. For examples of how to run these tools using Docker, refer to the usage notes in their respective documentation or check our [fMRI workflow example](fmri-andrea-workflow.md) in this same folder. 

Below are the basic Docker pull commands for the main tools we use:

##### [fMRIPrep](https://fmriprep.org/en/stable/)

```bash
python -m pip install fmriprep-docker
```

##### [MRIQC](https://mriqc.readthedocs.io/en/latest/)

```bash
docker pull nipreps/mriqc:latest
```

##### [FastSurfer](https://github.com/Deep-MI/FastSurfer)

```bash
docker pull deepmi/fastsurfer:latest
```

##### [DeepMReye](https://github.com/DeepMReye/DeepMReye)

```bash
docker pull deepmreye/deepmreye
```
### dcm2niix

[dcm2niix](https://www.nitrc.org/plugins/mwiki/index.php/dcm2nii:MainPage) is a powerful tool used for DICOM to NIfTI conversion. It can be used as a command-line tool or through a Graphical User Interface (GUI) when shipped with [MRIcroGL](https://www.nitrc.org/projects/mricrogl/) (see [this](https://www.nitrc.org/plugins/mwiki/index.php/dcm2nii:MainPage#Graphical_interface) for more information).

There are several ways to install dcm2niix, depending on your operating system and preferences:

=== "Windows"

    1. **Download pre-compiled executable:**
       ```powershell
       curl -fLO https://github.com/rordenlab/dcm2niix/releases/latest/download/dcm2niix_win.zip
       ```       
       Unzip the file and add the executable to your system PATH:
       ```powershell
       $env:Path += ";C:\path\to\dcm2niix"
       ```
       Replace `C:\path\to\dcm2niix` with the actual path where you unzipped dcm2niix.

    2. **Install with Conda:**
       ```powershell
       conda install -c conda-forge dcm2niix
       ```

    3. **Install with pip:**
       ```powershell
       python -m pip install dcm2niix
       ```

    4. **Download MRIcroGL:**
       [Download MRIcroGL](https://github.com/rordenlab/MRIcroGL/releases) which includes dcm2niix with a GUI.

=== "macOS"

    1. **Download pre-compiled package:**
       ```bash
       curl -fLO https://github.com/rordenlab/dcm2niix/releases/latest/download/macos_dcm2niix.pkg
       ```
       Open the downloaded package to install.

    2. **Install with Homebrew:**
       ```bash
       brew install dcm2niix
       ```

    3. **Install with MacPorts:**
       ```bash
       sudo port install dcm2niix
       ```

    4. **Install with Conda:**
       ```bash
       conda install -c conda-forge dcm2niix
       ```

    5. **Install with pip:**
       ```bash
       python -m pip install dcm2niix
       ```

=== "Linux"

    1. **Download pre-compiled executable:**
       ```bash
       curl -fLO https://github.com/rordenlab/dcm2niix/releases/latest/download/dcm2niix_lnx.zip
       ```       
       Unzip the file and add the executable to your system PATH:
       ```bash
       echo 'export PATH=$PATH:/path/to/dcm2niix' >> ~/.bashrc
       source ~/.bashrc
       ```
       Replace `/path/to/dcm2niix` with the actual path where you unzipped dcm2niix.

    2. **Install on Debian-based systems:**
       ```bash
       sudo apt-get install dcm2niix
       ```

    3. **Install with Conda:**
       ```bash
       conda install -c conda-forge dcm2niix
       ```

    4. **Install with pip:**
       ```bash
       python -m pip install dcm2niix
       ```
       
    ??? warning "Older Linux versions compatibility"
        The pre-compiled Linux executable requires a recent version of Linux (e.g., Ubuntu 14.04 or later) with Glibc 2.19 (from 2014) or later. Users of older systems can compile their own copy of dcm2niix or download the compiled version included with MRIcroGL, which is compatible with Glibc 2.12 (from 2011).

### Python and Conda

We use Conda to manage our Python environment.

1. Install [Miniconda](https://docs.conda.io/en/latest/miniconda.html)
2. Create and activate the environment:
   ```bash
   conda create -n fmri_env python=3.9 spyder numpy scipy matplotlib nibabel nilearn scikit-learn
   ```
3. Activate the environment:
   ```bash
   conda activate fmri_env
   ```

!!! warning
    It's **crucial** to create a new conda environment for each new project you start. Installing new packages into the base conda environment it's a very bad practice that will eventually lead to a bloated, brittle environent with broken packages and compatibility issues. Uninstalling or re-installing Python on some machine can be a very painful (sometimes impossible) process!
    
#### Setting up Spyder IDE

1. Launch Spyder:
   ```bash
   conda activate fmri_env
   spyder
   ```
2. Create a new project:
    - Go to "Projects" > "New Project"
    - Choose "Existing directory"
    - Select your project folder (e.g., `~/fMRI_Projects/Project_Name`)
    - Name your project and click "Create"

### MATLAB

For MATLAB installation and licensing, please refer to the [Installing MATLAB](../../../get-started/computer-setup.md#installing-matlab) section in our computer setup guide.

Install the following MATLAB toolboxes:

#### SPM

SPM (Statistical Parametric Mapping) is used for GLM analysis.

1. Download [SPM12](https://www.fil.ion.ucl.ac.uk/spm/software/download/)
2. Unzip to a location of your choice
3. Add SPM to MATLAB path:
   ```matlab
   addpath('path/to/spm12')
   savepath
   ```

#### CoSMoMVPA

CoSMoMVPA is used for multivariate pattern analysis.

1. Download from the [official website](http://www.cosmomvpa.org/download.html)
2. Add to MATLAB path:
   ```matlab
   addpath(genpath('path/to/CoSMoMVPA'))
   savepath
   ```
   
#### MarsBaR

MarsBaR is a region of interest toolbox for SPM.

1. Download [MarsBaR](https://marsbar-toolbox.github.io/download.html)
2. Unzip to a location of your choice, such as `/home/myhome/marsbar-0.42/`
3. Copy the MarsBaR distribution into the SPM directory with:
   ```bash
   mkdir /usr/local/spm/spm8/toolbox/marsbar
   cp -r /home/myhome/marsbar-0.42/* /usr/local/spm/spm8/toolbox/marsbar
   ```
The next time you start spm you should be able to start the toolbox by selecting ‘marsbar’ from the toolbox button on the SPM interface.  

## Installing Additional Tools

These tools are not mandatory -- they can be installed if needed. 

### FreeSurfer

FreeSurfer is used for cortical surface reconstruction. The main surface reconstruction pipeline of FreeSurfer (`recon-all`) is bundled in the fmriprep docker image, and it is performed during the fmriprep anatomical workflow. This means that this tool is not strictly necessary, unless you plan on running additional surface processing steps (e.g., additional surface projections, such as the Glasser volumetric projection from fsaverage that is performed in the [fMRI workflow example](fmri-andrea-workflow.md#hcp-glasser-parcellation)

1. Download from the [official website](https://surfer.nmr.mgh.harvard.edu/fswiki/DownloadAndInstall)
2. Set up environment variables:
   ```bash
   export FREESURFER_HOME=/path/to/freesurfer
   source $FREESURFER_HOME/SetUpFreeSurfer.sh
   ```

### ANTs

ANTs is used for image registration and normalization. As for FreeSurfer, this tool is not strictly necessary, unless you want to generate the Glasser volumetric projection from fsaverage described [here](fmri-andrea-workflow.md#hcp-glasser-parcellation)

1. Download from [GitHub](https://github.com/ANTsX/ANTs/releases)
2. Add to system PATH:
   ```bash
   export ANTSPATH=/path/to/ANTs/bin
   export PATH=$ANTSPATH:$PATH
   ```

## Troubleshooting

!!! warning "Common Issues"
    - **Docker errors:** Check WSL2 configuration (Windows) or Docker service status (Linux)
    - **MATLAB/SPM issues:** Verify MATLAB is in system PATH and required toolboxes are installed
    - **FreeSurfer license:** Ensure license file is in the correct directory
    - **Python conflicts:** Use separate conda environments for different projects

For more specific issues, consult tool documentation or seek help on [NeuroStars](https://neurostars.org/).

Remember, setting up an fMRI analysis environment can be complex. Take your time, and don't hesitate to ask for help when needed. Good luck with your research!
