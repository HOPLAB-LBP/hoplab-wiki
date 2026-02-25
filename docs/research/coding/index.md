# Coding practices

Welcome to the Coding Practices section! Here, you'll find essential guidance for organizing projects, writing clean code, setting up your environment, and collaborating using version control.

<div class="grid cards" markdown="1">
- :material-wrench-clock: **[Good coding practices](#best-practices-for-organizing-code-and-projects)**
  How we structure projects, name files, and write maintainable research code.

- :octicons-desktop-download-24: **[Environment & editor setup](environment-setup.md)**
  Set up Conda environments, configure Spyder, and learn to debug effectively.

- :material-source-branch: **[Version control with Git](version-control.md)**
  Integrate Git and GitHub into your workflow for tracking changes and collaboration.

</div>

## Why coding practices matter

When you code for your research project, remember that you're not just coding for yourself today—you're coding for:

- **Your future self**: Six months from now, you might not remember the specifics of your current project.
- **Other scientists**: Your code might be used or reviewed by researchers with varying coding skills and backgrounds. Writing clean and well-documented code ensures that your work can be understood and built upon by others.

Keeping your code tidy, easy to understand, and maintainable is crucial for effective research collaboration and aligns with the principles of **Open Science**.

!!! info "Recommended resources"
    Make sure to explore our suggested [Coding tutorials](../../get-started/student-starter-pack.md#coding-tutorials). We especially recommend **[The good research code handbook](https://goodresearch.dev/)**, which provides valuable insights into writing robust research code. Key sections include [Writing decoupled code](https://goodresearch.dev/decoupled) and [Keeping things tidy](https://goodresearch.dev/tidy).

!!! tip
    If you're new to coding and many of the terms on this page seem unfamiliar, start by exploring some of the essential tools you'll use. Check out tutorials on Python, Git, and the Unix Shell on the [Student starter pack](../../get-started/student-starter-pack.md) page.

!!! question "What if I code in MATLAB?"
    While the information in this page focuses on Python, the principles of writing clean, maintainable code are universal. Debugging, structuring code, and organizing projects apply just as much to MATLAB as they do to Python. Be sure to apply these practices regardless of the language you're using!

## Special note for fMRI projects

If you're working on fMRI projects, you'll find specific information on setting up your environment in the [Set-up your environment](../fmri/analysis/fmri-setup-env.md) page of the fMRI section. This guide includes additional tips for managing data and code in neuroimaging research.

## Best practices for organizing code and projects

A well-structured project helps in maintaining readability and collaboration. Here are some recommendations:

### 1. Folder structure

Use a logical structure for your project files:

 ```bash
 my_project/
 ├── data/              # Raw data files
 ├── modules/           # Scripts to store your classes and functions
 ├── results/           # Output results and figures
 ├── environment.yml    # Conda environment file
 └── README.md          # Project overview
 ```

### 2. Naming conventions

- **Files**: Use lowercase letters with underscores (e.g., `data_processing.py`).
- **Folders**: Use meaningful names that reflect their contents.
- **Variables**: Use descriptive names (e.g., `participant_id` instead of `id`).

### 3. General coding tips

!!! tip
    Write modular code by breaking down tasks into functions and classes. This approach enhances reusability and readability.

- **Avoid "[spaghetti code](https://goodresearch.dev/decoupled.html?highlight=spaghetti#code-smells-and-spaghetti-code)"**: Keep functions short and focused.
- **Use Docstrings** to document functions and classes:

    ```python
    def load_data(file_path):
        """
        Loads data from a specified file path.

        Args:
            file_path (str): The path to the data file.

        Returns:
            pandas.DataFrame: Loaded data as a DataFrame.
        """
    ```

- **Follow PEP 8**: Use tools like `black` to ensure code style compliance.

### 4. Saving results

Organizing your results properly is crucial for reproducibility, collaboration, and long-term maintainability of your research code. This section covers how to structure your results folders, save scripts and logs, and use utility functions to streamline these processes.

To keep your project organized, we've provided a **set of utility functions** that automate common tasks like setting random seeds, creating unique output directories, saving scripts, and configuring logging. These functions should be defined in a separate file called `utils.py` located in the `modules/` directory of your project.

??? example "Utility functions in modules/utils.py"

    The following functions are defined in `modules/utils.py` (see the box below for the definitions):

    - **`set_random_seeds(seed=42)`**: Sets random seeds for reproducibility.
    - **`create_run_id()`**: Generates a unique identifier based on the current date and time.
    - **`create_output_directory(directory_path)`**: Creates a directory for saving results.
    - **`save_script_to_file(output_directory)`**: Saves the executing script to the output directory.
    - **`setup_logger(log_file_path, level=logging.INFO)`**: Configures logging to log both to the console and a file.

    ``` py title="modules/utils.py"  linenums="1"
    # ./modules/utils.py
    import logging
    import os
    import shutil
    import random
    import torch
    import numpy as np
    import inspect
    from datetime import datetime

    def set_random_seeds(seed=42):
        """
        Set the random seed for reproducibility in PyTorch, NumPy, and Python's random module.

        This function sets the seed for random number generation in PyTorch, NumPy, and Python's built-in random module.
        It also configures PyTorch to use deterministic algorithms and disables the benchmark mode for convolutional layers
        when CUDA is available, to ensure reproducibility.

        :param seed: The random seed. Defaults to 42.
        :type seed: int
        """
        torch.manual_seed(seed)
        np.random.seed(seed)
        random.seed(seed)
        torch.set_default_dtype(torch.float32)
        if torch.cuda.is_available():
            torch.cuda.manual_seed_all(seed)
            torch.backends.cudnn.deterministic = True
            torch.backends.cudnn.benchmark = False

    def create_run_id():
        """
        Generate a unique run identifier based on the current date and time.

        This function creates a string representing the current date and time in the format 'YYYYMMDD-HHMMSS'.
        It can be used to create unique identifiers for different runs or experiments.

        :returns: A string representing the current date and time.
        :rtype: str
        """
        now = datetime.now()
        return now.strftime("%Y%m%d-%H%M%S")

    def create_output_directory(directory_path):
        """
        Creates an output directory at the specified path.

        This function attempts to create a directory at the given path.
        It logs the process, indicating whether the directory creation was successful or if any error occurred.
        If the directory already exists, it will not be created again, and this will also be logged.

        :param directory_path: The path where the output directory will be created.
        :type directory_path: str
        """
        try:
            logging.info(f"Attempting to create output directory at: {directory_path}")
            if not os.path.exists(directory_path):
                os.makedirs(directory_path)
                logging.info("Output directory created successfully.")
            else:
                logging.info("Output directory already exists.")
        except Exception as e:
            logging.error(f"An error occurred while creating the output directory: {e}", exc_info=True)

    def save_script_to_file(output_directory):
        """
        Saves the script file that is calling this function to the specified output directory.

        This function automatically detects the script file that is executing this function
        and creates a copy of it in the output directory.
        It logs the process, indicating whether the saving was successful or if any error occurred.

        :param output_directory: The directory where the script file will be saved.
        :type output_directory: str
        """
        try:
            # Get the frame of the caller to this function
            caller_frame = inspect.stack()[1]
            # Get the file name of the script that called this function
            script_file = caller_frame.filename

            # Construct the output file paths
            script_file_out = os.path.join(output_directory, os.path.basename(script_file))

            logging.info(f"Attempting to save the script file to: {script_file_out}")

            # Copy the script and additional files to the output directory
            shutil.copy(script_file, script_file_out)

            logging.info("Script files saved successfully.")
        except Exception as e:
            logging.error(f"An error occurred while saving the script file: {e}", exc_info=True)

    def setup_logger(log_file_path=None, level=logging.INFO):
        """
        Set up a logger with both console and file handlers.

        :param log_file_path: The path for the log file. If None, only console logging is enabled.
        :type log_file_path: str, optional
        :param level: Logging level (e.g., logging.INFO, logging.DEBUG).
        :type level: int
        :return: Configured logger.
        :rtype: logging.Logger
        """
        # Create a logger
        logger = logging.getLogger(__name__)
        logger.setLevel(level)

        # Create a formatter for logs
        formatter = logging.Formatter("%(asctime)s - %(levelname)s - %(message)s")

        # Create a stream handler (for console output)
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        logger.addHandler(stream_handler)

        # If a log file path is provided, add a file handler
        if log_file_path:
            file_handler = logging.FileHandler(log_file_path)
            file_handler.setFormatter(formatter)
            logger.addHandler(file_handler)

        # Prevent adding duplicate handlers
        logger.propagate = False

        return logger
    ```

??? example "Using the utility functions in a script"
    To use the functions defined in `utils.py`, import them in your script and follow the example below. This will ensure reproducibility and proper organization of your experimental results.

    ``` py title="main.py"  linenums="1"
    import os
    from modules.utils import (
        set_random_seeds,
        create_run_id,
        create_output_directory,
        save_script_to_file,
        setup_logger
    )

    # Set random seeds for reproducibility
    set_random_seeds(42)

    # Define parameters for the run
    results_dir = "./results"
    dataset_dir = "./datasets"
    epochs = 20
    learning_rate = 1e-5
    batch_size = 64 * (2**3)

    prob_a = 0.2
    prob_b = 0.2
    prob_test = 0.6
    temperature_model_a = 0.1
    temperature_model_b = 5

    # Create a unique run ID and results directory
    run_id = f"{create_run_id()}_train-pair-temp-ws-softmax_proba-{prob_a}_probb-{prob_b}_probtest-{prob_test}_tempa-{temperature_model_a}_tempb-{temperature_model_b}_lr-{learning_rate}"
    results_dir = os.path.join(results_dir, run_id)
    create_output_directory(results_dir)

    # Save the current script to the results directory for reproducibility
    save_script_to_file(results_dir)

    # Set up logging to log both to the console and a file
    log_file_path = os.path.join(results_dir, "log_output.txt")
    logger = setup_logger(log_file_path)
    logger.info(f"Results will be saved in: {results_dir}")
    logger.info("Run ID: %s", run_id)
    logger.info(f"Starting the experiment with the following parameters:")
    logger.info(f"Learning Rate: {learning_rate}, Epochs: {epochs}, Batch Size: {batch_size}")

    # ... Your training or analysis code here ...
    ```
!!! example "Example results folder structure"
    After running the script, your results might be structured as follows:

    ```
    results/
    ├── 20241018-153045_train-pair-temp-ws-softmax_proba-0.2_probb-0.2_probtest-0.6_tempa-0.1_tempb-5_lr-1e-5/
    │   ├── log_output.txt        # Logs of the run
    │   ├── main_script.py        # Copy of the script that generated the results
    │   ├── output_data.csv       # Output data generated by the run
    │   └── model_weights.pth     # Saved model weights
    ```
!!! question "Why create a `results` folder for each run?"
    - **Reproducibility**: Ensures that each set of results corresponds to a specific code version and parameters.
    - **Comparison**: Makes it easier to compare results between different runs with varying parameters.
    - **Organization**: Keeps your project clean by preventing files from different experiments from mixing together.

With these functions, you can ensure a well-organized, reproducible workflow, making it easier to manage long-term research projects and collaborate with others.

!!! info "Next steps"
    Ready to set up your development environment? Head to the [Environment & editor setup](environment-setup.md) page to configure Conda and Spyder for your projects.
