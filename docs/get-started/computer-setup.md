# Setting up your digital working environment

Please read the [Welcome to ICT@PPW three-pager](https://ppw.kuleuven.be/ppw-dict/dictservicecatalog/welcome-to-ict-at-ppw.pdf) to get up and running with IT at our faculty. In case of ICT-related problems, make sure to check the FAQ page of PPW Dienst ICT [here](https://ppw.kuleuven.be/ppw-dict/faq/index.htm).

## Using a computer managed by the university

Faculty issued computers can be recognized by their name starting with GHUM. To set you up, follow these steps:

1. **Login**:
    - With your intranet account you can log in to faculty issued computers. Use your u-number (or r-number in case you are a student) and the password of your e-mail address to do so.
2. **Internet access**:
	  - To access [the university's wireless network](https://admin.kuleuven.be/icts/english/services/wifi), look for *campusroam* in the list of available networks. This network offers the broadest access to faculty resources but only accepts u-numbers. When asked to authenticate, enter your u-number followed by *@kuleuven.be* and your intranet password. If you have an r-number, you can connect to the *eduroam* network, but this network does not allow access to PPW faculty file shares or printers. 
	  - To gain access to the wired network in the PPW-buildings, get your network outlet activated by completing [this form](https://ppw.kuleuven.be/home/ppw-dict/forms/activating-network-outlets) (in case it is not pre-activated).
3. **Administrator access**:
    - If you are not already, contact dICT (*dict@ppw.kuleuven.be*) to make you administrator for the computer you are going to work on. You need to provide them the hostname of your pc (GHUM-…) and your u-number.
Alternatively, if someone else is already administrator, ask them to add you (Windows control panel > Change account type > Add > Add a new LUNA account).

??? question "Where do I find the hostname of my pc?"
	The hostname is usually printed on a sticker on the computer. If not, go to Start, right click on "This PC", choose properties, and check the "Device name" field.

## Installing MATLAB

The situation is different depending on whether you are a student or a new lab member.

For **students**:

- Follow the step-by-step plan provided [here](https://admin.kuleuven.be/icts/onderzoek/downloads/MATLAB/tah-student-install-2017-en.pdf).
- Bachelor’s and master’s students of certain programs can register on the [Mathworks website](https://nl.mathworks.com/academia/tah-portal/ku-leuven-30919019.html) to use MATLAB. Registration takes place using your KU Leuven student email address. After registering, you can download the software directly from the website.

For **personnel**:

1. Have Ying add you to the license platform. To do so, she will need your computer name and IPv4 address. Here’s how to get these:
	
	- Open your command prompt (Start > type `cmd`)
	- Write `ipconfig` in the command prompt 
	- Copy the IPv4 Address and send it to Ying, along with your computer hostname (GHUM-...)

2.	Download the MATLAB installation files directly from the ICTS License Tool [here](https://icts.kuleuven.be/apps/license/download/MATLAB/index.html)

3.	To change the computer name and IP address yourself: 

	- Browse to https://icts.kuleuven.be/apps/license
	- Click the pencil under "register your PC" where you can change the hostname and IP address

!!! info
	MATLAB can be used at home provided you use a VPN. The official VPN to use is SSL VPN Pulse Client / Ivanti Secure Access Client (see below).

## Frequently used software

Here are some software programs we frequently use in the lab, which you might find useful to download:

- **Google Calendar**: Make sure you have writing access to the lab's Google calendar (ask the person in charge of this, for now, that is Tim/Klara/Silke).
- **TeamViewer**: For remote access to a desktop pc, e.g. the fMRI desktop to run your analyses. Make sure to [install the free **private** version](https://www.teamviewer.com/en/download/windows/). If, for some reason, TeamViewer is unaccessible, AnyDesk is a good alternative (again, make sure to install the free private version). It is advisable to install and configure both software to avoid being locked out if one of them is not accessible.
- **Google Chrome**: This is the preferred web browser. For example, the MR calendar is only compatible with this browser.
- **Slack**: Slack is used for communication within the lab. Ask any lab member to add you to the relevant channels.
- **Skype for business** and **Microsoft Teams**: The KU Leuven offers both [Skype for business](https://admin.kuleuven.be/icts/english/services/skype) and [MS Teams](https://admin.kuleuven.be/icts/english/teams/index) for communication purposes. See [this table](https://admin.kuleuven.be/icts/english/teams/comparison) for a comparison between the different platforms. Currently, MS Teams is the newer and preferred option, however, it only allows its users to reach other MS Teams users. With MS Teams, it is currently not possible to call (or be called by) telephone numbers (landline and mobile). You can use Skype for this.
- **SSL VPN Pulse Client / Ivanti Secure Access Client**: The VPN offered by the university. For more information, check out this [link](https://admin.kuleuven.be/icts/services/vpn/).

**TODO:** Add more details on the exact steps/tips for TeamViewer.

!!! tip "Administrative privilidges on KU Leuven PCs"
	In case you have issues installing software (e.g., because of lack of administrator access), you can double click the "Make Me Admin" icon on your Windows desktop and follow the instructions to get temporary administrator rights on your computer. Additionally, make sure to install the software in `C:\Workdir\MyApps\`. Please contact the ICT helpdesk if problems persist.

## Data storage

All KU Leuven staff and students have their own [OneDrive](https://admin.kuleuven.be/icts/services/onedrive) environment with 2 TB of online storage space to store personal work files. The files on OneDrive are synced to a folder on your local device (Windows Explorer), but can be accessed from various devices from any location. It is also possible to share documents with someone else and work together on the same document.

Advice for **interns**: Keep your data in one main folder (folder name = your first name) on your PC and back-up this folder to:

1. A portable hard drive (shared between interns). Don’t forget to give the external drives back to your supervisor when your internship ends.
2. Your online OneDrive folder. To get started with OneDrive, check out this [page](https://admin.kuleuven.be/icts/services/onedrive/vanstartonedrive). 

The same advice holds for **personnel**. Please make two copies of your documents and data to: 

1. A portable hard drive (ask Ying for a hard drive from LBP)
2. Your online OneDrive folder

## Printing

Find info on how to install printing services on your computer [here](https://ppw.kuleuven.be/home/ppw-dict/dictservicedesk/netwerkprinter). The printer names are:

- PRLBP (Black & White printer)
- PRLBP2 (Color printer)

If the installation doesn’t work, use a USB key to print on the black and white printer in room 02.28. You can also get permanent access by asking Ying to add you to the list of users.

For mac users, follow the instructions on [this page](https://ppw.kuleuven.be/ppw-dict/dictservicedesk/mac-osx-configuration) to print from your personal computer. More generally, this manual tries to give an overview of most frequently asked questions concerning configuration and initial setup of a secure work environment on Mac OS X. 

**NOTE**: we changed printer recently (few months ago), so let's make sure this procedure is still up-to-date (I think it may not be).
