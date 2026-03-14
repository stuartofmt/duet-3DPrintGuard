# duetPrintGuard DWC Plugin

**This is a reconstructed version of the original authored by @oliverbravery**

duetPrintGuard offers local, **real-time print failure detection** for 3D printing on edge devices **(e.g. Rapberry Pi)** .   It is self contained and does not require external connections or subscriptions.

 When the **computer vision** fault detection model detects an issue it will  **automatically pause or cancel the print job**.


The detection engine and related functions (from the original) have not been changed.  The author claims superior performance to other solutions.

UI and control elements have been tailored to the DWC plugin context. 

Additional configuration, accesable inside DWC, is provided by a configuration file that facilitaes:
-- IP and port setting
-- loggin
-- configurable printer actions when a failure occurs
-- several notofcation type ( Duet Macro, NTFY, Pusher)


**Instructions for installation and configuration are here:**
https://github.com/stuartofmt/duetPrintGuard/blob/main/docs/Getting-Started.md




> _The origial project can be found here [here](https://github.com/oliverbravery/PrintGuard)._
