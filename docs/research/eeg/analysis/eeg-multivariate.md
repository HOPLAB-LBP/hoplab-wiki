# Multivariate analysis

This page covers the lab's standard approach to multivariate EEG analysis: **Representational Dynamics**. This framework uses time-resolved decoding and representational similarity analysis (RSA) to track how neural representations unfold over time.

Our approach is described in detail in two key publications:

- *[Chen et al.](https://direct.mit.edu/imag/article/doi/10.1162/imag_a_00006/116700/The-representational-dynamics-of-the-animal)* (2023, *Imaging Neuroscience*) — introduces the Representational Dynamics approach with EEG and demonstrates it on animal categorisation.
- *[Leys et al.](https://jov.arvojournals.org/article.aspx?articleid=2811037)* (2025, *Journal of Vision*) — extends the approach and provides the most detailed description of the pipeline.

The analysis code from Chen et al. (2023) is available on the [OSF archive](https://osf.io/d5egu/).

---

## Conceptual overview

### What is Representational Dynamics?

Standard ERP analysis averages signals over electrodes and conditions, losing information about the spatial pattern of activity. Multivariate methods instead use the **pattern of activity across electrodes** at each time point to decode which stimulus or condition was presented.

The key idea behind Representational Dynamics is to apply this decoding at every time point, producing a **time course of decodability** that reveals when and for how long the brain discriminates between conditions.

The workflow has three main components:

1. **Time-resolved decoding**: train a classifier at each time point to distinguish between conditions based on the pattern of activity across electrodes.
2. **Temporal generalisation** (optional): test whether a classifier trained at one time point can decode at other time points, revealing whether representations are stable or dynamic.
3. **Representational similarity analysis (RSA)**: compare the neural representational geometry at each time point with model-predicted similarity structures.

---

## 1. Time-resolved decoding

### Prepare the data

Starting from clean, epoched data (see [Preprocessing](eeg-preprocessing.md)):

```python
import mne
import numpy as np
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC
from sklearn.model_selection import cross_val_score, StratifiedKFold
from mne.decoding import SlidingEstimator, cross_val_multiscore

# Load preprocessed epochs
epochs = mne.read_epochs('sub-01_task-main-epo.fif')

# Get the data matrix and labels
# X shape: (n_epochs, n_channels, n_times)
# y shape: (n_epochs,)
X = epochs.get_data(picks='eeg')
y = epochs.events[:, 2]  # Condition labels from event codes
```

### Set up the classifier

We use a linear Support Vector Machine (SVM) with standardised features. The `SlidingEstimator` from MNE applies this classifier independently at each time point:

```python
# Define the classification pipeline
clf = make_pipeline(
    StandardScaler(),       # Z-score the features (electrodes) at each time point
    SVC(kernel='linear')    # Linear SVM classifier
)

# Wrap in SlidingEstimator for time-resolved decoding
sliding = SlidingEstimator(clf, scoring='accuracy', n_jobs=-1)

# Cross-validate: stratified k-fold ensures balanced condition proportions
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)

# Run decoding at each time point
# Result shape: (n_splits, n_times)
scores = cross_val_multiscore(sliding, X, y, cv=cv, n_jobs=-1)

# Average across folds
mean_scores = scores.mean(axis=0)
```

### Plot the decoding time course

```python
import matplotlib.pyplot as plt

times = epochs.times

fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(times, mean_scores, 'b-', linewidth=2)
ax.axhline(1 / len(np.unique(y)), color='k', linestyle='--', label='Chance level')
ax.axvline(0, color='k', linestyle='-', linewidth=0.5)
ax.set_xlabel('Time (s)')
ax.set_ylabel('Decoding accuracy')
ax.set_title('Time-resolved decoding')
ax.legend()
plt.tight_layout()
plt.show()
```

!!! info "Interpreting the time course"
    - **Above-chance accuracy** at a given time point means the spatial pattern of EEG activity contains information about the condition at that moment.
    - The **onset of above-chance decoding** indicates when the brain starts distinguishing between conditions.
    - The **peak** and **duration** of the decoding curve characterise the strength and temporal extent of the neural representation.

---

## 2. Temporal generalisation

Temporal generalisation (also known as the "temporal generalisation matrix") tests whether a classifier trained at time *t* can decode at time *t'*. This reveals whether representations are **transient** (decodable only at the training time) or **sustained** (generalisable across time).

```python
from mne.decoding import GeneralizingEstimator

# Use GeneralizingEstimator instead of SlidingEstimator
gen = GeneralizingEstimator(clf, scoring='accuracy', n_jobs=-1)

# Cross-validate
# Result shape: (n_splits, n_train_times, n_test_times)
gen_scores = cross_val_multiscore(gen, X, y, cv=cv, n_jobs=-1)
mean_gen_scores = gen_scores.mean(axis=0)

# Plot the temporal generalisation matrix
fig, ax = plt.subplots(figsize=(6, 6))
im = ax.imshow(
    mean_gen_scores,
    origin='lower',
    extent=[times[0], times[-1], times[0], times[-1]],
    aspect='auto',
    cmap='RdBu_r',
    vmin=0,
    vmax=1
)
ax.set_xlabel('Testing time (s)')
ax.set_ylabel('Training time (s)')
ax.set_title('Temporal generalisation matrix')
ax.axvline(0, color='k', linestyle='-', linewidth=0.5)
ax.axhline(0, color='k', linestyle='-', linewidth=0.5)
plt.colorbar(im, ax=ax, label='Accuracy')
plt.tight_layout()
plt.show()
```

!!! info "Interpreting the matrix"
    - **Diagonal**: equivalent to the time-resolved decoding above.
    - **Off-diagonal above chance**: the representation at training time generalises to testing time — this suggests a stable or recurrent neural code.
    - **Strictly diagonal pattern**: representations are transient, changing rapidly over time.

---

## 3. Representational similarity analysis (RSA)

RSA compares the geometry of neural representations with model-predicted similarity structures. Instead of asking "can we decode condition A vs. B?", RSA asks "does the pattern of similarity between all conditions match a theoretical model?"

### Compute neural representational dissimilarity matrices (RDMs)

At each time point, compute a dissimilarity matrix (RDM) from the EEG patterns:

```python
from sklearn.metrics.pairwise import pairwise_distances

conditions = np.unique(y)
n_conditions = len(conditions)
n_times = X.shape[2]

# Compute the mean pattern for each condition at each time point
mean_patterns = np.zeros((n_conditions, X.shape[1], n_times))
for i, cond in enumerate(conditions):
    mean_patterns[i] = X[y == cond].mean(axis=0)

# Compute RDM at each time point (using correlation distance)
rdms = np.zeros((n_times, n_conditions, n_conditions))
for t in range(n_times):
    patterns_t = mean_patterns[:, :, t]  # (n_conditions, n_channels)
    rdms[t] = pairwise_distances(patterns_t, metric='correlation')
```

### Compare with a model RDM

```python
from scipy.stats import spearmanr

# Example: a model RDM based on your hypothesis
# (e.g., animate vs. inanimate categories)
model_rdm = np.array([
    [0, 0, 1],  # face-face, face-house, face-object
    [0, 0, 1],  # house-face, house-house, house-object
    [1, 1, 0],  # object-face, object-house, object-object
])

# Correlate neural RDM with model RDM at each time point
# Use only the upper triangle (excluding diagonal)
triu_idx = np.triu_indices(n_conditions, k=1)
model_vec = model_rdm[triu_idx]

rsa_timecourse = np.zeros(n_times)
for t in range(n_times):
    neural_vec = rdms[t][triu_idx]
    rsa_timecourse[t], _ = spearmanr(neural_vec, model_vec)

# Plot
fig, ax = plt.subplots(figsize=(10, 4))
ax.plot(times, rsa_timecourse, 'r-', linewidth=2)
ax.axhline(0, color='k', linestyle='--')
ax.axvline(0, color='k', linestyle='-', linewidth=0.5)
ax.set_xlabel('Time (s)')
ax.set_ylabel('Spearman correlation with model')
ax.set_title('RSA time course')
plt.tight_layout()
plt.show()
```

!!! info "Using the rsatoolbox package"
    For more advanced RSA (multiple models, noise-normalised distances, crossvalidated distances), the [rsatoolbox](https://rsatoolbox.readthedocs.io/) Python package provides a comprehensive set of methods. See its documentation for examples of crossvalidated Mahalanobis distance and model comparison.

---

## Pairwise decoding matrix

For Representational Dynamics, it is common to decode every pair of conditions separately, producing a pairwise decoding matrix at each time point. This gives a richer picture than binary decoding and directly relates to RSA:

```python
from itertools import combinations

# All unique pairs of conditions
pairs = list(combinations(range(n_conditions), 2))
n_pairs = len(pairs)

pairwise_scores = np.zeros((n_pairs, n_times))

for p_idx, (c1, c2) in enumerate(pairs):
    # Select epochs for this pair
    mask = np.isin(y, [conditions[c1], conditions[c2]])
    X_pair = X[mask]
    y_pair = y[mask]

    # Decode
    scores_pair = cross_val_multiscore(sliding, X_pair, y_pair, cv=cv, n_jobs=-1)
    pairwise_scores[p_idx] = scores_pair.mean(axis=0)

    print(f"Pair {conditions[c1]} vs {conditions[c2]}: "
          f"peak accuracy = {pairwise_scores[p_idx].max():.3f}")
```

---

## Group-level analysis

The steps above are performed for each participant individually. For group-level inference:

1. Run the entire pipeline for each participant.
2. Collect the decoding time courses (or RSA time courses) across participants.
3. Use statistical testing to determine when decoding is significantly above chance at the group level. See [:octicons-arrow-right-24: Statistical testing](eeg-statistics.md) for cluster-based permutation tests.

```python
# Example: stack individual subject scores
# all_scores shape: (n_subjects, n_times)
all_scores = np.stack([scores_sub01, scores_sub02, ...], axis=0)

# Simple group average
group_mean = all_scores.mean(axis=0)
group_sem = all_scores.std(axis=0) / np.sqrt(all_scores.shape[0])
```

---

## References

- Chen, Y., Leys, T., & Op de Beeck, H. (2023). The representational dynamics of the animal appearance bias in human visual cortex are explained by a deep neural network trained for object classification. *Imaging Neuroscience*, 1, 1–27. [DOI](https://doi.org/10.1162/imag_a_00006)
- Leys, T., Chen, Y., & Op de Beeck, H. (2025). Representational dynamics of object recognition in humans. *Journal of Vision*, 25(2), 6. [DOI](https://doi.org/10.1167/jov.25.2.6)
- King, J.-R., & Dehaene, S. (2014). Characterizing the dynamics of mental representations: the temporal generalization method. *Trends in Cognitive Sciences*, 18(4), 203–210.
- Kriegeskorte, N., Mur, M., & Bandettini, P. (2008). Representational similarity analysis — connecting the branches of systems neuroscience. *Frontiers in Systems Neuroscience*, 2, 4.
- [OSF archive — Chen et al. (2023) analysis code](https://osf.io/d5egu/)

---

Now you are ready to test the significance of your results. See the next guide: [:octicons-arrow-right-24: Statistical testing](eeg-statistics.md)
