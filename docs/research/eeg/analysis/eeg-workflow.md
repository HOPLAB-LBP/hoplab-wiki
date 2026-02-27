# EEG workflow example

This page ties together the entire EEG analysis pipeline into a single end-to-end example. It follows the Python/MNE workflow described in the previous pages and processes one participant from raw data to group-level statistics.

For a MATLAB version of this workflow, see the [OSF archive](https://osf.io/d5egu/) from Chen et al. (2023).

---

## Overview

```
Raw .bdf file
    │
    ├── Quality control (triggers, electrodes)
    │
    ├── Preprocessing (filter → re-reference → ICA → epoch → baseline → reject)
    │
    ├── Multivariate analysis (time-resolved decoding, RSA)
    │
    └── Statistical testing (cluster-based permutation tests)
```

---

## Step 1: Set up the environment

```python
# Create and activate a fresh conda environment
# conda create -n eeg_env python=3.11
# conda activate eeg_env
# pip install mne mne-bids autoreject scikit-learn rsatoolbox matplotlib pandas numpy scipy

import mne
import numpy as np
from pathlib import Path
```

See [:octicons-arrow-right-24: Environment setup](eeg-setup-env.md) for full instructions.

---

## Step 2: Define paths and parameters

```python
# Project paths
project_dir = Path('Project_Name')
raw_dir = project_dir / 'sourcedata'
derivatives_dir = project_dir / 'BIDS' / 'derivatives'

# Analysis parameters
subjects = ['sub-01', 'sub-02', 'sub-03']  # List of participants
task = 'main'
event_id = {'face': 1, 'house': 2, 'object': 3}
n_conditions = len(event_id)
chance_level = 1 / n_conditions

# Preprocessing parameters
l_freq, h_freq = 0.1, 100.0
notch_freqs = [50, 100]
tmin, tmax = -0.2, 0.8
baseline = (-0.2, 0)
n_ica_components = 25
```

---

## Step 3: Process each participant

```python
from mne.preprocessing import ICA
from autoreject import AutoReject
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import StratifiedKFold
from mne.decoding import SlidingEstimator, cross_val_multiscore

all_scores = []  # Collect decoding scores across participants

for sub in subjects:
    print(f"\n{'='*60}")
    print(f"Processing {sub}")
    print(f"{'='*60}")

    # --- Load ---
    raw_path = raw_dir / sub / 'eeg' / f'{sub}_task-{task}.bdf'
    raw = mne.io.read_raw_bdf(str(raw_path), preload=True)

    # --- Channel setup ---
    raw.set_channel_types({
        'EXG1': 'eog', 'EXG2': 'eog',
        'EXG3': 'eog', 'EXG4': 'eog',
        'EXG5': 'misc', 'EXG6': 'misc',
        'EXG7': 'misc', 'EXG8': 'misc',
        'Status': 'stim'
    })
    montage = mne.channels.make_standard_montage('biosemi128')
    raw.set_montage(montage)

    # --- Quality control: check triggers ---
    events = mne.find_events(raw, stim_channel='Status', min_duration=0.001)
    for code, name in event_id.items():
        count = np.sum(events[:, 2] == name)
        print(f"  {code}: {count} events")

    # --- Filter ---
    raw.filter(l_freq, h_freq)
    raw.notch_filter(notch_freqs)

    # --- Re-reference ---
    raw.set_eeg_reference('average', projection=True)
    raw.apply_proj()

    # --- ICA ---
    ica = ICA(n_components=n_ica_components, method='infomax',
              fit_params=dict(extended=True), random_state=42)
    ica.fit(raw, picks='eeg')
    eog_indices, _ = ica.find_bads_eog(raw)
    ica.exclude = eog_indices
    print(f"  ICA: removing {len(eog_indices)} component(s)")
    raw_clean = ica.apply(raw.copy())

    # --- Epoch ---
    events = mne.find_events(raw_clean, stim_channel='Status', min_duration=0.001)
    epochs = mne.Epochs(raw_clean, events, event_id=event_id,
                        tmin=tmin, tmax=tmax, baseline=None, preload=True)

    # --- Baseline ---
    epochs.apply_baseline(baseline)

    # --- Reject bad epochs ---
    ar = AutoReject(random_state=42)
    epochs_clean = ar.fit_transform(epochs)
    print(f"  Epochs: {len(epochs_clean)} / {len(epochs)} kept")

    # --- Save preprocessed data ---
    out_dir = derivatives_dir / 'preprocessing' / sub
    out_dir.mkdir(parents=True, exist_ok=True)
    epochs_clean.save(str(out_dir / f'{sub}_task-{task}-epo.fif'), overwrite=True)

    # --- Time-resolved decoding ---
    X = epochs_clean.get_data(picks='eeg')
    y = epochs_clean.events[:, 2]

    clf = make_pipeline(StandardScaler(), SVC(kernel='linear'))
    sliding = SlidingEstimator(clf, scoring='accuracy', n_jobs=-1)
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
    scores = cross_val_multiscore(sliding, X, y, cv=cv, n_jobs=-1)
    mean_scores = scores.mean(axis=0)
    all_scores.append(mean_scores)

    # Save individual results
    out_dir = derivatives_dir / 'decoding' / sub
    out_dir.mkdir(parents=True, exist_ok=True)
    np.save(str(out_dir / f'{sub}_decoding_scores.npy'), mean_scores)
    print(f"  Peak decoding: {mean_scores.max():.3f}")

# Stack group results
all_scores = np.stack(all_scores, axis=0)  # (n_subjects, n_times)
```

---

## Step 4: Group-level statistics

```python
from mne.stats import permutation_cluster_1samp_test

scores_vs_chance = all_scores - chance_level

t_obs, clusters, cluster_pv, H0 = permutation_cluster_1samp_test(
    scores_vs_chance,
    n_permutations=10000,
    tail=1,
    n_jobs=-1,
    seed=42
)

print("\nSignificant clusters:")
times = epochs_clean.times
for i, (cluster, pv) in enumerate(zip(clusters, cluster_pv)):
    if pv < 0.05:
        ct = times[cluster[0]]
        print(f"  Cluster {i+1}: {ct[0]:.3f} – {ct[-1]:.3f} s, p = {pv:.4f}")
```

---

## Step 5: Visualise results

```python
import matplotlib.pyplot as plt

group_mean = all_scores.mean(axis=0)
group_sem = all_scores.std(axis=0) / np.sqrt(len(subjects))

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(times, group_mean, 'b-', linewidth=2, label='Group mean')
ax.fill_between(times, group_mean - group_sem, group_mean + group_sem,
                alpha=0.2, color='b')
ax.axhline(chance_level, color='k', linestyle='--', label='Chance')
ax.axvline(0, color='k', linewidth=0.5)

for cluster, pv in zip(clusters, cluster_pv):
    if pv < 0.05:
        ct = times[cluster[0]]
        ax.axvspan(ct[0], ct[-1], alpha=0.15, color='green')

ax.set_xlabel('Time (s)')
ax.set_ylabel('Decoding accuracy')
ax.set_title('Group-level time-resolved decoding')
ax.legend()
plt.tight_layout()
plt.savefig(str(project_dir / 'results' / 'group_decoding.png'), dpi=300)
plt.show()
```

---

## Summary

| Step | Tool | Output |
|------|------|--------|
| Environment | Conda + pip | `eeg_env` environment |
| Quality control | MNE | Verified triggers and electrode quality |
| Preprocessing | MNE + autoreject | `*-epo.fif` clean epoched data |
| Decoding | MNE + scikit-learn | `*_decoding_scores.npy` per participant |
| Statistics | MNE `permutation_cluster_1samp_test` | Significant time clusters |
| Visualisation | matplotlib | Group decoding figure |

---

## References

- [MNE-Python tutorials](https://mne.tools/stable/auto_tutorials/index.html)
- [OSF archive — Chen et al. (2023)](https://osf.io/d5egu/) — complete MATLAB workflow
- Chen et al. (2023), *Imaging Neuroscience*. [DOI](https://doi.org/10.1162/imag_a_00006)
- Leys et al. (2025), *Journal of Vision*. [DOI](https://doi.org/10.1167/jov.25.2.6)
