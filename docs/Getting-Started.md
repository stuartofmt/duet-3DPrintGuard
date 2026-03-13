
## Table of Contents
- [Features](#features)
- [Installation](#installation)
- [Configuration](#configuration)
- [Logging](#logging)
- [Camera Setup](#camera-setup)
- [Monitoring](#monitoring)
- [Notifications](#notifications)


## Installation
duetPrintGuard is packaged as a DWC plugin and installed in the normal manner from the zip file.

## Configuration

## Logging

## Camera Setup

 | ![PrintGuard Camera Settings](docs/media/images/Setting1.png) | The camera settings page is accessible via http://localhost:<PORT>/settings
  
  It allows you to configure the action to be taken on failure [Dismiss, Pause, Cancel] as well as camera settings, including camera brightness and contrast, detection thresholds, etc

## Monitoring

 | ![Status Page](docs/media/images/interface-index.png) | The main interface of PrintGuard. All cameras are shown as a list. Details for each camera are:
 -- The Camera nickname
 -- Current detection status [Detecting, Inactive]
 -- Current print state [Success, Failure] (If Detecting)
 -- The time detection was last Active
 -- The action associated with the camera if a failure exceeds the failure threshold
 -- A thumbnail image of the cameras view
 -- A button to toggle between Detecting and Inactive
 
 If a failure exceeds the threshold - a popup will appear which allows the user to manually override the specified action.  If there is no manual override within the configured countdown time -- the specified action will be taken automatically. |
 

  | ![PrintGuard Setup Settings](docs/media/images/interface-setup-settings.png) | 


  | ![PrintGuard Monitoring](docs/media/images/Plugin1.png) |
  Displays in DWC or separately in a browser http://localhost:<PORT>/duetindex
  
  When a failure is detected an alert modal appears showing a snapshot of the failure and buttons to dismiss the alert or pause or cancel the print job. If the alert is not addressed within the customisable countdown time, the printer will automatically be dismissed, paused or cancelled based on user settings. |

  ## Notifications
  | | |