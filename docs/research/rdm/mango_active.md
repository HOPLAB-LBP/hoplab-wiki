# ManGO for active research data

In Hoplab, we expect you to save active research data on [ManGO](https://mango.kuleuven.be/). After logging in with your KU Leuven credentials, every researcher should have access to a personal folder within the `Hoplab project`. In your personal folder, you can then create a subfolder per (active) study. If this is not the case, contact [Klara](https://www.kuleuven.be/wieiswie/nl/person/00116473) to create a new folder and set the correct permissions. Check out the [research workflows page](SOPs.md) for more specific guidelines on how to manage your study data depending on the used research modality. 

General documentation on ManGO can be found [here](https://rdm-docs.icts.kuleuven.be/mango/index.html). This page will focus on the setup and use of Python to interact with ManGO and is mainly based on the instructions on [this page](https://rdm-docs.icts.kuleuven.be/mango/clients/python_client.html). Note that there exist other clients to connect to ManGO (e.g., the ManGO portal in the browser, iron CLI Client, iCommands and several SFTP clients), which we won't cover here but you are of course welcome to explore.

## Installing and setting up the Python-iRODSClient (PRC)

Using a virtual environment keeps things clean and avoids breaking other Python setups. To do so, open a terminal in your project folder and activate it. To avoid issues with KU Leuven policy restrictions, we use Conda for this. If you don't have Conda installed, download and install it from [Conda's official website](https://www.anaconda.com/docs/getting-started/miniconda/main).

```python
conda create -n mango_env 
conda activate mango_env
```
You should see (mango_env) in your terminal. Now, we can install the Python-iRODSClient and check the installation:

```python
pip install python-irodsclient
pip show python-irodsclient
```

Next, we have to make sure you are logged in to ManGO and your irods_environment.json is configured correctly. The Python client needs an environment file that tells it which server to connect to, your username, SSL settings and authentification method. To do so, we have to install the required authentication package:

```python   
pip install mango_auth
```

Then, go to the "How to connect" page in [the ManGO portal]((https://mango.kuleuven.be/)) to get your irods_user_name, irods_zone_name and irods_host information. Execute the command below with your own information in your terminal:

```python
mango_auth <irods_user_name> <irods_zone_name> <irods_host>
```

    !!! Tip
        To authenticate in a Python shell or within a script file, run the following snippet:

            ```python
            from mango_auth import iinit
            iinit("user_name", "zone_name", "host")

            env_file = os.path.expanduser('~/.irods/irods_environment.json')
            with iRODSSession(irods_env_file=env_file) as session:
            (...)
            ```
            

You will be redirected to your terminal, where you have to click the displayed authentication link. After successful login, an environment file is created at `~/.irods/irods_environment.json`. You now have a connection with the default password duration of 60 hours. However, it is also possible to log in with a password of long duration (7 days) if you have a Linux client environment with iCommands installed (see [this page](https://rdm-docs.icts.kuleuven.be/mango/clients/icommands.html)). 

## Creating a ManGO session and uploading files to iRODS (Python)

This section contains a script to create a ManGO (iRODS) session using your environment file and upload files from a local directory to an iRODS collection. It supports both single files and full folders (including subfolders) and recreates the folder structure in iRODS. Optionally, it also sets read permissions.

Before you start, make sure that:

- You have access to your personal folder on ManGO (do a quick check via the browser)
- You installed the Python-iRODSClient (see [previous section](#installing-and-setting-up-the-python-irodsclient-prc))
- You are logged in and your irods_environment.json is configured correctly (see [previous section](#installing-and-setting-up-the-python-irodsclient-prc))
- Your data is in BIDS format

Before running the script, make sure to change the following variables:

- `local_path` to your local folder containing the data
- `collection_path` to the ManGO/iRODS destination folder

    !!! warning "Common errors"
        - If you get an error related to `irods_environment.json`, check that all values (especially `irods_authentication_uid`) are correct and make sure numeric values are integers. 
        - If the environment file is not found, verify that you are logged in and that the file exists at `~/.irods/irods_environment.json`.


    !!! warning "Important"
        - The name of the local folder itself is not uploaded, only its contents. If you want to preserver the folder name, include it in the `collection_path`.
        - The destination collection can already exist. If it does not exist, the script will create it automatically. 


```python title="mango_upload.py"
import os
import ssl
from pathlib import Path
from irods.session import iRODSSession
from irods.access import iRODSAccess

### STEP 1: Locate the iRODS environment file

try:
    env_file = os.environ['IRODS_ENVIRONMENT_FILE']
except KeyError:
    env_file = os.path.expanduser('~/.irods/irods_environment.json')

if not os.path.exists(env_file):
    print(f"ERROR: iRODS environment file not found at: {env_file}")
else:
    print(f"Using iRODS environment file: {env_file}")

ssl_context = ssl.create_default_context(purpose=ssl.Purpose.SERVER_AUTH)
ssl_settings = {'ssl_context': ssl_context}

### STEP 2: Set your paths

# Local folder or file to upload
local_path = Path(r"C:\Path\To\Your\BIDS_Folder")

# Destination iRODS collection
collection_path = "/ghum/home/Hoplab/YourName/YourStudy"

if not local_path.exists():
    print(f"ERROR: Local path does not exist: {local_path}")
else:
    print(f"Local path found: {local_path}")

### STEP 3: Create iRODS session and upload folder

if local_path.exists() and os.path.exists(env_file):

    with iRODSSession(irods_env_file=env_file, **ssl_settings) as session:

        # Ensure collection exists
        try:
            session.collections.get(collection_path)
            print(f"Collection exists: {collection_path}")
        except Exception:
            print(f"Creating collection: {collection_path}")
            session.collections.create(collection_path, recurse=True)

        # Upload directory contents
        if local_path.is_dir():

            for file_path in local_path.rglob('*'):
                if file_path.is_file():
                    # Create the relative path structure
                    relative_path = file_path.relative_to(local_path)
                    irods_file_path = f"{collection_path}/{relative_path.as_posix()}"
        
                    # Create parent collections if needed
                    parent_collection = "/".join(irods_file_path.split("/")[:-1])
                    try:
                        session.collections.get(parent_collection)
                    except Exception:
                        session.collections.create(parent_collection, recurse=True)

                    try:
                        session.data_objects.put(str(file_path), irods_file_path)
                        print(f"Uploaded: {file_path.name}")
                    except Exception as e:
                        print(f"Error uploading {file_path.name}: {e}")

        # Upload single file
        else:
            session.data_objects.put(str(local_path), collection_path)
            print(f"Uploaded: {local_path.name}")

        print(f"\nFinished processing {local_path}")

        # Optional: set permissions on the collection (adjust user details and permission type)
        try:
            access = iRODSAccess("read", collection_path, "USERNAME")
            session.acls.set(access, recursive = True)
            print(f"Set read permissions for USERNAME on {collection_path}")
        except Exception as e:
            print(f"Note: Could not set permissions: {e}")

else:
    print("Cannot proceed: check that both local_path and iRODS environment file exist.")
```

## Downloading files from iRODS (Python)

This section contains a script to download a complete iRODS collection to your computer. It supports both single files and full folders (including subfolders). It allows for parallel downloads in case of large datasets.

It will:

- Connect using your irods_environment.json (see [this section](#installing-and-setting-up-the-python-irodsclient-prc))
- Download all files in the chosen ManGO folder (recursively, so it also handles all subfolders)
- Recreate the same folder structure locally
- Skip files that already exist to prevent accidental overwrite

Before running the script, make sure to change the following variables:

- `IRODS_COLLECTION` = path to the ManGO folder you want to download from
- `LOCAL_DEST` = your local folder you want to download to
- `THREADS` = set the number of parallel downloads (4-8 is usually safe)

    !!! warning "Common errors"
        - If you get an error related to `irods_environment.json`, check that all values (especially `irods_authentication_uid`) are correct and make sure numeric values are integers. 
        - If the environment file is not found, verify that you are logged in and that the file exists at `~/.irods/irods_environment.json`.

    !!! warning "Important"
        - The name of the local folder itself is not downloaded, only its contents. If you want to preserver the folder name, include it in the `LOCAL_DEST`.
        - The destination collection can already exist. If it does not exist, the script will create it automatically. 

```python title="mango_download.py"
"""
Download a full ManGO (iRODS) folder to your computer using parallel downloads.

WHAT THIS SCRIPT DOES
- connects to ManGO using your irods_environment.json
- downloads all files in the specified collection
- recreates the same folder structure locally
- skips files that already exist with the same size
- uses multiple threads to download several files at once
"""

import os
import ssl
from pathlib import Path
from irods.session import iRODSSession
from concurrent.futures import ThreadPoolExecutor

# -------------------------
# STEP 1 — CONFIG
# -------------------------

# ManGO folder you want to download FROM
IRODS_COLLECTION = "/ghum/home/Hoplab/YourName/YourStudy"

# Local folder you want to download TO
LOCAL_DEST = Path(r"C:\Path\To\Your\BIDS_Folder")

# Set number of parallel downloads (4–8 is usually safe)
THREADS = 4

# -------------------------
# STEP 2 — FIND YOUR IRODS LOGIN FILE
# -------------------------

env_file = os.environ.get(
    "IRODS_ENVIRONMENT_FILE",
    os.path.expanduser("~/.irods/irods_environment.json")
)

if not os.path.exists(env_file):
    raise RuntimeError(f"irods_environment.json not found: {env_file}")

# -------------------------
# STEP 3 — FUNCTION TO GATHER FILES
# -------------------------

def gather_files(session, collection, local_folder, tasks):
    """
    Recursively collect all files in the collection and subcollections.
    """
    local_folder.mkdir(parents=True, exist_ok=True)

    for obj in collection.data_objects:
        local_file = local_folder / obj.name
        tasks.append((obj, local_file))

    for sub in collection.subcollections:
        sub_local = local_folder / sub.name
        gather_files(session, session.collections.get(sub.path), sub_local, tasks)

# -------------------------
# STEP 4 — FUNCTION TO DOWNLOAD ONE FILE
# -------------------------

def download_one(session, obj, target):
    """
    Download a single file if it doesn't exist or is incomplete.
    """
    target.parent.mkdir(parents=True, exist_ok=True)

    if target.exists() and target.stat().st_size == obj.size:
        return f"OK already exists: {target}"

    try:
        session.data_objects.get(obj.path, str(target))
        return f"Downloaded: {obj.name}"
    except Exception as e:
        return f"Error downloading {obj.name}: {e}"

# -------------------------
# STEP 5 — CONNECT AND START
# -------------------------

ssl_context = ssl.create_default_context()

with iRODSSession(irods_env_file=env_file, ssl_context=ssl_context) as session:

    root = session.collections.get(IRODS_COLLECTION)

    # Gather all tasks first
    tasks = []
    gather_files(session, root, LOCAL_DEST, tasks)

    # Print total files found
    print(f"Total files found: {len(tasks)}")
    print(f"Starting download with {THREADS} threads...\n")

    # Download in parallel
    with ThreadPoolExecutor(max_workers=THREADS) as pool:
        futures = [pool.submit(download_one, session, obj, tgt) for obj, tgt in tasks]
        for f in futures:
            print(f.result())

print("\nFinished download.")
```

## Monitoring a folder with ManGO Ingest

ManGO Ingest watches a local folder and uploads its contents to a ManGO collection. After triggering it, it automatically detects new or modified files and uploads only (part of) those changes. 

This is useful when you regularly add or update files locally (for example, during ongoing data collection) and want them pushed efficiently to ManGO. 

ManGO Ingest can:

- run once and upload everthing currently present, or
- continuously monitor the folder and upload new files automatically 

Uploads are **one-way only**: changes made in ManGO are not pulled down locally.

We'll guide you through the setup, but if you want more information, here are a few useful resources:

- [ManGO Ingest README](https://github.com/kuleuven/mango-ingest/blob/development/README.md )
- [Github issue for setting up in Windows](https://github.com/kuleuven/mango-ingest/issues/14)
- [Documentation on the Python-iRODSClient](https://rdm-docs.icts.kuleuven.be/mango/clients/python_client.html )

### How to use ManGO Ingest

1. Download the [mango-ingest development branch](https://github.com/kuleuven/mango-ingest/tree/development) and unzip it into: `C:\Workdir\MyApps`

2. Open a command prompt and navigate

```
cd C:\Workdir\MyApps\mango-ingest-development
```

3. Create an activate a virtual environment

```
python -m venv venv
venv\Scripts\activate
```

4. Install mango-ingest and check packages

```
venv\Scripts\python -m pip install -e mango-ingest-development
venv\Scripts\python -m pip list
```

5. If you haven't yet, install the Python-iRODSClient (PRC) and authentication tools, and log in to iRODS

```
pip install python-irodsclient
pip install mango_auth
mango_auth <your_username> ghum ghum.irods.icts.kuleuven.be
```

6. Start ingest for a local folder

```
venv\Scripts\python -m mango_ingest -d /ghum/home/Hoplab/[collection]/[sub-collection] -p "path_to_data_to_upload" -nw -r --verify-checksum
```

### Command options explained 

#### Core paths

`-d`
Destination collection path in ManGO.

`-p`
Local folder path to upload and monitor.

#### Upload behaviour

`-nw`
Run once only.
Uploads current files and exits.
If omitted, the folder stays monitored for future changes and new files will be uploaded automatically as they appear.

`-r`
Upload folders recursively, including all subfolders and files.

`--sync`
Useful when starting ingest for the first time.
Ensures the existing folder contents are uploaded.
(Automatically implied when using `-nw`.)

#### File integrity and recovery

`--verify-checksum`
Recommended for large datasets.
After transfer, ManGO verifies that the uploaded file matches the original.
This protects against silent corruption during transfer.

`--restart <logfile.json>`
Retries failed uploads from a previous run using its JSON log file.

#### File selection (optional filtering)

Upload only matching files:

```
--glob "*.edf"  # for EEG files only
```

or

```
--regex PATTERN
```

Ignore specific files:

```
--ignore-glob "*.tmp" # to ignore temporary files
```

or

```
--ignore PATTERN
```

### Remarks & practical tips

- Deleting files locally does **not** remove them from ManGO.
- Empty folders cannot be uploaded.
- Removing the monitored folder (or unplugging the drive) while ingest runs will cause errors.
- Re-running mango-ingest with the same local path only uploads new or modified files/folders.
- A `.json` log file is created for every sync. This file records upload status and errors and can be used for restart.
- ManGO Ingest can also automatically attach metadata:
    - `--md-mtime` → add file modification time
    - `--md-path REGEX` → extract metadata from folder names

For advanced metadata examples, see [`doc/examples/extract_metadata.py`](https://github.com/kuleuven/mango-ingest/blob/development/doc/examples/extract_metadata.py).

### Quick rule of thumb

Use:

```
-nw -r --verify-checksum
```

when you want a **safe one-time upload of a full dataset**.

Omit `-nw` when you want **continuous automatic syncing** during ongoing data collection.
