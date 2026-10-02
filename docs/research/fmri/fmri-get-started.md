# (f)MRI for newbies

The lab scans at two research scanners:

| Scanner | Where | Who runs the scanner | Page |
|---------|-------|----------------------|------|
| **MR11**: Siemens MAGNETOM Cima.X 3T | UZ Leuven, campus Gasthuisberg | You (after training) | [Equipment](fmri-equipment.md) and [Scanning procedure](fmri-procedure.md) |
| **Flanders 7T**: GE HealthCare 7T | Brussels (shared Flemish 7T centre) | An MRI technician | [Flanders 7T](fmri-7t.md) |

MR11 has been the lab's 3T research scanner since June 2026. Notes on the previous scanner, for older datasets only, are on the [MR8 (decommissioned)](fmri-mr8.md) page. If you find outdated instructions elsewhere, please tell [Andrea](mailto:andreaivan.costantino@kuleuven.be) or open an issue.

!!! tip "For detailed information, go to the radiology wiki"
    The KU Leuven radiology department keeps the reference documentation for both scanners at **[wiki.kulradiology.be](https://wiki.kulradiology.be)**: the full MR11 user guide, safety rules and procedures, peripheral equipment manuals, XNAT instructions, and a separate space for the Flanders 7T. Our pages cover what lab members need day to day. For anything more detailed, check the radiology wiki first.

    [:octicons-link-external-16: Open the radiology wiki](https://wiki.kulradiology.be){ .md-button }

    You need an account: ask Rodrigo Trevisan Massera ([rodrigo.trevisanmassera@kuleuven.be](mailto:rodrigo.trevisanmassera@kuleuven.be)).

## Who to contact

| Question | Contact |
|----------|---------|
| Safety, implants, access, new equipment, phantom and test sessions, sequences and exam cards | Ron Peeters, MR Safety Officer ([ronald.peeters@uzleuven.be](mailto:ronald.peeters@uzleuven.be), internal 41103) |
| Incidental findings, 7T, research sequences (WIP/C2P) | Prof. Stefan Sunaert, head of KUL Radiology ([stefan.sunaert@kuleuven.be](mailto:stefan.sunaert@kuleuven.be), internal 47754) |
| Advanced sequences and diffusion | Prof. Daan Christiaens ([daan.christiaens@kuleuven.be](mailto:daan.christiaens@kuleuven.be)) |
| Booking and planning participants | Seppe Maris ([seppe.maris@uzleuven.be](mailto:seppe.maris@uzleuven.be)) |
| XNAT and radiology wiki access | Rodrigo Trevisan Massera ([rodrigo.trevisanmassera@kuleuven.be](mailto:rodrigo.trevisanmassera@kuleuven.be)) |
| Problems during a session (screening questions, scanner issues) | MR technician, internal 40526 |
| Ethics (S70813) and invoicing | Klara Schevenels |

## Get acquainted

Kickstart your (f)MRI learning journey by engaging in the following key activities:

=== "Subscribe to the MR mailing list"

    - **How to subscribe**:  
      Join the MR mailing list by visiting [this link](https://ls.kuleuven.be/cgi-bin/wa?A0=MRI). Make an account and make sure you are logged in and click on "Subscribe or Unsubscribe" in the menu on the top right. Provide your first and last name and hit the subscribe button. A confirmation request will be sent to your email address. Your subscription will be completed if you respond to this request within 48h.
    - **Purpose of the list**:  
      The radiology team uses this list (*MRI@LS.KULEUVEN.BE*) to announce scanner breakdowns, maintenance, software updates, new rules and MR safety courses. Researchers use it to offer slots they cancel and to ask each other practical questions. If you cancel a slot in the week before your scan, announce it here.

=== "Browse documentation"

    - **Radiology wiki**:  
      [wiki.kulradiology.be](https://wiki.kulradiology.be) (account needed, see above). Start with *Scanners › MR11 - Cima.X 3T › Main User Guide* and *Safety, Rules & Procedures*.
    - **Safety manual and forms**:  
      The radiology department shares the *Safety Notes, Rules and Procedures* (v5.0, August 2026; v5.1 announced) and other documents in [this Google Drive folder](https://drive.google.com/drive/folders/1D9eakayRtrxAd25N_rZnzZYHVJTEu2la?usp=sharing).
    - **The lab's resources**:  
      Lab documents on (f)MRI studies are in [this Hoplab Teams folder](https://kuleuven.sharepoint.com/:f:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/MRI/Info%20for%20newbies?csf=1&web=1&e=V4tzxl). Some documents there are outdated; check the date before you rely on one.

=== "Participate in a study"

    - **Get involved**:  
      Interested in participating in an (f)MRI study? Discover ongoing studies within our faculty by visiting [this Facebook page](https://www.facebook.com/ExperimentKUL/) or by following [this page](http://twitter.com/experimentkul) on X (formerly Twitter). To sign up for a study, simply register through the faculty's [Experiment Management System](https://psykuleuven.sona-systems.com/Default.aspx?ReturnUrl=%2f) (EMS).
    - **What to expect**:  
      As a participant in an (f)MRI study, you'll contribute valuable research data by getting your brain scanned. This is a unique opportunity to gain firsthand experience in how (f)MRI studies are conducted.

## Before you start

Before diving into your (f)MRI study, make sure you're prepared by following the steps below. The steps are written for MR11. For the 7T, see the [Flanders 7T](fmri-7t.md) page.

### Get formal ethical approval

Most lab fMRI studies with healthy adults fall under the lab's umbrella application **S70813** (Methusalem), which replaced S62131 (ended 31 December 2025). Check with Klara whether your study is covered before you set up anything else. See the [ethics pages](../ethics/index.md) for details.

1. **Register your study at the CTC**:
   After this you receive an S-number (for more info, we refer you to [this page](../ethics/MEC.md#step-1-register-your-study-at-the-ctc)).
2. **Register your study at the MR research department**:
   Upload the [application form for support from the Radiology department](https://gbiomed.kuleuven.be/english/ctc/supporting-hospital-departments-for-public-ctc-website/aanvraagformulier_radiologie_eng) via [this link](https://www.uzleuven.be/en/uploading-application-forms-supporting-departments-ctc). Include the Clinical Study Coordinator of Radiology (currently, that is <lesley.cockmartin@uzleuven.be>) as contact person, who will approve your request via email.
3. **Get approval from the ethical committee of UZ/KU Leuven**:
   For more info, we refer you to [this page](../ethics/MEC.md#step-2-apply-for-ec-approval).
4. **Follow the MR safety course**:
   And become an authorized user of the MRI-scanner (see below).

!!! warning "Research sequences (WIP and C2P)"
    Some advanced sequences on MR11 are Siemens *works-in-progress* (WIP) or come from other Siemens sites (C2P). They show a lab-flask icon on the console. Using them can require an extra CTC notification, and their authors may require a citation, an acknowledgement or co-authorship. Ask Ron Peeters, Stefan Sunaert or Daan Christiaens which ones your protocol uses before you start data collection.

### Attend the MR safety course

- **Course dates**:  
   The MR Safety Officer, Dr. Ron(ald) Peeters, gives the KU Leuven MRI safety course (about 90 minutes, in person at the MIRC auditorium) several times a year. Dates are announced on the MR mailing list. Reply to Ron directly to register, not to the list.
- **Preparation**:  
   Before attending, read the *Safety Notes, Rules and Procedures* in the [radiology Google Drive folder](https://drive.google.com/drive/folders/1D9eakayRtrxAd25N_rZnzZYHVJTEu2la?usp=sharing). The Hoplab Teams folder also has some [additional safety information](https://kuleuven.sharepoint.com/:b:/r/sites/T0005824-Hoplab/Shared%20Documents/Hoplab/Research/MRI/Scanner%20info%20%26%20safety/Additional%20safety%20information.pdf?csf=1&web=1&e=2gYT4M).

!!! danger "The magnetic field reaches outside the magnet room"
    The MR11 magnet room is small, so the magnetic field reaches into the console room, parts of the hallway and the technical room (the 5 Gauss line extends into the technical room). The door from the hallway to the magnet room is only about 2.7 m from the magnet centre. A steel object such as a camera tripod can start to be pulled at the door itself.

    - Screen **everyone** who enters the MRI department with the MRI Safety Checklist: participants, accompanying persons, researchers and visitors.
    - Do **not** bring any equipment into the MRI department (tripods, cameras, pumps, wheelchairs, laptops, ...) without prior approval of the MRI Safety Officer, whether or not it contains metal.

### Gain access to MR facilities

1. **Document submission**  
    - After obtaining ethical approval, send the completed [MR Access file](https://www.dropbox.com/s/hh0l3swkjnx96vb/MR_Access.xlsx?e=1&dl=0) and the approved ICF to [ilse.roebben@uzleuven.be](mailto:ilse.roebben@uzleuven.be) and [silvia.kovacs@uzleuven.be](mailto:silvia.kovacs@uzleuven.be).  
    - Before entering the Controlled Area for the first time, complete the following:  
        - [MRI Safety Checklist](https://www.dropbox.com/sh/6hdu5z594ojaxh2/AABZQbnhdwjvfqvxcW6YztQda?e=1&preview=MR+patient+Questionnaire+-+ENGELS.pdf)  
        - [Appendix](https://www.dropbox.com/sh/6hdu5z594ojaxh2/AABZQbnhdwjvfqvxcW6YztQda?e=1&preview=Appendix1A_v1.2.pdf) confirming you completed the MR safety course  
        - [Key and badge access form](https://docs.google.com/document/d/143GdWPMCy9pAAmRcEm8toCgNDZ-5E7Vn/edit)  

          Send all three documents to [ronald.peeters@uzleuven.be](mailto:ronald.peeters@uzleuven.be), along with the S-number of your study and the following details:

          | Field                     | Value (to be filled in)           |
          |---------------------------|----------------------------------|
          | First name                |                                  |
          | Last name                 |                                  |
          | Place of birth            |                                  |
          | Date of birth             |                                  |
          | Start date                |                                  |
          | Expiry date               |                                  |
          | Purpose                   | Scanning on research scanner MR11 |
          | Educational institution   | KU Leuven                        |
          | National register number  |                                  |
          | KU Leuven u-number        |                                  |
          | Email address             |                                  |
          | Extranet required         | No                               |
          | Phone number              |                                  |

2. **Card activation for MR suite access**:
  After you have completed all the steps above, Ron will arrange everything and your KU Leuven staff/student card will give you access to the MR11 suite. Access is valid for one year and has to be renewed.

### Set up XNAT for your study

MR11 sends all images automatically to **RADXNAT**, the radiology research image server. There is no USB export at the console any more, so you need these two things **before your first scan** (including pilots):

1. **An XNAT account**: register at [prdaradxnat01.uz.kuleuven.ac.be](https://prdaradxnat01.uz.kuleuven.ac.be/) (only reachable from the hospital network). Use your hospital username, or your KU Leuven u-number if you have no hospital account. An admin activates the account.
2. **An XNAT project for your study**: ask for one through the radiology wiki (*XNAT - Research PACS › Request a new project*). Only studies with EC approval and an S-number can get a project. The project ID is your S-number followed by a letter (e.g., `S12345a`). Register first, so you become the project owner.

How the data reach your project and how you download them is explained in the [Scanning procedure](fmri-procedure.md#getting-your-data-xnat).

### Training and preparation

Before you can become an Authorized Other User (AOU), you must undergo practical training and testing:

1. **Observational training**:  
  After reviewing all relevant documentation, observe scan procedures by joining sessions of your colleagues. We have an internal Slack channel to keep track of upcoming scans, so make sure you are invited to it if you want to be up to date.

2. **Testing protocols**:  
   Before your pilot (f)MRI session with an actual participant, set up your sequences with Ron and test your experiment script at the scanner. Book a phantom session by contacting Dr. Ron(ald) Peeters at [ronald.peeters@uzleuven.be](mailto:ronald.peeters@uzleuven.be). Use the session to check the trigger and the button boxes with your own script (see [Trigger box and buttons](fmri-equipment.md#trigger-box-and-buttons)) and to check that your stimuli look right on the in-room screen.

!!! warning "Independent scanning"
    You are allowed to conduct scans independently after attending approximately **10 sessions** with experienced personnel (e.g., more senior colleagues). This will help you learn how to control the scanner effectively. After 2 sessions, you should know how to control the scanner and you are allowed to be the second researcher during a scan session outside office hours.

## During your experiment

### Booking the scanner

MR11 is booked through the **MRI Scientific Planning Agenda**: [kuleuven.be/radiology/Research/MR11_calendar.php](https://www.kuleuven.be/radiology/Research/MR11_calendar.php). The same page shows the live calendar. Booking has two steps:

1. **Reserve the slot**: fill in your name, e-mail, study number (S- or RAD-number), scan date, start time and duration, then click *Submit request*.
2. **Register the participant**: you receive an e-mail with a link to a *Mynexuzhealth* form. Fill in the participant's details (name, date of birth, nationality, national register number, address, general practitioner with contact details), the pseudonymised subject and session IDs, the scan type (e.g., neuro) and the volunteer type (healthy), then click *Submit*. Do this as soon as possible after booking, and **at least 72 hours before the scan**.

!!! warning "Since 1 September 2026"
    Participant details sent by e-mail are ignored (not GDPR-compliant). The form is the only way to plan a participant. A scan can only be planned once all participant details are known, because every structural scan is checked for incidental findings and the participant's GP is contacted if needed.

!!! tip "Booking a pilot"
    Pilot sessions are usually booked through Ron Peeters: e-mail him ([ronald.peeters@uzleuven.be](mailto:ronald.peeters@uzleuven.be)) to ask for a pilot slot. At the console, register the pilot with *New examination* (see [Pilots, phantoms, or a participant who is not in the RIS list](fmri-procedure.md#register-the-participant-at-the-console)).

Tips for booking:

- **Slot length** = scan time + 10 to 20 minutes for set-up and clean-up. Durations from 15 to 180 minutes are available.
- Book right after an existing booking, or leave at least 60 minutes free between bookings so the gap stays usable.
- **Cancel** in the same tool (you need the UID from the subject line of the booking e-mail), then fill in the form you get by e-mail. Bookings cannot be edited, only deleted and booked again. Cancellations later than 48 hours before the scan are charged unless the participant is ill or has an emergency. If you cancel in the week before the scan, announce the free slot on the MR mailing list.
- Problems with planning: contact Seppe Maris ([seppe.maris@uzleuven.be](mailto:seppe.maris@uzleuven.be)), not the mailing list.

For the practical steps on the scan day, see the [Scanning procedure](fmri-procedure.md). For the hardware, see the [MR11 equipment](fmri-equipment.md) page.

### Managing scan data and invoicing

??? deflist "Tracking sessions"
    Keep detailed records of all scan sessions, noting which sessions provided useful data and/or when you experienced technical issues. Regular reports should be made to your Principal Investigator (PI). In case of technical issues, it is useful to also include what kind of issues you had as well as an estimation of the amount of time lost due to the issues.

??? deflist "Quarterly reports"
    Every four months, your PI will receive an Excel sheet listing all scan sessions conducted during that period. This file will be forwarded to all researchers who have scanned in the corresponding period.

??? deflist "Documenting experiments"
    Complete the Excel sheet with the experiment name for each session and clearly note down comments for any session that did not yield useful data for various reasons (e.g., participant cancellation, no-shows, artifacts, technical issues) and send it back.

??? deflist "Financial management"
    Support staff (currently Klara) will further process the file by including the name of the SAP antenna (i.e., Agna Marien), specifying the funding source for each researcher, and by adjusting the total invoice amount on the invoice to reflect the actual scan hours based on successful data collection sessions ("corrected total").

<!--
__TODO__: [Klara] Is S70813 approved, and does it cover standard studies at MR11 and at the Flanders 7T? Then remove the "check with Klara" sentence in "Get formal ethical approval" and update the 7T page. (Asked Klara on PR #367, 2026-10-01; waiting for answer.)
__TODO__: [Andrea] Check whether the MR Access file, MRI Safety Checklist, Appendix and key/badge form moved from the old Dropbox folder to the radiology Google Drive folder (Safety Notes v5.0), and whether the access procedure (Ilse Roebben, Silvia Kovacs, Ron) is unchanged for MR11. Update the links. (Not asked yet.)
__TODO__: [Klara] Does invoicing at MR11 still use the quarterly Excel sheet and the check-in/out times? Update "Managing scan data and invoicing". (Asked Klara on PR #367, 2026-10-01; waiting for answer.)
-->
