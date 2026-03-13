
<img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Plugin1.png" style="width:50%; height:auto;">


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

During installation of the plugin, a template configuration file `duetPrintGuard.config.example` is placed in the `system/duetPrintGuard directory`.

The example should be copied or renamed to `duetPrintGuard.config` and configured to your system / needs.  The two main settings are:

In the [DUET] section:
-- IP ==> the IP address of the printer

In the [UI] section:
-- PORT ==> the port number for UI elements to access the settings and monitoring pages

```
# Configuration parameters for duetPrintGuard
# Optional parameters can be commented out with ;
# In which case, defaults will be used as appropriate
# parameter values should not be quoted

[DUET]
# These settings are for the actual printer
# They are the same as would be used for DWC

# IP address of duet printer
# Mandatory e.g. IP = 192.168.1.2
IP =

# PORT address of duet printer
# Optional - only use if the DWC port has been changed in /opt/dsf/conf/http.json
# Note this is NOT the UI port of the settings or monitoring pages (See [UI] section)
# Default is 80
;PORT =

# Password for duet
# Optional - only use if password has been set in DWC configuration
;PASSWORD = 

[UI]
# Settings for UI components
# PORT cannot conflict with other DWC or other apps / plugins
# Mandatory e.g. PORT = 8001
PORT =

[LOGGING]
# Sets the logging detail
# Valid entries [WARNING,INFO,DEBUG]
# Optional
#Default is INFO
;LEVEL = DEBUG

[ACTION]
# Duet3D commands to be executed when a failure occurs
# All parameters in this section are optional

# PAUSE specifies the pause action
# Optional
# Default - sends M25 to the printer
;PAUSE = 


# CANCEL specifies the cancel action
# Optional
# Default - sends M2 to the printer
;CANCEL = 

 
[MACRO]
# Optional Macro to be called on failure
# This is to facilitate a custom macro eg using MQTT
# tO ACTIVATE 
# Enter string in M98 P"<string>"
# Mandatory if MACRO to be called  e.g. 0:/macros/Notify.g
;MACRO =


[NTFY]
# Optional NTFY service to be called on failure
# To activate requires TOPIC key

# The topic in ntfy that you subscribe to
# Mandatory if NTFY is to be used
;TOPIC =

# The title of the message
# Optional
# Default is system message
;TITLE

# The message to be sent to the ntfy topic
# Optional
# Default is system message if topic is  set
;MESSAGE


[PUSHOVER]
# Optional PUSHOVER service to be called on failure
# To activate requires both API and USER keys

# Application / API token
# Mandatory if PUSHOVER is to be used
;API =

# User / Group Key for PUSHOVER
# Mandatory if PUSHOVER is to be used
;USER = 

# The title of the PUSHOVER message
# Optional
# Default is system message
;TITLE =

# The message to be sent to PUSHOVER
# Optional
# Default is system message if topic is  set
;MESSAGE = 

```

## Logging

When the plugin is run, a log file `duetPrintGuard.log`  is placed in the `system/duetPrintGuard directory`.

## Camera Setup

The camera settings page is accessible via `http://localhost:<PORT>/settings` or `http://<IP>:<PORT>/settings`

Where IP is set in the [DUET] section of the configuration file and PORT is set in the [UI] section

This page allows you to configure the action to be taken on failure, camera settings, and detection settings.

<img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Setting1.png" style="width:50%; height:auto;">
  
### Adding Cameras

Multiple cameras can be configure, either serial (USB) or newtwork based.

This image shows the serial configuration UI.  The `Serial Device` box provides a dropdown of POSSIBLE serial cameras on your system. Most will not have a camera attached - so some trial and error is needed to find those that work.  The `Show Camera Preview` checkbox can be helful in this.

<img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Setting2.png" style="width:50%; height:auto;">

This image shows the network camera UI.  Both HTTP and RTSP are supported.

<img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Setting3.png" style="width:50%; height:auto;">


### Countdown Action

`Countdown Action` allows the selection of one of three actions that will occur when a failure is detected.  These are Dismiss, Pause and Cancel. If here is no manual override within the time set in `Countdown Time` then the selected action will be requested of the printer.

### Countdown Time

Specifies the maximum time from the occurrence of a failure (see detection setting below) before which the user can override the `Countdown Action` (using the UI --see Failure section below)

### Detection Setings

A failure is raised when the camera detects a series of anomolies that satisfy this rule:

More than "n" `Majority Vote Threshhold` anomolies during a window of "y" consecutive frames `Majority Vote Window`.

Optimal values for these settings depend on many factors such as the rate at which frames are recieved, the type and position of the camera, lighting conditions etc.

<img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Setting4.png" style="width:50%; height:auto;">

## Monitoring

The monitoring page is accessible via `http://localhost:<PORT>/duetindex` or `http://<IP>:<PORT>/duetindex`  This is the page displayed in DWC

Where IP and PORT are set in the [DUET] section of the configuration file.

### No Failure

This image shows the main UI of duetPrintGuard on restart of the plugin.  Each configured camera is shown separately. Details for each camera are:
 -- The Camera nickname
 -- Current detection status [Detecting, Inactive]
 -- Current print state [Success, Failure] (If Detecting)
 -- The time detection was last Active
 -- The action associated with the camera if a failure exceeds the failure threshold
 -- A thumbnail image of the cameras view
 -- A button to toggle Detecting on and off

 <img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Plugin1.png" style="width:50%; height:auto;">

 Once a camera is Detecting the `Last Active` field is updated regularly

 <img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Plugin2.png" style="width:50%; height:auto;">
 
### Failure

 If a failure occurs - a popup will appear which allows the user to manually override the configured `Countdown Action`.  If the user does nothing within the configured `Countdown time` -- the `Countdown Action` will be sent to the printer (Dismiss does nothing).

<img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Plugin3.png" style="width:50%; height:auto;">

If more then one camera detects a failure them multiple failure popups will be generated.

<img src="https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/media/images/Plugin4.png" style="width:50%; height:auto;">

  