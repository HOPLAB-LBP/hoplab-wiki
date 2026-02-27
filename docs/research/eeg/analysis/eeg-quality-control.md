# Quality control

Before preprocessing, it is essential to verify that your raw data is usable: triggers were sent and recorded correctly, stimulus timing is accurate, and electrodes were functioning properly. Catching problems at this stage saves you from preprocessing data that will need to be discarded.

---

## Load and inspect the raw data

Start by loading your BioSemi `.bdf` file and visually inspecting the continuous signal:

```python
import mne

raw = mne.io.read_raw_bdf('sub-01_task-main.bdf', preload=True)

# Print basic info: channels, sampling rate, duration
print(raw.info)

# Interactive plot of the raw signal
# Scroll through the data to check for obvious problems
raw.plot(duration=20, n_channels=30, scalings='auto')
```

Things to look for during visual inspection:

- **Flat channels**: channels with zero or near-zero variance (dead electrodes)
- **Excessively noisy channels**: channels dominated by high-amplitude noise
- **Large movement artifacts**: sustained, large-amplitude deflections across many channels
- **Obvious electrical interference**: regular 50 Hz line noise (expected, but check for unusual patterns)

---

## Trigger verification

Triggers (event markers) encode the experimental conditions in your EEG data. If triggers are missing or incorrect, the data cannot be epoched properly.

### Extract and inspect events

```python
# Extract events from the status channel
# BioSemi uses the 'Status' channel for triggers
events = mne.find_events(raw, stim_channel='Status', min_duration=0.001)

# Print summary: event codes and their counts
event_id_counts = {}
for event in events:
    code = event[2]
    event_id_counts[code] = event_id_counts.get(code, 0) + 1

print("Event code counts:")
for code, count in sorted(event_id_counts.items()):
    print(f"  Code {code}: {count} events")
```

### What to check

- **All expected trigger codes are present**: compare against your experimental design (e.g., number of trials per condition).
- **No unexpected codes**: extra codes may indicate hardware glitches or software bugs.
- **Correct number of events**: if you expect 200 trials and see 198, investigate the missing two.
- **No duplicate triggers**: triggers fired twice in rapid succession for the same event.

!!! tip "Compare with behavioural logs"
    Always cross-reference your EEG trigger counts with the behavioural log files from your stimulus presentation software. Mismatches indicate a problem with trigger sending or recording.

---

## Stimulus timing validation

For time-sensitive EEG analyses (e.g., ERPs, time-resolved decoding), the precise timing of stimulus presentation matters. Our lab uses a **photocell** to verify that stimuli appear on screen when expected. See the [Creating EEG tasks](../eeg-task.md) page for details on how photocells work.

### Check trigger-to-stimulus delays

If you recorded photocell data, compare the photocell onset with the trigger timestamp to quantify the display delay:

```python
import numpy as np

# Assuming photocell events and trigger events are extracted:
# Calculate the delay between trigger and actual stimulus onset
delays = photocell_onsets - trigger_onsets  # in samples

# Convert to milliseconds
delays_ms = delays / raw.info['sfreq'] * 1000

print(f"Mean delay: {np.mean(delays_ms):.1f} ms")
print(f"Std delay:  {np.std(delays_ms):.1f} ms")
print(f"Max delay:  {np.max(delays_ms):.1f} ms")
```

!!! warning "Acceptable timing"
    A consistent delay (e.g., ~17 ms for a 60 Hz monitor) is normal and can be accounted for. **Variable** delays (high standard deviation) or **large** delays (> 50 ms) should be investigated. Common causes include dropped frames in the stimulus software or incorrect refresh rate settings.

---

## Electrode quality checks

### Identify bad channels

Bad channels should be marked before preprocessing so they can be interpolated or excluded:

```python
# Plot the power spectral density (PSD) for all channels
# Bad channels often show abnormal spectra
raw.compute_psd(fmax=100).plot()

# You can also check channel-level statistics
# Channels with much higher or lower variance are suspect
import numpy as np

data = raw.get_data(picks='eeg')
channel_vars = np.var(data, axis=1)
channel_names = raw.ch_names[:data.shape[0]]

# Flag channels with variance > 3 standard deviations from the mean
mean_var = np.mean(channel_vars)
std_var = np.std(channel_vars)
bad_channels = [
    ch for ch, v in zip(channel_names, channel_vars)
    if abs(v - mean_var) > 3 * std_var
]

print(f"Potentially bad channels: {bad_channels}")
```

### Mark bad channels

```python
# Add bad channels to the raw object
raw.info['bads'] = bad_channels
print(f"Marked as bad: {raw.info['bads']}")

# Visualise the bad channels overlaid on the sensor layout
raw.plot_sensors(ch_type='eeg', show_names=True)
```

!!! tip "Decision criteria"
    - **Flat channels** (zero variance): always mark as bad.
    - **Very noisy channels** (variance > 3 SD from the mean): mark as bad unless the noise is caused by a temporary, removable artifact.
    - **A few bad channels** (< 10% of total) can be interpolated later during preprocessing. If many channels are bad, consider whether the recording is salvageable.

---

## Recording-level exclusion criteria

Some recordings may be too problematic to analyse. Consider excluding a recording if:

- **More than ~10% of channels** are bad (for a 128-channel system, that is roughly 12+ channels)
- **Large portions of the continuous data** (> 30%) are dominated by movement artifacts
- **Triggers are missing or uninterpretable**, making it impossible to epoch the data correctly
- **The participant reported issues** (e.g., excessive discomfort, falling asleep)

!!! info "Document your decisions"
    Keep a log of which recordings you exclude and why. This is important for transparency and for reporting in your paper's methods section. A simple spreadsheet tracking participant ID, recording quality notes, and inclusion/exclusion decisions works well.

---

## Summary checklist

Before moving to preprocessing, verify that for each recording:

- [ ] Triggers are present and match the expected experimental design
- [ ] Stimulus timing is consistent (if photocell data is available)
- [ ] Bad channels are identified and marked
- [ ] The recording is of sufficient quality to proceed
- [ ] Any exclusion decisions are documented

---

Now you are ready to **preprocess** your data. See the next guide: [:octicons-arrow-right-24: Preprocessing](eeg-preprocessing.md)
