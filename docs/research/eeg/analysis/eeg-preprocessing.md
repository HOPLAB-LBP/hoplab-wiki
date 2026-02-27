# Preprocessing

This page walks through the standard EEG preprocessing pipeline using MNE-Python. The goal is to go from raw BioSemi `.bdf` recordings to clean, epoched data ready for analysis.

The typical pipeline is:

1. Load raw data
2. Set channel types and montage
3. Filter (0.1–100 Hz band-pass, 50/100/150 Hz notch)
4. Re-reference to average
5. Run ICA to remove eye artifacts (two-copy strategy)
6. Epoch the data
7. Baseline correction
8. Reject bad epochs

Each step is explained below with code examples and rationale. Before starting, make sure you have run the [quality control](eeg-quality-control.md) checks on your raw data.

---

## 1. Load the raw data

```python
import mne

raw = mne.io.read_raw_bdf(
    'sub-01_task-main.bdf',
    preload=True  # Load data into memory for processing
)
```

!!! tip "BioSemi reference"
    BioSemi uses a CMS/DRL reference during recording (not a traditional ground), which means the data needs to be re-referenced offline (see step 4). The Status channel contains trigger information and is not an EEG channel.

---

## 2. Set channel types and montage

After loading, tell MNE which channels are EEG, EOG (eye channels), or miscellaneous (e.g., external electrodes):

```python
# Set channel types
# Adjust channel names to your specific setup
raw.set_channel_types({
    'EXG1': 'eog',  # Left eye (horizontal)
    'EXG2': 'eog',  # Right eye (horizontal)
    'EXG3': 'eog',  # Above eye (vertical)
    'EXG4': 'eog',  # Below eye (vertical)
    'EXG5': 'misc', 'EXG6': 'misc', 'EXG7': 'misc', 'EXG8': 'misc',
    'Status': 'stim'
})

# Set the electrode montage (standard BioSemi layout)
montage = mne.channels.make_standard_montage('biosemi128')
raw.set_montage(montage)

# Verify the layout visually
raw.plot_sensors(show_names=True)
```

<!--
__PLACEHOLDER__: The EXG channel mapping above is a generic example. Update with
the lab's actual default EOG electrode placement once documented in eeg-lab-setup.md.
-->

---

## 3. Filtering

Apply a band-pass filter to remove slow drifts and high-frequency noise, and a notch filter to remove power line interference:

```python
# Band-pass filter: keep frequencies between 0.1 and 100 Hz
# - 0.1 Hz high-pass removes slow drifts while preserving ERP components
# - 100 Hz low-pass removes high-frequency noise above our frequencies of interest
raw.filter(l_freq=0.1, h_freq=100.0)

# Notch filter: remove power line noise at 50 Hz and its harmonics (100, 150 Hz)
# European mains frequency is 50 Hz; harmonics can persist in the signal
raw.notch_filter(freqs=[50, 100, 150])
```

!!! info "Filter choices"
    - The **0.1 Hz high-pass** is a common choice that removes slow drifts while preserving most ERP components. For analyses that require very low frequencies (e.g., CNV), a lower cutoff may be appropriate.
    - The **100 Hz low-pass** is suitable for most cognitive EEG experiments. For analyses focused on lower frequencies (e.g., time-frequency up to 40 Hz), a lower cutoff can be used.
    - The **notch filter at 50, 100, and 150 Hz** removes power line interference and its harmonics.
    - For a thorough discussion of EEG filter design, see [Widmann et al. (2015)](https://doi.org/10.1016/j.jneumeth.2014.08.002).

<!--
__TODO__: [Andrea] Verify that 0.1 Hz high-pass is the agreed cutoff for
the lab's analysis pipeline. Literature supports 0.1 Hz for ERP and MVPA
analyses (Widmann et al., 2015; Tanner et al., 2016), but some workflows use
higher cutoffs. Discuss and confirm with the lab.
-->

<!--
__TODO__: [Andrea] The 100 Hz low-pass is used here as a safe default, but
the chess-eeg pipeline uses a 40 Hz low-pass instead. For most ERP and MVPA
analyses, neural signals of interest are below 30 Hz, so 40 Hz may be
sufficient. Discuss with Tim and Simen whether to standardise on 40 Hz or
100 Hz as the lab default.
-->

!!! warning "Filter before ICA"
    Filtering should be done **before** ICA. ICA performance degrades with unfiltered data because slow drifts dominate the decomposition. In the next step, we use a **two-copy strategy**: a separate 1 Hz high-pass copy for ICA fitting, then apply the ICA solution back to this 0.1 Hz-filtered data. See the [MNE ICA tutorial](https://mne.tools/stable/auto_tutorials/preprocessing/40_artifact_correction_ica.html) for details.

---

## 4. Re-referencing

BioSemi records with a CMS/DRL reference, which is not suitable for analysis. Re-reference to the **average reference** (the mean of all EEG channels):

```python
# Re-reference to the average of all EEG channels
raw.set_eeg_reference('average', projection=True)
raw.apply_proj()
```

!!! info "Why average reference?"
    The average reference is the most common choice for high-density EEG (64+ channels). It approximates a reference-free recording when enough electrodes cover the head. For lower-density montages, linked mastoids or other references may be more appropriate. See [Yao et al. (2019)](https://doi.org/10.1016/j.brainresrev.2019.02.003) for a discussion of EEG reference choices.

---

## 5. ICA for artifact removal

Independent Component Analysis (ICA) separates the EEG signal into independent components. Some components capture artifacts (eye blinks, eye movements, muscle activity) and can be removed while keeping the neural signal. Our standard approach is to remove eye-related components (blinks and saccades) using ICA.

### Two-copy strategy

ICA decomposition works best on data filtered with a **1 Hz high-pass** — the higher cutoff prevents slow drifts from dominating the decomposition ([Winkler et al., 2015](https://doi.org/10.1016/j.neuroimage.2015.02.025)). However, for analysis we want to keep the 0.1 Hz filter to preserve slow ERP components. The solution is the **two-copy strategy** recommended by the [MNE documentation](https://mne.tools/stable/auto_tutorials/preprocessing/40_artifact_correction_ica.html):

1. Create a copy of the data filtered at 1 Hz — use this only for fitting ICA
2. Fit ICA on the 1 Hz copy — the higher cutoff gives cleaner component separation
3. Apply the resulting ICA solution to the original 0.1 Hz data — this removes the artifact components while preserving slow neural activity

```python
from mne.preprocessing import ICA

# Create a 1 Hz high-pass copy for ICA fitting.
# This gives ICA a cleaner signal to decompose: slow drifts would otherwise
# dominate the decomposition and waste components on non-neural signals.
raw_for_ica = raw.copy().filter(l_freq=1.0, h_freq=None)

# Fit ICA on the 1 Hz-filtered copy.
# n_components=25 is a reasonable starting point for 128-channel data;
# extended infomax handles both sub- and super-Gaussian sources.
ica = ICA(
    n_components=25,
    method='infomax',
    fit_params=dict(extended=True),
    random_state=42  # for reproducibility
)
ica.fit(raw_for_ica, picks='eeg')
```

<!--
__TODO__: [Andrea] Verify that the two-copy ICA strategy (1 Hz for ICA
fitting, 0.1 Hz for analysis) is adopted as the lab standard. The chess-eeg
pipeline already uses a similar approach (1-30 Hz copy for ICA, 0.1-30 Hz main
data). Confirm and align. References: Winkler et al. (2015), Klug & Gramann
(2021), MNE ICA tutorial.
-->

### Identify artifact components

Use the EOG channels to automatically find components correlated with eye artifacts:

```python
# Find components correlated with EOG channels.
# This computes the correlation between each ICA component and the EOG signal,
# flagging components whose time course tracks eye blinks or movements.
eog_indices, eog_scores = ica.find_bads_eog(raw)
print(f"EOG-related components: {eog_indices}")

# Plot component topographies for visual verification
ica.plot_components()

# Plot the time course and properties of suspected artifact components.
# Check that the topography, time course, and power spectrum look like
# eye artifacts before deciding to remove them.
ica.plot_sources(raw, picks=eog_indices)
ica.plot_properties(raw, picks=eog_indices)
```

!!! warning "Always visually verify"
    Automated detection is a useful starting point, but **always visually verify** which components to remove. Look for:

    - **Eye blink components**: frontal topography, characteristic blink waveform
    - **Lateral eye movement components**: dipolar frontal topography (left-right)
    - **Muscle components**: temporal topography, high-frequency power
    - **Heartbeat components**: regular, sharp waveform

    Be conservative: only remove components you are confident are artifacts. Removing too many components removes neural signal.

### Remove artifact components

```python
# Mark the components to exclude
ica.exclude = eog_indices  # Add any additional artifact components

# Apply ICA to the ORIGINAL 0.1 Hz-filtered data (not the 1 Hz copy).
# The ICA weights learned on the 1 Hz copy transfer directly: they remove
# the same artifact components while preserving slow neural activity that
# was filtered out in the ICA training copy.
raw_clean = ica.apply(raw.copy())
```

<!--
__TODO__: [Andrea] Consider adding an optional downsampling step between
ICA and epoching. The chess-eeg pipeline resamples to 250 Hz at this stage for
computational efficiency. MNE recommends using the `decim` parameter in
Epochs() after low-pass filtering as an alternative. Discuss and decide on a
standard resampling rate (e.g., 250 Hz or 256 Hz) for the lab pipeline. Note:
when resampling raw data, event sample indices go out of sync — re-attach
events to the Raw object before calling raw.resample() to keep them aligned.
-->

---

## 6. Epoching

Epoching segments the continuous EEG into time-locked windows around events of interest:

```python
# Extract events from the BioSemi Status channel.
# The bitmask 0x00FF keeps only the lower 8 bits (our trigger codes);
# upper bits are BioSemi system flags that we don't need.
events = mne.find_events(raw_clean, stim_channel='Status',
                         min_duration=0.001,
                         mask=0x00FF, mask_type='and')

# Define your event codes — these should match your trigger_mapping.json
event_id = {
    'face': 1,
    'house': 2,
    'object': 3,
}

# Create epochs: -200 ms to 800 ms around each event
epochs = mne.Epochs(
    raw_clean,
    events,
    event_id=event_id,
    tmin=-0.2,            # Start 200 ms before stimulus
    tmax=0.8,             # End 800 ms after stimulus
    baseline=None,        # We'll apply baseline correction in the next step
    preload=True,
    reject=None           # We'll handle rejection separately
)

print(epochs)
```

!!! info "Epoch window"
    The epoch window depends on your analysis. For ERP studies, -200 to 800 ms is common. For time-resolved decoding (Representational Dynamics), you may want a longer window (e.g., -200 to 1000 ms) to capture later processing stages. Include enough pre-stimulus time for a baseline period.

!!! tip "Photodiode-based event timing"
    If you performed the photodiode timing validation in the [quality control](eeg-quality-control.md#4-photodiode-delay-analysis) step, consider using **photodiode onsets as your event times** for more accurate epoching. The photodiode directly measures when the screen changed, while digital triggers include variable software/OS delays. See the [photodiode-based event timing](eeg-quality-control.md#8-photodiode-based-event-timing) section for how to replace trigger times with photodiode onsets in your events array.

---

## 7. Baseline correction

Subtract the mean of the pre-stimulus period from each epoch to remove DC offsets:

```python
# Apply baseline correction using the pre-stimulus period (-200 to 0 ms)
epochs.apply_baseline(baseline=(-0.2, 0))
```

---

## 8. Reject bad epochs

Even after ICA, some epochs may still contain residual artifacts (e.g., movement). Use a combination of automated and manual rejection:

### Automated rejection with autoreject

[autoreject](https://autoreject.github.io/stable/) uses cross-validation to determine optimal rejection thresholds for each channel:

```python
from autoreject import AutoReject

ar = AutoReject(random_state=42)
epochs_clean, reject_log = ar.fit_transform(epochs, return_log=True)

# Visualise which epochs were rejected and why
reject_log.plot('horizontal')

print(f"Kept {len(epochs_clean)} of {len(epochs)} epochs "
      f"({len(epochs) - len(epochs_clean)} rejected)")
```

### Manual rejection (alternative or supplement)

For manual inspection, use MNE's interactive epoch browser:

```python
# Interactive plot: click on bad epochs to mark them
epochs.plot(n_epochs=10, n_channels=30, scalings='auto')

# After marking, drop the bad epochs
epochs.drop_bad()
```

### Peak-to-peak rejection (simple threshold)

A simpler approach using fixed voltage thresholds:

```python
# Reject epochs where peak-to-peak amplitude exceeds threshold
reject_criteria = dict(eeg=150e-6)  # 150 µV
epochs.drop_bad(reject=reject_criteria)
```

!!! tip "Which rejection method?"
    - **autoreject** is recommended for most cases: it adapts thresholds per channel and can interpolate rather than reject entire epochs.
    - **Peak-to-peak thresholds** are simpler and commonly used, but require manual tuning.
    - **Manual rejection** is useful as a final check, especially if you are unsure about your automated pipeline.

---

## Save the preprocessed data

Save your cleaned epochs for analysis:

```python
# Save as MNE .fif format
epochs_clean.save('sub-01_task-main-epo.fif', overwrite=True)

# To load later:
# epochs = mne.read_epochs('sub-01_task-main-epo.fif')
```

---

## Considerations for multivariate analysis

If you plan to use your preprocessed data for MVPA, decoding, or RSA, be aware of the following considerations. These are active areas of discussion in the field, and we flag them here for awareness.

!!! info "Baseline correction and high-pass filtering"
    When combined with high-pass filtering, baseline correction can introduce **spurious pre-stimulus patterns** that may inflate decoding accuracy before the stimulus even appeared ([Tanner et al., 2016](https://doi.org/10.1111/psyp.12437)). As a sanity check, always verify that decoding accuracy in the **pre-stimulus window** is at chance level. If you observe above-chance pre-stimulus decoding, consider omitting baseline correction or using a different approach (e.g., baseline normalisation only for visualisation, not for decoding input).

!!! info "Does artifact correction improve decoding?"
    Recent work by [Kessler et al. (2025)](https://doi.org/10.1038/s42003-025-08464-3) found that ICA-based artifact correction does not consistently improve EEG decoding accuracy, and in some cases may slightly reduce it. Our standard recommendation remains to apply ICA (at minimum for eye components), because it improves data quality for ERP analysis and prevents structured noise from inflating results. However, this finding is worth keeping in mind — if your decoding results change substantially after ICA, investigate whether artifact structure was contributing to apparent effects.

!!! info "Minimal preprocessing approaches"
    [Delorme (2023)](https://doi.org/10.1038/s41598-023-27528-0) argued that "EEG is better left alone" — minimal preprocessing can be sufficient for some analyses. This is provided as further reading, not as our recommendation. We recommend the full pipeline described on this page, and suggest deviating only with good reason and documentation.

<!--
__TODO__: [Andrea] Review MVPA-specific preprocessing recommendations with
the lab. The current standard (full ICA pipeline) may be refined based on
findings from Kessler et al. (2025), Tanner et al. (2016), and Delorme (2023).
Discuss whether any adjustments are warranted for decoding-focused analyses.
-->

---

## Summary

The complete preprocessing pipeline in brief:

```python
import mne
from mne.preprocessing import ICA
from autoreject import AutoReject

# 1. Load raw BioSemi data
raw = mne.io.read_raw_bdf('sub-01_task-main.bdf', preload=True)

# 2. Channel setup: label EOG and external channels, apply montage
raw.set_channel_types({'EXG1': 'eog', 'EXG2': 'eog', ...})
montage = mne.channels.make_standard_montage('biosemi128')
raw.set_montage(montage)

# 3. Filter: 0.1–100 Hz bandpass, notch at 50 Hz + harmonics
raw.filter(0.1, 100.0)
raw.notch_filter([50, 100, 150])

# 4. Re-reference to average
raw.set_eeg_reference('average', projection=True)
raw.apply_proj()

# 5. Two-copy ICA: fit on 1 Hz copy, apply to 0.1 Hz data
raw_for_ica = raw.copy().filter(l_freq=1.0, h_freq=None)
ica = ICA(n_components=25, method='infomax',
          fit_params=dict(extended=True), random_state=42)
ica.fit(raw_for_ica, picks='eeg')
eog_indices, _ = ica.find_bads_eog(raw)
ica.exclude = eog_indices
raw_clean = ica.apply(raw.copy())

# 6. Epoch (with BioSemi bitmask filtering)
events = mne.find_events(raw_clean, stim_channel='Status',
                         mask=0x00FF, mask_type='and')
epochs = mne.Epochs(raw_clean, events, event_id={'face': 1, 'house': 2},
                    tmin=-0.2, tmax=0.8, baseline=None, preload=True)

# 7. Baseline correction
epochs.apply_baseline((-0.2, 0))

# 8. Automated epoch rejection
ar = AutoReject(random_state=42)
epochs_clean = ar.fit_transform(epochs)

# Save preprocessed epochs
epochs_clean.save('sub-01_task-main-epo.fif', overwrite=True)
```

---

## References

- Delorme, A. (2023). EEG is better left alone. *Scientific Reports*, 13, 2372. [doi:10.1038/s41598-023-27528-0](https://doi.org/10.1038/s41598-023-27528-0)
- Kessler, R., et al. (2025). The impact of EEG preprocessing on multivariate decoding. *Communications Biology*, 8, 202. [doi:10.1038/s42003-025-08464-3](https://doi.org/10.1038/s42003-025-08464-3)
- Klug, M., & Gramann, K. (2021). Identifying key factors for improving ICA-based decomposition of EEG data in mobile and stationary experiments. *European Journal of Neuroscience*, 54(12), 8406–8420. [doi:10.1111/ejn.14992](https://doi.org/10.1111/ejn.14992)
- Tanner, D., Morgan-Short, K., & Luck, S. J. (2016). How inappropriate high-pass filters can produce artifactual effects and incorrect conclusions in ERP studies of language and cognition. *Psychophysiology*, 52(7), 997–1009. [doi:10.1111/psyp.12437](https://doi.org/10.1111/psyp.12437)
- Widmann, A., Schröger, E., & Maess, B. (2015). Digital filter design for electrophysiological data — a practical approach. *Journal of Neuroscience Methods*, 250, 34–46. [doi:10.1016/j.jneumeth.2014.08.002](https://doi.org/10.1016/j.jneumeth.2014.08.002)
- Winkler, I., Debener, S., Müller, K. R., & Tangermann, M. (2015). On the influence of high-pass filtering on ICA-based artifact reduction in EEG-ERP. *NeuroImage*, 112, 165–179. [doi:10.1016/j.neuroimage.2015.02.025](https://doi.org/10.1016/j.neuroimage.2015.02.025)
- Yao, D., et al. (2019). Which reference should we use for EEG and ERP practice? *Brain Topography*, 32, 530–549. [doi:10.1007/s10548-019-00707-x](https://doi.org/10.1007/s10548-019-00707-x)

---

Now you are ready to run **multivariate analysis** on your preprocessed data. See the next guide: [:octicons-arrow-right-24: Multivariate analysis](eeg-multivariate.md)
