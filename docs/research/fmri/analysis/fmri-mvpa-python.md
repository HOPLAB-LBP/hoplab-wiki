# Multivariate analysis in Python: RSA and decoding from an SPM GLM

!!! abstract "On this page"
    - **You need:** the standard SPM12 first-level folder of each participant (one beta per condition and run), ROI masks in the same space, and a table that describes your conditions.
    - **You get:** RSA with [rsatoolbox](https://rsatoolbox.readthedocs.io/) and decoding with [scikit-learn](https://scikit-learn.org/), per participant and for the group, with the reasons behind each step.
    - **Prefer MATLAB?** The same analyses with CoSMoMVPA are on the [MATLAB page](fmri-mvpa.md).

The code on this page works on any study that has a standard SPM first-level folder per participant. To run it on your data, you change the settings in step 1 and write a condition table; nothing else on the page refers to a particular design.

As an example we use the design of a study in the lab, in which chess players viewed 40 chessboards in the scanner ([chess-expertise-2025](https://github.com/costantinoai/chess-expertise-2025)). The data are simulated, but they are real SPM output: SPM12 fitted the GLM of every participant to simulated runs with the study's timing, and wrote the usual `SPM.mat`, `beta_*.nii`, `mask.nii` and `ResMS.nii`.

---

## The example study and its questions

Each board has three properties:

- **checkmate:** whether White can force mate (20 checkmate boards, 20 non-checkmate boards);
- **strategy:** the kind of plan that wins or would win (10 classes, five for checkmate boards and five for the others);
- **visual pair:** each checkmate board has a non-checkmate twin that differs by one or two pieces, so the 40 boards form 20 pairs that look almost the same.

Ten participants saw every board twice per run, for five runs. The question is which of these properties the activity patterns of a region carry. We look at two regions: primary visual cortex (V1) and dorsolateral prefrontal cortex (DLPFC), both from the [Glasser atlas](fmri-rois.md#hcp-glasser-parcellation-hcp-mmp10).

**RSA** asks whether the geometry of the patterns (which conditions evoke similar patterns and which evoke different ones) matches a model. **Decoding** asks whether a classifier can read a property from the patterns of a run it has not seen. The page runs both on the same data.

---

## What you need before you start

**A first-level GLM made for multivariate analysis**, fitted with SPM12, one folder per participant. Multivariate analyses need one beta per condition in every run, so that patterns from independent runs can be compared: give each condition its own regressor in each run (in SPM's batch, one `cond` per condition in every session). Fit the GLM on **unsmoothed** data, because smoothing blurs the fine-grained patterns these analyses read. The [scripting page](fmri-glm-script.md) shows how to set up a GLM in SPM.

**ROI masks** in the space of the GLM, as NIfTI files with 1 inside the region. See [Regions of interest](fmri-rois.md).

**A condition table** (`conditions.tsv`): one row per condition, a `condition` column with the name of its regressor in SPM, and one column for every property you want to test. For the example study:

| condition | checkmate | strategy | visual_pair |
|---|---|---|---|
| C1_Images_Frombeautiful | checkmate | 1 | 1 |
| C1_Images_SteinitzNN | checkmate | 1 | 2 |
| ... | ... | ... | ... |
| NC1_Images_Frombeautiful(Nomate) | non_checkmate | 6 | 1 |

The order of the rows is the order of the conditions in every RDM and plot, so put conditions that belong together next to each other.

**A participants table** (`participants.tsv`, as in [BIDS](https://bids-specification.readthedocs.io/en/stable/modality-agnostic-files.html#participants-file)) with a `participant_id` column.

The project folder of this page looks like this:

```text
project/
├── derivatives/spm-glm/
│   ├── sub-01/          SPM.mat, beta_0001.nii, beta_0002.nii, ..., mask.nii, ResMS.nii
│   └── ...
├── rois/
│   ├── V1_mask.nii
│   └── DLPFC_mask.nii
├── conditions.tsv
└── participants.tsv
```

??? info "What the code assumes about the SPM folder"

    The code reads only files that every SPM12 first-level analysis writes, under their default names:

    - `SPM.mat`, in which `SPM.xX.name` holds the name of every column of the design matrix and `SPM.Vbeta` the file of its beta;
    - `beta_XXXX.nii`, one per column, with NaN outside the analysis mask;

    Regressor names have SPM's standard form `Sn(<run>) <condition>*bf(<basis function>)`. With the canonical HRF there is one basis function, `bf(1)`; with time or dispersion derivatives, `bf(2)` and `bf(3)` are the derivatives, and the code keeps only `bf(1)`. Parametric modulators (`Sn(1) cond xparam^1*bf(1)`), confounds (`Sn(1) trans_x`) and run constants (`Sn(1) constant`) have names that are not in your condition table, so they are ignored.

    If your GLM models each trial separately (least-squares-all or least-squares-separate), average the trial betas of each condition within each run first, or give the trials of one condition the same name.

Install the packages in a [fresh environment](../../coding/index.md):

```bash
pip install rsatoolbox==0.3.2 nibabel scikit-learn statsmodels pandas matplotlib
```

---

## 1. Settings and tables

Everything specific to a study is in this block.

```python
import re
from pathlib import Path

import matplotlib
import matplotlib.pyplot as plt
import nibabel as nib
import numpy as np
import pandas as pd
import scipy.io

GLM = "derivatives/spm-glm/{participant}"  # (1)!
ROIS = {"V1": "rois/V1_mask.nii", "DLPFC": "rois/DLPFC_mask.nii"}  # (2)!
MODELS = ["checkmate", "strategy", "visual_pair"]  # (3)!
TICK_COLOUR_BY, TICK_SHADE_BY = "checkmate", "strategy"  # (4)!
MDS_COLOUR_BY = {"V1": "visual_pair", "DLPFC": "checkmate"}  # (5)!
MDS_LINK_BY = "visual_pair"  # (6)!

conditions = pd.read_csv("conditions.tsv", sep="\t")
participants = pd.read_csv("participants.tsv", sep="\t")["participant_id"].tolist()
print(conditions.head(4))
print(f"{len(conditions)} conditions, {len(participants)} participants")
```

1. The SPM folder of each participant, with `{participant}` where the participant ID goes. If your GLMs are in, say, `derivatives/fmriprep-spm/sub-01/exp/`, write `"derivatives/fmriprep-spm/{participant}/exp"`.
2. One mask per region, in the space of the GLM.
3. The columns of `conditions.tsv` to test, one model RDM and one decoding analysis each.
4. The bars along the edges of every RDM plot take one colour per value of `TICK_COLOUR_BY` and, within each colour, a lighter or darker shade per value of `TICK_SHADE_BY` (set it to `None` for one shade). Here: orange for checkmate boards, blue for the others, and one shade per strategy.
5. For each region, the column used to colour the conditions in its MDS plot (step 9): pick the property you expect that region to carry, so you can see whether its conditions group together.
6. Optional: in the MDS plots, a thin grey line joins the conditions that share a value of this column. Set it to `None` for no lines.

??? example "Output"

    ```text
                                condition  checkmate  strategy  visual_pair
    0             C1_Images_Frombeautiful  checkmate         1            1
    1                C1_Images_SteinitzNN  checkmate         1            2
    2    C1_Images_WinterFriede(Reversed)  checkmate         1            3
    3  C2_Images_KekhayovPetrov(Reversed)  checkmate         2            4
    40 conditions, 10 participants
    ```

---

## 2. Find the betas in `SPM.mat`

SPM writes one `beta_XXXX.nii` per column of the design matrix, numbered in the order of the columns. `SPM.mat` holds the name of every column, such as `Sn(2) C1_Images_Frombeautiful*bf(1)`: run 2, the condition `C1_Images_Frombeautiful`, first basis function. We read these names to know which beta belongs to which condition and run.

```python
def read_betas(participant):
    """The condition betas in one SPM folder: file, run and condition of each."""
    folder = Path(GLM.format(participant=participant))
    SPM = scipy.io.loadmat(folder / "SPM.mat", simplify_cells=True)["SPM"]  # (1)!
    rows = []
    for name, beta in zip(SPM["xX"]["name"], SPM["Vbeta"]):
        match = re.fullmatch(r"Sn\((\d+)\) (.+)\*bf\(1\)", name)  # (2)!
        if match:
            rows.append({"file": folder / beta["fname"], "run": int(match[1]), "condition": match[2]})
    return pd.DataFrame(rows)


betas = read_betas(participants[0])
print(betas.groupby("run").head(2)[["run", "condition", "file"]].to_string())  # the first two betas of each run
```

1. `SPM.mat` files above 2 GB are saved in MATLAB's v7.3 format, which `scipy.io` cannot read. Read those with the [`mat73`](https://pypi.org/project/mat73/) package instead.
2. Keeps the regressors of the first basis function and splits each name into run and condition.

??? example "Output"

    ```text
         run                                       condition                                      file
    0      1     NC4_Images_StrekalovskyShaposhlikov(Nomate)  derivatives/spm-glm/sub-01/beta_0001.nii
    1      1    NC2_Images_SkujaRozenbergs(Nomate)(Reversed)  derivatives/spm-glm/sub-01/beta_0002.nii
    40     2     NC4_Images_StrekalovskyShaposhlikov(Nomate)  derivatives/spm-glm/sub-01/beta_0049.nii
    41     2           C3_Images_PodzerovKuntzevic(Reversed)  derivatives/spm-glm/sub-01/beta_0050.nii
    80     3                 NC3_Images_Replacement5(Nomate)  derivatives/spm-glm/sub-01/beta_0097.nii
    81     3               C5_Images_EasyPosition5(Reversed)  derivatives/spm-glm/sub-01/beta_0098.nii
    120    4  NC3_Images_PodzerovKuntzevic(Nomate)(Reversed)  derivatives/spm-glm/sub-01/beta_0145.nii
    121    4                NC1_Images_Frombeautiful(Nomate)  derivatives/spm-glm/sub-01/beta_0146.nii
    160    5                 NC3_Images_Replacement5(Nomate)  derivatives/spm-glm/sub-01/beta_0193.nii
    161    5                         C5_Images_EasyPosition2  derivatives/spm-glm/sub-01/beta_0194.nii
    ```

The first two betas of each run belong to different conditions. SPM numbers the columns in the order the conditions were entered for each run, and many lab scripts enter them in the order they first appear in that run's events file, which changes from run to run. **Never pick betas by their number**: always match them by name.

Before loading any data, check that the SPM folders and the condition table fit together:

```python
for participant in participants:
    found = read_betas(participant)
    missing = set(conditions["condition"]) - set(found["condition"])
    assert not missing, f"{participant}: not in SPM.mat: {sorted(missing)[:3]}"  # (1)!
    runs = found[found["condition"].isin(conditions["condition"])].groupby("condition")["run"].nunique()
    assert runs.min() >= 2, f"{participant}: some conditions are in fewer than 2 runs"  # (2)!
    print(participant, f"{found['run'].nunique()} runs, {len(found)} betas,",
          f"ignored: {sorted(set(found['condition']) - set(conditions['condition']))[:3]}")  # (3)!
```

1. Every condition of the table must have betas. If this fails, the names in `conditions.tsv` differ from the regressor names in SPM; print `found["condition"].unique()` to compare them.
2. Crossnobis and decoding compare patterns across runs, so every condition needs a beta in at least two runs.
3. Regressor names that are not in the table, which the analysis leaves out. Check that nothing you need is there.

??? example "Output"

    ```text
    sub-01 5 runs, 200 betas, ignored: []
    sub-02 5 runs, 200 betas, ignored: []
    sub-03 5 runs, 200 betas, ignored: []
    sub-04 5 runs, 200 betas, ignored: []
    sub-05 5 runs, 200 betas, ignored: []
    sub-06 5 runs, 200 betas, ignored: []
    sub-07 5 runs, 200 betas, ignored: []
    sub-08 5 runs, 200 betas, ignored: []
    sub-09 5 runs, 200 betas, ignored: []
    sub-10 5 runs, 200 betas, ignored: []
    ```

---

## 3. Load the patterns of each ROI

For every participant we read each beta once, keep the voxels of each ROI, and store the result as an rsatoolbox `Dataset`: one row per beta (condition × run), one column per voxel, and the condition, run and properties of every row as descriptors.

```python
from rsatoolbox.data import Dataset

masks = {roi: np.asarray(nib.load(path).dataobj) > 0 for roi, path in ROIS.items()}
position = {name: i for i, name in enumerate(conditions["condition"])}  # (1)!


def load_participant(participant):
    """One Dataset per ROI: a row per beta, a column per voxel."""
    betas = read_betas(participant).merge(conditions, on="condition", validate="many_to_one")  # (2)!
    volumes = [np.asarray(nib.load(file).dataobj) for file in betas["file"]]
    data = {}
    for roi, mask in masks.items():
        patterns = np.stack([volume[mask] for volume in volumes])
        patterns = patterns[:, np.isfinite(patterns).all(axis=0)]  # (3)!
        descriptors = {"condition": betas["condition"].map(position).to_numpy(), "run": betas["run"].to_numpy()}
        descriptors.update({column: betas[column].to_numpy() for column in MODELS})
        data[roi] = Dataset(patterns, obs_descriptors=descriptors)
    return data


data = {participant: load_participant(participant) for participant in participants}  # (4)!
for participant in participants:
    print(participant, {roi: data[participant][roi].measurements.shape for roi in ROIS})
```

1. Each condition is stored as its row number in `conditions.tsv`. rsatoolbox sorts conditions by this value, so every RDM follows the order of the table.
2. Attaches the properties of each condition to its betas. `validate` stops with an error if a condition appears twice in the table; regressors that are not in the table are dropped.
3. Voxels outside SPM's analysis mask have no estimate (NaN). SPM drops voxels with a low signal, often at the edge of the brain, so the number of voxels differs a little between participants.
4. Reads every beta of every participant. This takes a few minutes, most of it reading the files.

??? example "Output"

    ```text
    sub-01 {'V1': (200, 2813), 'DLPFC': (200, 7896)}
    sub-02 {'V1': (200, 2654), 'DLPFC': (200, 7435)}
    sub-03 {'V1': (200, 2748), 'DLPFC': (200, 7753)}
    sub-04 {'V1': (200, 2859), 'DLPFC': (200, 8107)}
    sub-05 {'V1': (200, 2658), 'DLPFC': (200, 7621)}
    sub-06 {'V1': (200, 2794), 'DLPFC': (200, 7885)}
    sub-07 {'V1': (200, 2627), 'DLPFC': (200, 7398)}
    sub-08 {'V1': (200, 2735), 'DLPFC': (200, 7668)}
    sub-09 {'V1': (200, 2848), 'DLPFC': (200, 7899)}
    sub-10 {'V1': (200, 2736), 'DLPFC': (200, 7789)}
    ```

---

## 4. Build the model RDMs

A representational dissimilarity matrix (RDM) holds the dissimilarity of every pair of conditions. A model RDM states a hypothesis. For a property with categories, the model says that two conditions in the same category evoke similar patterns (dissimilarity 0) and two conditions in different categories evoke different patterns (1).

```python
from rsatoolbox.rdm import RDMs, compare


def label_rdm(labels):
    """0 for two conditions with the same label, 1 otherwise."""
    labels = np.asarray(labels)
    return (labels[:, None] != labels[None, :]).astype(float)  # (1)!


model_rdms = RDMs(
    np.stack([label_rdm(conditions[column]) for column in MODELS]),
    rdm_descriptors={"name": MODELS},
    pattern_descriptors={"condition": np.arange(len(conditions))},
)
overlap = compare(model_rdms, model_rdms, method="corr")  # (2)!
print(pd.DataFrame(overlap, index=MODELS, columns=MODELS).round(2))
```

1. For a property with numbers on a scale (size, number of pieces, a rating), use the difference between the two values instead: `np.abs(values[:, None] - values[None, :])`.
2. The correlation between every pair of model RDMs. Models that correlate make overlapping predictions, and a brain RDM that fits one will partly fit the other.

??? example "Output"

    ```text
                 checkmate  strategy  visual_pair
    checkmate         1.00      0.33        -0.16
    strategy          0.33      1.00        -0.05
    visual_pair      -0.16     -0.05         1.00
    ```

To plot the RDMs we use a small helper, `show_rdm`, that draws an RDM with a coloured bar along the left and bottom edges, set by `TICK_COLOUR_BY` and `TICK_SHADE_BY`. The later plots use it too.

```python
PALETTE = ["#fdb338", "#025196", *plt.cm.tab10.colors[2:]]  # orange and blue first, then tab10
KELLY = ["#F3C300", "#875692", "#F38400", "#A1CAF1", "#BE0032", "#C2B280", "#848482", "#008856", "#E68FAC", "#0067A5",
         "#F99379", "#604E97", "#F6A600", "#B3446C", "#DCD300", "#882D17", "#8DB600", "#654522", "#E25822", "#2B3D26"]


def colours_for(column):
    """One colour per condition, the same for conditions with the same value in this column."""
    values, levels = pd.factorize(conditions[column])
    if len(levels) <= 10:
        return np.array([matplotlib.colors.to_rgba(PALETTE[v]) for v in values])
    if len(levels) <= 20:  # (1)!
        return np.array([matplotlib.colors.to_rgba(KELLY[v]) for v in values])
    return plt.cm.turbo(np.linspace(0.05, 0.95, len(levels)))[values]


def tick_colours():
    """Bar colours: TICK_COLOUR_BY gives the colour, TICK_SHADE_BY a shade from light to full within it."""
    colours = colours_for(TICK_COLOUR_BY)
    if TICK_SHADE_BY:
        for _, group in conditions.groupby(TICK_COLOUR_BY, sort=False):
            shades = list(dict.fromkeys(group[TICK_SHADE_BY]))  # (2)!
            for row, value in zip(group.index, group[TICK_SHADE_BY]):
                alpha = (shades.index(value) + 1) / len(shades)
                position = conditions.index.get_loc(row)
                colours[position, :3] = 1 - alpha * (1 - colours[position, :3])  # mixed with white
    return colours


COLOURS = tick_colours()
n = len(conditions)


def show_rdm(ax, matrix, title):
    """An RDM with a coloured bar for every condition on the left and at the bottom."""
    ax.imshow(matrix, cmap="viridis", vmin=0, interpolation="nearest")
    w = max(1, n / 15)
    ax.imshow(COLOURS[:, None], extent=(-0.5 - 1.5 * w, -0.5 - 0.5 * w, n - 0.5, -0.5), interpolation="nearest")
    ax.imshow(COLOURS[None, :], extent=(-0.5, n - 0.5, n - 0.5 + 1.5 * w, n - 0.5 + 0.5 * w), interpolation="nearest")
    ax.set(xlim=(-0.5 - 1.5 * w, n - 0.5), ylim=(n - 0.5 + 1.5 * w, -0.5), xticks=[], yticks=[], title=title)
    for spine in ax.spines.values():
        spine.set_visible(False)
    ax.add_patch(plt.Rectangle((-0.5, -0.5), n, n, fill=False, lw=0.8))


fig, axes = plt.subplots(1, len(MODELS), figsize=(3.4 * len(MODELS), 3.6), squeeze=False)
for ax, name, matrix in zip(axes[0], MODELS, model_rdms.get_matrices()):
    show_rdm(ax, matrix, name)
plt.show()
```

1. These are twenty of Kenneth Kelly's colours of maximum contrast, chosen to be easy to tell apart. With more than 20 values, the colours come from one colour map, and neighbouring values look alike.
2. The shades follow the order in which the values first appear in the table, from light to full colour, as in the figures of the published study.

![The three model RDMs of the example: checkmate, strategy and visual pair](../../../assets/fmri-mvpa-python/model-rdms.png)

The boards are in the order of `conditions.tsv`: the 20 checkmate boards first, grouped by strategy, then their 20 non-checkmate twins in the same order. The checkmate model has two large blocks, the strategy model ten smaller blocks inside them, and the visual-pair model two diagonal lines that link each board to its twin. The models overlap. Strategy correlates with checkmate (0.33), because each strategy belongs to one side only, and visual pair correlates negatively with checkmate (−0.16), because the two boards of a pair always differ in checkmate.

---

## 5. Build the brain RDMs, two ways

The distance you choose can change the result. We compute it in two ways and compare them.

**Correlation distance (1 − r) on run-averaged patterns**, as in the published study. Average each condition's patterns over the runs, centre each voxel across conditions, and take 1 minus the Pearson correlation of every pair. It is simple and common, but noise never averages away completely, so even two conditions that evoke the same pattern get a distance above 0, and how far above depends on how noisy the averaged patterns are. A participant with noisier data, or with fewer runs, gets larger distances for reasons that have nothing to do with what the region represents.

**Crossnobis distance** ([Walther et al., 2016](https://doi.org/10.1016/j.neuroimage.2015.12.012)). For every pair of runs, take the difference between the two conditions' patterns in one run and multiply it with the same difference in the other run. The noise of one run is independent of the noise of another, so it cancels out on average: two conditions that evoke the same pattern get a distance of 0, give or take noise, and a distance above 0 means the patterns differ. Before that, the patterns are whitened with the noise covariance between voxels (the "nobis" part, from Mahalanobis), so that noisy voxels and voxels whose noise goes together count less. This makes the distances more reliable.

```python
from rsatoolbox.data import average_dataset_by
from rsatoolbox.data.noise import prec_from_measurements
from rsatoolbox.rdm import calc_rdm


def crossnobis_rdm(dataset):
    """Cross-validated Mahalanobis distances, with the runs as folds."""
    noise = prec_from_measurements(dataset, obs_desc="condition", method="shrinkage_diag")  # (1)!
    rdm = calc_rdm(dataset, method="crossnobis", descriptor="condition", cv_descriptor="run", noise=noise)
    rdm.descriptors = {}  # (2)!
    return rdm


def correlation_rdm(dataset):
    """As in the published study: average the runs, centre each voxel, 1 - Pearson r."""
    means, order, _ = average_dataset_by(dataset, "condition")
    means = means - means.mean(axis=0)  # (3)!
    return calc_rdm(Dataset(means, obs_descriptors={"condition": order}), method="correlation", descriptor="condition")


rdms = []
for participant in participants:
    for roi in ROIS:
        for distance, rdm in [("crossnobis", crossnobis_rdm(data[participant][roi])),
                              ("1 - r", correlation_rdm(data[participant][roi]))]:
            assert np.array_equal(rdm.pattern_descriptors["condition"], np.arange(n))  # (4)!
            rdm.rdm_descriptors.update(participant=[participant], roi=[roi], distance=[distance])
            rdms.append(rdm)
print(len(rdms), "RDMs")
```

1. The noise covariance between voxels, estimated from how each condition's patterns vary across runs, with shrinkage because there are more voxels than betas. SPM's residuals give a better estimate (see the box below), but SPM does not keep them by default, and the betas are always there.
2. `calc_rdm` stores the noise estimate with the RDM. Its size differs between participants (their ROIs have different numbers of voxels), and rsatoolbox cannot combine RDMs whose stored descriptors differ, so we drop it.
3. Centring each voxel removes the pattern shared by all conditions, as `center_data` does in CoSMoMVPA.
4. Checks that the RDM has every condition of the table, in the order of the table, and so in the order of the model RDMs.

??? info "Noise from SPM's residuals"

    The most accurate noise estimate uses the residuals of the GLM, the part of the signal the design does not explain. SPM deletes them after estimation. To keep them, run `spm_write_residuals(SPM, NaN)` in MATLAB after loading `SPM.mat`: it writes one `Res_XXXX.nii` per volume. Load the residuals of the ROI as an array of volumes × voxels and pass them to `rsatoolbox.data.noise.prec_from_residuals`, which replaces `prec_from_measurements` above. The residual files take as much space as the preprocessed runs, so delete them once you have the noise estimate.

Brain RDMs are hard to read on their raw scale: every pair of different conditions has a large distance, and the differences between pairs are small in comparison. We show them as percentiles instead, which is common in RSA papers: each distance is replaced by its rank among all the distances of that RDM, from 0 (the most similar pair) to 1 (the most different). The analyses use the raw distances.

```python
from rsatoolbox.rdm import rank_transform


def percentiles(rdm):
    """The RDM as a matrix of percentiles of its distances, for plotting."""
    ranked = rank_transform(rdm)
    return ranked.get_matrices()[0] / ranked.dissimilarities.max()


def pick(participant, roi, distance):
    """The RDM of one participant, region and distance."""
    return next(r for r in rdms if (r.rdm_descriptors["participant"][0], r.rdm_descriptors["roi"][0],
                                    r.rdm_descriptors["distance"][0]) == (participant, roi, distance))


fig, axes = plt.subplots(len(ROIS), 2, figsize=(7.2, 3.7 * len(ROIS)), squeeze=False)
for row, roi in zip(axes, ROIS):
    for ax, distance in zip(row, ["1 - r", "crossnobis"]):
        show_rdm(ax, percentiles(pick(participants[0], roi, distance)), f"{roi}, {distance}")
plt.show()
```

![The RDMs of one participant in V1 and DLPFC as percentiles, with correlation distance on the left and crossnobis distance on the right](../../../assets/fmri-mvpa-python/brain-rdms.png)

In DLPFC, both RDMs have darker blocks along the diagonal: boards with the same strategy evoke more similar patterns. The blocks are sharper with crossnobis. In V1, crossnobis shows faint diagonal lines where each board meets its twin; with 1 − r they are hard to see. The RDM of a single participant is noisy, so this is about as much structure as you can expect to see in one.

---

## 6. Compare the brain RDMs with the models

For each participant, region and distance we correlate the brain RDM with each model RDM. A higher correlation means the model describes the geometry better.

```python
rows = []
for rdm in rdms:
    fit = compare(model_rdms, rdm, method="corr")[:, 0]  # (1)!
    descriptors = {key: value[0] for key, value in rdm.rdm_descriptors.items() if key != "index"}
    rows += [{**descriptors, "model": model, "r": value} for model, value in zip(MODELS, fit)]
rsa = pd.DataFrame(rows)

print(rsa.pivot_table(index="participant", columns=["distance", "roi", "model"], values="r").round(2).to_string())
```

1. The Pearson correlation between the model RDM and the brain RDM, over all pairs of conditions, as in the published study. Rank correlations (Kendall's tau-a, `method="tau-a"`) are the safer choice when a model only predicts the order of the distances ([Nili et al., 2014](https://doi.org/10.1371/journal.pcbi.1003553)).

??? example "Output"

    ```text
    distance        1 - r                                                     crossnobis
    roi             DLPFC                             V1                           DLPFC                             V1
    model       checkmate strategy visual_pair checkmate strategy visual_pair  checkmate strategy visual_pair checkmate strategy visual_pair
    participant
    sub-01           0.28     0.29       -0.00     -0.09    -0.03        0.26       0.38     0.39       -0.06     -0.10    -0.04        0.27
    sub-02           0.15     0.10       -0.02      0.01    -0.03        0.07       0.18     0.16       -0.04     -0.01    -0.03        0.08
    sub-03           0.22     0.22        0.03     -0.01     0.02        0.19       0.27     0.25        0.00     -0.02    -0.02        0.18
    sub-04           0.46     0.40       -0.08      0.01     0.04        0.26       0.49     0.48       -0.09      0.01     0.04        0.30
    sub-05           0.12     0.08       -0.03     -0.09    -0.07        0.09       0.19     0.16       -0.04     -0.06    -0.04        0.12
    sub-06           0.28     0.26       -0.07     -0.03     0.01        0.16       0.35     0.31       -0.09     -0.05     0.01        0.18
    sub-07           0.11     0.14       -0.01     -0.01     0.01        0.07       0.18     0.18       -0.03      0.01     0.03        0.05
    sub-08           0.17     0.16        0.02     -0.01    -0.03        0.18       0.21     0.24       -0.00     -0.04    -0.01        0.19
    sub-09           0.41     0.31       -0.01     -0.01    -0.03        0.30       0.45     0.36       -0.07     -0.01    -0.04        0.27
    sub-10           0.24     0.22       -0.02     -0.05    -0.01        0.17       0.27     0.29       -0.03     -0.05     0.03        0.16
    ```

---

## 7. Test across participants

Each participant gives one value per region, model and distance. As in the published study, we test the group with a one-sided one-sample t-test against 0 (does the model fit better than chance?) and correct the p-values for the number of regions with the false discovery rate (FDR).

```python
from scipy import stats
from statsmodels.stats.multitest import fdrcorrection


def group_test(table, value, chance=0.0, by=("distance", "model")):
    """One-sided t-test against chance per region, FDR-corrected across regions."""
    rows = []
    for keys, d in table.groupby([*by, "roi"]):
        test = stats.ttest_1samp(d[value] - chance, 0, alternative="greater")
        rows.append({**dict(zip([*by, "roi"], keys)), "mean": d[value].mean(),
                     "sem": d[value].sem(), "t": test.statistic, "p": test.pvalue})
    out = pd.DataFrame(rows)
    out["p FDR"] = out.groupby(list(by))["p"].transform(lambda p: fdrcorrection(p)[1])  # (1)!
    return out


rsa_stats = group_test(rsa, "r")
print(rsa_stats.round(3).to_string(index=False))
```

1. One correction per model and distance, across the regions, as in the published study. Correcting across models too is stricter; say in your methods which family you corrected over.

??? example "Output"

    ```text
      distance       model   roi   mean   sem      t     p  p FDR
         1 - r   checkmate DLPFC  0.243 0.037  6.537 0.000  0.000
         1 - r   checkmate    V1 -0.028 0.012 -2.318 0.977  0.977
         1 - r    strategy DLPFC  0.218 0.032  6.870 0.000  0.000
         1 - r    strategy    V1 -0.013 0.010 -1.296 0.886  0.886
         1 - r visual_pair DLPFC -0.021 0.011 -1.931 0.957  0.957
         1 - r visual_pair    V1  0.175 0.026  6.699 0.000  0.000
    crossnobis   checkmate DLPFC  0.297 0.036  8.277 0.000  0.000
    crossnobis   checkmate    V1 -0.033 0.011 -3.101 0.994  0.994
    crossnobis    strategy DLPFC  0.283 0.034  8.436 0.000  0.000
    crossnobis    strategy    V1 -0.007 0.010 -0.693 0.747  0.747
    crossnobis visual_pair DLPFC -0.044 0.010 -4.361 0.999  0.999
    crossnobis visual_pair    V1  0.180 0.026  6.872 0.000  0.000
    ```

Both distances find the same three effects, all with an FDR-corrected p below .001: visual pair in V1 (crossnobis r = 0.180, 1 − r 0.175), and strategy and checkmate in DLPFC (crossnobis 0.283 and 0.297, 1 − r 0.218 and 0.243). No other model fits above 0. The negative values, such as visual pair in DLPFC (crossnobis −0.044), come from the overlap between the models: a region that separates checkmate from non-checkmate boards puts the two boards of every visual pair far apart, the opposite of what the visual-pair model predicts.

### How good can a model get? The noise ceiling

A correlation of 0.2 can be a poor fit or the best fit the data allow. The noise ceiling tells which ([Nili et al., 2014](https://doi.org/10.1371/journal.pcbi.1003553)). It estimates how well the true model, whatever it is, would correlate with each participant's RDM, from how much the participants agree with each other. Its upper bound correlates each participant with the mean RDM of all participants, that participant included; its lower bound, with the mean of the others. A model that reaches the lower bound explains as much as these data can show.

```python
from rsatoolbox.inference import boot_noise_ceiling
from rsatoolbox.rdm import concat

ceilings = []
for roi in ROIS:
    for distance in ["crossnobis", "1 - r"]:
        group = concat([pick(p, roi, distance) for p in participants])
        lower, upper = boot_noise_ceiling(group, method="corr", rdm_descriptor="participant")  # (1)!
        ceilings.append({"roi": roi, "distance": distance, "lower": lower, "upper": upper})
ceilings = pd.DataFrame(ceilings)
print(ceilings.round(3))
```

1. Uses the same comparison (`corr`) as the RSA, so the ceiling and the model fits are on the same scale.

??? example "Output"

    ```text
         roi    distance  lower  upper
    0     V1  crossnobis  0.091  0.361
    1     V1       1 - r  0.070  0.351
    2  DLPFC  crossnobis  0.274  0.465
    3  DLPFC       1 - r  0.177  0.407
    ```

```python
k = len(MODELS)
fig, axes = plt.subplots(1, 2, figsize=(4.2 * len(ROIS), 3.8), sharey=True)
for ax, distance in zip(axes, ["1 - r", "crossnobis"]):
    for r, roi in enumerate(ROIS):
        ceiling = ceilings[(ceilings["roi"] == roi) & (ceilings["distance"] == distance)].iloc[0]
        x0 = r * (k + 1)
        ax.fill_between([x0 - 0.5, x0 + k - 0.5], ceiling["lower"], ceiling["upper"], color="grey", alpha=0.25, lw=0)
        for m, model in enumerate(MODELS):
            values = rsa[(rsa["roi"] == roi) & (rsa["distance"] == distance) & (rsa["model"] == model)]["r"]
            ax.bar(x0 + m, values.mean(), color=plt.cm.tab10(m), alpha=0.8, width=0.8)
            ax.scatter(x0 + m + np.linspace(-0.2, 0.2, len(values)), values, s=8, color="black", zorder=3)
    ax.set_xticks([r * (k + 1) + m for r in range(len(ROIS)) for m in range(k)],
                  [f"{roi}\n{model}" for roi in ROIS for model in MODELS], fontsize=9, rotation=90)
    ax.axhline(0, color="black", lw=0.8)
    ax.set_title(distance)
    ax.spines[["top", "right"]].set_visible(False)
axes[0].set_ylabel("Pearson r with the brain RDM")
plt.show()
```

![Model fits per region for both distances: bars are means, dots are participants, grey bands are the noise ceilings](../../../assets/fmri-mvpa-python/rsa-results.png)

The two distances differ in their noise ceilings. Crossnobis RDMs agree more between participants, so their ceiling is higher: the lower bound is 0.274 in DLPFC, against 0.177 with 1 − r, and 0.091 in V1, against 0.070. The model fits rise with it. With both distances, the strategy and checkmate models reach the lower bound in DLPFC (crossnobis 0.283 and 0.297, 1 − r 0.218 and 0.243), so they explain about as much as these data can show; with crossnobis, the fits and the ceiling are both higher. Cross-validation removes the noise that 1 − r keeps in every distance, and the whitening gives noisy voxels less weight.

---

## 8. Decode the properties

Decoding trains a classifier on the patterns of some runs and tests it on a run it has not seen. We train one classifier per participant, region and property, leave each run out once, and average the accuracy over the folds, as in the published study.

Leaving a run out keeps the test patterns independent of the training patterns, but the test run shows the same conditions the classifier was trained on. Each condition evokes its own pattern, the same in every run, so a classifier can recognise the conditions themselves and then read any grouping of them, including properties the region does not represent. In our simulated data, a version with no property effects at all decodes every property above 1/k (one over the number of classes) in both regions. The theoretical chance level is therefore the wrong reference. We measure chance for each participant with a permutation test instead: shuffle which condition has which label, decode again, and repeat. The mean of these shuffled accuracies is that participant's chance level, and the group test asks whether the accuracies are above it.

```python
from joblib import Parallel, delayed
from sklearn.model_selection import LeaveOneGroupOut, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.svm import SVC

classifier = make_pipeline(StandardScaler(), SVC(kernel="linear"))  # (1)!
N_PERMUTATIONS = 100  # (2)!
rng = np.random.default_rng(0)


def accuracy(patterns, labels, runs):
    """Mean accuracy over the folds, leaving one run out at a time."""
    return cross_val_score(classifier, patterns, labels, groups=runs, cv=LeaveOneGroupOut()).mean()


rows = []
for participant in participants:
    for roi in ROIS:
        dataset = data[participant][roi]
        patterns, runs = dataset.measurements, dataset.obs_descriptors["run"]
        condition = dataset.obs_descriptors["condition"]  # the row of each beta in conditions.tsv
        for model in MODELS:
            label_of = conditions[model].to_numpy()  # the label of each condition
            shuffles = [rng.permutation(label_of) for _ in range(N_PERMUTATIONS)]
            null = Parallel(n_jobs=-1)(delayed(accuracy)(patterns, s[condition], runs) for s in shuffles)  # (3)!
            observed = accuracy(patterns, label_of[condition], runs)
            rows.append({"participant": participant, "roi": roi, "model": model, "accuracy": observed,
                         "chance": np.mean(null), "1/k": 1 / len(np.unique(label_of)),
                         "p": (1 + np.sum(np.array(null) >= observed)) / (1 + N_PERMUTATIONS)})
decoding = pd.DataFrame(rows)
decoding["above chance"] = decoding["accuracy"] - decoding["chance"]

print(decoding.groupby(["roi", "model"])[["accuracy", "chance", "1/k"]].mean().round(3))
decoding_stats = group_test(decoding, "above chance", by=("model",))  # (4)!
print(decoding_stats.round(3).to_string(index=False))
```

1. A linear support vector machine. `SVC(kernel="linear")` uses the same solver (libsvm) as CoSMoMVPA's `cosmo_classify_svm`, and is much faster than `LinearSVC` when there are more voxels than betas. The scaler is part of the pipeline, so its means and standard deviations are learned from the training runs only. Shrinkage LDA is a common alternative that takes the noise covariance between voxels into account.
2. 100 shuffles per participant, region and property keep the example to a few minutes. Use 1,000 or more for a final analysis.
3. Runs the shuffles in parallel on all processor cores. Each shuffle gives every condition a new label and keeps it in every run: the labels belong to conditions, not to single betas.
4. The same one-sided t-test as for RSA, on each participant's accuracy minus their own chance level, corrected across regions.

??? example "Output"

    ```text
                       accuracy  chance   1/k
    roi   model
    DLPFC checkmate       0.716   0.560  0.50
          strategy        0.307   0.184  0.10
          visual_pair     0.107   0.105  0.05
    V1    checkmate       0.540   0.550  0.50
          strategy        0.161   0.169  0.10
          visual_pair     0.128   0.100  0.05
          model   roi   mean   sem      t     p  p FDR
      checkmate DLPFC  0.156 0.035  4.449 0.001  0.002
      checkmate    V1 -0.011 0.008 -1.324 0.891  0.891
       strategy DLPFC  0.123 0.024  5.082 0.000  0.001
       strategy    V1 -0.008 0.007 -1.166 0.863  0.863
    visual_pair DLPFC  0.002 0.005  0.408 0.346  0.346
    visual_pair    V1  0.029 0.006  5.124 0.000  0.001
    ```

The chance levels from the permutations are above 1/k everywhere: on average 0.560 instead of 0.50 for checkmate in DLPFC, and 0.184 instead of 0.10 for strategy. Against these chance levels, checkmate and strategy are decoded in DLPFC (0.716 and 0.307) and visual pair in V1 (0.128, chance 0.100), all with an FDR-corrected p of .002 or below, and nothing else is. Against 1/k, strategy in V1 (0.161) and visual pair in DLPFC (0.107) would have looked like effects too, although neither region carries them.

---

## 9. Look at the RDMs

Plot the mean RDMs and their MDS before you trust any statistic: the tests give one number per model, and the RDMs show the structure behind those numbers. Multidimensional scaling (MDS) places every condition as a point in two dimensions so that the distances between the points follow the RDM as closely as possible: conditions with a small distance end up close together, and a block of small distances becomes a cluster. The [DNN tutorial](../../dnn/dnn-compare.md#look-at-your-rdms) explains how to read the two side by side.

```python
from sklearn.manifold import MDS

fig, axes = plt.subplots(2, len(ROIS), figsize=(3.6 * len(ROIS), 7.6), squeeze=False)
for col, roi in enumerate(ROIS):
    mean = concat([pick(p, roi, "crossnobis") for p in participants]).mean()
    show_rdm(axes[0, col], percentiles(mean), f"{roi}, mean of {len(participants)}")
    xy = MDS(n_components=2, dissimilarity="precomputed", random_state=0, n_init=4).fit_transform(percentiles(mean))  # (1)!
    if MDS_LINK_BY:
        for value in conditions[MDS_LINK_BY].unique():  # (2)!
            members = np.flatnonzero(conditions[MDS_LINK_BY].to_numpy() == value)
            axes[1, col].plot(*xy[members].T, color="grey", lw=0.6, zorder=0)
    axes[1, col].scatter(*xy.T, color=colours_for(MDS_COLOUR_BY[roi]), s=40, edgecolor="black", lw=0.5)  # (3)!
    axes[1, col].set(xticks=[], yticks=[], aspect="equal", xlabel=f"colour: {MDS_COLOUR_BY[roi]}")
axes[1, 0].set_ylabel("MDS")
plt.show()
```

1. MDS of the percentiles, the same matrix as the RDM above it. On the raw distances, every pair of different conditions is far apart and the differences between pairs are small, so MDS places all conditions on a ring and hides the structure. Percentiles keep the order of the distances and remove that common offset.
2. Joins the conditions that share a value of `MDS_LINK_BY`, here the two boards of each visual pair. Short lines mean that the region gives the two boards similar patterns.
3. Each region's points are coloured by the property in `MDS_COLOUR_BY`: in V1 the visual pair (the two boards of a pair share a colour), in DLPFC checkmate or not.

![Mean crossnobis RDMs of V1 and DLPFC as percentiles, with the MDS of each below](../../../assets/fmri-mvpa-python/rdm-mds.png)

In DLPFC, the mean RDM splits into the checkmate and the non-checkmate halves, with a darker block for each strategy inside them, and the MDS shows the same split as two groups of points. The grey lines between visual twins are long and cross from one group to the other: DLPFC gives the two boards of a pair different patterns, because they differ in checkmate. V1 has no blocks, only darker diagonals where each board meets its twin, and in its MDS most twins sit close together, joined by short lines. MDS squeezes 40 conditions into two dimensions, so some distances are bent to fit. Use it to see the structure, and keep the statistics on the RDMs.

---

## Good practice

??? warning "Models that overlap"

    The three models are not independent (step 4). Strategy is nested in checkmate, so a region that only separates checkmate from non-checkmate boards also fits the strategy model, and the other way round. Both fit DLPFC here, and these analyses alone cannot tell whether DLPFC carries strategy beyond checkmate. To ask that, test the strategy model within one side (for example only the checkmate boards, as the published study did in a follow-up analysis), or fit the models together and look at the unique contribution of each, for example with rsatoolbox's `ModelWeighted` or a regression of the brain RDM on all model RDMs.

??? warning "Above zero is not the best model"

    A model that correlates above 0 with the brain RDMs is not necessarily the model the region uses. Several models can all fit above 0, and a model can be significant while far below the noise ceiling. To claim that one model is better than another, compare them directly, for example with a paired test of their fits per participant, or with `rsatoolbox.inference.eval_dual_bootstrap` as on the [DNN page](../../dnn/dnn-compare.md).

??? info "What the tests generalise to"

    A t-test across participants generalises to new participants from the same population, for these conditions. It does not generalise to new stimuli: a different set of chess positions could give a different result. rsatoolbox's `eval_dual_bootstrap` resamples participants and conditions together when you want both. For decoding, a t-test against chance says that the information is present on average in the group; it does not say that most participants have it ([Allefeld et al., 2016](https://doi.org/10.1016/j.neuroimage.2016.07.040)).

??? tip "Running it on your own data"

    1. Fit a first-level GLM per participant with one regressor per condition and run, on unsmoothed data.
    2. Write `conditions.tsv`: the regressor names in a `condition` column, and one column per property you want to test.
    3. Set `GLM`, `ROIS`, `MODELS` and the plot settings in step 1.
    4. Run the check at the end of step 2 and fix any mismatch it reports.

    The rest runs as written. If your GLM is in each participant's native space, the ROI masks must be in that space too: give `ROIS` a `{participant}` placeholder as well and fill it in where the masks are loaded.

---

## What to report

- The GLM: one regressor per condition and run, HRF, confounds, smoothing (none), high-pass filter.
- The ROIs: atlas and version, how they were brought into the space of the data, and the number of voxels per participant.
- The dissimilarity measure, the noise estimate for crossnobis, and the comparison between RDMs (Pearson, Spearman or tau-a).
- The group tests, the correction for multiple comparisons and over which family.
- The noise ceiling next to the model fits.
- For decoding: classifier, cross-validation scheme, and how the chance level was measured (number of permutations).
- The software versions (rsatoolbox, scikit-learn) and the code.

---

## Where next?

<div class="grid cards" markdown>

- :material-brain: **Compare with a network**

    ---

    Use the same brain RDMs to test the layers of a deep network.

    [Compare with human data](../../dnn/dnn-compare.md)

- :material-language-matlab: **The MATLAB route**

    ---

    Decoding and RSA with CoSMoMVPA.

    [Multivariate analysis in MATLAB](fmri-mvpa.md)

</div>
