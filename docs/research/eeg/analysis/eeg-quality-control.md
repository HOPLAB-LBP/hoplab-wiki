# Quality control

Before preprocessing, it is essential to verify that your raw data is usable: triggers were sent and recorded correctly, stimulus timing is accurate, and electrodes were functioning properly. Catching problems at this stage saves you from preprocessing data that will need to be discarded.

This page provides a structured QC workflow that you can run on each participant's raw data. Each section is self-contained, with code you can run step by step. A complete copy-paste script is also available at the [bottom of the page](#complete-qc-script-1).

---

## Configuration

Define all parameters at the top of your script. Adjust these to match your experiment:

```python
import mne
import numpy as np
import matplotlib.pyplot as plt
from scipy.signal import find_peaks
from pathlib import Path
import pandas as pd

# Paths
bdf_files = sorted(Path('sourcedata/sub-01/eeg').glob('*.bdf'))

# Channel names
PHOTODIODE_CH = 'Erg1'           # Photodiode channel (always Erg1 in our lab)
STIM_CH = 'Status'               # BioSemi trigger channel
EXCLUDE_CH = ['EXG5', 'EXG6', 'EXG7', 'EXG8',
              'GSR1', 'GSR2', 'Erg2', 'Resp', 'Plet', 'Temp']

# Expected trigger codes — should match your trigger_mapping.json
EXPECTED_TRIGGERS = {
    'fixation_onset': 80,
    'stimulus_onset': 81,
    'fixation_post_stim': 82,
}
STIMULUS_TRIGGER_RANGE = (1, 79)   # Codes 1–79 are stimulus triggers
EXPECTED_TRIALS_PER_RUN = 200      # How many stimulus trials per run
EXPECTED_N_RUNS = 4                # How many runs per participant

# Stimulus duration (for dropped frame detection via photodiode)
EXPECTED_STIM_DURATION_S = 0.050   # Expected stimulus on-screen time (e.g., 3 frames at 60 Hz ≈ 50 ms)
STIM_DURATION_TOLERANCE_S = 0.005  # Flag if duration deviates by more than 5 ms

# Line noise
LINE_NOISE_FREQ = 50               # Power line frequency (Hz); use 60 in North America

# Photodiode onset detection parameters (see Section 4 for explanation)
PHOTO_AMPLITUDE_PERCENTILE = 0.99  # Peak detection: 99th percentile threshold
PHOTO_MIN_DISTANCE_S = 0.05        # Minimum 50 ms between consecutive peaks
PHOTO_BACK_WINDOW_S = 0.020        # Search 20 ms before peak for true onset
PHOTO_SLOPE_WIN_SAMPLES = 4        # Sliding window for slope computation
PHOTO_SLOPE_THRESHOLD = 0.00085    # Slope threshold (V/sample) to detect onset
PHOTO_MATCH_TOLERANCE_S = 0.2      # Max allowable trigger-to-photodiode gap
PHOTO_OUTLIER_THRESHOLD_MS = 17    # Delays above this flagged as outliers

# Channel quality thresholds
FLAT_CHANNEL_THRESHOLD = 0.01      # Variance < 1% of median = flat/dead
NOISY_CHANNEL_SD = 3               # Variance > 3 SD above mean = noisy
BRIDGE_CORRELATION_THRESHOLD = 0.98  # |r| > 0.98 = possibly bridged by gel
QC_SEGMENT_DURATION = 30           # Use 30 s of data for quick channel checks
```

---

## 1. Load and describe the recording

Start by loading your BioSemi `.bdf` file(s) and printing basic descriptives:

```python
# Load all BDF files for this participant
raws = []
for f in bdf_files:
    raw = mne.io.read_raw_bdf(str(f), preload=True, exclude=EXCLUDE_CH)
    raws.append(raw)
    print(f"  {f.name}: {raw.n_times / raw.info['sfreq']:.1f} s, "
          f"{len(raw.ch_names)} channels")

# Concatenate if multiple runs
if len(raws) > 1:
    raw = mne.concatenate_raws(raws)
    print(f"\nConcatenated: {len(raws)} runs")
else:
    raw = raws[0]

# Print summary
sfreq = raw.info['sfreq']
duration_s = raw.n_times / sfreq
n_eeg = len(mne.pick_types(raw.info, eeg=True))
print(f"\nRecording summary:")
print(f"  Sampling rate: {sfreq:.0f} Hz")
print(f"  Duration: {duration_s:.1f} s ({duration_s / 60:.1f} min)")
print(f"  EEG channels: {n_eeg}")
print(f"  Total channels: {len(raw.ch_names)}")
```

!!! tip "Sanity check"
    Verify that the sampling rate is 1024 Hz (our BioSemi default) and that the recording duration matches what you expect. If you ran 4 blocks of ~5 minutes each, the total should be roughly 20 minutes.

---

## 2. Trigger inventory

Extract all events and compare them to your expected trigger mapping:

```python
# Extract events with bitmask filtering for BioSemi
# The lower 8 bits contain the trigger code; upper bits are system flags
events = mne.find_events(raw, stim_channel=STIM_CH,
                         min_duration=0.001,
                         mask=0x00FF, mask_type='and')

# Count events per unique code
unique_codes, counts = np.unique(events[:, 2], return_counts=True)
print(f"\nTrigger inventory ({len(events)} total events):")
print(f"{'Code':>6}  {'Count':>6}  {'Name'}")
print(f"{'─' * 6}  {'─' * 6}  {'─' * 20}")
for code, count in zip(unique_codes, counts):
    # Look up the name if it's in our expected triggers
    name = next((n for n, c in EXPECTED_TRIGGERS.items() if c == code), '')
    if STIMULUS_TRIGGER_RANGE[0] <= code <= STIMULUS_TRIGGER_RANGE[1]:
        name = f'stimulus ({code})'
    print(f"{code:>6}  {count:>6}  {name}")

# Check for missing or unexpected triggers
expected_codes = set(EXPECTED_TRIGGERS.values())
found_codes = set(unique_codes)
missing = expected_codes - found_codes
unexpected = found_codes - expected_codes - set(
    range(STIMULUS_TRIGGER_RANGE[0], STIMULUS_TRIGGER_RANGE[1] + 1))

if missing:
    print(f"\n⚠ MISSING expected trigger codes: {missing}")
if unexpected:
    print(f"\n⚠ UNEXPECTED trigger codes: {unexpected}")

# Count stimulus triggers
stim_mask = (events[:, 2] >= STIMULUS_TRIGGER_RANGE[0]) & \
            (events[:, 2] <= STIMULUS_TRIGGER_RANGE[1])
n_stim = stim_mask.sum()
print(f"\nStimulus triggers (codes {STIMULUS_TRIGGER_RANGE[0]}–"
      f"{STIMULUS_TRIGGER_RANGE[1]}): {n_stim}")
```

```python
# Plot trigger counts
fig, ax = plt.subplots(figsize=(10, 4))
ax.bar(range(len(unique_codes)), counts, color='steelblue', edgecolor='black')
ax.set_xticks(range(len(unique_codes)))
ax.set_xticklabels(unique_codes, rotation=45, ha='right')
ax.set_xlabel('Trigger code')
ax.set_ylabel('Count')
ax.set_title('Trigger counts per code')
plt.tight_layout()
plt.show()
```

### Missed trigger detection

Compare the number of stimulus triggers found against the expected count. If triggers were lost due to noise or serial port issues, this will flag the discrepancy:

```python
# Check expected vs actual stimulus trigger count
expected_total = EXPECTED_TRIALS_PER_RUN * EXPECTED_N_RUNS
n_missed = expected_total - n_stim

print(f"\nMissed trigger check:")
print(f"  Expected stimulus triggers: {expected_total} "
      f"({EXPECTED_TRIALS_PER_RUN} trials × {EXPECTED_N_RUNS} runs)")
print(f"  Found:    {n_stim}")
print(f"  Missing:  {n_missed}")

if n_missed > 0:
    print(f"  ⚠ {n_missed} stimulus triggers are missing!")
    print(f"    This may indicate corrupted triggers or serial port issues.")
    print(f"    Cross-check with behavioural log files to identify which trials.")
elif n_missed < 0:
    print(f"  ⚠ Found {abs(n_missed)} MORE triggers than expected!")
    print(f"    This may indicate duplicate or spurious triggers.")

# Per-run trigger count (if you can identify run boundaries from long gaps)
gap_threshold = 30  # seconds
stim_events = events[stim_mask]
stim_times_for_runs = stim_events[:, 0] / sfreq
iei_for_runs = np.diff(stim_times_for_runs)
run_boundaries = np.where(iei_for_runs > gap_threshold)[0]

# Split stimulus events into runs based on the gaps
run_starts = np.concatenate([[0], run_boundaries + 1])
run_ends = np.concatenate([run_boundaries + 1, [len(stim_events)]])
print(f"\nPer-run stimulus counts (detected {len(run_starts)} runs):")
for r, (s, e) in enumerate(zip(run_starts, run_ends)):
    count_in_run = e - s
    status = "✓" if count_in_run == EXPECTED_TRIALS_PER_RUN else "⚠"
    print(f"  Run {r+1}: {count_in_run} triggers {status}")
```

!!! tip "Compare with behavioural logs"
    Always cross-reference your EEG trigger counts with the behavioural log files from your stimulus presentation software. Mismatches indicate a problem with trigger sending or recording.

---

## 3. Trigger timing

Verify that triggers arrive at the expected intervals and identify run boundaries:

```python
# Compute inter-event intervals for stimulus triggers
stim_events = events[stim_mask]
stim_times = stim_events[:, 0] / sfreq
iei = np.diff(stim_times)

print(f"\nInter-event intervals (stimulus triggers):")
print(f"  Mean: {iei.mean():.3f} s")
print(f"  Std:  {iei.std():.3f} s")
print(f"  Min:  {iei.min():.3f} s")
print(f"  Max:  {iei.max():.3f} s")

# Identify long gaps (potential run boundaries or pauses)
gap_threshold = 30  # seconds
long_gaps = np.where(iei > gap_threshold)[0]
if len(long_gaps) > 0:
    print(f"\n  Long gaps (>{gap_threshold}s) found at trials: "
          f"{long_gaps + 1} (durations: {iei[long_gaps]:.1f} s)")

# Plot timeline of all triggers
fig, ax = plt.subplots(figsize=(12, 3))
all_times = events[:, 0] / sfreq
all_codes = events[:, 2]
scatter = ax.scatter(all_times / 60, all_codes, c=all_codes, cmap='tab20',
                     s=5, alpha=0.7)
ax.set_xlabel('Time (minutes)')
ax.set_ylabel('Trigger code')
ax.set_title('Trigger timeline')

# Mark long gaps
for g in long_gaps:
    gap_time = stim_times[g + 1] / 60
    ax.axvline(gap_time, color='red', linestyle='--', alpha=0.5)

plt.tight_layout()
plt.show()
```

---

## 4. Photodiode delay analysis

This is the most important timing check. It compares the digital trigger times (sent from your experiment code) with the photodiode onsets (measuring when the screen actually changed). This procedure is based on the lab's standard QC approach.

### Why this matters

The digital trigger tells you *what* happened (which condition), but the photodiode tells you *when* it happened. The trigger is sent from software before the screen flip, while the photodiode measures the actual screen change. The delay between them reflects OS scheduling, GPU pipeline latency, and display input lag. A consistent delay is normal; **variable** delays indicate timing problems.

### Extract photodiode channel

```python
# Load the photodiode signal
photo_data, photo_times = raw.get_data(picks=PHOTODIODE_CH, return_times=True)
photo_data = np.squeeze(photo_data)  # Flatten to 1D
```

### Stage 1: Peak detection

Find photocell pulses using `scipy.signal.find_peaks()` with a high amplitude threshold:

```python
# Detect peaks above the 99th percentile of the signal amplitude
full_amp = photo_data.max() - photo_data.min()
height_thr = photo_data.min() + PHOTO_AMPLITUDE_PERCENTILE * full_amp
min_dist_samples = int(PHOTO_MIN_DISTANCE_S * sfreq)

peaks, _ = find_peaks(photo_data, height=height_thr, distance=min_dist_samples)
print(f"\nPhotodiode: found {len(peaks)} peaks")
```

### Stage 2: Onset refinement

Each peak is the top of a luminance transition. The actual onset is earlier — when the screen first started changing. We refine by sliding a window backwards from the peak and finding where the slope first exceeds a threshold:

```python
back_win = int(PHOTO_BACK_WINDOW_S * sfreq)
x = np.arange(PHOTO_SLOPE_WIN_SAMPLES)

onset_samples = []
for p in peaks:
    start = max(p - back_win, 0)
    onset = start  # Fallback if no slope exceeds threshold

    # Slide from start toward the peak
    for j in range(start, p - PHOTO_SLOPE_WIN_SAMPLES + 1):
        y = photo_data[j : j + PHOTO_SLOPE_WIN_SAMPLES]
        slope, _ = np.polyfit(x, y, 1)

        if slope > PHOTO_SLOPE_THRESHOLD:
            onset = j
            break

    onset_samples.append(onset)

photo_onsets = photo_times[onset_samples]
```

### Match triggers to photodiode onsets

Match each digital trigger to the nearest (unused) photodiode onset within a tolerance window:

```python
# Select the trigger events to match (e.g., stimulus onset triggers)
# Adjust the code(s) to match your experiment's photodiode events
photo_trigger_code = EXPECTED_TRIGGERS.get('fixation_post_stim', 81)
photo_trigger_mask = events[:, 2] == photo_trigger_code
trigger_times = events[photo_trigger_mask, 0] / sfreq

# Greedy nearest-unused matching
matched_photo = []
used = np.zeros(len(photo_onsets), dtype=bool)

for t in trigger_times:
    diffs = np.abs(photo_onsets - t)
    diffs[used] = np.inf
    idx = np.argmin(diffs)

    if diffs[idx] < PHOTO_MATCH_TOLERANCE_S:
        matched_photo.append(photo_onsets[idx])
        used[idx] = True
    else:
        matched_photo.append(np.nan)

matched_photo = np.array(matched_photo)
delays_s = matched_photo - trigger_times
delays_ms = delays_s * 1000

# Summary statistics
n_matched = np.sum(~np.isnan(delays_ms))
n_unmatched = np.sum(np.isnan(delays_ms))
outliers = delays_ms[delays_ms > PHOTO_OUTLIER_THRESHOLD_MS]

print(f"\nPhotodiode delay summary:")
print(f"  Matched:   {n_matched} / {len(trigger_times)}")
print(f"  Unmatched: {n_unmatched}")
print(f"  Mean delay: {np.nanmean(delays_ms):.2f} ms")
print(f"  Std delay:  {np.nanstd(delays_ms):.2f} ms")
print(f"  Min delay:  {np.nanmin(delays_ms):.2f} ms")
print(f"  Max delay:  {np.nanmax(delays_ms):.2f} ms")
print(f"  Outliers (>{PHOTO_OUTLIER_THRESHOLD_MS} ms): {len(outliers)}")
```

### Plot delay histogram

```python
fig, ax = plt.subplots(figsize=(6, 4))
valid_delays = delays_ms[~np.isnan(delays_ms)]
ax.hist(valid_delays, bins=20, edgecolor='black', color='steelblue')
mean_ms = np.nanmean(delays_ms)
std_ms = np.nanstd(delays_ms)
ax.axvline(mean_ms, ls='-', c='red', label=f'Mean ({mean_ms:.1f} ms)')
ax.axvline(mean_ms - std_ms, ls='--', c='red', alpha=0.5, label=f'±1 SD')
ax.axvline(mean_ms + std_ms, ls='--', c='red', alpha=0.5)
ax.set_xlabel('Delay: photodiode − trigger (ms)')
ax.set_ylabel('Count')
ax.set_title('Digital trigger to photodiode delay')
ax.legend(frameon=False)
plt.tight_layout()
plt.show()
```

!!! warning "Interpreting the delays"
    A **consistent delay** of ~8–17 ms (1 frame at 60 Hz) is normal and expected — it reflects the time between when the trigger is sent (before the flip) and when the screen actually updates. The key metric is the **standard deviation**: it should be small (< 2 ms). High variability or outliers indicate dropped frames or timing problems. See the [Creating EEG tasks](../eeg-task.md) page for strategies to minimise delays.

### Dropped frames and stimulus duration

Use the photodiode signal to verify that stimuli were on screen for the expected number of frames. A dropped frame manifests as a stimulus that lasted one frame longer than expected (because the GPU missed a VSync deadline and the old frame stayed on screen for an extra refresh cycle).

We measure the duration of each photodiode event by finding paired onset/offset transitions. If the photodiode is black during stimulus presentation, each "black" segment is one stimulus event:

```python
# Measure the duration of each photodiode event.
# We compute how long the signal stays in the "ON" (stimulus) state after each
# detected onset by finding where the signal drops back below threshold.

# Use a simple threshold at the midpoint of the signal range
photo_mid = (photo_data.max() + photo_data.min()) / 2

# For each onset, find when the signal drops back below the midpoint
event_durations_s = []
for onset_idx in onset_samples:
    # Search forward from onset for the offset (signal drops below midpoint)
    offset_idx = onset_idx
    while offset_idx < len(photo_data) and photo_data[offset_idx] > photo_mid:
        offset_idx += 1
    duration = (offset_idx - onset_idx) / sfreq
    event_durations_s.append(duration)

event_durations_s = np.array(event_durations_s)
event_durations_ms = event_durations_s * 1000

# Compare with expected stimulus duration
expected_ms = EXPECTED_STIM_DURATION_S * 1000
tolerance_ms = STIM_DURATION_TOLERANCE_S * 1000

# Flag events whose duration deviates from expected
duration_ok = np.abs(event_durations_ms - expected_ms) <= tolerance_ms
n_wrong_duration = np.sum(~duration_ok)
n_dropped_frames = np.sum(event_durations_ms > expected_ms + tolerance_ms)

print(f"\nStimulus duration check (expected: {expected_ms:.1f} ms):")
print(f"  Mean duration:    {event_durations_ms.mean():.2f} ms")
print(f"  Std duration:     {event_durations_ms.std():.2f} ms")
print(f"  Min duration:     {event_durations_ms.min():.2f} ms")
print(f"  Max duration:     {event_durations_ms.max():.2f} ms")
print(f"  Within tolerance: {duration_ok.sum()} / {len(event_durations_ms)}")
print(f"  Dropped frames:   {n_dropped_frames} "
      f"(events longer than {expected_ms + tolerance_ms:.1f} ms)")

if n_wrong_duration > 0:
    print(f"  ⚠ {n_wrong_duration} events have unexpected duration!")
```

```python
# Plot stimulus duration distribution
fig, ax = plt.subplots(figsize=(6, 4))
ax.hist(event_durations_ms, bins=30, edgecolor='black', color='steelblue')
ax.axvline(expected_ms, c='green', ls='-', lw=2, label=f'Expected ({expected_ms:.0f} ms)')
ax.axvline(expected_ms - tolerance_ms, c='green', ls='--', alpha=0.5)
ax.axvline(expected_ms + tolerance_ms, c='green', ls='--', alpha=0.5,
           label=f'±{tolerance_ms:.0f} ms tolerance')
# Mark where dropped frames would appear (1 extra frame = +16.7 ms at 60 Hz)
frame_ms = 1000 / 60
ax.axvline(expected_ms + frame_ms, c='orange', ls=':', lw=2,
           label=f'+1 frame ({expected_ms + frame_ms:.0f} ms)')
ax.set_xlabel('Stimulus duration (ms)')
ax.set_ylabel('Count')
ax.set_title('Stimulus duration from photodiode')
ax.legend(frameon=False, fontsize=8)
plt.tight_layout()
plt.show()
```

!!! info "Why dropped frames matter"
    A dropped frame means the stimulus was displayed for one extra refresh cycle (~16.7 ms at 60 Hz). For short stimuli (e.g., 50 ms = 3 frames), that is a 33% increase in presentation time. Occasional dropped frames are tolerable, but if many occur, investigate the cause (see [timing best practices](../eeg-task.md#timing-best-practices)). A few dropped frames per session are common; more than ~1% of trials is a concern.

<!--
__TODO__: [Andrea] An alternative approach to photodiode onset detection
is used in the chess-eeg pipeline: instead of peak detection + slope refinement,
it finds the black/white signal levels by detecting peaks in the histogram of
signal values, then identifies segments at each level with a tolerance. This may
be more robust when the photodiode signal has variable baseline. Compare both
methods and decide whether to recommend one or offer both as options.
-->

---

## 5. Channel quality

### Flat and noisy channels

Identify channels that are dead (flat) or excessively noisy based on signal variance:

```python
# Use a segment of raw data for quick computation
segment = raw.copy().crop(tmax=min(QC_SEGMENT_DURATION, raw.times[-1]))
eeg_picks = mne.pick_types(segment.info, eeg=True)
data = segment.get_data(picks=eeg_picks)
ch_names = [segment.ch_names[i] for i in eeg_picks]

# Compute variance per channel
ch_vars = np.var(data, axis=1)
median_var = np.median(ch_vars)
mean_var = np.mean(ch_vars)
std_var = np.std(ch_vars)

# Flag flat channels (variance < 1% of median)
flat_mask = ch_vars < FLAT_CHANNEL_THRESHOLD * median_var
flat_channels = [ch for ch, f in zip(ch_names, flat_mask) if f]

# Flag noisy channels (variance > 3 SD from mean)
noisy_mask = ch_vars > mean_var + NOISY_CHANNEL_SD * std_var
noisy_channels = [ch for ch, n in zip(ch_names, noisy_mask) if n]

print(f"\nChannel quality ({QC_SEGMENT_DURATION}s segment):")
print(f"  Flat channels:  {flat_channels or 'None'}")
print(f"  Noisy channels: {noisy_channels or 'None'}")
```

### Bridged electrodes

Bridged electrodes (connected by a gel bridge) show near-identical signals. Check pairwise correlations:

```python
# Compute correlation matrix on the QC segment
corr_matrix = np.corrcoef(data)

# Find highly correlated pairs (excluding diagonal)
np.fill_diagonal(corr_matrix, 0)
bridged_pairs = []
for i in range(len(ch_names)):
    for j in range(i + 1, len(ch_names)):
        if abs(corr_matrix[i, j]) > BRIDGE_CORRELATION_THRESHOLD:
            bridged_pairs.append(
                (ch_names[i], ch_names[j], corr_matrix[i, j]))

if bridged_pairs:
    print(f"\n⚠ Potentially bridged electrode pairs:")
    for ch1, ch2, r in bridged_pairs:
        print(f"    {ch1} – {ch2}: r = {r:.4f}")
else:
    print(f"\n  No bridged electrodes detected (threshold: |r| > "
          f"{BRIDGE_CORRELATION_THRESHOLD})")

# Plot correlation matrix
fig, ax = plt.subplots(figsize=(8, 7))
im = ax.imshow(corr_matrix, cmap='RdBu_r', vmin=-1, vmax=1, aspect='auto')
ax.set_title('Channel correlation matrix')
plt.colorbar(im, ax=ax, label='Pearson r')
plt.tight_layout()
plt.show()
```

### PSD overview

A quick spectral check to identify channels with abnormal frequency profiles:

```python
# Compute PSD for all EEG channels
fig = raw.compute_psd(fmax=100, picks='eeg').plot(show=False)
fig.suptitle('Power spectral density — all EEG channels')
plt.tight_layout()
plt.show()
```

!!! tip "What to look for in the PSD"
    - All channels should show a similar spectral profile with a 1/f shape
    - A clear 50 Hz peak (line noise) is expected and will be removed by the notch filter
    - Channels with a flat PSD (white noise) are likely dead
    - Channels with excessive power at all frequencies are likely noisy

### Line noise power

Quantify the strength of power line noise. Excessive line noise can indicate a grounding problem in the lab or a faulty electrode:

```python
# Compute PSD for all EEG channels on the QC segment
psd = segment.compute_psd(fmin=1, fmax=100, picks='eeg')
freqs = psd.freqs
psd_data = psd.get_data()  # shape: (n_channels, n_freqs)

# Find the 50 Hz bin and measure power relative to neighbours.
# We compare the power at 50 Hz to the average power in the surrounding
# 5 Hz bands (45-49 Hz and 51-55 Hz). A high ratio means strong line noise.
line_idx = np.argmin(np.abs(freqs - LINE_NOISE_FREQ))
neighbour_mask = ((freqs >= LINE_NOISE_FREQ - 5) & (freqs < LINE_NOISE_FREQ - 1)) | \
                 ((freqs > LINE_NOISE_FREQ + 1) & (freqs <= LINE_NOISE_FREQ + 5))

line_power = psd_data[:, line_idx]
neighbour_power = psd_data[:, neighbour_mask].mean(axis=1)

# Ratio > 10 means strong line noise; > 50 means severe
line_ratio = line_power / neighbour_power
mean_ratio = np.mean(line_ratio)
worst_ch_idx = np.argmax(line_ratio)
worst_ch = ch_names[worst_ch_idx]

print(f"\nLine noise ({LINE_NOISE_FREQ} Hz) check:")
print(f"  Mean {LINE_NOISE_FREQ} Hz / neighbour ratio: {mean_ratio:.1f}x")
print(f"  Worst channel: {worst_ch} ({line_ratio[worst_ch_idx]:.1f}x)")
if mean_ratio > 50:
    print(f"  ⚠ Severe line noise — check grounding and electrode connections")
elif mean_ratio > 10:
    print(f"  ⚠ Moderate line noise — will be removed by notch filter")
else:
    print(f"  ✓ Line noise within normal range")
```

### Signal saturation

Check if any channels clip at the ADC limits. BioSemi has a wide dynamic range, but saturation can still occur with very poor electrode contact:

```python
# Check for saturation: values at the extreme ends of the signal range.
# BioSemi uses 24-bit ADC, so true clipping is rare, but extreme values
# can indicate electrode problems.
full_data = segment.get_data(picks=eeg_picks)
ch_max = np.max(np.abs(full_data), axis=1)

# Flag channels where peak amplitude exceeds 500 µV (a conservative threshold
# for raw BioSemi data; adjust if your recordings typically have larger offsets)
SATURATION_THRESHOLD = 500e-6  # 500 µV
saturated_channels = [ch for ch, mx in zip(ch_names, ch_max)
                      if mx > SATURATION_THRESHOLD]

if saturated_channels:
    print(f"\n⚠ Channels with extreme amplitude (>{SATURATION_THRESHOLD*1e6:.0f} µV):")
    for ch in saturated_channels:
        idx = ch_names.index(ch)
        print(f"    {ch}: peak = {ch_max[idx]*1e6:.0f} µV")
else:
    print(f"\n  No saturated channels (all < {SATURATION_THRESHOLD*1e6:.0f} µV)")
```

---

## 6. Raw signal overview

A quick visual inspection of the raw EEG. Look for gross artifacts, disconnections, or saturation:

```python
# Plot a 10-second segment of raw EEG
raw.plot(duration=10, n_channels=30, scalings='auto',
         title='Raw EEG — quick visual inspection')
```

!!! info "What to look for"
    - **Flat lines**: dead channels (zero signal)
    - **Rail-to-rail saturation**: channels stuck at the maximum or minimum value
    - **Large movement artifacts**: sustained, high-amplitude deflections across many channels
    - **Regular 50 Hz noise**: expected, but check that it is not unusually strong

---

## 7. Per-participant summary

Generate a summary table for this participant:

```python
# Compile summary
summary = {
    'participant': bdf_files[0].parent.parent.name if bdf_files else 'unknown',
    'n_runs': len(bdf_files),
    'total_duration_s': round(duration_s, 1),
    'sampling_rate': sfreq,
    'n_eeg_channels': n_eeg,
    'n_total_events': len(events),
    'n_stimulus_events': int(stim_mask.sum()),
    'n_missed_triggers': n_missed,
    'n_dropped_frames': n_dropped_frames,
    'n_flat_channels': len(flat_channels),
    'n_noisy_channels': len(noisy_channels),
    'n_bridged_pairs': len(bridged_pairs),
    'n_saturated_channels': len(saturated_channels),
    'line_noise_ratio': round(mean_ratio, 1),
    'photodiode_mean_delay_ms': round(np.nanmean(delays_ms), 2),
    'photodiode_std_delay_ms': round(np.nanstd(delays_ms), 2),
    'photodiode_n_outliers': len(outliers),
    'photodiode_n_unmatched': n_unmatched,
    'stim_duration_mean_ms': round(event_durations_ms.mean(), 2),
    'stim_duration_std_ms': round(event_durations_ms.std(), 2),
}

print("\n" + "=" * 50)
print("QC SUMMARY")
print("=" * 50)
for key, val in summary.items():
    print(f"  {key:.<35} {val}")

# Optionally save to CSV for batch processing
# pd.DataFrame([summary]).to_csv('qc_summary_sub-01.csv', index=False)
```

### Mark bad channels

Based on the QC results, mark bad channels in the raw object for downstream preprocessing:

```python
bad_channels = list(set(flat_channels + noisy_channels))
raw.info['bads'] = bad_channels
print(f"\nMarked as bad: {raw.info['bads']}")
```

---

## 8. Photodiode-based event timing

Our recommended approach is to use photodiode onsets as the event times for epoching, because the photodiode directly measures when the screen changed — it is the ground truth. The digital triggers tell you *what* happened (condition), the photodiode tells you *when*.

To replace trigger times with photodiode onsets in the MNE events array:

```python
# Create a corrected events array using photodiode onsets
corrected_events = events[photo_trigger_mask].copy()

for i, (orig_event, photo_time) in enumerate(
        zip(corrected_events, matched_photo)):
    if not np.isnan(photo_time):
        # Replace the sample index with the photodiode onset sample
        corrected_events[i, 0] = int(photo_time * sfreq)

# Use corrected_events for epoching in the preprocessing step
# epochs = mne.Epochs(raw, corrected_events, ...)
```

!!! tip "Validate the correction"
    After replacing trigger times, verify that the delay distribution is now centred near 0 ms. The corrected events should have much less temporal jitter than the original trigger-based events.

<!--
__TODO__: [Andrea] Verify that photodiode-based epoching is the agreed standard
approach for the lab's analysis pipeline. Document the exact implementation once
confirmed, including how to handle unmatched events.
-->

<!--
__TODO__: [Andrea] In some experiments (e.g., chess-eeg), triggers can be
corrupted by noise, leading to missing or extra events. The chess-eeg pipeline
includes a "trigger reconstruction" step that matches the expected event
sequence from behavioural log files to the photocell signal, recovering correct
timing even when digital triggers are lost. Discuss whether this approach should
be documented as a standard procedure for the lab's QC pipeline and, if so, add
a dedicated section here.
-->

---

## Summary checklist

Before moving to preprocessing, verify that for each recording:

- [ ] All expected triggers are present (no missed triggers)
- [ ] No unexpected trigger codes
- [ ] Per-run trigger counts match the experimental design
- [ ] Stimulus timing is consistent (photodiode delays have low variability)
- [ ] No dropped frames (stimulus durations match expected values)
- [ ] Bad channels are identified and marked
- [ ] No bridged electrodes
- [ ] No saturated channels
- [ ] Line noise is within acceptable range
- [ ] The recording is of sufficient quality to proceed
- [ ] Any exclusion decisions are documented

---

## Recording-level exclusion criteria

Some recordings may be too problematic to analyse. Consider excluding a recording if:

- **More than ~10% of channels** are bad (for a 128-channel system, that is roughly 12+ channels)
- **Large portions of the continuous data** (> 30%) are dominated by movement artifacts
- **Triggers are missing or uninterpretable**, making it impossible to epoch the data correctly
- **The participant reported issues** (e.g., excessive discomfort, falling asleep)
- **Photodiode delays are highly variable** (SD > 5 ms) or many outliers are present
- **Many dropped frames** (> 1% of trials) indicate persistent timing problems

!!! info "Document your decisions"
    Keep a log of which recordings you exclude and why. This is important for transparency and for reporting in your paper's methods section. A simple spreadsheet tracking participant ID, recording quality notes, and inclusion/exclusion decisions works well.

---

<a id="complete-qc-script-1"></a>

??? example "Complete QC script"

    Copy and paste this complete script to run all QC checks on one participant:

    ```python
    """
    EEG Quality Control Script
    --------------------------
    Run this on raw BioSemi .bdf files BEFORE preprocessing.
    Checks: trigger inventory, photodiode timing, channel quality, raw signal.

    Usage:
        1. Adjust the configuration section below to match your experiment
        2. Run the script (e.g., in Spyder, Jupyter, or from the command line)
        3. Review the printed summary and diagnostic plots
    """

    import mne
    import numpy as np
    import matplotlib.pyplot as plt
    from scipy.signal import find_peaks
    from pathlib import Path
    import pandas as pd

    # -- Configuration ---------------------------------------------------------
    # Adjust these paths and parameters to match your experiment.
    # All thresholds are defined here so the script works without modification
    # once the configuration is set.

    bdf_files = sorted(Path('sourcedata/sub-01/eeg').glob('*.bdf'))

    PHOTODIODE_CH = 'Erg1'           # Photodiode is always on Erg1 in our lab
    STIM_CH = 'Status'               # BioSemi Status channel carries trigger codes
    EXCLUDE_CH = ['EXG5', 'EXG6', 'EXG7', 'EXG8',
                  'GSR1', 'GSR2', 'Erg2', 'Resp', 'Plet', 'Temp']

    # Expected trigger codes — should match your trigger_mapping.json
    EXPECTED_TRIGGERS = {
        'fixation_onset': 80,
        'stimulus_onset': 81,
        'fixation_post_stim': 82,
    }
    STIMULUS_TRIGGER_RANGE = (1, 79)   # Codes reserved for individual stimuli
    EXPECTED_TRIALS_PER_RUN = 200      # How many stimulus trials per run
    EXPECTED_N_RUNS = 4                # How many runs per participant
    EXPECTED_STIM_DURATION_S = 0.050   # Expected stimulus duration (e.g., 3 frames at 60 Hz)
    STIM_DURATION_TOLERANCE_S = 0.005  # Flag if duration deviates by more than 5 ms
    LINE_NOISE_FREQ = 50               # Power line frequency (Hz)

    # Photodiode onset detection parameters
    PHOTO_AMPLITUDE_PERCENTILE = 0.99  # Peak detection: 99th percentile threshold
    PHOTO_MIN_DISTANCE_S = 0.05        # Minimum 50 ms between consecutive peaks
    PHOTO_BACK_WINDOW_S = 0.020        # Search 20 ms before peak for true onset
    PHOTO_SLOPE_WIN_SAMPLES = 4        # Sliding window for slope computation
    PHOTO_SLOPE_THRESHOLD = 0.00085    # Slope threshold (V/sample) to detect onset
    PHOTO_MATCH_TOLERANCE_S = 0.2      # Max allowable trigger-to-photodiode gap
    PHOTO_OUTLIER_THRESHOLD_MS = 17    # Delays above this flagged as outliers

    # Channel quality thresholds
    FLAT_CHANNEL_THRESHOLD = 0.01      # Variance < 1% of median = flat/dead
    NOISY_CHANNEL_SD = 3               # Variance > 3 SD above mean = noisy
    BRIDGE_CORRELATION_THRESHOLD = 0.98  # |r| > 0.98 = possibly bridged by gel
    QC_SEGMENT_DURATION = 30           # Use 30 s of data for quick channel checks

    # -- 1. Load and describe the recording ------------------------------------
    # Load all BDF files for this participant. If there are multiple runs,
    # concatenate them into a single Raw object for unified QC.

    raws = []
    for f in bdf_files:
        r = mne.io.read_raw_bdf(str(f), preload=True, exclude=EXCLUDE_CH)
        raws.append(r)
        print(f"  {f.name}: {r.n_times / r.info['sfreq']:.1f} s")

    raw = mne.concatenate_raws(raws) if len(raws) > 1 else raws[0]
    sfreq = raw.info['sfreq']
    duration_s = raw.n_times / sfreq
    n_eeg = len(mne.pick_types(raw.info, eeg=True))
    print(f"\nSampling rate: {sfreq:.0f} Hz | Duration: {duration_s:.1f} s | "
          f"EEG channels: {n_eeg}")

    # -- 2. Trigger inventory --------------------------------------------------
    # Extract events from the BioSemi Status channel. The bitmask 0x00FF keeps
    # only the lower 8 bits (our trigger codes); upper bits are system flags.

    events = mne.find_events(raw, stim_channel=STIM_CH,
                             min_duration=0.001,
                             mask=0x00FF, mask_type='and')
    unique_codes, counts = np.unique(events[:, 2], return_counts=True)
    print(f"\nTrigger inventory ({len(events)} total events):")
    for code, count in zip(unique_codes, counts):
        print(f"  Code {code:>3}: {count:>5} events")

    # Identify stimulus triggers (codes within our reserved range)
    stim_mask = ((events[:, 2] >= STIMULUS_TRIGGER_RANGE[0]) &
                 (events[:, 2] <= STIMULUS_TRIGGER_RANGE[1]))
    n_stim = stim_mask.sum()
    expected_total = EXPECTED_TRIALS_PER_RUN * EXPECTED_N_RUNS
    n_missed = expected_total - n_stim
    print(f"Stimulus triggers: {n_stim} (expected {expected_total}, "
          f"missed {n_missed})")

    # -- 3. Trigger timing -----------------------------------------------------
    # Compute inter-event intervals to check whether stimuli arrive at the
    # expected pace and to identify pauses or run boundaries.

    stim_times = events[stim_mask, 0] / sfreq
    iei = np.diff(stim_times)
    print(f"\nInter-event intervals: mean={iei.mean():.3f}s, "
          f"std={iei.std():.3f}s, range=[{iei.min():.3f}, {iei.max():.3f}]s")

    # -- 4. Photodiode delay analysis ------------------------------------------
    # Compare digital trigger times with photodiode onsets to quantify the
    # delay between when the trigger was sent (software) and when the screen
    # actually changed (hardware). This delay is the sum of OS scheduling,
    # GPU rendering, and monitor input lag.

    # Stage 1: Detect photodiode peaks (high-amplitude luminance transitions)
    photo_data, photo_times = raw.get_data(picks=PHOTODIODE_CH,
                                           return_times=True)
    photo_data = np.squeeze(photo_data)

    full_amp = photo_data.max() - photo_data.min()
    height_thr = photo_data.min() + PHOTO_AMPLITUDE_PERCENTILE * full_amp
    min_dist = int(PHOTO_MIN_DISTANCE_S * sfreq)
    peaks, _ = find_peaks(photo_data, height=height_thr, distance=min_dist)

    # Stage 2: Refine each peak to find the true onset. The peak is the top
    # of the luminance ramp; the onset is when the ramp first began. We slide
    # a small window backwards from the peak and find where the slope first
    # exceeds our threshold.
    back_win = int(PHOTO_BACK_WINDOW_S * sfreq)
    x = np.arange(PHOTO_SLOPE_WIN_SAMPLES)
    onset_samples = []
    for p in peaks:
        start = max(p - back_win, 0)
        onset = start  # fallback if slope never exceeds threshold
        for j in range(start, p - PHOTO_SLOPE_WIN_SAMPLES + 1):
            y = photo_data[j : j + PHOTO_SLOPE_WIN_SAMPLES]
            slope, _ = np.polyfit(x, y, 1)
            if slope > PHOTO_SLOPE_THRESHOLD:
                onset = j
                break
        onset_samples.append(onset)
    photo_onsets = photo_times[onset_samples]

    # Match each digital trigger to the nearest unused photodiode onset.
    # Using greedy nearest-unused matching avoids double-counting.
    photo_trigger_code = EXPECTED_TRIGGERS.get('fixation_post_stim', 81)
    photo_trig_mask = events[:, 2] == photo_trigger_code
    trig_times = events[photo_trig_mask, 0] / sfreq

    matched_photo = []
    used = np.zeros(len(photo_onsets), dtype=bool)
    for t in trig_times:
        diffs = np.abs(photo_onsets - t)
        diffs[used] = np.inf  # prevent reusing already-matched onsets
        idx = np.argmin(diffs)
        if diffs[idx] < PHOTO_MATCH_TOLERANCE_S:
            matched_photo.append(photo_onsets[idx])
            used[idx] = True
        else:
            matched_photo.append(np.nan)  # no photodiode onset found
    matched_photo = np.array(matched_photo)

    # Compute the delay: positive = photodiode after trigger (expected)
    delays_ms = (matched_photo - trig_times) * 1000
    outliers = delays_ms[delays_ms > PHOTO_OUTLIER_THRESHOLD_MS]

    print(f"\nPhotodiode delays: mean={np.nanmean(delays_ms):.2f}ms, "
          f"std={np.nanstd(delays_ms):.2f}ms, "
          f"outliers(>{PHOTO_OUTLIER_THRESHOLD_MS}ms)={len(outliers)}")

    # Plot the delay distribution — a tight, unimodal histogram is what we want
    fig, ax = plt.subplots(figsize=(6, 4))
    valid = delays_ms[~np.isnan(delays_ms)]
    ax.hist(valid, bins=20, edgecolor='black', color='steelblue')
    m, s = np.nanmean(delays_ms), np.nanstd(delays_ms)
    ax.axvline(m, c='red', label=f'Mean ({m:.1f} ms)')
    ax.axvline(m - s, ls='--', c='red', alpha=0.5)
    ax.axvline(m + s, ls='--', c='red', alpha=0.5, label=f'±1 SD')
    ax.set_xlabel('Delay (ms)')
    ax.set_ylabel('Count')
    ax.set_title('Photodiode delay distribution')
    ax.legend(frameon=False)
    plt.tight_layout()
    plt.show()

    # -- Dropped frames --------------------------------------------------------
    # Measure stimulus duration from photodiode to detect dropped frames
    photo_mid = (photo_data.max() + photo_data.min()) / 2
    event_durations_ms = []
    for oi in onset_samples:
        offset_idx = oi
        while offset_idx < len(photo_data) and photo_data[offset_idx] > photo_mid:
            offset_idx += 1
        event_durations_ms.append((offset_idx - oi) / sfreq * 1000)
    event_durations_ms = np.array(event_durations_ms)
    expected_ms = EXPECTED_STIM_DURATION_S * 1000
    tolerance_ms = STIM_DURATION_TOLERANCE_S * 1000
    n_dropped_frames = np.sum(event_durations_ms > expected_ms + tolerance_ms)
    print(f"\nStimulus duration: mean={event_durations_ms.mean():.2f}ms, "
          f"std={event_durations_ms.std():.2f}ms, "
          f"dropped frames={n_dropped_frames}")

    # -- 5. Channel quality ----------------------------------------------------
    # Check for dead (flat), noisy, and bridged channels using a short segment
    # of raw data. We use a short segment because these checks don't need the
    # full recording and are faster on less data.

    seg = raw.copy().crop(tmax=min(QC_SEGMENT_DURATION, raw.times[-1]))
    eeg_picks = mne.pick_types(seg.info, eeg=True)
    data = seg.get_data(picks=eeg_picks)
    ch_names = [seg.ch_names[i] for i in eeg_picks]

    # Flat channels: very low variance means the electrode lost contact
    ch_vars = np.var(data, axis=1)
    median_var = np.median(ch_vars)
    mean_var, std_var = np.mean(ch_vars), np.std(ch_vars)
    flat_channels = [c for c, v in zip(ch_names, ch_vars)
                     if v < FLAT_CHANNEL_THRESHOLD * median_var]

    # Noisy channels: abnormally high variance relative to the group
    noisy_channels = [c for c, v in zip(ch_names, ch_vars)
                      if v > mean_var + NOISY_CHANNEL_SD * std_var]

    # Bridged electrodes: near-identical signals due to a gel bridge
    corr_matrix = np.corrcoef(data)
    np.fill_diagonal(corr_matrix, 0)
    bridged_pairs = []
    for i in range(len(ch_names)):
        for j in range(i + 1, len(ch_names)):
            if abs(corr_matrix[i, j]) > BRIDGE_CORRELATION_THRESHOLD:
                bridged_pairs.append((ch_names[i], ch_names[j]))

    print(f"\nFlat channels:  {flat_channels or 'None'}")
    print(f"Noisy channels: {noisy_channels or 'None'}")
    print(f"Bridged pairs:  {bridged_pairs or 'None'}")

    # Line noise: compare 50 Hz power to surrounding frequencies
    psd = seg.compute_psd(fmin=1, fmax=100, picks='eeg')
    freqs = psd.freqs
    psd_data = psd.get_data()
    line_idx = np.argmin(np.abs(freqs - LINE_NOISE_FREQ))
    nb_mask = ((freqs >= LINE_NOISE_FREQ - 5) & (freqs < LINE_NOISE_FREQ - 1)) | \
              ((freqs > LINE_NOISE_FREQ + 1) & (freqs <= LINE_NOISE_FREQ + 5))
    mean_ratio = np.mean(psd_data[:, line_idx] / psd_data[:, nb_mask].mean(axis=1))
    print(f"Line noise ratio: {mean_ratio:.1f}x")

    # Saturation: channels with extreme amplitude
    SATURATION_THRESHOLD = 500e-6
    full_data = seg.get_data(picks=eeg_picks)
    ch_max = np.max(np.abs(full_data), axis=1)
    saturated_channels = [c for c, mx in zip(ch_names, ch_max) if mx > SATURATION_THRESHOLD]
    print(f"Saturated channels: {saturated_channels or 'None'}")

    # Mark bad channels so downstream preprocessing can interpolate them
    raw.info['bads'] = list(set(flat_channels + noisy_channels))

    # -- 6. Raw signal overview ------------------------------------------------
    # Quick visual check: look for gross artifacts, disconnections, saturation

    raw.plot(duration=10, n_channels=30, scalings='auto',
             title='Raw EEG — visual inspection')

    # -- 7. Summary ------------------------------------------------------------
    # Print a compact summary of all QC results for this participant

    n_unmatched = int(np.sum(np.isnan(delays_ms)))
    print("\nQC SUMMARY")
    print("-" * 40)
    print(f"  Runs:              {len(bdf_files)}")
    print(f"  Duration:          {duration_s:.1f} s ({duration_s/60:.1f} min)")
    print(f"  Sampling rate:     {sfreq:.0f} Hz")
    print(f"  EEG channels:      {n_eeg}")
    print(f"  Total events:      {len(events)}")
    print(f"  Stimulus events:   {n_stim} (expected {expected_total})")
    print(f"  Missed triggers:   {n_missed}")
    print(f"  Dropped frames:    {n_dropped_frames}")
    print(f"  Flat channels:     {len(flat_channels)}")
    print(f"  Noisy channels:    {len(noisy_channels)}")
    print(f"  Bridged pairs:     {len(bridged_pairs)}")
    print(f"  Saturated ch:      {len(saturated_channels)}")
    print(f"  Line noise ratio:  {mean_ratio:.1f}x")
    print(f"  Photo delay mean:  {np.nanmean(delays_ms):.2f} ms")
    print(f"  Photo delay std:   {np.nanstd(delays_ms):.2f} ms")
    print(f"  Photo outliers:    {len(outliers)}")
    print(f"  Photo unmatched:   {n_unmatched}")
    print(f"  Stim dur mean:     {event_durations_ms.mean():.2f} ms")
    print("-" * 40)
    ```

---

Now you are ready to **preprocess** your data. See the next guide: [:octicons-arrow-right-24: Preprocessing](eeg-preprocessing.md)
