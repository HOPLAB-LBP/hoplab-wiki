# KU Leuven HPC: Getting Started

This guide describes how to connect to the KU Leuven/VSC HPC cluster, manage your data, and run `fMRIPrep`.

---

!!! warning "Login Node"  
    When you connect via SSH, you land on a *login node*. Do *not* run compute-intensive tasks here. Submit jobs to *compute* or *GPU* nodes via SLURM.

!!! tip "Change directory after login"  
    Due to the small quota on the login node (see section 3 below), it`s recommended to always change the working directory after login:

    ```bash
    cd $VSC_DATA
    ```

    This ensures you work in a directory with persistent memory (your files are not deleted) and sufficient disk space.

---

## 1. Prerequisites

1. You have a valid VSC account (e.g., `vsc12345`). Request one [here](https://vlaams-supercomputing-centrum-vscdocumentation.readthedocs-hosted.com/en/latest/index.html).
2. You have set up SSH keys in your VSC account.
3. You have installed PuTTY and WinSCP (Windows) or SSH (Mac/Linux).
4. You have logged into the [HPC firewall](https://firewall.vscentrum.be/auth/login) before attempting SSH.

---

## 2. Connecting to the Cluster

Once your account is active and your SSH keys are configured, you can connect to the login node. Always log in through the VSC firewall before attempting a connection.

=== "Windows (PuTTY + WinSCP)"

      1. **Allow Firewall:**  
         Go to [https://firewall.vscentrum.be/auth/login](https://firewall.vscentrum.be/auth/login) and log in using your VSC credentials.

      2. **Open PuTTY:**
         - Host Name: `login.hpc.kuleuven.be`
         - (Optional) Go to `Connection → SSH → Auth` and load your **private key**.
         - Click **Open**.

      3. **Login via SSH:**
         When prompted, type:
         ```
         ssh -A vsc12345@login.hpc.kuleuven.be
         ```
         Replace `vsc12345` with your own VSC username.

=== "macOS / Linux"

      1. **Allow Firewall:**  
         Go to [https://firewall.vscentrum.be/auth/login](https://firewall.vscentrum.be/auth/login) and log in.

      2. **Open Terminal**

      3. **Login via SSH:**
         ```
         ssh -A vsc12345@login.hpc.kuleuven.be
         ```
         Replace `vsc12345` with your actual VSC username.

After login, you will see something like:

![VSC Login](../../assets/fmri-hpc-login.png)

Look at the last line:

```bash
✔ [Apr/15 15:13] vsc12345@tier2-p-login-1 ~ $ 
```

which suggests we are connected to the login node `tier2-p-login-1` as `vsc12345` (your VSC username). From now on, what we type in the terminal will be executed on the login node.

To exit the ssh session and go back to your local terminal, type `exit`.

---

## 3. Data Management on the HPC

**Folder Structure:**

- `HOME`: Small quota, do *not* store big data here.
- `VSC_DATA`: Persistent, large capacity. Store big data, installed packages (e.g., Miniforge/Miniconda), and your project files.
- `VSC_SCRATCH`: Temporary storage. Files here will be deleted regularly. Do not store your project data here!

A typical approach is to keep a dedicated subdirectory in `VSC_DATA` for each project. For example:

```bash
VSC_DATA                    # Persistent storage
├── data                    # Project data
│   ├── BIDS                # BIDS dataset
│   │   ├── derivatives     # Derivatives
│   │   └── sub-01          # Subject data
│   │       ├── anat  
│   │       └── func  
│   ├── license.txt         # FreeSurfer license file  
│   └── sourcedata          # Raw data
│       └── DICOM           
│           └── sub-01      
└── fmriprep-25.0.0.sif     # Singularity container
```

---

## 4. Transferring Data

Once connected to the cluster, you’ll need to transfer your BIDS dataset, FreeSurfer license, and other relevant files to your `VSC_DATA` directory on the HPC system.

=== "Windows (WinSCP)"

    1. [**Login**](https://firewall.vscentrum.be/auth/login) through the firewall.

    2. **Open WinSCP:**
        - Host Name: `login.hpc.kuleuven.be`
        - User Name: `vsc12345`
        - Load your private key if needed.

    3. **Transfer Files:**
        - Navigate to `/data/leuven/123/vsc12345/data/` on the remote side.
        - Drag and drop or copy/paste files from your local machine.
        - To avoid overwriting existing files, make sure to only add new content, or configure WinSCP to skip duplicates.

=== "Linux / macOS"

    1. [**Login**](https://firewall.vscentrum.be/auth/login) through the firewall.

    2a. Basic `scp` (secure copy):
    ```bash
    scp -r /local/path/BIDS \
    vsc12345@login.hpc.kuleuven.be:/data/leuven/123/vsc12345/data/BIDS
    ```

    - `-r` copies directories recursively.


    2b. Merging folders with `rsync` (recommended):

    Use `rsync` to avoid overwriting existing files:

    ```bash
    rsync -av --ignore-existing /local/path/BIDS \
    vsc12345@login.hpc.kuleuven.be:/data/leuven/123/vsc12345/data/
    ```

    - `-a` preserves file attributes.
    - `-v` enables verbose output.
    - `--ignore-existing` skips files already present on the remote server.

Make sure you replace `/local/path/BIDS` with your local BIDS folder, and `vsc12345` and `123` with your actual VSC username and the first 3 digits of your ID.

---

## 5. Building an `fMRIPrep` Singularity Container

1. **Move to `VSC_DATA`:**
   ```
   cd $VSC_DATA
   ```
2. **Build the Container:**
   ```
   singularity build fmriprep-25.0.0.sif docker://nipreps/fmriprep:25.0.0
   ```
This fetches the Docker image and converts it to a Singularity `.sif` image.

!!! warning
    Ensure you have enough quota and that you are not attempting this in `HOME`!

---

## 6. Submitting and Running an `fMRIPrep` Job with SLURM

### 6.1. Creating a SLURM Script

To submit our job to the compute node, we will need to create a SLURM script. this script will define  the job's resources, dependencies, and other settings, and then submit it to the cluster using the `sbatch` command.It is basically a wrapper around the real singularity fmriprep command that we need to run.

To create such file, type in your ssh session:

```bash
cd $VSC_DATA
nano run_fmriprep_job.slurm
```

This will open a text editor. Paste the following content into the file:

```
#!/bin/bash -l
#SBATCH --job-name=fmriprep_sub-42
#SBATCH --time=08:00:00
#SBATCH --ntasks=1
#SBATCH --cpus-per-task=32
#SBATCH --mem=50G
#SBATCH --output=slurm-%j.out
#SBATCH --error=slurm-%j.err
#SBATCH --mail-type=END,FAIL
#SBATCH --mail-user=your.email@kuleuven.be
#SBATCH --account=intro_vsc12345
#SBATCH --partition=batch
#SBATCH --cluster=genius

# Move to the data directory
cd $VSC_DATA/data

# Run fMRIPrep with Singularity
singularity run --cleanenv \
  -B $VSC_DATA/data/BIDS:/data:ro \
  -B $VSC_DATA/data/BIDS/derivatives:/out \
  -B $VSC_SCRATCH/fmriprep_tmp:/scratch \
  -B $VSC_DATA/data/license.txt:/opt/freesurfer/license.txt \
  $VSC_DATA/fmriprep-25.0.0.sif \
  /data /out/fmriprep participant \
  --participant-label 42 \
  --skip-bids-validation \
  --output-spaces MNI152NLin2009cAsym:res-2 fsaverage \
  --work-dir /scratch \
  --bold2anat-dof 9 \
  --nthreads 32 --omp-nthreads 32 \
  --mem-mb 50000 \
  --clean-workdir
```

then press `CTRL+X` to exit and `Y` to save. Check whether your file was saved correctly:

```bash
ls $VSC_DATA
```

which should return:

```
fmriprep-25.0.0.sif  data  license.txt  run_fmriprep_job.slurm
```

### 6.2 Submitting the Job

1. Navigate to the same directory as your script (or specify the full path):

    ```bash
    cd $VSC_DATA
    ```

2. Submit:

    ```bash
    sbatch run_fmriprep_job.slurm
    ```

    A message appears:

    ```bash
    Submitted batch job 58070026
    ```

   *where `58070026` is your job ID.*

4. Check the status of your job:

    ```bash
    squeue -j 58070026
    ```

    Which returns:

    ```bash
    JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
    58070026 batch     fmriprep vsc12345  R       0:00      1 (Priority)
    ```

Congrats! Your job is now being executed on the cluster.

### 6.3 SLURM Basics you will need

- `sbatch`: Submits a job script to the cluster.
- `squeue`: Shows your jobs.
- `scancel`: Cancels a job.
- `sstat`: Real-time CPU/memory info on running jobs.
- `sacct`: Shows CPU time, wall time, memory usage, and exit codes for *finished* jobs.

---

## 7. Monitoring Your Job

### 7.1 Job Queue

Check the status of your running or pending jobs:

```bash
squeue -M genius,wice -u $USER
```

which returns:

```bash
$ squeue -M genius,wice -u $USER
CLUSTER: genius
             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
          58070026     batch fmriprep vsc12345  R    2:25:57      1 r27i27n19

CLUSTER: wice
             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
```

- `R` means running, `PD` means pending.  
- `NODELIST` shows the node(s) assigned. If it shows `(Priority)`, you`re still waiting.

### 7.2 Checking Logs

When you submit a SLURM job, two log files are automatically generated in the directory where you ran `sbatch`:

- `slurm-<jobid>.out`: captures **standard output (stdout)** — the regular printed output from your script.
- `slurm-<jobid>.err`: captures **standard error (stderr)** — any warnings or errors encountered during the job.

#### Check Available Files

To see the files in your current directory:

```bash
ls
```

You should see something like:

```
fmriprep-25.0.0.sif  data  run_fmriprep_job.slurm  slurm-58070026.out  slurm-58070026.err
```

#### Open and Read Logs

To open the full output log (static view):

```bash
nano slurm-58070026.out
```

To close `nano`, press `Ctrl+X` → then `N` if prompted to save changes.

To view just the last few lines of the file:

```bash
tail -n 30 slurm-58070026.out
```

This prints the last 30 lines of the file — useful to check progress without opening the full log.

To **continuously monitor** the last lines in real time (refreshes every 1 second):

```bash
watch -n 1 tail -n 30 slurm-58070026.out
```

This will auto-refresh every second and is very helpful to track live progress.

To exit the `watch` session Press `Ctrl+Z`.

## 8 Canceling a Job

If you want to stop a running or pending job:

```bash
scancel 58070026
```

Or:

```bash
scancel --user=$USER
```

---

## 9. Advanced: Monitoring Resource Usage

Sometimes you want to inspect your job in real-time to check whether it is using the resources (CPU, memory) you requested.

### 9.1 Identify the Compute Node

First, determine which compute node your job is running on by checking the job queue:

```bash
squeue -M genius,wice -u $USER
```

Example output:

```
CLUSTER: genius
             JOBID PARTITION     NAME     USER ST       TIME  NODES NODELIST(REASON)
          58070026     batch fmriprep vsc12345  R      40:46      1 r27i27n19
```

Look at the **NODELIST** column — in this case, your job is running on node `'r27i27n19'`.

If NODELIST shows `(Priority)`, it means your job is still waiting in the queue and hasn't started yet.

### 9.2: SSH into the Compute Node

To access the compute node where your job is running:

```bash
ssh r27i27n19
```

You should see a message like:

```
Joining job 58070026
```

Also, the prompt will change from the login node (e.g., `'tier2-p-login-2'`) to the compute node (e.g., `'r27i27n19'`), indicating you are now inside the job environment on the actual node.

---

### 9.3: Run 'htop' to Monitor Resource Usage

Once inside the compute node, run:

```bash
htop -u $USER
```

This opens a live system monitor that shows:

- All processes currently running under your username
- CPU usage per core
- Memory usage
- Process names and resource consumption

You should see multiple processes associated with `fmriprep`. Ideally, if you requested 32 cores, you should see all 32 cores utilized — especially during parallelizable tasks. However, some parts of `fmriprep` can only run serially. During these phases, only 1–2 cores may be active, which is normal.

To exit `htop`, press **F10** or **q**

---

## 12. References and Links

- [VSC Documentation](https://vlaams-supercomputing-centrum-vscdocumentation.readthedocs-hosted.com/en/latest/index.html)  
- [KU Leuven HPC Info](https://icts.kuleuven.be/sc/onderzoeksgegevens/hpc)  
- [Firewall Access](https://firewall.vscentrum.be/auth/login)  
- [SSH Key Setup (PuTTYgen)](https://docs.vscentrum.be/access/generating_keys_with_putty.html#create-a-public-private-key-pair)  
- [SSH Access via PuTTY](https://docs.vscentrum.be/access/text_mode_access_using_putty.html)  
- [Singularity Docs](https://docs.sylabs.io/)  
- [fMRIPrep Docs](https://fmriprep.org/en/stable/)  

**Happy Computing!**
