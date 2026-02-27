# Preprocessing

This page walks through the standard EEG preprocessing pipeline using MNE-Python. The goal is to go from raw BioSemi `.bdf` recordings to clean, epoched data ready for analysis.

The typical pipeline is:

1. Load raw data
2. Set channel types and montage
3. Filter (band-pass and notch)
4. Re-reference
5. Run ICA to remove artifacts
6. Epoch the data
7. Baseline correction
8. Reject bad epochs

Each step is explained below with code examples and rationale.

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
# - 0.1 Hz high-pass removes slow drifts
# - 100 Hz low-pass removes high-frequency noise
raw.filter(l_freq=0.1, h_freq=100.0)

# Notch filter at 50 Hz (European power line frequency)
# Also remove harmonics at 100 Hz
raw.notch_filter(freqs=[50, 100])
```

!!! info "Filter choices"
    - The **0.1 Hz high-pass** is a common choice that removes slow drifts while preserving most ERP components. For analyses that require very low frequencies (e.g., CNV), a lower cutoff may be appropriate.
    - The **100 Hz low-pass** is suitable for most cognitive EEG experiments. For analyses focused on lower frequencies (e.g., time-frequency up to 40 Hz), a lower cutoff can be used.
    - For a thorough discussion of EEG filter settings, see [Widmann et al. (2015)](https://doi.org/10.1016/j.jneumeth.2014.08.002).

!!! warning "Filter before ICA"
    Filtering should be done **before** ICA. ICA performance degrades with unfiltered data because slow drifts dominate the decomposition. Some researchers use a higher high-pass (e.g., 1 Hz) specifically for the ICA step and then apply the components to data filtered at 0.1 Hz. See the [MNE ICA tutorial](https://mne.tools/stable/auto_tutorials/preprocessing/40_artifact_correction_ica.html) for details on this approach.

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

Independent Component Analysis (ICA) separates the EEG signal into independent components. Some components capture artifacts (eye blinks, eye movements, muscle activity) and can be removed while keeping the neural signal.

### Fit ICA

```python
from mne.preprocessing import ICA

# Fit ICA with a sufficient number of components
# n_components=25 is a reasonable starting point for 128-channel data
ica = ICA(
    n_components=25,
    method='infomax',       # 'infomax' or 'fastica' are common choices
    fit_params=dict(extended=True),
    random_state=42         # For reproducibility
)

ica.fit(raw, picks='eeg')
```

### Identify artifact components

Use the EOG channels to automatically find components correlated with eye artifacts:

```python
# Find components correlated with EOG channels
eog_indices, eog_scores = ica.find_bads_eog(raw)
print(f"EOG-related components: {eog_indices}")

# Plot the components for visual verification
ica.plot_components()

# Plot the time course and topography of suspected artifact components
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

# Apply ICA to the raw data (removes the marked components)
raw_clean = ica.apply(raw.copy())
```

---

## 6. Epoching

Epoching segments the continuous EEG into time-locked windows around events of interest:

```python
# Extract events from the status channel
events = mne.find_events(raw_clean, stim_channel='Status', min_duration=0.001)

# Define your event codes
# Adjust these to match your experimental design
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

## Summary

The complete preprocessing pipeline in brief:

```python
import mne
from mne.preprocessing import ICA
from autoreject import AutoReject

# 1. Load
raw = mne.io.read_raw_bdf('sub-01_task-main.bdf', preload=True)

# 2. Channel setup
raw.set_channel_types({'EXG1': 'eog', 'EXG2': 'eog', ...})
montage = mne.channels.make_standard_montage('biosemi128')
raw.set_montage(montage)

# 3. Filter
raw.filter(0.1, 100.0)
raw.notch_filter([50, 100])

# 4. Re-reference
raw.set_eeg_reference('average', projection=True)
raw.apply_proj()

# 5. ICA
ica = ICA(n_components=25, method='infomax',
          fit_params=dict(extended=True), random_state=42)
ica.fit(raw, picks='eeg')
eog_indices, _ = ica.find_bads_eog(raw)
ica.exclude = eog_indices
raw_clean = ica.apply(raw.copy())

# 6. Epoch
events = mne.find_events(raw_clean, stim_channel='Status')
epochs = mne.Epochs(raw_clean, events, event_id={'face': 1, 'house': 2},
                    tmin=-0.2, tmax=0.8, baseline=None, preload=True)

# 7. Baseline
epochs.apply_baseline((-0.2, 0))

# 8. Reject
ar = AutoReject(random_state=42)
epochs_clean = ar.fit_transform(epochs)

# Save
epochs_clean.save('sub-01_task-main-epo.fif', overwrite=True)
```

---

Now you are ready to run **multivariate analysis** on your preprocessed data. See the next guide: [:octicons-arrow-right-24: Multivariate analysis](eeg-multivariate.md)
