# Statistical testing

When performing time-resolved decoding or RSA across time, you obtain a value at every time point. Testing whether these values are significantly different from chance at each time point individually leads to a severe **multiple comparisons problem** — with hundreds of time points, many will appear significant by chance alone.

This page covers the standard approach for handling this: **cluster-based permutation testing**.

---

## The multiple comparisons problem

Suppose you test decoding accuracy against chance at 500 time points using a standard t-test at *p* < 0.05. By chance, you expect ~25 false positives. Simple Bonferroni correction (*p* < 0.05 / 500 = 0.0001) is overly conservative because it ignores the temporal autocorrelation in EEG data — adjacent time points are not independent.

**Cluster-based permutation tests** offer a principled solution. They exploit the fact that true effects tend to occur in contiguous clusters of time points, while noise tends to produce isolated significant results.

---

## Cluster-based permutation tests

### How it works

1. **Compute a test statistic** (e.g., one-sample t-test against chance) at each time point across participants.
2. **Threshold** the test statistics (e.g., keep only time points where *p* < 0.05 uncorrected).
3. **Form clusters** of contiguous above-threshold time points.
4. **Sum the test statistics** within each cluster to get a cluster-level statistic.
5. **Build a null distribution** by randomly flipping the sign of each participant's data (permuting condition labels) many times and repeating steps 1–4.
6. **Compare** your observed cluster statistics to the null distribution. A cluster is significant if its statistic exceeds the 95th percentile of the null distribution.

### Implementation with MNE

MNE provides `mne.stats.permutation_cluster_1samp_test` for testing against a known value (e.g., chance-level accuracy) and `mne.stats.permutation_cluster_test` for comparing two groups.

#### One-sample test (decoding vs. chance)

```python
import numpy as np
from mne.stats import permutation_cluster_1samp_test

# all_scores shape: (n_subjects, n_times)
# Subtract chance level to test against zero
chance = 1 / n_conditions
scores_vs_chance = all_scores - chance

# Run cluster-based permutation test
# The test is two-tailed by default; use tail=1 for one-tailed (above chance only)
t_obs, clusters, cluster_pv, H0 = permutation_cluster_1samp_test(
    scores_vs_chance,
    n_permutations=10000,     # More permutations = more precise p-values
    threshold=None,           # None uses automatic t-threshold based on p < 0.05
    tail=1,                   # One-tailed: we only care about above-chance decoding
    n_jobs=-1,                # Parallelise
    seed=42                   # For reproducibility
)

# Report significant clusters
for i, (cluster, pv) in enumerate(zip(clusters, cluster_pv)):
    if pv < 0.05:
        cluster_times = epochs.times[cluster[0]]
        print(f"Cluster {i+1}: {cluster_times[0]:.3f} – {cluster_times[-1]:.3f} s, "
              f"p = {pv:.4f}")
```

#### Plotting significant time windows

```python
import matplotlib.pyplot as plt

times = epochs.times
mean_scores = all_scores.mean(axis=0)
sem_scores = all_scores.std(axis=0) / np.sqrt(all_scores.shape[0])

fig, ax = plt.subplots(figsize=(10, 4))

# Plot mean decoding with SEM shading
ax.plot(times, mean_scores, 'b-', linewidth=2)
ax.fill_between(times, mean_scores - sem_scores, mean_scores + sem_scores,
                alpha=0.2, color='b')
ax.axhline(chance, color='k', linestyle='--', label='Chance')
ax.axvline(0, color='k', linestyle='-', linewidth=0.5)

# Highlight significant clusters
for cluster, pv in zip(clusters, cluster_pv):
    if pv < 0.05:
        cluster_times = times[cluster[0]]
        ax.axvspan(cluster_times[0], cluster_times[-1],
                   alpha=0.15, color='green', label=f'p = {pv:.3f}')

ax.set_xlabel('Time (s)')
ax.set_ylabel('Decoding accuracy')
ax.set_title('Group-level decoding with cluster correction')
ax.legend()
plt.tight_layout()
plt.show()
```

---

## Two-sample comparisons

To compare decoding time courses between two conditions or groups:

```python
from mne.stats import permutation_cluster_test

# scores_condition_A shape: (n_subjects, n_times)
# scores_condition_B shape: (n_subjects, n_times)

F_obs, clusters, cluster_pv, H0 = permutation_cluster_test(
    [scores_condition_A, scores_condition_B],
    n_permutations=10000,
    tail=0,       # Two-tailed test
    n_jobs=-1,
    seed=42
)
```

---

## Testing RSA time courses

The same approach works for RSA time courses. Test whether the correlation between neural RDMs and a model RDM is significantly above zero across participants:

```python
# all_rsa shape: (n_subjects, n_times)
# Test against zero (no correlation)
t_obs, clusters, cluster_pv, H0 = permutation_cluster_1samp_test(
    all_rsa,
    n_permutations=10000,
    tail=1,       # One-tailed: positive correlation expected
    n_jobs=-1,
    seed=42
)
```

---

## Practical considerations

!!! tip "Number of permutations"
    Use at least **10,000 permutations** for publication-quality results. For exploratory analyses, 1,000 is sufficient to get a rough sense of significance. More permutations give more precise p-values but take longer to compute.

!!! tip "Threshold choice"
    The `threshold` parameter controls the initial per-time-point threshold for forming clusters:

    - `None` (default): uses a t-value corresponding to *p* < 0.05 based on the degrees of freedom.
    - A specific t-value: e.g., `threshold=2.0`. Higher thresholds form smaller, more conservative clusters.
    - For TFCE (Threshold-Free Cluster Enhancement), use `threshold=dict(start=0, step=0.1)`. TFCE avoids the arbitrary threshold choice but is computationally more expensive.

!!! warning "What cluster tests do NOT tell you"
    Cluster-based permutation tests control the family-wise error rate (i.e., the probability of any false positive cluster). However, they do **not** provide precise onset/offset times for effects. The boundaries of a significant cluster are influenced by statistical power and should not be over-interpreted as precise temporal markers. See [Sassenhagen & Draschkow (2019)](https://doi.org/10.1111/psyp.13335) for a clear discussion of this point.

---

## References

- Maris, E., & Oostenveld, R. (2007). Nonparametric statistical testing of EEG- and MEG-data. *Journal of Neuroscience Methods*, 164(1), 177–190. [DOI](https://doi.org/10.1016/j.jneumeth.2007.03.024)
- Sassenhagen, J., & Draschkow, D. (2019). Cluster-based permutation tests of MEG/EEG data do not establish significance of effect latency or location. *Psychophysiology*, 56(6), e13335. [DOI](https://doi.org/10.1111/psyp.13335)
- [MNE-Python statistics tutorial](https://mne.tools/stable/auto_tutorials/stats/index.html)

---

For a companion guide using MATLAB, see: [:octicons-arrow-right-24: EEG analysis in MATLAB](eeg-matlab.md)

For a complete end-to-end example, see: [:octicons-arrow-right-24: Workflow example](eeg-workflow.md)
