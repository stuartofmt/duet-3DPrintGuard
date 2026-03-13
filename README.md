# BEING MODIFIED - TARGET IS DUET3D DWC PLUGIN
# - CONNECT WITH DUET3D PRINTERS
# - MINIMAL INTERACTIVE UI START / STOP
# - MAIN SETTINGS THROUGH CONFIGURATION FILE


# This is a trimmed down / reconstructed version of the original found here:

The detection engine and related functions have not been changed.  Rather a modified UI has been created .  The purpose of these modicications is to allow a very minimal UI to be visible in DWC and facilitate camera configuration / control in a regular browser.

Additional configuration is specifid by a config file that is read in each time the plugin is started.


# PrintGuard - Local 3D Printing Failure Detection and Monitoring
[![PyPI - Version](https://img.shields.io/pypi/v/printguard?style=for-the-badge&logo=pypi&logoColor=white&logoSize=auto&color=yellow)](https://pypi.org/project/printguard/)
[![GitHub Repo stars](https://img.shields.io/github/stars/oliverbravery/printguard?style=for-the-badge&logo=github&logoColor=white&logoSize=auto&color=yellow)](https://github.com/oliverbravery/printguard)

PrintGuard offers local, **real-time print failure detection** for **3D printing** on edge devices. A **web interface** enables users to **monitor multiple printer-facing cameras**, and **receive failure notifications**

 When the **computer vision** fault detection model detects an issue it will  **automatically pause or cancel the print job**.

> _The machine learning model's training code and technical research paper can be found [here](https://github.com/oliverbravery/Edge-FDM-Fault-Detection)._

## Features of the original that have been retained
- **Live Print Failure Detection**: Uses a custom computer vision model to detect print failures in real-time on edge devices.
- **Camera Integration**: Supports multiple camera feeds and simultaneous failure detection.

## Features that have been modified / added
- **Web Interface**: A user-friendly web interface to monitor print jobs and camera feeds.
- **Notifications**: Sends notifications of detected print failures.
- **Camera Integration**: Supports multiple camera feeds and simultaneous failure detection.
- **Printer Integration**:
- Integrates with the local DWC controlled printer
- **Local Access**: Can be accessed within a local network (remote access would require VPN).
