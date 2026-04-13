# Anonymize your fMRI data for sharing

Before sharing an fMRI dataset (e.g., via [RDR](../../rdm/RDR_sharing.md)), you must remove all personally identifiable information (PII). This page gives you a single, clear pipeline to follow.

## When to anonymize

Anonymize **right after [BIDS conversion](fmri-bids-conversion.md)**, before preprocessing (fMRIPrep, SPM, etc.).

!!! warning "Deface raw data, not preprocessed data"
    Defacing tools (pydeface, mri_deface, afni_refacer_run) are designed to work on **raw T1w images in native scanner coordinates**. They use face-detection algorithms calibrated for standard anatomical orientations. Running them on already-preprocessed data (fMRIPrep outputs, FreeSurfer surfaces, etc.) may fail or produce incorrect results because the coordinate system and voxel intensities have been altered.

    **Always deface the raw BIDS T1w images first, then run your preprocessing pipeline on the defaced data.**

This is safe because:

- [fMRIPrep](https://fmriprep.org/) was developed and tested ["almost exclusively using defaced data"](https://neurostars.org/t/is-how-much-fmriprep-freesurfer-et-al-is-resilient-to-defacing/2642) (Chris Gorgolewski, fMRIPrep developer)
- A [multisite comparison](https://www.frontiersin.org/journals/psychiatry/articles/10.3389/fpsyt.2021.617997/full) (Theyers et al., 2021) confirmed preprocessing results are effectively identical with defaced inputs
- The [BIDS FAQ](https://bids.neuroimaging.io/faq/mri.html) recommends this approach
- Preprocessing tools [do not use](https://github.com/nipreps/fmriprep/issues/2067) any of the metadata fields you will remove

Anonymizing early minimises the non-anonymized surface and prevents accidental sharing of identifiable data.

### Reproducibility note

While the studies above show that defacing has **minimal impact** on downstream results, it is not zero. Small differences in brain extraction, spatial normalization, and cortical surface reconstruction can occur because defacing alters voxels near the face/skull boundary. These differences are typically negligible for group-level analyses but should be documented:

- In your **RDR README**: mention that the shared raw data is defaced, and that results were originally computed from non-defaced data
- In your **code repository**: note that reproducing the full pipeline from the shared raw data may produce small floating-point differences compared to the published results
- In your **manuscript** (if applicable): state that data was defaced for sharing and reference the validation literature above

This is standard practice — most shared fMRI datasets are defaced, and the community considers the trade-off acceptable.

## The pipeline

```
DICOM → dcm2niix (with -ba y) → BIDS → Anonymize → Validate → Preprocess
                                          ↑ you are here
```

### Step 1: Deface structural images and scrub metadata with BIDSonym

[BIDSonym](https://peerherholz.github.io/BIDSonym/) is a [BIDS App](https://bids-apps.neuroimaging.io/) that handles the full anonymization pipeline in one pass: defacing structural images, scrubbing PII from JSON sidecars, and cleaning NIfTI headers. It was [explicitly designed](https://peerherholz.github.io/BIDSonym/usage.html) to run right after BIDS conversion.

```bash
# Install (Docker required)
docker pull peerherholz/bidsonym

# Run on your BIDS dataset
docker run -it --rm \
    -v /path/to/your/BIDS:/bids_dataset \
    peerherholz/bidsonym /bids_dataset participant \
    --deid pydeface \
    --del_meta AcquisitionDateTime,AcquisitionTime,DeviceSerialNumber,StationName,InstitutionAddress,InstitutionalDepartmentName,ProcedureStepDescription \
    --brainextraction bet \
    --check_meta
```

This will:

- **Deface** all T1w images using [pydeface](https://github.com/poldracklab/pydeface) (other options: `mri_deface`, `quickshear`, `mridefacer`)
- **Remove the listed metadata fields** from all JSON sidecars
- **Check for remaining PII** in JSON files (`--check_meta` flag)
- **Back up originals** to `sourcedata/bidsonym/` before modifying

!!! note "Without Docker"
    If Docker is not available, you can run the steps manually (see below). BIDSonym also supports [Singularity/Apptainer](https://peerherholz.github.io/BIDSonym/installation.html).

??? info "Manual alternative (without BIDSonym)"

    **1a. Deface with pydeface:**

    ```python
    import subprocess, glob

    for f in sorted(glob.glob('BIDS/sub-*/anat/*_T1w.nii.gz')):
        subprocess.run(['pydeface', f, '--outfile', f, '--force'], check=True)
    ```

    **1b. Remove PII from JSON sidecars:**

    ```python
    import json, glob

    BIDS = '/path/to/your/BIDS'

    # Fields to remove (identifiable but not needed for preprocessing)
    pii_fields = [
        'AcquisitionDateTime', 'AcquisitionTime',
        'DeviceSerialNumber', 'StationName',
        'InstitutionAddress', 'InstitutionalDepartmentName',
        'ProcedureStepDescription', 'BidsGuess',
    ]

    for f in sorted(glob.glob(f'{BIDS}/sub-*/anat/*.json') +
                    glob.glob(f'{BIDS}/sub-*/func/*.json')):
        with open(f) as fh:
            data = json.load(fh)
        for key in pii_fields:
            data.pop(key, None)
        with open(f, 'w') as fh:
            json.dump(data, fh, indent='\t', ensure_ascii=False)
            fh.write('\n')
    ```

    **Do not remove** `RepetitionTime`, `EchoTime`, `SliceTiming`, `PhaseEncodingDirection`, `TotalReadoutTime`, `Manufacturer`, or `MagneticFieldStrength` -- these are [needed by fMRIPrep](https://fmriprep.org/en/stable/usage.html) and for methods reporting.

### Step 2: Visually inspect defaced images

**Always visually check every defaced image.** Open them in [MRIcroGL](https://www.nitrc.org/projects/mricrogl) or [fsleyes](https://fsl.fmrib.ox.ac.uk/fsl/fslwiki/FSLeyes) and verify the face is removed while brain tissue is intact.

??? tip "Batch visual QC script"
    Render mid-sagittal slices for all subjects to quickly spot failures:

    ```python
    import nibabel as nib
    import numpy as np
    import matplotlib.pyplot as plt
    import glob

    for f in sorted(glob.glob('BIDS/sub-*/anat/*_T1w.nii.gz')):
        img = nib.as_closest_canonical(nib.load(f))
        data = img.get_fdata()
        mid = data.shape[0] // 2
        plt.figure(figsize=(4, 5))
        plt.imshow(np.rot90(data[mid, :, :]), cmap='gray')
        plt.title(f.split('/')[-1].split('_')[0])
        plt.axis('off')
        plt.savefig(f.replace('.nii.gz', '_deface_check.png'))
        plt.close()
    ```

!!! warning "Defacing can sometimes fail"
    pydeface may [remove brain tissue or leave facial features](https://neurostars.org/t/defacing-standard/18625) in rare cases, especially with [atypical populations or pediatric data](https://pmc.ncbi.nlm.nih.gov/articles/PMC8249889/). If pydeface fails on specific subjects, try [afni_refacer_run](https://afni.nimh.nih.gov/pub/dist/doc/htmldoc/programs/@afni_refacer_run_sphx.html) (which [replaces rather than removes](https://neurostars.org/t/defacing-standard/18625) the face) on those subjects.

### Step 3: Review participants.tsv

Check for fields that could re-identify participants:

- **Exact scores searchable in public databases** (e.g., [FIDE Elo ratings](https://ratings.fide.com/), standardised test scores) -- bin into ranges instead
- **Rare combinations** of age + sex + clinical score -- consider binning ages into 5-year ranges for small samples

A [recent study](https://arxiv.org/abs/2509.15278) showed that rich clinical metadata can create unique fingerprints even in moderately sized datasets.

### Step 4: Strip gzip headers (optional)

If the BIDS validator warns about `GZIP_HEADER_MTIME` or `GZIP_HEADER_FILENAME`, the `.nii.gz` files contain [embedded timestamps or original filenames](https://neurostars.org/t/attention-with-anonymization-and-gzipped-files-you-might-be-publishing-subject-information/1623). Strip them:

```python
import gzip, glob, shutil, os

for f in sorted(glob.glob('BIDS/sub-*/anat/*.nii.gz') +
                glob.glob('BIDS/sub-*/func/*.nii.gz')):
    nii = f[:-3]  # strip .gz
    with gzip.open(f, 'rb') as gz, open(nii, 'wb') as out:
        shutil.copyfileobj(gz, out)
    os.remove(f)
    with open(nii, 'rb') as src, gzip.GzipFile(f, 'wb', mtime=0) as gz:
        shutil.copyfileobj(src, gz)
    os.remove(nii)
```

Files produced by [dcm2niix](https://github.com/rordenlab/dcm2niix) typically don't have this issue (it uses `-n` by default). Files from [dicm2nii](https://github.com/xiangruili/dicm2nii) (MATLAB) may.

## GDPR note

For datasets collected in the EU: brain MRI is [special category data under GDPR Article 9](https://gdpr-info.eu/art-9-gdpr/). Even defaced MRI [may still be considered personal data](https://apertureneuro.org/article/144761-gdpr-v-open-neuroimaging-the-case-of-europe-s-data-sharing-dilemma). Use **restricted access** with a Data Use Agreement (not fully open sharing), and ensure your consent form covers data sharing. The [Open Brain Consent](https://open-brain-consent.readthedocs.io/en/stable/) templates have GDPR-compatible versions. Your S-case must mention data sharing for [RDR restricted access](../../rdm/RDR_sharing.md).

## Checklist

Before proceeding to [upload your data to RDR](../../rdm/RDR_sharing.md):

- [ ] All structural images defaced and visually checked
- [ ] PII fields removed from all JSON sidecars (via BIDSonym or manual script)
- [ ] `participants.tsv` reviewed for re-identification risk
- [ ] No raw DICOM files or `sourcedata/` with identifiable information
- [ ] Gzip headers cleaned (if applicable)
- [ ] Dataset passes `bids-validator-deno` with no errors
