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

## Testing over specific time windows

Instead of testing decoding at every time point, you may want to test over **predefined time windows** corresponding to known ERP components or theoretically motivated intervals (e.g., 80–120 ms for the P1, 130–200 ms for the N170, 300–500 ms for the P300). This reduces the number of comparisons and can increase statistical power.

```python
# Define time windows of interest (in seconds)
time_windows = {
    'P1':   (0.080, 0.120),
    'N170': (0.130, 0.200),
    'P300': (0.300, 0.500),
}

# Average decoding accuracy within each window, then test across participants
for name, (t_start, t_end) in time_windows.items():
    # Find time indices for this window
    time_mask = (epochs.times >= t_start) & (epochs.times <= t_end)

    # Average decoding accuracy within the window for each participant
    # all_scores shape: (n_subjects, n_times)
    window_scores = all_scores[:, time_mask].mean(axis=1)  # (n_subjects,)

    # One-sample t-test against chance
    from scipy.stats import ttest_1samp
    t_stat, p_val = ttest_1samp(window_scores, chance)
    print(f"{name} ({t_start}–{t_end} s): mean = {window_scores.mean():.3f}, "
          f"t = {t_stat:.2f}, p = {p_val:.4f}")
```

!!! warning "Window-based vs. cluster-based"
    Window-based tests and cluster-based permutation tests answer different questions. Window-based tests are more powerful when you have strong *a priori* hypotheses about the timing of effects (e.g., "is there decoding in the N170 window?"). Cluster-based tests are better for exploratory analysis across the full time course. Both approaches are valid and complementary.

<!--
__TODO__: [Andrea] Discuss with Tim and Simen which time windows to use as
standard for the lab's chess-eeg analyses. Define theoretically motivated
windows based on the visual processing literature (P1, N170, P300) and any
task-specific windows. Consider whether window-based or cluster-based testing
should be the primary statistical approach.
-->

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

For more advanced RSA statistics, the [rsatoolbox](https://rsatoolbox.readthedocs.io/) package provides methods for model comparison, noise ceiling estimation, and bootstrap-based inference. The `rsatoolbox.inference` module implements several approaches:

- **Bootstrap tests**: test whether a model fits the data significantly above zero
- **Model comparison**: compare the fit of multiple model RDMs using bootstrap or crossvalidation
- **Noise ceiling**: estimate the upper and lower bound of explainable variance, which helps interpret how well your models capture the data

<!--
__TODO__: [Andrea] Decide with Tim and Simen whether to adopt rsatoolbox for
RSA statistical inference. If so, document the standard approach (e.g.,
bootstrap_testRDM for single-model tests, bootstrap_testpaired for model
comparison). Also decide whether to use rsatoolbox's built-in crossvalidated
distances or stick with scipy/sklearn-based computation.
-->

<!--
__TODO__: [Andrea] Discuss permutation test parameters with the team:
number of permutations (10,000 for publication, 1,000 for exploration),
threshold method (t-threshold vs. TFCE), one-tailed vs. two-tailed tests
for decoding. Document the lab's standard choices.
-->

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

- Maris, E., & Oostenveld, R. (2007). Nonparametric statistical testing of EEG- and MEG-data. *Journal of Neuroscience Methods*, 164(1), 177–190. [doi:10.1016/j.jneumeth.2007.03.024](https://doi.org/10.1016/j.jneumeth.2007.03.024)
- Pernet, C. R., et al. (2020). Issues and recommendations from the OHBM COBIDAS MEEG committee. *Nature Neuroscience*, 23(12), 1550–1558. [doi:10.1038/s41593-020-00709-0](https://doi.org/10.1038/s41593-020-00709-0) — Reporting standards for M/EEG studies. Consult this when writing your methods section.
- Sassenhagen, J., & Draschkow, D. (2019). Cluster-based permutation tests of MEG/EEG data do not establish significance of effect latency or location. *Psychophysiology*, 56(6), e13335. [doi:10.1111/psyp.13335](https://doi.org/10.1111/psyp.13335)
- [MNE-Python statistics tutorial](https://mne.tools/stable/auto_tutorials/stats/index.html)

---

For a companion guide using MATLAB, see: [:octicons-arrow-right-24: EEG analysis in MATLAB](eeg-matlab.md)

For a complete end-to-end example, see: [:octicons-arrow-right-24: Workflow example](eeg-workflow.md)
