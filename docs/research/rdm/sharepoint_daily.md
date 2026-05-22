# SharePoint set-up

## When should I use SharePoint?

If you are an **early-stage researcher** and/or start a **new project**:

- Start with SharePoint for organisation and day-to-day work (~ active workspace)
- Move structured study datasets to ManGO once the project is properly set up (~ research vault)

If you are a **late-stage researcher** or dealing with **ongoing research**:

- Ensure everything (active and old research data) is (at least) safely stored on SharePoint
- If you want, you can move your active research datasets to ManGO

Please check out the [workflow page](SOPs.md) for specific guidelines on how to organise your data on SharePoint and ManGO.

!!! warning "Do not use OneDrive use to store research files"
    **SharePoint** is the default for day-to-day work and serves as a time-capsule for people leaving the lab. **OneDrive** can only be used for documents that are personal to you and do not need to survive the end of your contract (as they will be permanently deleted once it ends).

!!! tip "Tranfering files from OneDrive to SharePoint"
    If you need to transfer a large number of files from OneDrive to SharePoint, Windows path-length limitations may sometimes cause errors, especially with deeply nested folder structures (e.g. BIDS datasets).  To reduce these issues, you can install **TeraCopy** via the Software Center (icon on your desktop), and use this program for copying your data. 

## Help, I (still) haven't set up my SharePoint yet!

Each lab member received a **personal KU Leuven SharePoint space** (1 TB). The email with your personal SharePoint site was sent out on 17/12/2025 with subject "KULeuven Teams Creation Info".

If you haven't yet, these are the steps to sync SharePoint to your desktop (one-time setup).

1. Open the email “KULeuven Teams Creation Info”
2. Click the SharePoint site link
3. Click `Documents`
4. Click Sync
5. Allow Microsoft OneDrive if prompted
6. Close the pop-up

Your SharePoint will now appear in File Explorer under `KU Leuven → GHUM PPW → your-name` and it will sync automatically like OneDrive. 

In the `Documents` folder on SharePoint online, there is also a button to add a **shortcut to your OneDrive**. In that way, you can easily access your SharePoint folder via your OneDrive without it taking up extra space in your OneDrive.

## Recommendations to avoid storage issues 

Do **not** synchronize SharePoint with the intention of storing all data locally on your computer. This can quickly consume disk space and may cause performance problems.

 * :material-check-circle: Files with a **green checkmark** are stored locally and take up disk space
 * :material-cloud-outline: Files with a **cloud icon** are online-only and do not significantly use local storage
 * Only use **“Always keep on this device”** for files or folders that truly need to remain available offline

If too much data has been downloaded locally, right-click the synchronized folder or files and select **“Free up space”**. This removes the local copies and keeps the files in cloud storage. Files will automatically download again when opened.