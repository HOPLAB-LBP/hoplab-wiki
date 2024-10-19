# Setting Up Your fMRI Analysis Environment

Welcome to the fMRI analysis environment setup guide. This walkthrough will help you install and configure all necessary tools for our fMRI analysis workflow across Windows, macOS, and Linux platforms.

!!! info "Suggested System Specifications"
    - **Operating System:** Windows 10/11, macOS 10.14+, or Linux (Ubuntu 18.04+)
    - **RAM:** 16GB (32GB+ recommended)
    - **Storage:** 200GB+ free space (SSD preferred)
    - **CPU:** Multi-core processor (4+ cores)
    - **GPU:** NVIDIA GPU with CUDA support (optional, but beneficial)

## Folder Structure

Our lab uses a specific folder structure for fMRI projects. Here's an overview:

```bash
Project_Name/
├── sourcedata/
│   └── sub-xx/
│       ├── dicom/
│       ├── dicom_anon/
│       ├── bh/
│       ├── et/
│       └── nifti/
├── BIDS/
│   ├── derivatives/
│   │   ├── deepmreye/
│   │   ├── fastsurfer/
│   │   ├── fmriprep/
│   │   ├── fmriprep-mriqc/
│   │   ├── fmriprep-spm/
│   │   ├── fmriprep-spm-cosmomvpa/
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

    ``` bash title="create_fmri_structure.sh" linenums="1"
    # Create main project directory
    mkdir -p Project_Name

    # Navigate to the project directory
    cd Project_Name

    # Create sourcedata structure
    mkdir -p sourcedata/sub-xx/{dicom,dicom_anon,nifti,bh,et}

    # Create BIDS structure
    mkdir -p BIDS/sub-xx/{anat,func}
    mkdir -p BIDS/derivatives/{deepmreye,fastsurfer,fmriprep,fmriprep-spm,fmriprep-spm-cosmomvpa,fmriprep-mriqc,rois}

    # Create code structure
    mkdir -p code/{misc,utils}

    # Create temp structure
    mkdir -p temp/{temp_fmriprep,temp_spm,temp_deepmreye,temp_mriqc}

    echo "Folder structure created successfully!"
    ```

    Save this script as `create_fmri_structure.sh` and run it using:

    ```bash
    bash create_fmri_structure.sh
    ```

---

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

- **fMRIprep**:

    [fMRIPrep](https://fmriprep.org/en/stable/) is a tool for minimal pre-processing of structural and anatomical MRI images.

    To get the Docker image:

    ```bash
    python -m pip install fmriprep-docker
    ```

- **MRIQC**:

    [MRIQC](https://mriqc.readthedocs.io/en/latest/) is a tool to perform Quality Check on your raw and pre-processed MRI images.

    To get the Docker image:

    ```bash
    docker pull nipreps/mriqc:latest
    ```

- **FastSurfer**:

    [FastSurfer](https://github.com/Deep-MI/FastSurfer) is a self-contained, faster (it uses the NVIDIA GPU processing) alternative to FreeSurfer. It can save quite some time when performing surface processing pipelines (e.g., `recon-all`).

    To get the Docker image:

    ```bash
    docker pull deepmi/fastsurfer:latest
    ```

    !!! note
        FastSurfer can save you time if you have a **[CUDA-compatible GPU](https://developer.nvidia.com/cuda-gpus)**. In short, this means that your machine should have a dedicated NVIDIA GPU with CUDA installed. You can check whether CUDA is correctly installed on you machine by typing `nvidia-smi` on your terminal. If this command does not return a list of active GPUs, you either need to install and configure CUDA, or you can avoid installing this tool and rely on the `recon-all` pipeline performed with the anatomical workflow of fMRIPrep.

- **DeepMReye**:

    [DeepMReye](https://github.com/DeepMReye/DeepMReye) is a tool to perform eye-tracking data analysis when you have no eye-tracking data. It estimates eye-movements from the eyes position in your functional images. This will of course results in a (very) much lower temporal resolution than real eye-tracking data, but we found results to be good enough for some experimental paradigms.

    To get the Docker image:

    ```bash
    docker pull deepmreye/deepmreye
    ```

---

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

---

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

---

### MATLAB

For MATLAB installation and licensing, please refer to the [Installing MATLAB](../../../get-started/computer-setup.md#installing-matlab) section in our computer setup guide.

Install the following MATLAB toolboxes:

- **SPM**:

    SPM (Statistical Parametric Mapping) is used for GLM analysis.

    1. Download [SPM12](https://www.fil.ion.ucl.ac.uk/spm/software/download/)
    2. Unzip to a location of your choice
    3. Add SPM to MATLAB path:

    ```matlab
    addpath('path/to/spm12')
    savepath
    ```

    !!! warning "Mac installtion"
        For mac users, potential installation issues can be tackled with the [instructions for mac](https://en.wikibooks.org/wiki/SPM/Installation_on_64bit_Mac_OS_(Intel)) on the SPM wiki. Make sure **Xcode** is installed on your computer before installing SPM.

- **CoSMoMVPA**

    CoSMoMVPA is used for multivariate pattern analysis.

    1. Download from the [official website](http://www.cosmomvpa.org/download.html)
    2. Add to MATLAB path:

    ```matlab
    addpath(genpath('path/to/CoSMoMVPA'))
    savepath
    ```

- **MarsBaR**:

    MarsBaR is a region of interest toolbox for SPM.

    1. Download [MarsBaR](https://marsbar-toolbox.github.io/download.html)
    2. Unzip to a location of your choice, such as `/home/myhome/marsbar-0.42/`
    3. Copy the MarsBaR distribution into the SPM directory with:

        ```bash
        mkdir /path-to-spm/toolbox/marsbar
        cp -r /home/myhome/marsbar-0.42/* /path-to-spm/toolbox/marsbar
        ```

    Change `/path-to-spm/` with your SPM path (e.g., `/usr/local/spm/spm12/`).

    The next time you start spm you should be able to start the toolbox by selecting ‘marsbar’ from the toolbox button on the SPM interface.  

---

## Installing Additional Tools

These tools are not mandatory -- they can be installed if needed.

### FreeSurfer

FreeSurfer is used for cortical surface reconstruction. The main surface reconstruction pipeline of FreeSurfer (`recon-all`) is bundled in the fmriprep docker image, and it is performed during the fmriprep anatomical workflow. This means that this tool is not strictly necessary, unless you plan on running additional surface processing steps (e.g., additional surface projections, such as the Glasser volumetric projection from fsaverage that is performed in the [fMRI workflow example](fmri-andrea-workflow.md#hcp-glasser-parcellation).

To install:

1. Download from the [official website](https://surfer.nmr.mgh.harvard.edu/fswiki/DownloadAndInstall)
2. Set up environment variables:

   ```bash
   export FREESURFER_HOME=/path/to/freesurfer
   source $FREESURFER_HOME/SetUpFreeSurfer.sh
   ```

??? warning "FreeSurfer on Windows"
    FreeSurfer is not natively compatible with Windows. To use FreeSurfer on a Windows system, you have a few options:

    1. Use Windows Subsystem for Linux (WSL):
        - Install WSL 2 on your Windows machine
        - Install a Linux distribution like Ubuntu through WSL
        - Install FreeSurfer within the Linux environment
    
    2. Use a virtual machine:
        - Install virtualization software like VirtualBox or VMware
        - Set up a Linux virtual machine 
        - Install FreeSurfer in the Linux VM
    
    3. Use a Docker container:
        - Install Docker Desktop for Windows
        - Pull and run a FreeSurfer Docker image
    
    4. Remote access:
        - Use a remote Linux server or cluster with FreeSurfer installed
        - Connect via SSH or remote desktop

    The WSL or Docker options are generally recommended as they have less overhead than a full VM. Whichever method you choose, ensure you have adequate disk space and RAM allocated for FreeSurfer to run efficiently.
    
---

### ANTs

ANTs is used for image registration and normalization. As for FreeSurfer, this tool is not strictly necessary, unless you want to generate the Glasser volumetric projection from fsaverage described [here](fmri-andrea-workflow.md#hcp-glasser-parcellation)

1. Download from [GitHub](https://github.com/ANTsX/ANTs/releases)
2. Add to system PATH:

   ```bash
   export ANTSPATH=/path/to/ANTs/bin
   export PATH=$ANTSPATH:$PATH
   ```

---

## Common Issues

??? failure "Docker: WSL2 Configuration Errors on Windows"
    **Problem**: Docker fails to start or displays errors related to WSL2.

    **Solution**: Ensure WSL2 is properly installed and configured. Open Docker Desktop settings and verify that WSL2 is selected as the backend. Restart Docker Desktop after making changes. If issues persist, run the following command in PowerShell:
    ```powershell
    wsl --update
    ```

??? failure "Docker: Service Issues on Linux"
    **Problem**: Docker service fails to start or stops unexpectedly on Linux systems.

    **Solution**: Restart the Docker service and check the logs for more details:
    ```bash
    sudo systemctl restart docker
    sudo journalctl -u docker.service
    ```
    Ensure Docker is set to start on boot using:
    ```bash
    sudo systemctl enable docker
    ```

??? failure "MATLAB: Not Recognized in PATH"
    **Problem**: MATLAB is not found in the system PATH, leading to command not found errors.

    **Solution**: Add the MATLAB installation directory to your system PATH. For a temporary fix, run:
    ```bash
    export PATH=$PATH:/path/to/matlab/bin
    ```
    To make this change permanent, add the above line to your `~/.bashrc` or `~/.zshrc` file and restart the terminal.

??? failure "SPM: Missing Toolboxes"
    **Problem**: Errors occur due to missing SPM toolboxes in MATLAB.

    **Solution**: Ensure the required toolboxes (e.g., SPM, CoSMoMVPA, MarsBaR) are installed and added to the MATLAB path. Use the following in MATLAB:
    ```matlab
    addpath('path/to/spm12')
    savepath
    ```

??? failure "FreeSurfer: License Not Found"
    **Problem**: FreeSurfer cannot locate the `license.txt` file, leading to startup errors.

    **Solution**: Place the `license.txt` file in the FreeSurfer home directory and set the path correctly:
    ```bash
    export FS_LICENSE=/path/to/license.txt
    ```
    Add this line to your `~/.bashrc` or `~/.zshrc` file to ensure the license path is set on each terminal start.

??? failure "Python: Package Conflicts"
    **Problem**: Conflicting package versions cause Python environments to break.

    **Solution**: Create a new conda environment for each project to avoid conflicts. Use:
    ```bash
    conda create -n new_env python=3.9
    conda activate new_env
    ```
    For existing environments, try resolving conflicts by specifying package versions during installation:
    ```bash
    conda install package_name=version
    ```

??? failure "FreeSurfer: Incompatible with Native Windows"
    **Problem**: FreeSurfer is not compatible with Windows and cannot be installed directly.

    **Solution**: Use one of these methods:
    - **WSL2**: Install WSL2 and a Linux distribution like Ubuntu, then install FreeSurfer in this environment.
    - **Virtual Machine**: Use VirtualBox or VMware to set up a Linux virtual machine, then install FreeSurfer.
    - **Docker**: Install Docker Desktop for Windows and run a FreeSurfer Docker image for compatibility.

For more specific issues, consult tool documentation or seek help on [NeuroStars](https://neurostars.org/).

Remember, setting up an fMRI analysis environment can be complex. Take your time, and don't hesitate to ask for help when needed. Good luck with your research!

---

Now you’re ready to proceed **convert your data into BIDS format**. See the next guide for instructions on setting up your BIDS folder. [--> BIDS conversion](fmri-bids-conversion.md)
