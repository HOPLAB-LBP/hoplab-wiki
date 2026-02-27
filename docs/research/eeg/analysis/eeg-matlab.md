# EEG analysis in MATLAB

This page provides a companion guide for analysing EEG data using **MATLAB** with [EEGLAB](https://eeglab.org/) for preprocessing and [CoSMoMVPA](https://www.cosmomvpa.org/) for multivariate analysis. For conceptual explanations and rationale behind each step, refer to the Python pages — this page focuses on the MATLAB-specific implementation.

!!! info "Lab recommendation"
    Our lab is transitioning to **Python/MNE** as the primary analysis platform. This MATLAB guide is maintained for backward compatibility and for users who prefer the MATLAB ecosystem. New users are encouraged to use the [Python workflow](eeg-setup-env.md).

The analysis code from [Chen et al. (2023)](https://direct.mit.edu/imag/article/doi/10.1162/imag_a_00006/116700) is available on the [OSF archive](https://osf.io/d5egu/) and provides a complete MATLAB-based pipeline for Representational Dynamics.

---

## Setup

### Install MATLAB toolboxes

For MATLAB installation and licensing, see the [computer setup guide](../../../get-started/computer-setup.md#installing-matlab).

Install the following toolboxes:

- **EEGLAB**: Download from [eeglab.org](https://eeglab.org/others/How_to_download_EEGLAB.html) and add to the MATLAB path:

    ```matlab
    addpath('path/to/eeglab');
    eeglab;  % Initialises EEGLAB and adds subfolders to path
    ```

- **CoSMoMVPA**: Download from the [official website](https://www.cosmomvpa.org/download.html) and add to the path:

    ```matlab
    addpath(genpath('path/to/CoSMoMVPA'));
    cosmo_check_installation();  % Verify installation
    ```

- **FieldTrip** (optional, for statistics): Download from [fieldtriptoolbox.org](https://www.fieldtriptoolbox.org/download/) and add to the path:

    ```matlab
    addpath('path/to/fieldtrip');
    ft_defaults;
    ```

!!! warning "Path conflicts"
    EEGLAB, FieldTrip, and SPM all include functions with the same name. Only add one toolbox at a time to avoid conflicts, or use `rmpath` to remove competing toolboxes before switching.

---

## Preprocessing with EEGLAB

EEGLAB provides both a GUI and command-line interface for preprocessing. Below is a typical command-line workflow:

```matlab
% Load BioSemi .bdf file
EEG = pop_biosig('sub-01_task-main.bdf');

% Set channel locations (BioSemi 128-channel layout)
EEG = pop_chanedit(EEG, 'lookup', 'standard-10-5-cap385.elp');

% Band-pass filter: 0.1 – 100 Hz
EEG = pop_eegfiltnew(EEG, 'locutoff', 0.1, 'hicutoff', 100);

% Notch filter at 50 Hz
EEG = pop_eegfiltnew(EEG, 'locutoff', 49, 'hicutoff', 51, 'revfilt', 1);

% Re-reference to average
EEG = pop_reref(EEG, []);

% Run ICA
EEG = pop_runica(EEG, 'icatype', 'runica', 'extended', 1);

% Use ICLabel to automatically classify components
EEG = pop_iclabel(EEG, 'default');
EEG = pop_icflag(EEG, [NaN NaN; 0.8 1; 0.8 1; NaN NaN; NaN NaN; NaN NaN; NaN NaN]);
% This flags eye and muscle components with > 80% probability

% Remove flagged components
EEG = pop_subcomp(EEG, find(EEG.reject.gcompreject), 0);

% Epoch: -200 to 800 ms around events
EEG = pop_epoch(EEG, {'1', '2', '3'}, [-0.2, 0.8]);

% Baseline correction (-200 to 0 ms)
EEG = pop_rmbase(EEG, [-200, 0]);

% Reject epochs with amplitude > 150 µV
EEG = pop_eegthresh(EEG, 1, 1:EEG.nbchan, -150, 150, ...
                     EEG.xmin, EEG.xmax, 0, 1);

% Save
pop_saveset(EEG, 'filename', 'sub-01_task-main_clean.set');
```

For detailed preprocessing guidance, see the [EEGLAB wiki](https://eeglab.org/tutorials/).

---

## Multivariate analysis with CoSMoMVPA

CoSMoMVPA uses a dataset structure where each row is a sample (epoch) with features (channels x time points) and targets (condition labels).

### Convert EEGLAB data to CoSMoMVPA format

```matlab
% Load preprocessed EEGLAB data
EEG = pop_loadset('sub-01_task-main_clean.set');

% Convert to CoSMoMVPA dataset
% Each time point becomes a separate dataset (for time-resolved analysis)
ds = cosmo_meeg_dataset(EEG);

% Set condition labels (targets) and chunk labels (for cross-validation)
ds.sa.targets = EEG.epoch(:).eventtype;  % Adjust to your event coding
ds.sa.chunks  = (1:numel(ds.sa.targets))';  % Simple leave-one-out scheme
```

### Time-resolved decoding

```matlab
% Define the measure: cross-validated classification accuracy
measure = @cosmo_crossvalidation_measure;
measure_args = struct();
measure_args.classifier = @cosmo_classify_lda;  % LDA classifier
measure_args.partitions = cosmo_nfold_partitioner(ds);

% Run time-resolved decoding using the searchlight-over-time approach
nbrhood = cosmo_interval_neighborhood(ds, 'time', 'radius', 0);

results = cosmo_searchlight(ds, nbrhood, measure, measure_args);
```

### Pairwise decoding

For Representational Dynamics, decode every pair of conditions:

```matlab
conditions = unique(ds.sa.targets);
n_conds = numel(conditions);
pairs = nchoosek(1:n_conds, 2);

for p = 1:size(pairs, 1)
    c1 = conditions(pairs(p, 1));
    c2 = conditions(pairs(p, 2));

    % Select epochs for this pair
    mask = ds.sa.targets == c1 | ds.sa.targets == c2;
    ds_pair = cosmo_slice(ds, mask);

    % Run decoding
    results_pair = cosmo_searchlight(ds_pair, nbrhood, measure, measure_args);
end
```

### RSA with CoSMoMVPA

```matlab
% Define model RDM (upper triangle, vectorised)
model_rdm = [1, 0, 1, 0, 1, 1];  % Example: adjust to your hypothesis

% Set up RSA measure
measure = @cosmo_target_dsm_corr_measure;
measure_args = struct();
measure_args.target_dsm = model_rdm;
measure_args.type = 'Spearman';

% Run RSA over time
results_rsa = cosmo_searchlight(ds, nbrhood, measure, measure_args);
```

For a complete worked example, see the [OSF archive](https://osf.io/d5egu/) from Chen et al. (2023).

---

## Statistical testing

### Cluster-based permutation tests with CoSMoMVPA

```matlab
% Stack group data: one dataset per subject
ds_group = cosmo_stack({ds_sub01, ds_sub02, ...});

% Set up cluster neighbourhood (temporal adjacency)
cl_nbrhood = cosmo_cluster_neighborhood(ds_group, 'time', true);

% Run cluster-based permutation test against chance
opt = struct();
opt.niter = 10000;       % Number of permutations
opt.h0_mean = 1 / n_conds;  % Chance level
opt.cluster_stat = 'tfce';  % Threshold-Free Cluster Enhancement

results_stat = cosmo_montecarlo_cluster_stat(ds_group, cl_nbrhood, opt);
```

### Using FieldTrip for statistics

Alternatively, convert your data to FieldTrip format and use `ft_timelockstatistics`:

```matlab
% Convert to FieldTrip structure
cfg = [];
cfg.method      = 'montecarlo';
cfg.statistic   = 'ft_statfun_depsamplesT';
cfg.correctm    = 'cluster';
cfg.numrandomization = 10000;
cfg.tail        = 1;  % One-tailed
cfg.clustertail = 1;
cfg.alpha       = 0.05;
cfg.clusteralpha = 0.05;

stat = ft_timelockstatistics(cfg, data_all{:});
```

---

## References

- [CoSMoMVPA documentation](https://www.cosmomvpa.org/documentation.html)
- [CoSMoMVPA EEG tutorial](https://www.cosmomvpa.org/contents_demo.html#eeg-time-lock)
- [EEGLAB wiki and tutorials](https://eeglab.org/tutorials/)
- [FieldTrip statistics tutorial](https://www.fieldtriptoolbox.org/tutorial/cluster_permutation_timelock/)
- [OSF archive — Chen et al. (2023)](https://osf.io/d5egu/)
