# BEING MODIFIED - TARGET IS DUET3D DWC PLUGIN
# - CONNECT WITH DUET3D PRINTERS
# - MINIMAL INTERACTIVE UI START / STOP
# - MAIN SETTINGS THROUGH CONFIGURATION FILE


# This is a trimmed down / reconstructed version of the original found here:

The detection engine and related functions have not been changed.  Rather a modified UI has been created (mostly by bypassing existing elements).  The purpose of these modicications is to allow a very minimal UI to be visible in DWC and facilitate camera configuration / control in a regular browser.

Additional configuration is specifid by a config file that is read in each time the plugin is started.




# PrintGuard - Local 3D Printing Failure Detection and Monitoring
[![PyPI - Version](https://img.shields.io/pypi/v/printguard?style=for-the-badge&logo=pypi&logoColor=white&logoSize=auto&color=yellow)](https://pypi.org/project/printguard/)
[![GitHub Repo stars](https://img.shields.io/github/stars/oliverbravery/printguard?style=for-the-badge&logo=github&logoColor=white&logoSize=auto&color=yellow)](https://github.com/oliverbravery/printguard)

PrintGuard offers local, **real-time print failure detection** for **3D printing** on edge devices. A **web interface** enables users to **monitor multiple printer-facing cameras**, **connect to printers** through compatible services (i.e. [Octoprint](https://octoprint.org)) and **receive failure notifications** when the **computer vision** fault detection model designed for local edge deployment detects an issue and **automatically suspend or terminate the print job**.

> _The machine learning model's training code and technical research paper can be found [here](https://github.com/oliverbravery/Edge-FDM-Fault-Detection)._

## Features of the original that have been retained
- **Live Print Failure Detection**: Uses a custom computer vision model to detect print failures in real-time on edge devices.
- **Camera Integration**: Supports multiple camera feeds and simultaneous failure detection.

## Features that have been modified / added
- **Web Interface**: A user-friendly web interface to monitor print jobs and camera feeds.
- **Notifications**: Sends notifications subscribable on desktop and mobile devices via web push notifications to notify of detected print failures.
- **Camera Integration**: Supports multiple camera feeds and simultaneous failure detection.
- **Printer Integration**:
- Integrates with local DWC controlled printer for automatic print termination or suspension when a failure is detected.  This will be done my calling existing DWC macros pause.g cancel.c stop.g
- **Local and Remote Access**: Can be accessed within a local network utilising independent of DWC.

## Features that MAY be added back in the future
- **Notifications**: Sends notifications subscribable on desktop and mobile devices via web push notifications to notify of detected print failures.
- **Local and Remote Access**: Can be accessed locally or remotely via secure tunnels (e.g. ngrok, Cloudflare Tunnel) or within a local network utilising the setup page for easy configuration.

## Table of Contents
- [Features](#features)
- [Installation](#installation)
    - [PyPI Installation](#pypi-installation)
    - [Docker Installation](#docker-installation)
- [Initial Configuration](#initial-configuration)
- [Usage](#usage)
- [Technical Documentation](/docs/overview.md)

## Installation



> Local Network Access Only supported at this time.

## Usage
 | | |
 | --- | --- |
 | ![PrintGuard Web Interface](docs/media/images/interface-index.png) | The main interface of PrintGuard. All cameras are selectable in the bottom left camera list. The live camera view displayed in the top right shows the feed of the currently selected camera. The current detection status, total detections and frame rate are displayed in the bottom right alongside a button to toggle live detection for the selected camera on or off. |
  | ![PrintGuard Camera Settings](docs/media/images/interface-camera-settings.png) | The camera settings page is accessible via the settings button in the bottom right of the main interface. It allows you to configure camera settings, including camera brightness and contrast, detection thresholds, link a printer to the camera via services such as Octoprint, and configure alert and notification settings for that camera. You can also opt into web push notifications for real-time alerts here. |
  | ![PrintGuard Setup Settings](docs/media/images/interface-setup-settings.png) | Accessible via the configure setup button in the settings menu, the setup page allows configuration of camera feed streaming settings such as resolution and frame rate, as well as polling intervals and detection rates. |
  | ![PrintGuard Alerts and Notifications](docs/media/images/interface-alerts-notifications.png) | When a failure is detected an alert modal appears showing a snapshot of the failure and buttons to dismiss the alert or suspendpause/cancel the print job. If the alert is not addressed within the customisable countdown time, the printer will automatically be suspended, cancelled or resumed based on user settings. |
  | | |