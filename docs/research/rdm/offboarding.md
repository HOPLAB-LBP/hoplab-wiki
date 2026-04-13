# Researcher offboarding checklist

To ensure a smooth transition for everyone, you can find some general guidelines as well as a checklist of things to take care of before you leave below. It links to external pages so every step should speak for itself. If it doesn’t, do not hesitate to contact [Klara](https://www.kuleuven.be/wieiswie/nl/person/00116743) to help you wrap up.

[Download a personal copy here](https://kuleuven.sharepoint.com/:w:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/RDM/Researcher-offboarding-checklist_WIP.docx?d=w103a73d188fd48beb69a23404a5f9af8&csf=1&web=1&e=HcBn9l) to fill in your information. When completed, sign it and send it to your PI with [Klara](https://www.kuleuven.be/wieiswie/nl/person/00116743) in CC.

## General guidelines

1. Create a [logical folder structure with consistent file and folder naming](https://www.kuleuven.be/rdm/en/guidance/data-standards/file-organisation)
2. Use [open file formats or generally accepted standard formats](https://www.kuleuven.be/rdm/en/rdr/file-formats/)
3. Provide [clear documentation of project folders and datasets](https://www.kuleuven.be/rdm/en/guidance/documentation-metadata) (see [below](#documentation-expectations) for more details)
4. In case of doubt, refer to our [decision tree regarding data storage](./current.md#the-big-picture)

## Checklist of tasks

??? note "📋 Funder & ethics requirements"
    | Task | Information  | Done |
    |------|--------------|------|
    | Check whether all your funder requirements are met (e.g., submit final DMP; see [this overview](https://www.kuleuven.be/rdm/en/guidance/funder)). | [list of funder requirements] | ☐ |
    | Specify how long your data should be stored and any specific requirements for destruction of (personal) data (e.g., delete files allowing reidentification after publication; see your ethics forms). | [10 years (SMEC) or 25 years (EC)] | ☐ |
    | Specify the exact date for reassessment of the retention period (e.g., in 10 years from now). | [DD/MM/YYYY] | ☐ |
    | If you have shared/will share any data, confirm that it is in accordance with your ICF and that there are no legal or IP issues nor ethical objections (check compliance with your [PRET](https://www.groupware.kuleuven.be/sites/pret/Pages/en/default.aspx) application). | [remarks] | ☐ |
    | Update the final number of participants per ethical application in the [ethics tracker](https://kuleuven.sharepoint.com/:x:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/Ethical%20applications/ethics_tracker.xlsx?d=w3176be826a5c428987db1b936bb8f422&csf=1&web=1&e=M6PfpP). If applicable to you, submit a final progress report to the EC. | [remarks] | ☐ |

??? note "🔒 Data protection & sensitive data"
    | Task | Information  | Done |
    |------|--------------|------|
    | Make sure all research data are [pseudonymized](https://www.kuleuven.be/rdm/en/guidance/legal-ethical/anonymise-pseudonymise) as much as possible (e.g., unique and random participant codes, remove identifying information from metadata, defaced MRI scans). | [describe measures taken] | ☐ |
    | Ensure all files containing confidential personal data (e.g., consent forms, contact details, payment information), and the pseudonymization key(s) are **password protected**, stored **on KU Leuven servers** (not locally), and **separate from the research data**. Note that the pseudonymization key itself should not contain any (other) personal information.  | [sensitive data folder path(s) and password information] | ☐ |
    | Confirm there is no personal information or research data on unsecure cloud environments (Google Drive, Dropbox, iCloud, personal email). | [remarks] | ☐ |
    | Remove all research data from data capture tools/apps (e.g. Qualtrics, m-Path), shared devices (e.g., the hospital PC, EEG PC, fMRI PC) and unencrypted USB-drives used for data transfer. | [remarks] | ☐ |

??? note "📦 Data storage & organization"
    | Task | Information  | Done |
    |------|--------------|------|
    | Ensure all research data has been organized in BIDS and is stored on your personal SharePoint, [ManGO](mango_active.md) (active data) or [FriGO](frigo_archive.md) (archived data), including raw and derived data (outputs from preprocessing and analysis steps), with [clear documentation](#research-data-in-bids). | [BIDS folder path(s)] | ☐ |
    | Ensure all raw (non-BIDS) data are saved in a single separate immutable “ground truth” folder per project on your personal SharePoint, [ManGO](mango_active.md) (active data) or [FriGO](frigo_archive.md) (archived data), with read-only access and the correct permissions set. | [raw data folder path(s)] | ☐ |
    | Make sure that all other relevant project data files (non-research data) have been transferred from OneDrive/local drive to your personal SharePoint site (see [these guidelines](./current.md#sharepoint-setup-current-default-for-daily-work)) or FriGO, organized in a single directory per project, with logical subfolders and [documentation](#non-research-project-files) in the root on the content of the folders and files. | [project folder path(s)] | ☐ |
    | Provide an estimation of your total data volume (to be archived on KU Leuven servers). | [estimated total data volume] | ☐ |

??? note "💻 Local data & hardware"
    | Task | Information  | Done |
    |------|--------------|------|
    | If you keep a local copy of your research data, ensure it is [pseudonymized](https://www.kuleuven.be/rdm/en/guidance/legal-ethical/anonymise-pseudonymise) and that any local/external hard drive is [Bitlocker encrypted](https://admin.kuleuven.be/icts/english/research/datamgmtpract/ape/encryption). All files containing confidential personal data must remain on KU Leuven servers (no local copies allowed). | [remarks] | ☐ |
    | Return all pc material (laptop, mouse, keyboard, external screen, cables, external HD) and office keys to your PI (unless otherwise agreed). | [remarks] | ☐ |

??? note "📄 Physical documents"
    | Task | Information  | Done |
    |------|--------------|------|
    | Return all ICFs and other (confidential) source documents (e.g., (S)AE forms, paper test forms, questionnaires) to the lab’s physical data archive. Clearly label the physical folders. | [physical folder label(s) with content summary] | ☐ |

??? note "📊 Code and data sharing"
    | Task | Information  | Done |
    |------|--------------|------|
    | Make all (final) scripts and research software available on or linked to the lab’s Gitlab/[Github](https://github.com/HOPLAB-LBP) space (or Sharepoint in case of unfinished projects), and make sure they are [properly documented](#scripts-and-research-software). | [link to the relevant Github/Gitlab pages, public or private] | ☐ |
    | For datasets on public repositories (e.g., OSF, OpenNeuro, GIN): ensure the dataset is public with a DOI, linked to Hoplab (for OSF), with [sufficient documentation](#datasets-published-in-public-repositories), complete metadata and [registered in Lirias](https://research.kuleuven.be/en/associatienet/output/lirias/register-datasets-in-lirias). *Pseudonymous data should be on RDR with restricted access (you can transfer data from OSF to RDR using the [integration dashboard](https://www.kuleuven.be/rdm/en/rdr/integration-dashboard)).*  | [DOI(s) and repository name(s) of projects on public repositories] | ☐ |
    | For datasets on RDR ([manual](https://www.kuleuven.be/rdm/en/rdr/manual)): ensure metadata have been added, there is [sufficient documentation](#datasets-published-in-public-repositories), **all necessary files** have been restricted, and it includes a DTA README file. *The metadata will be registered in Lirias automatically 24h after publication of the dataset.* | [DOI(s) of all projects on RDR] | ☐ |

??? note "📢 Outreach & participants"
    | Task | Information  | Done |
    |------|--------------|------|
    | Register all academic outreach (preprints, papers, datasets, conference contributions, thesis) in Lirias, attaching [project labels](https://research.kuleuven.be/en/associatienet/output/lirias/faq_webpages/labels-in-lirias) where needed (e.g., FWO, Methusalem). Preferably, also register your non-academic outreach activities (e.g., public lectures, media appearances, blog posts, etc.) [here](https://kuleuven.sharepoint.com/:x:/r/sites/T0005824/Shared%20Documents/General/Methusalem%20reporting/Methusalem_Scicomm_Overview.xlsx?d=wcafaa0336ef941b3989dd98a38b35e9b&csf=1&web=1&e=wttcgI). | [remarks] | ☐ |
    | If your participants explicitly agreed to be contacted for future research and this is also clearly mentioned in your ICF(s), add their contact details to the lab’s [participant database](https://forms.office.com/Pages/ResponsePage.aspx?id=m1hzOUCetU6ADrC2OD0WIZquopqLrtBFjNZoWiO2ApRUNFdCTzlBM1AxTTBMRENONjNHNzFYTjEwOS4u). | [remarks] | ☐ |

??? note "🧾 Administrative offboarding"
    | Task | Information  | Done |
    |------|--------------|------|
    | Complete the [ICTS offboarding steps related to your KUL mailbox](https://admin.kuleuven.be/icts/english/services/email/leaving-university). Note that if you back-up your e-mails and they contain confidential information of your participants, the file should be [encrypted](https://admin.kuleuven.be/icts/english/research/datamgmtpract/ape/encryption). | [remarks] | ☐ |
    | Check out the [HR page on practical steps to complete when leaving employment](https://admin.kuleuven.be/personeel/english/intranet/endofcontract-pension/practical-steps-leaving/practical-steps-leaving-employment), and handle [these administrative formalities if you are leaving Belgium](https://www.kuleuven.be/english/life-at-ku-leuven/upon-leaving). | [remarks] | ☐ |
    | In case of unfinished projects: check [here](https://ppw.kuleuven.be/ppw-dict/faq#autotoc-item-autotoc-66) how long you retain access to KU Leuven services (mailbox, pc login, Teams, MS Office, OneDrive, etc.) after your contract ends. If needed, request minimal registration ([PhD](https://icts.kuleuven.be/docs/at/oz/doctoraten/s/doctoraatsgegevens-extra-info/MRE)/[EEA/non-EEA](https://admin.kuleuven.be/sab/od/intranet/minimale_registratie.html#autotoc-item-autotoc-3)) or discuss a [volunteer researcher contract](https://admin.kuleuven.be/personeel/intranet/statuten/vrijwillig-wetenschappelijk-medewerker) with your PI. You can find more detailed information on this [below](#in-case-of-unfinished-projects). | [specify the arrangements made] | ☐ |

??? note "💬 Optional feedback"
    | Task | Information  | Done |
    |------|--------------|------|
    | Provide feedback on RDM, lab experience, and suggestions. | [any feedback is welcome! 😊] | ☐ |

## Documentation expectations

### Guiding principle

Documentation should allow a new lab member or external researcher to understand what the data or files are, how they were created, and how they can be reused, without additional guidance from the original researcher.

#### Non-research project files  

For non-research data stored on SharePoint or FriGO, documentation related to those files should be provided in the root directory of each project (e.g. a README) and include:

- A short description of the files and their purpose
- An overview of the folder structure with subfolder content and naming conventions
- Types of files present (e.g. administrative documents, templates, meeting notes, stimuli)
- Notes on what is final, ongoing, or obsolete
- References to related research data, scripts, or repositories if applicable  

Note-taking can be done using e.g. Obsidian (in the open `.md` format) and included in a `/doc` folder added to `.bidsignore`  to exclude it from BIDS validation.

#### Research data in BIDS

For research data organized in BIDS format, documentation should include:

- Study description, data modalities (e.g. MRI, EEG, behavioral, eye-tracking, DNN), number and type of participants (including key inclusion/exclusion criteria), stimuli, acquisition parameters/protocol, main experimental conditions/tasks, preprocessing/analysis steps
- BIDS-required metadata and sidecar files: dataset description, participant information, modality-specific metadata, event files, data dictionaries
- Make sure that the documentation covers all data stages: raw data (ground truth), derived data from preprocessing, intermediate and final analysis outputs
- A README in the root directory explaining folder structure, relationship between raw and derived data, essential vs optional/legacy files, important notes/remarks (e.g., missing files). This is the primary place for free-form notes ensuring that the dataset remains understandable to other humans (<-> machines)
- References/links to preprocessing/analysis scripts, software versions/pipelines used, and external repositories

#### Scripts and research software

For scripts and research software, documentation should include:

- A top-level README describing the purpose of the code, which part of the project it relates to, and the expected inputs and outputs
- Clear instructions on how to run the scripts or pipeline, dependencies, software requirements/versions, and configuration files or parameters that need to be set
- Inline comments or additional documentation explaining non-trivial processing steps, key analysis decisions, assumptions or known limitations
- An indication of which scripts are final/reproducible vs exploratory/deprecated/superseded

#### Datasets published in public repositories

For projects hosted on public (trusted) repositories, documentation should include:

- A README in the root describing data modality/format, how the data were collected and processed, repository structure (folders and files), and relationship of raw vs derived data  
- Metadata fields completed in the repository interface, including authorship, affiliations, keywords, subject areas, licensing, access restrictions/conditions, ethical/legal considerations, citation instructions for reuse, contact person(s)
- A clear indication of restricted vs open files  
- References to related publications, datasets, or code repositories

## In case of unfinished projects

If you are a **PhD student** and your contract ends before your defense, you can contact your doctoral school to arrange a [minimal registration](https://icts.kuleuven.be/docs/at/oz/doctoraten/s/doctoraatsgegevens-extra-info/MRE). This allows you to keep access to key facilities (e-mail address, appearing on the who-is-who, a u-number to log in to KU Loket, [Limo](https://bib.kuleuven.be/english/collections-access-borrowing/access-to-e-resources/consulting-e-resources/consulting) and LIRIAS, and a personnel card with possible access to buildings), although you are not/no longer formally employed by KU Leuven (this is standard for FWO fellowships).  

A **minimal registration** can also be used to:

- Give [**EEA citizens**](https://admin.kuleuven.be/mykuleuven/en/theme/international/going-abroad-practical-aspects/eea-countries) a u-number to access certain KU Leuven tools (for 1 year).
- Give [**non-EEA citizens**](https://admin.kuleuven.be/mykuleuven/en/theme/international/going-abroad-practical-aspects/eea-countries) who are not residing in Belgium (anymore) access to (parts of) the KU Leuven network via [VPN for externals](https://icts.kuleuven.be/sc/english/netinter/VPN-for-external-users) (for 6 months, extendable once).
- Note that in both cases, there are no extra facilities such as keeping your e-mail address, etc. (see above). See [this page](https://admin.kuleuven.be/sab/od/intranet/minimale_registratie.html#autotoc-item-autotoc-3) for more information on how to request this.

If additional affiliation is needed, you can discuss with your PI to continue working for KU Leuven under a [**volunteer researcher contract**](https://admin.kuleuven.be/personeel/intranet/statuten/vrijwillig-wetenschappelijk-medewerker) (min. 10%):

- This always requires a well-described and clearly defined academic assignment.
- Note that to combine this with unemployment benefits, the appointment percentage cannot exceed 20% (more info [here](https://admin.kuleuven.be/personeel/intranet/statuten/vrijwillig-wetenschappelijk-medewerker#autotoc-item-autotoc-9)).
- If you are a **non-EEA citizen residing in Belgium**, you can only be appointed as volunteer researcher if you have a valid residence document for the duration of your contract (e.g., by applying for a [search year](https://www.kuleuven.be/english/life-at-ku-leuven/immigration-residence/search-year/search-year-researchers)).
- If you are a **non-EEA citizen residing outside of Belgium**, you can only be appointed as volunteer researcher if you [formally agree](https://admin.kuleuven.be/personeel/english/intranet/forms/Declaration-voluntary-research-associate.docx) to never be present in Belgium for the duration of your contract and after your dossier gets approved by the board (more info [here](https://admin.kuleuven.be/personeel/intranet/statuten/vrijwillig-wetenschappelijk-medewerker#autotoc-item-autotoc-8)).
- Contact the [HR department](https://admin.kuleuven.be/personeel/associatienet/en/CP_short) for support and guidance.
