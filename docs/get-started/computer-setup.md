# Setting up your digital working environment

Please read the [Welcome to ICT@PPW three-pager](https://ppw.kuleuven.be/ppw-dict/dictservicecatalog/welcome-to-ict-at-ppw.pdf) to get up and running with IT at our faculty. In case of ICT-related problems, make sure to check the FAQ page of PPW Dienst ICT [here](https://ppw.kuleuven.be/ppw-dict/faq/index.htm).

## Using a computer managed by the university

Faculty issued computers can be recognized by their name starting with GHUM. To set you up, follow these steps:

1. **Login**:
    - You can log in to faculty issued computers with your intranet account.
    - Use your u-number (or r-number in case you are a student) and the password of your e-mail address to do so.
2. **Internet access**:
    - To access [the university's wireless network](https://admin.kuleuven.be/icts/english/services/wifi), look for *campusroam* in the list of available networks. This network offers the broadest access to faculty resources but only accepts u-numbers. When asked to authenticate, enter your u-number followed by *@kuleuven.be* and your intranet password. If you have an r-number, you can connect to the *eduroam* network, but this network does not allow access to PPW faculty file shares or printers.
    - To gain access to the wired network in the PPW-buildings, get your network outlet activated by completing [this form](https://ppw.kuleuven.be/home/ppw-dict/forms/activating-network-outlets) (in case it is not pre-activated).
3. **Administrator access**:
    - If you are not already, contact dICT (*<dict@ppw.kuleuven.be>*) to make you administrator for the computer you are going to work on. You need to provide them the hostname of your pc (GHUM-…) and your u-number.
    - Alternatively, if someone else is already administrator, ask them to add you (Windows control panel > Change account type > Add > Add a new LUNA account).
4. **Multifactor authentication**:
    - To access KU Leuven intranet pages, you will need to log in with [KU Leuven Authenticator](https://admin.kuleuven.be/icts/english/mfa). You can register your device with a smartphone or tablet via the KU Leuven Authenticator App ([read the instructions](https://admin.kuleuven.be/icts/english/mfa/startwithmfa#smartphone)).
    - If you are having issues with MFA, check this [FAQ page](https://admin.kuleuven.be/icts/services/mfa/faq_en).

??? question "Where do I find the hostname of my pc?"
 The hostname is usually printed on a sticker on the computer. If not, go to Start, right click on "This PC", choose properties, and check the "Device name" field.

## Installing MATLAB

The installation process differs for students and personnel. Please follow the instructions in the appropriate tab below:

=== "Students"

    1. **Register** on the [MathWorks website](https://nl.mathworks.com/academia/tah-portal/ku-leuven-30919019.html) using your KU Leuven student email address.
    2. After registering, **download** the software directly from the MathWorks website.

=== "Personnel"

    1. **Choose the appropriate MATLAB license:**
        
        - **Individual License**: Recommended for most users. This license allows you to use MATLAB on multiple computers (up to 2 simultaneously) and includes access to MATLAB desktop software and online services (e.g., MATLAB Online, Add-Ons, and MATLAB online training). This option in suited for individual personnel.
        
        - **Designated Computer License**: Use this license if MATLAB is to be installed on a computer that is permanently offline or where users cannot log in under their own account. It allows any number of users to access MATLAB on that specific computer, though not simultaneously. This option is generally suited for lab/shared computers.

        
        The license fee can be covered using individual professional funding sources (e.g., bench fees, grant money, etc.), depending on your contractual situation. For more details, please discuss with your PI.

        ??? warning "Transition to ‘Individual License"
            The old '5pack' license will no longer be available after October 31, 2024. To continue using MATLAB, users must switch to an 'Individual License' or 'Designated Computer License'. It is recommended to remove any older versions of MATLAB and install the most recent version as an 'Individual License' user. For newer versions (from R2023b onwards), you can easily switch licenses by placing a new license file. Detailed instructions are available [here](https://nl.mathworks.com/matlabcentral/answers/2099121-how-do-i-transition-matlab-installations-to-matlab-individual-and-the-campus-wide-license).

    2. **Download MATLAB**:
        
        - Get the MATLAB installation files from the [ICTS License Catalogue](https://icts.kuleuven.be/apps/license/download/MATLAB/index.html).
        - Follow the instructions to download the installer for your operating system.

    3. **Install and activate MATLAB**:
        
        - Run the MATLAB installer and follow the on-screen instructions.
        - During the activation process, select "Individual License" and log in with your MathWorks account.
        - Input the license key provided through the ICTS License Catalogue when prompted.

    ??? tip "Updating Your PC Registration"
        To change your registered computer name or IP address:

        1. Go to https://icts.kuleuven.be/apps/license
        2. Click the pencil icon under "register your PC"
        3. Update your hostname and IP address as needed

## Frequently used software

Here are some software programs we frequently use in the lab, which you might find useful to download:

- **Google Calendar**: Make sure you have writing access to the lab's Google calendar (ask the person in charge of this, as of today, that is [Andrea](https://www.kuleuven.be/wieiswie/en/person/00152046)).

- **TeamViewer**: For remote access to a desktop PC, e.g. the fMRI PC to run your analyses.

    ??? info "TeamViewer Setup Guide"
        1. Download the free **private** version from the [official website](https://www.teamviewer.com/en/download/windows/).
        2. Create an account:
            - Open TeamViewer and click "Sign Up".
            - Enter your email, name, and a strong password.
            - Verify your email address.
        3. Add a computer:
            - Sign in and go to "Computers & Contacts".
            - Click "Add Computer".
            - Name the computer (e.g., "Lab Desktop").
            - Click "Add" to save.
        4. Connect:
            - Open TeamViewer and log in.
            - Find the computer in your list.
            - Double-click to connect.
            - Enter the remote computer's password when prompted.

- **AnyDesk**: A good alternative if TeamViewer is inaccessible. [Install the free private version](https://anydesk.com/en). It is advisable to install and configure both TeamViewer and AnyDesk to avoid being locked out if one of them is not accessible.

- **Google Chrome**: This is the preferred web browser. For example, the MR calendar is only compatible with this browser.

- **Slack**: Slack is used for communication within the lab. Ask any lab member to add you to the relevant channels.

- **Skype for business** and **Microsoft Teams**: KU Leuven offers both [Skype for business](https://admin.kuleuven.be/icts/english/services/skype) and [MS Teams](https://admin.kuleuven.be/icts/english/teams/index) for communication purposes. See [this table](https://admin.kuleuven.be/icts/english/teams/comparison) for a comparison between the different platforms. Currently, MS Teams is the newer and preferred option, however, it only allows its users to reach other MS Teams users. With MS Teams, it is currently not possible to call (or be called by) telephone numbers (landline and mobile). You can use Skype for this.

- **SSL VPN Pulse Client / Ivanti Secure Access Client**: The VPN offered by the university. For more information, check out this [link](https://admin.kuleuven.be/icts/services/vpn/).

- **Overleaf**: An online <span class="latex">L<sup>a</sup>T<sub>e</sub>X</span> editor for collaborative writing and publishing.

    ??? question "Why use Overleaf?"
        Overleaf is a powerful tool for academic writing, especially for scientific papers and theses. Here's why it's important:

        1. **<span class="latex">L<sup>a</sup>T<sub>e</sub>X</span>-based**: Produces high-quality, professional-looking documents with complex equations and formatting.
        2. **Collaboration**: Real-time collaboration with co-authors, similar to Google Docs.
        3. **Version control**: Tracks changes and allows reverting to previous versions.
        4. **Journal templates**: Many journals provide <span class="latex">L<sup>a</sup>T<sub>e</sub>X</span> templates that can be directly used in Overleaf, streamlining the submission process.
        5. **Integration**: Works with reference managers like Mendeley and Zotero.
        6. **Accessibility**: Web-based, so you can work from any computer without installing software.

        While <span class="latex">L<sup>a</sup>T<sub>e</sub>X</span> has a learning curve, investing time in learning it can significantly improve your academic writing workflow and the quality of your documents.

!!! tip "Administrative privileges on KU Leuven PCs"
 In case you have issues installing software (e.g., because of lack of administrator access), you can double click the "Make Me Admin" icon on your Windows desktop and follow the instructions to get temporary administrator rights on your computer. Additionally, make sure to install the software in `C:\Workdir\MyApps\`. Please contact the ICT helpdesk if problems persist.

## Data storage

All KU Leuven staff and students have their own [OneDrive](https://admin.kuleuven.be/icts/services/onedrive) environment with 2 TB of online storage space to store personal work files. The files on OneDrive are synced to a folder on your local device (Windows Explorer), but can be accessed from various devices from any location. It is also possible to share documents with someone else and work together on the same document.

!!! warning "Back up your data twice"
    Keep your data in one main folder (folder name = your first name) if you are an intern, or on your PC if you are personnel, and back-up this data to:

 1. A portable hard drive (shared between **interns**, or ask [Ying](https://www.kuleuven.be/wieiswie/en/person/00098752) if you are **personnel**). Don’t forget to give the external drives back to your supervisor when your role ends.
 2. Your online OneDrive folder. To get started with OneDrive, check out this [page](https://admin.kuleuven.be/icts/services/onedrive/vanstartonedrive).

## Printing

Find info on how to install printing services on your computer [here](https://ppw.kuleuven.be/home/ppw-dict/dictservicedesk/netwerkprinter). The printer names are:

- PRLBP (Black & White printer)
- PRLBP2 (Color printer)

If the installation doesn’t work, use a USB key to print on the black and white printer in room 02.28. You can also get permanent access by asking [Ying](https://www.kuleuven.be/wieiswie/en/person/00098752) to add you to the list of users.

For **mac users**, follow the instructions on [this page](https://ppw.kuleuven.be/ppw-dict/dictservicedesk/mac-osx-configuration) to print from your personal computer. More generally, this manual tries to give an overview of most frequently asked questions concerning configuration and initial setup of a secure work environment on Mac OS X.

<style>
.latex {
  font-family: "Computer Modern", serif;
}
.latex sup {
  text-transform: uppercase;
  letter-spacing: 1px;
  font-size: 0.85em;
  vertical-align: 0.15em;
  margin-left: -0.36em;
  margin-right: -0.15em;
}
.latex sub {
  text-transform: uppercase;
  vertical-align: -0.5ex;
  margin-left: -0.1667em;
  margin-right: -0.125em;
  font-size: 1em;
}

</style>
